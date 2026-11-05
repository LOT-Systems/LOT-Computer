/**
 * LOT® Log Command System — self-test (no framework, exits non-zero on failure)
 * Run: npm run test:log-commands
 */
import {
  COMMANDS, buildSystemHelp, parseStoryCommand, compressStory, computeArcade, isUserProse,
} from '../../src/shared/utils/log-commands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

let fail = 0
const ok = (name: string, cond: boolean) => { if (!cond) { fail++; console.error('FAIL', name) } else console.log('PASS', name) }
const DAY = 86_400_000
const now = Date.UTC(2026, 10, 5, 12)

// registry <-> trigger detector parity: every slash in /system fires a trigger
for (const c of COMMANDS) ok(`trigger exists for /${c.slash}`, detectTriggers(`/${c.slash}`).length > 0)
const help = buildSystemHelp()
ok('/system lists every command', COMMANDS.every(c => help.includes('/' + c.slash)))
ok('/system lists /story scopes', help.includes('[day|week|month|year]'))

// parse
ok('story default day', parseStoryCommand('/story').scope === 'day')
ok('story week', parseStoryCommand('tired /story week').scope === 'week')
ok('story rest stripped', parseStoryCommand('tired /story week').rest === 'tired')
ok('story unknown arg keeps text', parseStoryCommand('/story banana').rest === 'banana')
ok('story year alias', parseStoryCommand('/story Yearly').scope === 'year')
ok('story trigger fires with arg', detectTriggers('/story month').includes('story-mode'))

// prose filter
ok('bare slash not prose', !isUserProse('/system') && !isUserProse('​ ') && isUserProse('slept badly'))

// compression
const mk = (n: number, ageDays: number, text = 'walked by the river and felt calm today', ctx = {}) =>
  Array.from({ length: n }, (_, i) => ({ text, createdAt: now - ageDays * DAY - i * 1000, context: ctx }))
const ctx = { weatherDescription: 'Light rain', temperature: 12, city: 'Brooklyn', astroMoonPhase: 'Waxing Gibbous' }
const d = compressStory([...mk(9, 0.2, undefined, ctx), ...mk(3, 1.5)], 'day', now)
ok('volume spike detected', d.spikes.some(s => s.kind === 'volume'))
ok('context in narrative', /light rain/.test(d.narrative) && /Brooklyn/.test(d.narrative))
const silent = compressStory(mk(4, 1.5), 'day', now)
ok('silence detected', silent.spikes.some(s => s.kind === 'silence') && silent.entryCount === 0)
ok('empty is safe', compressStory([], 'year', now).entryCount === 0)

// arcade
const spam = computeArcade(mk(100, 0.1), 0, now)
const steady = computeArcade([0, 1, 2, 3, 4, 5, 6].flatMap(a => mk(1, a)), 0, now)
ok('spam capped per day', spam.xp < 100 * 10)
ok('streak counted', steady.streak === 7)
ok('rank monotonic', computeArcade([], 0, now).rank === 'CADET' && steady.xp > 0)

if (fail) { console.error(`\n${fail} FAILED`); process.exit(1) }
console.log('\nALL GREEN')
