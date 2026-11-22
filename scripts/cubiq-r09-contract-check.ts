/**
 * CUBIQ(tm) — R09 platform reference check. Runs with plain Node (type stripping, no deps):
 *     node scripts/cubiq-r09-contract-check.ts
 *     node scripts/cubiq-r09-contract-check.ts --cases <file.json>   (differential mode)
 * Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md §02-§03.
 *   1. contract v0.4 vectors (54) and v0.5 vectors (57) through the TypeScript decide()
 *   2. encoder checks: every event class encodes to a valid message whose outcome on a
 *      clear, damped desk equals the class default, and the operator's one-rung raise
 *      still takes effect (the encoder never pre-clamps)
 * Exit code 0 only if everything passes.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  decide,
  encodeSignal,
  achievementClass,
  validate,
  CLASS_TTL_S,
  type CubiqDeviceState,
  type SignalClass,
} from '../src/shared/cubiq/signal-contract.ts'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

if (args[0] === '--cases') {
  const cases = JSON.parse(readFileSync(args[1], 'utf8')) as { signal: Record<string, unknown>; state: CubiqDeviceState }[]
  // exitCode, not exit(): a piped stdout must drain before the process ends
  process.stdout.write(JSON.stringify(cases.map((c) => decide(c.signal, c.state))))
} else {
  process.exitCode = runChecks()
}

function runChecks(): number {

let fails = 0
for (const ver of ['v0.4', 'v0.5']) {
  const path = join(here, '..', 'docs', 'corporate', 'cubiq', `signal-contract-${ver}-vectors.json`)
  const vectors = JSON.parse(readFileSync(path, 'utf8')).vectors as any[]
  let pass = 0
  for (const v of vectors) {
    const got = decide(v.signal, v.state)
    const want = [v.expect.event, v.expect.performed, v.expect.downgrade_reason]
    const ok = JSON.stringify(got) === JSON.stringify(want)
    if (ok) pass++
    else {
      fails++
      console.log(`  FAIL  ${v.name}  got ${JSON.stringify(got)}  want ${JSON.stringify(want)}`)
    }
  }
  console.log(`  contract ${ver}: ${pass}/${vectors.length} vectors pass (TypeScript decide)`)
}

// ---- encoder
const DEFAULT: Record<SignalClass, string> = {
  memory_ready: 'nudge',
  badge_common: 'hop',
  badge_rare: 'leap',
  assembly_phase: 'settle',
  cohort_ping: 'settle',
}
const RAISED: Record<SignalClass, string> = {
  memory_ready: 'hop',
  badge_common: 'leap',
  badge_rare: 'leap',
  assembly_phase: 'nudge',
  cohort_ping: 'nudge',
}
let seed = 7
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const at = '2026-11-22T09:00:00Z'
const desk: CubiqDeviceState = { now: '2026-11-22T09:00:05Z', device: 'v0', surface: 'damped', free_ahead_mm: 300, level_deg: 0.5 }
let encPass = 0
let encTotal = 0
console.log('  encoder (platform asks one rung above the class default, max leap):')
for (const cls of Object.keys(DEFAULT) as SignalClass[]) {
  const sig = encodeSignal({ class: cls, at }, rnd)
  const checks: [string, boolean][] = [
    ['valid', validate(sig as Record<string, unknown>) === null],
    ['id', /^sig_[0-9A-HJKMNP-TV-Z]{26}$/.test(sig.id)],
    ['ttl', sig.ttl_s === CLASS_TTL_S[cls]],
    ['default', decide(sig, desk)[1] === DEFAULT[cls]],
    ['raised', decide(sig, { ...desk, operator_ceilings: { [cls]: RAISED[cls] } })[1] === RAISED[cls]],
    ['live', decide(encodeSignal({ class: cls, at, callLive: true }, rnd), desk)[1] === 'settle'],
    ['expired', decide(sig, { ...desk, now: new Date(Date.parse(at) + (sig.ttl_s + 1) * 1000).toISOString() })[0] === 'expired'],
  ]
  const bad = checks.filter(([, ok]) => !ok).map(([n]) => n)
  encTotal += checks.length
  encPass += checks.length - bad.length
  fails += bad.length
  console.log(
    `    ${bad.length ? 'FAIL' : 'PASS'}  ${cls.padEnd(15)} ask ${sig.intent.padEnd(6)} ttl ${String(sig.ttl_s).padStart(5)} s` +
      `  default -> ${DEFAULT[cls].padEnd(6)} raised -> ${RAISED[cls].padEnd(6)} ${bad.length ? 'failed: ' + bad.join(',') : ''}`,
  )
}
const RARITY: [string | null, SignalClass][] = [
  ['common', 'badge_common'], ['uncommon', 'badge_common'], ['rare', 'badge_common'],
  ['epic', 'badge_rare'], ['legendary', 'badge_rare'], [null, 'badge_common'], ['mythic', 'badge_common'],
]
for (const [rarity, want] of RARITY) {
  encTotal++
  if (achievementClass(rarity) === want) encPass++
  else {
    fails++
    console.log(`    FAIL  rarity ${rarity} -> ${achievementClass(rarity)}, want ${want}`)
  }
}
console.log(`    rarity map: common/uncommon/rare -> badge_common (HOP) · epic/legendary -> badge_rare (LEAP)`)
console.log(`  encoder: ${encPass}/${encTotal} checks pass`)
return fails ? 1 : 0
}
