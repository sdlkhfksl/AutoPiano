<template>
  <section class="playback-controller">
    <header>
      <h3>录音库</h3>
      <p>点击播放回顾练习，或导出为 MIDI / MusicXML / JSON。</p>
    </header>
    <ul v-if="recordings.length" class="playback-controller__list">
      <li v-for="recording in recordings" :key="recording.id" class="playback-controller__item">
        <div class="playback-controller__meta">
          <strong>{{ recording.name }}</strong>
          <span>{{ durationText(recording.durationMs) }} · {{ recording.noteCount }} 个音符</span>
          <time :datetime="isoTime(recording.createdAt)">
            {{ formattedDate(recording.createdAt) }}
          </time>
        </div>
        <div class="playback-controller__actions">
          <button type="button" class="primary" @click="play(recording)">播放</button>
          <button type="button" @click="exportMidi(recording)">导出 MIDI</button>
          <button type="button" @click="exportXml(recording)">导出 XML</button>
          <button type="button" @click="exportJson(recording)">导出 JSON</button>
          <button type="button" class="danger" @click="remove(recording.id)">删除</button>
        </div>
      </li>
    </ul>
    <p v-else class="playback-controller__empty">暂无录音，点击上方开始录音。</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ExportService } from '@autopiano/services'
import type { RecordingResult } from '@autopiano/services'
import { useAudioWorkspaceStore } from '@/stores/audioWorkspace'

const store = useAudioWorkspaceStore()
const exportService = new ExportService()

const recordings = computed(() => store.recordings)

const durationText = (durationMs: number) => {
  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const paddedSeconds = seconds.toString().padStart(2, '0')
  return `${minutes}:${paddedSeconds}`
}

const isoTime = (timestamp: number) => new Date(timestamp).toISOString()
const formattedDate = (timestamp: number) => new Date(timestamp).toLocaleString()

const ensureClient = () => typeof window !== 'undefined'

const downloadBlob = (data: BlobPart, filename: string, mime: string) => {
  if (!ensureClient()) return
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const play = (recording: RecordingResult) => {
  store.playRecording(recording)
}

const exportMidi = (recording: RecordingResult) => {
  const bytes = exportService.toMidi(recording)
  downloadBlob(bytes, `${recording.name}.mid`, 'audio/midi')
}

const exportXml = (recording: RecordingResult) => {
  const xml = exportService.toMusicXml(recording)
  downloadBlob(xml, `${recording.name}.musicxml`, 'application/vnd.recordare.musicxml+xml')
}

const exportJson = (recording: RecordingResult) => {
  const json = exportService.toJson(recording)
  downloadBlob(json, `${recording.name}.json`, 'application/json')
}

const remove = (id: string) => {
  store.deleteRecording(id)
}
</script>

<style scoped>
.playback-controller {
  background: rgba(15, 23, 42, 0.86);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.4rem);
  color: rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playback-controller header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.playback-controller header p {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}

.playback-controller__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playback-controller__item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: rgba(30, 41, 59, 0.55);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.playback-controller__meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.playback-controller__meta strong {
  font-size: 1rem;
}

.playback-controller__meta span,
.playback-controller__meta time {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.8);
}

.playback-controller__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.playback-controller__actions button {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.playback-controller__actions button.primary {
  background: linear-gradient(135deg, #38bdf8, #60a5fa);
  border-color: transparent;
  color: #0f172a;
  font-weight: 600;
}

.playback-controller__actions button.danger {
  border-color: rgba(248, 113, 113, 0.6);
  color: #f87171;
}

.playback-controller__actions button:hover {
  transform: translateY(-1px);
}

.playback-controller__empty {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.82);
}
</style>
