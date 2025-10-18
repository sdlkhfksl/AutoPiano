import type { ScheduleCallbacks, SequenceEvent } from '../types'
import { TimelineScheduler } from './TimelineScheduler'

export interface AdvancedScheduleOptions {
  events: SequenceEvent[]
  tempo: number
  callbacks?: ScheduleCallbacks
}

export class AdvancedScheduler {
  private readonly scheduler = new TimelineScheduler()
  private activeCancel: (() => void) | null = null
  private baseEvents: SequenceEvent[] = []
  private baseTempo = 0
  private currentTempo = 0
  private callbacks: ScheduleCallbacks | undefined
  private rescheduling = false

  schedule(options: AdvancedScheduleOptions): void {
    this.stop()
    this.baseEvents = options.events.map((event) => ({ ...event }))
    this.baseTempo = options.tempo
    this.currentTempo = options.tempo
    this.callbacks = options.callbacks

    this.activeCancel = this.scheduler.schedule(this.scaleEvents(this.currentTempo), {
      onEvent: (event) => this.handleEvent(event),
      onComplete: () => this.callbacks?.onComplete?.(),
      onCancel: () => {
        if (!this.rescheduling) {
          this.callbacks?.onCancel?.()
        }
      }
    })
  }

  updateTempo(nextTempo: number): void {
    if (!this.baseEvents.length || nextTempo <= 0) {
      return
    }

    if (Math.abs(nextTempo - this.currentTempo) < 0.001) {
      return
    }

    this.rescheduling = true
    this.activeCancel?.()
    this.rescheduling = false

    this.currentTempo = nextTempo
    this.activeCancel = this.scheduler.schedule(this.scaleEvents(this.currentTempo), {
      onEvent: (event) => this.handleEvent(event),
      onComplete: () => this.callbacks?.onComplete?.(),
      onCancel: () => {
        if (!this.rescheduling) {
          this.callbacks?.onCancel?.()
        }
      }
    })
  }

  stop(): void {
    this.activeCancel?.()
    this.activeCancel = null
  }

  dispose(): void {
    this.stop()
    this.scheduler.dispose()
  }

  private scaleEvents(targetTempo: number): SequenceEvent[] {
    const scale = this.baseTempo > 0 ? this.baseTempo / targetTempo : 1
    return this.baseEvents.map((event) => ({
      ...event,
      offsetMs: Math.round(event.offsetMs * scale),
      durationMs: Math.max(30, Math.round(event.durationMs * scale))
    }))
  }

  private handleEvent(event: SequenceEvent): void {
    this.callbacks?.onNoteStart?.(event)
    if (this.callbacks?.onNoteEnd && typeof window !== 'undefined') {
      const timer = window.setTimeout(() => this.callbacks?.onNoteEnd?.(event), event.durationMs)
      this.scheduler.trackTimer(timer)
    }
  }
}
