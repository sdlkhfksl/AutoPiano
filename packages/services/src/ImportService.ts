import { MidiParser } from '@autopiano/data-core'
import type { RecordingResult, SequenceEvent } from './types'

export class ImportService {
  parseRecording(json: string): RecordingResult | null {
    try {
      const parsed = JSON.parse(json)
      if (!parsed || typeof parsed !== 'object') return null
      if (!Array.isArray(parsed.events)) return null
      return parsed as RecordingResult
    } catch (_) {
      return null
    }
  }

  async parseMidi(buffer: ArrayBuffer): Promise<SequenceEvent[]> {
    const parser = new MidiParser()
    const { events } = parser.parse(buffer)
    return events
  }
}
