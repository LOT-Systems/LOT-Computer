/**
 * Unit checks for src/shared/utils/logStory.ts and the /system, /story, /arcade
 * triggers. Run: npx tsx scripts/tests/test-log-story.ts   (exit 1 on failure)
 */
import assert from 'node:assert/strict'
import {
  LOG_COMMANDS, renderSystemHelp, parseStoryPeriod, compressLogs,
  fallbackStory, computeArcade, renderArcade, ARCADE_RANKS,
} from '../../src/shared/utils/logStory'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const NOW = new Date('2026-10-14T12:00:00Z')
const d = (days: number) => new Date(NOW.getTime() - days * 86_400_000)
let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }

t('every registry command is a detectable trigger', () => {
  for (const c of LOG_COMMANDS) {
    const word = c.usage.split(' ')[0]
    assert.ok(detectTriggers(word).length > 0, `${word} has no trigger`)
  }
})
t('/system and /story and /arcade fire', () => {
  assert.ok(detectTriggers('/system').includes('system-help'))
  assert.ok(detectTriggers('hello /story week').includes('story-mode'))
  assert.ok(detectTriggers('/arcade').includes('arcade-status'))
  assert.ok(detectTriggers('/rank').includes('arcade-status'))
})
t('help lists all commands', () => {
  const h = renderSystemHelp()
  LOG_COMMANDS.forEach(c => assert.ok(h.includes(c.usage), c.usage))
})
t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'day')
  assert.equal(parseStoryPeriod('x /story week'), 'week')
  assert.equal(parseStoryPeriod('/STORY Month'), 'month')
  assert.equal(parseStoryPeriod('/story year!'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'day')
})
const logs = [
  { event: 'note', text: 'slept badly, long day', createdAt: d(0.1), context: { temperature: 20 } },
  { event: 'note', text: 'walked by the sea', createdAt: d(0.5), context: { temperature: 8 } },
  { event: 'note', text: 'old entry', createdAt: d(3), context: {} },
  { event: 'emotional_checkin', createdAt: d(0.2), metadata: { emotionalState: 'tired' } },
  { event: 'emotional_checkin', createdAt: d(0.3), metadata: { emotionalState: 'grateful' } },
]
t('compress day window excludes older logs', () => {
  const c = compressLogs(logs, 'day', NOW)
  assert.equal(c.entries, 2); assert.equal(c.activeDays, 1)
  assert.equal(c.lows.length, 1); assert.equal(c.peaks.length, 1)
  assert.equal(c.contextSpikes.length, 1)
})
t('compress week includes older', () => assert.equal(compressLogs(logs, 'week', NOW).entries, 3))
t('empty fallback never invents', () => assert.match(fallbackStory(compressLogs([], 'day', NOW)), /Nothing recorded/))
t('arcade ranks + streak', () => {
  const a = computeArcade(logs, NOW)
  assert.equal(a.level, 1)
  assert.ok(a.xp > 0 && a.streakDays >= 1)
  const big = Array.from({ length: 400 }, (_, i) => ({ event: 'note', text: 'x', createdAt: d(i % 90) }))
  assert.ok(computeArcade(big, NOW).level > 1)
  assert.equal(ARCADE_RANKS[0].minXp, 0)
  assert.match(renderArcade(a), /RANK/)
})
console.log(`\n${n} tests passed`)
