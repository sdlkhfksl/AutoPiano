import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ScoreModel } from '@autopiano/data-core'
import type { NumberedScoreInput } from '@autopiano/audio-core'
import type {
  EffectDescriptor,
  EffectPreset,
  RecordingResult,
  ScheduleCallbacks
} from '@autopiano/services'
import { AudioService, StorageService } from '@autopiano/services'

let service: AudioService | null = null
let bootstrapped = false
const storage = typeof window !== 'undefined' ? new StorageService() : null

function ensureService(): AudioService | null {
  if (typeof window === 'undefined') {
    return null
  }
  if (!service) {
    service = new AudioService()
  }
  return service
}

export const useAudioWorkspaceStore = defineStore('audioWorkspace', () => {
  const isRecording = ref(false)
  const recordings = ref<RecordingResult[]>([])
  const effects = ref<EffectDescriptor[]>([])
  const presets = ref<EffectPreset[]>([])

  function bootIfNeeded() {
    const instance = ensureService()
    if (!instance) return null

    if (!effects.value.length) {
      effects.value = instance.getEffects()
    }
    if (!presets.value.length) {
      presets.value = instance.getPresets()
    }
    if (!recordings.value.length && storage) {
      const saved = storage.loadRecordings()
      if (saved.length) {
        recordings.value = saved
        instance.hydrateRecordings(saved)
      }
    }

    if (!bootstrapped) {
      instance.on('recording:start', () => {
        isRecording.value = true
      })
      instance.on('recording:stop', () => {
        isRecording.value = false
        recordings.value = instance.getRecordings()
        storage?.saveRecordings(recordings.value)
      })
      instance.on('recording:created', (recording) => {
        recordings.value = [recording, ...recordings.value]
        storage?.saveRecordings(recordings.value)
      })
      instance.on('effects:change', (list) => {
        effects.value = list.map((item) => ({ ...item }))
      })
      bootstrapped = true
    }

    return instance
  }

  function playNote(note: string, durationSeconds?: number) {
    const instance = bootIfNeeded()
    return instance?.playNote(note, durationSeconds)
  }

  function playScore(score: ScoreModel, callbacks?: ScheduleCallbacks) {
    const instance = bootIfNeeded()
    instance?.playScoreModel(score, callbacks)
  }

  function playNumbered(inputs: NumberedScoreInput[], callbacks?: ScheduleCallbacks) {
    const instance = bootIfNeeded()
    if (!instance) return
    const normalized = inputs.filter((input) => Array.isArray(input.track) && input.track.length)
    if (!normalized.length) return
    instance.playNumberedScore(normalized, callbacks)
  }

  function stopPlayback() {
    const instance = bootIfNeeded()
    instance?.stopPlayback()
  }

  function startRecording(name?: string) {
    const instance = bootIfNeeded()
    instance?.startRecording({ name })
  }

  function stopRecording(name?: string): RecordingResult | null {
    const instance = bootIfNeeded()
    const result = instance?.stopRecording({ name }) ?? null
    if (result) {
      recordings.value = instance!.getRecordings()
      storage?.saveRecordings(recordings.value)
    }
    return result
  }

  function cancelRecording() {
    const instance = bootIfNeeded()
    instance?.cancelRecording()
  }

  function captureLiveNote(note: string, durationMs: number, velocity?: number) {
    const instance = bootIfNeeded()
    instance?.captureLiveNote(note, durationMs, velocity)
  }

  function playRecording(recording: RecordingResult, callbacks?: ScheduleCallbacks) {
    const instance = bootIfNeeded()
    instance?.playRecording(recording, callbacks)
  }

  function deleteRecording(id: string) {
    const instance = bootIfNeeded()
    if (!instance) return
    const next = recordings.value.filter((item) => item.id !== id)
    recordings.value = next
    storage?.saveRecordings(next)
    instance.hydrateRecordings(next)
  }

  function toggleEffect(id: string, force?: boolean) {
    const instance = bootIfNeeded()
    instance?.toggleEffect(id, force)
  }

  function applyPreset(id: string) {
    const instance = bootIfNeeded()
    instance?.applyPreset(id)
  }

  function refreshEffects() {
    const instance = bootIfNeeded()
    if (!instance) return
    effects.value = instance.getEffects()
    presets.value = instance.getPresets()
  }

  const activeEffects = computed(() => effects.value)
  const availablePresets = computed(() => presets.value)

  return {
    isRecording,
    recordings,
    effects: activeEffects,
    presets: availablePresets,
    playNote,
    playScore,
    playNumbered,
    stopPlayback,
    startRecording,
    stopRecording,
    cancelRecording,
    captureLiveNote,
    playRecording,
    deleteRecording,
    toggleEffect,
    applyPreset,
    refreshEffects
  }
})
