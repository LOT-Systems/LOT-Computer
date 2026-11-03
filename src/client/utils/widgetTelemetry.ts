/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * Widget Telemetry — the usage ledger for every WidgetErrorBoundary on the
 * System tab. Records, per boundary and per day: mounts, first-view, taps,
 * crashes, and mount cost (ms). Kept in a small bounded localStorage ledger
 * and flushed to the Log at most once per 24h as a `widget_usage_report`
 * event (military SITREP style: instrument readings only, no narration).
 *
 * Design rules:
 *  - Never throw. Telemetry must not be able to break a widget.
 *  - Never network on interaction. Writes are in-memory + a debounced
 *    localStorage write; the only network call is the daily flush.
 *  - Bounded: LEDGER_DAYS days × MAX_WIDGETS boundaries.
 */

import dayjs from 'dayjs'

const LEDGER_KEY = 'lot-widget-usage-v1'
const REPORT_KEY = 'lot-widget-report-at'
const LEDGER_DAYS = 30
const MAX_WIDGETS = 80
const REPORT_INTERVAL_MS = 24 * 60 * 60 * 1000
/** A mount slower than this is counted as a "slow mount" in the report. */
export const SLOW_MOUNT_MS = 50

export type WidgetDayStats = {
  /** mounts (boundary componentDidMount) */
  m: number
  /** boundary had visible DOM and entered the viewport */
  v: number
  /** boundary mounted but rendered nothing (dormant / gated widget) */
  d: number
  /** taps / clicks inside the boundary */
  i: number
  /** render crashes caught by the boundary */
  e: number
  /** total mount ms (avg = t / m) */
  t: number
  /** slowest mount ms */
  x: number
}

type Ledger = Record<string, Record<string, WidgetDayStats>> // day → name → stats

let ledger: Ledger | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

const today = () => dayjs().format('YYYY-MM-DD')

function load(): Ledger {
  if (ledger) return ledger
  ledger = {}
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LEDGER_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') ledger = parsed
    }
  } catch {
    ledger = {}
  }
  return ledger!
}

function persistSoon() {
  if (persistTimer || typeof window === 'undefined') return
  persistTimer = setTimeout(() => {
    persistTimer = null
    persistNow()
  }, 5000)
}

function persistNow() {
  try {
    const l = load()
    // prune old days
    const cutoff = dayjs().subtract(LEDGER_DAYS, 'day').format('YYYY-MM-DD')
    for (const day of Object.keys(l)) if (day < cutoff) delete l[day]
    localStorage.setItem(LEDGER_KEY, JSON.stringify(l))
  } catch {
    // storage full / private mode — telemetry is best-effort
  }
}

function bucket(name: string): WidgetDayStats | null {
  const l = load()
  const day = (l[today()] ||= {})
  if (!day[name]) {
    if (Object.keys(day).length >= MAX_WIDGETS) return null
    day[name] = { m: 0, v: 0, d: 0, i: 0, e: 0, t: 0, x: 0 }
  }
  return day[name]
}

export type WidgetEventKind = 'mount' | 'view' | 'dormant' | 'interact' | 'error'

export function recordWidgetEvent(name: string, kind: WidgetEventKind, value = 0): void {
  try {
    const b = bucket(name)
    if (!b) return
    switch (kind) {
      case 'mount':
        b.m += 1
        b.t += value
        if (value > b.x) b.x = value
        break
      case 'view':
        b.v += 1
        break
      case 'dormant':
        b.d += 1
        break
      case 'interact':
        b.i += 1
        break
      case 'error':
        b.e += 1
        break
    }
    persistSoon()
  } catch {
    /* never throw */
  }
}

/** Snapshot of the ledger for a day (default today). Read-only copy. */
export function getWidgetUsage(day: string = today()): Record<string, WidgetDayStats> {
  return JSON.parse(JSON.stringify(load()[day] || {}))
}

export type WidgetUsageSummary = {
  day: string
  widgets: number
  touched: number
  faults: number
  slow: number
  views: number
  taps: number
  top: Array<{ name: string; taps: number; views: number }>
  slowest: Array<{ name: string; ms: number }>
  faulted: string[]
}

export function summarizeWidgetUsage(day: string = today()): WidgetUsageSummary {
  const u = load()[day] || {}
  const names = Object.keys(u)
  const touched = names.filter((n) => u[n].i > 0)
  return {
    day,
    widgets: names.length,
    touched: touched.length,
    faults: names.reduce((a, n) => a + u[n].e, 0),
    slow: names.filter((n) => u[n].x > SLOW_MOUNT_MS).length,
    views: names.reduce((a, n) => a + u[n].v, 0),
    taps: names.reduce((a, n) => a + u[n].i, 0),
    top: names
      .filter((n) => u[n].i > 0)
      .sort((a, b) => u[b].i - u[a].i)
      .slice(0, 5)
      .map((n) => ({ name: n, taps: u[n].i, views: u[n].v })),
    slowest: names
      .sort((a, b) => u[b].x - u[a].x)
      .slice(0, 3)
      .filter((n) => u[n].x > 0)
      .map((n) => ({ name: n, ms: Math.round(u[n].x) })),
    faulted: names.filter((n) => u[n].e > 0),
  }
}

/** Zulu time stamp, military style: 031542Z NOV 26 */
function zulu(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getUTCMonth()]
  return `${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z ${mon} ${String(d.getUTCFullYear()).slice(2)}`
}

export type SitrepContext = {
  /** Synchronized environment: pass whatever the widget has on hand */
  weather?: { description?: string; temperature?: number } | null
  usersOnline?: number
  source?: string
}

/**
 * Build a one-line military SITREP that synchronizes context (time, weather,
 * users online) with a widget event. Instrument readings only.
 */
export function buildSitrep(ctx: SitrepContext = {}): string {
  const parts = [`SITREP ${zulu()}`]
  if (ctx.source) parts.push(ctx.source.toUpperCase())
  if (ctx.weather?.description) parts.push(`WX ${ctx.weather.description.toUpperCase()}`)
  if (typeof ctx.weather?.temperature === 'number') parts.push(`${Math.round(ctx.weather.temperature)}C`)
  if (typeof ctx.usersOnline === 'number') parts.push(`ONLINE ${ctx.usersOnline}`)
  return parts.join(' · ')
}

/**
 * Flush the usage ledger to the Log at most once per 24h. `post` is injected
 * (axios.post in the app) so this module stays dependency-free and testable.
 * Reports the previous full day when it has data, else today so far.
 */
export async function flushWidgetUsageReport(
  post: (body: { text: string; event: string; metadata: Record<string, any> }) => Promise<unknown>,
  ctx: SitrepContext = {}
): Promise<boolean> {
  try {
    if (typeof localStorage === 'undefined') return false
    const last = Number(localStorage.getItem(REPORT_KEY) || 0)
    if (Date.now() - last < REPORT_INTERVAL_MS) return false

    persistNow()
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    const day = Object.keys(load()[yesterday] || {}).length ? yesterday : today()
    const s = summarizeWidgetUsage(day)
    if (!s.widgets) return false

    // Claim the slot BEFORE the network call so two tabs don't double-post.
    localStorage.setItem(REPORT_KEY, String(Date.now()))

    const text =
      `WGT-RPT ${s.day} · ${s.widgets} UP · ${s.faults} FAULT · ${s.slow} SLOW · ${s.taps} TAP`
    await post({
      text,
      event: 'widget_usage_report',
      metadata: {
        ...s,
        sitrep: buildSitrep({ ...ctx, source: ctx.source || 'widget-report' }),
        usage: getWidgetUsage(day),
      },
    })
    return true
  } catch {
    return false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => persistNow())
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) persistNow()
  })
  ;(window as any).__LOT_WIDGET_USAGE__ = () => summarizeWidgetUsage()
}
