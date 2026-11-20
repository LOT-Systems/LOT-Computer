/**
 * Astrology block regression test — Kyureki lunisolar date + rokuyo.
 * Run: npx esr ./scripts/tests/test-astrology.ts
 * Ground truth: published Japanese calendar (旧暦) new-year and leap-month dates.
 */
import {
  getLunarDate,
  getRokuyo,
  getAmbientAstrology,
  getRokuyoResonance,
  isRokuyoFavoredHour,
} from '../../src/shared/utils/astrology.ts'

const day = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

const cases: Array<[string, string, string]> = [
  // date, expected lunar (L = leap), expected rokuyo
  ['2000-01-01', '11/25', 'Taian'],
  ['2020-05-23', 'L4/1', 'Butsumetsu'],
  ['2023-01-22', '1/1', 'Sensho'],
  ['2023-03-22', 'L2/1', 'Tomobiki'],
  ['2023-04-20', '3/1', 'Senpu'],
  ['2024-01-01', '11/20', 'Shakku'],
  ['2024-02-10', '1/1', 'Sensho'],
  ['2025-01-29', '1/1', 'Sensho'],
  ['2025-07-25', 'L6/1', 'Shakku'],
  ['2025-08-23', '7/1', 'Sensho'],
  ['2026-02-17', '1/1', 'Sensho'],
]

let failed = 0
for (const [date, lunar, rokuyo] of cases) {
  const l = getLunarDate(day(date))
  const got = `${l.isLeapMonth ? 'L' : ''}${l.month}/${l.day}`
  const r = getRokuyo(day(date))
  const ok = got === lunar && r === rokuyo
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${date} lunar ${got} (want ${lunar}) rokuyo ${r} (want ${rokuyo})`)
}

// Day 1 of every lunar month resets the cycle: (month + 1) % 6
const check = (name: string, cond: boolean) => {
  if (!cond) failed++
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
}
check('favored hours: Senpu PM', !isRokuyoFavoredHour('Senpu', 9) && isRokuyoFavoredHour('Senpu', 15))
check('favored hours: Shakku noon only', isRokuyoFavoredHour('Shakku', 12) && !isRokuyoFavoredHour('Shakku', 9))
check('favored hours: Butsumetsu none', !isRokuyoFavoredHour('Butsumetsu', 12))

// timeZone awareness: same instant, different calendar days
const instant = new Date('2026-11-20T02:00:00Z')
check('tz: Tokyo dateKey', getAmbientAstrology(instant, 'Asia/Tokyo').dateKey === '2026-11-20')
check('tz: Los Angeles dateKey', getAmbientAstrology(instant, 'America/Los_Angeles').dateKey === '2026-11-19')
check('tz: invalid zone falls back', typeof getAmbientAstrology(instant, 'Not/AZone').rokuyo === 'string')

// Resonance from Logs
const logs = [
  ...Array.from({ length: 10 }, () => ({ createdAt: new Date(), context: { astroRokuyo: 'Taian', astroLunarMonth: 10 } })),
  ...Array.from({ length: 4 }, () => ({ createdAt: new Date(), context: { astroRokuyo: 'Sensho', astroLunarMonth: 10 } })),
]
check('resonance: peak Taian', getRokuyoResonance(logs)?.peak === 'Taian')
check('resonance: legacy snapshot ignored', getRokuyoResonance(
  Array.from({ length: 14 }, () => ({ createdAt: '2026-11-20T03:00:00Z', context: { astroRokuyo: 'Taian', timeZone: 'Asia/Tokyo' } }))
)?.peak === 'Senpu')
check('resonance: below sample → null', getRokuyoResonance(logs.slice(0, 5)) === null)

console.log(failed ? `\n${failed} FAILED` : '\nALL PASS')
process.exit(failed ? 1 : 0)
