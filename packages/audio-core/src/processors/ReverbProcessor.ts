import { Reverb } from 'tone'
import type { ToneAudioNode } from 'tone'
import { clamp } from '../utils/AudioUtils'

export class ReverbProcessor {
  private readonly reverb = new Reverb({ decay: 3.5, wet: 0.35 })

  get node(): ToneAudioNode {
    return this.reverb
  }

  setDecay(seconds: number): void {
    this.reverb.decay = clamp(seconds, 0.1, 12)
  }

  setWet(wet: number): void {
    this.reverb.wet.value = clamp(wet, 0, 1)
  }

  dispose(): void {
    this.reverb.dispose()
  }
}
