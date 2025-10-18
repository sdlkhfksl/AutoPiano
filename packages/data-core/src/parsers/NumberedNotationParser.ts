import type {
  NotationParseResult,
  NumberedScoreInput,
  SequenceEvent,
  StepName
} from '../types'
import { sanitizeSymbol, tokenToNoteName } from '../utils/note'

const NOTE_PATTERN = /([#b]*[0-7][<>]*)/
const DURATION_PATTERN = /\(([0-9.]+)\)/

export class NumberedNotationParser {
  parse(input: NumberedScoreInput): NotationParseResult {
    const { step, track, speed } = input
    return this.parseTrack(step, speed, track)
  }

  parseText(step: StepName, speed: number, text: string): NotationParseResult {
    const tokens = text
      .split(/[,\s]+/)
      .map((token) => sanitizeSymbol(token))
      .filter(Boolean)
    return this.parseTrack(step, speed, tokens)
  }

  private parseTrack(step: StepName, speed: number, track: string[]): NotationParseResult {
    const sanitizedSpeed = Number.isFinite(speed) ? speed : Number(speed)
    const bpm = sanitizedSpeed > 0 ? sanitizedSpeed : 75
    const timeUnit = (60 * 1000) / bpm

    const events: SequenceEvent[] = []
    let cursor = 0

    for (const raw of track) {
      const symbol = sanitizeSymbol(raw)
      if (!symbol) {
        continue
      }

      const noteToken = symbol.match(NOTE_PATTERN)?.[0] ?? ''
      const durationMatch = symbol.match(DURATION_PATTERN)
      const durationFactor = durationMatch ? Number(durationMatch[1]) : 1
      const durationMs = timeUnit * (Number.isFinite(durationFactor) ? durationFactor : 1)
      const note = tokenToNoteName(step, noteToken)

      if (note) {
        events.push({
          note,
          offsetMs: cursor,
          durationMs,
          symbol: symbol || noteToken
        })
      }

      cursor += durationMs
    }

    return {
      events,
      totalDurationMs: cursor
    }
  }
}
