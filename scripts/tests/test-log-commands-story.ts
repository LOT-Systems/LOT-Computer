/**
 * LOT SYSTEMS CORPORATION — Log commands + story compression tests.
 * Run: npx tsx scripts/tests/test-log-commands-story.ts   (exit 1 on failure)
 */
import assert from 'node:assert/strict'
import { buildSystemHelpLines, parseStoryPeriod, LOG_COMMANDS } from '../../src/shared/utils/log-commands'
import { detectTriggers } from '../../src/client/utils/logTriggers'
import { buildDigest, stripGenerated, fallbackStory, computeArcade, digestToPrompt } from '../../src/server/utils/story-compression'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`PASS ${name}`) }
const now = new Date('2026-10-18T12:00:00Z')
const day = (d: number, h = 9) => new Date(now.getTime() - d * 86400000 + (h - 12) * 3600000)

t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('hi /story month'), 'month')
  assert.equal(parseStoryPeriod('/story Yearly'), 'year')
  assert.equal(parseStoryPeriod('/story daily'), 'day')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
})
t('every registry command is a live trigger', () => {
  for (const c of LOG_COMMANDS) {
    const word = c.command.split(/\s/)[0]
    assert.ok(detectTriggers(word).length > 0, `${word} has no trigger`)
  }
})
t('system help lists all commands', () => {
  const txt = buildSystemHelpLines().join('\n')
  for (const c of LOG_COMMANDS) assert.ok(txt.includes(c.command))
})
t('stripGenerated removes machine blocks', () => {
  assert.equal(stripGenerated('real thought\n\n📖 You walked...\n\n🕯️ Psalm 46\n\n/story week'), 'real thought')
})
const logs: any[] = [
  { event: 'note', text: 'Slept badly, coffee x3', createdAt: day(6), context: { city: 'Miami', temperature: 300, weatherDescription: 'clear', astroMoonPhase: 'Full' } },
  { event: 'note', text: 'Better. Long walk by the water. ' + 'x'.repeat(400), createdAt: day(5) },
  { event: 'note', text: 'good', createdAt: day(4) },
  { event: 'note', text: 'ok', createdAt: day(3) },
  { event: 'note', text: '', createdAt: day(2) },
  { event: 'emotional_checkin', metadata: { emotionalState: 'calm' }, createdAt: day(1) },
  { event: 'note', text: 'old', createdAt: day(40) },
]
t('digest window + counts', () => {
  const w = buildDigest(logs, 'week', now)
  assert.equal(w.entryCount, 4)
  assert.equal(w.moods[0].mood, 'calm')
  assert.ok(w.peaks.some(p => p.includes('long entry')))
  assert.equal(buildDigest(logs, 'day', now).entryCount, 0)
  assert.equal(buildDigest(logs, 'year', now).entryCount, 5)
})
t('digest carries context metadata', () => {
  const p = digestToPrompt(buildDigest(logs, 'week', now))
  assert.ok(p.includes('Miami') && p.includes('27°C') && p.includes('moon Full'))
})
t('fallback is honest', () => {
  assert.ok(fallbackStory(buildDigest(logs, 'day', now)).startsWith('No journal entries'))
  assert.ok(fallbackStory(buildDigest(logs, 'week', now)).includes('4 entries'))
})
t('arcade is monotonic', () => {
  const a = computeArcade([])
  const b = computeArcade(logs)
  assert.equal(a.level, 1)
  assert.ok(b.xp > a.xp && b.level >= a.level)
  assert.ok(b.nextLevelXp > b.xp)
})
console.log(`\n${n} tests passed`)
