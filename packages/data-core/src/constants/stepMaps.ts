import type { StepName } from '../types'

export const STEP_ROOT_MIDI: Record<StepName, number> = {
  C: 60,
  D: 62,
  E: 64,
  F: 65,
  G: 67,
  A: 69,
  B: 71
}

export const DEGREE_TO_OFFSET: Record<string, number> = {
  '1': 0,
  '2': 2,
  '3': 4,
  '4': 5,
  '5': 7,
  '6': 9,
  '7': 11
}

export const NOTE_NAME_TABLE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function clampStep(step: string): StepName {
  if (step in STEP_ROOT_MIDI) {
    return step as StepName
  }
  return 'C'
}
