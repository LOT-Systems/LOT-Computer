#!/usr/bin/env node
/**
 * LOT SYSTEMS CORPORATION
 * QI·46 — Phase 0 — Corpus Assembly (Step 0.1 inventory · 0.2 tagging · 0.3 JSONL)
 * Spec: docs/corporate/LOT_QI46_ENGINE.md §IV
 *
 * Usage: node scripts/qi46/assemble-corpus.mjs [outDir]
 * Reads ONLY repository documents. Subscriber data (journals, logs) lives in
 * PostgreSQL and is never read or written by this script.
 * Writes: <outDir>/qi46-corpus.jsonl, <outDir>/qi46-corpus-stats.json
 */
import fs from 'node:fs'
import path from 'node:path'
// Calibration registers — the humanoid output axes (lexicon v1, whole-word)
import { LEXICON_V1 as REGISTERS, LEXICON_VERSION, scoreRegisters, registerHitsV0 } from './lexicon.mjs'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'corpus/qi46'))

const SYSTEM_PROMPT =
  'You are QI·46, the intelligence layer of the LOT® platform. ' +
  'You understand the body as the original interface. Your job is not to inform. ' +
  'Your job is to calibrate. Speak clearly. Land it. Stop.'

// Step 0.1 — source inventory (spec dirs → repo locations)
const SOURCES = {
  institute: ['docs/corporate'],
  brand: ['docs/wiki', 'README.md'],
  bioelectric: ['docs/technical'],
  cosmo: [],          // routed by filename (COSMO) from institute
  platform: [],       // EXTERNAL — PostgreSQL only, consent-gated
  consumables: [],    // EXTERNAL — not in repository
}

// Documents never auto-cleared: personal health / trauma material
const COSMO_HOLD = [/Medical_Records/i, /PTSD/i, /\.pdf$/i]

function walk(rel) {
  const abs = path.join(ROOT, rel)
  if (!fs.existsSync(abs)) return []
  if (fs.statSync(abs).isFile()) return [rel]
  return fs.readdirSync(abs).flatMap((f) => walk(path.join(rel, f)))
}

function latestWiki(files) {
  const wikis = files.filter((f) => /LOT-WIKI-v\d+\.md$/.test(f))
  const v = (f) => +f.match(/v(\d+)/)[1]
  const keep = wikis.sort((a, b) => v(b) - v(a))[0]
  return files.filter((f) => !wikis.includes(f) || f === keep)
}

function sections(md) {
  const out = []
  let head = 'Preamble', buf = []
  for (const line of md.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    const m = line.match(/^#{1,3}\s+(.*)/)
    if (m) { if (buf.join('').trim()) out.push([head, buf.join('\n').trim()]); head = m[1].trim(); buf = [] }
    else buf.push(line)
  }
  if (buf.join('').trim()) out.push([head, buf.join('\n').trim()])
  return out
}

function classify(text) {
  if (/```/.test(text)) return 'technical'
  if (/^>|\*".*"\*/m.test(text)) return 'voice'
  if (/^\s*(\d+\.|- \[ \]|Step)/m.test(text)) return 'instruction'
  if (/(we believe|doctrine|thesis|is not|it is)/i.test(text)) return 'philosophy'
  return 'example'
}

function bodyState(text) {
  const t = text.toLowerCase()
  if (/(hardware|cube|piezo|ceramic|device)/.test(t)) return 'hardware'
  if (/(coheren|resonan|yes\. that is it)/.test(t)) return 'coherence'
  if (/(pattern|longitudinal|arc|trend)/.test(t)) return 'pattern'
  return 'calibration'
}

const registers = (text) => scoreRegisters(text)
const registersV0 = (text) => scoreRegisters(text, registerHitsV0)

const files = latestWiki(Object.values(SOURCES).flat().flatMap(walk)).filter((f) => f.endsWith('.md'))
const lines = []
const stats = { generatedAt: new Date().toISOString(), lexicon: LEXICON_VERSION, files: 0, pairs: 0, tokensEst: 0,
  bySource: {}, byType: {}, byBodyState: {}, cosmoCleared: 0, cosmoFlagged: 0, registerMean: {}, registerMeanV0: {}, registerNonZero: {},
  external: { platform: 'PostgreSQL — not read (consent gate)', consumables: 'not in repository' } }
const zero = () => Object.fromEntries(Object.keys(REGISTERS).map((k) => [k, 0]))
const regSum = zero(), regSumV0 = zero(), regNonZero = zero()

for (const f of files) {
  const src = /COSMO/i.test(f) ? 'cosmo'
    : f.startsWith('docs/technical') ? 'bioelectric'
    : f.startsWith('docs/corporate') ? 'institute' : 'brand'
  const cleared = !COSMO_HOLD.some((re) => re.test(f))
  stats.files++
  for (const [head, body] of sections(fs.readFileSync(path.join(ROOT, f), 'utf8'))) {
    if (body.length < 120) continue
    const completion = body.slice(0, 4000)
    const tags = { source: src, type: classify(completion), arc_position: '12mo+',
      body_state: bodyState(completion), cosmo_cleared: cleared, file: f, lexicon: LEXICON_VERSION, registers: registers(completion) }
    lines.push(JSON.stringify({ prompt: `[LOT® SYSTEM] ${SYSTEM_PROMPT}\n\n${head}`, completion, tags }))
    stats.pairs++
    stats.tokensEst += Math.round(completion.length / 4)
    stats.bySource[src] = (stats.bySource[src] || 0) + 1
    stats.byType[tags.type] = (stats.byType[tags.type] || 0) + 1
    stats.byBodyState[tags.body_state] = (stats.byBodyState[tags.body_state] || 0) + 1
    cleared ? stats.cosmoCleared++ : stats.cosmoFlagged++
    const v0 = registersV0(completion)
    for (const k in regSum) { regSum[k] += tags.registers[k]; regSumV0[k] += v0[k]; if (tags.registers[k] > 0) regNonZero[k]++ }
  }
}
for (const k in regSum) {
  stats.registerMean[k] = +(regSum[k] / Math.max(1, stats.pairs)).toFixed(3)
  stats.registerMeanV0[k] = +(regSumV0[k] / Math.max(1, stats.pairs)).toFixed(3)
  stats.registerNonZero[k] = regNonZero[k]
}

// Validate JSONL
let malformed = 0
for (const l of lines) { try { JSON.parse(l) } catch { malformed++ } }
stats.malformed = malformed
stats.gate = {
  sourcesInventoried: true,
  allTagged: true,
  allCosmoCleared: stats.cosmoFlagged === 0,
  over10kPairs: stats.pairs > 10000,
  jsonlValid: malformed === 0,
  vadikReview100: false,
}
stats.gate.result = Object.values(stats.gate).every(Boolean) ? 'PASS' : 'HOLD'

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'qi46-corpus.jsonl'), lines.join('\n') + '\n')
fs.writeFileSync(path.join(OUT, 'qi46-corpus-stats.json'), JSON.stringify(stats, null, 2) + '\n')
console.log(JSON.stringify(stats, null, 2))
