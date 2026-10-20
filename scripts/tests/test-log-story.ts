/**
 * Log command registry + story compression tests.
 * Run: node --experimental-strip-types scripts/tests/test-log-story.ts
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, parseStoryCommand, renderSystemHelpText, findLogCommand } from '../../src/shared/utils/logCommands.ts'
import { periodWindow, compressLogs, buildStoryPrompt, computeArcadeStatus } from '../../src/shared/utils/storyCompression.ts'

// registry
assert.equal(new Set(LOG_COMMANDS.map(c => c.name)).size, LOG_COMMANDS.length, 'unique names')
const help = renderSystemHelpText()
LOG_COMMANDS.forEach(c => assert.ok(help.includes('/' + c.name), `help lists /${c.name}`))
assert.equal(findLogCommand('/candle')?.name, 'prayer')

// /story parsing
assert.deepEqual(parseStoryCommand('/story'), { period: 'week', rest: '' })
assert.deepEqual(parseStoryCommand('rough day /story month'), { period: 'month', rest: 'rough day' })
assert.deepEqual(parseStoryCommand('/story today'), { period: 'day', rest: '' })
assert.deepEqual(parseStoryCommand('/story feeling low'), { period: 'week', rest: 'feeling low' })
assert.deepEqual(parseStoryCommand('📖 /story year'), { period: 'year', rest: '' })

// compression
const now = new Date('2026-10-20T12:00:00Z')
const at = (d: number, h = 9) => new Date(now.getTime() - d * 86_400_000 + (h - 12) * 3_600_000)
const rec = (d: number, text: string, extra: any = {}) => ({
  event: 'log_entry', text, createdAt: at(d),
  context: { temperature: 293.15, humidity: 60, city: 'Austin', weatherDescription: 'clear', astroMoonPhase: 'Waxing' }, ...extra,
})
const records = [
  rec(6, 'slow start'), rec(5, 'walked'), rec(4, 'ok'),
  rec(1, 'a'), rec(1, 'b'), rec(1, 'c'), rec(1, 'd'), rec(0, 'today'),
  rec(40, 'out of window'),
  ...['CALM', 'CALM', 'ANXIOUS', 'ANXIOUS'].map((m, i) => ({ event: 'emotional_checkin', createdAt: at(5 - i), metadata: { emotionalState: m } })),
]
const win = periodWindow('week', now)
const dg = compressLogs(records as any, win)
assert.equal(dg.journalCount, 8)
assert.equal(dg.weather.avgCelsius, 20)
assert.equal(dg.weather.topCity, 'Austin')
assert.equal(dg.moodShift, 'CALM → ANXIOUS')
assert.ok(dg.spikes.some(s => s.kind === 'volume'), 'volume spike')
assert.ok(dg.streakDays >= 2)
assert.ok(!dg.excerpts.join().includes('out of window'))
const prompt = buildStoryPrompt(dg, { logText: 'tired' })
assert.ok(prompt.includes('LAST 7 DAYS') && prompt.includes('shift CALM → ANXIOUS'))
assert.equal(compressLogs([], win).journalCount, 0)

// arcade
const a = computeArcadeStatus({ entries: 0, activeDays: 0, streakDays: 0 })
assert.equal(a.level, 1); assert.equal(a.rank, 'INSERT COIN')
const b = computeArcadeStatus({ entries: 500, activeDays: 100, streakDays: 30, storiesGenerated: 10 })
assert.ok(b.level > a.level && b.xp === 5000 + 2500 + 450 + 500)
console.log('log-story tests: OK')
