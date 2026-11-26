/**
 * LOT SYSTEMS CORPORATION
 * Log Compression Engine (LCE-1) — deterministic self-test.
 * Run: yarn test:log-compression
 */
import assert from 'node:assert/strict'
import {
  parseStoryCommand,
  cleanJournalText,
  scoreValence,
  compressLogs,
  computeRecordRank,
  composeFallbackStory,
  packetToPrompt,
  packetToGrid,
  rankToGrid,
  journalStreak,
  type CompressibleLog,
} from '../../src/shared/utils/log-compression.ts'

const NOW = new Date('2026-11-26T12:00:00Z')
const daysAgo = (d: number, h = 0) => new Date(NOW.getTime() - d * 86400000 - h * 3600000)
let passed = 0
const t = (name: string, fn: () => void) => {
  fn()
  passed++
  console.log(`PASS  ${name}`)
}

t('parse /story defaults to week', () => {
  assert.deepEqual(parseStoryCommand('/story'), { horizon: 'week', note: '' })
})
t('parse /story month with trailing note', () => {
  assert.deepEqual(parseStoryCommand('long day /story month quiet'), { horizon: 'month', note: 'long day quiet' })
})
t('parse /story unknown arg keeps arg as note', () => {
  assert.deepEqual(parseStoryCommand('/story about rain'), { horizon: 'week', note: 'about rain' })
})
t('parse aliases', () => {
  assert.equal(parseStoryCommand('/story today').horizon, 'day')
  assert.equal(parseStoryCommand('/story y').horizon, 'year')
})
t('clean strips commands and machine blocks', () => {
  const raw = 'walked by the river\n/story week\n\n📖 You walked...\nmore story\n\nslept early'
  assert.equal(cleanJournalText(raw), 'walked by the river slept early')
  assert.equal(cleanJournalText('long day /story month'), 'long day')
  assert.equal(cleanJournalText('see a/b and http://x.y/z'), 'see a/b and http://x.y/z')
})
t('valence sign + negation', () => {
  assert.ok(scoreValence('grateful and calm today') > 0)
  assert.ok(scoreValence('exhausted, anxious, cannot focus') < 0)
  assert.ok(scoreValence('not tired at all') > 0)
  assert.equal(scoreValence('bought bread'), 0)
})
t('streak counts back from today or yesterday', () => {
  const keys = new Set(['2026-11-25', '2026-11-24', '2026-11-23', '2026-11-20'])
  assert.equal(journalStreak(keys, NOW), 3)
  assert.equal(journalStreak(new Set(['2026-11-20']), NOW), 0)
})

const ctx = { city: 'Los Angeles', temperature: 293.15, weatherDescription: 'clear sky', astroMoonPhase: 'waxing', timeZone: 'America/Los_Angeles' }
const logs: CompressibleLog[] = [
  // First half of week: lighter
  { event: 'note', text: 'grateful, calm, slept well', createdAt: daysAgo(6), context: ctx },
  { event: 'note', text: 'good run, happy and strong', createdAt: daysAgo(5), context: ctx },
  { event: 'emotional_checkin', createdAt: daysAgo(5, 2), metadata: { emotionalState: 'energized' }, context: ctx },
  // Second half: heavier, and a spike day
  { event: 'note', text: 'tired and stressed', createdAt: daysAgo(2, 1), context: ctx },
  { event: 'note', text: 'overwhelmed, exhausted, anxious', createdAt: daysAgo(2, 2), context: ctx },
  { event: 'note', text: 'cannot sleep, worried', createdAt: daysAgo(2, 3), context: ctx },
  { event: 'note', text: 'drained', createdAt: daysAgo(2, 4), context: ctx },
  { event: 'note', text: 'bought bread', createdAt: daysAgo(1), context: ctx },
  { event: 'note', text: 'tea', createdAt: daysAgo(0), context: ctx },
  { event: 'emotional_checkin', createdAt: daysAgo(1, 1), metadata: { emotionalState: 'anxious' }, context: ctx },
  // Outside window / ignored
  { event: 'note', text: 'old', createdAt: daysAgo(40), context: ctx },
  { event: 'user_login', createdAt: daysAgo(1) },
  { event: 'note', text: '/story', createdAt: daysAgo(0) },
]

const week = compressLogs(logs, 'week', NOW)
t('week packet counts', () => {
  assert.equal(week.entries, 8)
  assert.equal(week.checkins, 2)
  assert.equal(week.activeDays, 5)
  assert.equal(week.streak, 3)
  assert.deepEqual(week.context.cities, ['Los Angeles'])
  assert.equal(week.context.meanTempC, 20)
})
t('week packet peaks', () => {
  assert.ok(week.peaks.high && week.peaks.high.valence > 0)
  assert.ok(week.peaks.low && week.peaks.low.valence < 0)
})
t('week packet detects spike + downward shift + follow-up', () => {
  assert.equal(week.spikes.length, 1)
  assert.equal(week.spikes[0].entries, 4)
  assert.equal(week.shift?.direction, 'down')
  assert.ok(week.followUp && /DOWN/.test(week.followUp))
})
t('day packet has no shift/spike', () => {
  const day = compressLogs(logs, 'day', NOW)
  assert.equal(day.shift, null)
  assert.equal(day.spikes.length, 0)
})
t('empty packet + fallback', () => {
  const empty = compressLogs([], 'month', NOW)
  assert.equal(empty.entries, 0)
  assert.equal(empty.followUp, null)
  assert.match(composeFallbackStory(empty), /Nothing was written/)
})
t('renderers produce text', () => {
  assert.match(packetToPrompt(week), /HORIZON: WEEK/)
  assert.match(packetToGrid(week), /STORY\s+WEEK/)
  assert.match(composeFallbackStory(week), /8 entries/)
})
t('record rank accrues and never goes negative', () => {
  const r = computeRecordRank(logs, NOW)
  // 8 notes in 365d (old one at 40d also counts) = 9 → 90; words small; contextual 9*2; streak 3*5
  assert.equal(r.breakdown.entries, 90)
  assert.equal(r.breakdown.contextual, 18)
  assert.equal(r.breakdown.streak, 15)
  assert.equal(r.rank, 'RECORDER')
  assert.match(rankToGrid(r, 12), /OVERALL LEVEL\s+12\/100/)
  assert.equal(computeRecordRank([], NOW).xp, 0)
})

console.log(`\nLCE-1 SELF-TEST: ${passed} PASS · 0 FAIL`)
