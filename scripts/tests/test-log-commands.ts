/**
 * LOT SYSTEMS CORPORATION — Log Command System verification
 * Run: npm run test:log-commands
 *
 * Pure-module tests (no DB, no network): command registry, /system index,
 * /story period parsing, compression digest, Arcade progression.
 */
import assert from 'node:assert/strict'
import { detectTriggers, detectNewTriggers, formatSystemHelp, LOG_COMMANDS } from '../../src/client/utils/logTriggers'
import {
  parseStoryPeriod, compressStory, resolveAutoPeriod, cleanJournalText,
  formatDigestGrid, formatDigestForPrompt, composeFallbackStory,
} from '../../src/shared/utils/story-compression'
import {
  computeArcadeProgress, xpForLevel, levelForXp, rankForLevel, xpForLog, streakMultiplier, DAILY_XP_CAP,
} from '../../src/shared/utils/arcade'

let passed = 0
const t = (name: string, fn: () => void) => {
  try { fn(); passed++; console.log(`  PASS  ${name}`) }
  catch (e) { console.error(`  FAIL  ${name}`); throw e }
}

const NOW = new Date('2026-11-25T18:00:00Z')
const at = (daysAgo: number, hour = 10) => {
  const d = new Date(NOW.getTime() - daysAgo * 86_400_000)
  d.setUTCHours(hour, 0, 0, 0)
  return d.toISOString()
}
const K = (c: number) => c + 273.15
const ctx = { temperature: K(8), humidity: 70, city: 'Brooklyn', weatherDescription: 'light rain', timeZone: 'America/New_York' }

console.log('LOG COMMAND SYSTEM — TEST SUITE')

// ── Registry / detection ────────────────────────────────────────────────
t('/system and /commands both fire system-help', () => {
  assert.deepEqual(detectTriggers('/system'), ['system-help'])
  assert.deepEqual(detectTriggers('hello /commands'), ['system-help'])
})
t('/story fires story-mode; /storytelling does not', () => {
  assert.ok(detectTriggers('/story week').includes('story-mode'))
  assert.ok(!detectTriggers('/storytelling').includes('story-mode'))
  assert.ok(detectTriggers('📖').includes('story-mode'))
})
t('/arcade, /xp, /level fire arcade-status', () => {
  for (const c of ['/arcade', '/xp', '/level']) assert.deepEqual(detectTriggers(c), ['arcade-status'])
})
t('legacy triggers preserved', () => {
  assert.ok(detectTriggers('🎹').includes('toggle-synth'))
  assert.ok(detectTriggers('/qi what now').includes('qi-rfi'))
  assert.ok(detectTriggers('‼️').includes('cohort-support'))
})
t('delta detection does not re-fire', () => {
  assert.deepEqual(detectNewTriggers('/story week', '/story'), [])
})
t('/system lists every visible registry command', () => {
  const help = formatSystemHelp().join('\n')
  for (const c of LOG_COMMANDS.filter(c => !c.hidden && c.command)) {
    assert.ok(help.includes(c.usage || `/${c.command}`), `missing ${c.command}`)
  }
  assert.ok(help.includes('/story [day|week|month|year]'))
  assert.ok(!help.includes('/sil '), 'hidden command leaked')
})
t('registry keywords are unique', () => {
  const kws = LOG_COMMANDS.flatMap(c => [...(c.command ? [c.command] : []), ...c.aliases])
  assert.equal(new Set(kws).size, kws.length)
})

// ── /story period parsing ───────────────────────────────────────────────
t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), null)
  assert.equal(parseStoryPeriod('/story week'), 'week')
  assert.equal(parseStoryPeriod('feeling ok /story Month'), 'month')
  assert.equal(parseStoryPeriod('/story today'), 'day')
  assert.equal(parseStoryPeriod('/story:y'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), null)
})
t('cleanJournalText strips commands and generated blocks', () => {
  assert.equal(cleanJournalText('walked by the river /story week'), 'walked by the river')
  assert.equal(cleanJournalText('mine\n\n📖 [WEEK] You walked...\nsecond para'), 'mine')
})

// ── Compression digest ──────────────────────────────────────────────────
const logs = [
  { event: 'note', text: 'great run, felt strong and clear', createdAt: at(5), context: ctx },
  { event: 'emotional_checkin', text: null, metadata: { emotionalState: 'energized' }, createdAt: at(5, 11), context: ctx },
  { event: 'note', text: 'tired and anxious, heavy day', createdAt: at(3), context: ctx },
  { event: 'emotional_checkin', text: null, metadata: { emotionalState: 'exhausted' }, createdAt: at(3, 12), context: ctx },
  { event: 'emotional_checkin', text: null, metadata: { emotionalState: 'calm' }, createdAt: at(1), context: ctx },
  { event: 'answer', text: null, metadata: { question: 'Did you drink water?', option: 'Yes' }, createdAt: at(1, 9), context: ctx },
  { event: 'note', text: 'quiet morning', createdAt: at(0, 9), context: ctx },
  { event: 'weather_update', text: null, createdAt: at(0, 8), context: ctx },
  { event: 'note', text: 'very old entry', createdAt: at(40), context: ctx },
]

t('week digest: counts, peaks, context, window', () => {
  const d = compressStory(logs, 'week', NOW)
  assert.equal(d.totalRecords, 7)       // weather_update + 40d-old excluded
  assert.equal(d.journalEntries, 3)
  assert.equal(d.activeDays, 4)
  assert.equal(d.high?.day, at(5).slice(0, 10))
  assert.equal(d.low?.day, at(3).slice(0, 10))
  assert.equal(d.low?.mood, 'exhausted')
  assert.equal(d.context.avgTempC, 8)
  assert.deepEqual(d.context.cities, ['Brooklyn'])
  assert.equal(d.context.dominantSky, 'light rain')
  assert.ok(d.arcade.xpGained > 0)
  assert.equal(d.selfCare[0], 'Did you drink water? → Yes')
})
t('day digest is today only', () => {
  const d = compressStory(logs, 'day', NOW)
  assert.equal(d.totalRecords, 1)
  assert.equal(d.journalEntries, 1)
})
t('empty digest → honest fallback, no peaks', () => {
  const d = compressStory([], 'month', NOW)
  assert.equal(d.high, null); assert.equal(d.low, null)
  assert.match(composeFallbackStory(d), /quiet/)
})
t('auto period: week unless ≥3 records today', () => {
  assert.equal(resolveAutoPeriod(logs, NOW), 'week')
  const busy = [...logs, { event: 'note', text: 'a', createdAt: at(0, 10) }, { event: 'note', text: 'b', createdAt: at(0, 11) }]
  assert.equal(resolveAutoPeriod(busy, NOW), 'day')
})
t('grid + prompt + fallback render', () => {
  const d = compressStory(logs, 'week', NOW)
  const grid = formatDigestGrid(d).join('\n')
  assert.match(grid, /HIGH PEAK/); assert.match(grid, /LOW PEAK/); assert.match(grid, /ARCADE/)
  assert.match(formatDigestForPrompt(d), /JOURNAL SAMPLES/)
  assert.match(composeFallbackStory(d), /heaviest/)
})
t('spike detection', () => {
  const spiky = [
    ...[6, 5, 4].map(n => ({ event: 'note', text: 'x', createdAt: at(n) })),
    ...[1, 2, 3, 4, 5].map(h => ({ event: 'note', text: 'busy', createdAt: at(2, 8 + h) })),
  ]
  assert.deepEqual(compressStory(spiky, 'week', NOW).spikeDays, [at(2).slice(0, 10)])
})

// ── Arcade ──────────────────────────────────────────────────────────────
t('level curve monotonic & inverse', () => {
  assert.equal(xpForLevel(1), 0); assert.equal(xpForLevel(2), 50); assert.equal(xpForLevel(3), 150)
  for (let x = 0; x < 5000; x += 37) assert.ok(xpForLevel(levelForXp(x)) <= x && xpForLevel(levelForXp(x) + 1) > x)
})
t('ranks', () => {
  assert.equal(rankForLevel(1).title, 'INITIATE')
  assert.equal(rankForLevel(5).title, 'KEEPER')
  assert.equal(rankForLevel(99).title, 'ORACLE')
})
t('XP rewards presence, not noise', () => {
  assert.equal(xpForLog({ event: 'weather_update', createdAt: NOW }), 0)
  assert.equal(xpForLog({ event: 'note', text: '   ', createdAt: NOW }), 0)
  assert.equal(xpForLog({ event: 'note', text: 'x'.repeat(5000), createdAt: NOW }), 20) // depth bonus capped
})
t('daily cap blocks farming', () => {
  const spam = Array.from({ length: 100 }, () => ({ event: 'note', text: 'spam', createdAt: at(0) }))
  assert.equal(computeArcadeProgress(spam, NOW).totalXp, DAILY_XP_CAP)
})
t('streak multiplier gentle + capped', () => {
  assert.equal(streakMultiplier(1), 1)
  assert.equal(streakMultiplier(3), 1.1)
  assert.equal(streakMultiplier(100), 1.5)
  const streak = [0, 1, 2].map(n => ({ event: 'note', text: 'd', createdAt: at(n) }))
  const p = computeArcadeProgress(streak, NOW)
  assert.equal(p.streakDays, 3)
  assert.equal(p.totalXp, 10 + 11 + 11) // 10×1.0, 10×1.05→11, 10×1.10→11
})

console.log(`\n${passed} PASS · 0 FAIL`)
