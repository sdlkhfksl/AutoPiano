import type { RecordingResult } from './types'

const STORAGE_KEY = 'autopiano::recordings'

export class StorageService {
  loadRecordings(): RecordingResult[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed as RecordingResult[]
    } catch (_) {
      return []
    }
  }

  saveRecordings(recordings: RecordingResult[]): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings))
    } catch (_) {
      // ignore persistence issues
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (_) {
      // ignore
    }
  }
}
