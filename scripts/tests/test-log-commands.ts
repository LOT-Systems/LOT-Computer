/**
 * LOT SYSTEMS CORPORATION — Log command system self-test.
 * Run: npx tsx scripts/tests/test-log-commands.ts
 * Verifies the /system registry, /story scope parsing + compression,
 * deterministic fallback, and /arcade tiers. Exits 1 on any failure.
 */
import assert from 'node:assert/strict'
import {
  detectTriggers, detectNewTriggers, LOG_COMMANDS, unregisteredTriggers,
  formatSystemHelp, getArcadeStatus, formatArcadeStatus, ARCADE_TIERS,
} from '../../src/client/utils/logTriggers'
import {
  parseStoryScope, normalizeStoryScope, compressLogs, fallbackStory, digestToPromptBlock,
} from '../../src/shared/utils/storyCompression'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`  PASS  ${name}`) }

console.log('LOG COMMAND SYSTEM — SELF-TEST')

t('registry covers every slash trigger', () => assert.deepEqual(unregisteredTriggers(), []))
t('registry has no duplicate triggers', () =>
  assert.equal(new Set(LOG_COMMANDS.map(c => c.trigger)).size, LOG_COMMANDS.length))
t('/system detected', () => assert.deepEqual(detectTriggers('/system'), ['system-help']))
t('/system help lists /story with scopes and /arcade', () => {
  const h = formatSystemHelp()
  assert.match(h, /\/story \[day\|week\|month\|year\]  /)
  assert.match(h, /\/arcade  /)
  assert.match(h, /^NARRATIVE$/m)
})
t('/story detected, /storyline not', () => {
  assert.deepEqual(detectTriggers('/story week'), ['story-mode'])
  assert.deepEqual(detectTriggers('/storyline'), [])
})
t('/story re-edit does not re-fire', () => assert.deepEqual(detectNewTriggers('/story day', '/story'), []))
t('scope parsing', () => {
  assert.equal(parseStoryScope('/story'), 'week')
  assert.equal(parseStoryScope('today was long /story day'), 'day')
  assert.equal(parseStoryScope('/story MONTH'), 'month')
  assert.equal(parseStoryScope('/story y'), 'year')
  assert.equal(parseStoryScope('/story banana'), 'week')
  assert.equal(normalizeStoryScope(42), 'week')
})

const now = new Date('2026-11-13T12:00:00Z')
const h = (hrs: number) => new Date(now.getTime() - hrs * 3600_000)
const logs = [
  { event: 'log_entry', text: 'Walked by the river', createdAt: h(2), context: { city: 'Los Angeles' } },
  { event: 'emotional_checkin', createdAt: h(3), metadata: { emotionalState: 'calm' } },
  { event: 'emotional_checkin', createdAt: h(30), metadata: { emotionalState: 'anxious' } },
  { event: 'emotional_checkin', createdAt: h(50), metadata: { emotionalState: 'joyful' } },
  { event: 'memory_answer', createdAt: h(5), metadata: { question: 'Tea or coffee?', option: 'Tea' } },
  { event: 'log_entry', text: 'Old entry', createdAt: h(24 * 40) },
  { event: 'log_entry', text: '   ', createdAt: h(1) },
]
t('day window compression', () => {
  const d = compressLogs(logs, 'day', now)
  assert.equal(d.entryCount, 1)
  assert.equal(d.checkinCount, 1)
  assert.equal(d.selfCareCount, 1)
  assert.equal(d.high, null) // single mood = flat line, no peaks
})
t('week window peaks', () => {
  const d = compressLogs(logs, 'week', now)
  assert.equal(d.checkinCount, 3)
  assert.equal(d.high?.mood, 'joyful')
  assert.equal(d.low?.mood, 'anxious')
  assert.deepEqual(d.cities, ['Los Angeles'])
  assert.match(digestToPromptBlock(d), /HIGH: JOYFUL/)
})
t('month excludes 40-day-old entry, year includes it', () => {
  assert.equal(compressLogs(logs, 'month', now).entryCount, 1)
  assert.equal(compressLogs(logs, 'year', now).entryCount, 2)
})
t('fallback story is grounded and non-empty', () => {
  const s = fallbackStory(compressLogs(logs, 'week', now))
  assert.match(s, /^This week you showed up on 3 days/)
  assert.match(s, /joyful/)
  assert.match(fallbackStory(compressLogs([], 'day', now)), /quiet today/)
})
t('arcade tiers', () => {
  assert.equal(getArcadeStatus(0, 812).tier.name, 'INSERT COIN')
  assert.equal(getArcadeStatus(1, 812).tier.name, 'PLAYER ONE')
  const s = getArcadeStatus(20, 812)
  assert.equal(s.tier.name, 'LEVEL UP')
  assert.equal(s.toNext, 20)
  assert.equal(getArcadeStatus(900, 812).next, null)
  assert.equal(ARCADE_TIERS.length, 9)
  assert.match(formatArcadeStatus(s), /NEXT\s+COMBO IN 20 BADGES/)
})
t('/arcade and 🕹️ detected', () => {
  assert.deepEqual(detectTriggers('/arcade'), ['arcade-status'])
  assert.deepEqual(detectTriggers('🕹️'), ['arcade-status'])
})

console.log(`\n${n} / ${n} PASS`)
