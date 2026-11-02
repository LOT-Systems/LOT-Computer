// Run: node --experimental-strip-types scripts/tests/test-log-commands.mts
import * as m from '../../src/shared/utils/logCommands.ts'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'
import assert from 'node:assert'
assert.equal(m.parseStoryPeriod('hi /story week'),'week')
assert.equal(m.parseStoryPeriod('/story of my week'),'day')
assert.equal(m.parseStoryPeriod('/story'),'day')
assert.equal(m.stripStoryCommand('felt ok /story month 📖'),'felt ok')
assert.equal(m.computeArcade({entries:5,checkIns:2,streakDays:3}).rank,'OPERATOR')
assert.equal(m.computeStreakDays([new Date(),new Date(Date.now()-86400000)]),2)
const h=m.buildSystemHelp(); assert(h.includes('/story [day|week|month|year]'))
// every registry command must have a trigger (except /qi args)
for (const c of m.LOG_COMMANDS) assert(detectTriggers(c.command+' ').length>0, c.command)
console.log(h); console.log('OK')
