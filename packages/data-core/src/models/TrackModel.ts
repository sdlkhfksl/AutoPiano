import type { NumberedScoreInput, StepName, TrackMetadata } from '../types'

export class TrackModel {
  readonly id: string
  readonly name: string
  readonly step: StepName
  readonly speed: number
  readonly notes: string[]

  constructor(metadata: TrackMetadata) {
    this.id = metadata.id
    this.name = metadata.name
    this.step = metadata.step
    this.speed = metadata.speed
    this.notes = [...metadata.notes]
  }

  toNumberedInput(): NumberedScoreInput {
    return {
      step: this.step,
      speed: this.speed,
      track: [...this.notes]
    }
  }

  withNotes(notes: string[]): TrackModel {
    return new TrackModel({
      id: this.id,
      name: this.name,
      step: this.step,
      speed: this.speed,
      notes
    })
  }
}
