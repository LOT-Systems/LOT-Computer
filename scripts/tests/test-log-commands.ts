/**
 * LOT SYSTEMS CORPORATION — Made in the USA | brand.lot-systems.com
 *
 * Log command registry, trigger detector and /story compression checks.
 * Pure — no DB, no network, no AI vendor.
 * Run: npx tsx scripts/tests/test-log-commands.ts
 */
import assert from 'node:assert/strict'
import {
  LOG_COMMANDS,
  formatSystemHelp,
  suggestCommands,
  parseStoryPeriod,
} from '../../src/shared/utils/logCommands'
import { detectTriggers, detectNewTriggers } from '../../src/client/utils/logTriggers'
import {
  compressLogs,
  composeDeterministicStory,
  buildStoryPrompt,
  formatDigest,
  widenPeriod,
  type StoryLogRow,
} from '../../src/server/utils/story-compression'

let passed = 0
const t = (name: string, fn: () => void) => {
  fn()
  passed++
  console.log(`PASS  ${name}`)
}

// ---- registry ----
t('registry ids are unique', () => {
  const ids = LOG_COMMANDS.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
})
t('no slash keyword is claimed by two commands', () => {
  const seen = new Map<string, string>()
  for (const c of LOG_COMMANDS)
    for (const k of [c.primary, ...c.aliases].filter(Boolean) as string[]) {
      assert.ok(!seen.has(k), `${k} claimed by ${seen.get(k)} and ${c.id}`)
      seen.set(k, c.id)
    }
})
t('/system lists every slash command in the registry', () => {
  const help = formatSystemHelp()
  for (const c of LOG_COMMANDS) if (c.primary) assert.ok(help.includes(`/${c.primary}`), `missing /${c.primary}`)
})
t('every listed command is detected by the detector', () => {
  for (const c of LOG_COMMANDS) if (c.primary) assert.ok(detectTriggers(`/${c.primary}`).includes(c.id), c.id)
})

// ---- detector ----
t('/system and /story fire; /scandalous does not fire /scan', () => {
  assert.deepEqual(detectTriggers('/system'), ['system-help'])
  assert.ok(detectTriggers('note /story week').includes('story-mode'))
  assert.ok(!detectTriggers('/scandalous').includes('ai-scan'))
})
t('editing around an existing command does not re-fire it', () => {
  assert.deepEqual(detectNewTriggers('/system hello', '/system'), [])
  assert.deepEqual(detectNewTriggers('/system', ''), ['system-help'])
})
t('suggestCommands completes prefixes', () => {
  assert.deepEqual(suggestCommands('/sys').map(c => c.id), ['system-help'])
  assert.deepEqual(suggestCommands('/'), [])
})

// ---- /story period ----
t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'day')
  assert.equal(parseStoryPeriod('/story week'), 'week')
  assert.equal(parseStoryPeriod('x /STORY Months'), 'month')
  assert.equal(parseStoryPeriod('/story decade'), 'day')
})
t('widenPeriod', () => {
  assert.equal(widenPeriod('day'), 'week')
  assert.equal(widenPeriod('year'), null)
})

// ---- compression ----
const NOW = new Date('2026-09-28T18:00:00Z')
const at = (daysAgo: number, hour: number, extra: Partial<StoryLogRow> = {}): StoryLogRow => ({
  text: 'ran early, felt lighter, coffee later',
  event: 'log_entry',
  createdAt: new Date(Date.UTC(2026, 8, 28 - daysAgo, hour)),
  context: { temperature: 288.15, city: 'Denver', weatherDescription: 'Clear' },
  ...extra,
})
const mood = (daysAgo: number, label: string): StoryLogRow => ({
  text: null,
  event: 'emotional_checkin',
  metadata: { emotionalState: label },
  createdAt: new Date(Date.UTC(2026, 8, 28 - daysAgo, 9)),
})
const week: StoryLogRow[] = [
  at(6, 8), at(5, 8), at(4, 8), at(3, 8), at(2, 8), at(1, 8),
  at(0, 7), at(0, 8), at(0, 9), at(0, 10), at(0, 11), at(0, 12),
  mood(6, 'low'), mood(5, 'low'), mood(2, 'calm'), mood(1, 'calm'),
  at(30, 8), // outside the week
  { text: 'admin noise', event: 'settings_change', createdAt: NOW } as StoryLogRow,
]
t('compressLogs: window, presence, peak hour, spike', () => {
  const d = compressLogs(week, 'week', NOW, 'UTC')
  assert.equal(d.entries, 12)
  assert.equal(d.signals, 16)
  assert.equal(d.activeDays, 7)
  assert.equal(d.peakHour, 8)
  assert.deepEqual(d.spike, { date: '2026-09-28', entries: 6 })
})
t('compressLogs: mood shift, themes, weather', () => {
  const d = compressLogs(week, 'week', NOW, 'UTC')
  assert.deepEqual(d.shift, { from: 'LOW', to: 'CALM' })
  assert.ok(d.themes.some(x => x.word === 'coffee'))
  assert.equal(d.weather.avgTempC, 15)
  assert.deepEqual(d.weather.cities, ['Denver'])
})
t('compressLogs: day window is since local midnight; order-independent', () => {
  const d = compressLogs([...week].reverse(), 'day', NOW, 'UTC')
  assert.equal(d.entries, 6)
  assert.equal(d.totalDays, 1)
})
t('compressLogs: non-source events never leak into the digest', () => {
  assert.ok(!formatDigest(compressLogs(week, 'week', NOW, 'UTC')).includes('admin noise'))
})
t('compressLogs: digest is smaller than source and excerpts are capped', () => {
  const big = Array.from({ length: 200 }, (_, i) => at(i % 6, 8, { text: 'long entry '.repeat(40) }))
  const d = compressLogs(big, 'week', NOW, 'UTC')
  assert.ok(d.digestChars < d.sourceChars / 10, `${d.digestChars} vs ${d.sourceChars}`)
  assert.ok(d.excerpts.length <= 5 && d.excerpts.every(e => e.length <= 160))
})
t('empty window -> honest deterministic story, no invention', () => {
  const d = compressLogs([], 'day', NOW, 'UTC')
  assert.equal(d.signals, 0)
  assert.match(composeDeterministicStory(d), /Nothing recorded/)
})
t('deterministic story and prompt use only digest facts', () => {
  const d = compressLogs(week, 'week', NOW, 'UTC')
  const story = composeDeterministicStory(d)
  assert.match(story, /12 entries/)
  assert.match(story, /low|calm/i)
  const prompt = buildStoryPrompt(d, { stateLine: 'high energy' })
  assert.ok(prompt.includes('DIGEST:') && prompt.includes('STATE: high energy'))
})

console.log(`\n${passed} passed`)
