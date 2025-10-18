import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { PianoEngine, NumberedScoreInput, ScheduleCallbacks } from '@autopiano/audio-engine'
import { createPianoEngine } from '@autopiano/audio-engine'

export function usePianoEngine() {
  const engine = ref<PianoEngine | null>(null)

  onMounted(() => {
    if (process.client) {
      engine.value = createPianoEngine()
    }
  })

  onBeforeUnmount(() => {
    engine.value?.dispose()
    engine.value = null
  })

  const playNote = (note: string, durationSeconds?: number) => {
    return engine.value?.play(note, durationSeconds)
  }

  const scheduleNumberedScore = (
    score: NumberedScoreInput,
    callbacks?: ScheduleCallbacks
  ) => {
    if (!engine.value) return undefined
    return engine.value.scheduleNumberedScore(score, callbacks)
  }

  return {
    playNote,
    scheduleNumberedScore
  }
}
