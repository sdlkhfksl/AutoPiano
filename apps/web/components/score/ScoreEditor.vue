<template>
  <section class="score-editor">
    <header>
      <h3>乐谱实验室</h3>
      <p>输入简谱符号即可快速预览。使用空格或逗号分隔，例如 <code>1 2 3 1</code>。</p>
    </header>
    <form class="score-editor__form" @submit.prevent="handlePlay">
      <div class="score-editor__row">
        <label class="score-editor__field">
          <span>曲目名称</span>
          <input v-model="title" type="text" placeholder="自定义乐谱" />
        </label>
        <label class="score-editor__field">
          <span>调式</span>
          <select v-model="step">
            <option v-for="item in steps" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="score-editor__field">
          <span>速度 (BPM)</span>
          <input v-model.number="speed" type="number" min="40" max="180" step="1" />
        </label>
      </div>
      <label class="score-editor__textarea">
        <span>主旋律</span>
        <textarea
          v-model="mainTrack"
          rows="4"
          placeholder="示例：1 2 3 1 | 5 6 5 3"
        />
      </label>
      <label class="score-editor__textarea">
        <span>伴奏（可选）</span>
        <textarea
          v-model="backingTrack"
          rows="3"
          placeholder="示例：1(0.5) 5(0.5) 3(0.5)"
        />
      </label>
      <div class="score-editor__actions">
        <button type="submit" class="primary">预览演奏</button>
        <button type="button" class="ghost" @click="handleStop">停止</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NumberedScoreInput } from '@autopiano/audio-core'

type CustomScorePayload = NumberedScoreInput & {
  name: string
  backingTrack?: string[]
}

const emit = defineEmits<{
  (e: 'play', payload: CustomScorePayload): void
  (e: 'stop'): void
}>()

const steps = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const title = ref('自定义乐谱')
const step = ref<typeof steps[number]>('C')
const speed = ref(90)
const mainTrack = ref('1 1 5 5 6 6 5(2) 4 4 3 3 2 2 1(2)')
const backingTrack = ref('')

const normalizedTitle = computed(() => title.value.trim() || '自定义乐谱')

const parseTrack = (input: string): string[] =>
  input
    .split(/[\s,\n|]+/)
    .map((token) => token.trim())
    .filter(Boolean)

const handlePlay = () => {
  const main = parseTrack(mainTrack.value)
  const backing = parseTrack(backingTrack.value)
  if (!main.length) return
  const payload: CustomScorePayload = {
    name: normalizedTitle.value,
    step: step.value,
    speed: Number.isFinite(speed.value) ? speed.value : 90,
    track: main,
    backingTrack: backing.length ? backing : undefined
  }
  emit('play', payload)
}

const handleStop = () => {
  emit('stop')
}
</script>

<style scoped>
.score-editor {
  background: rgba(15, 23, 42, 0.88);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.5rem);
  color: rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-editor header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.score-editor header p {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.72);
}

.score-editor__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-editor__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.score-editor__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.score-editor__field input,
.score-editor__field select {
  appearance: none;
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
}

.score-editor__textarea {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.score-editor__textarea textarea {
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.75);
  color: inherit;
  resize: vertical;
  min-height: 120px;
}

.score-editor__actions {
  display: flex;
  gap: 0.75rem;
}

.score-editor__actions button {
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.score-editor__actions button.primary {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #0f172a;
  font-weight: 600;
}

.score-editor__actions button.ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
  color: inherit;
}

.score-editor__actions button:hover {
  transform: translateY(-1px);
}
</style>
