// Calendar UI harness (Playwright). Expects an esbuild bundle of a page rendering <CalendarWidget/> plus dist css in ./h next to this file — see LOT-SR-20261118-CAL-01 §6.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const H = path.join(__dirname, 'h')
const TZ = 'America/New_York'
const pad = n => String(n).padStart(2, '0')
function wall(ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(ms)).map(x => [x.type, x.value]))
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}
;(async () => {
  const now = Date.now()
  const old = new Date(now - 86400e3).toISOString()
  const stream = [
    { id: 'e1', event: 'calendar_entry', text: 'x', createdAt: old, metadata: { ...wall(now - 60e3), text: 'Call ops desk', entryType: 'call', tz: TZ } },
    { id: 'e2', event: 'calendar_entry', text: 'x', createdAt: old, metadata: { ...wall(now - 3 * 60e3), text: 'File quarterly report', entryType: 'task', tz: TZ } },
    { id: 'a2', event: 'calendar_alert', text: 'x', createdAt: new Date(now - 3 * 60e3).toISOString(), metadata: { key: 'e2:T-0', entryId: 'e2', phase: 'T-0', firedAt: new Date(now - 3 * 60e3).toISOString(), source: 'watch' } },
    { id: 'e3', event: 'calendar_entry', text: 'x', createdAt: old, metadata: { ...wall(now + 3 * 3600e3), text: 'Briefing with S-2', entryType: 'call', tz: TZ } },
    { id: 'e4', event: 'calendar_entry', text: 'x', createdAt: old, metadata: { ...wall(now + 26 * 3600e3), text: 'Tokyo sync', entryType: 'call', tz: 'Asia/Tokyo' } },
    { id: 'e5', event: 'calendar_entry', text: 'x', createdAt: old, metadata: { date: wall(now - 86400e3).date, time: '10:00', text: 'Renew certs', entryType: 'task', tz: TZ } },
  ]
  const posts = []
  const browser = await chromium.launch()
  const results = {}
  for (const [name, opts] of [['desktop', { viewport: { width: 900, height: 700 } }], ['phone', { viewport: { width: 390, height: 780 }, isMobile: true }]]) {
    const ctx = await browser.newContext({ ...opts, timezoneId: TZ, deviceScaleFactor: 2, colorScheme: 'light' })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('http://lot.test/**', async route => {
      const u = new URL(route.request().url())
      if (u.pathname === '/api/calendar') return route.fulfill({ json: stream })
      if (u.pathname === '/api/logs' && route.request().method() === 'POST') {
        const b = route.request().postDataJSON(); posts.push({ view: name, ...b })
        return route.fulfill({ json: { id: 'n' + posts.length, ...b, createdAt: new Date().toISOString() } })
      }
      if (u.pathname.startsWith('/api')) return route.fulfill({ json: [] })
      const f = path.join(H, u.pathname === '/' ? 'index.html' : u.pathname)
      return route.fulfill({ path: f })
    })
    await page.goto('http://lot.test/')
    await page.waitForSelector('[role=alert]', { timeout: 8000 })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(__dirname, `cal-v3-${name}-flash.png`) })
    const toast1 = await page.textContent('[role=alert]')
    await page.click('[role=alert] >> text=SNZ +5')
    await page.waitForTimeout(300)
    const toast2 = await page.textContent('[role=alert]').catch(() => null)
    await page.click('[role=alert] >> text=DONE').catch(() => {})
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(__dirname, `cal-v3-${name}-board.png`) })
    results[name] = { toast1, toast2, errors, board: (await page.textContent('#root')).slice(0, 600) }
    await ctx.close()
  }
  await browser.close()
  console.log(JSON.stringify({ results, posts: posts.map(p => ({ view: p.view, event: p.event, text: p.text, key: p.metadata && p.metadata.key, until: p.metadata && p.metadata.until, status: p.metadata && p.metadata.status })) }, null, 1))
})()
