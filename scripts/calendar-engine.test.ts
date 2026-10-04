import assert from 'node:assert/strict'
import * as E from '../src/client/utils/calendarEngine'
const mk = (time: string|null): E.CalendarEntry => ({id:'a',date:'2026-10-05',time,text:'x',type:'call'})
const at = (h:number,m:number,s=0)=>new Date(2026,9,5,h,m,s).getTime()
const none = new Set<string>()
assert.equal(E.normalizeTime('9'),'09:00'); assert.equal(E.normalizeTime('930'),'09:30')
assert.equal(E.normalizeTime('21:05'),'21:05'); assert.equal(E.normalizeTime('25:00'),null)
assert.equal(E.normalizeTime('9:75'),null); assert.equal(E.normalizeTime(''),null); assert.equal(E.normalizeTime('ab'),null)
const e = mk('14:30')
assert.equal(E.dueAlerts([e],at(13,29),none,none).length,0)
assert.equal(E.dueAlerts([e],at(13,30),none,none)[0].stage,'T-60')
assert.equal(E.dueAlerts([e],at(14,15),none,none)[0].stage,'T-15')
assert.equal(E.dueAlerts([e],at(14,30),none,none)[0].stage,'T-00')
assert.equal(E.dueAlerts([e],at(14,45),none,none)[0].stage,'MISS')
// catch-up: only latest stage
assert.equal(E.dueAlerts([e],at(14,31),none,none).length,1)
// fired dedupe
assert.equal(E.dueAlerts([e],at(14,31),new Set(['a:T-00']),none).length,0)
// done suppresses
assert.equal(E.dueAlerts([e],at(14,31),none,new Set(['a'])).length,0)
// stale
assert.equal(E.dueAlerts([e],at(14,30)+25*3600e3,none,none).length,0)
// all-day
const d = mk(null)
assert.equal(E.dueAlerts([d],at(7,59),none,none).length,0)
assert.equal(E.dueAlerts([d],at(8,0),none,none)[0].stage,'DAY')
assert.equal(E.formatCountdown(at(14,30),at(12,15,55)),'T-02:14:05')
assert.equal(E.formatCountdown(at(14,30),at(14,16)),'T-14:00')
assert.equal(E.formatCountdown(at(14,30),at(14,35,12)),'T+05:12')
assert.ok(E.formatAlertText(e,'T-15').startsWith('[ALERT] T-15 MIN · CALL'))
console.log('engine: all assertions passed')
