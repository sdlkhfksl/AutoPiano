import type { RecordedNoteEvent } from '@autopiano/data-core'
import { now } from '../utils/AudioUtils'
import type { RecordingOptions, RecordingResult } from '../types'

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function generateId(size = 12): string {
  let output = ''
  for (let index = 0; index < size; index += 1) {
    const random = Math.floor(Math.random() * ID_ALPHABET.length)
    output += ID_ALPHABET[random]
  }
  return output
}

export class RecordingSystem {
  private active = false
  private startedAt = 0
  private events: RecordedNoteEvent[] = []
  private pendingName: string | undefined

  start(options?: RecordingOptions): void {
    this.active = true
    this.startedAt = now()
    this.events = []
    this.pendingName = options?.name
  }

  capture(note: string, durationMs: number, velocity = 0.85): void {
    if (!this.active) return
    const offsetMs = Math.max(0, now() - this.startedAt)
    this.events.push({
      note,
      offsetMs,
      durationMs,
      velocity
    })
  }

  stop(options?: RecordingOptions): RecordingResult | null {
    if (!this.active) return null
    this.active = false

    const createdAt = Date.now()
    const durationMs = this.events.reduce((max, event) => {
      return Math.max(max, event.offsetMs + event.durationMs)
    }, 0)

    const name = options?.name ?? this.pendingName ?? `录音-${new Date(createdAt).toLocaleTimeString()}`
    const result: RecordingResult = {
      id: generateId(),
      name,
      createdAt,
      durationMs,
      noteCount: this.events.length,
      events: this.events.map((event) => ({ ...event }))
    }

    this.pendingName = undefined
    this.events = []
    return result
  }

  cancel(): void {
    this.active = false
    this.events = []
    this.pendingName = undefined
  }

  isRecording(): boolean {
    return this.active
  }
}
