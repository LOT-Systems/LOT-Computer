// Run: node --experimental-strip-types scripts/tests/calendar/alerts.test.mjs
import { alertStage, alertKey, relativeLabel, effectiveMoment } from '../../../src/client/utils/calendarAlerts.ts'
import assert from 'node:assert/strict'
let n = 0
const L = (d, h, m) => new Date(2026, 10, d, h, m, 0)
const e = { id: '1', date: '2026-11-09', time: '14:30' }
const c = (now, exp, ent = e) => { n++; assert.equal(alertStage(ent, now), exp, String(now) + ' ' + exp) }

// timed
c(L(9,14,0),null); c(L(9,14,15),'T-15'); c(L(9,14,29),'T-15'); c(L(9,14,30),'T-0'); c(L(9,14,34),'T-0')
c(L(9,14,35),'OVERDUE'); c(L(11,14,30),'OVERDUE'); c(L(11,14,31),null)
c(L(9,14,20),null,{...e,done:true})
// untimed
const u = { id: '2', date: '2026-11-09' }
c(L(9,7,59),null,u); c(L(9,8,0),'TODAY',u); c(L(9,23,59),'TODAY',u); c(L(10,0,0),'OVERDUE',u); c(L(11,8,1),null,u)
// invalid
c(L(9,1,0),null,{id:'3',date:'bad',time:'14:30'}); c(L(9,1,0),null,{id:'3',date:'2026-11-09',time:'25:99'})
// month boundary (Dec 31 -> Jan 1)
const nye = { id: '4', date: '2026-12-31', time: '23:55' }
n++; assert.equal(alertStage(nye, new Date(2026,11,31,23,45)), 'T-15')
n++; assert.equal(alertStage(nye, new Date(2027,0,1,0,5)), 'OVERDUE')

// snooze: silent until target, then T-0 -> OVERDUE, no T-15
const snz = { ...e, snoozeUntil: L(9,14,45).getTime(), snoozeGen: 1 }
c(L(9,14,40),null,snz); c(L(9,14,45),'T-0',snz); c(L(9,14,49),'T-0',snz); c(L(9,14,50),'OVERDUE',snz)
const snzU = { ...u, snoozeUntil: L(9,9,10).getTime(), snoozeGen: 2 }
c(L(9,9,0),null,snzU); c(L(9,9,10),'T-0',snzU)
c(L(9,14,45),null,{...snz,done:true})
n++; assert.equal(effectiveMoment(snz).getTime(), L(9,14,45).getTime())

// keys
n++; assert.equal(alertKey('9','T-0'), '9:T-0')
n++; assert.equal(alertKey('9','T-0',2), '9:s2:T-0')
n++; assert.notEqual(alertKey('9','OVERDUE',0), alertKey('9','OVERDUE',1))

// labels
n++; assert.equal(relativeLabel(e,L(9,14,18)),'in 12m')
n++; assert.equal(relativeLabel(e,L(9,15,7)),'+37m')
n++; assert.equal(relativeLabel(e,L(9,17,30)),'+3h')
n++; assert.equal(relativeLabel(e,L(9,14,30)),'now')
n++; assert.equal(relativeLabel(snz,L(9,14,40)),'in 5m')

console.log(`ALL PASS (${n} assertions)`)
