/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage telemetry — local-only, no network.
 * Per-widget counters (mounts, errors, retries, interactions, mount latency)
 * persisted to localStorage so the operator can audit widget health.
 * Console: window.__LOT_WIDGET_LOG__.summary()
 */

const STORAGE_KEY = 'lot_widget_usage_v1'
const MAX_WIDGETS = 80
const SLOW_MOUNT_MS = 50

export type WidgetEventKind = 'mount' | 'error' | 'retry' | 'interact'

export interface WidgetUsage {
  mounts: number
  errors: number
  retries: number
  interactions: number
  lastMountMs: number
  maxMountMs: number
  slowMounts: number
  lastSeen: number
}

let usage: Record<string, WidgetUsage> | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

function load(): Record<string, WidgetUsage> {
  if (usage) return usage
  usage = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') usage = parsed
    }
  } catch {
    // storage unavailable or corrupt — start clean
  }
  return usage!
}

function schedulePersist() {
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
    } catch {
      // quota or private mode — in-memory counters still work
    }
  }, 2000)
}

export function recordWidgetEvent(
  name: string,
  kind: WidgetEventKind,
  durationMs = 0
): void {
  if (typeof window === 'undefined') return
  const all = load()
  let u = all[name]
  if (!u) {
    if (Object.keys(all).length >= MAX_WIDGETS) return
    u = all[name] = {
      mounts: 0,
      errors: 0,
      retries: 0,
      interactions: 0,
      lastMountMs: 0,
      maxMountMs: 0,
      slowMounts: 0,
      lastSeen: 0,
    }
  }
  if (kind === 'mount') {
    u.mounts++
    u.lastMountMs = durationMs
    if (durationMs > u.maxMountMs) u.maxMountMs = durationMs
    if (durationMs > SLOW_MOUNT_MS) u.slowMounts++
  } else if (kind === 'error') u.errors++
  else if (kind === 'retry') u.retries++
  else u.interactions++
  u.lastSeen = Date.now()
  schedulePersist()
}

export function getWidgetUsage(): Record<string, WidgetUsage> {
  return { ...load() }
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_LOG__ = {
    usage: getWidgetUsage,
    summary: () => console.table(getWidgetUsage()),
  }
}
