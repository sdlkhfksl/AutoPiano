import { serializeEventsToMidi, serializeEventsToMusicXml } from '@autopiano/data-core'
import type { RecordingResult } from './types'

export class ExportService {
  toJson(recording: RecordingResult): string {
    return JSON.stringify(recording, null, 2)
  }

  toMidi(recording: RecordingResult): Uint8Array {
    return serializeEventsToMidi(recording.events)
  }

  toMusicXml(recording: RecordingResult, tempo = 90): string {
    return serializeEventsToMusicXml(recording.events, tempo)
  }
}
