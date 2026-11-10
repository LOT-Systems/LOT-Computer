// Run: node --experimental-strip-types --test scripts/qi46/qi46.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  QI46_REGISTERS,
  createBeingProfile,
  canIngest,
  calibrate,
  composeDirective,
  dominantRegisters,
  eraseBeingProfile,
  normalizeWeights,
} from '../../src/shared/utils/qi46.ts'

const sum = (w: Record<string, number>) => Object.values(w).reduce((a, b) => a + b, 0)

test('new profile: uniform registers, zero consent', () => {
  const p = createBeingProfile('u1')
  assert.ok(Math.abs(sum(p.registers) - 1) < 1e-9)
  for (const r of QI46_REGISTERS) assert.ok(Math.abs(p.registers[r] - 1 / 6) < 1e-9)
  assert.equal(canIngest(p, 'journal', 'u1'), false)
})

test('consent gate: self-only, per-source', () => {
  const p = createBeingProfile('u1', { journal: true })
  assert.equal(canIngest(p, 'journal', 'u1'), true)
  assert.equal(canIngest(p, 'chat', 'u1'), false)
  assert.equal(canIngest(p, 'journal', 'someone-else'), false)
})

test('normalize: floors and sums to 1', () => {
  const w = normalizeWeights({ hug: 1 })
  assert.ok(Math.abs(sum(w) - 1) < 1e-9)
  for (const r of QI46_REGISTERS) assert.ok(w[r] > 0)
  assert.ok(w.hug > 0.8)
})

test('landed feedback pulls toward used mix; missed pushes away', () => {
  let p = createBeingProfile('u1')
  for (let i = 0; i < 20; i++) p = calibrate(p, { used: { hug: 0.7, beingThere: 0.3 }, landed: true })
  assert.deepEqual(dominantRegisters(p, 2).sort(), ['beingThere', 'hug'])
  assert.ok(Math.abs(sum(p.registers) - 1) < 1e-9)
  const before = p.registers.cool
  let q = createBeingProfile('u2')
  for (let i = 0; i < 10; i++) q = calibrate(q, { used: { cool: 1 }, landed: false })
  assert.ok(q.registers.cool < 1 / 6)
  assert.ok(before > 0)
})

test('directive carries honesty clause and voice', () => {
  const p = { ...createBeingProfile('u1', {}, 'male') }
  const d = composeDirective(p)
  assert.match(d, /not the person, and not human/)
  assert.match(d, /Voice persona: male/)
})

test('crisis override strips registers', () => {
  const p = calibrate(createBeingProfile('u1'), { used: { poetry: 1 }, landed: true })
  const d = composeDirective(p, { crisis: true })
  assert.match(d, /Safety override/)
  assert.doesNotMatch(d, /poetry/)
})

test('erase returns clean profile', () => {
  const p = calibrate(createBeingProfile('u1', { journal: true }, 'male'), { used: { love: 1 }, landed: true })
  const e = eraseBeingProfile(p)
  assert.equal(e.samples, 0)
  assert.equal(e.consent.journal, false)
  assert.equal(e.voice, 'neutral')
})
