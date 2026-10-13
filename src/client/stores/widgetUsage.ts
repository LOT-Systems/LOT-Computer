/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage log — local, privacy-preserving ledger of widget lifecycle events
 * (mount, crash, retry). Never leaves the device; no payloads, only widget name,
 * event, timestamp and mount cost. Ring-buffered so it cannot grow unbounded.
 * Inspect from the console: window.__LOT_WIDGET_LOG__.report()
 */

export type WidgetUsageEvent = 'mount' | 'crash' | 'retry'

export type WidgetUsageEntry = {
  widget: string
  event: WidgetUsageEvent
  t: number
  ms?: number
}

const STORAGE_KEY = 'lot-widget-usage-v1'
const MAX_ENTRIES = 500
const FLUSH_DELAY_MS = 2000

let buffer: WidgetUsageEntry[] | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load(): WidgetUsageEntry[] {
  if (buffer) return buffer
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    const parsed = raw ? JSON.parse(raw) : []
    buffer = Array.isArray(parsed) ? parsed.slice(-MAX_ENTRIES) : []
  } catch {
    buffer = []
  }
  return buffer
}

// Debounced write: widgets mount in a burst, so one write per burst, not per widget.
function scheduleFlush() {
  if (flushTimer || typeof window === 'undefined') return
  flushTimer = setTimeout(() => {
    flushTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(load()))
    } catch {
      // storage full or blocked — the in-memory buffer still works
    }
  }, FLUSH_DELAY_MS)
}

export function recordWidgetUsage(widget: string, event: WidgetUsageEvent, ms?: number) {
  if (typeof window === 'undefined') return
  const entries = load()
  entries.push({ widget, event, t: Date.now(), ...(ms !== undefined ? { ms } : {}) })
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES)
  scheduleFlush()
}

export function getWidgetUsageReport() {
  const byWidget: Record<string, { mounts: number; crashes: number; retries: number; slowestMountMs: number; lastSeen: number }> = {}
  for (const e of load()) {
    const row = (byWidget[e.widget] ||= { mounts: 0, crashes: 0, retries: 0, slowestMountMs: 0, lastSeen: 0 })
    if (e.event === 'mount') {
      row.mounts++
      row.slowestMountMs = Math.max(row.slowestMountMs, e.ms ?? 0)
    } else if (e.event === 'crash') row.crashes++
    else row.retries++
    row.lastSeen = Math.max(row.lastSeen, e.t)
  }
  return { entries: load().length, byWidget }
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_LOG__ = {
    entries: () => load().slice(),
    report: getWidgetUsageReport,
    clear: () => {
      buffer = []
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    },
  }
}
