/**
 * LOT® Log Command System — offline verification suite
 *
 * Covers: Story Compression Engine (SCE v1), horizon parsing, auto-horizon,
 * peak/spike detection, Arcade XP, fallback composer, and the /system
 * command registry ↔ trigger-detector consistency.
 *
 * Usage: yarn test:log-commands   (no DB, no network, no env required)
 */

import assert from 'node:assert/strict'
import {
  compressStory,
  parseStoryHorizon,
  selectAutoHorizon,
  composeFallbackStory,
  renderPacketForPrompt,
  renderStoryHeader,
  cleanText,
  levelForXp,
  xpForLevel,
  type StoryLogInput,
} from '../../src/shared/utils/story-compression'
import {
  LOG_COMMANDS,
  DEFERRED_TRIGGERS,
  detectTriggers,
  keywordsForTrigger,
  renderSystemHelp,
} from '../../src/client/utils/logTriggers'

let passed = 0
let failed = 0
function test(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  PASS  ${name}`)
  } catch (e: any) {
    failed++
    console.log(`  FAIL  ${name}\n        ${e?.message || e}`)
  }
}

const NOW = new Date('2026-11-14T21:00:00Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600000).toISOString()
const ctx = { city: 'Los Angeles', temperature: 293.15, humidity: 40, astroMoonPhase: 'waxing crescent', astroWesternZodiac: 'scorpio' }

const LOGS: StoryLogInput[] = [
  { createdAt: hoursAgo(2), event: 'note', text: 'Morning walk, felt calm and grateful. /story', context: ctx },
  { createdAt: hoursAgo(5), event: 'emotional_checkin', metadata: { emotionalState: 'peaceful', intensity: 6 }, context: ctx },
  { createdAt: hoursAgo(30), event: 'emotional_checkin', metadata: { emotionalState: 'overwhelmed', intensity: 9, note: 'deadline stress' }, context: ctx },
  { createdAt: hoursAgo(50), event: 'note', text: 'Tired and anxious, heavy day.', context: ctx },
  { createdAt: hoursAgo(75), event: 'answer', metadata: { question: 'How did you sleep?', answer: 'Restless' }, context: ctx },
  { createdAt: hoursAgo(20 * 24), event: 'note', text: 'Old entry from last month.', context: { ...ctx, city: 'Austin' } },
  { createdAt: hoursAgo(1), event: 'generated_story', text: 'machine output — must be ignored' },
  { createdAt: hoursAgo(3), event: 'note', text: '/system' },
]

console.log('\nLOT® LOG COMMAND SYSTEM — VERIFICATION\n')

console.log('[A] HORIZON')
test('parse /story week → week', () => assert.equal(parseStoryHorizon('note /story week'), 'week'))
test('parse /story m → month', () => assert.equal(parseStoryHorizon('/story m'), 'month'))
test('parse /story today → day', () => assert.equal(parseStoryHorizon('/story today'), 'day'))
test('parse bare /story → null (auto)', () => assert.equal(parseStoryHorizon('/story'), null))
test('parse unknown arg → null', () => assert.equal(parseStoryHorizon('/story banana'), null))
test('auto: 2 signals in 24h widens to week', () => assert.equal(selectAutoHorizon(LOGS, NOW), 'week'))
test('auto: empty → year', () => assert.equal(selectAutoHorizon([], NOW), 'year'))

console.log('[B] COMPRESSION')
const week = compressStory(LOGS, 'week', { now: NOW })
test('journal stored as `note` is counted (regression: old /story ignored it)', () => assert.equal(week.counts.journal, 2))
test('command-only entry (/system) is not a signal', () => assert.ok(!week.journal.some(j => j.text === '')))
test('generated_story never feeds back', () => assert.ok(!JSON.stringify(week).includes('machine output')))
test('window excludes month-old entry', () => assert.ok(!week.journal.some(j => j.text.includes('Old entry'))))
test('counts total = 2 journal + 2 mood + 1 answer', () => assert.equal(week.counts.total, 5))
test('slash commands stripped from excerpts', () => assert.ok(!week.journal.some(j => j.text.includes('/story'))))
test('low peak = OVERWHELMED, spike flagged', () => {
  assert.equal(week.peaks.low?.label, 'OVERWHELMED')
  assert.equal(week.peaks.spike, true)
})
test('high peak present and positive', () => assert.ok((week.peaks.high?.valence || 0) > 0))
test('trajectory rising (low → calm)', () => assert.equal(week.moods.trajectory, 'rising'))
test('environment aggregated (20°C, LA, moon)', () => {
  assert.equal(week.context.avgTempC, 20)
  assert.deepEqual(week.context.cities, ['Los Angeles'])
  assert.equal(week.context.dominantMoon, 'waxing crescent')
})
test('follow-up targets the spike', () => assert.match(week.followUp || '', /overwhelmed/))
test('streak computed (≥3 consecutive days)', () => assert.ok(week.longestStreak >= 3))
test('month horizon includes Austin entry', () => {
  const month = compressStory(LOGS, 'month', { now: NOW })
  assert.ok(month.context.cities.includes('Austin'))
})
test('day horizon bounded to 24h', () => {
  const day = compressStory(LOGS, 'day', { now: NOW })
  assert.equal(day.counts.total, 2)
})
test('prompt render is bounded (< 4 KB for week)', () => assert.ok(renderPacketForPrompt(week).length < 4096))
test('cleanText cuts appended 📖 story block', () =>
  assert.equal(cleanText('my day was fine\n\n📖 You walked far…'), 'my day was fine'))

console.log('[C] ARCADE')
test('XP > 0 and level ≥ 1', () => assert.ok(week.arcade.xp > 0 && week.arcade.level >= 1))
test('level curve monotonic', () => {
  for (let l = 1; l < 20; l++) assert.equal(levelForXp(xpForLevel(l)), l)
})
test('low mood earns same XP as high mood (presence, not positivity)', () => {
  const a = compressStory([{ createdAt: hoursAgo(1), event: 'emotional_checkin', metadata: { emotionalState: 'exhausted' } }], 'day', { now: NOW })
  const b = compressStory([{ createdAt: hoursAgo(1), event: 'emotional_checkin', metadata: { emotionalState: 'energized' } }], 'day', { now: NOW })
  assert.equal(a.arcade.xp, b.arcade.xp)
})
test('header carries ARCADE line', () => assert.ok(renderStoryHeader(week).some(l => l.startsWith('ARCADE'))))

console.log('[D] FALLBACK')
test('empty packet → invitation, not blank', () => {
  const s = composeFallbackStory(compressStory([], 'day', { now: NOW }))
  assert.ok(s.length > 20 && /unwritten/.test(s))
})
test('populated fallback is second person and cites the low', () => {
  const s = composeFallbackStory(week)
  assert.match(s, /^Across this week/)
  assert.match(s, /lower moment/)
})

console.log('[E] COMMAND REGISTRY')
test('/system and /story are registered', () => {
  assert.ok(LOG_COMMANDS.some(c => c.command === '/system'))
  assert.ok(LOG_COMMANDS.some(c => c.command === '/story'))
})
test('every registry command (and alias) is detected as its trigger', () => {
  for (const c of LOG_COMMANDS) {
    for (const cmd of [c.command, ...(c.aliases || [])]) {
      assert.ok(detectTriggers(`x ${cmd}`).includes(c.trigger), `${cmd} → ${c.trigger}`)
      assert.ok(keywordsForTrigger(c.trigger).includes(cmd.slice(1)), `${cmd} keyword`)
    }
  }
})
test('/story and /qi are deferred (accept arguments)', () => {
  assert.ok(DEFERRED_TRIGGERS.includes('story-mode'))
  assert.ok(DEFERRED_TRIGGERS.includes('qi-rfi'))
})
test('/scandalous does not fire /scan', () => assert.ok(!detectTriggers('/scandalous').includes('ai-scan')))
test('/system help lists every registry command', () => {
  const help = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(help.includes(c.command), c.command)
})

console.log(`\nRESULT  ${passed} PASS · ${failed} FAIL\n`)
process.exit(failed ? 1 : 0)
