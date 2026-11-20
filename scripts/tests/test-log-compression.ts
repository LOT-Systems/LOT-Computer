/**
 * LOT SYSTEMS CORPORATION — Log Compression Engine (LCE) v1 test
 * Run: npx tsx scripts/tests/test-log-compression.ts
 */
import assert from 'node:assert/strict'
import {
  compressLogs, parseStoryPeriod, cleanEntryText, scoreSentiment,
  computeArcade, computeArcadeFromLogs, renderPacketHeader, renderPacketStory, renderPacketPrompt,
} from '../../src/shared/utils/log-compression'

const NOW = new Date('2026-11-20T12:00:00Z')
const daysAgo = (n: number, h = 9) => new Date(Date.UTC(2026, 10, 20 - n, h)).toISOString()
const note = (n: number, text: string, ctx: any = {}) => ({
  event: 'note', text, createdAt: daysAgo(n), context: { city: 'Los Angeles', weatherDescription: 'clear sky', timeZone: 'UTC', ...ctx },
})

let pass = 0
const t = (name: string, fn: () => void) => { fn(); pass++; console.log(`  ✓ ${name}`) }

t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('/story day'), 'day')
  assert.equal(parseStoryPeriod('hello /story today'), 'day')
  assert.equal(parseStoryPeriod('/STORY Month'), 'month')
  assert.equal(parseStoryPeriod('/story y'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
})

t('cleanEntryText strips machine blocks and commands', () => {
  assert.equal(cleanEntryText('slept well /story week\n\n📖 You wrote...'), 'slept well')
  assert.equal(cleanEntryText('🕯️ Psalm 46:10'), '')
})

t('scoreSentiment', () => {
  assert.ok(scoreSentiment('calm and grateful today') > 0)
  assert.ok(scoreSentiment('exhausted and anxious') < 0)
  assert.equal(scoreSentiment('the table is wooden'), 0)
})

t('arcade levels', () => {
  assert.equal(computeArcade(0, 0).level, 1)
  assert.equal(computeArcade(49, 0).level, 1)
  assert.equal(computeArcade(50, 0).level, 2)
  assert.equal(computeArcade(50 + 75, 0).rank, 'SCRIBE')
})

const logs = [
  note(0, 'Calm morning, grateful for the light'),
  note(1, 'Exhausted and anxious, heavy day'),
  note(2, 'Walked by the ocean, peaceful', { city: 'Santa Monica', weatherDescription: 'fog' }),
  note(3, 'Wrote three pages'),
  note(10, 'Old entry in baseline'),
  { event: 'emotional_checkin', createdAt: daysAgo(1), metadata: { emotionalState: 'tired' } },
  { event: 'generated_story', text: 'ignored', createdAt: daysAgo(0) },
]

t('week packet', () => {
  const p = compressLogs(logs as any, 'week', NOW)
  assert.equal(p.entries, 4)
  assert.equal(p.activeDays, 4)
  assert.equal(p.cities[0], 'Los Angeles')
  assert.equal(p.dominantWindow, 'MORNING')
  assert.equal(p.moods.TIRED, 1)
  assert.equal(p.peaks.find(x => x.kind === 'high')!.date, '2026-11-20')
  assert.equal(p.peaks.find(x => x.kind === 'low')!.date, '2026-11-19')
  assert.equal(p.pattern.signal, 'SPIKE') // 4 vs 1
  assert.equal(p.arcade.streakDays, 4)
})

t('day packet + header + story + prompt', () => {
  const p = compressLogs(logs as any, 'day', NOW)
  assert.equal(p.entries, 1)
  const h = renderPacketHeader(p)
  assert.ok(h[0].startsWith('COMPRESSION'))
  assert.ok(h.some(l => l.startsWith('ARCADE')))
  assert.ok(renderPacketStory(p).includes('1 entry'))
  assert.ok(renderPacketPrompt(p).includes('PERIOD: DAY'))
})

t('empty period renders a non-blank story', () => {
  const p = compressLogs([], 'month', NOW)
  assert.equal(p.entries, 0)
  assert.ok(renderPacketStory(p).length > 20)
})

t('lifetime arcade from separate history', () => {
  const a = computeArcadeFromLogs(logs as any, NOW)
  const p = compressLogs(logs as any, 'day', NOW, { arcadeLogs: logs as any })
  assert.deepEqual(p.arcade, a)
  assert.ok(a.xp >= 50)
})

console.log(`\nLCE: ${pass}/${pass} PASS`)
