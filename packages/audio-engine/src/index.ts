import { start } from 'tone'
import { Piano } from '@tonejs/piano'

const STEP_MAP = {
  C: {
    '1>>': 'C2',
    '2>>': 'D2',
    '3>>': 'E2',
    '4>>': 'F2',
    '5>>': 'G2',
    '6>>': 'A2',
    '7>>': 'B2',
    '1>': 'C3',
    '2>': 'D3',
    '3>': 'E3',
    '4>': 'F3',
    '5>': 'G3',
    '6>': 'A3',
    '7>': 'B3',
    '1': 'C4',
    '2': 'D4',
    '3': 'E4',
    '4': 'F4',
    '5': 'G4',
    '6': 'A4',
    '7': 'B4',
    '1<': 'C5',
    '2<': 'D5',
    '3<': 'E5',
    '4<': 'F5',
    '5<': 'G5',
    '6<': 'A5',
    '7<': 'B5',
    '1<<': 'C6',
    '2<<': 'D6',
    '3<<': 'E6',
    '4<<': 'F6',
    '5<<': 'G6',
    '6<<': 'A6',
    '7<<': 'B6'
  },
  D: {
    '1>>': 'D2',
    '2>>': 'E2',
    '3>>': 'F#2',
    '4>>': 'G2',
    '5>>': 'A2',
    '6>>': 'B2',
    '7>>': 'C#3',
    '1>': 'D3',
    '2>': 'E3',
    '3>': 'F#3',
    '4>': 'G3',
    '5>': 'A3',
    '6>': 'B3',
    '7>': 'C#4',
    '1': 'D4',
    '2': 'E4',
    '3': 'F#4',
    '4': 'G4',
    '5': 'A4',
    '6': 'B4',
    '7': 'C#5',
    '1<': 'D5',
    '2<': 'E5',
    '3<': 'F#5',
    '4<': 'G5',
    '5<': 'A5',
    '6<': 'B5',
    '7<': 'C#6',
    '1<<': 'D6',
    '2<<': 'E6',
    '3<<': 'F#6',
    '4<<': 'G6',
    '5<<': 'A6',
    '6<<': 'B6',
    '7<<': 'C#7'
  }
} as const

export type StepName = keyof typeof STEP_MAP

export interface NumberedScoreInput {
  step: StepName
  track: string[]
  speed: number
}

export interface SequenceEvent {
  note: string
  offsetMs: number
  durationMs: number
  symbol: string
}

export interface ScheduleCallbacks {
  onNoteStart?: (event: SequenceEvent) => void
  onNoteEnd?: (event: SequenceEvent) => void
  onComplete?: () => void
  onCancel?: () => void
}

const NOTE_PATTERN = /[#b]*[0-7][<>]*/
const DURATION_PATTERN = /\(([0-9.]+)\)/

export class PianoEngine {
  private piano: Piano | null = null
  private loadingPromise: Promise<void> | null = null

  async play(note: string, durationSeconds = 0.8): Promise<void> {
    if (!note) return
    if (!isBrowser()) return

    try {
      await start()
    } catch (_) {
      // ignore start failures (e.g. not triggered by gesture)
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
  ): () => void {
    if (!isBrowser()) {
      return () => {}
    }

    const { events, totalDurationMs } = convertNumberedTrack(score)
    const timers: number[] = []

    events.forEach((event) => {
      const timer = window.setTimeout(() => {
        callbacks.onNoteStart?.(event)
        void this.play(event.note, event.durationMs / 1000)
        if (callbacks.onNoteEnd) {
          const endTimer = window.setTimeout(() => {
            callbacks.onNoteEnd?.(event)
          }, event.durationMs)
          timers.push(endTimer)
        }
      }, event.offsetMs)
      timers.push(timer)
    })

    if (callbacks.onComplete) {
      const completionTimer = window.setTimeout(() => {
        callbacks.onComplete?.()
      }, totalDurationMs + 50)
      timers.push(completionTimer)
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      callbacks.onCancel?.()
    }
  }

  dispose(): void {
    if (this.piano) {
      this.piano.dispose()
      this.piano = null
    }
    this.loadingPromise = null
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
      piano.toDestination()
      await piano.load()
      this.piano = piano
    })()

    await this.loadingPromise
  }
}

export function createPianoEngine(): PianoEngine {
  return new PianoEngine()
}

export function convertNumberedTrack(
  score: NumberedScoreInput
): { events: SequenceEvent[]; totalDurationMs: number } {
  const { step, track, speed } = score
  const stepMap = STEP_MAP[step]
  if (!stepMap) {
    throw new Error(`Unsupported step: ${step}`)
  }

  const sanitizedSpeed = Number.isFinite(speed) ? speed : Number(speed)
  const bpm = sanitizedSpeed > 0 ? sanitizedSpeed : 75
  const timeUnit = (60 * 1000) / bpm

  const events: SequenceEvent[] = []
  let cursor = 0

  for (const rawSymbol of track) {
    const symbol = rawSymbol?.replace(/\s+/g, '').replace(/\.+$/, '') ?? ''
    if (!symbol) {
      continue
    }

    const durationMatch = symbol.match(DURATION_PATTERN)
    const durationFactor = durationMatch ? Number(durationMatch[1]) : 1
    const durationMs = timeUnit * (Number.isFinite(durationFactor) ? durationFactor : 1)
    const noteToken = symbol.match(NOTE_PATTERN)?.[0] ?? ''
    const note = stepMap[noteToken]

    if (note) {
      events.push({
        note,
        offsetMs: cursor,
        durationMs,
        symbol
      })
    }

    cursor += durationMs
  }

  return { events, totalDurationMs: cursor }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}
