/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 Node 6 (prep) — Memory prompt surface.
 *
 * Pure decision + shaping logic. No DB, no network, no env reads inside the
 * functions (the flag is passed in), so the smoke test exercises exactly what
 * the route runs.
 *
 * Gate order, all must pass before the voice touches a Memory question:
 *   1. server flag QI46_SURFACE_MEMORY === 'on'   (default: off)
 *   2. explicit consent (metadata.qi46.consent === true)
 *   3. enough signal to calibrate (≥ QI46_MIN_SIGNALS)
 *   4. risk below 'elevated' — an elevated person gets the standard path,
 *      never a voice experiment
 *   5. language covered (F12) — if any field is in a language the ideation
 *      scan cannot read, risk is unknown, so the standard path is used
 * After generation, COSMO® screens question + options. HELD → the caller
 * falls back to the uncalibrated prompt. Every screened question yields an
 * audit row with source 'surface' (labels only, never text).
 */

import type { Log } from '#shared/types'
import {
  assembleQi46,
  cosmoScreen,
  hasQi46Consent,
  toCosmoAuditRow,
  type BeingVector,
  type CalibrationProfile,
  type CosmoAuditRow,
  type CosmoVerdict,
} from './qi46.js'

export const QI46_MIN_SIGNALS = 5

export type Qi46SurfaceSkip =
  | 'flag-off'
  | 'no-consent'
  | 'low-signal'
  | 'elevated-risk'
  | 'uncovered-language'

export type Qi46SurfacePlan =
  | { active: false; skip: Qi46SurfaceSkip }
  | { active: true; vector: BeingVector; calibration: CalibrationProfile; prelude: string }

/** Read the server flag. Only the exact string 'on' enables the surface. */
export function qi46SurfaceFlag(env: Record<string, string | undefined> = process.env): boolean {
  return env.QI46_SURFACE_MEMORY === 'on'
}

/** Decide whether QI·46 shapes this Memory question, and build the prelude if so. */
export function planQi46MemorySurface(
  user: { metadata?: Record<string, any> | null },
  logs: Log[],
  flagOn: boolean
): Qi46SurfacePlan {
  if (!flagOn) return { active: false, skip: 'flag-off' }
  const consent = hasQi46Consent(user)
  if (!consent) return { active: false, skip: 'no-consent' }
  const { vector, calibration, systemPrompt } = assembleQi46(logs, consent)
  if (vector.signalCount < QI46_MIN_SIGNALS) return { active: false, skip: 'low-signal' }
  if (vector.riskLevel === 'elevated') return { active: false, skip: 'elevated-risk' }
  if (vector.riskSignals.includes('language:uncovered')) return { active: false, skip: 'uncovered-language' }
  const prelude = [
    systemPrompt,
    'Apply this voice only to the tone of one Memory question and its answer options.',
    'Keep it a self-care question. Do not mention the voice, the registers, or this person’s state.',
    '',
  ].join('\n')
  return { active: true, vector, calibration, prelude }
}

/** Screen a generated Memory question (question + options) with COSMO®. */
export function screenQi46MemoryQuestion(
  q: { question: string; options?: string[] },
  plan: Extract<Qi46SurfacePlan, { active: true }>
): { verdict: CosmoVerdict; row: CosmoAuditRow } {
  const text = [q.question, ...(q.options || [])].join('\n')
  const verdict = cosmoScreen(text, plan.vector)
  return { verdict, row: toCosmoAuditRow(verdict, plan.vector, plan.calibration, 'surface') }
}
