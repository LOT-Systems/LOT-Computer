/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Deterministic tests for /story compression, /system registry and Arcade rank.
 * Run: npm run test:story
 */
import assert from 'node:assert/strict'
import {
  compressLogs,
  computeArcadeRank,
  parseStoryPeriod,
  renderArcadeRank,
  renderFallbackStory,
  stripStoryCommand,
  trailingStreak,
} from '../../src/shared/utils/storyCompression'
import { LOG_COMMANDS, renderSystemHelp } from '../../src/shared/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const NOW = new Date('2026-10-27T20:00:00Z')
const at = (daysAgo: number, hour = 9) => {
  const d = new Date(NOW.getTime() - daysAgo * 86_400_000)
  d.setUTCHours(hour, 0, 0, 0)
  return d
}
const entry = (daysAgo: number, text: string, hour = 9) => ({
  event: 'log_entry', text, createdAt: at(daysAgo, hour),
  context: { city: 'Lisbon', weatherDescription: 'Clear' },
})

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }

t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'day')
  assert.equal(parseStoryPeriod('hi /story week'), 'week')
  assert.equal(parseStoryPeriod('/STORY Month'), 'month')
  assert.equal(parseStoryPeriod('/story year'), 'year')
  assert.equal(parseStoryPeriod('/story weekly'), 'day')
})

t('stripStoryCommand', () => {
  assert.equal(stripStoryCommand('slept badly /story week'), 'slept badly')
  assert.equal(stripStoryCommand('📖'), '')
})

t('compress: day window ignores yesterday', () => {
  const c = compressLogs([entry(0, 'today'), entry(1, 'yesterday')], 'day', NOW)
  assert.equal(c.entryCount, 1)
  assert.equal(c.activeDays, 1)
})

t('compress: week counts, streak, context', () => {
  const logs = [0, 1, 2, 4].map(d => entry(d, `day ${d}`))
  const c = compressLogs(logs, 'week', NOW)
  assert.equal(c.entryCount, 4)
  assert.equal(c.activeDays, 4)
  assert.equal(c.streak, 3)
  assert.deepEqual(c.topCities, ['Lisbon'])
  assert.equal(c.timeOfDay.morning, 4)
})

t('spike: volume', () => {
  const logs = [entry(0, 'a'), entry(1, 'b'), entry(2, 'c'), entry(3, 'd'), entry(4, 'e'),
    entry(5, 'x'), entry(5, 'y'), entry(5, 'z'), entry(5, 'w'), entry(5, 'v'), entry(5, 'u')]
  const c = compressLogs(logs, 'week', NOW)
  assert.ok(c.spikes.some(s => s.kind === 'volume'))
})

t('spike: mood shift', () => {
  const mood = (d: number, m: string) => ({ event: 'emotional_checkin', createdAt: at(d), metadata: { emotionalState: m } })
  const c = compressLogs([mood(4, 'calm'), mood(3, 'calm'), mood(2, 'calm'), mood(0, 'anxious')], 'week', NOW)
  assert.ok(c.spikes.some(s => s.kind === 'mood-shift' && s.detail === 'calm → anxious'))
})

t('spike: silence', () => {
  const c = compressLogs([entry(25, 'a'), entry(2, 'b')], 'month', NOW)
  assert.ok(c.spikes.some(s => s.kind === 'silence'))
})

t('streak: survives until midnight', () => {
  assert.equal(trailingStreak({ '2026-10-26': 1, '2026-10-25': 1 }, NOW), 2)
  assert.equal(trailingStreak({}, NOW), 0)
})

t('fallback story: empty and populated', () => {
  assert.match(renderFallbackStory(compressLogs([], 'day', NOW)), /Nothing recorded/)
  const s = renderFallbackStory(compressLogs([entry(0, 'a'), entry(1, 'b')], 'week', NOW))
  assert.match(s, /2 journal entries across 2 days/)
  assert.match(s, /Lisbon/)
})

t('arcade rank is monotonic and bounded', () => {
  assert.equal(computeArcadeRank(0, 0, 0).level, 1)
  assert.equal(computeArcadeRank(0, 0, 0).rank, 'SIGNAL')
  let prev = 0
  for (let e = 0; e < 5000; e += 50) {
    const r = computeArcadeRank(e, Math.floor(e / 3), Math.min(e, 365))
    assert.ok(r.level >= prev)
    assert.ok(r.xpIntoLevel >= 0 && r.xpIntoLevel < r.xpForNext)
    prev = r.level
  }
  assert.equal(computeArcadeRank(1e6, 365, 365).rank, 'LUMINARY')
  assert.match(renderArcadeRank(computeArcadeRank(10, 3, 2)), /RANK\s+SIGNAL/)
})

t('/system lists every registered command and triggers resolve', () => {
  const help = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(help.includes(c.command), c.command)
  assert.ok(detectTriggers('/system').includes('system-help'))
  assert.ok(detectTriggers('/story week').includes('story-mode'))
  assert.ok(detectTriggers('/rank').includes('arcade-rank'))
  // every registered base command must map to a trigger
  for (const c of LOG_COMMANDS) {
    const base = c.command.split(' ')[0]
    assert.ok(detectTriggers(base).length > 0, `no trigger for ${base}`)
  }
})

console.log(`\n${n} groups passed`)
