// Run: npx tsx scripts/tests/test-slash-commands.ts  (pure-module checks for /system and /story)
import { compressLogs, formatDigest, digestForPrompt } from '../../src/client/utils/storyCompression'
import { buildSystemHelp, parseStoryScope, SLASH_COMMANDS } from '../../src/client/utils/slashCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'
const now = new Date('2026-10-13T20:00:00')
const mk=(d:number,text:string,ev='log_entry',extra:any={})=>({text,event:ev,createdAt:new Date(now.getTime()-d*864e5),context:{city:'Lisbon',temperature:68},...extra})
const logs=[mk(0,'coffee walk river calm'),mk(0,'river again, calm morning'),mk(1,'work stress deadline'),mk(5,'deadline work done'),mk(0,'',"emotional_checkin",{metadata:{emotionalState:'calm'}})]
const w=compressLogs(logs as any,'week',now)
const assert=(c:boolean,m:string)=>{if(!c){console.error('FAIL',m);process.exit(1)}}
assert(parseStoryScope('hi /story week')==='week','scope week')
assert(parseStoryScope('/story what a day')==='day','scope prose')
assert(parseStoryScope('/story Year')==='year','scope year')
for(const c of SLASH_COMMANDS) assert(detectTriggers(c.cmd).includes(c.trigger),'trigger '+c.cmd)
assert(w.entries===4 && w.checkins===1,'counts')
console.log('OK')
