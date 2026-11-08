/**
 * LOT SYSTEMS — Log command / story / arcade self-test (no framework).
 * Run: yarn test:log
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, buildSystemHelp } from '../../src/shared/logCommands.ts'
import { parseStoryRange, stripStoryCommand, buildStoryDigest, composeLocalStory, renderDigestBlock, stripGeneratedBlocks } from '../../src/shared/story.ts'
import { computeXp, getArcadeStanding, computeStreak, ARCADE_RANKS, renderArcadeLine } from '../../src/shared/arcade.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`PASS  ${name}`) }

// ── registry ────────────────────────────────────────────────────────────
t('registry: triggers unique', () => {
  const ids = LOG_COMMANDS.map(c => c.trigger)
  assert.equal(new Set(ids).size, ids.length)
})
t('registry: keywords unique across commands', () => {
  const kws = LOG_COMMANDS.flatMap(c => c.keywords)
  assert.equal(new Set(kws).size, kws.length)
})
t('/system lists every visible command', () => {
  const help = buildSystemHelp()
  for (const c of LOG_COMMANDS.filter(c => !c.hidden && c.keywords.length)) {
    assert.ok(help.includes(`/${c.keywords[0]}`), `missing /${c.keywords[0]}`)
  }
  assert.ok(help.includes('/story [day|week|month|year]'))
  assert.ok(help.includes('/system'))
})

// ── story range ─────────────────────────────────────────────────────────
t('parseStoryRange', () => {
  assert.equal(parseStoryRange('/story'), 'day')
  assert.equal(parseStoryRange('/story week'), 'week')
  assert.equal(parseStoryRange('felt ok /STORY Month'), 'month')
  assert.equal(parseStoryRange('/story yearly'), 'year')
  assert.equal(parseStoryRange('/story banana'), 'day')
  assert.equal(parseStoryRange('no command'), 'day')
  assert.equal(parseStoryRange(null), 'day')
})
t('stripStoryCommand', () => {
  assert.equal(stripStoryCommand('slept badly /story week'), 'slept badly')
  assert.equal(stripStoryCommand('📖 /story'), '')
  assert.equal(stripStoryCommand('/story year\nmore text'), 'more text')
})
t('stripGeneratedBlocks drops 📖/🕯️ paragraphs', () => {
  assert.equal(stripGeneratedBlocks('my day\n\n📖 You walked.\n\n🕯️ Psalm 1'), 'my day')
})

// ── digest ──────────────────────────────────────────────────────────────
const now = new Date('2026-11-08T12:00:00Z')
const at = (daysAgo: number, hour = 9) => new Date(now.getTime() - daysAgo * 86_400_000 + (hour - 12) * 3_600_000)
const ctx = { temperature: 288.15, humidity: 60, city: 'Austin', weatherDescription: 'Clear', astroMoonPhase: 'Waxing', timeZone: 'UTC' }
const rows = [
  { event: 'note', text: 'first light run', createdAt: at(6), context: ctx },
  { event: 'note', text: 'work was heavy today', createdAt: at(5), context: ctx },
  { event: 'emotional_checkin', metadata: { emotionalState: 'Tired' }, createdAt: at(5), context: ctx },
  { event: 'note', text: 'a', createdAt: at(1, 8), context: ctx },
  { event: 'note', text: 'b', createdAt: at(1, 9), context: ctx },
  { event: 'note', text: 'c\n\n📖 You did things.', createdAt: at(1, 10), context: ctx },
  { event: 'note', text: 'd', createdAt: at(0, 7), context: ctx },
  { event: 'note', text: 'too old', createdAt: at(40), context: ctx },
]
t('digest: window filter + counts', () => {
  const d = buildStoryDigest(rows as any, 'week', now)
  assert.equal(d.entries, 6)
  assert.equal(d.activeDays, 4)
  assert.equal(d.checkins, 1)
  assert.deepEqual(d.moods, [{ mood: 'tired', count: 1 }])
  assert.equal(d.avgTempC, 15)
  assert.deepEqual(d.places, ['Austin'])
})
t('digest: month includes older, day excludes', () => {
  assert.equal(buildStoryDigest(rows as any, 'month', now).entries, 6)
  assert.equal(buildStoryDigest(rows as any, 'year', now).entries, 7)
  assert.equal(buildStoryDigest(rows as any, 'day', now).entries, 1)
})
t('digest: generated story text never becomes an excerpt', () => {
  const d = buildStoryDigest(rows as any, 'week', now)
  assert.ok(!d.excerpts.some(e => e.includes('📖')))
})
t('digest: spike + trend', () => {
  const d = buildStoryDigest(rows as any, 'week', now)
  assert.deepEqual(d.spikeDays, ['2026-11-07'])
  assert.equal(d.trend, 'rising')
})
t('digest: empty + deterministic', () => {
  const e = buildStoryDigest([], 'day', now)
  assert.equal(e.entries, 0)
  assert.ok(composeLocalStory(e).includes('Nothing is on the record'))
  assert.equal(JSON.stringify(buildStoryDigest(rows as any, 'week', now)), JSON.stringify(buildStoryDigest(rows as any, 'week', now)))
})
t('local story + digest block render', () => {
  const d = buildStoryDigest(rows as any, 'week', now)
  assert.ok(composeLocalStory(d).includes('6 entries'))
  assert.ok(renderDigestBlock(d).includes('WINDOW: WEEK'))
})

// ── arcade ──────────────────────────────────────────────────────────────
t('arcade: ladder strictly increasing', () => {
  for (let i = 1; i < ARCADE_RANKS.length; i++) assert.ok(ARCADE_RANKS[i].minXp > ARCADE_RANKS[i - 1].minXp)
})
t('arcade: zero stats = RECRUIT', () => {
  const s = getArcadeStanding({ entries: 0, activeDays: 0, streak: 0, stories: 0, checkins: 0 })
  assert.equal(s.rank.name, 'RECRUIT')
  assert.equal(s.xp, 0)
})
t('arcade: per-day cap — binge day earns no more than capped', () => {
  const calm = computeXp({ entries: 5, activeDays: 1, streak: 1, stories: 0, checkins: 0 })
  const binge = computeXp({ entries: 40, activeDays: 1, streak: 1, stories: 0, checkins: 0 })
  assert.equal(calm, binge)
})
t('arcade: consistency outranks volume', () => {
  const steady = computeXp({ entries: 30, activeDays: 30, streak: 30, stories: 4, checkins: 10 })
  const burst = computeXp({ entries: 300, activeDays: 3, streak: 3, stories: 0, checkins: 0 })
  assert.ok(steady > burst)
})
t('arcade: streak', () => {
  assert.equal(computeStreak(['2026-11-08', '2026-11-07', '2026-11-06', '2026-11-03'], '2026-11-08'), 3)
  assert.equal(computeStreak(['2026-11-07', '2026-11-06'], '2026-11-08'), 2)
  assert.equal(computeStreak(['2026-11-05'], '2026-11-08'), 0)
})
t('arcade: max rank line', () => {
  const s = getArcadeStanding({ entries: 99999, activeDays: 9999, streak: 99, stories: 999, checkins: 999 })
  assert.equal(s.rank.name, 'COMMANDER')
  assert.ok(renderArcadeLine(s, 99).includes('MAX RANK'))
})

console.log(`\n${n} PASS · 0 FAIL`)
