/**
 * LOT SYSTEMS — Log command + story compression tests
 * Run: npx esr ./scripts/tests/test-story-commands.ts
 * Pure modules only; no DB, no network.
 */
import assert from 'node:assert/strict'
import {
  compressLogs, periodWindow, scoreValence, arcadeRank,
  renderDigestBlock, renderDigestStory,
} from '../../src/shared/utils/story-compression'
import {
  detectTriggers, detectNewTriggers, buildSystemHelp, parseStoryPeriod,
  stripStoryCommand, LOG_COMMANDS,
} from '../../src/client/utils/logTriggers'

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS  ${name}`) }

const NOW = new Date('2026-10-01T15:00:00Z')
const note = (iso: string, text: string, extra: any = {}) =>
  ({ event: 'note', text, createdAt: iso, ...extra })

// --- /system ---------------------------------------------------------------
t('/system triggers system-help', () => assert.deepEqual(detectTriggers('/system'), ['system-help']))
t('every catalog command maps to a live trigger', () => {
  for (const c of LOG_COMMANDS) {
    const word = c.command.split(' ')[0]
    assert.ok(detectTriggers(word).includes(c.trigger), `${word} -> ${c.trigger}`)
  }
})
t('help lists every command exactly once', () => {
  const help = buildSystemHelp()
  for (const c of LOG_COMMANDS) assert.equal(help.split(c.command).length - 1, 1, c.command)
  assert.ok(help.includes('MEMORY') && help.includes('SHORTCUTS'))
})

// --- /story parsing --------------------------------------------------------
t('period defaults to week', () => assert.equal(parseStoryPeriod('/story'), 'week'))
t('period parsed', () => {
  assert.equal(parseStoryPeriod('rough day /story month'), 'month')
  assert.equal(parseStoryPeriod('/STORY Today'), 'day')
  assert.equal(parseStoryPeriod('/story yearly'), 'week')
})
t('strip removes command and period only', () =>
  assert.equal(stripStoryCommand('slept badly /story week'), 'slept badly'))
t('/story does not fire on /storybook', () => assert.deepEqual(detectTriggers('/storybook'), []))
t('only new triggers fire', () => assert.deepEqual(detectNewTriggers('/story week', '/story'), []))

// --- compression -----------------------------------------------------------
t('windows', () => {
  const w = periodWindow('week', NOW)
  assert.equal(w.start.toISOString(), '2026-09-25T00:00:00.000Z')
  assert.equal(w.prevStart.toISOString(), '2026-09-18T00:00:00.000Z')
})
t('valence', () => {
  assert.ok(scoreValence('so happy and grateful') > 0)
  assert.ok(scoreValence('exhausted and anxious') < 0)
  assert.equal(scoreValence('bought bread'), 0)
})
t('empty rows and generated stories are ignored', () => {
  const d = compressLogs([
    note('2026-10-01T10:00:00Z', ''),
    { event: 'generated_story', text: 'happy happy', createdAt: '2026-10-01T10:00:00Z' },
  ], 'week', NOW)
  assert.equal(d.entries, 0)
  assert.ok(renderDigestStory(d).includes('NONE'))
})
t('week digest: counts, streak, peaks, rhythm, city', () => {
  const d = compressLogs([
    note('2026-10-01T09:00:00Z', 'great morning, feeling calm', { context: { city: 'Austin' } }),
    note('2026-09-30T08:00:00Z', 'tired and overwhelmed today', { context: { city: 'Austin' } }),
    note('2026-09-30T09:00:00Z', 'coffee'),
    note('2026-09-29T07:00:00Z', 'ok'),
    { event: 'emotional_checkin', createdAt: '2026-09-29T07:00:00Z', metadata: { emotionalState: 'Calm' } },
  ], 'week', NOW)
  assert.equal(d.entries, 4)
  assert.equal(d.activeDays, 3)
  assert.equal(d.streak, 3)
  assert.equal(d.peakDay?.date, '2026-09-30')
  assert.equal(d.rhythm, 'morning')
  assert.equal(d.city, 'Austin')
  assert.deepEqual(d.moods, [{ mood: 'calm', count: 1 }])
  assert.ok(d.high!.excerpt.includes('great'))
  assert.ok(d.low!.excerpt.includes('tired'))
  assert.equal(d.trend, 'new')
})
t('streak survives an empty today', () => {
  const d = compressLogs([note('2026-09-30T09:00:00Z', 'x'), note('2026-09-29T09:00:00Z', 'x')], 'week', NOW)
  assert.equal(d.streak, 2)
})
t('spike and drop vs previous window', () => {
  const prev = [note('2026-09-20T09:00:00Z', 'a'), note('2026-09-21T09:00:00Z', 'b')]
  const cur = ['26', '27', '28', '29'].map(day => note(`2026-09-${day}T09:00:00Z`, 'c'))
  assert.equal(compressLogs([...prev, ...cur], 'week', NOW).trend, 'spike')
  assert.equal(compressLogs([...prev, ...prev, note('2026-09-20T10:00:00Z', 'z'), note('2026-09-26T09:00:00Z', 'c')], 'week', NOW).trend, 'drop')
})
t('arcade ranks are monotonic', () => {
  assert.equal(arcadeRank(0, 0, 0).title, 'SIGNAL')
  assert.equal(arcadeRank(10, 4, 0).title, 'OPERATOR')
  assert.equal(arcadeRank(1000, 200, 30).title, 'ARCHITECT')
  assert.equal(arcadeRank(1000, 200, 30).nextTitle, null)
})
t('renderers carry the facts', () => {
  const d = compressLogs([note('2026-10-01T09:00:00Z', 'happy day')], 'day', NOW)
  assert.ok(renderDigestBlock(d).includes('ENTRIES: 1'))
  assert.ok(renderDigestStory(d).includes('ARCADE'))
})

console.log(`\n${passed} passed`)
