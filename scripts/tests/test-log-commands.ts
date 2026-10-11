/**
 * Log commands + story compression tests. Run: npm run test:log-commands
 * (node --experimental-strip-types; no framework, exits non-zero on failure)
 */
import assert from 'node:assert/strict'
import { LOG_COMMANDS, renderSystemHelp, parseSystemArg, findCommand } from '../../src/client/utils/logCommands.ts'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'
import { compressLogs, parseStoryPeriod, renderDigestStory, renderDigestForPrompt } from '../../src/shared/utils/story-compression.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }

t('every registry command fires its own trigger', () => {
  for (const c of LOG_COMMANDS) assert.ok(detectTriggers(`/${c.name}`).includes(c.trigger), c.name)
})
t('registry names are unique', () => {
  assert.equal(new Set(LOG_COMMANDS.map(c => c.name)).size, LOG_COMMANDS.length)
})
t('/system lists all commands', () => {
  const h = renderSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(h.includes(`/${c.name}`), c.name)
})
t('/system <cmd> detail and unknown', () => {
  assert.equal(parseSystemArg('hello /system story'), 'story')
  assert.equal(parseSystemArg('/system'), null)
  assert.ok(renderSystemHelp('story').includes('/story [day|week|month|year]'))
  assert.ok(renderSystemHelp('nope').startsWith('UNKNOWN'))
  assert.ok(findCommand('/qi'))
})
t('parseStoryPeriod', () => {
  assert.equal(parseStoryPeriod('/story'), 'day')
  assert.equal(parseStoryPeriod('x /story WEEK'), 'week')
  assert.equal(parseStoryPeriod('/story year'), 'year')
  assert.equal(parseStoryPeriod('/story banana'), 'day')
})

const now = new Date('2026-10-11T12:00:00Z')
const d = (days: number) => new Date(now.getTime() - days * 86_400_000)
const rows = [
  { event: 'note', text: 'slept badly, tea helped', createdAt: d(0.1) },
  { event: 'note', text: 'walk at noon', createdAt: d(1.05) },
  { event: 'emotional_checkin', createdAt: d(1.2), metadata: { emotionalState: 'Calm' } },
  { event: 'emotional_checkin', createdAt: d(2), metadata: { emotionalState: 'calm' } },
  { event: 'memory_answer', createdAt: d(2.1), metadata: {} },
  { event: 'note', text: '', createdAt: d(3) },
  { event: 'note', text: 'old', createdAt: d(40) },
]
t('compress week', () => {
  const x = compressLogs(rows, 'week', now)
  assert.equal(x.entries, 2); assert.equal(x.careAnswers, 1)
  assert.deepEqual(x.moods, [{ label: 'calm', count: 2 }])
  assert.equal(x.longestStreak, 3)
})
t('window excludes out-of-range and empty', () => {
  assert.equal(compressLogs(rows, 'day', now).entries, 1)
  assert.equal(compressLogs(rows, 'year', now).entries, 3)
})
t('empty and rendering', () => {
  const e = compressLogs([], 'month', now)
  assert.ok(renderDigestStory(e).startsWith('Nothing recorded'))
  assert.ok(renderDigestForPrompt(e).includes('NO DATA'))
  assert.ok(renderDigestStory(compressLogs(rows, 'week', now)).includes('2 entries'))
})
console.log(`\n${n} passed`)
