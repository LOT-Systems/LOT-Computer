import assert from 'node:assert/strict'
import { transition, parseIntake, canEnterStrength } from '../../src/shared/basics/ration-state'
assert.equal(transition('USERSHIP','UPGRADE'),'PENDING')
assert.equal(transition('USERSHIP','STAND_DOWN'),null)
assert.equal(transition('PENDING','BILLING_CONFIRMED'),'ON_STRENGTH')
assert.equal(transition('ON_STRENGTH','FIRST_ISSUE'),'STEADY_STATE')
assert.equal(transition('STEADY_STATE','STAND_DOWN'),'USERSHIP')
assert.equal(transition('STEADY_STATE','UPGRADE'),null)
const good={size:'M',shipName:'A',shipLine1:'1 Main',shipCity:'X',shipRegion:'CA',shipPostal:'9',shipCountry:'us',cadenceStart:'2099-01-01'}
const r=parseIntake(good); assert.ok(r.ok)
assert.deepEqual((parseIntake({...good,size:'Q',cadenceStart:'2000-01-01'}) as any).errors,['size','cadenceStart'])
assert.ok(!canEnterStrength({state:'PENDING',billingConfirmed:true,intake:null}))
console.log('ration-state OK')
