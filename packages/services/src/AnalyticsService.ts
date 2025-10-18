interface AnalyticsEventPayload {
  [key: string]: unknown
}

export class AnalyticsService {
  track(event: string, payload: AnalyticsEventPayload = {}): void {
    if (typeof window === 'undefined') return
    if (window.navigator?.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify({ event, payload, timestamp: Date.now() })], {
          type: 'application/json'
        })
        window.navigator.sendBeacon('/analytics', blob)
        return
      } catch (_) {
        // fallback to console
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[Analytics]', event, payload)
    }
  }
}
