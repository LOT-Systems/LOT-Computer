/**
 * Log command + story compression tests (pure modules, no DB / network).
 * Run: node --experimental-strip-types scripts/tests/test-log-commands.ts
 *  or: npx esr scripts/tests/test-log-commands.ts
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, renderSystemHelp, resolveCommand, suggestCommands, parseStoryPeriod, stripStoryCommand } from '../../src/shared/utils/logCommands.ts'
import { compressLogs, detectSpikes, lifetimeXp, arcadeStatus, periodWindow, buildCompressionPrompt } from '../../src/shared/utils/storyCompression.ts'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('  ok', name) }
const NOW = new Date('2026-08-10T12:00:00Z')
const day = (back: number, h = 9) => new Date(NOW.getTime() - back * 86_400_000 + (h - 12) * 3_600_000)
const entry = (back: number, text: string, ctx: any = {}) => ({ event: 'log_entry', text, createdAt: day(back), context: ctx, metadata: {} })
const mood = (back: number, m: string) => ({ event: 'emotional_checkin', text: null, createdAt: day(back), metadata: { emotionalState: m }, context: {} })

t('every registry command is detected by the trigger engine', () => {
  for (const c of LOG_COMMANDS) assert.ok(detectTriggers(`/${c.name}`).length > 0, `/${c.name} not wired in logTriggers`)
})
t('every registry alias is detected too', () => {
  for (const c of LOG_COMMANDS) for (const a of c.aliases || []) assert.ok(detectTriggers(`/${a}`).length > 0, `/${a} not wired`)
})
t('/system help lists all commands', () => {
  const h = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(h.includes(`/${c.name}`))
  assert.ok(h.startsWith('AVAILABLE COMMANDS'))
})
t('resolve + suggest', () => {
  assert.equal(resolveCommand('/arcade')?.name, 'rank')
  assert.equal(resolveCommand('nope'), null)
  assert.equal(suggestCommands('hello /st')[0].name, 'story')
  assert.deepEqual(suggestCommands('no slash here'), [])
})
t('story period parsing', () => {
  assert.equal(parseStoryPeriod('/story'), 'week')
  assert.equal(parseStoryPeriod('x /story month'), 'month')
  assert.equal(parseStoryPeriod('/story today'), 'day')
  assert.equal(parseStoryPeriod('/story banana'), 'week')
  assert.equal(stripStoryCommand('tired /story week 📖'), 'tired')
  assert.equal(stripStoryCommand('/story banana'), 'banana')
})
t('compression is bounded and counts correctly', () => {
  const logs = [entry(0, 'one two three', { temperature: 293.15, city: 'Austin' }), entry(1, 'a b'), entry(2, 'c'), entry(40, 'old')]
  const d = compressLogs(logs, 'week', NOW)
  assert.equal(d.entryCount, 3)
  assert.equal(d.wordCount, 6)
  assert.equal(d.activeDays, 3)
  assert.equal(d.currentStreak, 3)
  assert.equal(d.environment.avgTempC, 20)
  assert.deepEqual(d.environment.cities, ['Austin'])
  const big = Array.from({ length: 500 }, (_, i) => entry(i % 28, 'x '.repeat(500)))
  assert.ok(compressLogs(big, 'month', NOW).sampleEntries.length <= 6)
  assert.ok(compressLogs(big, 'month', NOW).sampleEntries.every(e => e.text.length <= 200))
})
t('empty period yields empty digest', () => {
  assert.equal(compressLogs([], 'day', NOW).entryCount, 0)
})
t('spike: volume burst + silence + mood shift', () => {
  const logs: any[] = [entry(20, 'a'), entry(19, 'b'), entry(12, 'c'), entry(11, 'd'), entry(9, 'e'), entry(8, 'f'), entry(7, 'g'), entry(6, 'h'), entry(5, 'i'), entry(4, 'j')]
  for (let i = 0; i < 6; i++) logs.push(entry(2, 'burst ' + i))
  ;['calm', 'calm', 'low', 'low'].forEach((m, i) => logs.push(mood(25 - i * 5, m)))
  const sp = detectSpikes(logs, periodWindow('month', NOW))
  const kinds = sp.map(s => s.kind)
  assert.ok(kinds.includes('volume'), JSON.stringify(sp))
  assert.ok(kinds.includes('silence'), JSON.stringify(sp))
  assert.ok(kinds.includes('mood-shift'), JSON.stringify(sp))
})
t('arcade: daily cap stops burst farming; ranks monotonic', () => {
  const burst = Array.from({ length: 50 }, () => entry(0, 'x'))
  assert.equal(lifetimeXp(burst), 30)
  assert.equal(arcadeStatus(0).rank, 'ROOKIE')
  assert.equal(arcadeStatus(50).rank, 'OBSERVER')
  assert.equal(arcadeStatus(99999).nextRank, null)
  assert.equal(arcadeStatus(10).xpToNext, 40)
})
t('prompt contains guardrails and no raw history beyond samples', () => {
  const d = compressLogs([entry(0, 'secret-ish line')], 'day', NOW)
  const p = buildCompressionPrompt(d, '', '', arcadeStatus(0))
  assert.ok(p.includes('Use ONLY facts in the DIGEST'))
  assert.ok(p.includes('crisis'))
})
console.log(`\n${n} passed`)
