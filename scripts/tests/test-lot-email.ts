import { parseEmailCommand } from '../../src/server/utils/lot-email.ts'
import { detectTriggers } from '../../src/client/utils/logTriggers.ts'
const eq=(a:any,b:any,n:string)=>{if(JSON.stringify(a)!==JSON.stringify(b)){console.log('FAIL',n,JSON.stringify(a));process.exitCode=1}else console.log('ok',n)}
eq(parseEmailCommand('/email to Hitomi. Dinner at 8? /send'),{recipient:'Hitomi',body:'Dinner at 8?',ready:true},'send')
eq(parseEmailCommand('/email to Hitomi Tanaka.\nHi\nthere')?.ready,false,'draft')
eq(parseEmailCommand('/email to Hitomi Tanaka:\nHi\n/SEND  ')?.body,'Hi','multi')
eq(parseEmailCommand('hello /email to X.'),null,'mid')
eq(detectTriggers('/email to Hitomi.').includes('email-compose' as any),true,'trigger')
