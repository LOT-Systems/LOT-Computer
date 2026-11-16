/**
 * LOT SYSTEMS CORPORATION
 * Verification harness — Log /story compression + /system registry.
 * Run: npx tsx scripts/verify/story-compression.verify.ts   (exit 0 = GREEN)
 */
import assert from 'node:assert/strict'
import {
  parseStoryScope, stripStoryCommand, compressStory, renderCapsule,
  fallbackStory, arcadeStatus, textValence, capsuleToPrompt,
} from '../../src/shared/utils/story-compression'
import {
  detectTriggers, missingFromRegistry, renderSystemHelp, LOG_COMMANDS,
} from '../../src/client/utils/logTriggers'

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ✓ ${name}`) }

console.log('LOT /story + /system verification')

t('scope parsing', () => {
  assert.equal(parseStoryScope('/story'), 'week')
  assert.equal(parseStoryScope('hello /story month'), 'month')
  assert.equal(parseStoryScope('/story Y'), 'year')
  assert.equal(parseStoryScope('/story today'), 'day')
  assert.equal(parseStoryScope('/story banana'), 'week')
  assert.equal(parseStoryScope(''), 'week')
})

t('command stripping keeps free text', () => {
  assert.equal(stripStoryCommand('rain all day /story week'), 'rain all day')
  assert.equal(stripStoryCommand('📖 /story'), '')
  assert.equal(stripStoryCommand('/story year was long'), 'was long')
})

t('trigger detection for scoped story + system', () => {
  assert.ok(detectTriggers('/story month').includes('story-mode'))
  assert.ok(detectTriggers('/system').includes('system-help'))
  assert.ok(!detectTriggers('/storyteller').includes('story-mode'))
  assert.ok(detectTriggers('/sil').includes('silent-mode'))
})

t('registry covers every keyword trigger', () => {
  assert.deepEqual(missingFromRegistry(), [])
  const help = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(help.some(l => l.startsWith(c.command)), c.command)
  // renderer contract: command lines split on a 2+ space gap
  for (const l of help.filter(l => l.startsWith('/'))) assert.ok(/\s{2,}/.test(l), l)
})

t('text valence with negation', () => {
  assert.ok(textValence('grateful and calm') > 0)
  assert.ok(textValence('exhausted, anxious') < 0)
  assert.ok(textValence('not good') < 0)
  assert.equal(textValence(''), 0)
})

const now = new Date('2026-11-16T12:00:00Z')
const at = (daysAgo: number, h = 9) => new Date(now.getTime() - daysAgo * 864e5 - (12 - h) * 36e5)
const ctx = { temperature: 283.15, humidity: 70, city: 'Brooklyn', astroMoonPhase: 'Waxing', astroWesternZodiac: 'Scorpio' }
const logs = [
  { event: 'note', text: 'exhausted and anxious, heavy day', createdAt: at(6), context: ctx },
  { event: 'emotional_checkin', metadata: { emotionalState: 'tired' }, createdAt: at(5), context: ctx },
  { event: 'note', text: 'stuck', createdAt: at(4, 23), context: ctx },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: at(2), context: ctx },
  { event: 'note', text: 'grateful, long walk in the sun, calm', createdAt: at(1), context: ctx },
  { event: 'answer', metadata: { question: 'q', option: 'a' }, createdAt: at(1), context: ctx },
  { event: 'note', text: 'old', createdAt: at(40), context: ctx }, // out of week window
  { event: 'generated_story', text: 'ai output', createdAt: at(0), context: ctx },
]

t('week capsule: counts, window, peaks, shift', () => {
  const c = compressStory(logs, 'week', now, undefined, d => d.getUTCHours())
  assert.equal(c.entries, 3)
  assert.equal(c.checkins, 2)
  assert.equal(c.answers, 1)
  assert.ok(c.high && c.high.excerpt.includes('grateful'))
  assert.ok(c.low && c.low.excerpt.includes('exhausted'))
  assert.equal(c.shift?.direction, 'rising')
  assert.equal(c.context.avgTempC, 10)
  assert.deepEqual(c.context.cities, ['Brooklyn'])
  assert.equal(c.arcade.windowXP, 3 * 10 + 2 * 5 + 5) // AI output earns nothing
})

t('day capsule excludes older logs', () => {
  const c = compressStory(logs, 'day', now)
  assert.equal(c.entries, 0)
  assert.match(fallbackStory(c), /Nothing was recorded today/)
})

t('arcade ranks', () => {
  assert.equal(arcadeStatus(0).title, 'SIGNAL')
  assert.equal(arcadeStatus(100).title, 'OBSERVER')
  assert.equal(arcadeStatus(1499).toNext, 1)
  assert.equal(arcadeStatus(99999).nextTitle, null)
})

t('render + prompt + fallback are populated', () => {
  const c = compressStory(logs, 'week', now, 620)
  const lines = renderCapsule(c)
  assert.ok(lines[0].startsWith('STORY'))
  assert.ok(lines.some(l => l.startsWith('ARCADE') && l.includes('RECORDER')))
  assert.match(capsuleToPrompt(c), /HIGH PEAK/)
  assert.match(fallbackStory(c), /This week you showed up/)
  console.log('\n' + lines.map(l => '    ' + l).join('\n') + '\n')
})

console.log(`GREEN — ${passed} checks passed`)
