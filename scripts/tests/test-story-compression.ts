/**
 * LOT SYSTEMS CORPORATION — Story Compression Engine test suite
 * Run: npx esr ./scripts/tests/test-story-compression.ts
 */
import {
  parseStoryScope, stripStoryCommand, cleanJournalText, textValence,
  compressLogs, renderDigest, fallbackStory, digestToPrompt,
  computeArcade, levelForXp, xpForLevel, rankForLevel, journalStreak,
  type CompressibleLog,
} from '../../src/shared/utils/story-compression.ts'
import { detectTriggers, renderSystemHelp, COMMANDS } from '../../src/client/utils/logTriggers.ts'

let pass = 0, fail = 0
function ok(cond: any, name: string) {
  if (cond) { pass++; console.log(`  PASS  ${name}`) } else { fail++; console.log(`  FAIL  ${name}`) }
}

const NOW = new Date('2026-11-22T18:00:00Z')
const ago = (h: number) => new Date(NOW.getTime() - h * 3600000)
const note = (h: number, text: string, ctx: any = {}): CompressibleLog => ({ event: 'note', text, createdAt: ago(h), context: ctx })

console.log('SCOPE PARSING')
ok(parseStoryScope('/story') === 'week', 'default scope = week')
ok(parseStoryScope('hello /story day') === 'day', '/story day')
ok(parseStoryScope('/story month') === 'month', '/story month')
ok(parseStoryScope('/story YEAR') === 'year', 'case-insensitive year')
ok(parseStoryScope('/story 30d') === 'month', 'alias 30d')
ok(parseStoryScope('/story banana') === 'week', 'unknown → week')
ok(stripStoryCommand('slept well /story month') === 'slept well', 'strip command + scope')

console.log('HYGIENE')
ok(cleanJournalText('walked by the sea\n\n📖 You had a week...') === 'walked by the sea', 'drop appended story')
ok(cleanJournalText('/system') === '', 'drop slash-only entry')
ok(textValence('I feel calm and grateful') > 0, 'positive valence')
ok(textValence('tired and anxious') < 0, 'negative valence')
ok(textValence('not good') < 0, 'negation flips')

console.log('COMPRESSION')
const logs: CompressibleLog[] = [
  note(2, 'Calm morning walk, grateful for the sun and tea', { city: 'Los Angeles', temperature: 68, weatherDescription: 'clear sky', astroMoonPhase: 'Waxing Gibbous' }),
  note(26, 'Tired and anxious after work, tea did not help', { city: 'Los Angeles', temperature: 59 }),
  note(50, 'Tea ritual, reading, quiet evening'),
  note(74, 'Shipped the project, proud and happy'),
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: ago(3) },
  { event: 'emotional_checkin', metadata: { emotionalState: 'anxious' }, createdAt: ago(27) },
  note(200, 'old entry outside window'),
]
const wk = compressLogs(logs, 'week', NOW)
ok(wk.entries === 4, `week entries = 4 (got ${wk.entries})`)
ok(wk.activeDays === 4, `active days = 4 (got ${wk.activeDays})`)
ok(wk.streak === 4, `streak = 4 (got ${wk.streak})`)
ok(wk.cities[0] === 'Los Angeles', 'city aggregated')
ok(!!wk.tempRangeC && wk.tempRangeC[0] === 15 && wk.tempRangeC[1] === 20, `temp range °C (got ${wk.tempRangeC})`)
ok(wk.themes.includes('tea'), `theme "tea" detected (got ${wk.themes})`)
ok(wk.peaks.some(p => p.kind === 'high') && wk.peaks.some(p => p.kind === 'low'), 'high + low peaks')
ok(wk.moods.calm === 1 && wk.moods.anxious === 1, 'moods counted')
const day = compressLogs(logs, 'day', NOW)
ok(day.entries === 1, `day entries = 1 (got ${day.entries})`)
ok(renderDigest(wk).some(l => l.startsWith('HIGH PEAK')), 'digest renders HIGH PEAK')
ok(digestToPrompt(wk).includes('RECURRING THEMES'), 'prompt includes themes')
ok(fallbackStory(wk).startsWith('This week you wrote 4 entries'), 'fallback story')
ok(fallbackStory(compressLogs([], 'month', NOW)).includes('quiet'), 'empty fallback')

console.log('PATTERN SHIFT')
const spike: CompressibleLog[] = [
  ...[1, 2, 3, 4, 5, 6].map(h => note(h, 'writing a lot today')),
  note(30, 'one entry yesterday'),
]
const sd = compressLogs(spike, 'day', NOW)
ok(sd.shifts.some(s => s.signal === 'entries' && s.direction === 'up'), 'writing spike detected')

console.log('ARCADE')
ok(xpForLevel(1) === 0 && xpForLevel(2) === 50 && xpForLevel(10) === 4050, 'xp curve')
ok(levelForXp(0) === 1 && levelForXp(49) === 1 && levelForXp(50) === 2, 'level boundaries')
ok(rankForLevel(1) === 'SIGNAL' && rankForLevel(10) === 'NAVIGATOR' && rankForLevel(99) === 'SAGE', 'rank ladder')
const a = computeArcade(logs, NOW)
ok(a.breakdown.journal === 50 && a.breakdown.mood === 10 && a.breakdown.streak === 60, `xp breakdown (got ${JSON.stringify(a.breakdown)})`)
const grind = Array.from({ length: 50 }, (_, i) => note(1, `entry ${i}`))
ok(computeArcade(grind, NOW).breakdown.journal === 50, 'daily cap: 5 journal entries/day')
ok(journalStreak([note(30, 'x'), note(54, 'y')], NOW) === 2, 'streak ending yesterday counts')

console.log('COMMAND REGISTRY')
ok(detectTriggers('/system').includes('system-help'), '/system detected')
ok(detectTriggers('/story month').includes('story-mode'), '/story month detected')
ok(detectTriggers('/level').includes('arcade-level'), '/level detected')
const help = renderSystemHelp()
ok(['STORY', 'ARCADE', 'SELF-CARE'].every(g => help.includes(g)), 'help groups')
ok(COMMANDS.every(c => detectTriggers(c.usage).includes(c.trigger)), 'every registry usage fires its trigger')

console.log(`\n${pass} PASS · ${fail} FAIL`)
if (fail) process.exit(1)
