/**
 * CUBIQ(tm) — R10 platform reference check. Plain Node 22 (type stripping, no deps):
 *     node scripts/cubiq-r10-contract-check.ts
 *     node scripts/cubiq-r10-contract-check.ts --cases <file.json> [v05|v06]   (differential mode)
 * Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md §02.
 *   1. v0.4 (54) and v0.5 (59) vectors through decide()          — must be unchanged by R10
 *   2. v0.6-draft (72) vectors through decideV06Draft()
 *   3. v0.6-draft is a strict extension: on every v0.5 vector whose pad is credited, adding
 *      edge_seen: true and surface_motion: 'still' gives the v0.5 outcome
 *   4. the R09 encoder checks still pass (run as a child: scripts/cubiq-r09-contract-check.ts)
 * Exit code 0 only if everything passes.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { decide, decideV06Draft, type CubiqDeviceState, type Decision } from '../src/shared/cubiq/signal-contract.ts'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
type Fn = (s: Record<string, unknown>, st: CubiqDeviceState) => Decision

if (args[0] === '--cases') {
  const cases = JSON.parse(readFileSync(args[1], 'utf8')) as { signal: Record<string, unknown>; state: CubiqDeviceState }[]
  const fn: Fn = args[2] === 'v05' ? decide : decideV06Draft
  // R11: a throw (v0.6-draft bad device clock, F86) is reported as ["crash"], like the Python harness
  const run = (c: { signal: Record<string, unknown>; state: CubiqDeviceState }) => {
    try {
      return fn(c.signal, c.state)
    } catch {
      return ['crash']
    }
  }
  process.stdout.write(JSON.stringify(cases.map(run)))
} else {
  process.exitCode = runChecks()
}

function load(ver: string): any[] {
  const path = join(here, '..', 'docs', 'corporate', 'cubiq', `signal-contract-${ver}-vectors.json`)
  return JSON.parse(readFileSync(path, 'utf8')).vectors
}

function runChecks(): number {
  let fails = 0
  const run = (ver: string, fn: Fn, label: string) => {
    const vectors = load(ver)
    let pass = 0
    for (const v of vectors) {
      const got = fn(v.signal, v.state)
      const want = [v.expect.event, v.expect.performed, v.expect.downgrade_reason]
      if (JSON.stringify(got) === JSON.stringify(want)) pass++
      else {
        fails++
        console.log(`  FAIL  ${v.name}  got ${JSON.stringify(got)}  want ${JSON.stringify(want)}`)
      }
    }
    console.log(`  contract ${ver}: ${pass}/${vectors.length} vectors pass (TypeScript ${label})`)
  }
  run('v0.4', decide, 'decide')
  run('v0.5', decide, 'decide')
  run('v0.6-draft', decideV06Draft, 'decideV06Draft')

  // strict extension over v0.5
  let ext = 0
  let extPass = 0
  for (const v of load('v0.5')) {
    const st = structuredClone(v.state) as CubiqDeviceState
    if (st.pad) st.pad.edge_seen = true
    st.surface_motion = 'still'
    ext++
    if (JSON.stringify(decideV06Draft(v.signal, st)) === JSON.stringify(decide(v.signal, v.state))) extPass++
    else {
      fails++
      console.log(`  FAIL  extension: ${v.name}`)
    }
  }
  console.log(`  v0.6-draft == v0.5 when edge_seen is true and the surface is still: ${extPass}/${ext}`)

  // R09 encoder checks, unchanged
  try {
    const out = execFileSync(process.execPath, [join(here, 'cubiq-r09-contract-check.ts')], { encoding: 'utf8' })
    const line = out.split('\n').find((l) => l.includes('encoder:')) ?? '  encoder: (no summary line)'
    console.log(line)
  } catch {
    fails++
    console.log('  FAIL  R09 encoder / vector checks')
  }
  return fails ? 1 : 0
}
