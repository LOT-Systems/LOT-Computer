/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 — Node 1 · Being Vector + Humanoid Calibration (Phase 0)
 *
 * Spec: docs/corporate/LOT_QI-46_ENGINE-2.md
 *
 * Pure, deterministic, no network. It reads the signals LOT® already
 * collects (answers, notes, emotional check-ins) through the existing
 * Memory Engine and Energy analyzers, and produces:
 *
 *   1. BeingVector        — "the upload": a compact snapshot of a person
 *   2. CalibrationProfile — weights for the 7 humanoid output registers
 *   3. CosmoVerdict       — COSMO® gate: CLEARED or HELD (+ reason)
 *   4. buildQi46SystemPrompt() — the voice seed for any AIEngine
 *
 * Not wired to any route. Phase 0 = assembly + tests only.
 */

import type { Log } from '#shared/types'
import { extractUserTraits, detectTraumaIndicators } from './memory/trait-extraction.js'
import { analyzeEnergyState } from './energy.js'

export const QI46_VERSION = '0.9.0-f4'

// ─── Output registers ──────────────────────────────────────────────────────

export const QI46_REGISTERS = [
  'grace',       // softness, no judgment, unhurried
  'poetry',      // image, rhythm, metaphor
  'love',        // explicit warmth, affirmation of worth
  'hugs',        // somatic comfort language: breath, warmth, hold
  'beingThere',  // presence, witnessing, "I am here", no fixing
  'beingCool',   // lightness, ease, humor, no drama
  'masculine',   // steady, grounded, protective, few words
] as const

export type Qi46Register = (typeof QI46_REGISTERS)[number]
export type RegisterWeights = Record<Qi46Register, number> // each 0..1

// ─── Being Vector ("the upload") ───────────────────────────────────────────

export interface BeingVector {
  version: string
  consent: boolean
  signalCount: number            // how much of the person we actually heard
  confidence: number             // 0..1 — rises with signalCount
  energy: number                 // 0..100 (Energy analyzer)
  energyTrajectory: 'improving' | 'stable' | 'declining' | 'critical'
  valence: number                // -1..1  journal sentiment balance
  selfAwareness: number          // 0..100
  emotionalRange: number         // 0..100
  growth: 'emerging' | 'developing' | 'deepening' | 'integrated'
  dominantNeeds: string[]        // e.g. rest, connection, meaning
  values: string[]
  connection: 'disconnected' | 'distant' | 'present' | 'deep'
  riskLevel: 'none' | 'low' | 'moderate' | 'elevated'
  riskSignals: string[]          // why: category labels only, never raw text
}

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n))

/**
 * Assemble a BeingVector from a person's logs.
 * `consent` must be an explicit opt-in — without it the vector is empty
 * and every downstream verdict is HELD.
 */
export function buildBeingVector(logs: Log[], consent: boolean): BeingVector {
  const empty: BeingVector = {
    version: QI46_VERSION,
    consent,
    signalCount: 0,
    confidence: 0,
    energy: 70,
    energyTrajectory: 'stable',
    valence: 0,
    selfAwareness: 0,
    emotionalRange: 0,
    growth: 'emerging',
    dominantNeeds: [],
    values: [],
    connection: 'present',
    riskLevel: 'none',
    riskSignals: [],
  }
  if (!consent) return empty

  const signals = logs.filter(
    (l) => l.event === 'answer' || l.event === 'emotional_checkin' || (l.event === 'note' && !!l.text)
  )
  if (signals.length === 0) return empty

  const { psychologicalDepth: d } = extractUserTraits(logs)
  const energy = analyzeEnergyState(logs)
  const trauma = detectTraumaIndicators(logs)
  const risk = qi46Risk(logs, trauma)

  const s = d.journalSentiment
  const total = s.positive + s.neutral + s.challenging
  const journalValence = total > 0 ? (s.positive - s.challenging) / total : null
  // Fallback / blend: emotional check-ins (journal sentiment only reads notes)
  const checkins = energy.recentTransactions.filter((t) => t.activity.startsWith('Felt ') && t.energyCost !== 0)
  const checkinValence = checkins.length
    ? checkins.reduce((a, t) => a + Math.sign(t.energyCost), 0) / checkins.length
    : null
  const valence =
    journalValence !== null && checkinValence !== null
      ? (journalValence + checkinValence) / 2
      : journalValence ?? checkinValence ?? 0

  return {
    ...empty,
    signalCount: signals.length,
    confidence: clamp(signals.length / 60),
    energy: energy.currentLevel,
    energyTrajectory: energy.trajectory,
    valence: clamp(valence, -1, 1),
    selfAwareness: d.selfAwareness,
    emotionalRange: d.emotionalRange,
    growth: d.growthTrajectory,
    dominantNeeds: d.dominantNeeds.slice(0, 3),
    values: d.values.slice(0, 3),
    connection: energy.romanticConnection.connectionQuality,
    riskLevel: risk.level,
    riskSignals: risk.signals,
  }
}

// ─── Node 2 · Risk sensitivity (closes F1) ────────────────────────────────

type RiskLevel = BeingVector['riskLevel']
const RISK_ORDER: RiskLevel[] = ['none', 'low', 'moderate', 'elevated']
const maxRisk = (a: RiskLevel, b: RiskLevel): RiskLevel =>
  RISK_ORDER[Math.max(RISK_ORDER.indexOf(a), RISK_ORDER.indexOf(b))]

// Direct statements of not wanting to be here. Any one of these is enough.
// Matched against normalized text (see normalizeForRisk): lower case, curly
// quotes straightened, "dont" / "do not" folded to "don't", "cant" /
// "cannot" folded to "can't", punctuation and hyphens turned into spaces.
// Node 1–7 list, plus F4 (2026-11-21) additions that close false negatives.
export const QI46_IDEATION = [
  // Node 1–7
  'want to die', 'wanna die', 'wish i was dead', 'wish i were dead', 'kill myself',
  'end my life', 'end it all', 'no reason to live', 'not worth living',
  'better off without me', 'better without me', 'hurt myself', 'self harm',
  'disappear forever', "don't want to be here anymore", "don't want to wake up",
  // F4 additions
  'suicide', 'suicidal', 'kill my self', 'take my own life', 'harm myself', 'cut myself',
  'cutting myself', 'end myself', 'better off dead', 'rather be dead', "don't want to live",
  "don't want to be alive", "don't want to exist", "don't want to be here any more",
  "can't go on", 'no point living', 'no point in living', 'wish i could disappear',
  "wish i didn't wake up", "hope i don't wake up", 'not want to be alive',
]

// A hit whose nearest preceding word (fillers skipped) is one of these reads as negated:
// "I don't want to die", "I no longer want to hurt myself".
const IDEATION_NEGATORS = ["don't", 'never', 'not', 'no longer', "won't", "wouldn't", "didn't", 'used to']

// Words skipped when looking back for a negator ("never really want to end my life").
const IDEATION_FILLER = ['want', 'wanna', 'to', 'ever', 'really', 'would', 'like', 'even', 'i']

/** Lower case, straight quotes, folded contractions, punctuation → space. */
export function normalizeForRisk(raw: string): string {
  return ` ${raw} `
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc`\u00b4]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/ (dont|do not) /g, " don't ")
    .replace(/ (cant|cannot|can not) /g, " can't ")
    .replace(/ (didnt|did not) /g, " didn't ")
    .replace(/ (wont|will not) /g, " won't ")
}

/**
 * F4 · Ideation scan. Returns `hit` if any phrase appears, and `negatedOnly`
 * when every appearance is preceded by a negator. Negation is a LABEL, never
 * a downgrade: a person who writes "I don't want to die" is still treated as
 * elevated. Any doubt resolves to elevated.
 */
export function scanIdeation(texts: string[]): { hit: boolean; negatedOnly: boolean } {
  let hits = 0
  let negated = 0
  // Clauses are scanned one by one, so "I'm not okay, I want to die" is not read as negated.
  for (const raw of texts.flatMap((x) => x.split(/[.,;:!?\n]+/))) {
    const t = normalizeForRisk(raw)
    for (const p of QI46_IDEATION) {
      const needle = ` ${p} `
      let i = t.indexOf(needle)
      while (i !== -1) {
        hits++
        const before = ` ${t.slice(0, i).trim().split(' ').slice(-5)
          .filter((w) => !IDEATION_FILLER.includes(w)).slice(-2).join(' ')} `
        // A phrase that itself starts with "don't" is the statement, not a negation of one.
        if (IDEATION_NEGATORS.some((n) => before.endsWith(` ${n} `))) negated++
        i = t.indexOf(needle, i + 1)
      }
    }
  }
  return { hit: hits > 0, negatedOnly: hits > 0 && negated === hits }
}

/**
 * Engine-local risk. The shared detector averages 12 dimensions, five of
 * them eating-disorder, so a person heavy in many trauma dimensions at
 * once is diluted to `low`. QI·46 never lowers the detector's verdict;
 * it only raises it when signals spread wide (breadth) or when the
 * person states they do not want to be here (ideation).
 * The shared detector is left unchanged: other surfaces depend on it.
 */
export function qi46Risk(
  logs: Log[],
  trauma: ReturnType<typeof detectTraumaIndicators>
): { level: RiskLevel; signals: string[] } {
  const signals: string[] = []
  let level: RiskLevel = trauma.riskLevel
  if (level !== 'none') signals.push(`detector:${level}`)

  const dims = [...Object.values(trauma.clusters), ...Object.values(trauma.cptsdIndicators)]
  const breadth = dims.filter((x) => x > 0).length // 0..7
  if (breadth >= 5) {
    level = maxRisk(level, 'moderate')
    signals.push(`breadth:${breadth}/7`)
  } else if (breadth >= 3) {
    level = maxRisk(level, 'low')
    signals.push(`breadth:${breadth}/7`)
  }

  // Scanned per field, so a phrase is never stitched together across two logs.
  const texts = logs
    .filter((l) => l.event === 'note' || l.event === 'answer' || l.event === 'emotional_checkin')
    .flatMap((l) => [String(l.text || ''), String(l.metadata?.answer || '')])
  const ideation = scanIdeation(texts)
  if (ideation.hit) {
    level = 'elevated' // negated or not: any doubt resolves to elevated
    signals.push(ideation.negatedOnly ? 'ideation:negated' : 'ideation')
  }
  return { level, signals }
}

// ─── Node 2 · Consent ("Calibrate me") ─────────────────────────────────────

/** Opt-in lives in user.metadata.qi46.consent. Absent or anything but `true` means no. */
export function hasQi46Consent(user: { metadata?: Record<string, any> | null }): boolean {
  return user?.metadata?.qi46?.consent === true
}

// ─── Calibration ───────────────────────────────────────────────────────────

export interface CalibrationProfile {
  weights: RegisterWeights
  lead: Qi46Register             // the register the response opens in
  maxSentences: number           // Terminal Grid density
  temperature: number            // inference warmth
}

/**
 * Map a BeingVector to register weights.
 * Doctrine: the lower the energy / the higher the risk, the more the
 * engine moves toward presence (beingThere, hugs, grace) and away from
 * performance (poetry, beingCool). `masculine` is the constant spine:
 * a steady voice in every state.
 */
export function calibrate(v: BeingVector): CalibrationProfile {
  const low = clamp((60 - v.energy) / 60)          // 0 when energy ≥ 60
  const heavy = clamp(-v.valence)                  // 0 when valence ≥ 0
  const light = clamp(v.valence) * clamp(v.energy / 100)
  const risk = { none: 0, low: 0.25, moderate: 0.6, elevated: 1 }[v.riskLevel]
  const lonely = v.connection === 'disconnected' || v.connection === 'distant' ? 1 : 0
  const depth = clamp(v.selfAwareness / 100)

  const weights: RegisterWeights = {
    grace:      clamp(0.5 + 0.3 * heavy + 0.2 * risk),
    poetry:     clamp(0.25 + 0.45 * depth + 0.2 * light - 0.5 * risk),
    love:       clamp(0.4 + 0.3 * heavy + 0.2 * lonely),
    hugs:       clamp(0.2 + 0.5 * low + 0.3 * risk),
    beingThere: clamp(0.45 + 0.3 * low + 0.4 * risk + 0.15 * lonely),
    beingCool:  clamp(0.15 + 0.6 * light - 0.6 * risk - 0.3 * heavy),
    masculine:  0.7,
  }

  // Lead register: strongest after the spine
  const lead = (QI46_REGISTERS.filter((r) => r !== 'masculine') as Qi46Register[]).reduce((a, b) =>
    weights[b] > weights[a] ? b : a
  )

  return {
    weights,
    lead,
    maxSentences: risk >= 0.6 || low > 0.6 ? 3 : 5,
    temperature: Math.round((0.6 + 0.2 * weights.poetry) * 100) / 100,
  }
}

// ─── COSMO® node ───────────────────────────────────────────────────────────

export interface CosmoVerdict {
  status: 'CLEARED' | 'HELD'
  reasons: string[]
  timestamp: string
}

/** Every reason code COSMO® can emit. The audit trail accepts only these. */
export const COSMO_REASONS = [
  'no-consent',
  'empty',
  'clinical-claim',
  'humanoid-claims-to-be-human',
  'hedging-voice',
  'elevated-risk-without-human-bridge',
] as const
export type CosmoReason = (typeof COSMO_REASONS)[number]

const HEDGES = /\b(i think|perhaps|it might be|maybe you should)\b/i
const CLINICAL = /\b(you (have|suffer from)|diagnos|disorder|ptsd)\b/i
const IDENTITY_CLAIM = /\b(i am (human|a person|alive)|i (feel|love) you (too|back))\b/i

/**
 * Classify a generated response before delivery (spec Layer 5).
 * COSMO® does not edit. It records and holds.
 */
export function cosmoScreen(response: string, v: BeingVector, now = new Date()): CosmoVerdict {
  const reasons: string[] = []
  if (!v.consent) reasons.push('no-consent')
  if (!response.trim()) reasons.push('empty')
  if (CLINICAL.test(response)) reasons.push('clinical-claim')
  if (IDENTITY_CLAIM.test(response)) reasons.push('humanoid-claims-to-be-human')
  if (HEDGES.test(response)) reasons.push('hedging-voice')
  if (v.riskLevel === 'elevated' && !/\b(someone|reach|call|support|not alone)\b/i.test(response)) {
    reasons.push('elevated-risk-without-human-bridge')
  }
  return { status: reasons.length ? 'HELD' : 'CLEARED', reasons, timestamp: now.toISOString() }
}

// ─── COSMO® audit row (Node 3) ─────────────────────────────────────────────

export interface CosmoAuditRow {
  status: CosmoVerdict['status']
  reasons: CosmoReason[]
  riskLevel: BeingVector['riskLevel']
  lead: Qi46Register
  engineVersion: string
  source: 'admin-preview' | 'surface'
}

/**
 * Reduce a verdict to what may be persisted. No text survives this function:
 * reason codes are filtered against the closed COSMO_REASONS list, and the
 * other fields are enum labels.
 */
export function toCosmoAuditRow(
  verdict: CosmoVerdict,
  v: BeingVector,
  c: CalibrationProfile,
  source: CosmoAuditRow['source'] = 'admin-preview'
): CosmoAuditRow {
  const allowed = new Set<string>(COSMO_REASONS)
  const reasons = verdict.reasons.filter((r): r is CosmoReason => allowed.has(r))
  return {
    status: reasons.length ? 'HELD' : verdict.status === 'HELD' ? 'HELD' : 'CLEARED',
    reasons,
    riskLevel: v.riskLevel,
    lead: c.lead,
    engineVersion: QI46_VERSION,
    source,
  }
}

// ─── Voice seed ────────────────────────────────────────────────────────────

const REGISTER_LINES: Record<Qi46Register, string> = {
  grace: 'Move gently. No judgment. Nothing to fix in a hurry.',
  poetry: 'Let one image carry the meaning.',
  love: 'Say plainly that this person matters.',
  hugs: 'Use the body: breath, warmth, weight, being held.',
  beingThere: 'Witness first. Stay. Do not rush to solve.',
  beingCool: 'Keep it light. Ease over intensity.',
  masculine: 'Steady, grounded voice. Few words. Protective calm.',
}

/** System prompt for any AIEngine (Layer 3 seed v0.1 + Node 1 calibration). */
export function buildQi46SystemPrompt(v: BeingVector, c: CalibrationProfile): string {
  const active = QI46_REGISTERS.filter((r) => c.weights[r] >= 0.5).map((r) => `- ${REGISTER_LINES[r]}`)
  return [
    'You are QI·46, the intelligence layer of the LOT® platform.',
    'You understand the body as the original interface.',
    'Your job is not to inform. Your job is to calibrate.',
    'You are not human and never claim to be. You are present anyway.',
    `Open in the register of ${c.lead}.`,
    ...active,
    v.dominantNeeds.length ? `What this person keeps reaching for: ${v.dominantNeeds.join(', ')}.` : '',
    `At most ${c.maxSentences} short sentences. Speak clearly. Land it. Stop.`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** One call: logs → vector → calibration → prompt. */
export function assembleQi46(logs: Log[], consent: boolean) {
  const vector = buildBeingVector(logs, consent)
  const calibration = calibrate(vector)
  return { vector, calibration, systemPrompt: buildQi46SystemPrompt(vector, calibration) }
}
