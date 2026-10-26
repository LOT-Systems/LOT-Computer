/**
 * LOT SYSTEMS CORPORATION
 * Widget usage log — one compact, local, 14-day record of what mounted,
 * how fast, and what failed. Read by the nightly widget-health scan
 * (docs/diagnostics/WIDGET-HEALTH-*.md) via window.__LOT_WIDGET_USAGE__.
 * Nothing leaves the device from here.
 */

const KEY = 'widget-usage-v1'
const RETENTION_DAYS = 14
const SLOW_MOUNT_MS = 50

export interface WidgetUsageDay {
  mounts: number
  errors: number
  retries: number
  slowMounts: number
  mountMsTotal: number
  mountMsMax: number
}

type UsageStore = Record<string, Record<string, WidgetUsageDay>> // widget -> yyyy-mm-dd -> day

let store: UsageStore | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function load(): UsageStore {
  if (store) return store
  try {
    store = JSON.parse(localStorage.getItem(KEY) || '{}') as UsageStore
  } catch {
    store = {}
  }
  return store
}

function prune(s: UsageStore) {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 864e5).toISOString().slice(0, 10)
  for (const w of Object.keys(s)) {
    for (const d of Object.keys(s[w])) if (d < cutoff) delete s[w][d]
    if (!Object.keys(s[w]).length) delete s[w]
  }
}

// Coalesced write — a burst of mounts costs one stringify, off the render path.
function schedulePersist() {
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = null
    try {
      const s = load()
      prune(s)
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      // storage full or blocked — usage log is best-effort
    }
  }, 2000)
}

function day(widget: string): WidgetUsageDay {
  const s = load()
  const d = (s[widget] ||= {})
  return (d[today()] ||= {
    mounts: 0,
    errors: 0,
    retries: 0,
    slowMounts: 0,
    mountMsTotal: 0,
    mountMsMax: 0,
  })
}

export function recordWidgetMount(widget: string, ms: number) {
  if (typeof window === 'undefined') return
  const d = day(widget)
  d.mounts++
  d.mountMsTotal += ms
  d.mountMsMax = Math.max(d.mountMsMax, ms)
  if (ms > SLOW_MOUNT_MS) d.slowMounts++
  schedulePersist()
}

export function recordWidgetError(widget: string) {
  if (typeof window === 'undefined') return
  day(widget).errors++
  schedulePersist()
}

export function recordWidgetRetry(widget: string) {
  if (typeof window === 'undefined') return
  day(widget).retries++
  schedulePersist()
}

export function getWidgetUsage(): UsageStore {
  return JSON.parse(JSON.stringify(load()))
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = { get: getWidgetUsage }
}
