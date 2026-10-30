/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage log — local, per-device record of every widget mount, crash,
 * retry and interaction. Counters persist across sessions; the event ring
 * buffer is capped so it can never grow into a lag source.
 *
 * Read it from the console: window.__LOT_WIDGET_USAGE__.snapshot()
 */

export type WidgetUsageKind = 'mount' | 'crash' | 'retry' | 'interact'

export interface WidgetUsageEvent {
  t: number
  widget: string
  kind: WidgetUsageKind
  ms?: number
}

export interface WidgetUsageCounters {
  mounts: number
  crashes: number
  retries: number
  interactions: number
  lastMountMs: number
  slowMounts: number
  lastSeen: number
}

const STORAGE_KEY = 'lot-widget-usage-v1'
const MAX_EVENTS = 200
const SLOW_MOUNT_MS = 50

interface Store {
  counters: Record<string, WidgetUsageCounters>
  events: WidgetUsageEvent[]
}

let store: Store | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load(): Store {
  if (store) return store
  store = { counters: {}, events: [] }
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        store.counters = parsed.counters || {}
        store.events = Array.isArray(parsed.events) ? parsed.events.slice(-MAX_EVENTS) : []
      }
    }
  } catch {}
  return store
}

// Debounced write — a burst of mounts costs one localStorage write, off the render path.
function scheduleFlush() {
  if (flushTimer || typeof window === 'undefined') return
  flushTimer = setTimeout(() => {
    flushTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(load()))
    } catch {}
  }, 2000)
}

export function recordWidgetUsage(widget: string, kind: WidgetUsageKind, ms?: number) {
  const s = load()
  const now = Date.now()
  const c = (s.counters[widget] ||= {
    mounts: 0,
    crashes: 0,
    retries: 0,
    interactions: 0,
    lastMountMs: 0,
    slowMounts: 0,
    lastSeen: 0,
  })
  c.lastSeen = now
  if (kind === 'mount') {
    c.mounts++
    c.lastMountMs = ms ?? 0
    if ((ms ?? 0) > SLOW_MOUNT_MS) c.slowMounts++
  } else if (kind === 'crash') c.crashes++
  else if (kind === 'retry') c.retries++
  else c.interactions++
  s.events.push({ t: now, widget, kind, ms })
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS)
  scheduleFlush()
}

export function getWidgetUsageSnapshot(): Store {
  const s = load()
  return { counters: { ...s.counters }, events: [...s.events] }
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = { snapshot: getWidgetUsageSnapshot, record: recordWidgetUsage }
}
