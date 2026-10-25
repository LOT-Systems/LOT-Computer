/**
 * Log command registry + story compression checks.
 * Run: node --experimental-strip-types --import ./scripts/tests/ts-resolve.mjs scripts/tests/test-log-commands.ts
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, buildSystemHelp } from '../../src/client/utils/logCommands.ts'
import { detectTriggers, detectNewTriggers } from '../../src/client/utils/logTriggers.ts'
import { parseStoryPeriod, compressLogs, buildStoryPrompt } from '../../src/shared/utils/story-compression.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }

t('every listed command is detected by its own slash', () => {
  for (const c of LOG_COMMANDS.filter(c => c.command)) {
    assert.ok(detectTriggers(`/${c.command}`).includes(c.trigger), c.command)
  }
})
t('/sil does not fire /silent and vice versa', () => {
  assert.deepEqual(detectTriggers('/sil'), ['sil-check'])
  assert.deepEqual(detectTriggers('/silent'), ['silent-mode'])
})
t('/scandalous does not fire /scan', () => assert.deepEqual(detectTriggers('/scandalous'), []))
t('/story week fires story-mode once; edits do not refire', () => {
  assert.deepEqual(detectNewTriggers('/story week', ''), ['story-mode'])
  assert.deepEqual(detectNewTriggers('/story week now', '/story week'), [])
})
t('/system help lists every non-hidden command incl. /story and /sil', () => {
  const h = buildSystemHelp()
  for (const c of LOG_COMMANDS.filter(c => c.command && !c.hidden)) assert.ok(h.includes(`/${c.command}`), c.command)
  assert.ok(h.includes('[day|week|month|year]'))
})
t('trigger names unique in registry', () => {
  const ts = LOG_COMMANDS.map(c => c.trigger)
  assert.equal(new Set(ts).size, ts.length)
})
t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('x /story Today'), 'day')
  assert.equal(parseStoryPeriod('/story yearly'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
})
t('compressLogs windows, moods, context, bounded excerpts', () => {
  const now = new Date('2026-10-25T12:00:00Z')
  const day = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString()
  const logs = [
    ...Array.from({ length: 30 }, (_, i) => ({
      event: 'log_entry', text: `entry ${i} ` + 'word '.repeat(i), createdAt: day(i * 0.2),
      context: { city: 'Austin', weatherDescription: 'clear', astroMoonPhase: 'Waxing' },
    })),
    { event: 'emotional_checkin', createdAt: day(1), metadata: { emotionalState: 'calm' } },
    { event: 'log_entry', text: 'ancient', createdAt: day(400) },
  ]
  const w = compressLogs(logs, 'week', now)
  assert.equal(w.entryCount, 30)
  assert.ok(w.excerpts.length <= 8 && w.excerpts.length > 0)
  assert.ok(!w.excerpts.some(e => e.includes('ancient')))
  assert.deepEqual(w.moodCounts, { CALM: 1 })
  assert.deepEqual(w.cities, ['Austin'])
  assert.equal(compressLogs(logs, 'year', now).entryCount, 30)
  assert.equal(compressLogs(logs, 'day', now).entryCount, 6)
  const p = buildStoryPrompt(w)
  assert.ok(p.includes('WEEK') && !p.includes('ancient'))
})
t('empty window is safe', () => {
  const d = compressLogs([], 'month')
  assert.equal(d.entryCount, 0)
  assert.ok(buildStoryPrompt(d).includes('NO DATA'))
})
console.log(`\n${n} checks passed`)
