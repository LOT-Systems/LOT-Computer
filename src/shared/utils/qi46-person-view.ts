/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 per-person signal line: pure view model.
 *
 * Turns the /admin-api/users/:id/qi46 response into one or two plain lines
 * for the admin user page. No React, no fetch, no imports, so the smoke test
 * runs the same code the card renders.
 *
 * Labels only. It reads consent, signal count, confidence, risk level, risk
 * signal labels and the lead register. It never reads or returns the system
 * prompt, needs, values or any log text.
 */

export interface Qi46PersonResponse {
  consent?: boolean
  vector?: {
    signalCount?: number
    confidence?: number
    riskLevel?: string
    riskSignals?: unknown[]
  }
  calibration?: { lead?: string }
  // systemPrompt and the rest of the vector may be present. They are ignored.
  [k: string]: unknown
}

export interface Qi46PersonView {
  line: string
  signals: string[]
  note: string | null
}

// Short machine labels only (e.g. `breadth:3/7`, `language:uncovered`).
// Anything else is masked, so a bad value can never put free text on screen.
const LABEL = /^[a-z0-9.\-:/]{1,32}$/i
const safe = (v: unknown, fallback = 'other') =>
  typeof v === 'string' && LABEL.test(v) ? v : fallback

const RISK = ['none', 'low', 'moderate', 'elevated']

export function qi46PersonView(r: Qi46PersonResponse | null | undefined): Qi46PersonView {
  if (!r || r.consent !== true) {
    return {
      line: 'No consent · nothing read',
      signals: [],
      note: 'This person has not turned on "Calibrate me", so QI·46 reads none of their logs.',
    }
  }

  const v = r.vector || {}
  const count = Math.max(0, Math.floor(Number(v.signalCount) || 0))
  if (count === 0) {
    return {
      line: 'Consent · 0 signals',
      signals: [],
      note: 'Consent is on, but there are no answers, check-ins or notes to read yet.',
    }
  }

  const conf = Math.round(Math.min(Math.max(Number(v.confidence) || 0, 0), 1) * 100)
  const risk = RISK.includes(String(v.riskLevel)) ? String(v.riskLevel) : 'other'
  const lead = safe(r.calibration?.lead, 'unknown')
  const signals = Array.isArray(v.riskSignals)
    ? Array.from(new Set(v.riskSignals.map((s) => safe(s)))).slice(0, 8)
    : []

  return {
    line: `Consent · ${count} ${count === 1 ? 'signal' : 'signals'} · ${conf}% confidence · risk ${risk} · lead ${lead}`,
    signals,
    note: null,
  }
}
