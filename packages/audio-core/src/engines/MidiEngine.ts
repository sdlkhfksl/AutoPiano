import { MidiParser } from '@autopiano/data-core'
import type { ScheduleCallbacks, PlaybackHandle } from '../types'
import { TimelineScheduler } from '../schedulers/TimelineScheduler'
import type { SequenceEvent } from '../types'
import { PianoEngine } from './PianoEngine'

export class MidiEngine {
  private readonly parser = new MidiParser()
  private readonly scheduler = new TimelineScheduler()

  constructor(private readonly piano: PianoEngine = new PianoEngine()) {}

  async play(buffer: ArrayBuffer, callbacks: ScheduleCallbacks = {}): Promise<PlaybackHandle | null> {
    if (typeof window === 'undefined') {
      return null
    }

    const { events, totalDurationMs } = this.parser.parse(buffer)
    if (!events.length) {
      return null
    }

    const cancel = this.scheduler.schedule(events, {
      onEvent: (event: SequenceEvent) => {
        callbacks.onNoteStart?.(event)
        void this.piano.play(event.note, event.durationMs / 1000)
        if (callbacks.onNoteEnd) {
          const timer = window.setTimeout(() => callbacks.onNoteEnd?.(event), event.durationMs)
          this.scheduler.trackTimer(timer)
        }
      },
      onComplete: () => callbacks.onComplete?.(),
      onCancel: () => callbacks.onCancel?.(),
      totalDurationMs
    })

    return {
      stop: () => {
        cancel()
        callbacks.onCancel?.()
      }
    }
  }

  dispose(): void {
    this.scheduler.dispose()
    this.piano.dispose()
  }
}
