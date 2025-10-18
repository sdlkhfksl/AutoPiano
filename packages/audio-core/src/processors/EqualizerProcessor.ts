import { EQ3 } from 'tone'
import type { ToneAudioNode } from 'tone'
import { clamp } from '../utils/AudioUtils'

export class EqualizerProcessor {
  private readonly eq = new EQ3({
    low: 2,
    mid: 0,
    high: -1
  })

  get node(): ToneAudioNode {
    return this.eq
  }

  setBands(low: number, mid: number, high: number): void {
    this.eq.low.value = clamp(low, -12, 12)
    this.eq.mid.value = clamp(mid, -12, 12)
    this.eq.high.value = clamp(high, -12, 12)
  }

  dispose(): void {
    this.eq.dispose()
  }
}
