<template>
  <section class="score-library">
    <header class="score-library__header">
      <h3>自动演奏曲库</h3>
      <p>从经典简谱到改编曲，点击即可自动演奏。</p>
    </header>
    <ul class="score-library__list">
      <li v-for="score in scores" :key="score.id" class="score-library__item">
        <button
          type="button"
          class="score-library__button"
          :class="{
            'is-selected': selectedId === score.id,
            'is-playing': nowPlayingId === score.id
          }"
          @click="handlePlay(score)"
          @mouseenter="handleSelect(score)"
        >
          <span class="score-library__name">{{ score.name }}</span>
          <span class="score-library__meta">{{ metaFor(score) }}</span>
          <span v-if="nowPlayingId === score.id" class="score-library__status">演奏中</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { ScoreModel } from '@autopiano/data-core'

const props = defineProps<{
  scores: ScoreModel[]
  selectedId: string | null
  nowPlayingId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', score: ScoreModel): void
  (e: 'play', score: ScoreModel): void
}>()

const handleSelect = (score: ScoreModel) => {
  emit('select', score)
}

const handlePlay = (score: ScoreModel) => {
  emit('play', score)
}

const metaFor = (score: ScoreModel) => {
  const degree = typeof score.degree === 'number' ? `难度 ${score.degree}/5` : '难度未知'
  const bpm = score.speed ? `${score.speed} BPM` : '速度自适应'
  return `${degree} · ${bpm}`
}
</script>

<style scoped>
.score-library {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.92);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.5rem);
  color: rgba(226, 232, 240, 0.95);
  box-shadow: 0 20px 45px -30px rgba(15, 23, 42, 0.85);
}

.score-library__header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.score-library__header p {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.72);
}

.score-library__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.score-library__item {
  margin: 0;
}

.score-library__button {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: center;
  background: rgba(248, 250, 252, 0.07);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.score-library__button:hover {
  background: rgba(248, 250, 252, 0.12);
  transform: translateY(-1px);
}

.score-library__button.is-selected {
  box-shadow: 0 10px 30px -18px rgba(251, 191, 36, 0.65);
}

.score-library__button.is-playing {
  background: linear-gradient(135deg, rgba(253, 230, 138, 0.16), rgba(251, 191, 36, 0.28));
  color: #fbbf24;
}

.score-library__name {
  font-weight: 600;
  text-align: left;
}

.score-library__meta {
  font-size: 0.85rem;
  opacity: 0.8;
  text-align: right;
}

.score-library__status {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fbbf24;
  grid-column: 1 / -1;
  text-align: left;
}
</style>
