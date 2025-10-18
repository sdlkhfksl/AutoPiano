<template>
  <section class="preset-manager">
    <header>
      <h3>效果预设</h3>
      <p>快速切换常用音色配置。</p>
    </header>
    <div class="preset-manager__grid">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="preset-manager__card"
        @click="apply(preset.id)"
      >
        <strong>{{ preset.name }}</strong>
        <span v-if="preset.description">{{ preset.description }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EffectPreset } from '@autopiano/services'
import { useAudioWorkspaceStore } from '@/stores/audioWorkspace'

const store = useAudioWorkspaceStore()
const presets = computed<EffectPreset[]>(() => store.presets)

const apply = (id: string) => {
  store.applyPreset(id)
}
</script>

<style scoped>
.preset-manager {
  background: rgba(15, 23, 42, 0.85);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.2rem);
  color: rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.preset-manager header h3 {
  margin: 0;
  font-size: 1rem;
}

.preset-manager header p {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.7);
}

.preset-manager__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
}

.preset-manager__card {
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.preset-manager__card strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.preset-manager__card span {
  font-size: 0.78rem;
  color: rgba(148, 163, 184, 0.85);
}

.preset-manager__card:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}
</style>
