type Timer = number

export class EventScheduler {
  private readonly timers = new Set<Timer>()

  schedule(delayMs: number, callback: () => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const timer = window.setTimeout(() => {
      this.timers.delete(timer)
      callback()
    }, delayMs)

    this.timers.add(timer)
    return () => {
      window.clearTimeout(timer)
      this.timers.delete(timer)
    }
  }

  trackTimer(timer: number): void {
    this.timers.add(timer)
  }

  clear(timer: Timer): void {
    if (typeof window === 'undefined') return
    window.clearTimeout(timer)
    this.timers.delete(timer)
  }

  dispose(): void {
    if (typeof window === 'undefined') return
    this.timers.forEach((timer) => window.clearTimeout(timer))
    this.timers.clear()
  }
}
