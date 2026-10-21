import assert from 'node:assert/strict'
import {
  parseStoryRange, compressLogs, composeOfflineStory, computeArcadeFromCounts, formatDigest,
} from '../../src/shared/utils/logStory'
import { LOG_COMMANDS, renderSystemHelp } from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const now = new Date('2026-10-21T12:00:00Z')
const day = 86400000
const mk = (ago: number, text: string, city = 'Austin') => ({
  event: 'note', text, createdAt: new Date(now.getTime() - ago * day),
  context: { city, temperature: 68 }, metadata: {},
})

assert.equal(parseStoryRange('/story'), 'week')
assert.equal(parseStoryRange('hi /story MONTH'), 'month')
assert.equal(parseStoryRange('/storyline year'), 'week')

const d = compressLogs([mk(1, 'a'), mk(2, 'b'), mk(3, 'c'), mk(9, 'old'), mk(10, 'old2')], 'week', now)
assert.equal(d.entryCount, 3)
assert.equal(d.paceChange, 'up')
assert.equal(d.avgTempC, 20)
assert.deepEqual(d.topCities, ['Austin'])
assert.match(formatDigest(d), /ENTRIES: 3/)
assert.match(composeOfflineStory(d), /3 entries/)
assert.match(composeOfflineStory(compressLogs([], 'day', now)), /Nothing recorded/)

assert.equal(computeArcadeFromCounts(0, 0).rank, 'SIGNAL')
assert.equal(computeArcadeFromCounts(5, 0).rank, 'OPERATOR')
assert.equal(computeArcadeFromCounts(500, 0).nextAt, null)

// Every registered command must be detectable by logTriggers (registry cannot drift).
for (const c of LOG_COMMANDS) {
  const word = c.command.split(/\s/)[0]
  assert.ok(detectTriggers(word).length > 0, `${word} has no trigger`)
}
assert.match(renderSystemHelp(), /\/story/)
console.log('log-story: OK')
