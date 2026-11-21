/**
 * Story Compression Engine — verification suite
 * Run: npx tsx scripts/tests/story-compression.test.ts
 */
import assert from 'node:assert/strict'
import {
  compressLogs, parseStoryScope, stripStoryCommand, formatDigest,
  narrateDigest, digestToPromptBlock, getArcadeRank, textValence,
  StoryLogInput,
} from '../../src/shared/utils/storyCompression'

const NOW = new Date('2026-11-21T12:00:00Z')
const day = (n: number, h = 10) => new Date(NOW.getTime() - n * 864e5 + (h - 12) * 36e5).toISOString()
let pass = 0
const t = (name: string, fn: () => void) => { fn(); pass++; console.log('  ✓', name) }

console.log('STORY COMPRESSION ENGINE — TEST GRID')

t('parseStoryScope defaults and aliases', () => {
  assert.equal(parseStoryScope('/story'), 'week')
  assert.equal(parseStoryScope('hello /story day'), 'day')
  assert.equal(parseStoryScope('/story MONTH'), 'month')
  assert.equal(parseStoryScope('/story y'), 'year')
  assert.equal(parseStoryScope('/story banana'), 'week')
  assert.equal(parseStoryScope(''), 'week')
})

t('stripStoryCommand removes command + scope only', () => {
  assert.equal(stripStoryCommand('slept well /story week'), 'slept well')
  assert.equal(stripStoryCommand('📖 /story'), '')
  assert.equal(stripStoryCommand('/story weekend plans'), 'weekend plans')
})

t('textValence lexicon', () => {
  assert.equal(textValence('nothing here'), null)
  assert.ok((textValence('grateful and calm') as number) > 0)
  assert.ok((textValence('tired and anxious') as number) < 0)
})

t('arcade ranks', () => {
  assert.equal(getArcadeRank(0).rank, 'INITIATE')
  assert.equal(getArcadeRank(300).rank, 'RECORDER')
  assert.equal(getArcadeRank(99999).nextRank, null)
})

const logs: StoryLogInput[] = [
  { event: 'note', text: 'Grateful morning, calm walk, coffee with Kuzya', createdAt: day(0), context: { city: 'New York', temperature: 288.15, humidity: 60, astroMoonPhase: 'Waxing' } },
  { event: 'note', text: 'Tired and anxious, insomnia again, coffee', createdAt: day(2), context: { city: 'New York', temperature: 283.15, humidity: 70 } },
  { event: 'note', text: 'Walk in the park, focused work', createdAt: day(3) },
  { event: 'emotional_checkin', createdAt: day(3), metadata: { emotionalState: 'calm' } },
  { event: 'emotional_checkin', createdAt: day(2), metadata: { emotionalState: 'exhausted' } },
  { event: 'answer', createdAt: day(1), metadata: { question: 'Water?', answer: 'Yes' } },
  { event: 'generated_story', text: 'should be ignored', createdAt: day(0) },
  { event: 'note', text: 'old entry outside week', createdAt: day(20) },
  { event: 'note', text: '   ', createdAt: day(0) },
]

t('week digest counts and window filtering', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.equal(d.entryCount, 3)
  assert.equal(d.checkinCount, 2)
  assert.equal(d.selfCareCount, 1)
  assert.equal(d.activeDays, 4)
  assert.equal(d.context.cities[0], 'New York')
  assert.equal(d.context.meanTemperatureC, 12.5)
})

t('peaks: high is positive day, low is negative day', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.ok(d.high && d.high.valence > 0)
  assert.ok(d.low && d.low.valence < 0)
  assert.equal(d.low!.date, day(2).slice(0, 10))
  assert.ok(d.low!.excerpt.includes('insomnia'))
})

t('month includes older entries; day excludes them', () => {
  assert.equal(compressLogs(logs, 'month', NOW).entryCount, 4)
  assert.equal(compressLogs(logs, 'day', NOW).entryCount, 1)
})

t('streak counts consecutive active days', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.equal(d.arcade.streak, 4)
  assert.ok(d.arcade.xp > 0)
})

t('recurring threads need ≥2 mentions', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.ok(d.topWords.includes('coffee'))
  assert.ok(d.topWords.includes('walk'))
})

t('volume spike detection', () => {
  const burst: StoryLogInput[] = []
  for (let i = 1; i < 7; i++) burst.push({ event: 'note', text: 'line', createdAt: day(i) })
  for (let i = 0; i < 8; i++) burst.push({ event: 'note', text: 'line', createdAt: day(0) })
  const d = compressLogs(burst, 'week', NOW)
  assert.ok(d.spikes.some(s => s.kind === 'volume' && s.date === day(0).slice(0, 10)))
})

t('empty stream renders and narrates without throwing', () => {
  const d = compressLogs([], 'year', NOW)
  assert.equal(d.entryCount, 0)
  assert.ok(formatDigest(d).length >= 6)
  assert.ok(narrateDigest(d).includes('blank'))
})

t('deterministic narrative and prompt block reference real data', () => {
  const d = compressLogs(logs, 'week', NOW)
  assert.ok(narrateDigest(d).includes('insomnia'))
  assert.ok(digestToPromptBlock(d).includes('SCOPE: WEEK'))
  assert.deepEqual(compressLogs(logs, 'week', NOW), d) // idempotent
})

console.log(`\nGREEN — ${pass} checks passed`)
console.log(formatDigest(compressLogs(logs, 'week', NOW)).join('\n'))
