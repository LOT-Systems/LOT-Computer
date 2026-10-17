/**
 * LOT SYSTEMS CORPORATION — Log command system self-test.
 * Run: npx tsx scripts/tests/test-log-commands.ts   (exit 1 on any failure)
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { detectTriggers } from '../../src/client/utils/logTriggers'
import {
  LOG_COMMANDS, buildSystemHelp, findLogCommand, suggestLogCommand, extractSlashTokens,
  parseStoryScope, parseSystemFilter, arcadeRank,
} from '../../src/shared/utils/logCommands'
import { compressLogs, buildLocalStory, formatCompression } from '../../src/server/utils/story-compression'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`PASS  ${name}`) }

t('registry names+aliases resolve to a trigger (parity with logTriggers)', () => {
  for (const c of LOG_COMMANDS)
    for (const k of [c.name, ...c.aliases])
      assert.ok(detectTriggers(`/${k}`).length > 0, `/${k} has no trigger`)
})
t('every slash keyword in logTriggers is in the registry', () => {
  const src = readFileSync('src/client/utils/logTriggers.ts', 'utf8') as string
  const kws = [...src.matchAll(/keywords: \[([^\]]*)\]/g)].flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]))
  for (const k of kws) assert.ok(findLogCommand(k), `/${k} missing from registry`)
})
t('/system lists all commands', () => {
  const h = buildSystemHelp()
  for (const c of LOG_COMMANDS) assert.ok(h.includes(`/${c.name}`), c.name)
  assert.ok(h.includes('/story') && h.includes('SHORTCUTS'))
})
t('/system filter', () => {
  const h = buildSystemHelp('radio')
  assert.ok(h.includes('/radio') && !h.includes('/story'))
  assert.ok(buildSystemHelp('zzzz').includes('NO MATCH'))
})
t('command rows split on 2+ spaces', () => {
  for (const l of buildSystemHelp().split('\n').filter(l => l.startsWith('/')))
    assert.ok(/\s{2,}/.test(l), l)
})
t('story scope parsing', () => {
  assert.equal(parseStoryScope('/story'), 'week')
  assert.equal(parseStoryScope('hi /story month'), 'month')
  assert.equal(parseStoryScope('/story Today'), 'day')
  assert.equal(parseStoryScope('/story banana'), 'week')
  assert.equal(parseStoryScope('/stories year'), 'week')
  assert.equal(parseSystemFilter('/system radio'), 'radio')
  assert.equal(parseSystemFilter('/system'), '')
})
t('slash tokens ignore urls/paths', () => {
  assert.deepEqual(extractSlashTokens('see http://x.com/story and a/b /scan now'), ['scan'])
})
t('did-you-mean', () => {
  assert.equal(suggestLogCommand('stroy'), 'story')
  assert.equal(suggestLogCommand('story'), null)
  assert.equal(suggestLogCommand('qqqqqqqq'), null)
})
t('arcade rank', () => {
  assert.equal(arcadeRank(0).title, 'RECRUIT')
  assert.equal(arcadeRank(812).title, 'MASTER')
  assert.equal(arcadeRank(4).toNext, 1)
  assert.equal(arcadeRank(-3).level, 1)
})

const now = new Date('2026-10-17T12:00:00Z')
const day = 86400000
const mk = (daysAgo: number, event: string, text: string | null, extra: any = {}) => ({
  event, text, createdAt: new Date(now.getTime() - daysAgo * day), ...extra,
})
t('compression: window, moods, ambient, shift, privacy', () => {
  const logs = [
    mk(0.2, 'log_entry', 'tired but calm', { context: { temperature: 283.15, weatherDescription: 'rain', city: 'Austin', astroMoonPhase: 'Waxing' } }),
    mk(0.5, 'log_entry', 'coffee walk'),
    mk(1, 'log_entry', 'good call'),
    mk(1.5, 'log_entry', 'sprint'),
    mk(6, 'log_entry', 'start of week'),
    mk(2, 'emotional_checkin', null, { metadata: { emotionalState: 'Calm' } }),
    mk(3, 'settings_change', 'SECRET-NOT-AN-ENTRY'),
    mk(40, 'log_entry', 'outside week window'),
  ]
  const c = compressLogs(logs, 'week', now)
  assert.equal(c.entryCount, 5)
  assert.equal(c.moods[0].mood, 'calm')
  assert.equal(c.ambient.avgTempC, 10)
  assert.equal(c.ambient.cities[0], 'Austin')
  assert.equal(c.shift, 'surge')
  assert.ok(!formatCompression(c).includes('SECRET'))
  assert.ok(!formatCompression(c).includes('outside week'))
  assert.equal(compressLogs(logs, 'year', now).entryCount, 6)
  assert.equal(compressLogs(logs, 'day', now).entryCount, 3) // window start is inclusive
})
t('local story is grounded and handles empty', () => {
  assert.ok(buildLocalStory(compressLogs([], 'month', now)).includes('Nothing was written this month'))
  const s = buildLocalStory(compressLogs([mk(0.1, 'log_entry', 'hello world')], 'day', now))
  assert.ok(s.includes('1 entry') && s.includes('hello world'))
})
t('malformed rows do not throw', () => {
  compressLogs([{ event: 'log_entry', text: 'x', createdAt: 'garbage' } as any], 'week', now)
})
console.log(`\n${n} tests passed`)
