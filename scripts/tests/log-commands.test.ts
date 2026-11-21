/**
 * Log Command Registry — parity suite
 * Run: npx tsx scripts/tests/log-commands.test.ts
 * Doctrine: every slash trigger must appear in /system.
 */
import assert from 'node:assert/strict'
import { detectTriggers, LOG_COMMANDS, renderSystemHelp, getTriggerKeywords } from '../../src/client/utils/logTriggers'

let pass = 0
const t = (name: string, fn: () => void) => { fn(); pass++; console.log('  ✓', name) }
console.log('LOG COMMAND REGISTRY — TEST GRID')

t('/system and /story detected', () => {
  assert.ok(detectTriggers('/system').includes('system-help'))
  assert.ok(detectTriggers('/story week').includes('story-mode'))
  assert.ok(!detectTriggers('/storyteller').includes('story-mode'))
})

t('every keyword-bearing trigger has a registry spec', () => {
  for (const key of Object.keys(LOG_COMMANDS)) {
    assert.ok(getTriggerKeywords(key as any).length > 0, `${key} has no keywords`)
  }
  const probe = ['synth','scan','silent','breathe','fast','radio','night','prayer','freeze','qos','assembly','phys','sil','qi','system','story','how']
  for (const k of probe) {
    const [trig] = detectTriggers('/' + k)
    assert.ok(trig && trig in LOG_COMMANDS, `/${k} missing from LOG_COMMANDS`)
  }
})

t('/system output lists every usage', () => {
  const out = renderSystemHelp().join('\n')
  for (const spec of Object.values(LOG_COMMANDS)) assert.ok(out.includes(spec.usage), spec.usage)
  assert.ok(out.includes('/story [day|week|month|year]'))
})

console.log(`\nGREEN — ${pass} checks passed\n`)
console.log(renderSystemHelp().join('\n'))
