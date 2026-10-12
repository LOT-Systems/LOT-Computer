/**
 * Log command system tests — registry sync, story compression, arcade rank.
 * Run: npm run test:log
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, UNLISTED_TRIGGERS, renderSystemHelp } from '../../src/client/utils/logCommands'
import { detectTriggers, getTriggerKeywords } from '../../src/client/utils/logTriggers'
import { computeArcade, cleanEntryText, RANKS } from '../../src/client/utils/logArcade'
import { compressLogs, parseStoryPeriod, renderStory, toneScore } from '../../src/client/utils/logStory'

let passed = 0
const t = (name: string, fn: () => void) => {
  fn()
  passed++
  console.log(`PASS  ${name}`)
}

const NOW = new Date('2026-10-12T12:00:00')
const ago = (days: number, hour = 9) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() - days)
  d.setHours(hour, 0, 0, 0)
  return d
}
const note = (text: string, when: Date, context: Record<string, any> | null = null) => ({
  text, event: 'note', createdAt: when, context,
})

t('registry: every command has a live trigger rule and slash keyword', () => {
  const rules = getTriggerKeywords()
  for (const c of LOG_COMMANDS) {
    const rule = rules.find(r => r.trigger === c.trigger)
    assert.ok(rule, `no trigger rule for ${c.trigger}`)
    assert.ok(rule!.keywords.includes(c.slash.slice(1)), `${c.slash} not a keyword of ${c.trigger}`)
    assert.ok(detectTriggers(`${c.slash} `).includes(c.trigger), `${c.slash} does not fire ${c.trigger}`)
  }
})

t('registry: every keyword-bearing trigger is documented or explicitly unlisted', () => {
  const listed = new Set(LOG_COMMANDS.map(c => c.trigger))
  for (const r of getTriggerKeywords()) {
    if (r.keywords.length === 0) continue
    assert.ok(listed.has(r.trigger) || UNLISTED_TRIGGERS.includes(r.trigger), `${r.trigger} missing from registry`)
  }
})

t('registry: no duplicate slash commands', () => {
  const slashes = LOG_COMMANDS.map(c => c.slash)
  assert.equal(new Set(slashes).size, slashes.length)
})

t('/system help lists /story and /system and follows the renderer line contract', () => {
  const help = renderSystemHelp(computeArcade([], NOW))
  assert.match(help, /^\/story \[day\|week\|month\|year\]\s{2,}/m)
  assert.match(help, /^\/system\s{2,}/m)
  for (const c of LOG_COMMANDS) assert.ok(help.includes(c.slash), c.slash)
})

t('story: period parsing defaults to week', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('hello /story month'), 'month')
  assert.equal(parseStoryPeriod('/story YEAR'), 'year')
  assert.equal(parseStoryPeriod('/story fortnight'), 'week')
})

t('story: empty record renders an honest empty state', () => {
  const s = compressLogs([], 'week', NOW)
  assert.equal(s.entries, 0)
  assert.match(renderStory(s), /NO ENTRIES IN WINDOW/)
})

t('story: commands and appended story/scripture are not counted as writing', () => {
  assert.equal(cleanEntryText('/story week'), '')
  assert.equal(cleanEntryText('slept badly\n\n📖 You have been tired.'), 'slept badly')
  const s = compressLogs([note('/system', ago(0))], 'day', NOW)
  assert.equal(s.entries, 0)
})

t('story: window, themes, context and prior-window delta', () => {
  const logs = [
    note('Long walk by the river, river was calm', ago(1), { temperature: 288.15, city: 'Austin', astroMoonPhase: 'Waxing' }),
    note('River again today, grateful and calm', ago(2), { temperature: 290.15, city: 'Austin', astroMoonPhase: 'Waxing' }),
    note('old entry outside the window', ago(20)),
    note('entry in prior week', ago(9)),
  ]
  const s = compressLogs(logs, 'week', NOW)
  assert.equal(s.entries, 2)
  assert.equal(s.previousEntries, 1)
  assert.deepEqual(s.themes.slice(0, 1), ['river'])
  assert.equal(s.context.topCity, 'Austin')
  assert.equal(s.context.avgTempC, 16)
  assert.ok(s.high && s.high.day)
  assert.match(renderStory(s), /THEMES\s+RIVER/)
})

t('story: detects volume, depth and quiet spikes', () => {
  const logs = [
    note('one', ago(5)), note('two', ago(4)), note('three', ago(3)),
    note('a', ago(0, 8)), note('b', ago(0, 9)), note('c', ago(0, 10)), note('d', ago(0, 11)),
    note(Array(60).fill('word').join(' '), ago(2)),
  ]
  const s = compressLogs(logs, 'week', NOW)
  const kinds = s.spikes.map(x => x.kind)
  assert.ok(kinds.includes('VOLUME'), 'volume')
  assert.ok(kinds.includes('DEPTH'), 'depth')

  const busyPrior = [1, 2, 3, 4, 5].map(i => note(`prior entry ${i}`, ago(7 + i)))
  const quiet = compressLogs([...busyPrior, note('single', ago(1))], 'week', NOW)
  assert.ok(quiet.spikes.some(x => x.kind === 'QUIET'), 'quiet')
})

t('story: low-tone spike from heuristic lexicon', () => {
  assert.ok(toneScore('tired anxious and overwhelmed') <= -3)
  const s = compressLogs([note('tired anxious and overwhelmed', ago(1))], 'week', NOW)
  assert.ok(s.spikes.some(x => x.kind === 'LOW-TONE'))
  assert.ok(s.low)
})

t('arcade: consistency beats volume (entries per day capped)', () => {
  const spam = Array.from({ length: 50 }, (_, i) => note(`entry ${i}`, ago(0, 8)))
  const steady = [0, 1, 2].map(d => note('steady', ago(d)))
  assert.ok(computeArcade(steady, NOW).xp > computeArcade(spam, NOW).xp)
})

t('arcade: streak, rank ladder and next-rank math', () => {
  const logs = Array.from({ length: 12 }, (_, d) => note('daily line', ago(d)))
  const a = computeArcade(logs, NOW)
  assert.equal(a.currentStreak, 12)
  assert.equal(a.longestStreak, 12)
  assert.equal(a.activeDays, 12)
  assert.equal(a.xp, 12 * 15 + 12 * 5)
  assert.equal(a.rank.name, 'SIGNAL')
  assert.equal(a.nextRank?.name, 'OPERATOR')
  assert.equal(a.xpToNext, 300 - a.xp)
  assert.equal(RANKS[0].minXp, 0)
})

t('arcade: broken streak resets current but keeps longest', () => {
  const logs = [5, 4, 3].map(d => note('x', ago(d)))
  const a = computeArcade(logs, NOW)
  assert.equal(a.currentStreak, 0)
  assert.equal(a.longestStreak, 3)
})

console.log(`\n${passed} tests passed`)
