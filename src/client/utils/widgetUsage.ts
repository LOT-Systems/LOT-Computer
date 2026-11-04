/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage log — client-side, local-only, bounded.
 *
 * Records mount / error / interact events per widget into a ring buffer
 * (max 300 events) persisted to localStorage. Nothing leaves the device;
 * server-side persistence is a separate, privacy-reviewed step.
 * Every storage access is guarded: private windows / blocked storage
 * degrade to in-memory only.
 */

export type WidgetEventType = 'mount' | 'error' | 'interact'

export interface WidgetEvent {
  w: string // widget name
  t: WidgetEventType
  at: number // epoch ms
  ms?: number // mount duration
}

const KEY = 'lot-widget-usage-v1'
const MAX_EVENTS = 300
const FLUSH_DELAY_MS = 1500

let events: WidgetEvent[] = []
let loaded = false
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load() {
  if (loaded) return
  loaded = true
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) events = parsed.slice(-MAX_EVENTS)
  } catch {
    events = []
  }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    try {
      localStorage.setItem(KEY, JSON.stringify(events))
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, FLUSH_DELAY_MS)
}

export function recordWidgetEvent(w: string, t: WidgetEventType, ms?: number): void {
  if (typeof window === 'undefined') return
  load()
  events.push(ms === undefined ? { w, t, at: Date.now() } : { w, t, at: Date.now(), ms })
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS)
  scheduleFlush()
}

export interface WidgetUsageSummary {
  mounts: number
  errors: number
  interactions: number
  slowestMountMs: number
  lastAt: number
}

export function getWidgetUsage(): Record<string, WidgetUsageSummary> {
  load()
  const out: Record<string, WidgetUsageSummary> = {}
  for (const e of events) {
    const s = (out[e.w] ||= { mounts: 0, errors: 0, interactions: 0, slowestMountMs: 0, lastAt: 0 })
    if (e.t === 'mount') s.mounts++
    else if (e.t === 'error') s.errors++
    else s.interactions++
    if (e.ms && e.ms > s.slowestMountMs) s.slowestMountMs = e.ms
    if (e.at > s.lastAt) s.lastAt = e.at
  }
  return out
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = getWidgetUsage
}
