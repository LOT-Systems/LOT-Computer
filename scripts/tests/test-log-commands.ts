/**
 * LOT® — Log command + story digest self-test.
 * Run: npx tsx scripts/tests/test-log-commands.ts   (exit 1 on any failure)
 */
import { renderSystemHelp, parseStoryCommand, LOG_COMMANDS } from '../../src/shared/utils/logCommands'
import { buildStoryDigest, computeArcadeRank, composeDigestStory, renderDigestBlock } from '../../src/shared/utils/storyDigest'
import { detectTriggers } from '../../src/client/utils/logTriggers'

let fails = 0
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) fails++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`)
}

// parseStoryCommand
eq('story bare', parseStoryCommand('/story'), { period: 'now', logText: '' })
eq('story week', parseStoryCommand('/story week'), { period: 'week', logText: '' })
eq('story alias', parseStoryCommand('slept badly /story Monthly'), { period: 'month', logText: 'slept badly' })
eq('story emoji', parseStoryCommand('📖'), { period: 'now', logText: '' })
eq('story unknown word kept', parseStoryCommand('/story tired today'), { period: 'now', logText: 'tired today' })
eq('story weekend not week', parseStoryCommand('/story weekend').period, 'now')

// help registry vs. trigger detector: every command must be a live trigger
for (const c of LOG_COMMANDS) {
  eq(`trigger exists /${c.name}`, detectTriggers(`/${c.name}`).length > 0, true)
}
const help = renderSystemHelp()
eq('help has /story row', /^\/story \[day\|week\|month\|year\]\s{2,}/m.test(help), true)
eq('help has /system row', /^\/system\s{2,}This help screen/m.test(help), true)

// arcade ranks
eq('rank 0', computeArcadeRank(0), { level: 1, title: 'BOOT', toNext: 5 })
eq('rank 20', computeArcadeRank(20).title, 'OPERATOR')
eq('rank max', computeArcadeRank(5000), { level: 7, title: 'LEGACY', toNext: null })

// digest
const now = new Date('2026-09-29T20:00:00Z')
const at = (daysAgo: number, hour: number) => new Date(now.getTime() - daysAgo * 86_400_000 + (hour - 20) * 3_600_000)
const ctx = { city: 'Lisbon', temperature: 293.15, weatherDescription: 'clear sky', astroMoonPhase: 'Waxing', timeZone: 'UTC' }
const rows = [
  { event: 'log_entry', text: 'a', createdAt: at(0, 20), context: ctx },
  { event: 'log_entry', text: 'b', createdAt: at(1, 9), context: ctx },
  { event: 'journal', text: 'c', createdAt: at(2, 22), context: ctx },
  { event: 'emotional_checkin', createdAt: at(1, 10), metadata: { emotionalState: 'calm' } },
  { event: 'log_entry', text: 'old', createdAt: at(40, 9), context: ctx },
  { event: 'log_entry', text: '   ', createdAt: at(0, 8), context: ctx },
]
const d = buildStoryDigest(rows, 'week', now)
eq('digest entries (blank + old excluded)', d.entryCount, 3)
eq('digest streak', d.streakDays, 3)
eq('digest topMood', d.topMood, 'CALM')
eq('digest temp K->C', d.weather.avgTempC, 20)
eq('digest city', d.cities, ['Lisbon'])
eq('digest dayPart', d.dayPart, { night: 0, morning: 1, afternoon: 0, evening: 2 })
eq('digest month includes old', buildStoryDigest(rows, 'month', now).entryCount, 3)
eq('digest year includes old', buildStoryDigest(rows, 'year', now).entryCount, 4)
eq('digest empty', buildStoryDigest([], 'day', now).entryCount, 0)
eq('fallback story non-empty', composeDigestStory(d).length > 20, true)
eq('block mentions ARCADE', renderDigestBlock(d).includes('ARCADE: level 1 BOOT'), true)

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS')
process.exit(fails ? 1 : 0)
