import { Midi } from '@tonejs/midi'
import type { RecordedNoteEvent, SequenceEvent } from '../types'
import { noteNameToMidi } from '../utils/note'

export interface MidiExportOptions {
  tempo?: number
}

export function serializeEventsToMidi(
  events: Array<SequenceEvent | RecordedNoteEvent>,
  options: MidiExportOptions = {}
): Uint8Array {
  const midi = new Midi()
  midi.header.setTempo(options.tempo ?? 90)
  const track = midi.addTrack()

  events.forEach((event) => {
    const midiNumber = noteNameToMidi(event.note)
    if (midiNumber == null) {
      return
    }
    const time = (event.offsetMs ?? 0) / 1000
    const duration = Math.max(event.durationMs ?? 0, 50) / 1000
    const velocity = typeof event.velocity === 'number' ? event.velocity : 0.85
    track.addNote({
      midi: midiNumber,
      time,
      duration,
      velocity
    })
  })

  return midi.toArray()
}
