/**
 * LOT® Story Compression + Slash Registry — deterministic unit checks.
 * Run: npm run test:story
 */
import assert from 'node:assert/strict'
import { compressLogs, composeLocalStory, buildStoryPrompt, parseStoryWindow, stripStoryCommand, renderDigestLines } from '../../src/shared/story-compression'
import { SLASH_COMMANDS, renderSystemHelp, isKnownCommand } from '../../src/shared/slash-commands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const NOW = new Date('2026-10-28T12:00:00Z')
const ago = (h: number) => new Date(NOW.getTime() - h * 3_600_000)
const note = (h: number, text: string, ctx: any = { city: 'Austin', astroMoonPhase: 'Waxing Gibbous', temperature: 293.15, humidity: 40 }) =>
  ({ event: 'note', text, createdAt: ago(h), context: ctx })
const mood = (h: number, emotionalState: string) => ({ event: 'emotional_checkin', text: null, createdAt: ago(h), metadata: { emotionalState } })

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS  ${name}`) }

t('parseStoryWindow: arguments + default', () => {
  assert.equal(parseStoryWindow('/story'), 'week')
  assert.equal(parseStoryWindow('hello /story day'), 'day')
  assert.equal(parseStoryWindow('/story YEAR'), 'year')
  assert.equal(parseStoryWindow('/story nonsense'), 'week')
  assert.equal(parseStoryWindow('no command'), 'week')
})

t('stripStoryCommand removes command, argument and 📖', () => {
  assert.equal(stripStoryCommand('rough day /story week 📖'), 'rough day')
  assert.equal(stripStoryCommand('/story'), '')
})

t('empty window → quiet story, zero counts', () => {
  const d = compressLogs([], 'week', { now: NOW })
  assert.equal(d.counts.total, 0)
  assert.match(composeLocalStory(d), /quiet/)
})

t('system noise is ignored; slash-only notes are not journal', () => {
  const d = compressLogs([
    { event: 'user_login', text: null, createdAt: ago(1) },
    { event: 'generated_story', text: 'x', createdAt: ago(1) },
    note(2, '/qi what is my pattern'),
    note(3, ''),
    note(4, 'Slept badly, anxious about the launch'),
  ], 'week', { now: NOW })
  assert.equal(d.counts.notes, 1)
  assert.equal(d.counts.total, 1)
})

t('generated 📖 text is never fed back into the next story', () => {
  const d = compressLogs([note(2, 'quiet morning /story week 📖 You walked through a cathedral of mirrors')], 'week', { now: NOW })
  assert.equal(d.excerpts[0], 'quiet morning')
})

t('window boundaries', () => {
  const logs = [note(1, 'a'), note(30, 'b'), note(24 * 8, 'c'), note(24 * 40, 'd'), note(24 * 400, 'e')]
  assert.equal(compressLogs(logs, 'day', { now: NOW }).counts.total, 1)
  assert.equal(compressLogs(logs, 'week', { now: NOW }).counts.total, 2)
  assert.equal(compressLogs(logs, 'month', { now: NOW }).counts.total, 3)
  assert.equal(compressLogs(logs, 'year', { now: NOW }).counts.total, 4)
})

t('mood: best/worst buckets and mood-shift signal', () => {
  const d = compressLogs([
    mood(24 * 5, 'exhausted'), mood(24 * 5 - 1, 'overwhelmed'),
    mood(24 * 1, 'grateful'), mood(24 * 1 - 1, 'fulfilled'),
  ], 'week', { now: NOW })
  assert.equal(d.mood.samples, 4)
  assert.ok(d.signals.some(s => s.kind === 'mood-shift' && /up/.test(s.detail)))
  assert.ok(d.mood.best && d.mood.worst && d.mood.best.avg > d.mood.worst.avg)
})

t('volume spike on a single day', () => {
  const logs = [note(2, 'x1'), note(2.1, 'x2'), note(2.2, 'x3'), note(2.3, 'x4'), note(2.4, 'x5'), note(24 * 4, 'y')]
  const d = compressLogs(logs, 'week', { now: NOW })
  assert.ok(d.signals.some(s => s.kind === 'volume-spike'))
})

t('silence signal after a long gap', () => {
  const d = compressLogs([note(24 * 6.2, 'a'), note(24 * 6, 'b'), note(24 * 5.8, 'c'), ], 'week', { now: NOW })
  assert.ok(d.signals.some(s => s.kind === 'silence'))
})

t('themes require repetition across entries', () => {
  const d = compressLogs([note(5, 'Running felt good'), note(4, 'More running today, legs sore'), note(3, 'Coffee')], 'week', { now: NOW })
  assert.deepEqual(d.themes, ['running'])
})

t('context aggregation (Kelvin → °C)', () => {
  const d = compressLogs([note(5, 'a'), note(4, 'b')], 'week', { now: NOW })
  assert.equal(d.context.city, 'Austin')
  assert.equal(d.context.tempC, 20)
  assert.equal(d.context.humidity, 40)
})

t('arcade: XP, streak, level are deterministic', () => {
  const logs = [note(1, 'a'), note(25, 'b'), note(49, 'c'), mood(2, 'calm')]
  const d = compressLogs(logs, 'day', { now: NOW })
  assert.equal(d.arcade.streakDays, 3)
  assert.equal(d.arcade.xpTotal, 3 * 3 + 5 + 3 * 10)
  assert.equal(d.arcade.level, Math.floor(Math.sqrt(d.arcade.xpTotal / 10)) + 1)
  assert.ok(d.arcade.xpToNext > 0)
  assert.equal(d.arcade.xpWindow, 3 + 5 + 30)
})

t('local story + prompt are grounded in the digest', () => {
  const d = compressLogs([note(5, 'Running felt good'), note(4, 'More running today'), mood(3, 'energized')], 'week', { now: NOW })
  assert.match(composeLocalStory(d), /running/)
  const p = buildStoryPrompt(d, 'hi')
  assert.match(p, /DIGEST/)
  assert.match(p, /ARCADE/)
  assert.ok(renderDigestLines(d).length >= 5)
})

t('/system registry: every command has a detector trigger and appears in help', () => {
  const help = renderSystemHelp()
  for (const c of SLASH_COMMANDS) {
    assert.ok(help.includes(`/${c.name}`), `help missing /${c.name}`)
    assert.ok(detectTriggers(`/${c.name}`).length > 0, `no trigger for /${c.name}`)
    assert.ok(isKnownCommand(c.name))
    for (const a of c.aliases || []) assert.ok(detectTriggers(`/${a}`).length > 0, `no trigger for alias /${a}`)
  }
  assert.ok(!isKnownCommand('nope'))
})

t('/system and /story fire their triggers', () => {
  assert.deepEqual(detectTriggers('/system'), ['system-help'])
  assert.ok(detectTriggers('feeling low /story month').includes('story-mode'))
})

console.log(`\n${passed} checks passed`)
