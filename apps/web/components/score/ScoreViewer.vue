<template>
  <section class="score-viewer">
    <header>
      <h3>{{ score?.name ?? '请选择曲目' }}</h3>
      <p v-if="score">{{ summary }}</p>
      <p v-else>从左侧曲库中选择一首曲目，查看详细信息。</p>
    </header>
    <div v-if="score" class="score-viewer__content">
      <dl>
        <div>
          <dt>调式</dt>
          <dd>{{ score.step }}</dd>
        </div>
        <div>
          <dt>速度</dt>
          <dd>{{ score.speed }} BPM</dd>
        </div>
        <div>
          <dt>难度</dt>
          <dd>{{ score.degree ?? '未知' }}</dd>
        </div>
        <div>
          <dt>主旋律长度</dt>
          <dd>{{ score.mainTrack.notes.length }} 个符号</dd>
        </div>
        <div>
          <dt>伴奏长度</dt>
          <dd>{{ score.backingTrack ? score.backingTrack.notes.length : '无伴奏' }}</dd>
        </div>
      </dl>
      <p v-if="score.description" class="score-viewer__description">
        {{ score.description }}
      </p>
      <div v-if="tags.length" class="score-viewer__tags">
        <span v-for="tag in tags" :key="tag">#{{ tag }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScoreModel } from '@autopiano/data-core'

const props = defineProps<{
  score: ScoreModel | null
}>()

const summary = computed(() => {
  if (!props.score) return ''
  const degree = typeof props.score.degree === 'number' ? `难度 ${props.score.degree}/5` : '难度未知'
  return `${degree} · ${props.score.speed} BPM · ${props.score.step} 调`
})

const tags = computed(() => props.score?.tags ?? [])
</script>

<style scoped>
.score-viewer {
  background: rgba(15, 23, 42, 0.86);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.4rem);
  color: rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-viewer header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.score-viewer header p {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.7);
}

.score-viewer__content dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.score-viewer__content dl div {
  display: grid;
  gap: 0.25rem;
}

.score-viewer__content dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.score-viewer__content dd {
  margin: 0;
  font-weight: 600;
}

.score-viewer__description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(226, 232, 240, 0.85);
}

.score-viewer__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.score-viewer__tags span {
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}
</style>
