import type { NotationParseResult, SequenceEvent } from '../types'

const NOTE_BLOCK_REGEX = /<note[\s\S]*?<\/note>/g

function extractTagValue(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match ? match[1].trim() : null
}

function hasRest(block: string): boolean {
  return /<rest\b/.test(block)
}

function buildNoteName(step: string | null, alter: string | null, octave: string | null): string | undefined {
  if (!step || !octave) return undefined
  const accidental = alter ? (Number(alter) > 0 ? '#' : 'b') : ''
  return `${step}${accidental}${octave}`
}

export class MusicXmlParser {
  parse(xml: string, tempo = 90): NotationParseResult {
    const events: SequenceEvent[] = []
    const divisionsMatch = xml.match(/<divisions>(\d+)<\/divisions>/)
    const divisions = divisionsMatch ? Number(divisionsMatch[1]) || 1 : 1
    const beatDurationMs = (60 * 1000) / (tempo > 0 ? tempo : 90)
    const divisionDurationMs = beatDurationMs / divisions

    let cursor = 0

    const noteBlocks = xml.match(NOTE_BLOCK_REGEX) ?? []
    for (const block of noteBlocks) {
      const durationValueRaw = extractTagValue(block, 'duration')
      const durationValue = durationValueRaw ? Number(durationValueRaw) : 1
      const durationMs = divisionDurationMs * (Number.isFinite(durationValue) ? durationValue : 1)

      if (!hasRest(block)) {
        const step = extractTagValue(block, 'step')
        const alter = extractTagValue(block, 'alter')
        const octave = extractTagValue(block, 'octave')
        const noteName = buildNoteName(step, alter, octave)
        if (noteName) {
          events.push({
            note: noteName,
            offsetMs: cursor,
            durationMs,
            symbol: noteName
          })
        }
      }

      cursor += durationMs
    }

    return {
      events,
      totalDurationMs: cursor
    }
  }
}
