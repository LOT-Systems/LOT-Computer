/**
 * Widget health scan — static wiring checks (no browser, no DB).
 * Run: yarn test:widgets   Exit 1 on any FAIL; WARN never fails.
 */
import { readFileSync, readdirSync } from 'fs'
import { WIDGET_REGISTRY, REVEAL_MONTHS } from '../../src/client/utils/widgetRegistry.ts'

const DIR = 'src/client/components'
const system = readFileSync(`${DIR}/System.tsx`, 'utf-8').split('\n')
const fails: string[] = []
const warns: string[] = []

// 1. mounts + boundary coverage in System.tsx
const stack: string[] = []
const mounts = new Map<string, { line: number; boundary: string | null }[]>()
system.forEach((l, i) => {
  for (const m of l.matchAll(/<WidgetErrorBoundary name="([^"]+)"/g)) stack.push(m[1])
  for (const m of l.matchAll(/<(\w+Widgets?)\b/g)) {
    if (m[1] === 'WidgetErrorBoundary') continue
    const arr = mounts.get(m[1]) || []
    arr.push({ line: i + 1, boundary: stack[stack.length - 1] ?? null })
    mounts.set(m[1], arr)
  }
  for (const _ of l.matchAll(/<\/WidgetErrorBoundary>/g)) stack.pop()
})
for (const [id, list] of mounts)
  for (const m of list)
    if (!m.boundary) fails.push(`${id} mounted at System.tsx:${m.line} without WidgetErrorBoundary`)

// 2. registry <-> mounts <-> files
const reg = new Set(WIDGET_REGISTRY.map((s) => s.id))
for (const id of mounts.keys()) if (!reg.has(id)) fails.push(`${id} mounted but missing from widgetRegistry`)
for (const id of reg) if (!mounts.has(id)) fails.push(`${id} in widgetRegistry but not mounted in System.tsx`)
const files = new Set(readdirSync(DIR).filter((f) => /Widgets?\.tsx$/.test(f)).map((f) => f.replace('.tsx', '')))
for (const f of files) if (!reg.has(f)) warns.push(`${f}.tsx exists but is not in widgetRegistry`)
if (reg.size !== WIDGET_REGISTRY.length) fails.push('duplicate ids in widgetRegistry')

// 3. registry sanity
for (const s of WIDGET_REGISTRY) {
  if (!Number.isInteger(s.month) || s.month < 0 || s.month > REVEAL_MONTHS) fails.push(`${s.id}: month ${s.month} outside 0..${REVEAL_MONTHS}`)
  if (!s.wires.length) fails.push(`${s.id}: no wires`)
}

// 4. timer hygiene: every real setInterval needs a clearInterval in the same file
for (const f of files) {
  const src = readFileSync(`${DIR}/${f}.tsx`, 'utf-8').split('\n')
  const set = src.filter((l) => /^\s*[^'"`]*\bsetInterval\(/.test(l) && !/^\s*(\/\/|\*)/.test(l)).length
  const clr = src.filter((l) => /clearInterval\(/.test(l)).length
  if (set > clr) fails.push(`${f}: ${set} setInterval vs ${clr} clearInterval`)
}

console.log(`widgets mounted: ${mounts.size} | registry: ${reg.size} | files: ${files.size}`)
warns.forEach((w) => console.log('WARN ', w))
fails.forEach((f) => console.log('FAIL ', f))
console.log(fails.length ? `RESULT: RED (${fails.length})` : 'RESULT: GREEN')
process.exit(fails.length ? 1 : 0)
