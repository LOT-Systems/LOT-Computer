/**
 * LOT SYSTEMS CORPORATION — Log Command System verification
 * Run: npx tsx scripts/verify-log-commands.ts
 * Pure assertions against src/shared/utils/logCommands.ts. Exit 1 on failure.
 */
import assert from 'node:assert/strict'
import {
  LOG_COMMANDS,
  formatSystemHelp,
  parseStoryScope,
  stripStoryCommand,
  buildStoryDigest,
  formatDigestForPrompt,
  computeArcadeState,
  formatArcadeLines,
  spreadSample,
  type DigestLog,
} from '../src/shared/utils/logCommands'
import { detectTriggers } from '../src/client/utils/logTriggers'

let passed = 0
const t = (name: string, fn: () => void) => {
  fn()
  passed++
  console.log(`PASS  ${name}`)
}

const NOW = new Date('2026-11-11T12:00:00Z')
const daysAgo = (n: number, h = 0) => new Date(NOW.getTime() - n * 86400000 - h * 3600000)

// ── Registry ↔ trigger parity ──────────────────────────────────────────────
t('every registry command fires a trigger', () => {
  for (const c of LOG_COMMANDS) {
    assert.ok(detectTriggers(`/${c.name}`).length > 0, `/${c.name} has no trigger`)
    for (const a of c.aliases || []) assert.ok(detectTriggers(`/${a}`).length > 0, `/${a} alias`)
  }
})
t('/system lists every command once', () => {
  const help = formatSystemHelp().join('\n')
  for (const c of LOG_COMMANDS) assert.ok(help.includes(`/${c.name}`), c.name)
  assert.ok(help.includes('/story [day|week|month|year]'))
  assert.ok(help.includes('/level'))
})
t('/level and /system and /story detected', () => {
  assert.deepEqual(detectTriggers('/level'), ['arcade-level'])
  assert.ok(detectTriggers('hello /system').includes('system-help'))
  assert.ok(detectTriggers('/story week').includes('story-mode'))
  assert.equal(detectTriggers('/levels').length, 0)
})

// ── Story scope ────────────────────────────────────────────────────────────
t('parseStoryScope', () => {
  assert.equal(parseStoryScope('/story'), 'recent')
  assert.equal(parseStoryScope('/story week'), 'week')
  assert.equal(parseStoryScope('rainy day /story Month'), 'month')
  assert.equal(parseStoryScope('/story y'), 'year')
  assert.equal(parseStoryScope('/story today'), 'day')
  assert.equal(parseStoryScope('/story about cats'), 'recent')
})
t('stripStoryCommand', () => {
  assert.equal(stripStoryCommand('long walk /story week'), 'long walk')
  assert.equal(stripStoryCommand('📖 /story'), '')
  assert.equal(stripStoryCommand('/story about the sea'), 'about the sea')
})

// ── Digest ─────────────────────────────────────────────────────────────────
const logs: DigestLog[] = [
  { event: 'note', text: 'Ran by the river', createdAt: daysAgo(0, 2), context: { city: 'Lisbon', temperature: 293.15, weatherDescription: 'Clear sky', astroMoonPhase: 'Waxing Crescent' } },
  { event: 'note', text: 'Slow morning', createdAt: daysAgo(2), context: { city: 'Lisbon', temperature: 288.15 } },
  { event: 'note', text: 'Old note', createdAt: daysAgo(40), context: { city: 'Paris' } },
  { event: 'note', text: '   ', createdAt: daysAgo(1) },
  { event: 'emotional_checkin', createdAt: daysAgo(1, 2), metadata: { emotionalState: 'grateful', note: 'sun' }, context: { city: 'Lisbon' } },
  { event: 'emotional_checkin', createdAt: daysAgo(3), metadata: { emotionalState: 'anxious' } },
  { event: 'answer', createdAt: daysAgo(4), metadata: { question: 'Tea or coffee?', option: 'Tea' } },
]
t('digest: day window', () => {
  const d = buildStoryDigest(logs, 'day', NOW)
  assert.equal(d.entryCount, 1)
  assert.deepEqual(d.cities, ['Lisbon'])
  assert.deepEqual(d.tempRangeC, [20, 20])
  assert.equal(d.high, null)
})
t('digest: week window with peaks', () => {
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.equal(d.entryCount, 2, 'blank note excluded, 40d note excluded')
  assert.equal(d.high?.mood, 'grateful')
  assert.equal(d.low?.mood, 'anxious')
  assert.equal(d.avgValence, 0)
  assert.equal(d.selfCare[0], 'Tea or coffee?: Tea')
  assert.deepEqual(d.tempRangeC, [15, 20])
  assert.ok(!d.cities.includes('Paris'))
})
t('digest: month includes older note', () => {
  const d = buildStoryDigest(logs, 'year', NOW)
  assert.equal(d.entryCount, 3)
  assert.ok(d.cities.includes('Paris'))
})
t('digest: bounded size for large windows', () => {
  const many: DigestLog[] = Array.from({ length: 900 }, (_, i) => ({
    event: 'note', text: `entry ${i}`, createdAt: daysAgo(i % 360),
  }))
  const d = buildStoryDigest(many, 'year', NOW)
  assert.equal(d.samples.length, 8)
  assert.ok(formatDigestForPrompt(d).length < 4000)
})
t('spreadSample keeps endpoints', () => {
  const s = spreadSample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4)
  assert.equal(s[0], 1)
  assert.equal(s[3], 10)
})

// ── Arcade ─────────────────────────────────────────────────────────────────
t('arcade: empty', () => {
  const a = computeArcadeState([], NOW)
  assert.equal(a.xp, 0)
  assert.equal(a.title, 'INITIATE')
  assert.equal(a.currentStreak, 0)
})
t('arcade: multiple entries same day = one credit', () => {
  const a = computeArcadeState([daysAgo(0, 1), daysAgo(0, 2), daysAgo(0, 3)], NOW)
  assert.equal(a.xp, 10)
  assert.equal(a.activeDays, 1)
})
t('arcade: streak bonus, capped', () => {
  const dates = Array.from({ length: 10 }, (_, i) => daysAgo(i))
  const a = computeArcadeState(dates, NOW)
  // bonuses 0,2,4,6,8,10,10,10,10,10 = 70; base 100
  assert.equal(a.xp, 170)
  assert.equal(a.currentStreak, 10)
  assert.equal(a.longestStreak, 10)
  assert.equal(a.title, 'RECORDER')
})
t('arcade: gap breaks current streak, never subtracts xp', () => {
  const a = computeArcadeState([daysAgo(5), daysAgo(6)], NOW)
  assert.equal(a.currentStreak, 0)
  assert.equal(a.longestStreak, 2)
  assert.equal(a.xp, 22)
})
t('arcade: format lines', () => {
  const lines = formatArcadeLines(computeArcadeState([daysAgo(0)], NOW))
  assert.ok(lines[0].startsWith('RANK            LV 1 · INITIATE'))
  assert.ok(lines.some(l => l.includes('NO PENALTIES')))
})

console.log(`\n${passed} checks passed`)
