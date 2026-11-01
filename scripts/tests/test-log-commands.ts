/**
 * LOT SYSTEMS — Log command + story checks (dependency-free).
 * Run: npx tsx scripts/tests/test-log-commands.ts
 * Exit code 1 on any failure.
 */
import { detectTriggers } from '../../src/client/utils/logTriggers'
import { LOG_COMMANDS, buildSystemHelp } from '../../src/client/utils/logCommands'
import {
  compressStory, computeArcade, parseStoryPeriod, renderStory, digestForModel,
  levelForXp, xpForLevel, rankForLevel, cleanEntryText,
} from '../../src/client/utils/logStory'

let failed = 0
function check(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + detail}`)
  if (!ok) failed++
}

// --- Registry <-> detector parity -----------------------------------------
for (const c of LOG_COMMANDS) {
  check(`/${c.name} fires ${c.trigger}`, detectTriggers(`hello /${c.name}`).includes(c.trigger))
}
const registered = new Set(LOG_COMMANDS.map(c => c.trigger))
check('registry has unique names', new Set(LOG_COMMANDS.map(c => c.name)).size === LOG_COMMANDS.length)
check('/scandalous does not fire /scan', !detectTriggers('/scandalous').includes('ai-scan'))
// Every slash-triggerable detector trigger is documented in /system.
const probe = ['synth','scan','silent','breathe','fast','radio','night','prayer','freeze','qos','assembly','phys','sil','qi','system','story','how']
for (const p of probe) {
  for (const t of detectTriggers('/' + p)) check(`trigger ${t} is in registry`, registered.has(t))
}
const help = buildSystemHelp()
check('help lists /story with periods', help.includes('/story [day|week|month|year]'))
check('help lists /system', /\/system\s+This help screen/.test(help))
check('help has all categories', ['NARRATIVE','STATE','PROTOCOL','INTERFACE'].every(h => help.includes(h)))

// --- Story ------------------------------------------------------------------
check('parse default week', parseStoryPeriod('/story') === 'week')
check('parse month', parseStoryPeriod('x /story month') === 'month')
check('parse today->day', parseStoryPeriod('/story today') === 'day')
check('parse year', parseStoryPeriod('/STORY Year') === 'year')
check('clean strips command+emoji', cleanEntryText('/story week 📖 felt calm') === 'felt calm')
check('clean drops appended story block', cleanEntryText('felt calm\n\n📖 old story text') === 'felt calm')

const NOW = new Date(2026, 10, 1, 15, 0, 0).getTime() // local Sun 1 Nov 2026 15:00
const at = (daysAgo: number, hour: number, extra: any = {}) => ({
  text: 'walk river tired walk',
  event: 'note',
  createdAt: new Date(2026, 10, 1 - daysAgo, hour, 0, 0),
  context: { temperature: 283.15, city: 'Denver', astroMoonPhase: 'Waxing Gibbous' },
  ...extra,
})

const empty = compressStory([], 'week', NOW)
check('empty: zero entries', empty.entries === 0 && empty.streak === 0 && empty.change === 'steady')
check('empty renders quiet story', renderStory(empty, computeArcade([], NOW)).includes('Nothing recorded'))

const logs = [at(0, 9), at(1, 9), at(2, 21), at(2, 22), at(3, 9),
  { ...at(0, 10), event: 'ping' }, { ...at(0, 11), event: 'emotional_checkin', text: null },
  at(10, 9), at(11, 9)]
const wk = compressStory(logs, 'week', NOW)
check('week: 5 entries (noise + out-of-window excluded)', wk.entries === 5, String(wk.entries))
check('week: 1 signal', wk.signals === 1, String(wk.signals))
check('week: 4 active days', wk.activeDays === 4, String(wk.activeDays))
check('week: streak 4', wk.streak === 4, String(wk.streak))
check('week: peak hour 9 morning', wk.peakHour === 9 && wk.partOfDay === 'morning')
check('week: theme "walk"', wk.themes[0] === 'walk', wk.themes.join())
check('week: 10°C from 283.15K', !!wk.tempRangeC && wk.tempRangeC[0] === 10 && wk.tempRangeC[1] === 10)
check('week: city Denver', wk.cities[0] === 'Denver')
check('day window = today only', compressStory(logs, 'day', NOW).entries === 1)

const spike = compressStory(
  [...Array(6)].map((_, i) => at(0, 8 + i)).concat([at(8, 9), at(9, 9), at(10, 9)]), 'week', NOW)
check('spike detected (6 vs 3)', spike.change === 'spike', spike.change)
const drop = compressStory([at(0, 9)].concat([...Array(6)].map((_, i) => at(8 + (i % 6), 9 + i))), 'week', NOW)
check('drop detected (1 vs 6)', drop.change === 'drop', drop.change)

const story = renderStory(wk, computeArcade(logs, NOW))
check('story mentions entries', story.includes('You wrote 5 entries in Denver'))
check('story has ARCADE block', story.includes('ARCADE') && story.includes('RANK'))
check('digest is single line', !digestForModel(wk, computeArcade(logs, NOW)).includes('\n'))
check('deterministic', renderStory(wk, computeArcade(logs, NOW)) === story)

// --- Arcade -----------------------------------------------------------------
check('xp curve: L1=0 L2=50 L3=150', xpForLevel(1) === 0 && xpForLevel(2) === 50 && xpForLevel(3) === 150)
check('levelForXp boundaries', levelForXp(49) === 1 && levelForXp(50) === 2 && levelForXp(150) === 3)
check('rank ladder', rankForLevel(1) === 'SIGNAL' && rankForLevel(3) === 'OBSERVER' && rankForLevel(99) === 'OPERATOR PRIME')
const flood = computeArcade([...Array(50)].map(() => at(0, 9)), NOW)
check('daily cap: 50 same-day entries = 30 + 15 + streak 5', flood.xp === 50, String(flood.xp))
check('arcade bar width 12', flood.bar.length === 12)

console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL CHECKS PASSED')
process.exit(failed ? 1 : 0)
