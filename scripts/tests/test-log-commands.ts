/**
 * LOG COMMANDS + STORY SELF-CHECK
 * Run: node --experimental-strip-types scripts/tests/test-log-commands.ts
 * Pure modules only — no DB, no network, no DOM.
 */
import assert from 'node:assert/strict'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'
import { COMMANDS, formatSystemHelp, rankFor, MAX_XP, RANKS } from '../../src/client/utils/logCommands.ts'
import { buildStoryDigest, renderDigestLines, detectStoryPeriod, isStoryPeriod } from '../../src/shared/utils/logStory.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`PASS  ${name}`) }

// --- Registry parity -------------------------------------------------------
t('every registry usage fires its own trigger', () => {
  for (const c of COMMANDS) {
    const word = c.usage.split(' ')[0]
    assert.ok(detectTriggers(`${word} `).includes(c.trigger), `${word} -> ${c.trigger}`)
    for (const a of c.aliases) assert.ok(detectTriggers(`/${a} `).includes(c.trigger), `/${a} -> ${c.trigger}`)
  }
})
t('registry has no duplicate triggers', () => {
  assert.equal(new Set(COMMANDS.map(c => c.trigger)).size, COMMANDS.length)
})
t('/system help lists every command', () => {
  const help = formatSystemHelp([])
  for (const c of COMMANDS) assert.ok(help.includes(c.usage), c.usage)
})
t('discovered commands are marked and XP counted', () => {
  const help = formatSystemHelp(['story-mode'])
  assert.ok(help.includes('XP 20/'))
  assert.ok(help.includes('COMMANDS 1/'))
})
t('ranks ascend and cap', () => {
  assert.equal(rankFor(0).rank.name, 'RECRUIT')
  assert.equal(rankFor(MAX_XP).rank.name, RANKS[RANKS.length - 1].name)
  assert.equal(rankFor(MAX_XP).next, null)
})
t('plain words do not trigger', () => {
  assert.deepEqual(detectTriggers('good week, great year, month end'), [])
  assert.deepEqual(detectTriggers('see example.com/week now'), [])
})

// --- Story -----------------------------------------------------------------
const NOW = Date.parse('2026-10-07T12:00:00Z')
const DAY = 86400000
const note = (daysAgo: number, text: string, extra: object = {}) => ({
  event: 'note', text, createdAt: new Date(NOW - daysAgo * DAY), ...extra,
})

t('empty record reports no signal honestly', () => {
  const d = buildStoryDigest([], 'week', NOW)
  assert.equal(d.entries, 0)
  assert.ok(renderDigestLines(d)[0].includes('NO SIGNAL'))
})
t('window and prior-window counts', () => {
  const logs = [note(0.5, 'a'), note(2, 'b'), note(9, 'c'), note(10, 'd'), note(11, 'e'), note(30, 'old')]
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.equal(d.entries, 2)
  assert.equal(d.priorEntries, 3)
  assert.equal(d.deltaPct, -33)
})
t('engine echoes (📖 / 🕯️) and empties are not entries', () => {
  const d = buildStoryDigest([note(0.1, '📖 story'), note(0.1, '   '), note(0.1, 'real')], 'day', NOW)
  assert.equal(d.entries, 1)
})
t('streaks', () => {
  const logs = [0.2, 1.2, 2.2, 5.2].map(x => note(x, 'x'))
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.equal(d.longestStreak, 3)
  assert.equal(d.currentStreak, 3)
})
t('spike detection', () => {
  const logs = [note(1, 'a'), note(3, 'b'), note(5, 'c'), ...Array.from({ length: 6 }, () => note(2.1, 'burst'))]
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.ok(d.spikes.some(s => s.kind === 'SPIKE' && s.count >= 6))
})
t('moods ranked; high/low derived', () => {
  const m = (s: string, ago: number) => ({ event: 'emotional_checkin', createdAt: new Date(NOW - ago * DAY), metadata: { emotionalState: s } })
  const d = buildStoryDigest([m('calm', 1), m('calm', 2), m('anxious', 3)], 'week', NOW)
  assert.equal(d.moods[0].state, 'calm')
  assert.equal(d.moodHigh, 'calm')
  assert.equal(d.moodLow, 'anxious')
})
t('temperature is Kelvin -> Celsius', () => {
  const d = buildStoryDigest([note(0.1, 'x', { context: { temperature: 293.15, city: 'Pittsburgh' } })], 'day', NOW)
  assert.equal(d.avgTempC, 20)
  assert.deepEqual(d.cities, ['Pittsburgh'])
})
t('digest never contains raw entry text', () => {
  const secret = 'my private sentence about the dentist'
  const text = renderDigestLines(buildStoryDigest([note(0.1, secret), note(0.2, secret)], 'day', NOW)).join('\n')
  assert.ok(!text.toLowerCase().includes('private sentence'))
})
t('period detection', () => {
  assert.equal(detectStoryPeriod('hello /week'), 'week')
  assert.equal(detectStoryPeriod('no command'), null)
  assert.ok(isStoryPeriod('year') && !isStoryPeriod('decade'))
})

console.log(`\n${n} checks passed`)
