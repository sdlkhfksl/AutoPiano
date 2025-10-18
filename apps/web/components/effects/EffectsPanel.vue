<template>
  <section class="effects-panel">
    <header>
      <h3>音效器</h3>
      <p>组合混响、压缩和均衡，为演奏打造专属音色。</p>
    </header>
    <ul class="effects-panel__list">
      <li v-for="effect in effects" :key="effect.id" class="effects-panel__item">
        <label class="effects-panel__toggle">
          <input type="checkbox" :checked="effect.active" @change="() => toggle(effect)" />
          <div>
            <strong>{{ effect.label }}</strong>
            <p>{{ effect.description }}</p>
          </div>
        </label>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EffectDescriptor } from '@autopiano/services'
import { useAudioWorkspaceStore } from '@/stores/audioWorkspace'

const store = useAudioWorkspaceStore()
const effects = computed<EffectDescriptor[]>(() => store.effects)

const toggle = (effect: EffectDescriptor) => {
  store.toggleEffect(effect.id, !effect.active)
}
</script>

<style scoped>
.effects-panel {
  background: rgba(15, 23, 42, 0.86);
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.3rem);
  color: rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.effects-panel header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.effects-panel header p {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}

.effects-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.effects-panel__item {
  background: rgba(30, 41, 59, 0.55);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.effects-panel__toggle {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: start;
  cursor: pointer;
}

.effects-panel__toggle input {
  width: 18px;
  height: 18px;
  accent-color: #f97316;
  margin-top: 0.2rem;
}

.effects-panel__toggle strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.effects-panel__toggle p {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.8);
}
</style>
