/**
 * LOT® Story Compressor — self-checking test (no framework).
 * Run: node --experimental-strip-types scripts/tests/test-story-compressor.ts
 */
import assert from 'node:assert/strict'
import { parseStoryCommand, compressLogs, computeArcade, fallbackStory, renderDigestForModel } from '../../src/shared/utils/story-compressor.ts'

const now = new Date('2026-10-15T12:00:00Z')
const day = (n: number, h = 9) => new Date(now.getTime() - n * 86400000 + (h - 12) * 3600000)
const note = (n: number, text: string, extra: any = {}) => ({
  event: 'note', text, createdAt: day(n),
  context: { city: 'Austin', temperature: 68, humidity: 40, weatherDescription: 'Clear', astroMoonPhase: 'Waxing', timeZone: 'UTC', ...extra },
})

// parse
assert.deepEqual(parseStoryCommand('/story'), { scope: 'week', rest: '' })
assert.equal(parseStoryCommand('rough day /story month').scope, 'month')
assert.equal(parseStoryCommand('/story today').scope, 'day')
assert.equal(parseStoryCommand('/story year 📖').rest, '')
assert.equal(parseStoryCommand('/storytime').scope, 'week')

// compress
const rows: any[] = [
  note(0, 'woke early'), note(1, 'tea and reading'), note(2, 'tired'),
  note(2, 'x\n\n📖 old generated story must be stripped'),
  { event: 'emotional_checkin', metadata: { emotionalState: 'tired' }, createdAt: day(3) },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: day(0) },
  note(40, 'outside window'),
  { event: 'generated_story', text: 'old', createdAt: day(5) },
]
const d = compressLogs(rows, 'week', now)
assert.equal(d.entries, 4)
assert.equal(d.activeDays, 3)
assert.equal(d.streak, 3)
assert.equal(d.tempRangeC![0], 20)
assert.equal(d.places[0], 'Austin')
assert.ok(!d.excerpts.join('').includes('old generated'))
assert.ok(d.spikes.some(s => s.kind === 'mood-shift'))
assert.equal(compressLogs(rows, 'year', now).entries, 5)
assert.equal(compressLogs(rows, 'day', now).entries, 1)

// silence spike
const quiet = compressLogs([note(9, 'a'), note(8, 'b'), note(7, 'c')], 'month', now)
assert.ok(quiet.spikes.some(s => s.kind === 'silence'))

// empty
assert.match(fallbackStory(compressLogs([], 'week', now)), /Nothing has been logged/)
assert.match(fallbackStory(d), /4 entries/)
assert.ok(renderDigestForModel(d).includes('ARCADE: level'))

// arcade monotonic + volume capped
const a1 = computeArcade({ entries: 1, activeDays: 1, streak: 1, stories: 0, selfCareTouches: 0 })
const a2 = computeArcade({ entries: 100, activeDays: 1, streak: 1, stories: 0, selfCareTouches: 0 })
assert.ok(a2.xp - a1.xp <= 20, 'spamming one day must not farm XP')
assert.equal(a1.rank, 'SIGNAL')
console.log('story-compressor: ALL PASS')
