/**
 * LOG COMMAND SYSTEM — contract tests (no DB, no network).
 * Run: yarn test:log
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, buildSystemHelp, renderSystemHelpText } from '../../src/shared/utils/log-commands'
import {
  buildStoryDigest, renderDigestBlock, composeDigestStory, parseStoryScope,
} from '../../src/shared/utils/story-compression'
import { computeStreakDays, getArcadeStatus, formatArcadeLine } from '../../src/shared/utils/arcade'
import { detectTriggers, detectNewTriggers } from '../../src/client/utils/logTriggers'

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS  ${name}`) }

const NOW = new Date('2026-10-03T12:00:00Z')
const day = (n: number, hour = 9) => new Date(NOW.getTime() - n * 86_400_000 + (hour - 12) * 3_600_000)

// --- registry ↔ detector contract ----------------------------------------
t('every registry command fires its own trigger', () => {
  for (const c of LOG_COMMANDS) {
    const hits = detectTriggers(`/${c.command}`)
    assert.ok(hits.includes(c.trigger as any), `/${c.command} should fire ${c.trigger}, got [${hits}]`)
  }
})
t('registry has unique commands and triggers', () => {
  assert.equal(new Set(LOG_COMMANDS.map(c => c.command)).size, LOG_COMMANDS.length)
  assert.equal(new Set(LOG_COMMANDS.map(c => c.trigger)).size, LOG_COMMANDS.length)
})
t('/system and /story are registered', () => {
  const names = LOG_COMMANDS.map(c => c.command)
  assert.ok(names.includes('system') && names.includes('story'))
})
t('/system help lists every command exactly once', () => {
  const text = renderSystemHelpText('RANK TEST')
  for (const c of LOG_COMMANDS) {
    assert.equal(text.split('\n').filter(l => l.startsWith(`/${c.command}`) && l.includes(c.description)).length, 1, c.command)
  }
  assert.ok(text.startsWith('RANK TEST'))
  assert.equal(buildSystemHelp().sections.length, 4)
})
t('delta detection does not re-fire edited text', () => {
  assert.deepEqual(detectNewTriggers('/story hello', '/story'), [])
  assert.deepEqual(detectNewTriggers('/story', ''), ['story-mode'])
})
t('prefix words do not fire (/storyboard, /daydream)', () => {
  assert.deepEqual(detectTriggers('/storyboard /daydream'), [])
})

// --- scope ----------------------------------------------------------------
t('parseStoryScope aliases + default', () => {
  assert.equal(parseStoryScope('Day'), 'day')
  assert.equal(parseStoryScope('y'), 'year')
  assert.equal(parseStoryScope(undefined), 'week')
  assert.equal(parseStoryScope('garbage'), 'week')
})

// --- digest ---------------------------------------------------------------
const logs = [
  { event: 'note', text: 'Slept badly, heavy head', createdAt: day(6), context: { temperature: 283.15, humidity: 80, weatherDescription: 'rain', city: 'Portland', astroMoonPhase: 'Waxing' } },
  { event: 'emotional_checkin', createdAt: day(6, 10), metadata: { emotionalState: 'tired' } },
  { event: 'note', text: '/story', createdAt: day(5) },
  { event: 'emotional_checkin', createdAt: day(1, 8), metadata: { emotionalState: 'hopeful' } },
  { event: 'note', text: 'Long walk, clear sky', createdAt: day(1, 18), context: { temperature: 293.15, humidity: 40, weatherDescription: 'clear', city: 'Portland' } },
  { event: 'note', text: 'old entry outside window', createdAt: day(40) },
  { event: 'generated_story', text: 'x', createdAt: day(0) },
]
t('digest respects window and excludes slash echoes', () => {
  const d = buildStoryDigest(logs as any, 'week', NOW, 2)
  assert.equal(d.entryCount, 2)           // two real notes in window
  assert.ok(!d.samples.some(s => s.startsWith('/')))
  assert.equal(buildStoryDigest(logs as any, 'day', NOW).entryCount, 1) // only the 18h-old walk
  assert.ok(buildStoryDigest(logs as any, 'year', NOW).entryCount >= 3)
})
t('digest captures mood arc and environment in Celsius', () => {
  const d = buildStoryDigest(logs as any, 'week', NOW, 2)
  assert.equal(d.moodFirst, 'tired')
  assert.equal(d.moodLast, 'hopeful')
  assert.equal(d.avgTempC, 15)            // (10 + 20) / 2
  assert.deepEqual(d.cities, ['Portland'])
})
t('digest detects quiet gap and spike', () => {
  const d = buildStoryDigest(logs as any, 'week', NOW)
  assert.ok(d.quietGapDays >= 2)
  const burst = Array.from({ length: 8 }, (_, i) => ({ event: 'note', text: `n${i}`, createdAt: day(0, 8 + (i % 4)) }))
  const spiky = buildStoryDigest([...burst, { event: 'note', text: 'a', createdAt: day(3) }] as any, 'week', NOW)
  assert.equal(spiky.spike, true)
})
t('rendered block + offline story are non-empty and bounded', () => {
  const d = buildStoryDigest(logs as any, 'week', NOW, 2)
  const block = renderDigestBlock(d)
  assert.ok(block.includes('MOOD ARC: tired×1, hopeful×1 (tired → hopeful)'))
  assert.ok(block.length < 1500)
  assert.ok(composeDigestStory(d, 'RANK FOUNDATION').includes('RANK FOUNDATION'))
  assert.ok(composeDigestStory(buildStoryDigest([], 'day', NOW), undefined).includes('Nothing was recorded'))
})

// --- arcade ---------------------------------------------------------------
t('streak counts consecutive days, alive until midnight', () => {
  assert.equal(computeStreakDays([day(0), day(1), day(2), day(4)], NOW), 3)
  assert.equal(computeStreakDays([day(1), day(2)], NOW), 2)   // today not yet logged
  assert.equal(computeStreakDays([day(3)], NOW), 0)
  assert.equal(computeStreakDays([], NOW), 0)
})
t('arcade ladder', () => {
  assert.equal(getArcadeStatus(0).rank, 'Recruit')
  assert.equal(getArcadeStatus(7).rank, 'Foundation')
  assert.equal(getArcadeStatus(29).rank, 'Deep Foundation')
  assert.equal(getArcadeStatus(30).rank, 'Structure')
  assert.equal(getArcadeStatus(400).nextRank, null)
  assert.equal(formatArcadeLine(getArcadeStatus(5)), 'RANK RECRUIT · STREAK 5D · 2D TO FOUNDATION')
})

console.log(`\n${passed} passed`)
