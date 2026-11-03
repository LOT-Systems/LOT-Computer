// Run: npx tsx scripts/tests/test-log-commands.ts
import assert from 'node:assert/strict'
import { parseStoryPeriod, parseSystemFilter, renderSystemHelp, LOG_COMMANDS } from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

assert.equal(parseStoryPeriod('rough day /story'), 'week')
assert.equal(parseStoryPeriod('/story month'), 'month')
assert.equal(parseStoryPeriod('x /STORY Year please'), 'year')
assert.equal(parseStoryPeriod('/story foo'), 'week')
assert.equal(parseSystemFilter('/system'), '')
assert.equal(parseSystemFilter('/system AI'), 'ai')
assert.ok(renderSystemHelp().includes('/story [day|week|month|year]'))
assert.ok(!renderSystemHelp('ritual').includes('/synth'))
assert.ok(renderSystemHelp('zzz').includes('NO COMMAND MATCHES'))
// every registered command is a live trigger keyword (registry cannot drift from detectors)
for (const c of LOG_COMMANDS) assert.ok(detectTriggers(`/${c.command}`).length > 0, `/${c.command} has no trigger`)
console.log('log-commands: all assertions passed')
