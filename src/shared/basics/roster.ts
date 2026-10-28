/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT-FM-001 / BASIC RATION MODULE
 * SECTION 3 — UPGRADE STATE MACHINE + ROSTER (pure; shared client/server)
 */

// USERSHIP/AI -> PENDING -> ON STRENGTH -> STEADY STATE. STAND DOWN returns to USERSHIP/AI.
export type RationState = 'USERSHIP' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE'
export type RationEvent = 'ENLIST' | 'CONFIRM' | 'FIRST_ISSUE_DELIVERED' | 'STAND_DOWN'

export const RATION_PRICE_CENTS = 10000
export const COGS_CEILING_CENTS = 4000
export const MARGIN_FLOOR = 0.6

export const STATE_LABEL: Record<RationState, string> = {
  USERSHIP: 'USERSHIP / AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
}

const TRANSITIONS: Record<RationState, Partial<Record<RationEvent, RationState>>> = {
  USERSHIP: { ENLIST: 'PENDING' },
  PENDING: { CONFIRM: 'ON_STRENGTH', STAND_DOWN: 'USERSHIP' },
  ON_STRENGTH: { FIRST_ISSUE_DELIVERED: 'STEADY_STATE', STAND_DOWN: 'USERSHIP' },
  STEADY_STATE: { STAND_DOWN: 'USERSHIP' },
}

export const transition = (state: RationState, event: RationEvent): RationState | null =>
  TRANSITIONS[state][event] ?? null

export type Sizing = 'S' | 'M' | 'L' | 'XL'
export const SIZINGS: Sizing[] = ['S', 'M', 'L', 'XL']

export type Shipping = {
  name: string
  line1: string
  line2: string
  city: string
  region: string
  postal: string
  country: string
}

export type Roster = {
  sizing: Sizing
  shipping: Shipping
  cadenceDay: number // day of month 1–28 the issue is cut
}

export type IssueLogKind = 'STATE' | 'BILL' | 'ISSUE'
export type IssueLogEntry = {
  seq: number // append-only, 1-based
  at: string // ISO
  kind: IssueLogKind
  text: string
}

export type BasicRecord = {
  state: RationState
  roster: Roster | null
  nextIssue: string | null // ISO date (UTC midnight)
  log: IssueLogEntry[]
}

export const EMPTY_BASIC: BasicRecord = { state: 'USERSHIP', roster: null, nextIssue: null, log: [] }

export type RosterErrors = Partial<Record<keyof Shipping | 'sizing' | 'cadenceDay', string>>

export const validateRoster = (r: Partial<Roster> | null | undefined): RosterErrors => {
  const e: RosterErrors = {}
  const s = r?.shipping
  const req = (k: keyof Shipping) => {
    if (!s || typeof s[k] !== 'string' || !s[k].trim()) e[k] = 'REQUIRED'
    else if (s[k].length > 120) e[k] = 'TOO LONG'
  }
  ;(['name', 'line1', 'city', 'region', 'postal', 'country'] as const).forEach(req)
  if (s?.line2 && s.line2.length > 120) e.line2 = 'TOO LONG'
  if (!r?.sizing || !SIZINGS.includes(r.sizing)) e.sizing = 'INVALID'
  const d = r?.cadenceDay
  if (typeof d !== 'number' || !Number.isInteger(d) || d < 1 || d > 28) e.cadenceDay = '1–28'
  return e
}

export const normalizeRoster = (r: Roster): Roster => ({
  sizing: r.sizing,
  cadenceDay: r.cadenceDay,
  shipping: {
    name: r.shipping.name.trim(),
    line1: r.shipping.line1.trim(),
    line2: (r.shipping.line2 ?? '').trim(),
    city: r.shipping.city.trim(),
    region: r.shipping.region.trim(),
    postal: r.shipping.postal.trim(),
    country: r.shipping.country.trim().toUpperCase(),
  },
})

const MS_DAY = 86_400_000
const startOfUtcDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

/** First cadence day strictly after `from` (UTC). Day capped 1–28 so every month has it. */
export const nextIssueDate = (cadenceDay: number, from: Date): Date => {
  const y = from.getUTCFullYear()
  const m = from.getUTCMonth()
  const thisMonth = Date.UTC(y, m, cadenceDay)
  return new Date(thisMonth > startOfUtcDay(from) ? thisMonth : Date.UTC(y, m + 1, cadenceDay))
}

export const daysUntil = (iso: string, now: Date): number =>
  Math.round((Date.parse(iso) - startOfUtcDay(now)) / MS_DAY)

/** Gross margin at a landed COGS (cents). */
export const marginAt = (cogsCents: number, priceCents = RATION_PRICE_CENTS): number =>
  (priceCents - cogsCents) / priceCents

export const usd = (cents: number) => `USD ${(cents / 100).toFixed(2)}`

export type BasicsView = {
  state: RationState
  roster: Roster | null
  nextIssue: string | null
  log: IssueLogEntry[]
}
