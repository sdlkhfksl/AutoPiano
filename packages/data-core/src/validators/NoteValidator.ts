import { parseNumberedToken } from '../utils/note'

export class NoteValidator {
  static isValidSymbol(symbol: string): boolean {
    return Boolean(parseNumberedToken(symbol))
  }
}
