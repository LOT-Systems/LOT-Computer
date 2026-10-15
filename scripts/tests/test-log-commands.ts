/**
 * LOT® Log commands — registry/trigger consistency test.
 * Run: node --experimental-strip-types scripts/tests/test-log-commands.ts
 */
import assert from 'node:assert/strict'
import { detectTriggers, COMMAND_REGISTRY, EMOJI_ONLY_TRIGGERS, renderSystemHelp, ruleKeywords } from '../../src/client/utils/logTriggers.ts'

// Every slash keyword that fires something must be documented in /system.
const kw = ruleKeywords()
const documented = new Set(COMMAND_REGISTRY.map(c => c.usage.split(' ')[0].slice(1)))
Object.entries(kw).forEach(([trigger, words]) => {
  if (EMOJI_ONLY_TRIGGERS.includes(trigger as any)) return
  assert.ok(words.some(w => documented.has(w)), `trigger ${trigger} has no /system entry`)
})
// ...and every documented command must actually fire its trigger.
COMMAND_REGISTRY.forEach(c => {
  const probe = c.usage.startsWith('/story') ? c.usage + '\n' : c.usage.split(' ')[0] + ' '
  assert.ok(detectTriggers(probe).includes(c.trigger), `${c.usage} does not fire ${c.trigger}`)
})
// /story must not fire mid-typing.
assert.deepEqual(detectTriggers('/story'), [])
assert.deepEqual(detectTriggers('/story '), [])
assert.deepEqual(detectTriggers('/story mo'), [])
assert.deepEqual(detectTriggers('/story month'), ['story-mode'])
assert.deepEqual(detectTriggers('rough week\n/story\n'), ['story-mode'])
assert.deepEqual(detectTriggers('/storytime\n'), [])
assert.deepEqual(detectTriggers('📖'), ['story-mode'])
const help = renderSystemHelp()
assert.ok(help.includes('/story month') && help.includes('/system'))
console.log('log-commands: ALL PASS')
