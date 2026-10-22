/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage ledger — local, bounded, privacy-preserving.
 *
 * Counts mounts / errors / interactions per widget and keeps the slowest
 * mount time seen. Nothing leaves the device; the ledger is the data source
 * for the widget health report (window.__LOT_WIDGET_LEDGER__.snapshot()).
 */

export type WidgetUsageKind = 'mount' | 'error' | 'interact'

interface WidgetUsageEntry {
  mount: number
  error: number
  interact: number
  maxMountMs: number
  lastSeen: number
}

const STORAGE_KEY = 'lot-widget-ledger'
const FLUSH_DELAY_MS = 2000
const MAX_WIDGETS = 120

let ledger: Record<string, WidgetUsageEntry> | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null

function load(): Record<string, WidgetUsageEntry> {
  if (ledger) return ledger
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    ledger = raw ? JSON.parse(raw) : {}
  } catch {
    ledger = {}
  }
  return ledger!
}

function scheduleFlush() {
  if (flushTimer || typeof window === 'undefined') return
  flushTimer = setTimeout(() => {
    flushTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger))
    } catch {
      // storage unavailable — ledger stays in memory for this session
    }
  }, FLUSH_DELAY_MS)
}

export function recordWidgetUsage(name: string, kind: WidgetUsageKind, durationMs = 0): void {
  if (typeof window === 'undefined') return
  const data = load()
  if (!data[name] && Object.keys(data).length >= MAX_WIDGETS) return
  const entry =
    data[name] ?? (data[name] = { mount: 0, error: 0, interact: 0, maxMountMs: 0, lastSeen: 0 })
  entry[kind] += 1
  if (kind === 'mount' && durationMs > entry.maxMountMs) entry.maxMountMs = durationMs
  entry.lastSeen = Date.now()
  scheduleFlush()
}

export function getWidgetLedger(): Record<string, WidgetUsageEntry> {
  return { ...load() }
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_LEDGER__ = { snapshot: getWidgetLedger }
}
