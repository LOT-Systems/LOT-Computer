/**
 * LOT SYSTEMS CORPORATION — Log /story · /level · /system verification
 * Run: npm run test:log  (npx tsx scripts/tests/test-log-story-arcade.ts)
 * Pure-module checks; no DB, no network. Exits non-zero on any failure.
 */
import {
  parseStoryScope, stripStoryCommand, compressLogs, formatCompressionHeader,
  formatCompressionForPrompt, fallbackStory,
} from '../../src/shared/utils/story-compression'
import { computeArcade, xpForLevel, levelForXp, formatArcade, tierForLevel, XP_RULES } from '../../src/shared/utils/log-arcade'
import { detectTriggers, buildSystemHelp, COMMAND_GROUPS } from '../../src/client/utils/logTriggers'

let pass = 0, fail = 0
const ok = (name: string, cond: boolean, extra?: unknown) => {
  if (cond) { pass++; console.log(`PASS  ${name}`) }
  else { fail++; console.log(`FAIL  ${name}`, extra ?? '') }
}

const NOW = new Date('2026-11-12T20:00:00Z')
const at = (daysAgo: number, hour = 12) => {
  const d = new Date(NOW.getTime() - daysAgo * 86_400_000); d.setUTCHours(hour, 0, 0, 0); return d
}
const ctx = { city: 'Brooklyn', temperature: 50, humidity: 70, astroMoonPhase: 'Waning Crescent' }

// ── T1 scope parsing ──
ok('T1.1 /story → week', parseStoryScope('/story') === 'week')
ok('T1.2 /story day', parseStoryScope('felt good /story day') === 'day')
ok('T1.3 /story mo → month', parseStoryScope('/story mo') === 'month')
ok('T1.4 /story YEAR', parseStoryScope('/story YEAR') === 'year')
ok('T1.5 unknown → week', parseStoryScope('/story banana') === 'week')
ok('T1.6 strip', stripStoryCommand('slept well /story month 📖') === 'slept well', stripStoryCommand('slept well /story month 📖'))

// ── T2 compression ──
const logs = [
  { event: 'note', text: 'Long walk by the river, light was gold', createdAt: at(1, 8), context: ctx },
  { event: 'emotional_checkin', createdAt: at(1, 9), metadata: { emotionalState: 'grateful' }, context: ctx },
  { event: 'note', text: 'Deadline crush. /breathe', createdAt: at(3, 23), context: ctx },
  { event: 'emotional_checkin', createdAt: at(3, 22), metadata: { emotionalState: 'overwhelmed' }, context: ctx },
  { event: 'emotional_checkin', createdAt: at(2, 12), metadata: { emotionalState: 'calm' }, context: ctx },
  { event: 'emotional_checkin', createdAt: at(5, 12), metadata: { emotionalState: 'anxious' }, context: ctx },
  { event: 'self_care_checkin', createdAt: at(2, 12), context: ctx },
  { event: 'note', text: 'Old entry outside the week', createdAt: at(20), context: ctx },
  { event: 'note', text: 'Today. Coffee then quiet. \n\n📖 You walked...', createdAt: at(0, 10), context: ctx },
]
const w = compressLogs(logs, 'week', NOW)
ok('T2.1 window excludes 20d-old entry', w.entries === 3, w.entries)
ok('T2.2 slash commands stripped from fragments', !w.fragments.some(f => f.includes('/breathe')), w.fragments)
ok('T2.3 appended story block stripped', !w.fragments.some(f => f.includes('📖')), w.fragments)
ok('T2.4 high peak = grateful + excerpt', w.peaks.high?.mood === 'grateful' && !!w.peaks.high?.excerpt?.includes('river'), w.peaks.high)
ok('T2.5 low peak = overwhelmed + excerpt', w.peaks.low?.mood === 'overwhelmed' && !!w.peaks.low?.excerpt?.includes('Deadline'), w.peaks.low)
ok('T2.6 drift positive (mood lifted)', (w.drift ?? 0) > 0, w.drift)
ok('T2.7 city + °C', w.context.city === 'Brooklyn' && w.context.avgTempC === 10, w.context)
ok('T2.8 care counted', w.care === 1)
ok('T2.9 header has SCOPE + HIGH + LOW', (() => { const h = formatCompressionHeader(w).join('\n'); return h.includes('SCOPE') && h.includes('HIGH') && h.includes('LOW') })())
ok('T2.10 prompt packet lists fragments', formatCompressionForPrompt(w).includes('JOURNAL FRAGMENTS'))
const d = compressLogs(logs, 'day', NOW)
ok('T2.11 day scope only today', d.entries === 1, d.entries)
const empty = compressLogs([], 'month', NOW)
ok('T2.12 empty window fallback', fallbackStory(empty).startsWith('Nothing was recorded this month'))
const fb = fallbackStory(w)
ok('T2.13 fallback names peaks, invents nothing', fb.includes('grateful') && fb.includes('overwhelmed') && fb.includes('Brooklyn'), fb)

ok('T2.14 mood tie → most recent', w.moods.dominant === 'grateful', w.moods.dominant)
const tz = compressLogs([
  { event: 'note', text: 'late', createdAt: new Date('2026-11-12T04:00:00Z'), context: { timeZone: 'America/Los_Angeles' } },
  { event: 'note', text: 'late again', createdAt: new Date('2026-11-11T05:00:00Z'), context: { timeZone: 'America/Los_Angeles' } },
], 'week', NOW)
ok('T2.15 rhythm uses operator timezone (20:00/21:00 PT → EVENING)', tz.dominantPhase === 'EVENING', tz.dominantPhase)

// ── T3 arcade ──
ok('T3.1 curve', xpForLevel(1) === 0 && xpForLevel(2) === 100 && xpForLevel(3) === 300)
ok('T3.2 inverse', levelForXp(0) === 1 && levelForXp(99) === 1 && levelForXp(100) === 2 && levelForXp(300) === 3)
const grind = Array.from({ length: 40 }, () => ({ event: 'note', createdAt: at(0, 10) }))
const g = computeArcade(grind, NOW)
ok('T3.3 daily cap blocks grinding', g.xp === XP_RULES.ENTRY * XP_RULES.ENTRY_DAILY_CAP + XP_RULES.PRESENCE, g.xp)
const ret = computeArcade([{ event: 'note', createdAt: at(10) }, { event: 'note', createdAt: at(0) }], NOW)
ok('T3.4 return after silence rewarded', ret.returns === 1 && ret.breakdown.returns === XP_RULES.RETURN, ret)
const more = computeArcade([...logs, { event: 'note', createdAt: at(0, 15) }], NOW)
const base = computeArcade(logs, NOW)
ok('T3.5 XP monotonic (never decays)', more.xp >= base.xp)
ok('T3.6 rank label', /^SIGNAL (I|II|III|IV|V)$/.test(base.rank), base.rank)
ok('T3.7 format lines', formatArcade(base).some(l => l.startsWith('PROGRESS')))
ok('T3.8 tiers advance every 5 levels', tierForLevel(5) === 'SIGNAL' && tierForLevel(6) === 'TRACE' && tierForLevel(31) === 'LIBRARY OF TIME' && tierForLevel(99) === 'LIBRARY OF TIME')

// ── T4 command registry ──
ok('T4.1 /system detected', detectTriggers('/system').includes('system-help'))
ok('T4.2 /story month detected', detectTriggers('/story month').includes('story-mode'))
ok('T4.3 /level, /xp, /arcade detected', ['/level', '/xp', '/arcade'].every(c => detectTriggers(c).includes('arcade-level')))
ok('T4.4 /levelup not detected', !detectTriggers('/levelup').includes('arcade-level'))
const help = buildSystemHelp()
ok('T4.5 help lists /story and /level', help.includes('/story month') && help.includes('/level'))
ok('T4.6 every registry usage parses as its trigger', COMMAND_GROUPS.every(g => g.commands.every(c => detectTriggers(c.usage.replace(/\s*\[.*\]/, ' x')).includes(c.trigger))),
  COMMAND_GROUPS.flatMap(g => g.commands).filter(c => !detectTriggers(c.usage.replace(/\s*\[.*\]/, ' x')).includes(c.trigger)).map(c => c.usage))
ok('T4.7 help rows split cmd/desc on 2+ spaces', help.split('\n').filter(l => l.startsWith('/')).every(l => l.search(/\s{2,}/) > 0))

console.log(`\n${pass} PASS · ${fail} FAIL`)
process.exit(fail ? 1 : 0)
