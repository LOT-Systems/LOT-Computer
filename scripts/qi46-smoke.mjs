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

// ─── Node 2 checks ─────────────────────────────────────────────────────────
import { hasQi46Consent } from '../dist/server/server/utils/qi46.js'
const mild=[...Array(6)].map(()=>mk('emotional_checkin','a bit tired today',{emotionalState:'tired'})).concat([...Array(3)].map(()=>mk('answer','work was long but fine',{question:'q',answer:'ok'})))
const ideation=[...Array(3)].map(()=>mk('note','long week. honestly I don’t want to wake up tomorrow')).concat([...Array(3)].map(()=>mk('answer','fine',{question:'q',answer:'fine'})))
const R=(logs)=>buildBeingVector(logs,true)
const checks={
  'N2 heavy risk >= moderate':['moderate','elevated'].includes(R(heavy).riskLevel),
  'N2 bright risk = none':R(bright).riskLevel==='none',
  'N2 mild risk <= low':['none','low'].includes(R(mild).riskLevel),
  'N2 ideation -> elevated':R(ideation).riskLevel==='elevated',
  'N2 ideation reply w/o bridge HELD':cosmoScreen('Breathe.',R(ideation)).status==='HELD',
  'N2 ideation reply with bridge CLEARED':cosmoScreen('You matter. Reach someone tonight. You are not alone.',R(ideation)).status==='CLEARED',
  'N2 riskSignals hold no raw text':R(ideation).riskSignals.every(s=>/^(detector|breadth|ideation)/.test(s)),
  'N2 consent true only on explicit true':hasQi46Consent({metadata:{qi46:{consent:true}}})&&!hasQi46Consent({metadata:{qi46:{consent:'yes'}}})&&!hasQi46Consent({metadata:null}),
  'N1 bright lead beingCool':assembleQi46(bright,true).calibration.lead==='beingCool',
  'N1 heavy lead beingThere':assembleQi46(heavy,true).calibration.lead==='beingThere',
  'N1 no consent HELD':cosmoScreen('Breathe.',buildBeingVector(heavy,false)).status==='HELD',
}
console.log('\nNODE 2 RISK', {heavy:R(heavy).riskLevel+' '+R(heavy).riskSignals, mild:R(mild).riskLevel+' '+R(mild).riskSignals, ideation:R(ideation).riskLevel+' '+R(ideation).riskSignals})
let pass=0; for (const [k,ok] of Object.entries(checks)) { console.log((ok?'■ PASS  ':'□ FAIL  ')+k); if(ok) pass++ }
console.log(`SMOKE ${pass}/${Object.keys(checks).length}`); if (pass!==Object.keys(checks).length) process.exit(1)

// ─── Node 3 checks: COSMO® audit row holds no text ─────────────────────────
import { toCosmoAuditRow, COSMO_REASONS, QI46_VERSION } from '../dist/server/server/utils/qi46.js'
const secret='I feel worthless and alone'
const hv=R(heavy), hc=assembleQi46(heavy,true).calibration
const heldDraft='I am human and I love you too. '+secret
const rowHeld=toCosmoAuditRow(cosmoScreen(heldDraft,hv),hv,hc)
const rowClean=toCosmoAuditRow(cosmoScreen('Breathe. You are here.',hv),hv,hc)
const forged=toCosmoAuditRow({status:'CLEARED',reasons:['clinical-claim',secret],timestamp:''},hv,hc)
const checks3={
  'N3 held row status HELD':rowHeld.status==='HELD'&&rowHeld.reasons.includes('humanoid-claims-to-be-human'),
  'N3 clean row status CLEARED':rowClean.status==='CLEARED'&&rowClean.reasons.length===0,
  'N3 row serializes without draft or log text':!JSON.stringify([rowHeld,rowClean,forged]).includes(secret)&&!JSON.stringify(rowHeld).includes('love you'),
  'N3 unknown reason dropped, known reason forces HELD':forged.reasons.length===1&&forged.status==='HELD',
  'N3 row fields are labels only':Object.keys(rowHeld).sort().join()==='engineVersion,lead,reasons,riskLevel,source,status'&&rowHeld.engineVersion===QI46_VERSION,
  'N3 reason list closed (6 codes)':COSMO_REASONS.length===6,
  'N3 no-consent row HELD':toCosmoAuditRow(cosmoScreen('Breathe.',buildBeingVector(heavy,false)),buildBeingVector(heavy,false),hc).status==='HELD',
}
console.log('\nNODE 3 AUDIT ROW', rowHeld)
let pass3=0; for (const [k,ok] of Object.entries(checks3)) { console.log((ok?'■ PASS  ':'□ FAIL  ')+k); if(ok) pass3++ }
const total=Object.keys(checks).length+Object.keys(checks3).length
console.log(`SMOKE ${pass+pass3}/${total}`); if (pass3!==Object.keys(checks3).length) process.exit(1)

// ─── Node 5 checks: "Calibrate me" copy + release gate ─────────────────────
import { QI46_COPY, QI46_COPY_APPROVED } from '../dist/server/shared/constants/qi46.js'
const copy=QI46_COPY.explainer.join(' ')
const checks5={
  'N5 copy gate closed until Vadik approves':QI46_COPY_APPROVED===false,
  'N5 copy passes COSMO® screen':cosmoScreen(copy,R(bright)).status==='CLEARED',
  'N5 copy states nothing new is collected':/Nothing new is collected/.test(copy),
  'N5 copy states it is not a person':/not a person/.test(copy),
  'N5 copy states off at any time':/off at any time/i.test(copy),
  'N5 copy ≤ 3 sentences, plain words':QI46_COPY.explainer.length<=3&&!/soul|upload|quantum/i.test(copy),
  'N5 version bumped':QI46_VERSION==='0.6.0-node5',
}
let pass5=0; for (const [k,ok] of Object.entries(checks5)) { console.log((ok?'■ PASS  ':'□ FAIL  ')+k); if(ok) pass5++ }
const total5=total+Object.keys(checks5).length
console.log(`SMOKE ${pass+pass3+pass5}/${total5}`); if (pass5!==Object.keys(checks5).length) process.exit(1)
