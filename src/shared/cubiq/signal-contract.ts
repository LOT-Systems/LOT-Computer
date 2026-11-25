/**
 * CUBIQ(tm) Quantum Cube — signal contract, platform reference (TypeScript).
 *
 * Spec:  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md §02-§03
 *        docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md §02 (contract v0.6-DRAFT, decideV06Draft)
 *        docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md §02 (v0.6-draft calendar rule, F85)
 * Firmware twin: firmware/cubiq/cubiq_contract.c (C99, R11 F84)
 * Ports: scripts/cubiq-r07-contract-check.py  decide()  (contract v0.3)
 *        scripts/cubiq-r08-fsm-sim.py          decide()  (contract v0.4: home-pad credit)
 *
 * Two halves:
 *   decide()        what the cube does with a signal in a given device state. The cube's
 *                   firmware is the authority; this copy exists so the platform can predict
 *                   the outcome and so both sides run the same vectors in CI.
 *   encodeSignal()  how the platform (Index of Systems) turns an event into a signal.
 *                   The platform ASKS; the cube and the operator DECIDE (R09 F64).
 *
 * Pure functions, no imports, no I/O. Every lookup table is a null-prototype map read
 * through own-key checks, so names such as "constructor" or "__proto__" arriving from
 * the wire are treated as unknown (R09 F65, contract v0.5 vectors 55-57).
 */

export type Gesture = 'none' | 'settle' | 'nudge' | 'hop' | 'leap' | 'jump'
export type SignalClass =
  | 'memory_ready'
  | 'badge_common'
  | 'badge_rare'
  | 'assembly_phase'
  | 'cohort_ping'
export type Outcome = 'performed' | 'rejected' | 'expired' | 'held' | 'safe_hold' | 'deferred'

export interface CubiqSignal {
  v: number
  id: string
  class: string
  intent: string
  priority: number
  ttl_s: number
  not_before: string
  ceiling_hint?: string | null
  [extra: string]: unknown
}

export interface CubiqPadState {
  model_ok?: boolean
  home_spot?: boolean
  /** v0.6-draft (R10 F78): the ToF sees the deck's front edge where the pad ID says it is */
  edge_seen?: boolean
}

/** v0.6-draft (R10 F80). Absent means 'still'; any value other than still/gentle is rough. */
export type SurfaceMotion = 'still' | 'gentle' | 'rough'

export interface CubiqDeviceState {
  now: string
  device?: 'v0' | 'v1'
  surface?: 'damped' | 'resonant' | 'unknown'
  free_ahead_mm?: number
  level_deg?: number
  pad?: CubiqPadState
  operator_ceilings?: Record<string, string>
  hush?: boolean
  quiet_hours?: boolean
  fall_recent?: boolean
  machine_vibration?: boolean
  tof_window_dirty?: boolean
  call_live_opt_in?: boolean
  unplaced?: boolean
  cadence_ok?: boolean
  surface_motion?: SurfaceMotion | string
}

export type Decision = [Outcome, Gesture, string | null]

function table<V>(entries: Record<string, V>): Record<string, V> {
  return Object.assign(Object.create(null) as Record<string, V>, entries)
}

function has(map: Record<string, unknown>, key: unknown): key is string {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key)
}

const RANK = table<number>({ none: 0, settle: 1, nudge: 2, hop: 3, leap: 4, jump: 5 })
const NAME: Gesture[] = ['none', 'settle', 'nudge', 'hop', 'leap', 'jump']
const CLASS_CEILING = table<Gesture>({
  memory_ready: 'nudge',
  badge_common: 'hop',
  badge_rare: 'leap',
  assembly_phase: 'settle',
  cohort_ping: 'settle',
})
const OPERATOR_MAX: Gesture = 'leap' // no class can be raised above leap (R06 F39)
const DEVICE_CAP = table<Gesture>({ v0: 'leap', v1: 'jump' })
const FREE_AHEAD_MM = table<number>({ leap: 125, hop: 85, jump: 201 })
const PAD_FREE_AHEAD_MM = table<number>({ leap: 60, hop: 20 }) // deck-certified (R08 §04)

// Contract v0.5 timestamp profile (R09 F66): an offset is REQUIRED. The v0.4 Python
// reference crashed on an offset-less time; v0.5 rejects it as bad_not_before.
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/

function parseTs(s: string): number {
  return ISO_UTC.test(s) ? Date.parse(s) : NaN
}

// Contract v0.6-draft calendar rule (R11 F85). The v0.5 profile fixes the SYNTAX only; the
// calendar was left to each library, and they disagree INSIDE the profile:
//   Date.parse (V8) accepts 2026-02-29, 2026-04-31 and T24:00 (it rolls them over), and keeps
//   milliseconds only; Python's fromisoformat accepts an offset of +05:60 or +05:99.
// v0.6-draft therefore writes the calendar into the contract and compares in integer
// MICROSECONDS (Number is exact to 2^53 us, i.e. past the year 2255).
const ISO_PARTS = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?(?:Z|([+-])(\d{2}):(\d{2}))$/

function daysFromCivil(y: number, m: number, d: number): number {
  y -= m <= 2 ? 1 : 0
  const era = Math.floor(y / 400)
  const yoe = y - era * 400
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
  return era * 146097 + doe - 719468
}

/** Strict v0.6-draft timestamp → integer microseconds since the epoch, or NaN (R11 F85). */
export function parseTsMicros(s: unknown): number {
  if (typeof s !== 'string') return NaN
  const m = ISO_PARTS.exec(s)
  if (!m) return NaN
  const [Y, Mo, D, h, mi] = [m[1], m[2], m[3], m[4], m[5]].map(Number)
  const sec = m[6] ? Number(m[6]) : 0
  const us = m[7] ? Number(m[7].padEnd(6, '0')) : 0
  const leap = (Y % 4 === 0 && Y % 100 !== 0) || Y % 400 === 0
  const dim = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (Y < 1 || Mo < 1 || Mo > 12 || D < 1 || D > dim[Mo - 1]) return NaN
  if (h > 23 || mi > 59 || sec > 59) return NaN
  let off = 0
  if (m[8]) {
    const oh = Number(m[9])
    const om = Number(m[10])
    if (oh > 23 || om > 59) return NaN
    off = (m[8] === '-' ? -1 : 1) * (oh * 60 + om)
  }
  const t = daysFromCivil(Y, Mo, D) * 86400 + h * 3600 + mi * 60 + sec - off * 60
  return t * 1e6 + us
}

function isInt(x: unknown): x is number {
  return typeof x === 'number' && Number.isInteger(x)
}

/** Returns a rejection reason, or null when the message is well formed. */
export function validate(sig: Record<string, unknown>, strictCalendar = false): string | null {
  const required: [string, 'int' | 'str'][] = [
    ['v', 'int'],
    ['id', 'str'],
    ['class', 'str'],
    ['intent', 'str'],
    ['priority', 'int'],
    ['ttl_s', 'int'],
    ['not_before', 'str'],
  ]
  for (const [k, t] of required) {
    if (!Object.prototype.hasOwnProperty.call(sig, k)) return `missing_${k}`
    const val = sig[k]
    if (t === 'int' ? !isInt(val) : typeof val !== 'string') return `type_${k}`
  }
  const s = sig as unknown as CubiqSignal
  if (s.v !== 1 && s.v !== 2) return 'bad_version'
  if (!has(RANK, s.intent) || s.intent === 'none') return 'bad_intent'
  if (s.priority < 0 || s.priority > 3) return 'bad_priority'
  if (s.ttl_s < 1 || s.ttl_s > 86400) return 'bad_ttl'
  const hint = sig.ceiling_hint
  if (!(hint === undefined || hint === null || hint === 'call_live')) return 'bad_ceiling_hint'
  if (s.v === 1 && Object.prototype.hasOwnProperty.call(sig, 'ceiling_hint')) return 'hint_requires_v2'
  if (Number.isNaN(strictCalendar ? parseTsMicros(s.not_before) : parseTs(s.not_before))) return 'bad_not_before'
  return null
}

/** [ceiling, reason if it lowers]. The operator may raise one rung (max leap) or lower freely. */
export function classCeiling(cls: string, op?: Record<string, string>): [Gesture, string] {
  const def: Gesture = has(CLASS_CEILING, cls) ? CLASS_CEILING[cls] : 'settle'
  const want = op && Object.prototype.hasOwnProperty.call(op, cls) ? op[cls] : undefined
  if (!has(RANK, want) || want === 'none') return [def, 'class_ceiling']
  if (RANK[want] < RANK[def]) return [want as Gesture, 'operator_ceiling']
  const allowed = Math.min(RANK[def] + 1, RANK[OPERATOR_MAX], RANK[want])
  return [NAME[Math.max(allowed, RANK[def])], 'class_ceiling']
}

/** Contract v0.3 decision (R07 §06), with an injectable runway table for the v0.4 pad credit. */
function decideCore(
  sig: Record<string, unknown>,
  st: CubiqDeviceState,
  freeAhead: Record<string, number>,
  v06 = false,
): Decision {
  const err = validate(sig, v06)
  if (err) return ['rejected', 'none', err]
  const s = sig as unknown as CubiqSignal
  // v0.5: Date.parse milliseconds. v0.6-draft: strict calendar, integer microseconds (R11 F85)
  const unit = v06 ? 1e6 : 1000
  const now = v06 ? parseTsMicros(st.now) : parseTs(st.now)
  const nb = v06 ? parseTsMicros(s.not_before) : parseTs(s.not_before)
  // R11 F86: an unparseable clock is NaN, every comparison with NaN is false, and v0.5 then
  // falls through to 'performed' whatever the time. The clock is the caller's own data, so
  // v0.6-draft fails loudly (Python raises; the C port returns a state fault).
  if (v06 && Number.isNaN(now)) throw new RangeError(`cubiq: bad device clock ${String(st.now)}`)
  if (now > nb + s.ttl_s * unit) return ['expired', 'none', null]
  if (now < nb) return ['held', 'none', null]
  if (st.fall_recent) return ['safe_hold', 'none', 'G8_fall_recent']
  if (st.machine_vibration) return ['deferred', 'none', 'G9_machine_vibration']
  const motion = st.surface_motion ?? 'still'
  // v0.6-draft G11: a surface that moves under the cube beyond 'gentle' defers, like G9
  if (v06 && motion !== 'still' && motion !== 'gentle') return ['deferred', 'none', 'G11_moving_surface']

  let reason: string | null = null
  let r = RANK[s.intent]
  const cap = (limit: Gesture, why: string) => {
    if (RANK[limit] < r) {
      r = RANK[limit]
      reason = reason ?? why
    }
  }

  const device = st.device ?? 'v0'
  if (!has(DEVICE_CAP, device)) return ['rejected', 'none', 'bad_device']
  cap(DEVICE_CAP[device], 'device_capability')
  cap(...classCeiling(s.class, st.operator_ceilings))
  if (s.ceiling_hint === 'call_live' && (st.call_live_opt_in ?? true)) cap('settle', 'call_live')
  if (st.quiet_hours) cap('nudge', 'quiet_hours')
  if (st.hush) cap('nudge', 'G10_hush')
  if (st.unplaced || st.tof_window_dirty) cap('settle', 'G7_unknown_surface')
  if (v06 && motion === 'gentle') cap('leap', 'G11_moving_surface') // R10 §05: JUMP only
  if (!(st.cadence_ok ?? true) && r >= RANK.hop) cap('nudge', 'G4b_cadence')
  const free = st.free_ahead_mm ?? 1000
  for (const g of ['jump', 'leap', 'hop'] as const) {
    const need = has(freeAhead, g) ? freeAhead[g] : FREE_AHEAD_MM[g]
    if (r === RANK[g] && (free < need || (g !== 'hop' && (st.level_deg ?? 0) > 3))) {
      cap(NAME[RANK[g] - 1], 'G1_edge_or_level')
    }
  }
  const surfaceOk = (st.surface ?? 'damped') === 'damped'
  if (!surfaceOk && r >= RANK.hop) cap('nudge', 'G6_resonant_surface') // R07 F46
  if (!surfaceOk && r === RANK.nudge) cap('settle', 'G6_resonant_surface') // R03 G6
  return ['performed', NAME[r], reason]
}

/**
 * Contract v0.4 decision (R08 §06). On a LOT pad, at the home spot, the pad certifies the
 * SURFACE (damped, deck runway) and never the AIRSPACE (obstacles, dirty windows).
 */
export function decide(sig: Record<string, unknown>, st: CubiqDeviceState): Decision {
  const pad = st.pad
  if (pad && pad.model_ok && pad.home_spot) {
    const credited: CubiqDeviceState = { ...st }
    if (!st.tof_window_dirty) credited.surface = 'damped'
    const runway = Object.assign(table<number>({}), FREE_AHEAD_MM, PAD_FREE_AHEAD_MM)
    return decideCore(sig, credited, runway)
  }
  return decideCore(sig, st, FREE_AHEAD_MM)
}

/**
 * Contract v0.6-DRAFT (R10 §02, R11 §02). NOT ADOPTED: edge_seen thresholds wait for bench item B31.
 *   · pad credit needs model_ok, home_spot AND edge_seen, each the literal `true`
 *   · timestamps: the R11 calendar rule and microsecond comparison (parseTsMicros)
 *   · surface_motion: 'gentle' caps jump at leap; anything but still/gentle defers (G11)
 * decide() above stays the v0.5 behaviour until S-2 adopts v0.6.
 */
export function decideV06Draft(sig: Record<string, unknown>, st: CubiqDeviceState): Decision {
  const pad = st.pad
  if (pad && pad.model_ok === true && pad.home_spot === true && pad.edge_seen === true) {
    const credited: CubiqDeviceState = { ...st }
    if (!st.tof_window_dirty) credited.surface = 'damped'
    const runway = Object.assign(table<number>({}), FREE_AHEAD_MM, PAD_FREE_AHEAD_MM)
    return decideCore(sig, credited, runway, true)
  }
  return decideCore(sig, st, FREE_AHEAD_MM, true)
}

// ------------------------------------------------------------------ platform encoder (R09 F64)

/** Events the Index of Systems can raise toward a cube. */
export interface CubiqPlatformEvent {
  class: SignalClass
  /** when the event became true (ISO 8601, UTC) */
  at: string
  /** operator is on a live call, as known to the platform (optional) */
  callLive?: boolean
  /** queue order only; decide() never reads it */
  priority?: 0 | 1 | 2 | 3
}

/** Platform achievement rarity (src/server/utils/rpg-narrative.ts, 5 tiers). */
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * Five platform rarities → two contract classes (R09 F64). The cube's largest gesture is kept
 * scarcer than the platform's word "rare": only epic and legendary become badge_rare (LEAP).
 * Anything without a rarity (e.g. Badge Codex entries) is badge_common.
 */
export function achievementClass(rarity?: string | null): SignalClass {
  return rarity === 'epic' || rarity === 'legendary' ? 'badge_rare' : 'badge_common'
}

/** The platform asks for the most an operator could have allowed: default + 1 rung, max leap. */
export function platformAsk(cls: string): Gesture {
  const def = has(CLASS_CEILING, cls) ? CLASS_CEILING[cls] : 'settle'
  return NAME[Math.min(RANK[def] + 1, RANK[OPERATOR_MAX])]
}

/** Time-to-live per class: how long the event is still worth a gesture (R09 §03). */
export const CLASS_TTL_S: Readonly<Record<SignalClass, number>> = Object.freeze({
  memory_ready: 6 * 3600,
  badge_common: 3600,
  badge_rare: 3 * 3600,
  assembly_phase: 3600,
  cohort_ping: 15 * 60,
})

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** ULID: 48-bit ms timestamp + 80 random bits, Crockford base32, 26 chars. */
export function ulid(ms: number, random: () => number = Math.random): string {
  let t = Math.floor(ms)
  let time = ''
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[t % 32] + time
    t = Math.floor(t / 32)
  }
  let rnd = ''
  for (let i = 0; i < 16; i++) rnd += CROCKFORD[Math.floor(random() * 32) % 32]
  return time + rnd
}

/** Event → wire signal (contract v2 message). Never pre-clamps to the operator's ceilings. */
export function encodeSignal(ev: CubiqPlatformEvent, random?: () => number): CubiqSignal {
  const at = parseTs(ev.at)
  if (Number.isNaN(at)) throw new Error(`cubiq: bad event time ${ev.at}`)
  const sig: CubiqSignal = {
    v: 2,
    id: 'sig_' + ulid(at, random),
    class: ev.class,
    intent: platformAsk(ev.class),
    priority: ev.priority ?? 2,
    ttl_s: CLASS_TTL_S[ev.class],
    not_before: new Date(at).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  }
  if (ev.callLive) sig.ceiling_hint = 'call_live'
  return sig
}
