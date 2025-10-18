export type StepName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

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
  velocity?: number
}

export interface RecordedNoteEvent {
  note: string
  offsetMs: number
  durationMs: number
  velocity?: number
}

export interface ScoreMetadata {
  id: string
  name: string
  step: StepName
  speed: number
  degree?: number
  mainTrack: string[]
  backingTrack?: string[]
  tags?: string[]
  description?: string
}

export interface TrackMetadata {
  id: string
  name: string
  step: StepName
  speed: number
  notes: string[]
}

export interface NotationParseResult {
  events: SequenceEvent[]
  totalDurationMs: number
}

export interface ScoreValidationIssue {
  type: 'error' | 'warning'
  message: string
  index?: number
}

export interface RecordingSummary {
  id: string
  name: string
  createdAt: number
  durationMs: number
  noteCount: number
  events: RecordedNoteEvent[]
}
