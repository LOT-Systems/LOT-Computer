/**
 * CUBIQ(tm) Quantum Cube — signal contract, platform reference (TypeScript).
 *
 * Spec:  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md §02-§03
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
}

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

function isInt(x: unknown): x is number {
  return typeof x === 'number' && Number.isInteger(x)
}

/** Returns a rejection reason, or null when the message is well formed. */
export function validate(sig: Record<string, unknown>): string | null {
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
  if (Number.isNaN(parseTs(s.not_before))) return 'bad_not_before'
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
function decideCore(sig: Record<string, unknown>, st: CubiqDeviceState, freeAhead: Record<string, number>): Decision {
  const err = validate(sig)
  if (err) return ['rejected', 'none', err]
  const s = sig as unknown as CubiqSignal
  const now = parseTs(st.now)
  const nb = parseTs(s.not_before)
  if (now > nb + s.ttl_s * 1000) return ['expired', 'none', null]
  if (now < nb) return ['held', 'none', null]
  if (st.fall_recent) return ['safe_hold', 'none', 'G8_fall_recent']
  if (st.machine_vibration) return ['deferred', 'none', 'G9_machine_vibration']

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
