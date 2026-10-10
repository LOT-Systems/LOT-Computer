/**
 * LOT® Log commands + Story tests. Dependency-free.
 * Run: node --experimental-strip-types scripts/tests/test-log-story.ts
 */
import assert from 'node:assert/strict'
import {
  parseStoryPeriod, compressPeriod, computeArcade, formatArcadeLine,
  buildFallbackStory, buildStoryDataBlock, ARCADE_RANKS,
  type StoryEntry,
} from '../../src/shared/utils/lotStory.ts'
import { LOG_COMMANDS, buildSystemHelp, suggestCommands } from '../../src/shared/utils/lotCommands.ts'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }
const NOW = Date.UTC(2026, 9, 10, 12, 0, 0)
const H = 3600e3, D = 24 * H

t('parse period', () => {
  assert.equal(parseStoryPeriod('/story'), 'day')
  assert.equal(parseStoryPeriod('/story week'), 'week')
  assert.equal(parseStoryPeriod('/STORY last Month'), 'month')
  assert.equal(parseStoryPeriod('rough week /story'), 'day')
  assert.equal(parseStoryPeriod('/story yearly'), 'year')
  assert.equal(parseStoryPeriod('📖 year'), 'year')
  assert.equal(parseStoryPeriod('/story weekend'), 'day')
  assert.equal(parseStoryPeriod(null), 'day')
})

const entries: StoryEntry[] = [
  { at: NOW - 1 * H, kind: 'log', text: 'short', mood: 'calm', context: { city: 'Austin', temperatureC: 20 } },
  { at: NOW - 30 * H, kind: 'log', text: 'a b c d e f g h i j k l m n o p q r s t u v w x y z', context: { city: 'Austin', temperatureC: 24 } },
  { at: NOW - 2 * D, kind: 'mood', text: 'tired', mood: 'exhausted' },
  { at: NOW - 3 * D, kind: 'mood', text: 'good', mood: 'energized' },
  { at: NOW - 4 * D, kind: 'log', text: 'ok' },
  { at: NOW - 5 * D, kind: 'log', text: 'fine' },
  { at: NOW - 6 * D, kind: 'selfcare', text: 'water: yes' },
  { at: NOW - 40 * D, kind: 'log', text: 'old' },
]

t('compress day/week/month', () => {
  assert.equal(compressPeriod(entries, 'day', NOW).entries, 1)
  const w = compressPeriod(entries, 'week', NOW)
  assert.equal(w.entries, 7); assert.equal(w.selfCareAnswers, 1)
  assert.equal(w.moodCheckins, 2); assert.equal(w.cities[0], 'Austin'); assert.equal(w.avgTempC, 22)
  assert.equal(compressPeriod(entries, 'month', NOW).entries, 7)
  assert.equal(compressPeriod(entries, 'year', NOW).entries, 8)
})
t('streak + empty', () => {
  const e = [0, 1, 2].map(i => ({ at: NOW - i * D, kind: 'log' as const, text: 'x' }))
  assert.equal(compressPeriod(e, 'week', NOW).streak, 3)
  assert.equal(compressPeriod(e.slice(1), 'week', NOW).streak, 2) // grace: yesterday
  const z = compressPeriod([], 'week', NOW)
  assert.equal(z.entries, 0); assert.equal(z.busiestBand, null); assert.equal(z.avgTempC, null)
  assert.match(buildFallbackStory(z, computeArcade({ logs: 0, moodCheckins: 0, activeDays: 0, streak: 0, stories: 0 })), /No signal/)
})
t('peaks + trend', () => {
  const w = compressPeriod(entries, 'week', NOW)
  assert.ok(w.peaks.some(p => p.type === 'high' && p.label === 'ENERGIZED'))
  assert.ok(w.peaks.some(p => p.type === 'low' && p.label === 'EXHAUSTED'))
  const rising: StoryEntry[] = ['exhausted', 'tired', 'calm', 'energized'].map((m, i) => ({ at: NOW - (4 - i) * H, kind: 'mood', text: m, mood: m }))
  assert.equal(compressPeriod(rising, 'day', NOW).moodTrend, 'rising')
})
t('timezone buckets days', () => {
  const at = Date.UTC(2026, 9, 10, 3, 0, 0) // 03:00 UTC = 20:00 prev day PDT(-420)
  const c = compressPeriod([{ at, kind: 'log', text: 'x' }], 'day', NOW, -420)
  assert.equal(c.busiestBand, 'evening')
})
t('arcade ladder', () => {
  const z = computeArcade({ logs: 0, moodCheckins: 0, activeDays: 0, streak: 0, stories: 0 })
  assert.equal(z.rank, 'RECRUIT'); assert.equal(z.xpToNext, 100)
  const a = computeArcade({ logs: 10, moodCheckins: 0, activeDays: 0, streak: 0, stories: 0 })
  assert.equal(a.xp, 100); assert.equal(a.rank, 'OPERATOR'); assert.equal(a.level, 2)
  const cap = computeArcade({ logs: 0, moodCheckins: 0, activeDays: 0, streak: 999, stories: 0 })
  assert.equal(cap.xp, 900)
  const max = computeArcade({ logs: 99999, moodCheckins: 0, activeDays: 0, streak: 0, stories: 0 })
  assert.equal(max.rank, 'COMMANDER'); assert.equal(max.nextRank, null); assert.equal(max.progress, 1)
  assert.equal(computeArcade({ logs: NaN, moodCheckins: -5, activeDays: 0, streak: 0, stories: 0 } as any).xp, 0)
  assert.match(formatArcadeLine(a), /LVL 2 OPERATOR/)
  assert.equal(ARCADE_RANKS[0].min, 0)
})
t('prompt block has no raw dump', () => {
  const w = compressPeriod(entries, 'week', NOW)
  const b = buildStoryDataBlock(w, computeArcade({ logs: 3, moodCheckins: 2, activeDays: 5, streak: 1, stories: 0 }), ['one', 'two', 'three', 'four'])
  assert.ok(b.includes('PERIOD: the last 7 days')); assert.ok(!b.includes('"four"'))
})
t('/system help format', () => {
  const lines = buildSystemHelp().split('\n')
  const cmdLines = lines.filter(l => l.startsWith('/'))
  assert.equal(cmdLines.length, LOG_COMMANDS.length)
  for (const l of cmdLines) assert.ok(/\S\s{2,}\S/.test(l), l)
  assert.ok(lines.includes('JOURNAL'))
})
t('suggestions', () => {
  assert.equal(suggestCommands('/').length, LOG_COMMANDS.length)
  assert.deepEqual(suggestCommands('hi /st').map(c => c.name), ['story'])
  assert.deepEqual(suggestCommands('/story'), [])
  assert.deepEqual(suggestCommands('no slash'), [])
  assert.deepEqual(suggestCommands('/zzz'), [])
})
t('registry matches logTriggers (no drift)', () => {
  for (const c of LOG_COMMANDS) assert.ok(detectTriggers('/' + c.name).length > 0, `no trigger for /${c.name}`)
  assert.ok(detectTriggers('/story week').includes('story-mode'))
})
console.log(`\n${n} test groups passed`)
