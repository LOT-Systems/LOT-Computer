/**
 * LOT SYSTEMS CORPORATION
 * Lightweight INP & interaction latency observer.
 * Production-safe — logs only interactions that exceed a frame budget.
 */

const INP_THRESHOLD_MS = 200
const LONG_FRAME_MS = 50

interface InteractionEntry {
  name: string
  duration: number
  target: string
  timestamp: number
}

const interactions: InteractionEntry[] = []

export function initPerfObserver(): void {
  if (typeof window === 'undefined') return
  if (typeof PerformanceObserver === 'undefined') return

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as any
        const duration = e.duration ?? 0
        if (duration > LONG_FRAME_MS) {
          const target = e.target?.tagName ?? e.name ?? 'unknown'
          const record: InteractionEntry = {
            name: e.name || e.entryType,
            duration: Math.round(duration),
            target,
            timestamp: Date.now(),
          }
          interactions.push(record)
          if (interactions.length > 50) interactions.shift()

          if (duration > INP_THRESHOLD_MS) {
            console.warn(
              `[Perf] Slow interaction: ${record.target} ${record.name} took ${record.duration}ms`
            )
          }
        }
      }
    })

    observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any)
  } catch {
    // PerformanceObserver 'event' type not supported in this browser
  }

  try {
    const loafObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > LONG_FRAME_MS) {
          console.warn(
            `[Perf] Long animation frame: ${Math.round(entry.duration)}ms`
          )
        }
      }
    })
    loafObserver.observe({ type: 'long-animation-frame', buffered: false } as any)
  } catch {
    // LoAF not supported
  }
}

export function getPerfEntries(): InteractionEntry[] {
  return [...interactions]
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_PERF__ = { getEntries: getPerfEntries }
}
