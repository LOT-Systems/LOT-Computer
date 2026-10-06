/**
 * Log system tests: slash-command registry, story compression, arcade rank.
 * Run: npm run test:log
 */
import assert from 'node:assert/strict'
import { detectTriggers } from '../../src/client/utils/logTriggers'
import { LOG_COMMANDS, renderSystemHelp } from '../../src/client/utils/logCommands'
import {
  cleanJournalText, compressLogs, countWords, detectShifts, journalStreak,
  parseStoryScope, renderStory, type StoryLogInput,
} from '../../src/shared/utils/logStory'
import { computeArcade } from '../../src/shared/utils/logArcade'

let passed = 0
const test = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS  ${name}`) }

const NOW = new Date(2026, 9, 6, 12, 0, 0)
const daysAgo = (n: number, h = 9) => new Date(2026, 9, 6 - n, h, 0, 0)
const note = (n: number, text: string, context: Record<string, any> = {}): StoryLogInput =>
  ({ event: 'note', text, createdAt: daysAgo(n), context })

// ---- registry --------------------------------------------------------------
test('every documented command is detected by its trigger', () => {
  LOG_COMMANDS.forEach(c => {
    assert.ok(detectTriggers(`${c.command} `).includes(c.trigger), `${c.command} -> ${c.trigger}`)
  })
})
test('every keyword trigger is documented in /system (or explicitly exempt)', () => {
  const exempt = new Set(['sil-check', 'cohort-support'])
  const documented = new Set(LOG_COMMANDS.map(c => c.trigger))
  ;['/synth', '/scan', '/silent', '/breathe', '/fast', '/radio', '/night', '/prayer', '/freeze',
    '/qos', '/assembly', '/phys', '/sil', '/qi', '/system', '/story', '/how', '/rank']
    .forEach(cmd => detectTriggers(`${cmd} `).forEach(t => {
      assert.ok(documented.has(t) || exempt.has(t), `${cmd} (${t}) missing from registry`)
    }))
})
test('/system help lists all commands and the rank line', () => {
  const help = renderSystemHelp('RANK SIGNAL')
  LOG_COMMANDS.forEach(c => assert.ok(help.includes(c.command)))
  assert.ok(help.startsWith('RANK SIGNAL'))
})
test('/scandalous does not fire /scan', () => {
  assert.deepEqual(detectTriggers('/scandalous'), [])
})

// ---- story -----------------------------------------------------------------
test('parseStoryScope', () => {
  assert.equal(parseStoryScope('/story'), 'day')
  assert.equal(parseStoryScope('hello /story week'), 'week')
  assert.equal(parseStoryScope('/story YEAR'), 'year')
  assert.equal(parseStoryScope('/story forever'), 'day')
})
test('generated blocks and commands are not counted as journal words', () => {
  assert.equal(countWords('slept badly /story\n\n📖 You wrote a lot of words here'), 2)
  assert.equal(cleanJournalText('/system'), '')
})
test('compression: counts, streak, context', () => {
  const logs = [
    note(0, 'good morning run', { city: 'Austin', temperature: 293.15, astroMoonPhase: 'Waxing' }),
    note(1, 'tired but ok', { city: 'Austin', temperature: 288.15 }),
    note(2, 'long quiet day', { city: 'Austin' }),
    note(9, 'old entry'),
    { event: 'emotional_checkin', text: null, createdAt: daysAgo(1), metadata: { emotionalState: 'Calm' } },
  ]
  const week = compressLogs(logs, 'week', NOW)
  assert.equal(week.entries, 3)
  assert.equal(week.activeDays, 3)
  assert.equal(week.streak, 3)
  assert.equal(week.topCity, 'Austin')
  assert.deepEqual(week.tempC, { min: 15, max: 20 })
  assert.deepEqual(week.moods, [{ mood: 'calm', count: 1 }])
  assert.equal(compressLogs(logs, 'year', NOW).entries, 4)
  assert.ok(renderStory(week).includes('STORY WEEK'))
})
test('empty journal renders an invitation, not an error', () => {
  assert.ok(renderStory(compressLogs([], 'day', NOW)).includes('No journal entries'))
})
test('streak survives an unfinished day', () => {
  assert.equal(journalStreak([note(1, 'a'), note(2, 'b')], NOW), 2)
  assert.equal(journalStreak([note(3, 'a')], NOW), 0)
})
test('spike: big day against a steady baseline', () => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8].map(n => note(n, 'ten words '.repeat(5)))
  const big = note(0, 'word '.repeat(120))
  assert.ok(detectShifts([...base, big], NOW, 1).some(s => s.kind === 'spike'))
  assert.ok(!detectShifts(base, NOW, 1).some(s => s.kind === 'spike'))
})
test('silence: active stretch then 3+ quiet days', () => {
  const base = [4, 5, 6, 7, 8].map(n => note(n, 'some words here'))
  assert.ok(detectShifts(base, NOW, 7).some(s => s.kind === 'silence'))
})

// ---- arcade ----------------------------------------------------------------
test('arcade: rank is pure, monotonic, and depth-capped', () => {
  assert.equal(computeArcade([], NOW).rank, 'RECRUIT')
  const few = computeArcade([note(0, 'x')], NOW)
  const wall = computeArcade([note(0, 'word '.repeat(5000))], NOW)
  assert.ok(wall.xp - few.xp <= 4, 'volume must not farm XP')
  const month = Array.from({ length: 30 }, (_, i) => note(i, 'daily check in', { city: 'Austin' }))
  const a = computeArcade(month, NOW)
  assert.ok(a.xp > few.xp)
  assert.notEqual(a.rank, 'RECRUIT')
  assert.equal(a.streak, 30)
  assert.deepEqual(computeArcade(month, NOW), a)
})

console.log(`\n${passed} tests passed`)
