/**
 * LOT SYSTEMS CORPORATION — Story Compression self-test.
 * Run: node --experimental-strip-types scripts/tests/test-story-compression.ts
 */
import assert from 'node:assert/strict'
import {
  compressStory, parseStoryWindow, arcadeStatus, fallbackStory, digestToPromptBlock,
} from '../../src/shared/utils/storyCompression.ts'

const now = new Date('2026-10-08T12:00:00Z')
const at = (d: string) => new Date(d + 'T10:00:00Z')

// parse
assert.equal(parseStoryWindow('/story'), 'week')
assert.equal(parseStoryWindow('hello /story month'), 'month')
assert.equal(parseStoryWindow('/story today'), 'day')
assert.equal(parseStoryWindow('📖 year'), 'year')

// empty
const empty = compressStory([], 'week', now)
assert.equal(empty.entries, 0)
assert.match(fallbackStory(empty), /Nothing recorded/)

// compression + exclusions + spike + streak
const logs = [
  { event: 'log_entry', text: 'slept badly, walked by the river', createdAt: at('2026-10-06'), context: { city: 'Austin', temperature: 300 } },
  { event: 'log_entry', text: 'a', createdAt: at('2026-10-07'), context: { city: 'Austin', temperature: 285 } },
  { event: 'log_entry', text: 'b', createdAt: at('2026-10-07') },
  { event: 'log_entry', text: 'c', createdAt: at('2026-10-07') },
  { event: 'log_entry', text: 'd\n📖 old generated story', createdAt: at('2026-10-07') },
  { event: 'generated_story', text: 'SHOULD NOT COUNT', createdAt: at('2026-10-07') },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: at('2026-10-05') },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: at('2026-10-06') },
  { event: 'emotional_checkin', metadata: { emotionalState: 'anxious' }, createdAt: at('2026-10-07') },
  { event: 'emotional_checkin', metadata: { emotionalState: 'tired' }, createdAt: at('2026-10-08') },
  { event: 'log_entry', text: 'too old', createdAt: at('2026-09-01') },
]
const d = compressStory(logs, 'week', now)
assert.equal(d.entries, 9, 'excludes generated + out-of-window')
assert.ok(d.spikes.some(s => s.kind === 'volume'), 'volume spike')
assert.ok(d.spikes.some(s => s.kind === 'mood-shift'), 'mood shift')
assert.ok(d.spikes.some(s => s.kind === 'weather-swing'), 'weather swing')
assert.ok(!digestToPromptBlock(d).includes('SHOULD NOT COUNT'))
assert.ok(!digestToPromptBlock(d).includes('old generated story'), 'strips 📖 lines')
assert.equal(d.streak, 4)
assert.deepEqual(d.tempRangeC, [12, 27])

// determinism
assert.deepEqual(compressStory(logs, 'week', now), d)

// arcade
assert.equal(arcadeStatus(0).rank, 'RECRUIT')
assert.equal(arcadeStatus(150).rank, 'OPERATOR')
assert.equal(arcadeStatus(99999).nextRankXp, null)
console.log('story-compression: ALL PASS')
