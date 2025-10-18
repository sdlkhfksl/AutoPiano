import { defineStore } from 'pinia'
import { Wallpaper } from '@autopiano/config'

export const useWallpaperStore = defineStore('wallpaper', {
  state: () => ({
    options: Wallpaper,
    current: Wallpaper[0] ?? ''
  }),
  actions: {
    setWallpaper(path: string) {
      if (this.options.includes(path)) {
        this.current = path
      }
    },
    cycle() {
      if (!this.options.length) return
      const index = this.options.findIndex((item) => item === this.current)
      const nextIndex = (index + 1) % this.options.length
      this.current = this.options[nextIndex]
    }
  }
})
