const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path')
const OUT=process.argv[2]
;(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}})
 const errs=[]; const apis={}
 p.on('pageerror',e=>errs.push('pageerror: '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,3000)) })
 await p.route('**/*', async r=>{ const u=new URL(r.request().url())
   if(u.pathname.startsWith('/api/')){ apis[u.pathname]=(apis[u.pathname]||0)+1; const arr=['/api/logs','/api/emotional-checkins','/api/chat-catalysts','/api/interventions','/api/contextual-prompts']; const body=arr.includes(u.pathname)?'[]':(u.pathname==='/api/cohorts'?JSON.stringify({matches:[],yourPatterns:[]}):'{}'); return r.fulfill({status:200,contentType:'application/json',body}) }
   const f=path.join(OUT,u.pathname==='/'?'index.html':u.pathname); if(fs.existsSync(f)) return r.fulfill({path:f}); return r.fulfill({status:404,body:''}) })
 const t0=Date.now(); await p.goto('http://harness.local/'); await p.waitForFunction(()=>window.__S && window.__S.t!==undefined,{timeout:20000})
 await p.waitForTimeout(2500)
 const firstPaint=await p.evaluate(()=>window.__S.t)
 await p.waitForTimeout(1500)
 const S=await p.evaluate(()=>({crash:window.__S.crash, appcrash:!!document.getElementById('APPCRASH'), failed:[...document.querySelectorAll('body *')].filter(e=>e.childNodes.length&&e.textContent.trim().startsWith('Failed to load')).length, labels:document.body.innerText.split('Failed to load').slice(0,-1).map(t=>t.trim().split(String.fromCharCode(10)).pop()), timings: window.__LOT_WIDGET_PERF__, textLen: document.body.innerText.length}))
 console.log(JSON.stringify({firstPaint,S,errs:errs.filter(e=>/dayMs|update depth|more hooks|is not a function|undefined/.test(e)).map(e=>e.slice(0,160)).slice(0,12)},null,1))
 await b.close() })()
