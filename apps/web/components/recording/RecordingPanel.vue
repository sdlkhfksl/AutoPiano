<template>
  <section class="recording-panel">
    <header>
      <h3>录音控制</h3>
      <p>捕获实时演奏或自动演奏的音符，随时导出或回放。</p>
    </header>
    <div class="recording-panel__controls">
      <label class="recording-panel__field">
        <span>录音名称</span>
        <input v-model="recordingName" type="text" placeholder="练习片段" :disabled="isRecording" />
      </label>
      <button
        type="button"
        class="recording-panel__button primary"
        :class="{ 'is-recording': isRecording }"
        @click="toggleRecording"
      >
        {{ isRecording ? '停止录音' : '开始录音' }}
      </button>
      <button type="button" class="recording-panel__button ghost" :disabled="!isRecording" @click="cancelRecording">
        取消
      </button>
    </div>
    <p v-if="isRecording" class="recording-panel__hint">录音中……请继续演奏</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAudioWorkspaceStore } from '@/stores/audioWorkspace'

const store = useAudioWorkspaceStore()
const recordingName = ref('练习片段')

const isRecording = computed(() => store.isRecording)

watch(isRecording, (active) => {
  if (!active) {
    recordingName.value = '练习片段'
  }
})

const toggleRecording = () => {
  if (isRecording.value) {
    store.stopRecording(recordingName.value || undefined)
  } else {
    store.startRecording(recordingName.value || undefined)
  }
}

const cancelRecording = () => {
  if (!isRecording.value) return
  store.cancelRecording()
}
</script>

<style scoped>
.recording-panel {
  background: rgba(15, 23, 42, 0.88);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.3rem);
  color: rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recording-panel header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.recording-panel header p {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.72);
}

.recording-panel__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.75rem;
  align-items: end;
}

.recording-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.recording-panel__field input {
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
}

.recording-panel__button {
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-weight: 600;
}

.recording-panel__button.primary {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: #0f172a;
}

.recording-panel__button.primary.is-recording {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #0f172a;
}

.recording-panel__button.ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.25);
  color: inherit;
}

.recording-panel__button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.recording-panel__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.recording-panel__hint {
  margin: 0;
  font-size: 0.8rem;
  color: #f59e0b;
}

@media (max-width: 720px) {
  .recording-panel__controls {
    grid-template-columns: 1fr;
  }
}
</style>
