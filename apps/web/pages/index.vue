<template>
  <div class="home-page">
    <PianoSurface />
  </div>
</template>

<script setup lang="ts">
import PianoSurface from '@/components/piano/PianoSurface.vue'
</script>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 4vw, 3rem) clamp(1rem, 5vw, 4rem) clamp(2rem, 6vw, 4rem);
}
</style>
