// Run: node --experimental-strip-types scripts/calendar.test.mjs
import assert from 'node:assert/strict'
import * as c from '../src/client/utils/calendar.ts'
const L=[
 {id:'a',event:'calendar_entry',text:'x',metadata:{date:'2026-10-22',time:'14:30',text:'Call mom',entryType:'call'}},
 {id:'b',event:'calendar_entry',text:'x',metadata:{date:'2026-10-22',text:'Pay rent',entryType:'task'}},
 {id:'c',event:'calendar_entry',text:'x',metadata:{date:'2026-10-22',time:'99:99',text:'Bad time'}},
 {id:'d',event:'calendar_entry',metadata:{date:'2026-10-22',time:'10:00',text:'Done one'}},
 {id:'e',event:'calendar_done',metadata:{entryId:'d'}},
 {id:'f',event:'calendar_entry',metadata:{date:'2026-10-21',time:'10:00',text:'old'}},
]
const E=c.parseEntries(L)
assert.equal(E.length,5); assert.equal(E.find(e=>e.id==='c').time,null)
assert.equal(E.find(e=>e.id==='d').status,'done')
const at=(h,m)=>new Date(2026,9,22,h,m)
assert.equal(c.dueAlerts(E,at(14,0),new Set()).filter(a=>a.entry.id==='a').length,0)
let a=c.dueAlerts(E,at(14,16),new Set()).find(x=>x.entry.id==='a'); assert.equal(a.stage,'T-15')
a=c.dueAlerts(E,at(14,31),new Set()).find(x=>x.entry.id==='a'); assert.equal(a.stage,'T-0')
assert.equal(c.dueAlerts(E,at(14,31),new Set(['a:T-0'])).filter(x=>x.entry.id==='a').length,0)
assert.equal(c.dueAlerts(E,at(17,0),new Set()).filter(x=>x.entry.id==='a').length,0) // past grace
assert.equal(c.dueAlerts(E,at(7,59),new Set()).filter(x=>x.entry.id==='b').length,0)
assert.equal(c.dueAlerts(E,at(8,1),new Set()).filter(x=>x.entry.id==='b').length,1)
assert.equal(c.countdown(E.find(e=>e.id==='a'),at(14,15,30)), 'T-00:15:00')
console.log('ok')
