export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function now(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function ensurePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}
