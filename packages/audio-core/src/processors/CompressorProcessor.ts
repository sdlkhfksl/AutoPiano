import { Compressor } from 'tone'
import type { ToneAudioNode } from 'tone'
import { clamp } from '../utils/AudioUtils'

export class CompressorProcessor {
  private readonly compressor = new Compressor({
    threshold: -24,
    ratio: 3,
    attack: 0.01,
    release: 0.25
  })

  get node(): ToneAudioNode {
    return this.compressor
  }

  setThreshold(value: number): void {
    this.compressor.threshold.value = clamp(value, -60, 0)
  }

  setRatio(value: number): void {
    this.compressor.ratio.value = clamp(value, 1, 20)
  }

  dispose(): void {
    this.compressor.dispose()
  }
}
