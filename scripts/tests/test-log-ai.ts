/**
 * Log AI self-test: command registry, /story compression, Log Arcade.
 * Run: npm run test:log-ai   (exit code 1 on any failure)
 */
import { LOG_COMMANDS, renderSystemHelp, parseStoryPeriod, stripStoryCommand } from '../../src/client/utils/logCommands'
import { detectTriggers, detectNewTriggers } from '../../src/client/utils/logTriggers'
import { computeArcade, renderArcade, ARCADE_RANKS } from '../../src/client/utils/logArcade'
import { compressLogs, renderDigest, composeFallbackStory, normalizeStoryPeriod } from '../../src/server/utils/story-compression'

let failed = 0
const t = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failed++
}

// ---- registry / triggers
t('/system detected', detectTriggers('/system').includes('system-help'))
t('/story detected with period arg', detectTriggers('hello /story week').includes('story-mode'))
t('/rank detected', detectTriggers('/rank').includes('arcade-rank'))
t('/scandalous does not fire /scan', !detectTriggers('/scandalous').includes('ai-scan'))
t('emoji 📖 fires story', detectTriggers('📖').includes('story-mode'))
t('detectNewTriggers delta only', detectNewTriggers('/story x', '/story').length === 0)
const help = renderSystemHelp()
for (const c of LOG_COMMANDS.filter(c => c.keywords.length && c.trigger !== 'cohort-support')) {
  t(`help lists /${c.keywords[0]}`, help.includes(`/${c.keywords[0]}`))
}
t('triggers unique', new Set(LOG_COMMANDS.map(c => c.trigger)).size === LOG_COMMANDS.length)
t('parseStoryPeriod default', parseStoryPeriod('/story') === 'day')
t('parseStoryPeriod weeks', parseStoryPeriod('a /story Weeks b') === 'week')
t('parseStoryPeriod year', parseStoryPeriod('/story year') === 'year')
t('parseStoryPeriod ignores other words', parseStoryPeriod('/story yearning') === 'day')
t('stripStoryCommand', stripStoryCommand('tired today /story month') === 'tired today')

// ---- compression
const now = new Date('2026-10-29T12:00:00Z')
const d = (days: number, h = 9) => new Date(now.getTime() - days * 86400000 + (h - 12) * 3600000)
const logs = [
  { event: 'log_entry', text: 'slept badly', createdAt: d(0), context: { city: 'Miami', temperature: 300, humidity: 70 } },
  { event: 'log_entry', text: 'walk by the water', createdAt: d(1), context: { city: 'Miami', temperature: 298, humidity: 60 } },
  { event: 'log_entry', text: '   ', createdAt: d(1) },
  { event: 'emotional_checkin', createdAt: d(0), metadata: { emotionalState: 'calm' } },
  { event: 'emotional_checkin', createdAt: d(2), metadata: { emotionalState: 'anxious' } },
  { event: 'emotional_checkin', createdAt: d(3), metadata: { emotionalState: 'anxious' } },
  { event: 'log_entry', text: 'old', createdAt: d(40) },
]
const day = compressLogs(logs, 'day', now)
t('day window excludes yesterday', day.entries === 1)
const week = compressLogs(logs, 'week', now)
t('week counts 2 non-blank entries', week.entries === 2 && week.activeDays === 2)
t('week excludes 40d-old entry', compressLogs(logs, 'week', now).entries === 2)
t('year includes 40d-old entry', compressLogs(logs, 'year', now).entries === 3)
t('mood shift signal', week.signals.some(s => s.startsWith('MOOD-SHIFT')))
t('places aggregated', week.places[0]?.place === 'Miami' && week.places[0].count === 2)
t('kelvin→celsius avg', week.avgTempC === 26)
t('digest bounded & rendered', renderDigest(week).includes('PERIOD: WEEK'))
t('fallback story non-empty', composeFallbackStory(week).includes('2 entries'))
t('fallback empty window', composeFallbackStory(compressLogs([], 'month', now)).includes('no log entries'))
t('normalizeStoryPeriod rejects junk', normalizeStoryPeriod("'; DROP") === 'day')
const silent = compressLogs(
  [d(6), d(6, 10), d(5)].map(x => ({ event: 'log_entry', text: 'x', createdAt: x })),
  'week', now)
t('silence signal', silent.signals.some(s => s.startsWith('SILENCE')))
const spike = compressLogs(
  [...Array(6).fill(0).map(() => ({ event: 'log_entry', text: 'x', createdAt: d(0) })), { event: 'log_entry', text: 'y', createdAt: d(2) }, { event: 'log_entry', text: 'z', createdAt: d(3) }],
  'week', now)
t('spike signal', spike.signals.some(s => s.startsWith('SPIKE')))

// ---- arcade
const empty = computeArcade([], now)
t('empty arcade is SIGNAL', empty.rank.name === 'SIGNAL' && empty.xp === 0)
const a = computeArcade([
  { event: 'log_entry', text: 'hi', createdAt: d(0) },
  { event: 'log_entry', text: '/system', createdAt: d(1) },
  { event: 'log_entry', text: '', createdAt: d(2) },
  { event: 'generated_story', text: 's', createdAt: d(0) },
], now)
t('arcade ignores blank', a.entries === 2)
t('arcade streak 2', a.currentStreak === 2 && a.longestStreak === 2)
t('arcade counts command + story', a.commandsUsed === 1 && a.storiesGenerated === 1)
t('arcade xp = 20+10+6+15+20', a.xp === 71)
t('ranks ascending', ARCADE_RANKS.every((r, i) => i === 0 || r.minXp > ARCADE_RANKS[i - 1].minXp))
const grind = computeArcade(Array(50).fill(0).map(() => ({ event: 'log_entry', text: 'x', createdAt: d(0) })), now)
t('daily cap prevents grinding', grind.xp === 5 * 10 + 5 + 3)
t('renderArcade has rank', renderArcade(a).includes('RANK'))

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS')
process.exit(failed ? 1 : 0)
