/**
 * Log command / story / arcade self-test. No framework: exits 1 on failure.
 * Run: node --experimental-strip-types scripts/tests/test-log-commands.ts
 */
import { LOG_COMMANDS, buildSystemHelp, parseStoryPeriod } from '../../src/shared/utils/logCommands.ts'
import { buildStoryDigest, composeDigestStory, digestToPromptBlock } from '../../src/shared/utils/storyCompression.ts'
import { computeArcade, formatArcadeLine } from '../../src/shared/utils/arcade.ts'
import { readFileSync } from 'node:fs'

let fail = 0
const ok = (c: boolean, m: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fail++ }

// 1. registry <-> logTriggers.ts agree (every trigger id and keyword)
const trig = readFileSync('src/client/utils/logTriggers.ts', 'utf8')
for (const c of LOG_COMMANDS) {
  ok(trig.includes(`'${c.trigger}'`), `trigger '${c.trigger}' declared`)
  ok(new RegExp(`keywords:\\s*\\[[^\\]]*'${c.name}'`).test(trig), `/${c.name} keyword wired`)
}
const names = LOG_COMMANDS.map(c => c.name)
ok(new Set(names).size === names.length, 'command names unique')

// 2. /system help lists every command
const help = buildSystemHelp()
for (const n of names) ok(help.includes(`/${n}`), `/system lists /${n}`)

// 3. period parsing
ok(parseStoryPeriod('/story') === 'day', '/story -> day')
ok(parseStoryPeriod('hi /story week') === 'week', '/story week')
ok(parseStoryPeriod('/story YEAR') === 'year', '/story YEAR')
ok(parseStoryPeriod('/story nonsense') === 'day', 'unknown -> day')

// 4. digest + fallback story
const now = new Date('2026-10-31T12:00:00Z')
const mk = (d: string, t: string, event = 'log_entry') => ({ text: t, event, createdAt: `${d}T10:00:00Z`, context: { city: 'Austin', temperature: 295 } })
const logs = [
  mk('2026-10-25', 'tired and anxious today'), mk('2026-10-26', 'stress again, tired'),
  mk('2026-10-27', 'calm morning, grateful and rested'), mk('2026-10-28', 'good energy, happy, calm'),
  mk('2026-10-29', 'great day proud strong'), mk('2026-10-29', 'love this clear peace'), mk('2026-10-29', 'more joy and better'),
  { text: 'GENERATED', event: 'generated_story', createdAt: '2026-10-29T11:00:00Z' },
]
const d = buildStoryDigest(logs, 'week', now)
ok(d.entries === 7, `generated_story excluded (entries=${d.entries})`)
ok(d.activeDays === 5 && d.streak === 5, `active=${d.activeDays} streak=${d.streak}`)
ok(d.drift === 'rising', `drift rising (${d.drift})`)
ok(d.peakDay?.day === '2026-10-29' && d.lowDay?.tone === -2, 'peak/low days')
ok(d.spikeDays.includes('2026-10-29'), 'volume spike detected')
ok(d.avgTempC !== null && d.avgTempC > 20 && d.avgTempC < 25, `Kelvin->C (${d.avgTempC})`)
ok(buildStoryDigest(logs, 'day', now).entries === 0, 'empty day handled')
ok(composeDigestStory(buildStoryDigest([], 'day', now)).includes('Nothing written'), 'empty fallback story')
ok(composeDigestStory(d).includes('5 days in a row'), 'fallback story mentions streak')
ok(digestToPromptBlock(d).includes('PERIOD: WEEK'), 'prompt block')

// 5. arcade
ok(computeArcade([]).level === 1, 'new user = LVL 1')
const heavy = Array.from({ length: 30 }, (_, i) => mk(`2026-09-${String(i + 1).padStart(2, '0')}`, 'word '.repeat(70)))
const a = computeArcade(heavy)
ok(a.xp > 150 && a.level >= 3, `30-day writer ${a.xp}xp LVL ${a.level}`)
const spam = Array.from({ length: 500 }, () => mk('2026-10-01', 'x y z'))
ok(computeArcade(spam).xp <= 25, 'daily XP capped (no grinding)')
console.log(formatArcadeLine(a))

console.log(fail ? `\n${fail} FAILED` : '\nALL PASS')
process.exit(fail ? 1 : 0)
