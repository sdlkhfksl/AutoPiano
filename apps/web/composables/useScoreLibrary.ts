import { computed } from 'vue'
import { ScoreNumbered } from '@autopiano/config'
import { ScoreModel } from '@autopiano/data-core'
import type { StepName } from '@autopiano/data-core'

function normalizeStep(step?: string): StepName {
  const upper = (step || 'C').toUpperCase()
  if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(upper)) {
    return upper as StepName
  }
  return 'C'
}

function normalizeSpeed(speed?: number | string): number {
  const numeric = Number(speed)
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric
  }
  return 80
}

export function useScoreLibrary() {
  const scores = computed(() =>
    (ScoreNumbered ?? []).map((item, index) =>
      new ScoreModel({
        id: item.id ?? `score-${index}`,
        name: item.name ?? `未命名曲目 ${index + 1}`,
        step: normalizeStep(item.step),
        speed: normalizeSpeed(item.speed),
        degree: typeof item.degree === 'number' ? item.degree : undefined,
        mainTrack: Array.isArray(item.mainTrack) ? item.mainTrack : [],
        backingTrack: Array.isArray(item.backingTrack) ? item.backingTrack : undefined,
        tags: item.tags ?? undefined,
        description: item.description ?? undefined
      })
    )
  )

  return {
    scores
  }
}
