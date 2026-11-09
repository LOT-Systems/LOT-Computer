/**
 * Log command + story compression self-check.
 * Usage: npx tsx scripts/tests/test-log-story.ts   (exit 1 on any failure)
 */
import {
  parseStoryScope, compressLogs, composeLocalStory, renderDigestForPrompt,
  computeArcade, levelFromXp, xpForLevel, cleanEntryText, type StoryLogRow,
} from '../../src/shared/utils/log-story'
import { detectTriggers, ALL_TRIGGERS } from '../../src/client/utils/logTriggers'
import { LOG_COMMANDS, UNLISTED_TRIGGERS, buildSystemHelp, parseSystemFilter, GROUP_ORDER } from '../../src/client/utils/logCommands'

let fail = 0
const ok = (c: boolean, m: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fail++ }

// ── scope parsing
ok(parseStoryScope('/story') === 'week', 'default scope = week')
ok(parseStoryScope('felt tired /story month') === 'month', '/story month')
ok(parseStoryScope('/STORY Today') === 'day', 'alias today→day, case-insens')
ok(parseStoryScope('/story banana') === 'week', 'unknown arg → default')

// ── registry ⇄ triggers sync
for (const c of LOG_COMMANDS) {
  const word = c.usage.split(/\s/)[0]
  ok(detectTriggers(word + ' ').includes(c.trigger), `registry ${word} fires ${c.trigger}`)
  for (const a of c.aliases || []) ok(detectTriggers('/' + a + ' ').includes(c.trigger), `alias /${a} fires ${c.trigger}`)
}
for (const t of ALL_TRIGGERS) ok(UNLISTED_TRIGGERS.includes(t) || LOG_COMMANDS.some(c => c.trigger === t), `trigger ${t} is documented`)
ok(parseSystemFilter('/system body') === 'BODY', '/system body filter')
ok(parseSystemFilter('/system') === null, '/system no filter')
ok(GROUP_ORDER.every(g => buildSystemHelp(g).includes(g)), 'every group renders')
ok(buildSystemHelp().includes('/story'), 'help lists /story')

// ── compression
const NOW = new Date('2026-11-09T12:00:00Z')
const day = (n: number, h = 9) => new Date(Date.UTC(2026, 10, 9 - n, h))
const ctx = { city: 'Austin', temperature: 293.15, weatherDescription: 'clear' }
const note = (d: Date, text = 'a quiet entry here', context: any = ctx): StoryLogRow => ({ event: 'note', text, createdAt: d, context })
const rows: StoryLogRow[] = [
  note(day(0)), note(day(1)), note(day(2)),
  note(day(6, 20)), note(day(6, 21)), note(day(6, 22)),   // evening burst, then silence
  { event: 'generated_story', text: 'generated', createdAt: day(0) },
  { event: 'note', text: '   ', createdAt: day(0) },
  { event: 'emotional_checkin', text: '', createdAt: day(1), metadata: { emotionalState: 'calm' } },
]
const d = compressLogs(rows, 'week', { now: NOW })
ok(d.entryCount === 6, `counts only operator notes (got ${d.entryCount})`)
ok(d.activeDays === 4, `active days (got ${d.activeDays})`)
ok(d.streakDays === 3, `streak 3 (got ${d.streakDays})`)
ok(d.avgTempC === 20, `avg temp 20C (got ${d.avgTempC})`)
ok(d.cities[0] === 'Austin', 'city captured')
ok(d.spikes.some(s => s.kind === 'silence-gap'), 'silence gap detected')
ok(d.spikes.some(s => s.kind === 'rhythm-shift'), 'rhythm shift detected')
ok(compressLogs(rows, 'day', { now: NOW }).entryCount === 1, 'day scope window = 1 entry')
ok(compressLogs([], 'week', { now: NOW }).entryCount === 0, 'empty log safe')
ok(composeLocalStory(compressLogs([], 'week', { now: NOW })).includes('quiet'), 'empty local story')
ok(composeLocalStory(d).includes('6 entries'), 'local story states facts')
ok(!renderDigestForPrompt(d).includes('@'), 'prompt digest has no identifiers')
ok(cleanEntryText('hello /story week\n📖 generated text') === 'hello week', 'cleanEntryText strips commands + generated')

// ── arcade
ok(levelFromXp(0) === 0 && levelFromXp(50) === 1 && levelFromXp(199) === 1 && levelFromXp(200) === 2, 'level curve 50·n²')
ok(xpForLevel(3) === 450, 'xpForLevel(3)=450')
const a = computeArcade(10, 4, 3, 2)
ok(a.xp === 10 * 10 + 4 * 25 + 3 * 15 + 2 * 5, `xp formula (got ${a.xp})`)
ok(computeArcade(100000, 365, 365, 0).rank === 'FOUNDER-CLASS', 'rank clamps at top')

console.log(fail ? `\n${fail} FAILED` : '\nALL GREEN')
process.exit(fail ? 1 : 0)
