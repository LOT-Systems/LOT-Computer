/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage data log — local, content-free, capped.
 * Counts mounts / crashes / retries and mount cost per widget per day.
 * Never stores widget content. Read via getWidgetUsage() or
 * window.__LOT_WIDGET_USAGE__() in the console.
 */

const KEY = 'lot-widget-usage'
const MAX_DAYS = 30

export interface WidgetUsageDay {
  mounts: number
  crashes: number
  retries: number
  mountMsTotal: number
  mountMsMax: number
}

type UsageLog = Record<string, Record<string, WidgetUsageDay>> // widget → day → stats

let cache: UsageLog | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load(): UsageLog {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '{}') as UsageLog
  } catch {
    cache = {}
  }
  return cache
}

function flush() {
  flushTimer = null
  if (!cache) return
  try {
    const cutoff = new Date(Date.now() - MAX_DAYS * 864e5).toISOString().slice(0, 10)
    for (const w of Object.keys(cache)) {
      for (const d of Object.keys(cache[w])) if (d < cutoff) delete cache[w][d]
    }
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // storage unavailable or full — usage log is best-effort
  }
}

function bucket(widget: string): WidgetUsageDay {
  const log = load()
  const day = new Date().toISOString().slice(0, 10)
  const days = (log[widget] ||= {})
  return (days[day] ||= { mounts: 0, crashes: 0, retries: 0, mountMsTotal: 0, mountMsMax: 0 })
}

// Debounced so a page full of widgets mounting costs one storage write.
function schedule() {
  if (flushTimer || typeof window === 'undefined') return
  flushTimer = setTimeout(flush, 2000)
}

export function recordWidgetEvent(
  widget: string,
  event: 'mount' | 'crash' | 'retry',
  mountMs = 0
): void {
  if (typeof window === 'undefined') return
  const b = bucket(widget)
  if (event === 'mount') {
    b.mounts++
    b.mountMsTotal += mountMs
    b.mountMsMax = Math.max(b.mountMsMax, mountMs)
  } else if (event === 'crash') b.crashes++
  else b.retries++
  schedule()
}

export function getWidgetUsage(): UsageLog {
  return JSON.parse(JSON.stringify(load()))
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = getWidgetUsage
}
