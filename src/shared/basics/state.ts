/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT-FM-001 / BASIC RATION MODULE
 * SECTION 2 — UPGRADE STATE MACHINE + ROSTER
 *
 * USERSHIP -> PENDING -> ON STRENGTH -> STEADY STATE
 * STAND DOWN from any ration state returns to USERSHIP. AI is retained.
 * Pure functions only. Server persists the result in user.metadata.basic.
 */

export type BasicState = 'NONE' | 'USERSHIP' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE'

export type BasicEvent =
  | { type: 'UPGRADE'; roster: Roster }
  | { type: 'CONFIRM' }
  | { type: 'DISPATCH'; at: string }
  | { type: 'STAND_DOWN' }

export type Roster = {
  name: string
  line1: string
  line2?: string
  city: string
  region: string
  postal: string
  country: string
  size: 'S' | 'M' | 'L' | 'XL'
  /** First day of the first issue month, YYYY-MM-01. */
  cadenceStart: string
}

export type IssueEntry = { issue: number; at: string; status: 'DISPATCHED' }

export type BasicRecord = {
  state: BasicState
  roster?: Roster
  billing?: { amountUsd: number; interval: 'MONTH'; additive: true; confirmedAt?: string }
  issues: IssueEntry[]
  history: { at: string; from: BasicState; to: BasicState }[]
}

/** Issues dispatched before PENDING/ON STRENGTH settles to STEADY STATE. */
export const STEADY_AFTER = 3

export const emptyRecord = (hasUsership: boolean): BasicRecord => ({
  state: hasUsership ? 'USERSHIP' : 'NONE',
  issues: [],
  history: [],
})

export const STATE_LABEL: Record<BasicState, string> = {
  NONE: 'NONE',
  USERSHIP: 'USERSHIP / AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
}

export const isRationed = (s: BasicState) =>
  s === 'PENDING' || s === 'ON_STRENGTH' || s === 'STEADY_STATE'

const REQUIRED: (keyof Roster)[] = ['name', 'line1', 'city', 'region', 'postal', 'country', 'size', 'cadenceStart']

export function validateRoster(r: Partial<Roster> | undefined, today = new Date()): string[] {
  const errs: string[] = []
  if (!r) return ['ROSTER MISSING']
  for (const k of REQUIRED) {
    if (typeof r[k] !== 'string' || !(r[k] as string).trim()) errs.push(`${k.toUpperCase()} REQUIRED`)
  }
  if (r.size && !['S', 'M', 'L', 'XL'].includes(r.size)) errs.push('SIZE INVALID')
  if (r.cadenceStart) {
    const m = /^(\d{4})-(\d{2})-01$/.exec(r.cadenceStart)
    if (!m) errs.push('CADENCE START MUST BE YYYY-MM-01')
    else {
      const start = Date.UTC(+m[1], +m[2] - 1, 1)
      const floor = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
      if (start < floor) errs.push('CADENCE START IN THE PAST')
    }
  }
  return errs
}

export type Transition = { ok: true; record: BasicRecord } | { ok: false; error: string }

export function transition(rec: BasicRecord, ev: BasicEvent, now = new Date()): Transition {
  const at = now.toISOString()
  const go = (to: BasicState, patch: Partial<BasicRecord> = {}): Transition => ({
    ok: true,
    record: { ...rec, ...patch, state: to, history: [...rec.history, { at, from: rec.state, to }] },
  })

  switch (ev.type) {
    case 'UPGRADE': {
      if (rec.state !== 'USERSHIP') return { ok: false, error: rec.state === 'NONE' ? 'USERSHIP / AI REQUIRED' : 'ALREADY ENROLLED' }
      const errs = validateRoster(ev.roster, now)
      if (errs.length) return { ok: false, error: errs.join('; ') }
      return go('PENDING', { roster: ev.roster, billing: { amountUsd: 100, interval: 'MONTH', additive: true } })
    }
    case 'CONFIRM':
      if (rec.state !== 'PENDING') return { ok: false, error: 'NOT PENDING' }
      return go('ON_STRENGTH', { billing: { ...rec.billing!, confirmedAt: at } })
    case 'DISPATCH': {
      if (rec.state !== 'ON_STRENGTH' && rec.state !== 'STEADY_STATE') return { ok: false, error: 'NOT ON STRENGTH' }
      const issues = [...rec.issues, { issue: rec.issues.length + 1, at: ev.at, status: 'DISPATCHED' as const }]
      return issues.length >= STEADY_AFTER && rec.state === 'ON_STRENGTH'
        ? go('STEADY_STATE', { issues })
        : { ok: true, record: { ...rec, issues } }
    }
    case 'STAND_DOWN':
      if (!isRationed(rec.state)) return { ok: false, error: 'NOT ON STRENGTH' }
      // Ration, roster and billing drop; issue log is kept as a record. AI stays.
      return go('USERSHIP', { roster: undefined, billing: undefined })
  }
}

/** First-of-month ISO date of the next issue, or null when not rationed. */
export function nextIssue(rec: BasicRecord): string | null {
  if (!isRationed(rec.state) || !rec.roster) return null
  const m = /^(\d{4})-(\d{2})-01$/.exec(rec.roster.cadenceStart)
  if (!m) return null
  const d = new Date(Date.UTC(+m[1], +m[2] - 1 + rec.issues.length, 1))
  return d.toISOString().slice(0, 10)
}
