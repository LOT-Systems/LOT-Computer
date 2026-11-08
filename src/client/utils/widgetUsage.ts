/**
 * LOT SYSTEMS CORPORATION
 * Widget usage log — local, privacy-preserving ring buffer.
 * Records mount / error / retry / visible-time per widget. Never leaves the
 * device unless a caller explicitly reads it (window.__LOT_WIDGET_USAGE__).
 */

const STORAGE_KEY = 'lot-widget-usage-v1'
const MAX_EVENTS = 200
const SAVE_DEBOUNCE_MS = 2000

export type WidgetEventType = 'mount' | 'error' | 'retry' | 'unmount'

export interface WidgetEvent {
  w: string
  t: WidgetEventType
  ts: number
  ms?: number
}

export interface WidgetUsageTotals {
  mounts: number
  errors: number
  retries: number
  visibleMs: number
  lastSeen: number
  lastMountMs?: number
}

interface Store {
  totals: Record<string, WidgetUsageTotals>
  events: WidgetEvent[]
}

let store: Store | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

function load(): Store {
  if (store) return store
  store = { totals: {}, events: [] }
  if (typeof window === 'undefined') return store
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.totals && Array.isArray(parsed.events)) {
        store = parsed
      }
    }
  } catch { /* corrupt or blocked storage — start fresh */ }
  return store!
}

function scheduleSave() {
  if (typeof window === 'undefined' || saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch { /* quota / private mode — non-critical */ }
  }, SAVE_DEBOUNCE_MS)
}

export function recordWidgetEvent(widget: string, type: WidgetEventType, ms?: number): void {
  const s = load()
  const now = Date.now()
  const t = (s.totals[widget] ||= { mounts: 0, errors: 0, retries: 0, visibleMs: 0, lastSeen: now })
  t.lastSeen = now
  if (type === 'mount') { t.mounts++; if (ms !== undefined) t.lastMountMs = ms }
  else if (type === 'error') t.errors++
  else if (type === 'retry') t.retries++
  else if (type === 'unmount' && ms !== undefined) t.visibleMs += ms
  s.events.push({ w: widget, t: type, ts: now, ...(ms !== undefined ? { ms } : {}) })
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS)
  scheduleSave()
}

export function getWidgetUsage(): Store {
  const s = load()
  return { totals: { ...s.totals }, events: [...s.events] }
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = { get: getWidgetUsage }
}
