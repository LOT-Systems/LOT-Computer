// Browser test: mocked /api/calendar + /api/logs, fake clock. Usage:
//   yarn client:css:build && node scripts/tests/calendar/build-harness.mjs /tmp/cal.js
//   node scripts/tests/calendar/e2e.cjs dist/client/css/index.css <shot-dir> /tmp/cal.js
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const S = process.argv[3] || require('os').tmpdir()
const BUNDLE = process.argv[4]
const css = fs.readFileSync(process.argv[2], 'utf8')
const js = fs.readFileSync(BUNDLE, 'utf8')
const store = [{ id: '1', event: 'calendar_entry', text: '[SCHEDULE] call: Dentist', metadata: { date: '2026-11-10', time: '14:30', text: 'Dentist', entryType: 'call' }, createdAt: '2026-11-10T10:00:00Z' },
  { id: '2', event: 'calendar_entry', text: 'x', metadata: { date: '2026-11-12', text: 'Ship report', entryType: 'task' }, createdAt: '2026-11-10T10:00:00Z' }]
let nid = 100
const posts = []
const assert = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1 } else console.log('ok', m) }
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 900, height: 700 }, timezoneId: 'UTC' })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.error('PAGEERR', e.message))
  await page.clock.install({ time: new Date('2026-11-10T14:20:00Z') })
  await page.route('**/*', async r => {
    const u = new URL(r.request().url())
    if (u.pathname === '/api/calendar') return r.fulfill({ json: store })
    if (u.pathname === '/api/logs' && r.request().method() === 'POST') {
      const body = r.request().postDataJSON(); const log = { id: String(nid++), ...body, createdAt: new Date().toISOString() }
      store.unshift(log); posts.push(body); return r.fulfill({ json: log })
    }
    if (u.pathname === '/api/logs') return r.fulfill({ json: [] })
    if (u.pathname === '/app.js') return r.fulfill({ body: js, contentType: 'application/javascript' })
    if (u.pathname === '/') return r.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><style>${css}</style></head><body class="bg-bac text-acc font-mono p-16"><div id="root"></div><script type="module" src="/app.js"></script></body></html>` })
    return r.fulfill({ status: 404, body: '' })
  })
  await page.goto('http://lot.test/')
  const keys = () => posts.filter(p => p.event === 'calendar_alert').map(p => p.metadata.key)
  await page.waitForSelector('text=CAL · T-15', { timeout: 5000 })
  assert(keys().join() === '1:T-15', 'T-15 fired once, logged: ' + keys())
  await page.screenshot({ path: path.join(S, 'shot-t15.png') })
  await page.clock.runFor(10 * 60 * 1000)
  await page.waitForSelector('text=CAL · T-0', { timeout: 5000 })
  assert(keys().join() === '1:T-15,1:T-0', 'T-0 fired, logged: ' + keys())
  assert(await page.locator('text=CAL · T-15').count() === 0, 'T-15 replaced by T-0')
  await page.screenshot({ path: path.join(S, 'shot-t0.png') })
  await page.click('text=[+10m]')
  await page.waitForTimeout(300)
  assert(posts.some(p => p.event === 'calendar_snooze' && p.metadata.gen === 1), 'snooze logged gen=1')
  assert(await page.locator('text=CAL · T-0').count() === 0, 'toast cleared after snooze')
  await page.clock.runFor(11 * 60 * 1000)
  await page.waitForSelector('text=CAL · T-0', { timeout: 5000 })
  assert(keys().includes('1:s1:T-0'), 'snooze re-armed T-0 as 1:s1:T-0')
  await page.click('text=[done]')
  await page.waitForTimeout(300)
  assert(posts.some(p => p.event === 'calendar_done' && p.metadata.entryId === '1'), 'done logged')
  assert(await page.locator('text=Dentist').count() === 0, 'Dentist gone from upcoming + toasts')
  const before = keys().length
  await page.reload(); await page.waitForTimeout(1500)
  await page.clock.runFor(60 * 1000)
  assert(keys().length === before, 'reload fires no duplicate alerts')
  // OVERDUE for another timed entry, opened late: one alert only
  store.unshift({ id: '3', event: 'calendar_entry', text: 'x', metadata: { date: '2026-11-10', time: '13:00', text: 'Brief ops', entryType: 'task' }, createdAt: 'x' })
  await page.reload(); await page.waitForSelector('text=CAL · OVERDUE', { timeout: 5000 })
  const k3 = keys().filter(k => k.startsWith('3:'))
  assert(k3.join() === '3:OVERDUE', 'late open: single OVERDUE, no burst: ' + k3)
  await page.screenshot({ path: path.join(S, 'shot-overdue.png') })
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  assert(await page.locator('text=CAL · OVERDUE').count() === 0, 'ESC acks')
  await page.click('text=Add date'); await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(S, 'shot-widget.png') })
  console.log('POSTS', posts.map(p => p.event + ':' + (p.metadata.key || p.metadata.stage)).join(' | '))
  await b.close()
})()
