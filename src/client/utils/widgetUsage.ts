/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget Usage Ledger — a tiny, bounded, local-only record of how each
 * widget behaves on this device: mounts, crashes, retries, mount cost, last
 * seen. Fed by WidgetErrorBoundary, so every wrapped widget is covered
 * without touching the widgets themselves. No network, no PII, no content —
 * names and counters only. Writes are coalesced to one per second.
 */

const STORAGE_KEY = 'lot-widget-usage-v1'
const MAX_WIDGETS = 80

export interface WidgetUsageEntry {
  mounts: number
  crashes: number
  retries: number
  lastMountMs: number
  maxMountMs: number
  firstSeen: number
  lastSeen: number
}

type Ledger = Record<string, WidgetUsageEntry>

let ledger: Ledger | null = null
let writeTimer: ReturnType<typeof setTimeout> | null = null

function load(): Ledger {
  if (ledger) return ledger
  ledger = {}
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') ledger = parsed
    }
  } catch {
    // corrupt or unavailable storage — start clean
  }
  if (typeof window !== 'undefined') {
    ;(window as any).__LOT_WIDGET_USAGE__ = ledger
  }
  return ledger!
}

function schedulePersist() {
  if (writeTimer || typeof window === 'undefined') return
  writeTimer = setTimeout(() => {
    writeTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger))
    } catch {
      // quota / private mode — usage log is best-effort
    }
  }, 1000)
}

function entry(name: string): WidgetUsageEntry {
  const l = load()
  if (!l[name]) {
    // Bound the ledger: evict the least recently seen widget
    const keys = Object.keys(l)
    if (keys.length >= MAX_WIDGETS) {
      const oldest = keys.sort((a, b) => l[a].lastSeen - l[b].lastSeen)[0]
      delete l[oldest]
    }
    const now = Date.now()
    l[name] = { mounts: 0, crashes: 0, retries: 0, lastMountMs: 0, maxMountMs: 0, firstSeen: now, lastSeen: now }
  }
  return l[name]
}

export function recordWidgetMount(name: string, mountMs: number) {
  const e = entry(name)
  e.mounts += 1
  e.lastMountMs = mountMs
  e.maxMountMs = Math.max(e.maxMountMs, mountMs)
  e.lastSeen = Date.now()
  schedulePersist()
}

export function recordWidgetCrash(name: string) {
  const e = entry(name)
  e.crashes += 1
  e.lastSeen = Date.now()
  schedulePersist()
}

export function recordWidgetRetry(name: string) {
  const e = entry(name)
  e.retries += 1
  e.lastSeen = Date.now()
  schedulePersist()
}

export function getWidgetUsage(): Ledger {
  return { ...load() }
}
