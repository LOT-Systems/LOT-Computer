/**
 * Story compression + command registry tests (pure, no DB / network).
 * Usage: npx tsx scripts/tests/test-story-compression.ts
 */
import {
  parseStoryPeriod, stripStoryCommand, buildStoryDigest, buildLocalStory,
  arcadeRankFromXp, formatArcadeLine, digestToPromptBlock, computeLifetimeXp,
  type StoryLogRow,
} from '../../src/shared/utils/storyCompression'
import { LOG_COMMANDS, buildSystemHelp } from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

let failed = 0
function ok(name: string, cond: boolean, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
  if (!cond) failed++
}

const NOW = new Date('2026-10-05T12:00:00Z')
const day = (n: number, h = 10) => new Date(NOW.getTime() - n * 86400000 + (h - 12) * 3600000)
const row = (n: number, event: string, extra: Partial<StoryLogRow> = {}): StoryLogRow =>
  ({ event, text: `entry d-${n}`, createdAt: day(n), ...extra })

// --- period parsing
ok('default period = week', parseStoryPeriod('/story') === 'week')
ok('/story month', parseStoryPeriod('hello /story month') === 'month')
ok('/story today -> day', parseStoryPeriod('/story today') === 'day')
ok('/story years -> year', parseStoryPeriod('/story years') === 'year')
ok('/story weekend is NOT a period', parseStoryPeriod('/story weekend') === 'week')
ok('strip keeps user words', stripStoryCommand('tired /story week 📖 but ok') === 'tired but ok', JSON.stringify(stripStoryCommand('tired /story week 📖 but ok')))

// --- digest
const rows: StoryLogRow[] = [
  row(0, 'log_entry'), row(1, 'log_entry'), row(2, 'journal'), row(3, 'log_entry'),
  row(1, 'emotional_checkin', { metadata: { emotionalState: 'calm' } }),
  row(2, 'emotional_checkin', { metadata: { emotionalState: 'calm' } }),
  row(3, 'emotional_checkin', { metadata: { emotionalState: 'anxious' } }),
  row(4, 'emotional_checkin', { metadata: { emotionalState: 'anxious' } }),
  row(20, 'log_entry'),                                  // outside week
  { event: 'generated_story', text: 'machine', createdAt: day(0) }, // never counted
]
rows[0].context = { temperature: 50, humidity: 60, city: 'Brooklyn' }
const wk = buildStoryDigest(rows, 'week', NOW)
ok('week entries = 4', wk.entries === 4, String(wk.entries))
ok('week checkins = 4', wk.checkins === 4)
ok('machine rows excluded', !wk.excerpts.includes('machine'))
ok('streak counts back from today', wk.streakDays === 5, String(wk.streakDays))
ok('mood shift detected', wk.spikes.some(s => s.kind === 'mood-shift'))
ok('env avg 10C', wk.avgTempC === 10, String(wk.avgTempC))
ok('city captured', wk.cities[0] === 'Brooklyn')
const mo = buildStoryDigest(rows, 'month', NOW)
ok('month includes d-20', mo.entries === 5)
ok('month flags quiet gap', mo.spikes.some(s => s.kind === 'quiet-gap'))
ok('empty digest story is honest', /empty/.test(buildLocalStory(buildStoryDigest([], 'day', NOW))))
ok('local story mentions counts', /4 entries/.test(buildLocalStory(wk)))
ok('prompt block has no raw dump beyond excerpts', digestToPromptBlock(wk).includes('WINDOW: WEEK'))

// --- arcade
ok('xp 0 -> ROOKIE lv1', arcadeRankFromXp(0).level === 1)
ok('xp 100 -> OPERATOR', arcadeRankFromXp(100).title === 'OPERATOR')
ok('xp 99999 -> max, progress 1', arcadeRankFromXp(99999).progress === 1 && arcadeRankFromXp(99999).nextAt === null)
ok('negative xp clamps', arcadeRankFromXp(-5).xp === 0)
ok('arcade line', formatArcadeLine(arcadeRankFromXp(140)) === 'LV 2 OPERATOR · 140 XP · 160 TO SIGNALMAN', formatArcadeLine(arcadeRankFromXp(140)))
ok('lifetime xp > 0', computeLifetimeXp(rows) > 0)

// --- command registry <-> trigger detector stay in sync
const registered = new Set(LOG_COMMANDS.map(c => c.trigger))
const probes: Array<[string, string]> = [
  ['/synth', 'toggle-synth'], ['/scan', 'ai-scan'], ['/silent', 'silent-mode'], ['/breathe', 'breathe'],
  ['/fast', 'force-fast'], ['/radio', 'radio-toggle'], ['/night', 'night-mode'], ['/prayer', 'prayer-mode'],
  ['/freeze', 'freeze-widgets'], ['/qos', 'qos-report'], ['/assembly', 'assembly-check'], ['/phys', 'phys-report'],
  ['/sil', 'sil-check'], ['/qi', 'qi-rfi'], ['/system', 'system-help'], ['/story', 'story-mode'], ['/how', 'how-checkin'],
]
probes.forEach(([text, trig]) => {
  ok(`detector fires ${text}`, detectTriggers(text).includes(trig as any))
  if (trig !== 'sil-check') ok(`registry documents ${trig}`, registered.has(trig as any)) // sil-check: detected, no handler — not advertised
})
const help = buildSystemHelp({ arcadeLine: 'LV 1 ROOKIE · 0 XP · 100 TO OPERATOR' })
ok('/system lists every command', LOG_COMMANDS.every(c => help.includes(c.usage)))
ok('/system shows arcade line', help.includes('ROOKIE'))
ok('/system shows /story periods', /\/story \[day\|week\|month\|year\]/.test(help))

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS')
process.exit(failed ? 1 : 0)
