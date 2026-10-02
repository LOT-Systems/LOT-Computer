/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget usage log + SITREP builder.
 *
 * Every widget mount (via WidgetErrorBoundary) and interaction is counted in
 * a small in-memory ledger. Once per session (on page hide) the ledger is
 * flushed to /api/logs as a hidden `widget_usage` event — hidden because
 * GET /api/logs only returns whitelisted display events. Counts only; no
 * user content ever enters the ledger.
 *
 * buildSitrep() is pure: it turns synchronized context (time, weather, users
 * online, widget ledger) into a terse military-style status line that the
 * Log's /sitrep command posts.
 */

export type WidgetAction = 'mount' | 'error' | 'interact'

export interface WidgetUsageEntry {
  mounts: number
  errors: number
  interactions: number
  mountMs: number // last observed mount time
  lastAt: number
}

const ledger: Record<string, WidgetUsageEntry> = {}
let flushed = false

export function recordWidgetUsage(
  widget: string,
  action: WidgetAction,
  mountMs?: number
): void {
  const e = (ledger[widget] ??= { mounts: 0, errors: 0, interactions: 0, mountMs: 0, lastAt: 0 })
  if (action === 'mount') {
    e.mounts++
    if (mountMs != null) e.mountMs = mountMs
  } else if (action === 'error') e.errors++
  else e.interactions++
  e.lastAt = Date.now()
}

export function getWidgetUsage(): Record<string, WidgetUsageEntry> {
  return JSON.parse(JSON.stringify(ledger))
}

export interface SitrepInput {
  now: Date
  tempC?: number | null
  weather?: string | null
  usersOnline?: number | null
  usage?: Record<string, WidgetUsageEntry>
}

const pad = (n: number) => String(n).padStart(2, '0')

/** DDHHMMZ date-time group, as in military message headers. */
export function dtg(d: Date): string {
  return `${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}Z`
}

export function buildSitrep(input: SitrepInput): string {
  const usage = input.usage ?? {}
  const names = Object.keys(usage)
  const errors = names.reduce((n, k) => n + usage[k].errors, 0)
  const taps = names.reduce((n, k) => n + usage[k].interactions, 0)
  const slow = names.filter(k => usage[k].mountMs > 50).length
  const status = errors > 0 ? 'RED' : slow > 0 ? 'AMBER' : 'GREEN'
  const wx = [
    input.tempC != null ? `${Math.round(input.tempC)}C` : null,
    input.weather ? input.weather.toUpperCase() : null,
  ].filter(Boolean).join(' ') || 'NO DATA'
  return [
    `SITREP ${dtg(input.now)}`,
    `WX      ${wx}`,
    `NET     ${input.usersOnline ?? '?'} ONLINE`,
    `WIDGETS ${names.length} ACTIVE · ${taps} INTERACTIONS · ${errors} FAULTS · ${slow} SLOW`,
    `STATUS  ${status}`,
  ].join('\n')
}

/** Best-effort one-shot flush of the ledger as a hidden log event. */
export function flushWidgetUsage(): void {
  if (flushed || typeof fetch === 'undefined') return
  const names = Object.keys(ledger)
  if (names.length === 0) return
  flushed = true
  try {
    fetch('/api/logs', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `widget usage: ${names.length} widgets`,
        event: 'widget_usage',
        metadata: { widgets: ledger, at: Date.now() },
      }),
    }).catch(() => { flushed = false })
  } catch {
    flushed = false
  }
}

export function initWidgetUsage(): void {
  if (typeof window === 'undefined') return
  ;(window as any).__LOT_WIDGET_USAGE__ = { get: getWidgetUsage }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushWidgetUsage()
  })
}
