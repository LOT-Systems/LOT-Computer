/**
 * LOT SYSTEMS CORPORATION — Log command + Story compression verifier.
 * Run: yarn verify:log   (npx tsx scripts/verify-log-commands.ts)   (exit 0 = GREEN)
 *
 * Pure checks, no DB / network:
 *   1. Every /system registry entry maps to a detector rule (and vice-versa
 *      for user-facing triggers).
 *   2. /story scope parsing.
 *   3. Journal cleaning strips slash commands + machine replies.
 *   4. compressStory windowing, peaks, environment, Arcade.
 *   5. Fallback story never empty.
 */
import {
  LOG_COMMANDS, keywordsFor, formatSystemHelp, detectTriggers, extractCommandArgument, ARGUMENT_TRIGGERS,
} from '../src/client/utils/logTriggers'
import {
  parseStoryScope, cleanJournalText, compressStory, composeFallbackStory, formatPacketForPrompt,
  formatStoryHeader, computeArcade, xpForLevel,
} from '../src/shared/utils/storyCompression'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`) }
}

console.log('§1 REGISTRY')
for (const c of LOG_COMMANDS) {
  const kws = keywordsFor(c.trigger)
  const cmd = c.usage.split(/\s/)[0].slice(1)
  check(`${c.usage} → ${c.trigger}`, kws.includes(cmd), `keywords=${kws.join(',')}`)
  check(`${c.usage} detected`, detectTriggers(`hello /${cmd}`).includes(c.trigger))
}
const help = formatSystemHelp()
check('/system lists /story with scopes', help.includes('/story [day|week|month|year]'))
check('/system lists every command', LOG_COMMANDS.every(c => help.includes(c.usage)))
check('argument triggers = story + qi', ARGUMENT_TRIGGERS.has('story-mode') && ARGUMENT_TRIGGERS.has('qi-rfi') && ARGUMENT_TRIGGERS.size === 2)
check('/qi argument extraction', extractCommandArgument('note\n/qi why am I tired\nmore', 'qi-rfi') === 'why am I tired')
check('/storyline does not trigger /story', !detectTriggers('/storyline').includes('story-mode'))

console.log('§2 SCOPE')
check('bare → week', parseStoryScope('/story') === 'week')
check('day', parseStoryScope('text /story day') === 'day')
check('today → day', parseStoryScope('/story today') === 'day')
check('month', parseStoryScope('/story MONTH') === 'month')
check('y → year', parseStoryScope('/story y') === 'year')
check('junk → week', parseStoryScope('/story banana') === 'week')

console.log('§3 CLEAN')
const dirty = 'Walked by the sea /story week\n\n📖 You walked by the sea...\n🕯️ Psalm 46:10'
check('strips command + machine lines', cleanJournalText(dirty) === 'Walked by the sea', JSON.stringify(cleanJournalText(dirty)))

console.log('§4 COMPRESS')
const now = new Date('2026-11-17T20:00:00Z')
const d = (daysAgo: number, h = 9) => new Date(now.getTime() - daysAgo * 86400000 - (20 - h) * 3600000)
const ctx = (city: string, k: number, moon: string) => ({ city, temperature: k, humidity: 60, astroMoonPhase: moon, astroWesternZodiac: 'Scorpio', date: '2026-11-17 08:30' })
const logs = [
  { event: 'note', text: 'Morning swim, cold water, felt alive and clear. Ocean again tomorrow.', createdAt: d(0), context: ctx('Lisbon', 291, 'Waxing Crescent') },
  { event: 'note', text: 'Long day of meetings. Tired. Ocean helped.', createdAt: d(1), context: ctx('Lisbon', 289, 'Waxing Crescent') },
  { event: 'note', text: '/system', createdAt: d(2), context: ctx('Lisbon', 288, 'New Moon') },
  { event: 'note', text: 'Ocean ocean ocean', createdAt: d(3), context: ctx('Porto', 285, 'New Moon') },
  { event: 'emotional_checkin', metadata: { emotionalState: 'grateful' }, createdAt: d(0), context: ctx('Lisbon', 291, 'Waxing Crescent') },
  { event: 'emotional_checkin', metadata: { emotionalState: 'exhausted' }, createdAt: d(1), context: ctx('Lisbon', 289, 'Waxing Crescent') },
  { event: 'memory_answer', metadata: { question: 'What did you eat?', option: 'Soup' }, createdAt: d(1) },
  { event: 'note', text: 'Old entry outside week', createdAt: d(20), context: ctx('Berlin', 270, 'Full Moon') },
  { event: 'generated_story', text: 'machine', createdAt: d(0) },
]
const wk = compressStory(logs, 'week', now)
check('week entries = 3 (command-only entry dropped, old excluded)', wk.journal.entries === 3, String(wk.journal.entries))
check('top word = ocean', wk.journal.topWords[0] === 'ocean', wk.journal.topWords.join(','))
check('high peak GRATEFUL', wk.peaks.some(p => p.kind === 'high' && p.label === 'GRATEFUL'))
check('low peak EXHAUSTED', wk.peaks.some(p => p.kind === 'low' && p.label === 'EXHAUSTED'))
check('city Lisbon dominant', wk.environment.cities[0] === 'Lisbon')
check('temp range in °C', wk.environment.tempMinC === 12 && wk.environment.tempMaxC === 18, `${wk.environment.tempMinC}-${wk.environment.tempMaxC}`)
check('streak = 4', wk.rhythm.longestStreak === 4, String(wk.rhythm.longestStreak))
check('dominant phase morning (from context.date)', wk.rhythm.dominantPhase === 'morning')
check('Berlin excluded', !wk.environment.cities.includes('Berlin'))
const yr = compressStory(logs, 'year', now)
check('year includes Berlin entry', yr.journal.entries === 4)
const day = compressStory(logs, 'day', now)
check('day window narrows', day.journal.entries === 1, String(day.journal.entries))
const silent = compressStory([], 'month', now)
check('silent density', silent.signalDensity === 'silent')

console.log('§5 ARCADE')
check('xp curve 0/100/300/600', [1, 2, 3, 4].map(xpForLevel).join() === '0,100,300,600')
const a0 = computeArcade({ entries: 0, wordsPerEntry: [], moods: 0, selfCare: 0, activeDays: 0, longestStreak: 0 })
check('zero → L1 INITIATE', a0.level === 1 && a0.rank === 'INITIATE')
const a1 = computeArcade({ entries: 20, wordsPerEntry: Array(20).fill(100), moods: 10, selfCare: 10, activeDays: 7, longestStreak: 7 })
check('active week levels up', a1.level >= 3, JSON.stringify(a1))
check('progress within 0..1', a1.progress >= 0 && a1.progress <= 1)

console.log('§6 RENDER')
const fb = composeFallbackStory(wk)
check('fallback non-empty', fb.length > 40)
check('fallback names peaks', fb.includes('grateful') && fb.includes('exhausted'))
check('silent fallback', composeFallbackStory(silent).includes('quiet'))
const pr = formatPacketForPrompt(wk)
check('prompt has HIGH/LOW PEAK', pr.includes('HIGH PEAK') && pr.includes('LOW PEAK'))
check('prompt excludes machine text', !pr.includes('machine'))
check('header has LVL', formatStoryHeader(wk).includes('LVL'))

console.log(`\nRESULT: ${pass} PASS · ${fail} FAIL → ${fail === 0 ? 'GREEN' : 'RED'}`)
process.exit(fail === 0 ? 0 : 1)
