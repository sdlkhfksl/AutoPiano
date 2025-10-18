<template>
  <div class="piano">
    <div class="piano-band">
      <img src="/images/band.png" alt="piano logo" class="piano-band-img" />
      <div class="piano-tip">⇧ 代表 Shift 键</div>
    </div>
    <div class="piano-stage">
      <div class="white-keys">
        <button
          v-for="(entry, index) in whiteKeyEntries"
          :key="entry.note.id"
          class="piano-key white"
          :class="{ 'is-active': isActive(entry.note.keyCode) }"
          :style="{ width: whiteKeyWidth }"
          type="button"
          @pointerdown.prevent="handlePress(entry.note.name)"
        >
          <span class="keytip">
            <span class="keyname" v-if="showKeyLabels">{{ entry.note.key }}</span>
            <span class="notename" v-if="showNoteNames">{{ entry.note.name }}</span>
          </span>
        </button>
      </div>
      <div class="black-keys">
        <button
          v-for="black in blackKeyEntries"
          :key="black.note.id"
          class="piano-key black"
          :class="{ 'is-active': isActive(black.note.keyCode) }"
          :style="{
            width: black.width,
            left: black.left
          }"
          type="button"
          @pointerdown.prevent="handlePress(black.note.name)"
        >
          <span class="keytip" v-if="showKeyLabels" v-html="black.note.key"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NoteDefinition } from '@autopiano/config'

const props = defineProps<{
  notes: NoteDefinition[]
  showKeyLabels: boolean
  showNoteNames: boolean
  activeKeys: Set<string>
}>()

const emit = defineEmits<{ (e: 'note', noteName: string): void }>()

const whiteKeyEntries = computed(() =>
  props.notes
    .filter((note) => note.type === 'white')
    .map((note, index) => ({ note, index }))
)

const whiteKeyWidth = computed(() => `${(1 / whiteKeyEntries.value.length) * 100}%`)

const blackKeyEntries = computed(() => {
  const whiteWidth = 1 / Math.max(whiteKeyEntries.value.length, 1)
  return props.notes
    .filter((note) => note.type === 'black')
    .map((note) => {
      const anchorName = note.name.replace('#', '')
      const anchor = whiteKeyEntries.value.find((entry) => entry.note.name === anchorName)
      const baseIndex = anchor ? anchor.index : 0
      const leftPercent = (baseIndex + 0.7) * whiteWidth * 100
      const widthPercent = whiteWidth * 0.58 * 100
      return {
        note,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`
      }
    })
})

const isActive = (keyCode: string) => props.activeKeys.has(keyCode)

const handlePress = (noteName: string) => {
  emit('note', noteName)
}
</script>

<style scoped>
.piano {
  width: min(1200px, 100%);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 25px 60px -35px rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
}

.piano-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.piano-band-img {
  width: clamp(96px, 14vw, 132px);
  filter: drop-shadow(0 6px 12px rgba(15, 23, 42, 0.25));
}

.piano-tip {
  color: rgba(30, 41, 59, 0.7);
  font-size: 0.95rem;
}

.piano-stage {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #1e293b 0%, #111827 100%);
  padding: clamp(0.5rem, 2vw, 1rem) clamp(0.4rem, 1vw, 0.75rem) 1.25rem;
}

.white-keys {
  display: flex;
  position: relative;
  z-index: 1;
}

.black-keys {
  position: absolute;
  top: clamp(0.35rem, 1vw, 0.65rem);
  left: clamp(0.4rem, 1vw, 0.75rem);
  right: clamp(0.4rem, 1vw, 0.75rem);
  bottom: clamp(1rem, 2vw, 1.4rem);
  pointer-events: none;
}

.piano-key {
  border: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  position: relative;
  pointer-events: auto;
}

.piano-key:active {
  transform: translateY(2px);
}

.piano-key.white {
  height: clamp(160px, 28vw, 320px);
  border-radius: 0 0 10px 10px;
  margin: 0 1px;
  background: linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%);
  box-shadow: inset 0 -4px 6px rgba(15, 23, 42, 0.18);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: background 0.08s ease, box-shadow 0.08s ease;
}

.piano-key.white .keytip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: clamp(0.75rem, 2vw, 1.2rem);
  color: rgba(17, 24, 39, 0.85);
}

.piano-key.white .notename {
  font-weight: 600;
  color: #2563eb;
}

.piano-key.white.is-active {
  background: linear-gradient(180deg, #fde68a 0%, #f97316 100%);
  box-shadow: inset 0 -4px 8px rgba(120, 53, 15, 0.35);
}

.piano-key.black {
  position: absolute;
  height: 65%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #0f172a 0%, #1f2937 70%, #020617 100%);
  border-radius: 0 0 8px 8px;
  box-shadow: inset 0 -4px 6px rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.78rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.6rem;
}

.piano-key.black.is-active {
  background: linear-gradient(180deg, #fb923c 0%, #ea580c 70%, #9a3412 100%);
  box-shadow: inset 0 -4px 8px rgba(255, 255, 255, 0.12);
}

.keytip {
  pointer-events: none;
}

@media (max-width: 768px) {
  .piano {
    border-radius: 14px;
  }
  .piano-stage {
    padding-bottom: 1rem;
  }
  .piano-key.white {
    margin: 0 0.5px;
  }
}
</style>
