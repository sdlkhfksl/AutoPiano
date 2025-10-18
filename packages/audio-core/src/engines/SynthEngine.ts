import { start, Synth } from 'tone'
import { isBrowser } from '../utils/AudioUtils'

export class SynthEngine {
  private synth: Synth | null = null

  async play(note: string, durationSeconds = 0.5): Promise<void> {
    if (!note || !isBrowser()) return

    try {
      await start()
    } catch (_) {
      // ignore
    }

    if (!this.synth) {
      this.synth = new Synth().toDestination()
    }

    this.synth.triggerAttackRelease(note, durationSeconds)
  }

  dispose(): void {
    this.synth?.dispose()
    this.synth = null
  }
}
