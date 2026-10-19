/**
 * LOT SYSTEMS CORPORATION — S-2: VADIK MARMELADOV
 * Tests: Log command registry (/system) + story compression (/story).
 * Run: npx tsx scripts/tests/test-log-commands.ts
 * Doc: docs/technical/LOG-COMMAND-SYSTEM.md
 */
import assert from 'node:assert/strict'
import {
  LOG_COMMANDS, renderSystemHelp, parseStoryPeriod, arcadeRankForXp, ARCADE_LADDER,
} from '../../src/shared/utils/log-commands'
import { detectTriggers } from '../../src/client/utils/logTriggers'
import {
  buildStoryDigest, fallbackStory, digestToPromptBlock, computeXp, type DigestLog,
} from '../../src/server/utils/story-compression'

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS  ${name}`) }

const NOW = new Date('2026-10-19T12:00:00Z')
const at = (daysAgo: number, hour = 9) => new Date(NOW.getTime() - daysAgo * 86_400_000 + (hour - 12) * 3_600_000)
const note = (daysAgo: number, text: string, hour = 9): DigestLog =>
  ({ event: 'note', text, createdAt: at(daysAgo, hour), context: { temperature: 293.15, city: 'Austin' } })
const mood = (daysAgo: number, m: string): DigestLog =>
  ({ event: 'emotional_checkin', createdAt: at(daysAgo), metadata: { emotionalState: m } })

// ── /system ────────────────────────────────────────────────────────────────
t('every registry command fires its trigger detector', () => {
  for (const c of LOG_COMMANDS) {
    assert.ok(detectTriggers(`/${c.name}`).length > 0, `/${c.name} has no trigger rule`)
  }
})
t('help lists every command exactly once', () => {
  const help = renderSystemHelp()
  for (const c of LOG_COMMANDS) {
    const rows = help.split('\n').filter(l => l.startsWith(`/${c.name} `) || l === `/${c.name}`)
    assert.equal(rows.length, 1, `/${c.name} rows=${rows.length}`)
  }
  assert.ok(help.startsWith('AVAILABLE COMMANDS'))
})
t('help command rows keep 2+ space gutter for the renderer', () => {
  for (const l of renderSystemHelp().split('\n').filter(l => l.startsWith('/'))) {
    assert.ok(/\s{2,}/.test(l), l)
  }
})

// ── /story period ──────────────────────────────────────────────────────────
t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('hi /story month'), 'month')
  assert.equal(parseStoryPeriod('/STORY Year'), 'year')
  assert.equal(parseStoryPeriod('/story today'), 'day')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
})

// ── digest ─────────────────────────────────────────────────────────────────
t('empty history yields a calm fallback and rank 1', () => {
  const d = buildStoryDigest([], 'week', NOW)
  assert.equal(d.entryCount, 0)
  assert.equal(d.rank.level, 1)
  assert.match(fallbackStory(d), /Nothing has been written/)
})
t('window selection and previous-window baseline', () => {
  const logs = [note(1, 'a'), note(2, 'b'), note(10, 'old'), note(9, 'old2'), note(8, 'old3')]
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.equal(d.entryCount, 2)
  assert.equal(d.previousEntryCount, 3)
})
t('generated_story and empty notes are excluded from entries', () => {
  const logs: DigestLog[] = [
    { event: 'generated_story', text: 'prior story', createdAt: at(1) },
    { event: 'note', text: '   ', createdAt: at(1) },
    note(1, 'real'),
  ]
  assert.equal(buildStoryDigest(logs, 'week', NOW).entryCount, 1)
})
t('spike detected on a burst day', () => {
  const logs = [note(5, 'x'), note(3, 'y'), ...[1, 2, 3, 4, 5, 6].map(h => note(1, `burst ${h}`, 8 + h))]
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.ok(d.signals.some(s => s.kind === 'spike'), JSON.stringify(d.signals))
})
t('volume shift needs a real baseline', () => {
  const few = [note(1, 'a'), note(2, 'b'), note(8, 'c')]
  assert.ok(!buildStoryDigest(few, 'week', NOW).signals.some(s => s.kind === 'volume-shift'))
  const drop = [note(1, 'a'), ...[8, 9, 10, 11, 12, 13].map(n => note(n, 'p'))]
  assert.ok(buildStoryDigest(drop, 'week', NOW).signals.some(s => s.kind === 'volume-shift'))
})
t('mood shift and dominant mood', () => {
  const logs = [mood(6, 'low'), mood(5, 'low'), mood(2, 'good'), mood(1, 'good'), mood(0.5, 'good')]
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.equal(d.dominantMood, 'good')
  assert.ok(d.signals.some(s => s.kind === 'mood-shift' && /low to good/.test(s.detail)))
})
t('silence flagged after an established habit stops', () => {
  const logs = [note(6, 'a'), note(5, 'b'), note(9, 'c'), note(10, 'd'), note(11, 'e')]
  assert.ok(buildStoryDigest(logs, 'week', NOW).signals.some(s => s.kind === 'silence'))
})
t('context aggregates (Kelvin -> C) and keywords', () => {
  const logs = [note(1, 'garden morning garden'), note(2, 'garden walk morning')]
  const d = buildStoryDigest(logs, 'week', NOW)
  assert.equal(d.avgTempC, 20)
  assert.deepEqual(d.cities, ['Austin'])
  assert.ok(d.keywords.includes('garden') && d.keywords.includes('morning'))
})
t('digest is deterministic and prompt block carries no raw ids', () => {
  const logs = [note(1, 'alpha beta'), note(2, 'alpha gamma')]
  assert.deepEqual(buildStoryDigest(logs, 'month', NOW), buildStoryDigest(logs, 'month', NOW))
  assert.match(digestToPromptBlock(buildStoryDigest(logs, 'month', NOW)), /PERIOD: month/)
})

// ── arcade ─────────────────────────────────────────────────────────────────
t('xp caps per day (no grinding)', () => {
  const spam = Array.from({ length: 50 }, (_, i) => note(0, `s${i}`, 1 + (i % 10)))
  assert.equal(computeXp(spam, NOW), 5 * 3 + 1 * 2)
})
t('rank ladder boundaries', () => {
  assert.equal(arcadeRankForXp(0).title, 'SPARK')
  assert.equal(arcadeRankForXp(49).level, 1)
  assert.equal(arcadeRankForXp(50).title, 'SIGNAL')
  assert.equal(arcadeRankForXp(1e9).level, ARCADE_LADDER.length)
  assert.equal(arcadeRankForXp(1e9).next, null)
  assert.equal(arcadeRankForXp(NaN).level, 1)
})

console.log(`\n${passed} passed`)
