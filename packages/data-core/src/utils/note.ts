import { DEGREE_TO_OFFSET, NOTE_NAME_TABLE, STEP_ROOT_MIDI } from '../constants/stepMaps'
import type { StepName } from '../types'

const TOKEN_REGEX = /^([#b]*)([0-7])([<>]*)$/

export interface ParsedNumberedToken {
  degree: string
  accidental: number
  octaveShift: number
}

export function sanitizeSymbol(symbol: string): string {
  return symbol.replace(/\s+/g, '').replace(/\.+$/, '')
}

export function parseNumberedToken(symbol: string): ParsedNumberedToken | null {
  const cleaned = sanitizeSymbol(symbol)
  const match = cleaned.match(TOKEN_REGEX)
  if (!match) return null
  const [, accidentalRaw, degree, octaveRaw] = match
  let accidental = 0
  if (accidentalRaw) {
    for (const char of accidentalRaw) {
      if (char === '#') accidental += 1
      if (char.toLowerCase() === 'b') accidental -= 1
    }
  }
  let octaveShift = 0
  if (octaveRaw) {
    for (const char of octaveRaw) {
      if (char === '<') octaveShift += 1
      if (char === '>') octaveShift -= 1
    }
  }
  return {
    degree,
    accidental,
    octaveShift
  }
}

export function tokenToMidi(step: StepName, symbol: string): number | null {
  const parsed = parseNumberedToken(symbol)
  if (!parsed) return null
  const { degree, accidental, octaveShift } = parsed
  if (degree === '0') {
    return null
  }
  const baseMidi = STEP_ROOT_MIDI[step]
  const degreeOffset = DEGREE_TO_OFFSET[degree]
  if (typeof degreeOffset !== 'number') {
    return null
  }
  const octaveOffset = octaveShift * 12
  return baseMidi + degreeOffset + accidental + octaveOffset
}

export function midiToNoteName(midi: number): string {
  const index = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAME_TABLE[index]}${octave}`
}

export function tokenToNoteName(step: StepName, symbol: string): string | undefined {
  const midi = tokenToMidi(step, symbol)
  if (midi == null) return undefined
  return midiToNoteName(midi)
}

export function noteNameToMidi(noteName: string): number | null {
  const match = noteName.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/)
  if (!match) return null
  const [, stepRaw, accidentalRaw, octaveRaw] = match
  const step = stepRaw.toUpperCase()
  const accidental = accidentalRaw === '#' ? 1 : accidentalRaw?.toLowerCase() === 'b' ? -1 : 0
  const octave = Number(octaveRaw)

  const BASE_OFFSETS: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
  }

  const baseOffset = BASE_OFFSETS[step]
  if (typeof baseOffset !== 'number') return null

  const midi = (octave + 1) * 12 + baseOffset + accidental
  return midi
}
