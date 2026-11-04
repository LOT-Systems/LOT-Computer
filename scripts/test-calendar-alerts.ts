import dayjs from 'dayjs'
import { pendingStage, formatCountdown, entryStart } from '../src/client/utils/calendarAlerts'
const e = { id: 'a', date: '2026-11-05', time: '14:30' }
const at = (t: string) => dayjs(`2026-11-05T${t}:00`)
const none = new Set<any>()
const r: any = {
  far: pendingStage(e, at('13:00'), none),
  warn: pendingStage(e, at('14:16'), none),
  warnDup: pendingStage(e, at('14:20'), new Set(['warn'])),
  due: pendingStage(e, at('14:30'), new Set(['warn'])),
  dueDup: pendingStage(e, at('14:31'), new Set(['due'])),
  skipWarn: pendingStage(e, at('14:40'), none),
  missed: pendingStage(e, at('16:00'), none),
  missedAfterDue: pendingStage(e, at('16:00'), new Set(['due'])),
  tooOld: pendingStage({ ...e, date: '2026-11-03' }, at('16:00'), none),
  allDay: pendingStage({ id: 'b', date: '2026-11-05' }, at('09:00'), none),
  allDayEarly: pendingStage({ id: 'b', date: '2026-11-05' }, at('08:00'), none),
  cd: formatCountdown(e, at('12:15:00'.slice(0,5))),
  start: entryStart(e).format('HH:mm'),
}
console.log(r)
const exp: any = { far: null, warn: 'warn', warnDup: null, due: 'due', dueDup: null, skipWarn: 'due', missed: 'missed', missedAfterDue: null, tooOld: null, allDay: 'due', allDayEarly: null, cd: 'T-02:15:00', start: '14:30' }
let bad = 0
for (const k in exp) if (r[k] !== exp[k]) { console.log('FAIL', k, r[k], exp[k]); bad++ }
console.log(bad ? 'FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0)
