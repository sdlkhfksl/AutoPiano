import { NumberedNotationParser } from '@autopiano/data-core'
import type { NotationParseResult, NumberedScoreInput } from '@autopiano/data-core'

const parser = new NumberedNotationParser()

export function convertNumberedTrack(score: NumberedScoreInput): NotationParseResult {
  return parser.parse(score)
}
