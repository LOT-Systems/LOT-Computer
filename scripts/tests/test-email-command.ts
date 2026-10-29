import { parseEmailCommand, detectTriggers } from '../../src/client/utils/logTriggers.ts'

const cases: [string, { to: string; body: string } | null][] = [
  ['/email to Hitomi. Lunch tomorrow?', { to: 'Hitomi', body: 'Lunch tomorrow?' }],
  ['note\n/email to hitomi: hi there', { to: 'hitomi', body: 'hi there' }],
  ['/mail to Hitomi Tanaka, see you', { to: 'Hitomi Tanaka', body: 'see you' }],
  ['/email to Hitomi.', null],
  ['/email to Hitomi', null],
  ['no command here', null],
  ['/emailing to Hitomi. x', null],
]
let fail = 0
for (const [text, want] of cases) {
  const got = parseEmailCommand(text)
  const ok = want ? got?.to === want.to && got?.body === want.body : got === null
  if (!ok) { fail++; console.error('FAIL', JSON.stringify(text), got) }
}
if (!detectTriggers('/email to Hitomi.').includes('email-compose')) { fail++; console.error('FAIL trigger') }
console.log(fail ? `${fail} FAILED` : `email-command: ${cases.length + 1} passed`)
process.exit(fail ? 1 : 0)
