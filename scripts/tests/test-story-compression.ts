/**
 * Story compression unit tests (pure — no DB, no network).
 * Usage: npx esr ./scripts/tests/test-story-compression.ts
 */
import assert from 'node:assert/strict'
import {
  buildStoryDigest, composeFallbackStory,
  computeArcadeStanding, formatDigestForPrompt,
} from '../../src/server/utils/story-compression.ts'
import { parseStoryScope } from '../../src/client/utils/logTriggers.ts'

const now = new Date('2026-10-23T12:00:00Z')
const at = (daysAgo: number, hour = 9) => new Date(now.getTime() - daysAgo * 86_400_000 + (hour - 12) * 3_600_000)
const row = (daysAgo: number, event = 'log_entry', extra: any = {}) =>
  ({ event, text: 'entry', createdAt: at(daysAgo), context: { city: 'Brooklyn', weatherDescription: 'Rain' }, ...extra })

// scope parsing
assert.equal(parseStoryScope('/story'), 'day')
assert.equal(parseStoryScope('hello /story week'), 'week')
assert.equal(parseStoryScope('/story MONTHLY'), 'month')
assert.equal(parseStoryScope('/story year'), 'year')
assert.equal(parseStoryScope('/storyteller week'), 'day')

// digest: streak, window cut, spike
const rows = [row(0), row(1), row(2), row(2), row(2), row(2), row(3), row(40)]
const week = buildStoryDigest(rows, 'week', now)
assert.equal(week.totalRecords, 7)
assert.equal(week.activeDays, 4)
assert.equal(week.streakDays, 4)
assert.equal(week.spikes[0]?.kind, 'surge')
assert.deepEqual(week.cities, ['Brooklyn'])
assert.equal(buildStoryDigest(rows, 'year', now).totalRecords, 8)
assert.equal(buildStoryDigest([], 'day', now).totalRecords, 0)

// mood aggregation
const moods = buildStoryDigest([row(0, 'emotional_checkin', { metadata: { emotionalState: 'calm' } })], 'day', now)
assert.equal(moods.moods[0].mood, 'CALM')

// fallback + prompt never throw
assert.match(composeFallbackStory(week), /records/)
assert.match(composeFallbackStory(buildStoryDigest([], 'week', now)), /listening/)
assert.match(formatDigestForPrompt(week), /WINDOW: last 7/)

// arcade
const a = computeArcadeStanding([], now)
assert.equal(a.rank, 'BOOT'); assert.equal(a.level, 1); assert.equal(a.nextRank, 'SIGNAL')
const b = computeArcadeStanding(Array.from({ length: 60 }, (_, i) => row(i % 20)), now)
assert.ok(b.xp > 100 && b.level >= 3)
console.log('story-compression: all tests passed')
