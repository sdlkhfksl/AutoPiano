import type { RecordedNoteEvent, SequenceEvent } from '../types'

function renderNote(event: SequenceEvent | RecordedNoteEvent): string {
  const [step, accidental, octave] = event.note.match(/^([A-G])([#b]?)(-?\d+)$/) || []
  if (!step || !octave) {
    return `<note><rest/><duration>${Math.round(event.durationMs)}</duration></note>`
  }
  const alter = accidental === '#' ? '<alter>1</alter>' : accidental === 'b' ? '<alter>-1</alter>' : ''
  return `
    <note>
      <pitch>
        <step>${step}</step>
        ${alter}
        <octave>${octave}</octave>
      </pitch>
      <duration>${Math.round(event.durationMs)}</duration>
    </note>
  `
}

export function serializeEventsToMusicXml(
  events: Array<SequenceEvent | RecordedNoteEvent>,
  tempo = 90
): string {
  const measure = events
    .map((event) => renderNote(event))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
  <score-partwise version="3.1">
    <part-list>
      <score-part id="P1">
        <part-name>AutoPiano Export</part-name>
      </score-part>
    </part-list>
    <part id="P1">
      <measure number="1">
        <attributes>
          <divisions>480</divisions>
          <tempo>${tempo}</tempo>
        </attributes>
        ${measure}
      </measure>
    </part>
  </score-partwise>`
}
