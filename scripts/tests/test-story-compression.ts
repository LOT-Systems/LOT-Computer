/**
 * LOT® Story Compression Engine — unit checks.
 * Run: npx esr ./scripts/tests/test-story-compression.ts
 */
import assert from 'node:assert/strict'
import {
  compressLogs, computeArcade, parseStoryHorizon, renderCompressedStory,
  renderPacketHeader, scoreValence, xpForLevel, buildStoryPrompt, type CompressibleLog,
} from '../../src/shared/utils/story-compression.ts'

const NOW = new Date('2026-11-15T12:00:00Z')
const h = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3_600_000)
const ctx = { temperature: 285.15, humidity: 70, city: 'Lisbon', weatherDescription: 'Rain', astroMoonPhase: 'Waxing Moon', astroWesternZodiac: 'Scorpio' }

let pass = 0
const t = (name: string, fn: () => void) => { fn(); pass++; console.log('  PASS', name) }

t('horizon parsing', () => {
  assert.equal(parseStoryHorizon('/story'), 'day')
  assert.equal(parseStoryHorizon('note /week'), 'week')
  assert.equal(parseStoryHorizon('/month'), 'month')
  assert.equal(parseStoryHorizon('/story year'), 'year')
  assert.equal(parseStoryHorizon('/weekend plans'), 'day')
})

t('valence + negation', () => {
  assert.ok(scoreValence('grateful and calm by the sea') > 0)
  assert.ok(scoreValence('exhausted, anxious, alone') < 0)
  assert.ok(scoreValence('not happy') < 0)
  assert.equal(scoreValence('the table is wood'), 0)
})

t('empty log → quiet story, no throw', () => {
  const p = compressLogs([], 'day', NOW)
  assert.equal(p.totals.snapshots, 0)
  assert.equal(p.horizon, 'year') // auto-widened to the end
  assert.match(renderCompressedStory(p), /quiet/)
})

const logs: CompressibleLog[] = [
  { event: 'note', text: 'Walked by the ocean, grateful and calm. The ocean was loud.', context: ctx, createdAt: h(2) },
  { event: 'note', text: 'Exhausted and anxious after the ocean meeting, felt alone.', context: ctx, createdAt: h(30) },
  { event: 'emotional_checkin', metadata: { emotionalState: 'tired' }, context: ctx, createdAt: h(40) },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, context: ctx, createdAt: h(3) },
  { event: 'self_care', context: ctx, createdAt: h(5) },
  { event: 'generated_story', text: 'machine words grateful grateful', createdAt: h(1) },
]

t('day auto-widens to week when quiet', () => {
  const p = compressLogs(logs, 'day', NOW)
  assert.equal(p.requestedHorizon, 'day')
  assert.equal(p.horizon, 'week')
  assert.equal(p.widened, true)
  assert.equal(p.totals.journal, 2)
})

t('explicit horizon is honored (no widen)', () => {
  const p = compressLogs(logs, 'day', NOW, { autoWiden: false })
  assert.equal(p.horizon, 'day')
  assert.equal(p.totals.journal, 1)
})

t('peaks, environment, themes', () => {
  const p = compressLogs(logs, 'week', NOW)
  assert.ok(p.peaks.find(x => x.kind === 'high'))
  assert.ok(p.peaks.find(x => x.kind === 'low'))
  assert.equal(p.environment.tempMinC, 12)
  assert.deepEqual(p.environment.cities, ['Lisbon'])
  assert.ok(p.themes.includes('ocean'))
  assert.match(renderPacketHeader(p), /ARCADE\s+LV/)
  assert.match(renderCompressedStory(p), /\?$/)
})

t('machine rows excluded from voice & XP', () => {
  const a = computeArcade([{ event: 'generated_story', text: 'x', createdAt: h(1) }])
  assert.equal(a.xp, 0)
})

t('arcade levels monotonic', () => {
  assert.equal(xpForLevel(1), 0)
  assert.ok(xpForLevel(3) > xpForLevel(2))
  const many: CompressibleLog[] = Array.from({ length: 40 }, (_, i) => ({ event: 'note', text: 'a quiet line of text here', createdAt: h(i * 24) }))
  const a = computeArcade(many)
  assert.equal(a.streakDays, 40)
  assert.ok(a.level >= 4)
  assert.ok(a.progress >= 0 && a.progress < 1)
})

t('vendor prompt carries packet, not archive', () => {
  const long = 'x'.repeat(5000)
  const p = compressLogs([...logs, { event: 'note', text: long, createdAt: h(1) }], 'week', NOW)
  const prompt = buildStoryPrompt(p, 'hello')
  assert.ok(!prompt.includes(long))
  assert.ok(prompt.length < 6000)
})

console.log(`\nSCE: ${pass}/${pass} PASS`)
