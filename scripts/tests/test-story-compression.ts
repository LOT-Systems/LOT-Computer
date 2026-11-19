/**
 * LOT® Story Compression Engine — deterministic self-test.
 * Run: npx tsx scripts/tests/test-story-compression.ts
 */
import assert from 'node:assert/strict'
import {
  parseStoryCommand, compressStory, computeArcade, renderLedger,
  fallbackNarrative, stripGenerated, textValence, type StoryLogInput,
} from '../../src/shared/utils/storyCompression'

const NOW = new Date('2026-11-19T20:00:00Z')
const h = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3600_000)
const ctx = (city: string, k: number, wall: string) => ({ city, temperature: k, humidity: 60, astroMoonPhase: 'Waxing Gibbous', date: wall })

let pass = 0
const t = (name: string, fn: () => void) => { fn(); pass++; console.log('  ✓', name) }

t('parse: default horizon week', () => assert.deepEqual(parseStoryCommand('/story'), { horizon: 'week', residual: '' }))
t('parse: /story month + residual', () => assert.deepEqual(parseStoryCommand('slept badly /story month'), { horizon: 'month', residual: 'slept badly' }))
t('parse: aliases d/y', () => { assert.equal(parseStoryCommand('/story d').horizon, 'day'); assert.equal(parseStoryCommand('/story Y').horizon, 'year') })
t('parse: unknown arg keeps text', () => assert.deepEqual(parseStoryCommand('/story about rain'), { horizon: 'week', residual: 'about rain' }))
t('parse: emoji', () => assert.equal(parseStoryCommand('📖 day').horizon, 'day'))
t('strip: removes generated blocks + commands', () => assert.equal(stripGenerated('walked in sun /story week\n\n📖 You did things.'), 'walked in sun'))
t('valence: signed', () => { assert.ok(textValence('grateful and calm') > 0); assert.ok(textValence('exhausted, anxious') < 0) })

const logs: StoryLogInput[] = [
  { event: 'note', text: 'Grateful for a long walk in the sun, felt calm', createdAt: h(2), context: ctx('Berlin', 285.15, '2026-11-19 20:00:00') },
  { event: 'note', text: 'Exhausted and anxious after the meeting', createdAt: h(30), context: ctx('Berlin', 283.15, '2026-11-18 14:00:00') },
  { event: 'note', text: 'Coffee. Plans.', createdAt: h(50), context: ctx('Paris', 287.15, '2026-11-17 08:00:00') },
  { event: 'emotional_checkin', text: null, metadata: { emotionalState: 'tired' }, createdAt: h(31), context: ctx('Berlin', 283.15, '2026-11-18 13:00:00') },
  { event: 'note', text: 'old week entry', createdAt: h(24 * 9), context: ctx('Berlin', 280, '2026-11-10 21:00:00') },
  { event: 'note', text: '', createdAt: h(1) },
  { event: 'generated_story', text: 'x', createdAt: h(5) },
]

t('compress: week counts + peaks', () => {
  const p = compressStory(logs, 'week', NOW)
  assert.equal(p.entries, 3)
  assert.equal(p.checkins, 1)
  assert.equal(p.prevEntries, 1)
  assert.equal(p.shift, 'surge')
  assert.equal(p.shiftPct, 200)
  assert.equal(p.cities[0], 'Berlin')
  assert.equal(p.avgTempC, 12)
  assert.equal(p.peaks.find(x => x.kind === 'high')!.excerpt.startsWith('Grateful'), true)
  assert.equal(p.peaks.find(x => x.kind === 'low')!.excerpt.startsWith('Exhausted'), true)
  assert.equal(p.activeDays, 3)
})
t('compress: day window + new signal', () => {
  const p = compressStory(logs, 'day', NOW)
  assert.equal(p.entries, 1)
  assert.equal(p.shift, 'steady')
  assert.equal(p.dominantTime, 'evening')
})
t('compress: silent', () => assert.equal(compressStory([], 'month', NOW).shift, 'silent'))
t('compress: deterministic', () => assert.deepEqual(compressStory(logs, 'year', NOW), compressStory(logs, 'year', NOW)))
t('arcade: xp + level curve', () => {
  const a = computeArcade(logs)
  // 4 notes*10 + 1 checkin*5 + 4 days*15 + 1 story*25 = 130 → LV1
  assert.equal(a.xp, 130); assert.equal(a.level, 1); assert.equal(a.rank, 'Initiate')
  assert.equal(a.xpIntoLevel, 30); assert.equal(a.xpForNext, 300)
})
t('ledger + fallback render', () => {
  const p = compressStory(logs, 'week', NOW)
  const l = renderLedger(p)
  assert.match(l, /STORY {9}WEEK/); assert.match(l, /HIGH ▲/); assert.match(l, /ARCADE/)
  assert.match(fallbackNarrative(p), /Berlin/)
  assert.match(fallbackNarrative(compressStory([], 'day', NOW)), /quiet today/)
})
console.log(`\nSCE v1 — ${pass}/${pass} PASS`)
