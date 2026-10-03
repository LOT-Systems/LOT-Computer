import { parseEmailCommands, detectNewEmailCommands, toEmailBody, fromEmailBody, isEmailMessage } from '../../src/shared/email.ts'
import assert from 'node:assert'

assert.deepStrictEqual(parseEmailCommands('/email to Hitomi. hello there\n').map(c => [c.to, c.body]), [['Hitomi', 'hello there']])
assert.strictEqual(parseEmailCommands('/email to Hitomi. still typing').length, 0, 'unfinished line must not fire')
assert.strictEqual(parseEmailCommands('/email to Hitomi.\n').length, 0, 'empty body must not fire')
assert.strictEqual(detectNewEmailCommands('/email to Ann: hi\nmore', '/email to Ann: hi\n').length, 0, 'no re-fire')
assert.strictEqual(detectNewEmailCommands('/email to Ann: hi\n', '').length, 1)
assert.ok(isEmailMessage(toEmailBody(' x ')) && fromEmailBody(toEmailBody(' x ')) === 'x')
console.log('lot-email: OK')
