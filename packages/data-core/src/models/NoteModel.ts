import { tokenToMidi, tokenToNoteName } from '../utils/note'
import type { StepName } from '../types'

export interface NoteModelOptions {
  symbol: string
  step: StepName
  velocity?: number
}

export class NoteModel {
  readonly symbol: string
  readonly step: StepName
  readonly velocity: number

  private midiCache: number | null | undefined
  private nameCache: string | undefined

  constructor(options: NoteModelOptions) {
    this.symbol = options.symbol
    this.step = options.step
    this.velocity = typeof options.velocity === 'number' ? options.velocity : 0.9
  }

  get midi(): number | null {
    if (this.midiCache === undefined) {
      this.midiCache = tokenToMidi(this.step, this.symbol)
    }
    return this.midiCache
  }

  get noteName(): string | undefined {
    if (this.nameCache === undefined) {
      this.nameCache = tokenToNoteName(this.step, this.symbol)
    }
    return this.nameCache
  }

  isRest(): boolean {
    return this.midi === null
  }
}
