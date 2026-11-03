// Run: npx tsx scripts/tests/test-log-story.ts   (pure module, no DB / network)
import assert from 'node:assert/strict'
import { buildDigest, computeArcade, computeStreak, composeLocalStory, digestToPrompt, type LogRow } from '../../src/server/utils/log-story'

const now = new Date('2026-11-03T12:00:00Z')
const at = (daysAgo: number, hour = 9): Date => new Date(now.getTime() - daysAgo * 86_400_000 + (hour - 12) * 3_600_000)
const entry = (d: number, text = 'x', ctx: any = {}): LogRow => ({ event: 'log_entry', text, createdAt: at(d), context: ctx })

// streak: today + yesterday + 2 days ago => 3; gap breaks it
assert.equal(computeStreak([entry(0), entry(1), entry(2), entry(5)], now), 3)
// streak survives until midnight (nothing today, yesterday logged)
assert.equal(computeStreak([entry(1), entry(2)], now), 2)
assert.equal(computeStreak([], now), 0)

// arcade: 3 entries (30) + streak 3 (6) = 36 XP => SIGNAL, next OBSERVER in 14
const a = computeArcade([entry(0), entry(1), entry(2)], now)
assert.equal(a.xp, 36); assert.equal(a.rank, 'SIGNAL'); assert.equal(a.nextRank, 'OBSERVER'); assert.equal(a.xpToNext, 14)

// digest: window filter, Kelvin->C, silence gap
const rows = [entry(0, 'a', { city: 'Miami', temperature: 300.15, humidity: 70 }), entry(6, 'b', { city: 'Miami', temperature: 298.15 })]
const d = buildDigest([...rows, entry(20, 'old')], 'week', now)
assert.equal(d.entries, 2); assert.equal(d.avgTempC, 26); assert.equal(d.topCities[0], 'Miami')
assert.ok(d.spikes.some(s => s.kind === 'silence-gap'))
assert.ok(digestToPrompt(d).includes('SPIKES'))

// volume spike
const burst = [entry(1), entry(2), entry(3), ...Array.from({ length: 14 }, () => entry(4))]
assert.ok(buildDigest(burst, 'week', now).spikes.some(s => s.kind === 'volume-spike'))

// mood shift (newest first: CALM x2 vs TIRED x2)
const mood = (d: number, s: string): LogRow => ({ event: 'emotional_checkin', createdAt: at(d), metadata: { emotionalState: s } })
assert.equal(buildDigest([mood(0, 'calm'), mood(1, 'calm'), mood(2, 'tired'), mood(3, 'tired')], 'week', now).moodShift, 'TIRED -> CALM')

// local story never throws on empty
assert.ok(composeLocalStory(buildDigest([], 'day', now)).includes('quiet'))
console.log('log-story: all assertions passed')
