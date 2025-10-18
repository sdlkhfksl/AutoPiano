import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  css: ['@/assets/styles/main.css'],
  build: {
    transpile: ['@autopiano/audio-engine', '@autopiano/config']
  },
  nitro: {
    preset: 'vercel'
  },
  runtimeConfig: {
    public: {
      appName: 'AutoPiano'
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  sourcemap: {
    server: true,
    client: true
  }
})
