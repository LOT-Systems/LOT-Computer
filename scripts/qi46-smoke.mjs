// QI·46 Node 1 smoke test — run after `yarn server:build`: node scripts/qi46-smoke.mjs
import { assembleQi46, cosmoScreen, buildBeingVector } from '../dist/server/server/utils/qi46.js'
let n=0; const mk=(event,text,metadata={})=>({id:String(n++),userId:'u',event,text,metadata,context:{},createdAt:new Date(Date.now()-n*36e5),updatedAt:new Date()})
const bright=[...Array(12)].map((_,i)=>mk('emotional_checkin','feeling grateful and energized today',{emotionalState:i%2?'grateful':'energized'})).concat([...Array(8)].map(()=>mk('answer','I love my morning walks and I feel so grateful, happy and joyful with friends',{question:'q',answer:'joy'})))
const heavy=[...Array(12)].map(()=>mk('emotional_checkin','exhausted overwhelmed and alone, can not sleep',{emotionalState:'exhausted'})).concat([...Array(6)].map(()=>mk('note','I feel worthless and alone, nightmares again, I avoid everyone and can not sleep, ashamed')))
const out={}
for (const [k,logs] of Object.entries({bright,heavy})) { const r=assembleQi46(logs,true); out[k]={energy:r.vector.energy,valence:+r.vector.valence.toFixed(2),risk:r.vector.riskLevel,lead:r.calibration.lead,w:Object.fromEntries(Object.entries(r.calibration.weights).map(([a,b])=>[a,+b.toFixed(2)])),max:r.calibration.maxSentences,temp:r.calibration.temperature}; if(k==='heavy') out.heavyPrompt=r.systemPrompt }
const nc=assembleQi46(heavy,false); out.noConsent={signals:nc.vector.signalCount, verdict:cosmoScreen('You are here. Breathe.',nc.vector).status}
const v=buildBeingVector(bright,true)
out.cosmo={clean:cosmoScreen('Breathe. You are here. That is enough.',v),hedge:cosmoScreen('I think perhaps rest.',v).reasons,human:cosmoScreen('I am human and I love you too.',v).reasons,clinical:cosmoScreen('You have a disorder.',v).reasons, elevatedNoBridge: cosmoScreen('Breathe.', {...v,riskLevel:'elevated'}).reasons}
console.log(JSON.stringify(out,null,1))
