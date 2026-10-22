/**
 * Log command system — pure-logic tests.
 * Run: npx tsx --test scripts/tests/log-commands.test.ts
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LOG_COMMANDS, resolveCommand, buildSystemHelpLines, parseStoryRange,
  getArcadeStatus, computeArcadeXp, formatArcadeLine, ARCADE_RANKS,
} from '../../src/shared/utils/logCommands'
import { buildStoryDigest, computeStreak, formatDigestForPrompt } from '../../src/shared/utils/storyCompression'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const NOW = new Date('2026-10-22T12:00:00Z')
const d = (daysAgo: number, h = 9) => new Date(NOW.getTime() - daysAgo * 86_400_000 - (12 - h) * 3_600_000)

test('registry: names and aliases are unique', () => {
  const all = LOG_COMMANDS.flatMap(c => [c.name, ...c.aliases])
  assert.equal(new Set(all).size, all.length)
})

test('registry: every command is reachable by detectTriggers', () => {
  for (const c of LOG_COMMANDS) {
    assert.ok(detectTriggers(`/${c.name}`).length > 0, `/${c.name} has no trigger`)
  }
})

test('resolveCommand handles slash, case and aliases', () => {
  assert.equal(resolveCommand('/Commands')?.name, 'system')
  assert.equal(resolveCommand('arcade')?.name, 'rank')
  assert.equal(resolveCommand('nope'), null)
})

test('/system lists every command exactly once', () => {
  const text = buildSystemHelpLines().join('\n')
  for (const c of LOG_COMMANDS) {
    assert.equal(text.split(`/${c.name} `).length - 1 + (text.endsWith(`/${c.name}`) ? 1 : 0), 1, c.name)
  }
})

test('parseStoryRange', () => {
  assert.equal(parseStoryRange('/story'), 'recent')
  assert.equal(parseStoryRange('/story week'), 'week')
  assert.equal(parseStoryRange('felt odd\n/story YEAR'), 'year')
  assert.equal(parseStoryRange('/story banana'), 'recent')
  assert.equal(parseStoryRange('no command'), 'recent')
})

test('arcade: ladder boundaries', () => {
  assert.equal(getArcadeStatus(0).rank.title, 'RECRUIT')
  assert.equal(getArcadeStatus(99).rank.title, 'RECRUIT')
  assert.equal(getArcadeStatus(100).rank.title, 'OPERATOR')
  assert.equal(getArcadeStatus(10000).rank.title, 'ARCHITECT')
  assert.equal(getArcadeStatus(10000).next, null)
  assert.equal(getArcadeStatus(-5).xp, 0)
  assert.equal(ARCADE_RANKS.length, 6)
  assert.equal(computeArcadeXp({ logEntries: 2, checkins: 2, storiesRead: 1, streakDays: 1 }), 65)
  assert.match(formatArcadeLine(getArcadeStatus(150)), /LV2 OPERATOR/)
})

test('streak counts back from today or yesterday', () => {
  const keys = (n: number[]) => new Set(n.map(x => d(x).toISOString().slice(0, 10)))
  assert.equal(computeStreak(keys([0, 1, 2]), NOW), 3)
  assert.equal(computeStreak(keys([1, 2]), NOW), 2)
  assert.equal(computeStreak(keys([3]), NOW), 0)
})

test('digest: counts note entries, context and ignores empties', () => {
  const rows = [
    { event: 'note', text: 'slept badly', createdAt: d(0), context: { city: 'Austin', temperature: 300.15, humidity: 40, weatherDescription: 'clear sky', astroMoonPhase: 'Waxing' } },
    { event: 'note', text: 'better day', createdAt: d(1), context: { city: 'Austin', temperature: 290.15, humidity: 60 } },
    { event: 'note', text: '   ', createdAt: d(1) },
    { event: 'chat_message', text: 'hi', createdAt: d(0) },
    { event: 'note', text: 'old', createdAt: d(40) },
  ]
  const dg = buildStoryDigest(rows, 'week', NOW)
  assert.equal(dg.entryCount, 2)
  assert.equal(dg.activeDays, 2)
  assert.equal(dg.avgTempC, Math.round(((300.15 - 273.15 + 290.15 - 273.15) / 2) * 10) / 10)
  assert.equal(dg.avgHumidity, 50)
  assert.deepEqual(dg.topCities, ['Austin'])
  assert.equal(dg.streakDays, 3 - 1) // d(0), d(1) active; d(40) not contiguous
  assert.match(formatDigestForPrompt(dg), /ENTRIES: 2 across 2 active/)
})

test('digest: flags volume spike, silence and mood shift', () => {
  const rows: any[] = [
    ...[0, 0, 0, 0, 0].map(() => ({ event: 'note', text: 'x', createdAt: d(5) })),
    { event: 'note', text: 'y', createdAt: d(6) },
    { event: 'note', text: 'z', createdAt: d(7) },
    ...['calm', 'calm', 'tense', 'tense'].map((m, i) => ({ event: 'emotional_checkin', createdAt: d(i + 4), metadata: { emotionalState: m } })),
  ]
  const dg = buildStoryDigest(rows, 'month', NOW)
  assert.ok(dg.spikes.some(s => s.startsWith('VOLUME SPIKE')))
  assert.ok(dg.spikes.some(s => s.startsWith('SILENCE')))
  assert.ok(dg.spikes.some(s => s.startsWith('MOOD SHIFT: TENSE → CALM')))
})

test('digest: empty input is safe', () => {
  const dg = buildStoryDigest([], 'year', NOW)
  assert.equal(dg.entryCount, 0)
  assert.equal(dg.avgTempC, null)
  assert.match(formatDigestForPrompt(dg), /\(none\)/)
})
