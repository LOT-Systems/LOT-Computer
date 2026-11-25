/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT-FM-001 / BASIC RATION MODULE
 * SECTION 3 — UPGRADE STATE MACHINE + ROSTER + ISSUE LOG (pure, no I/O)
 *
 * USERSHIP/AI -> PENDING -> ON STRENGTH -> STEADY STATE
 * STAND DOWN (from any ration state) -> USERSHIP/AI. Drops ration, retains AI.
 */

export type RationState =
  | 'NONE' // no Usership: BASIC unavailable
  | 'USERSHIP' // AI plan only
  | 'PENDING' // upgrade requested, roster incomplete
  | 'ON_STRENGTH' // roster complete, billing live, first issue not yet dispatched
  | 'STEADY_STATE' // at least one issue dispatched

export type RationEvent =
  | 'UPGRADE'
  | 'ROSTER_COMPLETE'
  | 'ISSUE_DISPATCHED'
  | 'STAND_DOWN'

export const STATE_LABEL: Record<RationState, string> = {
  NONE: 'NONE',
  USERSHIP: 'USERSHIP / AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
}

const TRANSITIONS: Record<RationState, Partial<Record<RationEvent, RationState>>> = {
  NONE: {},
  USERSHIP: { UPGRADE: 'PENDING' },
  PENDING: { ROSTER_COMPLETE: 'ON_STRENGTH', STAND_DOWN: 'USERSHIP' },
  ON_STRENGTH: { ISSUE_DISPATCHED: 'STEADY_STATE', STAND_DOWN: 'USERSHIP' },
  STEADY_STATE: { ISSUE_DISPATCHED: 'STEADY_STATE', STAND_DOWN: 'USERSHIP' },
}

/** Returns the next state, or null when the event is not legal from `from`. */
export const transition = (
  from: RationState,
  event: RationEvent
): RationState | null => TRANSITIONS[from][event] ?? null

// ─── billing ──────────────────────────────────────────────────────────────────
// Additive: BASIC is billed on top of the AI plan, never instead of it.
// Money is integer cents. Margin floor 60%, landed ceiling USD 40.00.
export const BASIC_PRICE_CENTS = 10000
export const COGS_CEILING_CENTS = 4000
export const MARGIN_FLOOR = 0.6

export const marginOf = (priceCents: number, landedCents: number): number =>
  priceCents > 0 ? (priceCents - landedCents) / priceCents : 0

/** True when a landed cost respects both the ceiling and the margin floor. */
export const withinEnvelope = (landedCents: number): boolean =>
  landedCents <= COGS_CEILING_CENTS &&
  marginOf(BASIC_PRICE_CENTS, landedCents) >= MARGIN_FLOOR

export type BillingStatus = 'NONE' | 'LEDGERED' | 'CANCELLED'

export type Billing = {
  amountCents: number
  interval: 'MONTH'
  status: BillingStatus
  /** No payment processor is connected yet. LEDGERED = obligation recorded, nothing charged. */
  processor: 'NOT_CONNECTED' | 'CONNECTED'
  since: string | null
}

// ─── roster ───────────────────────────────────────────────────────────────────
export type Shipping = {
  name: string
  line1: string
  line2: string
  city: string
  region: string
  postal: string
  country: 'US'
}

export type Roster = {
  shipping: Shipping
  /** Operators on strength at this address. Ration is per operator. */
  operators: 1
  /** Ledger line numbers the operator asks to have reviewed (allergen/substitution). Never alters price. */
  holds: string[]
  /** First issue date, YYYY-MM-DD, always the 1st of a month. */
  cadenceStart: string
}

export type RosterInput = {
  shipping?: Partial<Shipping>
  holds?: unknown
  cadenceStart?: unknown
}

export const validateRoster = (
  input: RosterInput,
  now: Date = new Date()
): { ok: true; roster: Roster } | { ok: false; errors: string[] } => {
  const errors: string[] = []
  const s = input.shipping ?? {}
  const clean = (v: unknown, max = 120) =>
    typeof v === 'string' ? v.trim().slice(0, max) : ''
  const shipping: Shipping = {
    name: clean(s.name),
    line1: clean(s.line1),
    line2: clean(s.line2),
    city: clean(s.city),
    region: clean(s.region, 2).toUpperCase(),
    postal: clean(s.postal, 10),
    country: 'US',
  }
  if (!shipping.name) errors.push('NAME REQUIRED')
  if (!shipping.line1) errors.push('ADDRESS LINE 1 REQUIRED')
  if (!shipping.city) errors.push('CITY REQUIRED')
  if (!/^[A-Z]{2}$/.test(shipping.region)) errors.push('REGION: 2-LETTER US CODE')
  if (!/^\d{5}(-\d{4})?$/.test(shipping.postal)) errors.push('POSTAL: US ZIP')

  const holds = Array.isArray(input.holds)
    ? Array.from(
        new Set(
          input.holds.filter(
            (h): h is string => typeof h === 'string' && /^\d{2}$/.test(h)
          )
        )
      ).sort()
    : []

  const start = typeof input.cadenceStart === 'string' ? input.cadenceStart : ''
  const m = /^(\d{4})-(\d{2})-01$/.exec(start)
  const firstOfNextMonth = nextFirstOfMonth(now)
  if (!m) errors.push('CADENCE START: 1ST OF A MONTH, YYYY-MM-01')
  else if (start < firstOfNextMonth) errors.push('CADENCE START: MUST BE FUTURE')

  if (errors.length) return { ok: false, errors }
  return {
    ok: true,
    roster: { shipping, operators: 1, holds, cadenceStart: start },
  }
}

/** First day of the month after `now`, UTC, as YYYY-MM-DD. */
export const nextFirstOfMonth = (now: Date): string => {
  const y = now.getUTCFullYear()
  const mo = now.getUTCMonth() + 1
  const ny = mo === 12 ? y + 1 : y
  const nm = mo === 12 ? 1 : mo + 1
  return `${ny}-${String(nm).padStart(2, '0')}-01`
}

// ─── issue log ────────────────────────────────────────────────────────────────
export type IssueLogEntry = {
  ts: string
  event: RationEvent | 'ROSTER_UPDATED'
  from: RationState
  to: RationState
  note?: string
}

export const ISSUE_LOG_MAX = 200

export type Dispatch = {
  /** Ration issue number, 1-based from cadence start */
  issue: number
  /** Scheduled issue date (YYYY-MM-DD) this dispatch satisfied */
  due: string
  ts: string
  tracking: string
}

export const DISPATCH_MAX = 36

export type BasicRecord = {
  state: RationState
  roster: Roster | null
  billing: Billing
  issueLog: IssueLogEntry[]
  /** Next scheduled issue date, or null when not on strength. Advanced by each dispatch. */
  nextIssue: string | null
  /** Issues dispatched since the current roster went ON STRENGTH. NEXT ISSUE number = issuesDispatched + 1. */
  issuesDispatched: number
  dispatches: Dispatch[]
}

/** Fill fields missing from records stored before M3. */
export const normalizeRecord = (r: Partial<BasicRecord> | null | undefined, fallback: RationState): BasicRecord => ({
  ...emptyRecord(fallback),
  ...(r ?? {}),
  issuesDispatched: r?.issuesDispatched ?? 0,
  dispatches: r?.dispatches ?? [],
})

/** Add one calendar month to a YYYY-MM-01 date. */
export const addMonth = (ymd: string): string => {
  const [y, m] = ymd.split('-').map(Number)
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
}

export const emptyRecord = (state: RationState): BasicRecord => ({
  state,
  roster: null,
  billing: {
    amountCents: 0,
    interval: 'MONTH',
    status: 'NONE',
    processor: 'NOT_CONNECTED',
    since: null,
  },
  issueLog: [],
  nextIssue: null,
  issuesDispatched: 0,
  dispatches: [],
})

/** Baseline state implied by the user's tags when no record exists yet. */
export const baselineState = (hasUsership: boolean): RationState =>
  hasUsership ? 'USERSHIP' : 'NONE'

export type ApplyResult =
  | { ok: true; record: BasicRecord }
  | { ok: false; error: string }

/**
 * Apply an event to a record. Pure: returns a new record or an error.
 * `hasUsership` is re-checked on UPGRADE so a lapsed AI plan cannot enter BASIC.
 */
export const applyEvent = (
  record: BasicRecord,
  event: RationEvent,
  ctx: { now: Date; hasUsership: boolean; roster?: Roster; note?: string; tracking?: string }
): ApplyResult => {
  if (event === 'UPGRADE' && !ctx.hasUsership)
    return { ok: false, error: 'USERSHIP / AI REQUIRED AS BASE LAYER' }
  if (event === 'ROSTER_COMPLETE' && !ctx.roster)
    return { ok: false, error: 'ROSTER REQUIRED' }
  if (event === 'ISSUE_DISPATCHED') {
    if (!record.nextIssue || ctx.now.toISOString().slice(0, 10) < record.nextIssue)
      return { ok: false, error: `NOT DUE: NEXT ISSUE ${record.nextIssue ?? 'NONE'}` }
    if (!ctx.tracking?.trim()) return { ok: false, error: 'TRACKING REQUIRED' }
  }
  const to = transition(record.state, event)
  if (!to)
    return {
      ok: false,
      error: `ILLEGAL: ${event} FROM ${STATE_LABEL[record.state]}`,
    }
  const ts = ctx.now.toISOString()
  let next: BasicRecord = { ...record, state: to }
  if (event === 'ROSTER_COMPLETE') {
    next = {
      ...next,
      roster: ctx.roster!,
      nextIssue: ctx.roster!.cadenceStart,
      issuesDispatched: 0,
      dispatches: [],
      billing: {
        amountCents: BASIC_PRICE_CENTS,
        interval: 'MONTH',
        status: 'LEDGERED',
        processor: record.billing.processor,
        since: ts,
      },
    }
  }
  if (event === 'ISSUE_DISPATCHED') {
    const d: Dispatch = {
      issue: record.issuesDispatched + 1,
      due: record.nextIssue!,
      ts,
      tracking: ctx.tracking!.trim().slice(0, 40),
    }
    next = {
      ...next,
      issuesDispatched: d.issue,
      nextIssue: addMonth(record.nextIssue!),
      dispatches: [...record.dispatches, d].slice(-DISPATCH_MAX),
    }
  }
  if (event === 'STAND_DOWN') {
    next = {
      ...next,
      roster: null,
      nextIssue: null,
      billing: { ...record.billing, amountCents: 0, status: 'CANCELLED' },
    }
  }
  const entry: IssueLogEntry = {
    ts,
    event,
    from: record.state,
    to,
    ...(event === 'ISSUE_DISPATCHED'
      ? { note: `ISSUE ${next.issuesDispatched} ${ctx.tracking!.trim().slice(0, 40)}` }
      : ctx.note
      ? { note: ctx.note.slice(0, 120) }
      : {}),
  }
  next.issueLog = [...record.issueLog, entry].slice(-ISSUE_LOG_MAX)
  return { ok: true, record: next }
}

/** Total monthly obligation: AI plan (if any) plus BASIC (if live). Integer cents. */
export const monthlyTotalCents = (
  record: BasicRecord,
  aiPlanCents: number
): number => aiPlanCents + record.billing.amountCents
