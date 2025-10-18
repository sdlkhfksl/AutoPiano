import mitt from 'mitt'
import type { Emitter } from 'mitt'
import type { ScoreModel, NumberedScoreInput } from '@autopiano/data-core'
import {
  AdvancedScheduler,
  createPianoEngine,
  convertNumberedTrack,
  RecordingSystem,
  TimelineScheduler,
  createDefaultEffectDescriptors,
  createDefaultEffectPresets,
  ReverbProcessor,
  CompressorProcessor,
  EqualizerProcessor
} from '@autopiano/audio-core'
import type {
  AudioWorkspaceEvents,
  EffectDescriptor,
  EffectPreset,
  RecordingPayload,
  RecordingResult,
  ScheduleCallbacks,
  SequenceEvent
} from './types'

interface PlaybackContext {
  scheduler: AdvancedScheduler
  callbacks: ScheduleCallbacks | undefined
}

export class AudioService {
  private readonly piano = createPianoEngine()
  private readonly emitter: Emitter<AudioWorkspaceEvents>
  private readonly recordingSystem = new RecordingSystem()
  private readonly recordings: RecordingResult[] = []
  private activePlaybacks: PlaybackContext[] = []
  private readonly recordingPlaybackScheduler = new TimelineScheduler()

  private readonly effectDescriptors: EffectDescriptor[] = createDefaultEffectDescriptors()
  private readonly effectPresets: EffectPreset[] = createDefaultEffectPresets()
  private readonly reverbProcessor = new ReverbProcessor()
  private readonly compressorProcessor = new CompressorProcessor()
  private readonly equalizerProcessor = new EqualizerProcessor()

  constructor() {
    this.emitter = mitt<AudioWorkspaceEvents>()
  }

  async playNote(note: string, durationSeconds = 0.8): Promise<void> {
    await this.piano.play(note, durationSeconds)
  }

  playNumberedScore(
    inputs: NumberedScoreInput[],
    callbacks?: ScheduleCallbacks
  ): void {
    this.stopPlayback()

    if (!inputs.length) return

    let running = inputs.length
    let canceled = false

    inputs.forEach((input) => {
      const scheduler = new AdvancedScheduler()
      const { events } = convertNumberedTrack(input)
      if (!events.length) {
        running -= 1
        return
      }

      const removeContext = () => {
        this.activePlaybacks = this.activePlaybacks.filter((ctx) => ctx.scheduler !== scheduler)
      }

      scheduler.schedule({
        events,
        tempo: input.speed,
        callbacks: {
          onNoteStart: (event) => {
            callbacks?.onNoteStart?.(event)
            void this.playNote(event.note, event.durationMs / 1000)
          },
          onNoteEnd: (event) => callbacks?.onNoteEnd?.(event),
          onComplete: () => {
            running -= 1
            removeContext()
            if (running <= 0 && !canceled) {
              callbacks?.onComplete?.()
            }
          },
          onCancel: () => {
            removeContext()
            if (!canceled) {
              canceled = true
              callbacks?.onCancel?.()
            }
          }
        }
      })
      this.activePlaybacks.push({ scheduler, callbacks })
    })
  }

  playScoreModel(score: ScoreModel, callbacks?: ScheduleCallbacks): void {
    const inputs = score.toNumberedInputs()
    this.playNumberedScore(inputs, callbacks)
  }

  stopPlayback(): void {
    this.activePlaybacks.forEach(({ scheduler }) => scheduler.stop())
    this.activePlaybacks.forEach(({ scheduler }) => scheduler.dispose())
    this.activePlaybacks = []
  }

  startRecording(payload?: RecordingPayload): void {
    if (this.recordingSystem.isRecording()) return
    this.recordingSystem.start({ name: payload?.name })
    this.emitter.emit('recording:start', undefined)
  }

  captureLiveNote(note: string, durationMs: number, velocity = 0.85): void {
    this.recordingSystem.capture(note, durationMs, velocity)
  }

  stopRecording(payload?: RecordingPayload): RecordingResult | null {
    const result = this.recordingSystem.stop({ name: payload?.name })
    if (result) {
      this.recordings.unshift(result)
      this.emitter.emit('recording:created', result)
      this.emitter.emit('recording:stop', undefined)
    }
    return result
  }

  cancelRecording(): void {
    this.recordingSystem.cancel()
  }

  isRecording(): boolean {
    return this.recordingSystem.isRecording()
  }

  getRecordings(): RecordingResult[] {
    return [...this.recordings]
  }

  hydrateRecordings(recordings: RecordingResult[]): void {
    this.recordings.splice(0, this.recordings.length, ...recordings)
  }

  playRecording(recording: RecordingResult, callbacks?: ScheduleCallbacks): void {
    this.recordingPlaybackScheduler.dispose()
    this.recordingPlaybackScheduler.schedule(recording.events, {
      onEvent: (event: SequenceEvent) => {
        callbacks?.onNoteStart?.(event)
        void this.playNote(event.note, event.durationMs / 1000)
      },
      onComplete: () => callbacks?.onComplete?.(),
      onCancel: () => callbacks?.onCancel?.()
    })
  }

  on<Event extends keyof AudioWorkspaceEvents>(event: Event, handler: (payload: AudioWorkspaceEvents[Event]) => void): void {
    this.emitter.on(event, handler)
  }

  off<Event extends keyof AudioWorkspaceEvents>(event: Event, handler: (payload: AudioWorkspaceEvents[Event]) => void): void {
    this.emitter.off(event, handler)
  }

  getEffects(): EffectDescriptor[] {
    return this.effectDescriptors.map((descriptor) => ({ ...descriptor }))
  }

  getPresets(): EffectPreset[] {
    return this.effectPresets.map((preset) => ({ ...preset }))
  }

  toggleEffect(id: string, force?: boolean): void {
    const descriptor = this.effectDescriptors.find((item) => item.id === id)
    if (!descriptor) {
      return
    }
    const next = typeof force === 'boolean' ? force : !descriptor.active
    descriptor.active = next
    this.syncEffects()
  }

  applyPreset(id: string): void {
    const preset = this.effectPresets.find((item) => item.id === id)
    if (!preset) return
    Object.entries(preset.applies).forEach(([key, value]) => {
      this.toggleEffect(key, Boolean(value))
    })
  }

  dispose(): void {
    this.stopPlayback()
    this.piano.dispose()
    this.reverbProcessor.dispose()
    this.compressorProcessor.dispose()
    this.equalizerProcessor.dispose()
  }

  private syncEffects(): void {
    const nodes = this.effectDescriptors
      .filter((descriptor) => descriptor.active)
      .sort((a, b) => a.order - b.order)
      .map((descriptor) => this.resolveEffectNode(descriptor.id))
      .filter((node): node is NonNullable<typeof node> => Boolean(node))

    this.piano.setEffects(nodes)
    this.emitter.emit('effects:change', this.getEffects())
  }

  private resolveEffectNode(id: string) {
    switch (id) {
      case 'reverb':
        return this.reverbProcessor.node
      case 'compressor':
        return this.compressorProcessor.node
      case 'equalizer':
        return this.equalizerProcessor.node
      default:
        return undefined
    }
  }
}
