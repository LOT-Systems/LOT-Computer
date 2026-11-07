/**
 * LOT SYSTEMS CORPORATION — Log command / story / arcade self-test
 * Run: npx tsx scripts/tests/test-log-commands.ts   (exit 1 on any failure)
 */
import { LOG_COMMANDS, formatSystemHelp, parseStoryCommand } from '../../src/shared/utils/log-commands'
import { compressLogs, composeLocalStory, digestToPrompt } from '../../src/shared/utils/log-story'
import { computeArcade, levelForXp, xpForLevel, rankForLevel, DAILY_XP_CAP } from '../../src/shared/utils/log-arcade'
import { detectTriggers } from '../../src/client/utils/logTriggers'

let failed = 0
function t(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + detail}`)
  if (!ok) failed++
}

// --- registry ↔ trigger drift guard ---------------------------------------
for (const c of LOG_COMMANDS) {
  t(`/${c.name} is detectable`, detectTriggers(`/${c.name}`).length > 0)
}
const help = formatSystemHelp()
for (const c of LOG_COMMANDS) t(`/system lists /${c.name}`, help.includes(`/${c.name}`))
t('/system triggers system-help', detectTriggers('/system').includes('system-help'))
t('/story triggers story-mode', detectTriggers('/story week').includes('story-mode'))
t('/scandalous does not fire /scan', !detectTriggers('/scandalous').includes('ai-scan'))

// --- /story parsing --------------------------------------------------------
t('default period = week', parseStoryCommand('/story').period === 'week')
t('month parsed', parseStoryCommand('/story month').period === 'month')
t('today → day', parseStoryCommand('x /story today').period === 'day')
t('year, case-insens.', parseStoryCommand('/STORY Year').period === 'year')
t('weekend is NOT a period', parseStoryCommand('/story weekend').logText === 'weekend')
t('text preserved', parseStoryCommand('tired today /story week').logText === 'tired today')

// --- compression -----------------------------------------------------------
const NOW = Date.UTC(2026, 10, 7, 12, 0, 0)
const D = 86400000
const note = (daysAgo: number, text: string, extra: any = {}) => ({
  event: 'note', text, createdAt: new Date(NOW - daysAgo * D), context: { city: 'Austin', timeZone: 'UTC', ...extra }, metadata: {},
})
const logs = [
  note(0.1, 'slept badly, heavy morning'), note(1.2, 'walked by the river, felt lighter'),
  note(2, 'work pressure again'), note(3, 'tea ritual and reading'),
  note(10, 'older entry'), // previous window
  { event: 'emotional_checkin', text: null, createdAt: new Date(NOW - D), context: {}, metadata: { emotionalState: 'calm' } },
  { event: 'weather_update', text: 'noise', createdAt: new Date(NOW - D), context: {}, metadata: {} },
]
const dg = compressLogs(logs, 'week', NOW)
t('week entries = 4', dg.entries === 4, String(dg.entries))
t('previous window = 1', dg.spike.previous === 1)
t('spike up detected', dg.spike.direction === 'up', dg.spike.direction)
t('mood counted', dg.moods[0]?.mood === 'CALM')
t('city captured', dg.cities[0] === 'Austin')
t('non-journal event excluded from entries', dg.entries === 4)
t('day window narrower', compressLogs(logs, 'day', NOW).entries === 1)
t('empty → insufficient-data', compressLogs([], 'week', NOW).spike.direction === 'insufficient-data')
t('prompt has WINDOW', digestToPrompt(dg).includes('WINDOW: last 7'))
t('local story non-empty', composeLocalStory(dg).length > 40)
t('local story handles empty', composeLocalStory(compressLogs([], 'day', NOW)).includes('Nothing was written'))

// --- arcade ---------------------------------------------------------------
t('level 1 at 0 xp', levelForXp(0) === 1)
t('xpForLevel inverse', levelForXp(xpForLevel(4)) === 4 && levelForXp(xpForLevel(4) - 1) === 3)
t('rank steps every 5 levels', rankForLevel(5) === 'INITIATE' && rankForLevel(6) === 'OPERATOR')
t('rank capped', rankForLevel(999) === 'ARCHITECT')
const a1 = computeArcade(logs as any, NOW)
t('arcade xp > 0', a1.xp > 0)
t('streak counts back-to-back days', a1.streak >= 4, String(a1.streak))
const spam = Array.from({ length: 100 }, () => note(0, 'word '.repeat(50)))
t('daily XP cap enforced', computeArcade(spam as any, NOW).xp === DAILY_XP_CAP)
t('empty note earns nothing', computeArcade([note(0, '   ')] as any, NOW).xp === 0)
t('deterministic', JSON.stringify(computeArcade(logs as any, NOW)) === JSON.stringify(computeArcade(logs as any, NOW)))
const gap = computeArcade([note(5, 'a'), note(0, 'b')] as any, NOW)
t('broken streak resets streak only', gap.streak === 1 && gap.xp === 20 && gap.longestStreak === 1)

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS')
process.exit(failed ? 1 : 0)
