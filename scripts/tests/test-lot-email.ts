import { parseEmailCommand, formatLotEmail, lotEmailText, isLotEmail } from '../../src/shared/utils/lot-email'
const cases: [string, any][] = [
  ['/email to Hitomi.', { to: 'Hitomi', body: '' }],
  ['/email to Hitomi.\nTea on Thursday?', { to: 'Hitomi', body: 'Tea on Thursday?' }],
  ['/email to Hitomi: tea on Thursday?', { to: 'Hitomi', body: 'tea on Thursday?' }],
  ['/email Hitomi Tanaka.\nHello', { to: 'Hitomi Tanaka', body: 'Hello' }],
  ['private note\n/email to hitomi.\nHi', { to: 'hitomi', body: 'Hi' }],
  ['/email to Hitomi see you soon', { to: 'Hitomi', body: 'see you soon' }],
  ['/email', null],
  ['/email to', null],
  ['/emailx to Hitomi', null],
  ['hello world', null],
]
let fail = 0
for (const [i, exp] of cases) {
  const got = parseEmailCommand(i)
  const ok = JSON.stringify(got) === JSON.stringify(exp)
  if (!ok) { fail++; console.log('FAIL', JSON.stringify(i), got, exp) }
}
const f = formatLotEmail(undefined, 'Hi')
if (f !== '✉ Hi' || !isLotEmail(f) || lotEmailText(f) !== 'Hi') { fail++; console.log('FAIL format') }
console.log(fail ? `${fail} FAILED` : `ALL ${cases.length + 1} PASS`)
process.exit(fail ? 1 : 0)
