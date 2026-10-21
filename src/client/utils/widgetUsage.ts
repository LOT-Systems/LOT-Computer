/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage log
 *
 * A local-only, content-free ring buffer of widget events (mount, error,
 * interaction). Records WHAT happened and WHEN — never what the user typed.
 * Persisted to localStorage so it survives reloads; every storage access is
 * guarded. Also builds the military-style SITREP that the /sitrep Log
 * command posts.
 */

export type WidgetEvent = 'mount' | 'error' | 'interact'

export interface WidgetUsageEntry {
  t: number // epoch ms
  w: string // widget name
  e: WidgetEvent
  ms?: number // mount time, for 'mount'
}

export interface WidgetUsageSummary {
  total: number
  widgets: number
  errors: number
  slowest: { name: string; ms: number } | null
  byWidget: Record<string, { mount: number; error: number; interact: number }>
}

const STORAGE_KEY = 'lot-widget-usage-v1'
const MAX_ENTRIES = 500
const PERSIST_DELAY_MS = 2000

let entries: WidgetUsageEntry[] | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

function load(): WidgetUsageEntry[] {
  if (entries) return entries
  entries = []
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    const parsed = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) entries = parsed.slice(-MAX_ENTRIES)
  } catch {
    entries = []
  }
  return entries
}

function schedulePersist() {
  if (persistTimer !== null || typeof window === 'undefined') return
  persistTimer = setTimeout(() => {
    persistTimer = null
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(load()))
    } catch {
      // storage full or blocked — in-memory log still works
    }
  }, PERSIST_DELAY_MS)
}

export function trackWidget(name: string, event: WidgetEvent, ms?: number): void {
  if (typeof window === 'undefined') return
  const list = load()
  const entry: WidgetUsageEntry = { t: Date.now(), w: name, e: event }
  if (ms !== undefined) entry.ms = ms
  list.push(entry)
  if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES)
  schedulePersist()
}

export function getWidgetUsage(): WidgetUsageEntry[] {
  return [...load()]
}

export function summarizeWidgetUsage(sinceMs = 0): WidgetUsageSummary {
  const byWidget: WidgetUsageSummary['byWidget'] = {}
  let errors = 0
  let slowest: WidgetUsageSummary['slowest'] = null
  const list = load().filter((x) => x.t >= sinceMs)
  for (const x of list) {
    const row = (byWidget[x.w] ||= { mount: 0, error: 0, interact: 0 })
    row[x.e]++
    if (x.e === 'error') errors++
    if (x.e === 'mount' && x.ms !== undefined && (!slowest || x.ms > slowest.ms)) {
      slowest = { name: x.w, ms: x.ms }
    }
  }
  return { total: list.length, widgets: Object.keys(byWidget).length, errors, slowest, byWidget }
}

export interface SitrepContext {
  now?: Date
  city?: string | null
  sky?: string | null
  temperatureC?: number | null
  usersOnline?: number
  usersTotal?: number
  connected?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Military-comms status line block. Fixed-width labels, all caps, ends with
 * OUT. Pure — callers pass in the synchronized context (time, weather,
 * users online) so the output is deterministic and testable.
 */
export function buildSitrep(ctx: SitrepContext = {}, sinceMs = Date.now() - 24 * 3600 * 1000): string {
  const now = ctx.now ?? new Date()
  const dtg = `${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}L`
  const s = summarizeWidgetUsage(sinceMs)
  const top = Object.entries(s.byWidget)
    .map(([name, r]) => [name, r.mount + r.interact] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, n]) => `${name.toUpperCase()} x${n}`)
  const wx = [
    ctx.sky ? ctx.sky.toUpperCase() : null,
    typeof ctx.temperatureC === 'number' ? `${Math.round(ctx.temperatureC)}C` : null,
    ctx.city ? ctx.city.toUpperCase() : null,
  ].filter(Boolean)

  return [
    `SITREP          ${dtg}`,
    `LINK            ${ctx.connected === false ? 'OFFLINE' : 'CONNECTED'}`,
    `OPERATORS       ${ctx.usersOnline ?? 0}/${ctx.usersTotal ?? 0} ONLINE`,
    `WX              ${wx.length ? wx.join(' · ') : 'NO DATA'}`,
    `WIDGETS 24H     ${s.widgets} ACTIVE · ${s.total} EVENTS · ${s.errors} FAULTS`,
    s.slowest ? `SLOWEST MOUNT   ${s.slowest.name.toUpperCase()} ${Math.round(s.slowest.ms)}MS` : 'SLOWEST MOUNT   NO DATA',
    `TOP             ${top.length ? top.join(' · ') : 'NONE'}`,
    'STATUS          CLEAN · TRANSPARENT · OUT',
  ].join('\n')
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = { entries: getWidgetUsage, summary: summarizeWidgetUsage }
}
