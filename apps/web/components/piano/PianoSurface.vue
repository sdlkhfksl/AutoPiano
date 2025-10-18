<template>
  <section class="piano-surface">
    <div class="piano-column">
      <div class="piano-controls">
        <label class="toggle" for="toggle-key-labels">
          <input id="toggle-key-labels" v-model="showKeyLabels" type="checkbox" />
          <span>显示按键提示</span>
        </label>
        <label class="toggle" for="toggle-note-labels">
          <input id="toggle-note-labels" v-model="showNoteNames" type="checkbox" />
          <span>显示音名</span>
        </label>
        <button type="button" class="stop-button" @click="stopAutoPlay" :disabled="runningSequences === 0">
          停止自动演奏
        </button>
      </div>
      <PianoKeyboard
        :notes="notes"
        :show-key-labels="showKeyLabels"
        :show-note-names="showNoteNames"
        :active-keys="activeKeys"
        @note="handleNoteTrigger"
      />
    </div>
    <aside class="score-panel">
      <header class="score-header">
        <h3>自动演奏曲库</h3>
        <p>选曲后自动演奏，可同时开启前奏与伴奏轨道。</p>
      </header>
      <ul class="score-list">
        <li v-for="score in scoreList" :key="score.name" class="score-item">
          <button type="button" class="score-button" @click="playScore(score)" :class="{ 'is-playing': nowPlaying === score.name }">
            <span class="score-name">{{ score.name }}</span>
            <span class="score-meta">{{ scoreMeta(score) }}</span>
          </button>
        </li>
      </ul>
      <p v-if="nowPlaying" class="now-playing">当前演奏：{{ nowPlaying }}</p>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { Notes, ScoreNumbered, type NoteDefinition, type NumberedScore } from '@autopiano/config'
import type { StepName } from '@autopiano/audio-engine'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PianoKeyboard from './PianoKeyboard.vue'
import { usePianoEngine } from '@/composables/usePianoEngine'

const notes = Notes as NoteDefinition[]

const noteByKeyCode = new Map<string, NoteDefinition>()
const noteByName = new Map<string, NoteDefinition>()
notes.forEach((note) => {
  noteByKeyCode.set(note.keyCode, note)
  noteByName.set(note.name, note)
})

const showKeyLabels = ref(true)
const showNoteNames = ref(false)
const activeKeys = ref(new Set<string>())
const nowPlaying = ref<string | null>(null)
const runningSequences = ref(0)

const enableBlackKey = ref(false)
const pressedPhysical = new Map<number, string>()
const keyCounters = new Map<string, number>()
const autoTimers: Array<{ id: number; code: string }> = []
const autoStops: Array<() => void> = []

const { playNote, scheduleNumberedScore } = usePianoEngine()

const scoreList = computed(() => ScoreNumbered as NumberedScore[])

function scoreMeta(score: NumberedScore) {
  const degree = score.degree ? `难度 ${score.degree}/5` : '难度未知'
  const bpm = score.speed ? `${score.speed} BPM` : '速度自适应'
  return `${degree} · ${bpm}`
}

function cloneActiveSet() {
  return new Set(activeKeys.value)
}

function promoteKey(code: string) {
  const clone = cloneActiveSet()
  clone.add(code)
  activeKeys.value = clone
}

function demoteKey(code: string) {
  const clone = cloneActiveSet()
  clone.delete(code)
  activeKeys.value = clone
}

function addKey(code: string, durationMs?: number) {
  keyCounters.set(code, (keyCounters.get(code) ?? 0) + 1)
  promoteKey(code)
  if (durationMs) {
    const id = window.setTimeout(() => {
      releaseKey(code)
      const index = autoTimers.findIndex((timer) => timer.id === id)
      if (index >= 0) autoTimers.splice(index, 1)
    }, durationMs)
    autoTimers.push({ id, code })
  }
}

function releaseKey(code: string) {
  const next = (keyCounters.get(code) ?? 0) - 1
  if (next <= 0) {
    keyCounters.delete(code)
    demoteKey(code)
  } else {
    keyCounters.set(code, next)
  }
}

function triggerNote(noteName: string, durationMs = 240) {
  const note = noteByName.get(noteName)
  if (!note) return
  addKey(note.keyCode, durationMs)
  void playNote?.(note.name, Math.max(durationMs / 1000, 0.5))
}

function handleNoteTrigger(noteName: string) {
  triggerNote(noteName)
}

const SHIFT_KEY_CODE = 16

function handleKeyDown(event: KeyboardEvent) {
  if (event.repeat) return
  const code = event.keyCode || event.which
  if (code === SHIFT_KEY_CODE) {
    enableBlackKey.value = true
    return
  }
  const identifier = enableBlackKey.value ? `b${code}` : `${code}`
  if (pressedPhysical.get(code) === identifier) {
    return
  }
  const note = noteByKeyCode.get(identifier)
  if (!note) return
  pressedPhysical.set(code, identifier)
  triggerNote(note.name)
}

function handleKeyUp(event: KeyboardEvent) {
  const code = event.keyCode || event.which
  if (code === SHIFT_KEY_CODE) {
    enableBlackKey.value = false
    return
  }
  const identifier = pressedPhysical.get(code)
  if (!identifier) return
  pressedPhysical.delete(code)
  releaseKey(identifier)
}

onMounted(() => {
  if (!process.client) return
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }
  stopAutoPlay()
})

function clearAutoTimers() {
  autoTimers.splice(0).forEach(({ id, code }) => {
    window.clearTimeout(id)
    releaseKey(code)
  })
}

function stopAutoPlay() {
  clearAutoTimers()
  autoStops.splice(0).forEach((stop) => stop())
  runningSequences.value = 0
  nowPlaying.value = null
}

function playScore(score: NumberedScore) {
  stopAutoPlay()
  const step = (score.step || 'C') as StepName
  const speed = Number(score.speed) || 80
  const baseOptions = { step, speed }
  const highlight = (noteName: string, durationMs: number) => {
    triggerNote(noteName, Math.max(durationMs * 0.9, 180))
  }

  const launchTrack = (track: string[]) => {
    const cancel = scheduleNumberedScore?.(
      { ...baseOptions, track },
      {
        onNoteStart: (event) => {
          highlight(event.note, event.durationMs)
        },
        onComplete: () => {
          runningSequences.value = Math.max(0, runningSequences.value - 1)
          if (runningSequences.value === 0) {
            nowPlaying.value = null
          }
        },
        onCancel: () => {
          runningSequences.value = Math.max(0, runningSequences.value - 1)
          if (runningSequences.value === 0) {
            nowPlaying.value = null
          }
        }
      }
    )
    if (cancel) {
      runningSequences.value += 1
      autoStops.push(cancel)
    }
  }

  if (score.mainTrack?.length) {
    launchTrack(score.mainTrack)
  }
  if (score.backingTrack?.length) {
    launchTrack(score.backingTrack)
  }

  if (runningSequences.value > 0) {
    nowPlaying.value = score.name
  }
}
</script>

<style scoped>
.piano-surface {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  align-items: start;
  width: min(1200px, 100%);
}

.piano-column {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.piano-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2vw, 1.5rem);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.85);
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 45px -30px rgba(15, 23, 42, 0.8);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.toggle input {
  width: 18px;
  height: 18px;
  accent-color: #f97316;
}

.stop-button {
  margin-left: auto;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.stop-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stop-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.score-panel {
  background: rgba(15, 23, 42, 0.92);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.5rem);
  color: rgba(226, 232, 240, 0.95);
  box-shadow: 0 25px 50px -30px rgba(15, 23, 42, 0.9);
}

.score-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.score-header p {
  margin: 0.35rem 0 1rem;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.7);
}

.score-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.score-item {}

.score-button {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  background: rgba(248, 250, 252, 0.06);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.score-button:hover {
  background: rgba(248, 250, 252, 0.12);
  transform: translateY(-1px);
}

.score-button.is-playing {
  background: linear-gradient(135deg, rgba(253, 230, 138, 0.18), rgba(251, 191, 36, 0.3));
  color: #fbbf24;
}

.score-name {
  font-weight: 600;
}

.score-meta {
  font-size: 0.85rem;
  opacity: 0.8;
}

.now-playing {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #fbbf24;
  font-weight: 600;
}

@media (max-width: 992px) {
  .piano-surface {
    grid-template-columns: 1fr;
  }

  .score-panel {
    order: -1;
  }

  .stop-button {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .piano-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .stop-button {
    align-self: stretch;
    text-align: center;
  }
}
</style>
