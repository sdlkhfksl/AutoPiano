import type { SequenceEvent } from '../types'
import { EventScheduler } from './EventScheduler'

interface TimelineOptions {
  onEvent?: (event: SequenceEvent) => void
  onComplete?: () => void
  onCancel?: () => void
  totalDurationMs?: number
}

export class TimelineScheduler extends EventScheduler {
  private activeCancels: Array<() => void> = []

  schedule(events: SequenceEvent[], options: TimelineOptions): () => void {
    this.cancelActive()

    const cancels: Array<() => void> = []

    events.forEach((event) => {
      const cancel = super.schedule(event.offsetMs, () => {
        options.onEvent?.(event)
      })
      cancels.push(cancel)
    })

    const duration =
      typeof options.totalDurationMs === 'number'
        ? options.totalDurationMs
        : this.computeTotalDuration(events)

    let cancelAllRef: (() => void) | null = null

    if (duration > 0) {
      const completion = super.schedule(duration + 25, () => {
        options.onComplete?.()
        if (cancelAllRef) {
          this.activeCancels = this.activeCancels.filter((item) => item !== cancelAllRef)
        }
      })
      cancels.push(completion)
    }

    const cancelAll = () => {
      cancels.forEach((cancel) => cancel())
      this.activeCancels = this.activeCancels.filter((item) => item !== cancelAll)
      options.onCancel?.()
    }
    cancelAllRef = cancelAll

    this.activeCancels.push(cancelAll)
    return () => {
      cancelAll()
    }
  }

  trackTimer(timer: number): void {
    super.trackTimer(timer)
  }

  dispose(): void {
    this.cancelActive()
    super.dispose()
  }

  private cancelActive(): void {
    if (!this.activeCancels.length) return
    this.activeCancels.splice(0).forEach((cancel) => cancel())
  }

  private computeTotalDuration(events: SequenceEvent[]): number {
    if (!events.length) return 0
    const last = events.reduce((acc, event) => {
      const end = event.offsetMs + event.durationMs
      return Math.max(acc, end)
    }, 0)
    return last
  }
}
