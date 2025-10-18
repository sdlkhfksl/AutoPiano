import type {
  EffectDescriptor,
  EffectPreset,
  RecordingResult,
  ScheduleCallbacks,
  SequenceEvent
} from '@autopiano/audio-core'

export type {
  EffectDescriptor,
  EffectPreset,
  RecordingResult,
  ScheduleCallbacks,
  SequenceEvent
}

export interface RecordingPayload {
  name?: string
}

export interface AudioWorkspaceEvents {
  'recording:start': void
  'recording:created': RecordingResult
  'recording:stop': void
  'effects:change': EffectDescriptor[]
}
