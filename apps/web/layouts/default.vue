<template>
  <div class="layout-shell" :style="shellStyle">
    <div class="layout-overlay">
      <header class="layout-header">
        <NuxtLink to="/" class="brand">AutoPiano</NuxtLink>
        <nav class="nav">
          <NuxtLink to="/" class="nav-link">体验</NuxtLink>
          <NuxtLink to="/links" class="nav-link">友链</NuxtLink>
        </nav>
      </header>
      <main class="layout-main">
        <slot />
      </main>
      <footer class="layout-footer">
        <span>© {{ currentYear }} AutoPiano • Modern Web Edition</span>
        <button type="button" class="wallpaper-switch" @click="cycleWallpaper">
          换一张壁纸
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWallpaperStore } from '@/stores/wallpaper'

const wallpaperStore = useWallpaperStore()

const shellStyle = computed(() => ({
  backgroundImage: wallpaperStore.current ? `url(${wallpaperStore.current})` : undefined
}))

const currentYear = new Date().getFullYear()

const cycleWallpaper = () => {
  wallpaperStore.cycle()
}
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.6s ease;
}

.layout-overlay {
  min-height: 100vh;
  background: radial-gradient(120% 120% at 50% 10%, rgba(255, 255, 255, 0.85) 0%, rgba(0, 0, 0, 0.55) 100%);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem 1rem;
  color: #f8fafc;
}

.brand {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: inherit;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}

.nav-link:hover,
.nav-link:focus-visible,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.layout-main {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.layout-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem 1.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
}

.wallpaper-switch {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: inherit;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wallpaper-switch:hover {
  background: rgba(255, 255, 255, 0.28);
}

@media (max-width: 768px) {
  .layout-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .layout-footer {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
}
</style>
