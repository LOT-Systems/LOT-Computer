// Astrology widget v2 — pure-function checks (rokuyo boundary, zoned wall clock, Logs rhythm).
// Run: npm run test:astrology   (also try TZ=Asia/Tokyo npm run test:astrology)
import { getRokuyo, toZonedWallClock, getAstrologyReading, summarizeAstroLogs, getRokuyoGuidance, getLogAstroStamp } from '../../src/shared/utils/astrology.ts'
let fail = 0
const eq = (a: any, b: any, m: string) => { if (a !== b) { fail++; console.log('FAIL', m, a, b) } else console.log('ok', m) }
eq(getRokuyo(new Date(2000,0,1,0,0)), 'Sensho', 'anchor midnight')
eq(getRokuyo(new Date(2000,0,1,23,59)), 'Sensho', 'anchor late')
eq(getRokuyo(new Date(2000,0,2,0,1)), 'Tomobiki', 'next day')
eq(getRokuyo(new Date(1999,11,31)), 'Shakku', 'pre-anchor no negative index')
const instant = new Date('2026-11-27T15:30:00Z')
const tokyo = toZonedWallClock(instant, 'Asia/Tokyo')
eq(tokyo.getDate(), 28, 'tokyo date'); eq(tokyo.getHours(), 0, 'tokyo hour')
const la = toZonedWallClock(instant, 'America/Los_Angeles')
eq(la.getHours(), 7, 'LA hour')
eq(toZonedWallClock(instant, 'Bad/Zone'), instant, 'invalid zone fallback')
eq(toZonedWallClock(instant, null), instant, 'null zone')
const r = getAstrologyReading(instant, 'Asia/Tokyo')
eq(r.hourlyZodiac, 'Rat', 'tokyo zodiac hour'); eq(r.timeZone, 'Asia/Tokyo', 'zone carried')
eq(getRokuyoGuidance('Sensho', 9).favoredNow, true, 'sensho morning'); eq(getRokuyoGuidance('Senpu', 9).favoredNow, false, 'senpu morning')
const logs = [
  { createdAt: '2026-11-20T10:00:00Z', event: 'note', text: 'a', context: { astroRokuyo: 'Taian', astroMoonPhase: 'Full Moon' } },
  { createdAt: '2026-11-21T10:00:00Z', event: 'note', text: 'b', context: { astroRokuyo: 'Taian', astroMoonPhase: 'Full Moon' } },
  { createdAt: '2026-11-22T10:00:00Z', event: 'answer', text: null, context: {} },
  { createdAt: '2026-11-22T10:00:00Z', event: 'system_snapshot', text: null, context: {} },
]
const sum = summarizeAstroLogs(logs, { moonPhase: 'Full Moon', rokuyo: 'Taian' }, new Date('2026-11-27T00:00:00Z'))
eq(sum.total, 3, 'authored only'); eq(sum.samePhase >= 2, true, 'same phase'); eq(sum.topPhase, 'Full Moon', 'top phase'); eq(sum.thisCycle, 3, 'cycle')
eq(getLogAstroStamp({ createdAt: 'garbage', context: {} }), null, 'bad date null')
console.log(fail ? `FAILED ${fail}` : 'ALL PASS'); process.exit(fail ? 1 : 0)
