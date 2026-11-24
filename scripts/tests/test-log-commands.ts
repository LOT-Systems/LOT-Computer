/**
 * LOT SYSTEMS CORPORATION — Log command + story compression tests
 * Run: npx tsx scripts/tests/test-log-commands.ts
 */
import assert from 'node:assert/strict'
import {
  parseStoryHorizon, stripStoryCommand, compressLogs, storyXp,
  formatCompressionHeader, compressionToPrompt, sampleEvenly, moodValence,
} from '../../src/shared/utils/story-compression'
import {
  LOG_COMMANDS, findCommand, parseSystemArg, renderSystemHelp,
  renderCommandDossier, rankForXp, recordCommandUse, readLedger,
} from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

let pass = 0
const t = (name: string, fn: () => void) => {
  try { fn(); pass++; console.log(`  PASS  ${name}`) }
  catch (e) { console.error(`  FAIL  ${name}\n${e}`); process.exitCode = 1 }
}

console.log('LOG COMMAND REGISTRY')
t('every registry command fires its trigger', () => {
  for (const c of LOG_COMMANDS) assert.ok(detectTriggers(`${c.cmd}`).includes(c.trigger), c.cmd)
})
t('every registry alias fires its trigger', () => {
  for (const c of LOG_COMMANDS) for (const a of c.aliases) assert.ok(detectTriggers(a).includes(c.trigger), a)
})
t('triggers are unique across commands', () => {
  const s = new Set(LOG_COMMANDS.map(c => c.trigger)); assert.equal(s.size, LOG_COMMANDS.length)
})
t('findCommand: name, slash, alias', () => {
  assert.equal(findCommand('story')?.cmd, '/story')
  assert.equal(findCommand('/breath')?.cmd, '/breathe')
  assert.equal(findCommand('🎧')?.cmd, '/radio')
  assert.equal(findCommand('nope'), null)
})
t('parseSystemArg', () => {
  assert.equal(parseSystemArg('/system'), null)
  assert.equal(parseSystemArg('/system story'), 'story')
  assert.equal(parseSystemArg('hi /system /qi'), 'qi')
})
t('renderSystemHelp lists every command and ends with ARCADE rank', () => {
  const lines = renderSystemHelp({ xp: 160, uses: {} })
  for (const c of LOG_COMMANDS) assert.ok(lines.some(l => l.startsWith(c.usage)), c.usage)
  assert.match(lines[lines.length - 1], /RANK NAVIGATOR · XP 160 · NEXT ARCHIVIST @ 400/)
})
t('dossier', () => {
  const d = renderCommandDossier('story', { xp: 0, uses: { 'story-mode': 3 } })!
  assert.ok(d[0].includes('/STORY')); assert.ok(d.some(l => /USES\s+3/.test(l)))
  assert.equal(renderCommandDossier('zzz'), null)
})
t('rank ladder', () => {
  assert.equal(rankForXp(0).current.rank, 'CADET')
  assert.equal(rankForXp(49).current.rank, 'CADET')
  assert.equal(rankForXp(50).current.rank, 'OPERATOR')
  assert.equal(rankForXp(99999).next, null)
})
t('ledger survives missing localStorage', () => {
  assert.deepEqual(readLedger(), { xp: 0, uses: {} })
  assert.equal(recordCommandUse('breathe').xp, 8)
})

console.log('STORY COMPRESSION')
t('parseStoryHorizon', () => {
  assert.equal(parseStoryHorizon('/story'), 'recent')
  assert.equal(parseStoryHorizon('/story week'), 'week')
  assert.equal(parseStoryHorizon('tired today /story month'), 'month')
  assert.equal(parseStoryHorizon('/story Y'), 'year')
  assert.equal(parseStoryHorizon('/story banana'), 'recent')
  assert.equal(parseStoryHorizon('/storyline'), 'recent')
})
t('stripStoryCommand keeps operator words', () => {
  assert.equal(stripStoryCommand('long day /story week'), 'long day')
  assert.equal(stripStoryCommand('📖 /story banana bread'), 'banana bread')
})
t('moodValence', () => {
  assert.equal(moodValence('Calm'), 1); assert.equal(moodValence('anxious'), -1); assert.equal(moodValence('x'), 0)
})
t('sampleEvenly keeps endpoints', () => {
  assert.deepEqual(sampleEvenly([1, 2, 3, 4, 5, 6, 7, 8, 9], 3), [1, 5, 9])
  assert.deepEqual(sampleEvenly([1, 2], 5), [1, 2])
})

const now = new Date('2026-11-24T12:00:00Z')
const day = (n: number, h = 9) => new Date(now.getTime() - n * 86400000 + (h - 12) * 3600000)
const logs = [
  { event: 'log_entry', text: 'Morning walk by the river, felt light.', createdAt: day(1) },
  { event: 'emotional_checkin', createdAt: day(1), metadata: { emotionalState: 'grateful' } },
  { event: 'emotional_checkin', createdAt: day(1, 18), metadata: { emotionalState: 'calm' } },
  { event: 'log_entry', text: 'Deadline pressure. Slept badly. /story', createdAt: day(3, 23) },
  { event: 'emotional_checkin', createdAt: day(3), metadata: { emotionalState: 'overwhelmed' } },
  { event: 'emotional_checkin', createdAt: day(3), metadata: { emotionalState: 'anxious' } },
  { event: 'memory_answer', createdAt: day(2), metadata: { question: 'Water?', option: '2L' } },
  { event: 'log_entry', text: '📖 You have been...', createdAt: day(2) },
  { event: 'log_entry', text: 'Old entry from last month', createdAt: day(20), context: { city: 'Brooklyn' } },
  { event: 'log_entry', text: 'future', createdAt: new Date(now.getTime() + 86400000) },
]
t('week window excludes old + future + generated-story text', () => {
  const c = compressLogs(logs, 'week', now)
  assert.equal(c.entries, 2)
  assert.equal(c.checkins, 4)
  assert.equal(c.selfCare, 1)
  assert.equal(c.activeDays, 3)
  assert.ok(!c.excerpts.some(e => e.includes('/story') || e.includes('📖')))
})
t('peaks: high = grateful+calm day, low = overwhelmed+anxious day', () => {
  const c = compressLogs(logs, 'week', now)
  assert.equal(c.highPeak?.date, day(1).toISOString().slice(0, 10))
  assert.equal(c.highPeak?.score, 2)
  assert.equal(c.lowPeak?.score, -2)
  assert.equal(c.valence, 0)
})
t('month window includes old entry + city', () => {
  const c = compressLogs(logs, 'month', now)
  assert.equal(c.entries, 3); assert.deepEqual(c.cities, ['Brooklyn'])
})
t('recent = last 10 journal entries, no window', () => {
  const c = compressLogs(logs, 'recent', now); assert.equal(c.windowStart, null); assert.equal(c.entries, 3)
})
t('empty logs compress safely', () => {
  const c = compressLogs([], 'year', now)
  assert.equal(c.entries, 0); assert.equal(c.highPeak, null); assert.equal(c.compressionRatio, 0)
  assert.equal(storyXp(c), 120)
})
t('header + prompt render', () => {
  const c = compressLogs(logs, 'week', now)
  const h = formatCompressionHeader(c)
  assert.match(h[0], /HORIZON\s+WEEK/); assert.ok(h.some(l => l.startsWith('HIGH PEAK')))
  const p = compressionToPrompt(c)
  assert.match(p, /LOW PEAK: \d{4}-\d{2}-\d{2} \(overwhelmed, anxious\)/)
})

console.log(`\n${pass} passed${process.exitCode ? ' — FAILURES PRESENT' : ''}`)
