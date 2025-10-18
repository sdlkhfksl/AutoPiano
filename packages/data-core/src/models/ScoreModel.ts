import { nanoid } from '../utils/nanoid'
import { sanitizeSymbol } from '../utils/note'
import type { NumberedScoreInput, ScoreMetadata, StepName } from '../types'
import { TrackModel } from './TrackModel'

export interface ScoreModelOptions extends Omit<ScoreMetadata, 'id'> {
  id?: string
}

export class ScoreModel {
  readonly id: string
  readonly name: string
  readonly step: StepName
  readonly speed: number
  readonly degree?: number
  readonly tags?: string[]
  readonly description?: string
  readonly mainTrack: TrackModel
  readonly backingTrack?: TrackModel

  constructor(options: ScoreModelOptions) {
    this.id = options.id || nanoid()
    this.name = options.name
    this.step = options.step
    this.speed = options.speed
    this.degree = options.degree
    this.tags = options.tags
    this.description = options.description
    this.mainTrack = new TrackModel({
      id: `${this.id}-main`,
      name: `${this.name} · 主旋律`,
      step: this.step,
      speed: this.speed,
      notes: options.mainTrack.map(sanitizeSymbol).filter(Boolean)
    })
    this.backingTrack = options.backingTrack
      ? new TrackModel({
          id: `${this.id}-backing`,
          name: `${this.name} · 伴奏`,
          step: this.step,
          speed: this.speed,
          notes: options.backingTrack.map(sanitizeSymbol).filter(Boolean)
        })
      : undefined
  }

  toNumberedInputs(): NumberedScoreInput[] {
    const inputs: NumberedScoreInput[] = [this.mainTrack.toNumberedInput()]
    if (this.backingTrack) {
      inputs.push(this.backingTrack.toNumberedInput())
    }
    return inputs
  }

  withMainTrack(notes: string[]): ScoreModel {
    return new ScoreModel({
      id: this.id,
      name: this.name,
      step: this.step,
      speed: this.speed,
      degree: this.degree,
      tags: this.tags,
      description: this.description,
      mainTrack: notes,
      backingTrack: this.backingTrack?.notes
    })
  }

  withBackingTrack(notes: string[] | undefined): ScoreModel {
    return new ScoreModel({
      id: this.id,
      name: this.name,
      step: this.step,
      speed: this.speed,
      degree: this.degree,
      tags: this.tags,
      description: this.description,
      mainTrack: this.mainTrack.notes,
      backingTrack: notes
    })
  }

  toMetadata(): ScoreMetadata {
    return {
      id: this.id,
      name: this.name,
      step: this.step,
      speed: this.speed,
      degree: this.degree,
      tags: this.tags,
      description: this.description,
      mainTrack: [...this.mainTrack.notes],
      backingTrack: this.backingTrack ? [...this.backingTrack.notes] : undefined
    }
  }
}
