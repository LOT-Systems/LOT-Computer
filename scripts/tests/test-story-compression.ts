// Run: npx tsx scripts/tests/test-story-compression.ts  (pure logic, no DB/network)
import { buildStoryDigest, buildStoryPrompt, composeFallbackStory, extractStoryPeriod, parseStoryPeriod, computeRank } from '../../src/shared/utils/story-compression'
import { formatSystemHelp, parseStoryArg, LOG_COMMANDS, detectTriggers } from '../../src/client/utils/logTriggers'
const assert = (c: any, m: string) => { if (!c) { console.error('FAIL', m); process.exit(1) } console.log('ok', m) }
const now = new Date('2026-10-02T12:00:00Z')
const d = (n: number, h = 9) => new Date(now.getTime() - n * 86400000 + (h - 12) * 3600000)
const rows: any[] = [
  { event: 'log_entry', text: 'slept badly', createdAt: d(6), context: { temperature: 288.15, humidity: 60, city: 'Austin', weatherDescription: 'Clear', astroMoonPhase: 'Waxing' } },
  { event: 'emotional_checkin', createdAt: d(6), metadata: { emotionalState: 'tired' } },
  { event: 'log_entry', text: 'better today', createdAt: d(1) },
  ...[1,2,3,4].map(h => ({ event: 'log_entry', text: 'burst '+h, createdAt: d(0, 8+h) })),
  { event: 'generated_story', text: 'old story', createdAt: d(0) },
  { event: 'log_entry', text: 'ancient', createdAt: d(400) },
]
const w = buildStoryDigest(rows, 'week', now, { badgesEarned: 3 })
assert(w.entryCount === 6, 'week entries=6 got '+w.entryCount)
assert(w.activeDays === 3, 'activeDays=3')
assert(w.topMood === 'TIRED', 'mood')
assert(w.avgTempC === 15, 'temp 15C got '+w.avgTempC)
assert(w.spikes.some(s => s.kind === 'volume'), 'volume spike')
assert(w.spikes.some(s => s.kind === 'silence-break'), 'silence-break (gap 4d)')
assert(!w.excerpts.join().includes('ancient') && !w.excerpts.join().includes('old story'), 'excludes out-of-window & generated')
assert(buildStoryDigest(rows, 'day', now).entryCount === 4, 'day window')
assert(buildStoryDigest(rows, 'year', now).entryCount === 6, 'year window excludes 400d')
assert(buildStoryPrompt(w, 'x').includes('SPIKES: '), 'prompt has spikes')
assert(composeFallbackStory(w).includes('TIRED'.toLowerCase()), 'fallback mood')
assert(composeFallbackStory(buildStoryDigest([], 'day', now)).includes('Nothing has been logged'), 'empty fallback')
assert(extractStoryPeriod('/story month') === 'month' && extractStoryPeriod('/story today was') === 'day' && extractStoryPeriod('/story') === null, 'extract')
assert(parseStoryPeriod('y') === 'year' && parseStoryPeriod('') === 'week', 'parse')
assert(computeRank(0).title === 'SIGNAL' && computeRank(100).title === 'NAVIGATOR' && computeRank(5000).nextAt === null, 'rank')
assert(parseStoryArg('hi /story week') === 'week' && parseStoryArg('/story') === null, 'client arg')
const help = formatSystemHelp()
assert(help.includes('/story [day|week|month|year]') && help.includes('/system'), 'help lists story+system')
for (const c of LOG_COMMANDS) assert(detectTriggers(c.usage.split(' ')[0]).includes(c.trigger), 'registry↔detector '+c.trigger)
