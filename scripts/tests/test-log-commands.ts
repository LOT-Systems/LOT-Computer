import assert from 'node:assert/strict'
import {
  LOG_COMMANDS, renderSystemHelp, parseStoryPeriod, storyWindowStart,
  summarizeEntries, computeArcade, composeCompressedStory, renderArcadeLine,
} from '../../src/shared/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

// every registry command is a live trigger keyword
for (const c of LOG_COMMANDS) {
  assert.ok(detectTriggers(`/${c.name}`).length > 0, `/${c.name} has no trigger`)
}
const help = renderSystemHelp()
for (const c of LOG_COMMANDS) assert.ok(help.includes(`/${c.name}`), `/system missing /${c.name}`)

assert.equal(parseStoryPeriod('/story'), 'day')
assert.equal(parseStoryPeriod('felt ok /story week'), 'week')
assert.equal(parseStoryPeriod('/story YEARLY'), 'year')
assert.equal(parseStoryPeriod('/story nonsense'), 'day')

const now = new Date('2026-10-24T12:00:00Z')
assert.equal(storyWindowStart('week', now).toISOString(), '2026-10-17T12:00:00.000Z')

const s = summarizeEntries([
  { createdAt: '2026-10-24T08:00:00Z' }, { createdAt: '2026-10-24T09:00:00Z' },
  { createdAt: '2026-10-23T08:00:00Z', mood: 'Calm' }, { createdAt: '2026-10-21T08:00:00Z' },
], now)
assert.deepEqual([s.entries, s.activeDays, s.streak, s.moods.calm], [4, 3, 2, 1])
assert.equal(summarizeEntries([], now).streak, 0)

assert.equal(computeArcade({ entries: 0, activeDays: 0, streak: 0 }).rank, 'SIGNAL')
const a = computeArcade(s, 2)
assert.equal(a.xp, 4 * 10 + 3 * 25 + 2 * 15 + 100)
assert.equal(a.rank, 'OPERATOR')
assert.equal(computeArcade({ entries: 1000, activeDays: 300, streak: 100 }, 100).nextRank, null)
assert.match(renderArcadeLine(a), /LV2 OPERATOR/)
assert.match(composeCompressedStory('week', s), /4 entries across 3 days this week/)
console.log('log-commands: all assertions passed')
