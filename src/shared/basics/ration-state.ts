/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 / BASIC ration — UPGRADE state machine (pure, no I/O).
 *
 *   USERSHIP ─UPGRADE→ PENDING ─BILLING_CONFIRMED→ ON_STRENGTH ─FIRST_ISSUE→ STEADY_STATE
 *   PENDING | ON_STRENGTH | STEADY_STATE ─STAND_DOWN→ USERSHIP   (drops ration, keeps AI)
 *
 * PENDING requires BOTH roster intake and confirmed billing; either may arrive first.
 */

export type RationState = 'USERSHIP' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE'

export type RationEvent =
  | 'UPGRADE'
  | 'BILLING_CONFIRMED'
  | 'FIRST_ISSUE'
  | 'STAND_DOWN'

export const RATION_PRICE_USD = 100
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
export type Size = (typeof SIZES)[number]

export interface RosterIntake {
  size: Size
  shipName: string
  shipLine1: string
  shipLine2?: string
  shipCity: string
  shipRegion: string
  shipPostal: string
  shipCountry: string
  /** ISO date (YYYY-MM-DD) of the first issue window */
  cadenceStart: string
}

export interface Roster {
  state: RationState
  intake: RosterIntake | null
  billingConfirmed: boolean
}

const TRANSITIONS: Record<RationState, Partial<Record<RationEvent, RationState>>> = {
  USERSHIP: { UPGRADE: 'PENDING' },
  PENDING: { BILLING_CONFIRMED: 'ON_STRENGTH', STAND_DOWN: 'USERSHIP' },
  ON_STRENGTH: { FIRST_ISSUE: 'STEADY_STATE', STAND_DOWN: 'USERSHIP' },
  STEADY_STATE: { STAND_DOWN: 'USERSHIP' },
}

/** Returns the next state, or null when the event is not valid from `from`. */
export function transition(from: RationState, event: RationEvent): RationState | null {
  return TRANSITIONS[from][event] ?? null
}

/** A roster may go ON STRENGTH only with complete intake AND confirmed billing. */
export function canEnterStrength(r: Roster): boolean {
  return r.state === 'PENDING' && r.billingConfirmed && r.intake !== null
}

export const isOnRation = (s: RationState) => s === 'ON_STRENGTH' || s === 'STEADY_STATE'

const str = (v: unknown, max: number) =>
  typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max

/** Validate untrusted intake. Returns a clean intake or a list of failing fields. */
export function parseIntake(
  raw: any,
  today: Date = new Date()
): { ok: true; intake: RosterIntake } | { ok: false; errors: string[] } {
  const errors: string[] = []
  if (!raw || typeof raw !== 'object') return { ok: false, errors: ['body'] }
  if (!SIZES.includes(raw.size)) errors.push('size')
  if (!str(raw.shipName, 120)) errors.push('shipName')
  if (!str(raw.shipLine1, 200)) errors.push('shipLine1')
  if (raw.shipLine2 != null && raw.shipLine2 !== '' && !str(raw.shipLine2, 200))
    errors.push('shipLine2')
  if (!str(raw.shipCity, 120)) errors.push('shipCity')
  if (!str(raw.shipRegion, 120)) errors.push('shipRegion')
  if (!str(raw.shipPostal, 32)) errors.push('shipPostal')
  if (!str(raw.shipCountry, 2) || raw.shipCountry.trim().length !== 2) errors.push('shipCountry')
  const d = typeof raw.cadenceStart === 'string' ? raw.cadenceStart : ''
  const t = /^\d{4}-\d{2}-\d{2}$/.test(d) ? Date.parse(d + 'T00:00:00Z') : NaN
  const floor = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  if (Number.isNaN(t) || t < floor) errors.push('cadenceStart')
  if (errors.length) return { ok: false, errors }
  return {
    ok: true,
    intake: {
      size: raw.size,
      shipName: raw.shipName.trim(),
      shipLine1: raw.shipLine1.trim(),
      shipLine2: raw.shipLine2 ? String(raw.shipLine2).trim() : undefined,
      shipCity: raw.shipCity.trim(),
      shipRegion: raw.shipRegion.trim(),
      shipPostal: raw.shipPostal.trim(),
      shipCountry: raw.shipCountry.trim().toUpperCase(),
      cadenceStart: d,
    },
  }
}

/** Display label used by the status line. */
export const STATE_LABEL: Record<RationState, string> = {
  USERSHIP: 'USERSHIP / AI',
  PENDING: 'BASIC / PENDING',
  ON_STRENGTH: 'BASIC / ON STRENGTH',
  STEADY_STATE: 'BASIC / STEADY STATE',
}
