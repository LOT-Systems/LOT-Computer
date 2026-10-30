import assert from 'node:assert/strict'
import {
  compressLogs,
  composeLocalStory,
  computeArcade,
  parseStoryRange,
} from '../../src/server/utils/story-compression.ts'
import { renderSystemHelp, LOG_COMMANDS, parseStoryRangeArg } from '../../src/client/utils/logCommands.ts'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'

const now = new Date('2026-10-30T12:00:00Z')
const at = (d: number, h = 9) => new Date(now.getTime() - d * 86_400_000 + (h - 12) * 3_600_000)
const entry = (d: number, text = 'x', h = 9) => ({ event: 'log_entry', text, createdAt: at(d, h), context: { city: 'Austin', temperature: 300, astroMoonPhase: 'Full' } })
const mood = (d: number, m: string) => ({ event: 'emotional_checkin', metadata: { emotionalState: m }, createdAt: at(d) })

// range parsing
assert.equal(parseStoryRange('/story'), 'week')
assert.equal(parseStoryRange('hi /story month'), 'month')
assert.equal(parseStoryRange('/story today'), 'day')
assert.equal(parseStoryRangeArg('/story year'), 'year')

// empty window
const empty = compressLogs([], 'week', now)
assert.equal(empty.entries, 0)
assert.equal(empty.streak, 0)
assert.match(composeLocalStory(empty), /Nothing recorded/)

// populated window
const rows = [entry(0), entry(0, 'b', 9), entry(0, 'c', 9), entry(0, 'd', 9), entry(0, 'e', 9), entry(0, 'f', 9), entry(1), entry(2), mood(1, 'calm'), mood(2, 'calm'), mood(3, 'tired'), entry(20)]
const d = compressLogs(rows, 'week', now)
assert.equal(d.entries, 8)          // day-20 row is outside the week
assert.equal(d.checkins, 3)
assert.equal(d.streak, 4)           // today, -1, -2, -3
assert.equal(d.moods[0].mood, 'CALM')
assert.equal(d.peakHour, 9)
assert.equal(d.context.cities[0], 'Austin')
assert.equal(d.context.tempMaxC, 27)
assert.equal(d.spikes[0].entries, 6)
assert.ok(composeLocalStory(d).includes('8 entries'))

// month window includes the old row
assert.equal(compressLogs(rows, 'month', now).entries, 9)

// arcade
assert.deepEqual(computeArcade(0, 0, 0), { xp: 0, level: 0, rank: 'RECRUIT', nextLevelXp: 100 })
assert.equal(computeArcade(10, 0, 0).level, 1)   // 100 xp
assert.equal(computeArcade(30, 0, 0).level, 2)   // 300 xp

// /system registry covers every command keyword the detector knows
const help = renderSystemHelp()
for (const c of LOG_COMMANDS) assert.ok(help.includes(`/${c.command}`), c.command)
for (const c of LOG_COMMANDS) assert.ok(detectTriggers(`/${c.command}`).length > 0, `no trigger: ${c.command}`)
assert.ok(detectTriggers('/story week').includes('story-mode'))

console.log('story-compression: OK')
