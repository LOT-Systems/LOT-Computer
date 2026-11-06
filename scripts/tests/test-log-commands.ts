import assert from 'node:assert/strict'
import { formatSystemHelp, suggestCommand, parseStoryWindow, composeLocalStory, computeStreak, computeRank, LOG_COMMANDS } from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const now = new Date('2026-11-06T12:00:00Z')
const d = (n: number) => new Date(now.getTime() - n * 864e5)

// registry <-> trigger parity: every command resolves to a trigger
for (const c of LOG_COMMANDS) assert.ok(detectTriggers(`/${c.name}`).length > 0 || c.name === 'prayer', `no trigger for /${c.name}`)
assert.match(formatSystemHelp(), /\/story \[day\|week\|month\|year\]/)
assert.match(formatSystemHelp(), /\/rank/)
assert.equal(suggestCommand('/stroy'), '/story')
assert.equal(suggestCommand('/zzzzzz'), null)
assert.equal(parseStoryWindow('/story week'), 'week')
assert.equal(parseStoryWindow('/story'), 'day')

const logs = [
  { text: 'Slept badly, coffee too late', createdAt: d(0.2), context: { city: 'Austin', temperature: 20 } },
  { text: 'Coffee again, anxious about work', createdAt: d(0.1), context: { city: 'Austin', temperature: 24 } },
  { text: 'old entry', createdAt: d(10) },
  { text: '/story', createdAt: d(0.05) },
]
const s = composeLocalStory(logs, 'day', now)
assert.match(s, /2 entries/); assert.match(s, /coffee/); assert.match(s, /Austin/); assert.doesNotMatch(s, /old entry/)
assert.match(composeLocalStory([], 'week', now), /No entries/)
assert.equal(computeStreak([d(0), d(1), d(2), d(4)], now), 3)
assert.equal(computeStreak([d(3)], now), 0)
assert.equal(computeRank(logs, now).rank, 'SIGNAL')
console.log('log-commands: all assertions passed')
