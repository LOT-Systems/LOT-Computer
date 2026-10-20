/**
 * Widget usage data log.
 * Ring buffer of widget lifecycle events (mount / crash / retry) kept in
 * localStorage and exposed at window.__LOT_WIDGET_USAGE__ for diagnostics.
 * Local-only: nothing is sent to the server.
 */

export type WidgetUsageEvent = 'mount' | 'crash' | 'retry'

export interface WidgetUsageEntry {
  t: number
  widget: string
  event: WidgetUsageEvent
  ms?: number
}

const KEY = 'lot-widget-usage-v1'
const MAX_ENTRIES = 200

let buffer: WidgetUsageEntry[] | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load(): WidgetUsageEntry[] {
  if (buffer) return buffer
  try {
    const raw = localStorage.getItem(KEY)
    buffer = raw ? (JSON.parse(raw) as WidgetUsageEntry[]) : []
  } catch (_) {
    buffer = []
  }
  return buffer
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    try {
      localStorage.setItem(KEY, JSON.stringify(buffer || []))
    } catch (_) {}
  }, 2000)
}

export function recordWidgetUsage(
  widget: string,
  event: WidgetUsageEvent,
  ms?: number
) {
  if (typeof window === 'undefined') return
  const buf = load()
  buf.push({ t: Date.now(), widget, event, ...(ms != null ? { ms } : {}) })
  if (buf.length > MAX_ENTRIES) buf.splice(0, buf.length - MAX_ENTRIES)
  scheduleFlush()
}

export interface WidgetUsageSummary {
  widget: string
  mounts: number
  crashes: number
  retries: number
  avgMountMs: number
  maxMountMs: number
}

export function getWidgetUsageSummary(): WidgetUsageSummary[] {
  const by: Record<string, WidgetUsageSummary & { sum: number }> = {}
  for (const e of load()) {
    const s = (by[e.widget] ||= {
      widget: e.widget,
      mounts: 0,
      crashes: 0,
      retries: 0,
      avgMountMs: 0,
      maxMountMs: 0,
      sum: 0,
    })
    if (e.event === 'mount') {
      s.mounts++
      s.sum += e.ms || 0
      s.maxMountMs = Math.max(s.maxMountMs, e.ms || 0)
    } else if (e.event === 'crash') s.crashes++
    else s.retries++
  }
  return Object.values(by)
    .map(({ sum, ...s }) => ({
      ...s,
      avgMountMs: s.mounts ? Math.round((sum / s.mounts) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.maxMountMs - a.maxMountMs)
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = () => ({
    entries: load().slice(),
    summary: getWidgetUsageSummary(),
  })
}
