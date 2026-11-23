/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Verification for the Log command system (LCX-1).
 * Run: npx tsx scripts/verify-log-commands.ts
 * Exits non-zero on the first failed assertion group.
 */

import assert from 'node:assert/strict'
import {
  compressLogs,
  parseStoryHorizon,
  stripCommands,
  stripMachineOutput,
  toMachineBlock,
  fallbackStory,
  renderDigestBlock,
  computeArcade,
  levelForXp,
  xpForLevel,
  rankForLevel,
  type CompressibleLog,
} from '../src/shared/utils/log-compression'
import {
  detectTriggers,
  detectNewTriggers,
  missingFromRegistry,
  renderSystemHelp,
  COMMAND_REGISTRY,
} from '../src/client/utils/logTriggers'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  PASS  ${name}`)
  } catch (e: any) {
    console.error(`  FAIL  ${name}\n        ${e.message}`)
    process.exit(1)
  }
}

const NOW = new Date('2026-11-23T12:00:00Z')
const h = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3600_000)
const ctx = (over: Record<string, any> = {}) => ({
  temperature: 287.15, humidity: 60, city: 'Brooklyn', astroMoonPhase: 'Waxing Gibbous',
  astroWesternZodiac: 'Sagittarius', weatherDescription: 'clear sky', ...over,
})

console.log('LCX-1 · LOG COMMAND SYSTEM VERIFICATION')

// ── Triggers / registry ────────────────────────────────────────────────────
check('/system detected', () => assert.deepEqual(detectTriggers('/system'), ['system-help']))
check('/story detected, /storyteller not', () => {
  assert.ok(detectTriggers('/story week').includes('story-mode'))
  assert.ok(!detectTriggers('/storyteller').includes('story-mode'))
})
check('/arcade detected', () => assert.ok(detectTriggers('hello /arcade').includes('arcade-report')))
check('delta only: editing around /story does not re-fire', () =>
  assert.deepEqual(detectNewTriggers('/story week and more', '/story week'), []))
check('registry covers every trigger', () => assert.deepEqual(missingFromRegistry(), []))
check('registry has no duplicates', () => {
  const t = COMMAND_REGISTRY.map(c => c.trigger)
  assert.equal(new Set(t).size, t.length)
})
check('/system output lists /story horizons and /arcade', () => {
  const out = renderSystemHelp()
  assert.ok(out.includes('/story [day|week|month|year]'))
  assert.ok(out.includes('/arcade'))
  assert.ok(out.includes('NARRATIVE'))
})

// ── Horizon parsing ────────────────────────────────────────────────────────
check('horizon default week', () => assert.equal(parseStoryHorizon('/story'), 'week'))
check('horizon day/today', () => {
  assert.equal(parseStoryHorizon('/story day'), 'day')
  assert.equal(parseStoryHorizon('text /story today'), 'day')
})
check('horizon month/year', () => {
  assert.equal(parseStoryHorizon('/story month'), 'month')
  assert.equal(parseStoryHorizon('/STORY Year'), 'year')
})
check('horizon unknown → week', () => assert.equal(parseStoryHorizon('/story banana'), 'week'))

// ── Stripping ──────────────────────────────────────────────────────────────
check('stripCommands removes commands and trigger emoji', () =>
  assert.equal(stripCommands('slept well /story week 📖'), 'slept well'))
check('machine block round-trip', () => {
  const entry = 'morning walk\n\n' + toMachineBlock('📖', 'Para one.\n\nPara two.') + '\n\nlater thought'
  assert.equal(stripMachineOutput(entry).replace(/\n+/g, ' ').trim(), 'morning walk later thought')
})

// ── Compression ────────────────────────────────────────────────────────────
const logs: CompressibleLog[] = [
  { event: 'note', text: 'Grateful for the quiet morning tea', createdAt: h(100), context: ctx() },
  { event: 'emotional_checkin', metadata: { emotionalState: 'grateful', intensity: 8 }, createdAt: h(90), context: ctx() },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: h(80), context: ctx() },
  { event: 'emotional_checkin', metadata: { emotionalState: 'anxious', intensity: 7 }, createdAt: h(20), context: ctx({ temperature: 275.15 }) },
  { event: 'emotional_checkin', metadata: { emotionalState: 'exhausted', intensity: 9 }, createdAt: h(10), context: ctx({ temperature: 275.15 }) },
  { event: 'note', text: 'tired and worried about work', createdAt: h(5), context: ctx({ city: 'Queens' }) },
  { event: 'note', text: '/system', createdAt: h(4), context: ctx() }, // command-only → ignored
  { event: 'memory_answer', metadata: { question: 'Morning drink?', option: 'Tea' }, createdAt: h(30), context: ctx() },
  { event: 'note', text: 'ancient entry', createdAt: h(24 * 400), context: ctx() }, // outside year
]

check('journal events are "note" (regression: old /story filtered log_entry/journal only)', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.equal(d.counts.journal, 2)
})
check('window bounds respected', () => {
  assert.equal(compressLogs(logs, 'day', NOW).counts.journal, 1)
  assert.equal(compressLogs(logs, 'year', NOW).counts.journal, 2)
})
check('peaks: one high, one low', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.equal(d.peaks.length, 2)
  assert.equal(d.peaks.find(p => p.kind === 'high')!.label, 'GRATEFUL')
  assert.equal(d.peaks.find(p => p.kind === 'low')!.label, 'EXHAUSTED')
})
check('mood drift falling → follow-up question', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.equal(d.moodDrift, 'falling')
  assert.ok(d.followUp && d.followUp.includes('trending down'))
})
check('environment aggregated from context snapshots', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.deepEqual(d.environment.cities.sort(), ['Brooklyn', 'Queens'])
  assert.equal(d.environment.tempC!.min, 2)
  assert.equal(d.environment.tempC!.max, 14)
  assert.equal(d.environment.moonPhase, 'Waxing Gibbous')
})
check('digest block contains no ids/emails', () => {
  const block = renderDigestBlock(compressLogs(logs, 'week', NOW))
  assert.ok(!/@/.test(block))
  assert.ok(block.includes('PEAKS:'))
})
check('empty window → silent + honest fallback', () => {
  const d = compressLogs([], 'day', NOW)
  assert.equal(d.rhythm, 'silent')
  assert.equal(d.followUp, null)
  assert.ok(fallbackStory(d).startsWith('Nothing recorded today'))
})
check('fallback story uses only digest facts', () => {
  const s = fallbackStory(compressLogs(logs, 'week', NOW))
  assert.ok(s.includes('2 entries'))
  assert.ok(s.includes('GRATEFUL'))
})
check('month sampling caps journal excerpts and keeps newest', () => {
  const many: CompressibleLog[] = Array.from({ length: 60 }, (_, i) => ({
    event: 'note', text: `entry ${i}`, createdAt: h(600 - i * 10), context: {},
  }))
  const d = compressLogs(many, 'month', NOW)
  assert.equal(d.journal.length, 12)
  assert.equal(d.journal[11], 'entry 59')
})

// ── Arcade ─────────────────────────────────────────────────────────────────
check('xp curve', () => {
  assert.equal(xpForLevel(1), 0)
  assert.equal(xpForLevel(2), 100)
  assert.equal(levelForXp(99), 1)
  assert.equal(levelForXp(100), 2)
  assert.equal(levelForXp(300), 3)
})
check('ranks', () => {
  assert.equal(rankForLevel(1), 'SIGNAL')
  assert.equal(rankForLevel(3), 'OPERATOR')
  assert.equal(rankForLevel(99), 'SAGE')
})
check('arcade: command-only notes earn no XP; streak counts', () => {
  const a = computeArcade(logs, NOW)
  // notes 2×10 (+ ancient 10) + 4 moods×5 + answer 5 = 55
  assert.equal(a.xp, 55)
  assert.ok(a.streakDays >= 1)
})

console.log(`\nALL ${passed} CHECKS GREEN`)
