/**
 * LOT SYSTEMS CORPORATION — Log command + story compression + arcade tests.
 * Run: npx tsx scripts/tests/test-log-commands.ts
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, renderSystemHelp, parseStoryPeriod, stripStoryCommand } from '../../src/shared/utils/logCommands'
import { buildDigest, composeLocalStory, computeArcade, computeStreak, formatArcadeLine, xpForLevel, digestToPromptBlock } from '../../src/shared/utils/storyCompression'
import { detectTriggers } from '../../src/client/utils/logTriggers'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`PASS  ${name}`) }

const NOW = new Date('2026-10-09T12:00:00Z')
const ago = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString()
const entry = (h: number, text = 'wrote something', extra: any = {}) => ({ event: 'log_entry', text, createdAt: ago(h), ...extra })
const mood = (h: number, m: string) => ({ event: 'emotional_checkin', createdAt: ago(h), metadata: { emotionalState: m } })

t('every registry command (and alias) is recognised by the trigger detector', () => {
  for (const c of LOG_COMMANDS) {
    for (const k of [c.name, ...c.aliases]) {
      assert.ok(detectTriggers(`/${k}`).length > 0, `/${k} not detected`)
    }
  }
})

t('/system lists every command exactly once, grouped', () => {
  const out = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.equal(out.split('\n').filter(l => l.split(/\s{2,}/)[0] === c.usage).length, 1, c.usage)
  assert.ok(out.includes('\nCOMPRESSION\n') && out.includes('\nARCADE\n'))
})

t('/system rank line is injected under the title', () => {
  assert.equal(renderSystemHelp({ rankLine: 'RANK X' }).split('\n')[1], 'RANK X')
})

t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'day')
  assert.equal(parseStoryPeriod('hi /story week'), 'week')
  assert.equal(parseStoryPeriod('/STORY Monthly'), 'month')
  assert.equal(parseStoryPeriod('/story yearly'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'day')
  assert.equal(parseStoryPeriod('no command'), 'day')
})

t('stripStoryCommand removes command + period only', () => {
  assert.equal(stripStoryCommand('tired today /story week'), 'tired today')
  assert.equal(stripStoryCommand('📖 /story'), '')
  assert.equal(stripStoryCommand('weekly review /story'), 'weekly review')
})

t('digest counts entries, active days, moods; ignores generated stories', () => {
  const d = buildDigest([entry(1), entry(30), { event: 'generated_story', text: 'x', createdAt: ago(2) }, mood(2, 'Calm'), mood(3, 'calm')], 'week', NOW, 'UTC')
  assert.equal(d.entryCount, 2)
  assert.equal(d.activeDays, 2)
  assert.deepEqual(d.moods, [{ mood: 'calm', count: 2 }])
})

t('digest window excludes old entries', () => {
  const d = buildDigest([entry(1), entry(24 * 10)], 'week', NOW, 'UTC')
  assert.equal(d.entryCount, 1)
})

t('volume spike signal', () => {
  const d = buildDigest([entry(1), entry(2), entry(3), entry(4), entry(5), entry(24 * 6)], 'week', NOW, 'UTC')
  assert.ok(d.signals.some(s => s.startsWith('VOLUME SPIKE')), d.signals.join('|'))
})

t('mood shift signal', () => {
  const d = buildDigest([mood(24 * 6, 'tired'), mood(24 * 5, 'tired'), mood(10, 'calm'), mood(5, 'calm')], 'week', NOW, 'UTC')
  assert.ok(d.signals.includes('MOOD SHIFT: tired -> calm'), d.signals.join('|'))
})

t('silence signal (not for day)', () => {
  const rows = [entry(24 * 6), entry(24 * 6 + 1)]
  assert.ok(buildDigest(rows, 'week', NOW, 'UTC').signals.some(s => s.startsWith('SILENCE')))
  assert.ok(!buildDigest([entry(11)], 'day', NOW, 'UTC').signals.some(s => s.startsWith('SILENCE')))
})

t('night writing signal is timezone aware', () => {
  const nightUtc = (d: number) => ({ event: 'log_entry', text: 'x', createdAt: `2026-10-0${d}T02:00:00Z` })
  const rows = [nightUtc(5), nightUtc(6), nightUtc(7), nightUtc(8)]
  assert.ok(buildDigest(rows, 'week', NOW, 'UTC').signals.some(s => s.startsWith('NIGHT WRITING')))
  assert.ok(!buildDigest(rows, 'week', NOW, 'Asia/Tokyo').signals.some(s => s.startsWith('NIGHT WRITING')))
})

t('context metadata is aggregated (city, weather, temp Kelvin->C)', () => {
  const ctx = { city: 'Austin', weatherDescription: 'Clear', temperature: 293.15, astroMoonPhase: 'Full Moon' }
  const d = buildDigest([entry(1, 'a', { context: ctx }), entry(2, 'b', { context: ctx })], 'day', NOW, 'UTC')
  assert.deepEqual([d.cities, d.weather, d.avgTempC, d.moonPhases], [['Austin'], ['clear'], 20, ['Full Moon']])
})

t('streak: today or yesterday anchors it; gap breaks it', () => {
  assert.equal(computeStreak([ago(1), ago(25), ago(49)], NOW, 'UTC'), 3)
  assert.equal(computeStreak([ago(25), ago(49)], NOW, 'UTC'), 2)
  assert.equal(computeStreak([ago(1), ago(73)], NOW, 'UTC'), 1)
  assert.equal(computeStreak([], NOW, 'UTC'), 0)
})

t('prompt block + local story never throw on empty data', () => {
  const d = buildDigest([], 'month', NOW, 'UTC')
  assert.ok(digestToPromptBlock(d).includes('ENTRIES: 0'))
  assert.ok(composeLocalStory(d).includes('have not written'))
})

t('local story mentions mood and signal', () => {
  const d = buildDigest([entry(1), mood(2, 'calm')], 'day', NOW, 'UTC')
  assert.ok(composeLocalStory(d).includes('calm'))
})

t('arcade: level curve, rank ladder, monotonic', () => {
  assert.equal(computeArcade({ totalEntries: 0, activeDays: 0, streak: 0 }).level, 1)
  assert.equal(computeArcade({ totalEntries: 0, activeDays: 0, streak: 0 }).rank, 'SIGNAL')
  const a = computeArcade({ totalEntries: 5, activeDays: 0, streak: 0 }) // 50 xp -> lv2
  assert.equal(a.level, 2)
  assert.equal(a.xpToNext, xpForLevel(3) - 50)
  let prev = 0
  for (let e = 0; e < 3000; e += 7) {
    const lv = computeArcade({ totalEntries: e, activeDays: e / 3, streak: 0 }).level
    assert.ok(lv >= prev); prev = lv
  }
  const top = computeArcade({ totalEntries: 5000, activeDays: 365, streak: 365 })
  assert.equal(top.rank, 'LOT MASTER'); assert.equal(top.nextRank, null)
  assert.ok(formatArcadeLine(a).includes('LV 2'))
})

console.log(`\n${n} tests passed`)
