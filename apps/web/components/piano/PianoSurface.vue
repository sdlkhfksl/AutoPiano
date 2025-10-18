<template>
  <section class="piano-surface">
    <div class="piano-main">
      <div class="piano-controls">
        <label class="toggle" for="toggle-key-labels">
          <input id="toggle-key-labels" v-model="showKeyLabels" type="checkbox" />
          <span>显示按键提示</span>
        </label>
        <label class="toggle" for="toggle-note-labels">
          <input id="toggle-note-labels" v-model="showNoteNames" type="checkbox" />
          <span>显示音名</span>
        </label>
        <button type="button" class="stop-button" @click="stopAutoPlay" :disabled="!nowPlayingLabel">
          停止自动演奏
        </button>
        <span v-if="nowPlayingLabel" class="now-playing">当前演奏：{{ nowPlayingLabel }}</span>
      </div>
      <PianoKeyboard
        :notes="notes"
        :show-key-labels="showKeyLabels"
        :show-note-names="showNoteNames"
        :active-keys="activeKeys"
        @note="handleNoteTrigger"
      />
      <RecordingPanel />
      <div class="effects-stack">
        <EffectsPanel />
        <PresetManager />
      </div>
    </div>
    <aside class="piano-sidebar">
      <ScoreLibrary
        :scores="scores"
        :selected-id="selectedScore?.id ?? null"
        :now-playing-id="nowPlayingId"
        @select="handleScoreSelect"
        @play="handleScorePlay"
      />
      <ScoreViewer :score="selectedScore" />
      <ScoreEditor @play="handleCustomPlay" @stop="stopAutoPlay" />
      <PlaybackController />
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Notes, type NoteDefinition } from '@autopiano/config'
import type { NumberedScoreInput, SequenceEvent } from '@autopiano/audio-core'
import type { ScoreModel } from '@autopiano/data-core'
import PianoKeyboard from './PianoKeyboard.vue'
import RecordingPanel from '@/components/recording/RecordingPanel.vue'
import PlaybackController from '@/components/recording/PlaybackController.vue'
import ScoreLibrary from '@/components/score/ScoreLibrary.vue'
import ScoreViewer from '@/components/score/ScoreViewer.vue'
import ScoreEditor from '@/components/score/ScoreEditor.vue'
import EffectsPanel from '@/components/effects/EffectsPanel.vue'
import PresetManager from '@/components/effects/PresetManager.vue'
import { useAudioWorkspaceStore } from '@/stores/audioWorkspace'
import { useScoreLibrary } from '@/composables/useScoreLibrary'

const notes = Notes as NoteDefinition[]
const noteByKeyCode = new Map<string, NoteDefinition>()
const noteByName = new Map<string, NoteDefinition>()
notes.forEach((note) => {
  noteByKeyCode.set(note.keyCode, note)
  noteByName.set(note.name, note)
})

const audioWorkspace = useAudioWorkspaceStore()
const { scores } = useScoreLibrary()
const selectedScore = ref<ScoreModel | null>(null)
const nowPlayingId = ref<string | null>(null)
const nowPlayingLabel = ref<string | null>(null)

watch(
  scores,
  (library) => {
    if (!library.length) {
      selectedScore.value = null
      return
    }
    if (!selectedScore.value) {
      selectedScore.value = library[0]
      return
    }
    const match = library.find((score) => score.id === selectedScore.value?.id)
    selectedScore.value = match ?? library[0]
  },
  { immediate: true }
)

const showKeyLabels = ref(true)
const showNoteNames = ref(false)
const activeKeys = ref(new Set<string>())

const enableBlackKey = ref(false)
const pressedPhysical = new Map<number, string>()
const keyCounters = new Map<string, number>()
const autoTimers: Array<{ id: number; code: string }> = []

const cloneActiveSet = () => new Set(activeKeys.value)

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
  if (durationMs && typeof window !== 'undefined') {
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

function highlightKey(noteName: string, durationMs = 240, capture = false, velocity = 0.85) {
  const note = noteByName.get(noteName)
  if (!note) return
  addKey(note.keyCode, durationMs)
  if (capture && audioWorkspace.isRecording) {
    audioWorkspace.captureLiveNote(note.name, durationMs, velocity)
  }
}

function playManual(noteName: string, durationMs = 260) {
  highlightKey(noteName, durationMs, true)
  void audioWorkspace.playNote(noteName, Math.max(durationMs / 1000, 0.5))
}

function handleNoteTrigger(noteName: string) {
  playManual(noteName)
}

const SHIFT_KEY_CODE = 16

function handleKeyDown(event: KeyboardEvent) {
  if (!process.client) return
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
  playManual(note.name)
}

function handleKeyUp(event: KeyboardEvent) {
  if (!process.client) return
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

function clearAutoTimers() {
  if (typeof window === 'undefined') return
  autoTimers.splice(0).forEach(({ id, code }) => {
    window.clearTimeout(id)
    releaseKey(code)
  })
}

function stopAutoPlay() {
  if (process.client) {
    audioWorkspace.stopPlayback()
    clearAutoTimers()
  }
  nowPlayingId.value = null
  nowPlayingLabel.value = null
}

function handleScoreSelect(score: ScoreModel) {
  selectedScore.value = score
}

function handleScorePlay(score: ScoreModel) {
  selectedScore.value = score
  playScoreModel(score)
}

function playScoreModel(score: ScoreModel | null) {
  if (!process.client || !score) return
  stopAutoPlay()
  nowPlayingId.value = score.id
  nowPlayingLabel.value = score.name
  audioWorkspace.playScore(
    score,
    createPlaybackCallbacks(() => {
      nowPlayingId.value = null
      nowPlayingLabel.value = null
    })
  )
}

interface CustomPayload extends NumberedScoreInput {
  name: string
  backingTrack?: string[]
}

function handleCustomPlay(payload: CustomPayload) {
  if (!process.client) return
  stopAutoPlay()
  nowPlayingId.value = null
  nowPlayingLabel.value = payload.name

  const inputs: NumberedScoreInput[] = [
    { step: payload.step, speed: payload.speed, track: payload.track }
  ]
  if (payload.backingTrack?.length) {
    inputs.push({ step: payload.step, speed: payload.speed, track: payload.backingTrack })
  }

  audioWorkspace.playNumbered(
    inputs,
    createPlaybackCallbacks(() => {
      nowPlayingLabel.value = null
    })
  )
}

function createPlaybackCallbacks(finalize: () => void) {
  return {
    onNoteStart: (event: SequenceEvent) => {
      const highlightDuration = Math.max(event.durationMs * 0.9, 180)
      highlightKey(event.note, highlightDuration, true, event.velocity ?? 0.85)
    },
    onComplete: () => {
      finalize()
      clearAutoTimers()
    },
    onCancel: () => {
      finalize()
      clearAutoTimers()
    }
  }
}

onMounted(() => {
  if (!process.client) return
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  audioWorkspace.refreshEffects()
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }
  stopAutoPlay()
})
</script>

<style scoped>
.piano-surface {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
  align-items: start;
  width: min(1200px, 100%);
}

.piano-main {
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

.now-playing {
  font-size: 0.9rem;
  color: #fbbf24;
  font-weight: 600;
}

.effects-stack {
  display: grid;
  gap: 0.75rem;
}

.piano-sidebar {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
}

@media (max-width: 992px) {
  .piano-surface {
    grid-template-columns: 1fr;
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
