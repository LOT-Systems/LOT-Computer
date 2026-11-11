// Browser test: recurring series, skip, edit (supersede), on-time line. Usage:
//   yarn client:css:build && node scripts/tests/calendar/build-harness.mjs /tmp/cal.js
//   node scripts/tests/calendar/e2e-recurring.cjs dist/client/css/index.css <shot-dir> /tmp/cal.js
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const S = process.argv[3] || require('os').tmpdir()
const css = fs.readFileSync(process.argv[2], 'utf8')
const js = fs.readFileSync(process.argv[4], 'utf8')
// Daily standup since Sat 7 Nov; Mon 9 Nov closed on time, Tue 10 Nov 08:50 now.
const store = [
  { id: '4', event: 'calendar_entry', text: 'x', metadata: { date: '2026-11-07', time: '09:00', text: 'Standup', entryType: 'call', repeat: 'daily' }, createdAt: '2026-11-07T08:00:00Z' },
  { id: '5', event: 'calendar_done', text: 'x', metadata: { entryId: '4@2026-11-09', at: Date.parse('2026-11-09T09:01:00Z'), from: 'T-0' }, createdAt: '2026-11-09T09:01:00Z' },
]
let nid = 100
const posts = []
const assert = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1 } else console.log('ok', m) }
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 900, height: 760 }, timezoneId: 'UTC' })
  const page = await ctx.newPage()
  page.on('pageerror', e => { console.error('PAGEERR', e.message); process.exitCode = 1 })
  page.on('dialog', d => d.accept())
  await page.clock.install({ time: new Date('2026-11-10T08:50:00Z') })
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
  assert(keys().join() === '4@2026-11-10:T-15', 'series: one T-15 for today only, past occurrences lapsed: ' + keys())
  const upcoming = await page.locator('text=Standup').count()
  assert(upcoming === 2, 'upcoming shows one line per series (+ toast): ' + upcoming)
  assert(await page.locator('text=ON-TIME 1/3 · 7D').count() === 1, 'on-time line: 1 closed on time of 3 due (7,8 missed; 9 on time)')
  await page.screenshot({ path: path.join(S, 'rec-t15.png') })

  // Close today's via the toast at T-0, on time.
  await page.clock.runFor(10 * 60 * 1000)
  await page.waitForSelector('text=CAL · T-0', { timeout: 5000 })
  await page.click('text=[done]'); await page.waitForTimeout(300)
  const d = posts.find(p => p.event === 'calendar_done')
  assert(d && d.metadata.entryId === '4@2026-11-10' && d.metadata.from === 'T-0', 'done logged per occurrence from T-0')
  assert(await page.locator('text=ON-TIME 2/4 · 7D').count() === 1, 'on-time line updates to 2/4')
  assert(await page.locator('text=Wednesday, November 11, 2026 09:00').count() === 1, 'upcoming advances to tomorrow')

  // Skip tomorrow from the day view.
  await page.click('text=Add date'); await page.waitForTimeout(200)
  await page.click('button:has-text("W11")'); await page.waitForTimeout(200)
  await page.click('text=skip'); await page.waitForTimeout(300)
  const sk = posts.find(p => p.event === 'calendar_cancel')
  assert(sk && sk.metadata.entryId === '4@2026-11-11' && sk.metadata.stage === 'SKIPPED', 'skip writes occurrence cancel')
  assert(await page.locator('text=Thursday, November 12, 2026 09:00').count() === 1, 'upcoming skips to Thursday')

  // Edit the series from Thursday: move to 10:30, weekdays.
  await page.click('button:has-text("T12")'); await page.waitForTimeout(200)
  await page.click('text=edit'); await page.waitForTimeout(200)
  assert(await page.inputValue('input[type=text]') === 'Standup', 'edit prefills text')
  await page.fill('input[type=text]', 'Standup ops')
  await page.fill('input[type=time]', '10:30')
  await page.click('text=Repeat daily') // daily -> weekdays
  await page.screenshot({ path: path.join(S, 'rec-edit.png') })
  await page.click('button:has-text("Save")'); await page.waitForTimeout(400)
  const ed = posts.find(p => p.event === 'calendar_entry')
  assert(ed && ed.metadata.replaces === '4' && ed.metadata.repeat === 'weekdays' && ed.metadata.time === '10:30', 'edit supersedes series: ' + JSON.stringify(ed && ed.metadata))
  assert(await page.locator('text=Thursday, November 12, 2026 10:30').count() === 1, 'upcoming shows edited series')
  assert(await page.locator('text=/^Standup$/').count() === 0, 'old series gone')

  // Scrub the whole series.
  await page.click('button:has-text("T12")'); await page.waitForTimeout(100)
  await page.click('button:has-text("T12")'); await page.waitForTimeout(200)
  await page.click('text=scrub'); await page.waitForTimeout(400)
  const sc = posts.filter(p => p.event === 'calendar_cancel').pop()
  assert(sc.metadata.stage === 'SCRUBBED SERIES' && sc.metadata.entryId !== '4' && !String(sc.metadata.entryId).includes('@'), 'scrub series logged: ' + JSON.stringify(sc.metadata))
  assert(await page.locator('text=Standup ops').count() === 0, 'series scrubbed everywhere')
  await page.screenshot({ path: path.join(S, 'rec-final.png') })
  console.log('POSTS', posts.map(p => p.event + ':' + (p.metadata.key || p.metadata.stage || p.metadata.repeat)).join(' | '))
  await b.close()
})()
