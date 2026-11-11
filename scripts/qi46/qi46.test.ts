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
  detectQi46Signals,
  directiveForMessage,
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

test('crisis detector: flags crisis language', () => {
  for (const t of [
    'I want to kill myself',
    'honestly everyone would be better off without me',
    "I can't go on like this",
    'thinking about suicide again',
    'I want to end my life',
  ]) assert.equal(detectQi46Signals(t).crisis, true, t)
})

test('crisis detector: ignores ordinary language', () => {
  for (const t of ['', 'this deadline is killing me', 'I love this song to death', 'cut the onions', 'going to the gym']) {
    assert.equal(detectQi46Signals(t).crisis, false, t)
  }
})

test('directiveForMessage: crisis drops registers, ordinary keeps them', () => {
  const p = createBeingProfile('u1')
  const crisis = directiveForMessage(p, 'I want to die')
  assert.match(crisis, /Safety override/)
  assert.doesNotMatch(crisis, /Registers/)
  const calm = directiveForMessage(p, 'long day, but good')
  assert.match(calm, /Registers, strongest first/)
  assert.match(calm, /not the person, and not human/)
})
