/**
 * LOT SYSTEMS CORPORATION
 * Widget usage ledger — local-first data log of widget mounts, interactions
 * and mount latency. Stored in localStorage (bounded), exposed on
 * window.__LOT_WIDGET_USAGE__ for diagnostics. No network, no PII.
 */

const KEY = 'lot-widget-usage-v1'

export interface WidgetUsageRecord {
  mounts: number
  interactions: number
  lastMountMs: number
  maxMountMs: number
  lastSeen: number
}

let ledger: Record<string, WidgetUsageRecord> | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load(): Record<string, WidgetUsageRecord> {
  if (ledger) return ledger
  try {
    ledger = JSON.parse(localStorage.getItem(KEY) || '{}') || {}
  } catch {
    ledger = {}
  }
  return ledger!
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    try {
      localStorage.setItem(KEY, JSON.stringify(ledger))
    } catch {}
  }, 2000)
}

function rec(name: string): WidgetUsageRecord {
  const l = load()
  return (l[name] ||= { mounts: 0, interactions: 0, lastMountMs: 0, maxMountMs: 0, lastSeen: 0 })
}

export function recordWidgetMount(name: string, ms: number): void {
  if (typeof window === 'undefined') return
  const r = rec(name)
  r.mounts++
  r.lastMountMs = ms
  r.maxMountMs = Math.max(r.maxMountMs, ms)
  r.lastSeen = Date.now()
  scheduleFlush()
}

export function recordWidgetInteraction(name: string): void {
  if (typeof window === 'undefined') return
  const r = rec(name)
  r.interactions++
  r.lastSeen = Date.now()
  scheduleFlush()
}

export function getWidgetUsage(): Record<string, WidgetUsageRecord> {
  return { ...load() }
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = { get: getWidgetUsage }
}
