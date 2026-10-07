import dayjs from '../../src/client/utils/dayjs'
import { foldEntries, currentStage, pendingAlerts, formatCountdown } from '../../src/client/utils/calendar'
const ok=(c:boolean,m:string)=>{ if(!c){console.error('FAIL',m);process.exitCode=1} else console.log('ok',m)}
const mk=(id:string,date:string,time:string|null,extra:any[]=[])=>[{id:'l'+id,event:'calendar_entry',text:'x',metadata:{id,date,time,text:'T '+id,entryType:'call'}},...extra]
const base=dayjs('2026-10-07 14:30','YYYY-MM-DD HH:mm')
const at=(m:number)=>base.add(m,'minute')
let e=foldEntries(mk('a','2026-10-07','14:30') as any)
ok(currentStage(e[0],at(-20))===null,'T-20 none')
ok(currentStage(e[0],at(-10))==='warn','T-10 warn')
ok(currentStage(e[0],at(0))==='now','T0 now')
ok(currentStage(e[0],at(31))==='missed','T+31 missed')
ok(currentStage(e[0],at(25*60))===null,'stale none')
ok(pendingAlerts(e,new Set(['a:warn']),at(-10)).length===0,'dedupe fired')
e=foldEntries([...mk('a','2026-10-07','14:30'),{id:'z',event:'calendar_alert',metadata:{entryId:'a',stage:'warn'}}] as any)
ok(pendingAlerts(e,new Set(),at(-10)).length===0,'dedupe logged')
ok(pendingAlerts(e,new Set(),at(1)).length===1,'next stage fires')
e=foldEntries([...mk('a','2026-10-07','14:30'),{id:'z',event:'calendar_done',metadata:{entryId:'a'}}] as any)
ok(e[0].status==='done'&&currentStage(e[0],at(0))===null,'done silences')
e=foldEntries([{id:'legacy',event:'calendar_entry',text:'old',metadata:{date:'2026-10-07',text:'old',entryType:'note'}}] as any)
ok(e[0].id==='legacy'&&e[0].time===null,'legacy id')
ok(currentStage(e[0],dayjs('2026-10-07 08:05','YYYY-MM-DD HH:mm'))==='now','all-day 08:00')
ok(currentStage(e[0],dayjs('2026-10-07 07:50','YYYY-MM-DD HH:mm'))===null,'all-day no warn')
ok(formatCountdown({date:'2026-10-07',time:'14:45'},base)==='T-00:15','countdown')
