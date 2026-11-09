import { alertStage, relativeLabel } from '../src/client/utils/calendarAlerts.ts'
import assert from 'node:assert/strict'
const L=(d,h,m)=>new Date(2026,10,d,h,m,0)
const e={id:'1',date:'2026-11-09',time:'14:30'}
const c=(now,exp,ent=e)=>assert.equal(alertStage(ent,now),exp,String(now)+' '+exp)
c(L(9,14,0),null); c(L(9,14,15),'T-15'); c(L(9,14,29),'T-15'); c(L(9,14,30),'T-0'); c(L(9,14,34),'T-0')
c(L(9,14,35),'OVERDUE'); c(L(11,14,30),'OVERDUE'); c(L(11,14,31),null)
c(L(9,14,20),null,{...e,done:true})
const u={id:'2',date:'2026-11-09'}
c(L(9,7,59),null,u); c(L(9,8,0),'TODAY',u); c(L(9,23,59),'TODAY',u); c(L(10,0,0),'OVERDUE',u); c(L(11,8,1),null,u)
c(L(9,1,0),null,{id:'3',date:'bad',time:'14:30'}); c(L(9,1,0),null,{id:'3',date:'2026-11-09',time:'25:99'})
assert.equal(relativeLabel(e,L(9,14,18)),'in 12m'); assert.equal(relativeLabel(e,L(9,15,7)),'+37m'); assert.equal(relativeLabel(e,L(9,17,30)),'+3h')
console.log('ALL PASS')
