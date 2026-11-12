const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path')
const OUT=process.argv[2]
;(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}})
 const errs=[]; const apis={}
 p.on('pageerror',e=>errs.push('pageerror: '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,3000)) })
 await p.route('**/*', async r=>{ const u=new URL(r.request().url())
   if(u.pathname.startsWith('/api/')){ apis[u.pathname]=(apis[u.pathname]||0)+1; const arr=['/api/logs','/api/emotional-checkins','/api/chat-catalysts','/api/interventions','/api/contextual-prompts']; const body=arr.includes(u.pathname)?'[]':(u.pathname==='/api/cohorts'?JSON.stringify({matches:[],yourPatterns:[]}):'{}'); return r.fulfill({status:200,contentType:'application/json',body}) }
   const f=path.join(OUT,u.pathname==='/'?'index.html':u.pathname); if(fs.existsSync(f)) return r.fulfill({path:f}); return r.fulfill({status:404,body:''}) })
 const t0=Date.now(); await p.goto('http://harness.local/'); await p.waitForFunction(()=>window.__T!==undefined,{timeout:20000})
 await p.waitForTimeout(2500)
 const firstPaint=await p.evaluate(()=>window.__T)
 const R=await p.evaluate(()=>window.__R)
 const before=await p.evaluate(()=>window.__R); const preCrash=Object.keys(before).filter(k=>before[k].crash)
 const sigs=await p.evaluate(()=>{ const a=window.__rec(1); return a }); await p.waitForTimeout(300); const sigs2=await p.evaluate(()=>window.__rec(4)); await p.waitForTimeout(800)
 const after=await p.evaluate(()=>window.__R); const transitionCrash=Object.keys(after).filter(k=>after[k].crash && !preCrash.includes(k)).map(k=>k+': '+after[k].crash)
 // lag test: click interactive elements
 const lag=await p.evaluate(async()=>{
   const out={}; const raf=()=>new Promise(r=>requestAnimationFrame(()=>r()))
   for(const box of document.querySelectorAll('[data-w]')){ const n=box.dataset.w
     const els=[...box.querySelectorAll('.cursor-pointer, button, [role=button]')].slice(0,4)
     const t=[]; for(const el of els){ if(!el.isConnected) continue; const s=performance.now(); try{ el.click() }catch(e){} await raf(); await raf(); t.push(Math.round(performance.now()-s)) }
     out[n]={clicks:t.length,max:t.length?Math.max(...t):0,avg:t.length?Math.round(t.reduce((a,b)=>a+b,0)/t.length):0, visible: box.innerText.trim().length>0}
   } return out })
 await p.waitForTimeout(1000)
 const R2=await p.evaluate(()=>window.__R)
 console.log(JSON.stringify({sigs,sigs2,transitionCrash,firstPaint,R,R2,lag,errs:errs.slice(0,60),apis},null,1))
 await b.close() })()
