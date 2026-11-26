/**
 * Widget health + lag test (System tab).
 *
 * Usage:
 *   APP_HOST=http://localhost:4400 AUTH_TOKEN=<session token> node scripts/tests/widget-health-lag.cjs [label] [screenshot.png]
 *
 * Seeds 500 Quantum Intent signals into localStorage (so the QIE analysis path
 * runs as it does for an active user), loads the System tab, and reports:
 * crash state, request fan-out, API errors (429/500), long tasks, click→paint
 * latency on interactive Blocks, runtime/console errors, and visible widget labels.
 * Requires Playwright (pre-installed in Claude Code cloud sessions).
 */
const { chromium } = require('playwright')
const label = process.argv[2] || 'run'
;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addCookies([{ name: 'auth_token', value: process.env.AUTH_TOKEN || '', url: (process.env.APP_HOST || 'http://localhost:4400')}])
  // Seed 500 QIE signals over the last 6 days so the analysis path runs as for a real active user
  await ctx.addInitScript(() => {
    if (localStorage.getItem('__seeded')) return
    const src = ['mood','memory','planner','intentions','selfcare','journal','calculator','log','energy','cohort','recipe','goals','badges','astrology']
    const now = Date.now(); const sig = []
    for (let i = 0; i < 500; i++) sig.push({ timestamp: now - i * 17 * 60000, source: src[i % src.length], signal: 'seed_' + (i % 7), metadata: { hour: (i % 24) } })
    localStorage.setItem('intention-signals', JSON.stringify(sig)); localStorage.setItem('__seeded', '1')
  })
  const page = await ctx.newPage()
  const errors = [], failed = [], api = []
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 900)) })
  page.on('requestfailed', r => failed.push(r.url()))
  let totalReq=0; page.on('request', ()=>totalReq++); page.on('response', r => { if (r.url().includes('/api/')) api.push({ u: r.url().replace(/^https?:\/\/[^/]+/, '').split('?')[0], s: r.status() }) })
  await page.addInitScript(() => {
    window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration) }).observe({ type: 'longtask', buffered: true }) } catch {}
  })
  const t0 = Date.now()
  await page.goto((process.env.APP_HOST || 'http://localhost:4400') + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text=Users online', { timeout: 20000 }).catch(() => {})
  const tSystem = Date.now() - t0
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(2500)
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const p = performance.getEntriesByType('paint'); return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), fcp: Math.round((p.find(x => x.name === 'first-contentful-paint') || {}).startTime || 0), jsKB: Math.round(performance.getEntriesByType('resource').filter(r => r.name.endsWith('.js')).reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) / 1024) } })
  const crashed = await page.locator('text=Something went wrong').count()
  const bodyText = await page.evaluate(() => document.body.innerText)
  const labels = [...new Set((bodyText.match(/^[A-Z][A-Za-z0-9®'’ \-\/]{1,28}:/gm) || []))]
  // Lag test: click interactive Blocks, measure click→next paint latency
  const clicks = {}
  for (const name of ['Users online:', 'Breathe:', 'Sound:', 'Sky:', 'Time:']) {
    const el = page.locator(`text=${name} >> visible=true`).first()
    if (!(await el.count())) { clicks[name] = 'n/a'; continue }
    const h = await el.elementHandle({ timeout: 3000 }).catch(() => null); if (!h) { clicks[name] = 'n/a'; continue }
    const samples = []
    for (let k = 0; k < 5; k++) {
      const ms = await h.evaluate(node => new Promise(res => { const t = performance.now(); node.click(); requestAnimationFrame(() => setTimeout(() => res(performance.now() - t), 0)) })).catch(() => NaN)
      samples.push(ms); await page.waitForTimeout(150)
    }
    samples.sort((a, b) => a - b); clicks[name] = { p50: +samples[2].toFixed(1), max: +samples[4].toFixed(1) }
  }
  const lt = await page.evaluate(() => window.__lt)
  const byStatus = api.reduce((a, r) => { const k = r.s >= 400 ? 'err' : 'ok'; a[k] = (a[k] || 0) + 1; return a }, {})
  const apiErr = [...new Set(api.filter(r => r.s >= 400).map(r => `${r.s} ${r.u}`))]
  await page.screenshot({ path: process.argv[3] || `/tmp/${label}.png`, fullPage: false })
  const apiCounts = api.reduce((a,r)=>{a[r.u]=(a[r.u]||0)+1;return a},{}); console.log(JSON.stringify({ label, totalRequests: totalReq, apiCounts, crashed: !!crashed, tSystemVisibleMs: tSystem, nav, longTasks: { count: lt.length, totalMs: Math.round(lt.reduce((a, b) => a + b, 0)), maxMs: Math.round(Math.max(0, ...lt)) }, clicks, api: byStatus, apiErr, errors: [...new Set(errors)].slice(0, 30), visibleLabels: labels.length, labels }, null, 1))
  await browser.close()
})()
