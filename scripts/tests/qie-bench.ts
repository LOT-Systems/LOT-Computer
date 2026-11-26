/**
 * QIE hot-path micro-benchmark (recordSignal / analyzeIntentions / getOptimalWidget).
 * Bundle + run: npx esbuild scripts/tests/qie-bench.ts --bundle --platform=node --format=esm \
 *   --alias:#client=./src/client --alias:#shared=./src/shared --outfile=/tmp/qie-bench.mjs && node /tmp/qie-bench.mjs
 * Fails loudly (throws) if any QIE pattern references an out-of-scope variable.
 */
const store: Record<string,string> = {}
;(globalThis as any).localStorage = { getItem:(k:string)=>store[k]??null, setItem:(k:string,v:string)=>{store[k]=String(v)}, removeItem:(k:string)=>{delete store[k]} }
;(globalThis as any).window = globalThis; (globalThis as any).fetch = async()=>({ok:true,json:async()=>({})})
import * as E from '#client/stores/intentionEngine'
const sources = ['mood','memory','planner','intentions','selfcare','journal','calculator','log','energy','cohort','recipe','goals','qos','badges','astrology'] as const
const t=(label:string,fn:()=>void,n=1)=>{const a=performance.now();for(let i=0;i<n;i++)fn();const ms=(performance.now()-a)/n;console.log(label.padEnd(44),ms.toFixed(3),'ms');return ms}
for (const N of [100, 500, 1000]) {
  const now = Date.now()
  E.intentionEngine.set({ ...E.intentionEngine.get(), signals: Array.from({length:N},(_,i)=>({timestamp: now - i*600000, source: sources[i%sources.length] as any, signal:'bench_'+(i%9), metadata:{hour:i%24, value:i%7}})), lastAnalysis: 0 } as any)
  console.log(`--- ${N} signals`)
  t('recordSignal (button press)', ()=>E.recordSignal('mood','bench_tap',{x:1}), 50)
  t('analyzeIntentions (151 patterns, cold)', ()=>{E.intentionEngine.set({...E.intentionEngine.get(), lastAnalysis:0} as any); E.analyzeIntentions()}, 5)
  t('getUserIndex', ()=>E.getUserIndex(), 10)
  t('getOptimalWidget (cold)', ()=>{E.intentionEngine.set({...E.intentionEngine.get(), lastAnalysis:0} as any); E.getOptimalWidget()}, 5)
  t('getUserState', ()=>E.getUserState(), 10)
  t('classifyPhysiologicalCohort', ()=>{const st=E.intentionEngine.get(); E.classifyPhysiologicalCohort(st.signals, E.getUserState(), st.recognizedPatterns??[])}, 10)
}
process.exit(0)
