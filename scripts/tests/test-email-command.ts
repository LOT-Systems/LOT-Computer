/**
 * LOT® Email — parser checks. Run: npx esr ./scripts/tests/test-email-command.ts
 */
import { parseEmailCommand } from '../../src/shared/utils/email-command.ts'

const cases: [string, ReturnType<typeof parseEmailCommand>][] = [
  ['/email to Hitomi.', { to: 'Hitomi', body: '' }],
  ['/email to Hitomi.\nSee you at 7.', { to: 'Hitomi', body: 'See you at 7.' }],
  ['/email to Hitomi see you at 7', { to: 'Hitomi', body: 'see you at 7' }],
  ['/EMAIL TO hitomi k: hi\nline two', { to: 'hitomi k', body: 'hi\nline two' }],
  ['morning notes\n/email to Kuzya, ping', { to: 'Kuzya', body: 'ping' }],
  ['no command here', null],
  ['/emails to Hitomi', null],
  ['/email Hitomi', null],
  ['/email to ', null],
]
let fail = 0
for (const [input, want] of cases) {
  const got = parseEmailCommand(input)
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) fail++
  console.log(ok ? 'PASS' : 'FAIL', JSON.stringify(input), '→', JSON.stringify(got))
}
console.log(fail ? `${fail} FAILED` : `ALL ${cases.length} PASS`)
process.exit(fail ? 1 : 0)
