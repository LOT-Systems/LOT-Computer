/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 *
 * Log command system test: registry ↔ trigger drift, /system render,
 * /story scope parsing, story compression. Pure — no DB, no network.
 * Run: npx tsx scripts/tests/test-log-commands.ts
 */

import { COMMANDS, renderSystemHelp, rankFor, parseStoryCommand } from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'
import {
  parseStoryScope, compressRecords, renderStatsBlock, fallbackStory, type StoryLogRecord,
} from '../../src/server/utils/story-compression'

let failed = 0
function check(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + detail}`)
  if (!ok) failed++
}

// 1. Drift: every registry command must actually fire its declared trigger.
for (const c of COMMANDS) {
  const hits = detectTriggers(`/${c.command}`)
  check(`registry /${c.command} fires ${c.trigger}`, hits.includes(c.trigger), JSON.stringify(hits))
}
check('registry commands are unique', new Set(COMMANDS.map(c => c.command)).size === COMMANDS.length)

// 2. /system render contract: command rows start with "/" and split on 2+ spaces.
const help = renderSystemHelp(new Set(['story-mode', 'system-help', 'ai-scan']))
check('help lists every command', COMMANDS.every(c => help.includes(`/${c.command}`)))
check('help rows parse (cmd, 2+ spaces, desc)', help.split('\n').filter(l => l.startsWith('/')).every(l => /\s{2,}\S/.test(l)))
check('help shows rank + discovered count', /RANK CADET · 3\/16/.test(help), help.split('\n').find(l => l.startsWith('RANK')))
check('rank ladder: 0 → RECRUIT, all → ARCHITECT',
  rankFor(0).rank === 'RECRUIT' && rankFor(COMMANDS.length).rank === 'ARCHITECT')

// 3. /story scope parsing (client + server agree).
const cases: Array<[string, string]> = [
  ['rough day /story', 'week'], ['/story day', 'day'], ['/story Today', 'day'],
  ['x /story month please', 'month'], ['/story year', 'year'], ['/story monthly', 'month'],
  ['/story banana', 'week'],
]
for (const [text, want] of cases) {
  const got = parseStoryCommand(text).scope
  check(`parse "${text}" → ${want}`, got === want, got)
}
check('scope word stripped from entry text', parseStoryCommand('tired /story week').rest === 'tired')
check('server parseStoryScope fallback', parseStoryScope('???') === 'week' && parseStoryScope('Year') === 'year')

// 4. Compression: journal events are 'note'; peaks, lows, spike, trend.
const now = new Date('2026-10-04T12:00:00Z')
const at = (daysAgo: number, hour = 9) => new Date(now.getTime() - daysAgo * 86_400_000 + (hour - 12) * 3_600_000)
const mood = (d: number, m: string): StoryLogRecord => ({ event: 'emotional_checkin', metadata: { emotionalState: m }, createdAt: at(d) })
const note = (d: number, t: string): StoryLogRecord => ({
  event: 'note', text: t, createdAt: at(d), context: { city: 'Austin', temperature: 293 },
})
const records: StoryLogRecord[] = [
  mood(6, 'tired'), mood(5, 'anxious'), mood(4, 'calm'), mood(3, 'grateful'), mood(2, 'energized'), mood(1, 'focused'),
  note(6, 'rough start'), note(1, 'finally slept'), note(1, 'a'), note(1, 'b'), note(1, 'c'), note(1, 'd'),
  { event: 'note', text: 'ancient', createdAt: at(400) },
]
const week = compressRecords(records, 'week', now)
check('old records excluded from window', !week.excerpts.some(e => e.includes('ancient')))
check("'note' events counted as journal", week.journalEntries === 6, String(week.journalEntries))
check('peak/low found', !!week.peak && !!week.low && week.low.day < week.peak.day)
check('trend rising', week.trend === 'rising', week.trend)
check('volume spike detected', week.volumeSpike?.count === 6, JSON.stringify(week.volumeSpike))
check('context aggregated (city, 20°C)', week.cities[0] === 'Austin' && week.avgTempC === 20, `${week.cities} ${week.avgTempC}`)
const today = [...records, note(0, 'this morning'), note(0, 'this noon')]
check('day scope narrows window', compressRecords(today, 'day', now).journalEntries === 2 && compressRecords(today, 'week', now).journalEntries === 8)
const block = renderStatsBlock(week)
check('data block carries peak + spike, not raw context', /HIGH PEAK/.test(block) && /SPIKE/.test(block) && !/293/.test(block))
check('fallback story non-empty + honest', fallbackStory(week).length > 40)
check('empty window → open-loop message', /No signal recorded/.test(fallbackStory(compressRecords([], 'day', now))))

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS')
process.exit(failed ? 1 : 0)
