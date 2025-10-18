import { start, Destination } from 'tone'
import { Piano } from '@tonejs/piano'
import type { ToneAudioNode } from 'tone'
import { convertNumberedTrack } from '../utils/NumberedScore'
import { isBrowser } from '../utils/AudioUtils'
import type { NumberedScoreInput, ScheduleCallbacks, PlaybackHandle, SequenceEvent } from '../types'
import { TimelineScheduler } from '../schedulers/TimelineScheduler'

export class PianoEngine {
  private piano: Piano | null = null
  private loadingPromise: Promise<void> | null = null
  private readonly scheduler = new TimelineScheduler()
  private effectChain: ToneAudioNode[] = []

  async play(note: string, durationSeconds = 0.8): Promise<void> {
    if (!note || !isBrowser()) return

    try {
      await start()
    } catch (_) {
      // ignore gesture errors
    }

    await this.ensureInstrument()
    if (!this.piano) return

    const now = this.piano.context.currentTime
    this.piano.keyDown({ note, time: now })
    this.piano.keyUp({ note, time: now + Math.max(durationSeconds, 0.05) })
  }

  scheduleNumberedScore(
    score: NumberedScoreInput,
    callbacks: ScheduleCallbacks = {}
  ): PlaybackHandle | null {
    if (!isBrowser()) {
      return null
    }

    const { events, totalDurationMs } = convertNumberedTrack(score)
    if (!events.length) {
      return null
    }

    const cancel = this.scheduler.schedule(events, {
      onEvent: (event: SequenceEvent) => {
        callbacks.onNoteStart?.(event)
        void this.play(event.note, event.durationMs / 1000)
        if (callbacks.onNoteEnd) {
          const endTimer = window.setTimeout(() => {
            callbacks.onNoteEnd?.(event)
          }, event.durationMs)
          this.scheduler.trackTimer(endTimer)
        }
      },
      onComplete: () => callbacks.onComplete?.(),
      onCancel: () => callbacks.onCancel?.(),
      totalDurationMs
    })

    return {
      stop: cancel
    }
  }

  setEffects(effects: ToneAudioNode[]): void {
    this.effectChain = effects
    this.applyRouting()
  }

  dispose(): void {
    this.scheduler.dispose()
    if (this.piano) {
      this.piano.dispose()
      this.piano = null
    }
    this.loadingPromise = null
    this.effectChain = []
  }

  private applyRouting(): void {
    if (!this.piano) return
    this.piano.disconnect()
    let current: ToneAudioNode = this.piano
    for (const effect of this.effectChain) {
      current.connect(effect)
      current = effect
    }
    current.connect(Destination)
  }

  private async ensureInstrument(): Promise<void> {
    if (!isBrowser()) return
    if (this.piano) return
    if (this.loadingPromise) {
      await this.loadingPromise
      return
    }

    this.loadingPromise = (async () => {
      const piano = new Piano({ velocities: 5 })
      await piano.load()
      this.piano = piano
      this.applyRouting()
    })()

    await this.loadingPromise
  }
}

export function createPianoEngine(): PianoEngine {
  return new PianoEngine()
}
