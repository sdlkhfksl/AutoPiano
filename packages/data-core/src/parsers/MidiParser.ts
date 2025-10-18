import { Midi } from '@tonejs/midi'
import type { NotationParseResult, SequenceEvent } from '../types'
import { midiToNoteName } from '../utils/note'

export class MidiParser {
  parse(buffer: ArrayBuffer): NotationParseResult {
    const midi = new Midi(buffer)
    const events: SequenceEvent[] = []
    let totalDurationMs = 0

    midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        const noteName = note.name || midiToNoteName(note.midi)
        const offsetMs = note.time * 1000
        const durationMs = note.duration * 1000
        totalDurationMs = Math.max(totalDurationMs, offsetMs + durationMs)
        events.push({
          note: noteName,
          offsetMs,
          durationMs,
          symbol: noteName,
          velocity: note.velocity
        })
      })
    })

    events.sort((a, b) => a.offsetMs - b.offsetMs)

    return {
      events,
      totalDurationMs
    }
  }
}
