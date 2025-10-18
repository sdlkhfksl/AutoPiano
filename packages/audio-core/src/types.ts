import type {
  NumberedScoreInput,
  RecordedNoteEvent,
  SequenceEvent,
  StepName
} from '@autopiano/data-core'

export type { NumberedScoreInput, RecordedNoteEvent, SequenceEvent, StepName }

export interface ScheduleCallbacks {
  onNoteStart?: (event: SequenceEvent) => void
  onNoteEnd?: (event: SequenceEvent) => void
  onComplete?: () => void
  onCancel?: () => void
}

export interface PlaybackHandle {
  stop: () => void
}

export interface EffectDescriptor {
  id: string
  label: string
  description?: string
  active: boolean
  order: number
}

export interface EffectPreset {
  id: string
  name: string
  description?: string
  applies: Record<string, boolean>
}

export interface RecordingOptions {
  name?: string
}

export interface RecordingResult {
  id: string
  name: string
  createdAt: number
  durationMs: number
  noteCount: number
  events: RecordedNoteEvent[]
}
