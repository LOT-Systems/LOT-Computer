/**
 * Log command system tests — pure modules, no DB/network.
 * Run: node --experimental-strip-types scripts/tests/test-log-commands.ts
 *  or: npm run test:log-commands
 */
import assert from 'node:assert/strict'
import {
  LOG_COMMANDS, renderSystemHelp, suggestCommand, findUnknownCommand,
  parseStoryPeriod, stripStoryCommand, allCommandWords,
} from '../../src/shared/utils/logCommands.ts'
import {
  computeArcade, xpForLevel, titleForLevel, formatArcade, ARCADE_MAX_LEVEL,
} from '../../src/shared/utils/arcade.ts'
import {
  buildStoryDigest, computeStreak, composeFallbackStory, digestToPromptBlock,
} from '../../src/server/utils/story-compression.ts'

let passed = 0
const test = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS ${name}`) }

// ---- registry ----
test('registry names and aliases are unique', () => {
  const words = allCommandWords()
  assert.equal(new Set(words).size, words.length)
})
test('/system lists every command', () => {
  const help = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(help.includes(`/${c.name}`), c.name)
  assert.ok(help.includes('/story [day|week|month|year]'))
})
test('suggestCommand', () => {
  assert.equal(suggestCommand('stroy'), 'story')
  assert.equal(suggestCommand('/sytem'), 'system')
  assert.equal(suggestCommand('story'), null)
  assert.equal(suggestCommand('zzzzzzzz'), null)
})
test('findUnknownCommand ignores paths and known words', () => {
  assert.equal(findUnknownCommand('went to a/b and /story'), null)
  assert.equal(findUnknownCommand('hello /stroy now'), 'stroy')
  assert.equal(findUnknownCommand('https://x.com/foo'), null)
})
test('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('/story day'), 'day')
  assert.equal(parseStoryPeriod('rough day /story Month'), 'month')
  assert.equal(parseStoryPeriod('/story yearly'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
})
test('stripStoryCommand', () => {
  assert.equal(stripStoryCommand('tired /story week'), 'tired')
  assert.equal(stripStoryCommand('/story'), '')
})

// ---- arcade ----
test('arcade level curve', () => {
  assert.equal(xpForLevel(1), 0)
  assert.equal(xpForLevel(2), 50)
  assert.equal(computeArcade({ entries: 0, activeDays: 0, streak: 0, checkins: 0 }).level, 1)
  assert.equal(computeArcade({ entries: 5, activeDays: 0, streak: 0, checkins: 0 }).level, 2)
  assert.equal(titleForLevel(1), 'RECRUIT')
  assert.equal(titleForLevel(10), 'ADEPT')
})
test('arcade is monotonic, capped, and sanitizes input', () => {
  const a = computeArcade({ entries: 10, activeDays: 5, streak: 3, checkins: 2 })
  const b = computeArcade({ entries: 11, activeDays: 5, streak: 3, checkins: 2 })
  assert.ok(b.xp > a.xp)
  const max = computeArcade({ entries: 1e6, activeDays: 1e6, streak: 1e6, checkins: 1e6 })
  assert.equal(max.level, ARCADE_MAX_LEVEL)
  assert.equal(max.nextLevelXp, null)
  const bad = computeArcade({ entries: NaN, activeDays: -4, streak: Infinity, checkins: 0 })
  assert.equal(bad.xp, 0)
})
test('formatArcade renders', () => {
  const inp = { entries: 10, activeDays: 4, streak: 2, checkins: 1 }
  assert.match(formatArcade(computeArcade(inp), inp), /RANK\s+RECRUIT/)
})

// ---- story digest ----
const now = new Date('2026-09-30T12:00:00Z')
const at = (daysAgo: number, event = 'note', extra: any = {}) => ({
  event, text: `entry ${daysAgo}`,
  createdAt: new Date(now.getTime() - daysAgo * 86_400_000 - 3_600_000),
  ...extra,
})
test('streak counts back from today or yesterday', () => {
  assert.equal(computeStreak(new Set(['2026-09-30', '2026-09-29', '2026-09-27']), now), 2)
  assert.equal(computeStreak(new Set(['2026-09-29', '2026-09-28']), now), 2)
  assert.equal(computeStreak(new Set(['2026-09-20']), now), 0)
})
test('digest windows and counts', () => {
  const logs = [
    at(0), at(1), at(1, 'emotional_checkin', { metadata: { emotionalState: 'Calm' } }),
    at(2, 'log_entry', { context: { city: 'Austin', temperature: 20 } }),
    at(40), at(0, 'generated_story'),
  ]
  const week = buildStoryDigest(logs, 'week', now)
  assert.equal(week.totalSignals, 4)       // generated_story + 40d-old excluded
  assert.equal(week.entries, 3)
  assert.equal(week.checkins, 1)
  assert.equal(week.activeDays, 3)
  assert.deepEqual(week.moods, [{ mood: 'calm', count: 1 }])
  assert.deepEqual(week.cities, ['Austin'])
  assert.equal(week.avgTempC, 20)
  assert.equal(week.peakDay?.signals, 2)
  assert.equal(buildStoryDigest(logs, 'day', now).totalSignals, 1)
  assert.equal(buildStoryDigest(logs, 'year', now).totalSignals, 5)
})
test('digest handles empty input and fallback story', () => {
  const d = buildStoryDigest([], 'month', now)
  assert.equal(d.totalSignals, 0)
  assert.equal(d.trend, 'insufficient')
  assert.match(composeFallbackStory(d), /No signals recorded this month/)
  assert.match(digestToPromptBlock(d), /PERIOD: MONTH/)
})
test('fallback story states only computed facts', () => {
  const logs = [at(0), at(1), at(5)]
  const d = buildStoryDigest(logs, 'week', now)
  const s = composeFallbackStory(d)
  assert.match(s, /3 signals across 3 days/)
  assert.match(s, /3-day silence|silence/)
})

console.log(`\n${passed} tests passed`)
