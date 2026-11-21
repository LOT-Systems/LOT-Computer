// Calendar core logic tests — run: yarn test:calendar
import assert from 'node:assert/strict'
import * as C from '../../src/client/utils/calendar.ts'
let n=0; const t=(name:string,f:()=>void)=>{f();n++;console.log('PASS',name)}
const at=(d:string,tm='00:00')=>C.toEpoch(d,tm)
const logs:any[]=[
 {id:'a',event:'calendar_entry',metadata:{date:'2026-11-21',time:'14:30',text:'Dentist',entryType:'call'},createdAt:new Date(at('2026-11-20','10:00'))},
 {id:'b',event:'calendar_entry',metadata:{date:'2026-11-21',text:'Groceries',entryType:'task'},createdAt:new Date(at('2026-11-19'))},
 {id:'c',event:'calendar_entry',metadata:{date:'2026-11-21',time:'09:00',text:'Standup',entryType:'note'},createdAt:new Date(at('2026-11-19'))},
 {id:'legacy',event:'calendar_entry',text:'[SCHEDULE] x',metadata:{date:'2026-02-30',text:'bad date'},createdAt:'2026-01-01T00:00:00Z'},
 {id:'s1',event:'calendar_status',metadata:{refId:'c',status:'done'},createdAt:new Date(at('2026-11-21','08:00'))},
 {id:'s2',event:'calendar_status',metadata:{refId:'c',status:'open'},createdAt:new Date(at('2026-11-21','08:01'))},
 {id:'s3',event:'calendar_status',metadata:{refId:'c',status:'cancelled'},createdAt:new Date(at('2026-11-21','08:02'))},
 {id:'al',event:'calendar_alert',metadata:{refId:'a',phase:'T-15'},createdAt:new Date()},
]
const E=C.buildEntries(logs)
t('invalid date dropped',()=>assert.equal(E.length,3))
t('sort timed before all-day',()=>assert.deepEqual(E.map(e=>e.id),['c','a','b']))
t('latest status wins',()=>assert.equal(E.find(e=>e.id==='c')!.status,'cancelled'))
t('fired keys',()=>assert.ok(C.firedAlertKeys(logs).has('a:T-15')))
const a=E.find(e=>e.id==='a')!, b=E.find(e=>e.id==='b')!
t('T-15 fires in lead window',()=>{const d=C.dueAlerts([a],at('2026-11-21','14:20'),new Set());assert.equal(d[0].phase,'T-15')})
t('dedupe',()=>assert.equal(C.dueAlerts([a],at('2026-11-21','14:20'),new Set(['a:T-15'])).length,0))
t('T-0 supersedes',()=>assert.equal(C.dueAlerts([a],at('2026-11-21','14:35'),new Set())[0].phase,'T-0'))
t('stale beyond grace',()=>assert.equal(C.dueAlerts([a],at('2026-11-21','15:01'),new Set()).length,0))
t('nothing before lead',()=>assert.equal(C.dueAlerts([a],at('2026-11-21','14:14'),new Set()).length,0))
t('DAY alert at 09:00',()=>{assert.equal(C.dueAlerts([b],at('2026-11-21','08:59'),new Set()).length,0);assert.equal(C.dueAlerts([b],at('2026-11-21','09:00'),new Set())[0].phase,'DAY')})
t('closed no alert',()=>assert.equal(C.dueAlerts([{...a,status:'done'}],at('2026-11-21','14:31'),new Set()).length,0))
t('created inside lead skips T-15',()=>{const x={...a,createdAt:at('2026-11-21','14:20')};assert.deepEqual(C.alertWindows(x).map(w=>w.phase),['T-0'])})
t('overdue',()=>{assert.ok(!C.isOverdue(a,at('2026-11-21','14:50')));assert.ok(C.isOverdue(a,at('2026-11-21','15:00')));assert.ok(!C.isOverdue(b,at('2026-11-21','23:59')));assert.ok(C.isOverdue(b,at('2026-11-22','00:00')))})
t('countdown',()=>{assert.equal(C.formatCountdown(at('2026-11-21','14:30'),at('2026-11-21','14:15')),'T-00:15:00');assert.equal(C.formatCountdown(at('2026-11-24','18:30'),at('2026-11-21','14:30')),'T-3D 04H');assert.equal(C.formatCountdown(0,2000),'T+00:00:02')})
t('nextAlertAt',()=>assert.equal(C.nextAlertAt([a,b],at('2026-11-21','08:00')),at('2026-11-21','09:00')))
t('validators',()=>{assert.ok(C.isValidTime('23:59'));assert.ok(!C.isValidTime('24:00'));assert.ok(C.isValidDate('2028-02-29'));assert.ok(!C.isValidDate('2026-02-29'))})
console.log(`\n${n} tests passed`)
