/**
 * LOT SYSTEMS CORPORATION — Log Compression Engine (LCE-1) self-test
 * Run: npx tsx scripts/tests/test-log-compression.ts
 * Exits non-zero on any failed assertion.
 */
import assert from 'node:assert/strict'
import {
  parseStoryPeriod, compressLogs, localStory, compressionHeader,
  chronicleRank, stripCommands, textValence, compressionToPromptBlock,
  buildStorySystemPrompt, type CompressionLog,
} from '../../src/shared/utils/logCompression'
import { detectTriggers, formatSystemHelp, LOG_COMMANDS } from '../../src/client/utils/logTriggers'

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ✓ ${name}`) }

const NOW = new Date('2026-11-18T20:00:00Z')
const h = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3600e3)
const ctx = { temperature: 64.4, city: 'Lisbon', astroMoonPhase: 'Waxing Gibbous', timeZone: 'Europe/Lisbon', weatherDescription: 'clear sky' }

const logs: CompressionLog[] = [
  { event: 'note', text: 'Grateful for the long walk, felt calm and clear', createdAt: h(150), context: ctx },
  { event: 'note', text: 'Good morning, rested and strong', createdAt: h(120), context: ctx },
  { event: 'emotional_checkin', createdAt: h(100), metadata: { emotionalState: 'grateful', intensity: 8 }, context: ctx },
  { event: 'note', text: 'Tired and stressed, heavy day', createdAt: h(30), context: ctx },
  { event: 'emotional_checkin', createdAt: h(20), metadata: { emotionalState: 'overwhelmed' }, context: ctx },
  { event: 'note', text: 'anxious, stuck /story week', createdAt: h(2), context: ctx },
  { event: 'note', text: 'old entry outside window', createdAt: h(24 * 400), context: ctx },
  { event: 'memory_answer', createdAt: h(5), metadata: { question: 'Tea or coffee?', option: 'Tea' }, context: ctx },
]

console.log('LCE-1 SELF-TEST')

t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('hello /story day'), 'day')
  assert.equal(parseStoryPeriod('/story M'), 'month')
  assert.equal(parseStoryPeriod('/story year please'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
})

t('triggers: /story with period still fires story-mode; /system fires help', () => {
  assert.ok(detectTriggers('/story month').includes('story-mode'))
  assert.ok(detectTriggers('/system').includes('system-help'))
  assert.ok(!detectTriggers('/storyline').includes('story-mode'))
})

t('/system lists every story period and itself', () => {
  const help = formatSystemHelp()
  for (const p of ['day', 'week', 'month', 'year']) assert.ok(help.includes(`/story ${p}`))
  assert.ok(help.includes('/system'))
  assert.equal(new Set(LOG_COMMANDS.map(c => c.cmd)).size, LOG_COMMANDS.length, 'duplicate command rows')
})

t('stripCommands removes slash commands and appended story blocks', () => {
  assert.equal(stripCommands('anxious /story week'), 'anxious')
  assert.equal(stripCommands('note\n\n📖 You wrote a lot'), 'note')
})

t('textValence', () => {
  assert.equal(textValence('nothing here'), null)
  assert.ok((textValence('grateful and calm') as number) > 0)
  assert.ok((textValence('tired and stressed') as number) < 0)
})

const week = compressLogs(logs, 'week', NOW)

t('week window excludes old entries, counts note events as journal', () => {
  assert.equal(week.totals.journalEntries, 4)
  assert.equal(week.totals.moodCheckins, 2)
  assert.equal(week.totals.selfCareAnswers, 1)
})

t('peaks: highs and lows detected with context', () => {
  assert.ok(week.peaks.some(p => p.kind === 'high'))
  assert.ok(week.peaks.some(p => p.kind === 'low'))
  assert.ok(week.peaks.every(p => p.context.includes('Lisbon')))
})

t('valence shift detects the drop and raises a follow-up', () => {
  assert.ok((week.valence.shift as number) < 0)
  assert.ok(week.followUps.some(f => f.startsWith('VALENCE DROP')))
})

t('context aggregation (°F → °C)', () => {
  assert.deepEqual(week.context.tempRangeC, [18, 18])
  assert.deepEqual(week.context.cities, ['Lisbon'])
})

t('day period narrows the window', () => {
  const day = compressLogs(logs, 'day', NOW)
  assert.equal(day.totals.journalEntries, 1)
  assert.equal(day.spikes.length, 0)
})

t('spike detection', () => {
  const many: CompressionLog[] = []
  for (let d = 1; d <= 6; d++) many.push({ event: 'note', text: `day ${d}`, createdAt: h(d * 24 + 1) })
  for (let i = 0; i < 6; i++) many.push({ event: 'note', text: `burst ${i}`, createdAt: h(3 + i * 0.1) })
  const c = compressLogs(many, 'week', NOW)
  assert.equal(c.spikes.length, 1)
  assert.equal(c.spikes[0].entries, 6)
})

t('local story + header + prompt are non-empty and grounded', () => {
  const s = localStory(week)
  assert.ok(s.includes('Lisbon'))
  assert.ok(s.trim().endsWith('?'))
  assert.ok(compressionHeader(week).includes('PEAKS'))
  assert.ok(compressionToPromptBlock(week).includes('PERIOD: WEEK'))
  assert.ok(buildStorySystemPrompt('year').includes('/story year'))
  assert.ok(localStory(compressLogs([], 'day', NOW)).includes('Nothing was recorded'))
})

t('chronicle rank ladder', () => {
  assert.equal(chronicleRank(0, 3).rank, 'SCRIBE')
  assert.equal(chronicleRank(0, 3).chapter, 1)
  assert.equal(chronicleRank(4, 15).rank, 'CHRONICLER')
  assert.equal(chronicleRank(99, 300).rank, 'MYTHWRIGHT')
  assert.equal(chronicleRank(99, 300).nextRank, null)
  assert.equal(chronicleRank(2, 9).bar.length, 12)
})

console.log(`\nALL ${passed} CHECKS GREEN`)
