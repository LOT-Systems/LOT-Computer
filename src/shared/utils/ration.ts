/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT-FM-001 / BASIC RATION MODULE — shared roster helpers.
 * Used by both server (POST /basics/enroll, /basics/stand-down) and
 * client (Basics.tsx status line) so the cadence math never drifts.
 */

import { RationEnrollment, RationState } from '#shared/types'

// First cadence cycle length before ON_STRENGTH reads as STEADY STATE in the
// UI. Purely a display distinction — no state transition is stored for it.
export const ROSTER_CADENCE_DAYS = 30

export const RATION_PRICE_USD = 100

export const emptyRationEnrollment = (): RationEnrollment => ({
  state: 'NONE',
  sizing: null,
  enrolledAt: null,
  standDownAt: null,
  cadenceStart: null,
  issueLog: [],
  stateHistory: [],
})

// Next issue ships the 1st of the month following enrollment.
export const computeCadenceStart = (from: Date): string => {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1))
  return d.toISOString().slice(0, 10)
}

// STEADY STATE is a read-only display label: ON_STRENGTH once the operator
// has cleared one full cadence cycle. Nothing is persisted for it.
export const displayRosterState = (
  enrollment: RationEnrollment | null | undefined
): RationState | 'STEADY_STATE' => {
  if (!enrollment || enrollment.state !== 'ON_STRENGTH') return enrollment?.state ?? 'NONE'
  if (!enrollment.enrolledAt) return 'ON_STRENGTH'
  const days = (Date.now() - new Date(enrollment.enrolledAt).getTime()) / 86400000
  return days >= ROSTER_CADENCE_DAYS ? 'STEADY_STATE' : 'ON_STRENGTH'
}
