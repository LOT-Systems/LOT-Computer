#!/usr/bin/env node
// QI·46 — Phase 0 — Corpus Assembly (Steps 0.1 → 0.3 + Checkpoint 0 automation)
// Zero dependencies. Run from repo root:  node scripts/qi46/assemble-corpus.mjs
//
// Reads repo-resident LOT® documents only. Subscriber data (platform journals,
// COSMO® event logs) is NEVER read from the repo and NEVER committed; those
// streams are consent-gated DB pulls scheduled for a later session.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'qi46/corpus/build')
const VECTOR = JSON.parse(fs.readFileSync(path.join(ROOT, 'qi46/calibration/vector.json'), 'utf8'))

const SYSTEM_SEED = [
  'You are QI·46, the intelligence layer of the LOT® platform.',
  'You understand the body as the original interface.',
  'Your job is not to inform. Your job is to calibrate.',
  'Speak clearly. Land it. Stop.',
].join(' ')

// Step 0.1 — Source inventory: repo folder → corpus source
const SOURCE_MAP = [
  { dir: 'docs/corporate', source: 'institute' },
  { dir: 'docs/wiki', source: 'institute' },
  { dir: 'docs/technical', source: 'bioelectric' },
  { dir: 'docs/badges', source: 'brand' },
  { dir: 'docs/benchmark', source: 'brand' },
  { dir: 'docs/assembly', source: 'brand' },
  { dir: 'docs/releases', source: 'brand' },
]
// Excluded on purpose: deployment, setup, security, backup, diagnostics (ops, not voice)
const EXCLUDED_DIRS = ['docs/deployment', 'docs/setup', 'docs/security', 'docs/backup', 'docs/diagnostics']
// Not in repo — consent-gated, pulled from LOT® DB in a later session
const GATED_SOURCES = ['platform', 'consumable', 'cosmo']

// COSMO® screen — heuristics. Flags never auto-include; Vadik reviews.
const SENSITIVE_FILE = /(medical|ptsd|ipo|expense|security|backup|password|credential)/i
const SECRET_PATTERNS = [
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // email
  /\b(sk|pk|ghp|gho|xox[abp])[-_][A-Za-z0-9_-]{12,}/, // api tokens
  /\b(password|passwd|secret|api[_-]?key)\s*[:=]\s*\S+/i,
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN shape
  /\b(?:\d[ -]?){13,16}\b/, // card shape
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]
const CRISIS = /\b(suicid|self[- ]harm|kill (my|him|her)self|overdose)/i

const TYPE_RULES = [
  ['technical', /```|\b(api|endpoint|schema|deploy|migration|typescript|fastify|postgres|yaml|json)\b/i],
  ['instruction', /^\s*(\d+\.|-|\[ \])\s+\S/m],
  ['philosophy', /\b(body|soul|love|grace|coherence|listen|care|being|doctrine|thesis)\b/i],
]
const BODY_RULES = [
  ['hardware', /\b(cube|cubiq|sensor|haptic|device|robot|hardware)\b/i],
  ['coherence', /\b(coherence|resonance|harmony|alignment)\b/i],
  ['pattern', /\b(pattern|rhythm|habit|routine|cadence|streak)\b/i],
]
const ARC_BY_BODY = { calibration: '0-3mo', pattern: '3-6mo', coherence: '6-12mo', hardware: '12mo+' }

const REGISTER_HINTS = {
  GRACE: /\b(forgive|gentle|grace|kind|soft)\b/i,
  POETRY: /\b(poem|poetry|verse|shore|water|light|night|story)\b/i,
  LOVE: /\b(love|beloved|heart|father|son|family)\b/i,
  HUGS: /\b(hug|warm|breath|hold|comfort|calm)\b/i,
  BEING_THERE: /\b(remember|return|present|presence|listening|always)\b/i,
  BEING_COOL: /\b(cool|steady|easy|relax|chill)\b/i,
}

function walk(dir) {
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) return []
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name)
    if (e.isDirectory()) return walk(rel)
    return e.name.endsWith('.md') ? [rel] : []
  })
}

function sections(md) {
  const body = md.replace(/<!--[\s\S]*?-->/g, '')
  const out = []
  let head = null
  let buf = []
  const flush = () => {
    const text = buf.join('\n').trim()
    if (head && text.length >= 160) out.push({ head, text })
    buf = []
  }
  for (const line of body.split('\n')) {
    const m = line.match(/^#{1,4}\s+(.+)/)
    if (m) { flush(); head = m[1].replace(/[*_`]/g, '').trim(); continue }
    buf.push(line)
  }
  flush()
  return out
}

const pick = (rules, text, dflt) => (rules.find(([, re]) => re.test(text)) || [dflt])[0]

function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const seen = new Set()
  const pairs = []
  const inventory = []
  let dupes = 0

  for (const { dir, source } of SOURCE_MAP) {
    const files = walk(dir)
    let dirPairs = 0
    for (const file of files) {
      const md = fs.readFileSync(path.join(ROOT, file), 'utf8')
      const fileSensitive = SENSITIVE_FILE.test(path.basename(file))
      for (const { head, text } of sections(md)) {
        const completion = text.slice(0, 6000)
        const hash = crypto.createHash('sha256').update(completion.replace(/\s+/g, ' ')).digest('hex').slice(0, 16)
        if (seen.has(hash)) { dupes++; continue }
        seen.add(hash)
        const flags = []
        if (fileSensitive) flags.push('sensitive-file')
        if (SECRET_PATTERNS.some((re) => re.test(completion))) flags.push('pii-or-secret')
        if (CRISIS.test(completion)) flags.push('crisis-language')
        const type = pick(TYPE_RULES, completion, 'voice')
        const body_state = pick(BODY_RULES, completion, 'calibration')
        const registers = Object.entries(REGISTER_HINTS).filter(([, re]) => re.test(completion)).map(([k]) => k)
        pairs.push({
          prompt: `[LOT® SYSTEM] ${SYSTEM_SEED}\n[NODE] ${head}`,
          completion,
          tags: {
            source,
            type,
            arc_position: ARC_BY_BODY[body_state],
            body_state,
            cosmo_cleared: flags.length === 0,
            registers,
            origin: file,
            id: hash,
            ...(flags.length ? { cosmo_flags: flags } : {}),
          },
        })
        dirPairs++
      }
    }
    inventory.push({ dir, source, files: files.length, pairs: dirPairs })
  }

  const cleared = pairs.filter((p) => p.tags.cosmo_cleared)
  const flagged = pairs.filter((p) => !p.tags.cosmo_cleared)
  const toJsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n'
  fs.writeFileSync(path.join(OUT, 'lot-qi-46-v0.jsonl'), toJsonl(cleared))
  fs.writeFileSync(path.join(OUT, 'lot-qi-46-v0.flagged.jsonl'), toJsonl(flagged))

  // Deterministic 100-example review sample (seeded by id order)
  // Soul-first: the review prioritises voice/philosophy pairs that carry a calibration register
  const soulScore = (p) => (['voice', 'philosophy'].includes(p.tags.type) ? 2 : 0) + Math.min(p.tags.registers.length, 2)
  const sample = [...cleared]
    .sort((a, b) => soulScore(b) - soulScore(a) || a.tags.id.localeCompare(b.tags.id))
    .slice(0, 100)
  fs.writeFileSync(path.join(OUT, 'review-sample-100.jsonl'), toJsonl(sample))

  // Validate JSONL
  let malformed = 0
  for (const line of fs.readFileSync(path.join(OUT, 'lot-qi-46-v0.jsonl'), 'utf8').split('\n').filter(Boolean)) {
    try {
      const o = JSON.parse(line)
      if (!o.prompt || !o.completion || !o.tags || typeof o.tags.cosmo_cleared !== 'boolean') malformed++
    } catch { malformed++ }
  }

  const count = (rows, key) => rows.reduce((a, r) => ((a[r.tags[key]] = (a[r.tags[key]] || 0) + 1), a), {})
  const regCount = {}
  for (const p of cleared) for (const r of p.tags.registers) regCount[r] = (regCount[r] || 0) + 1
  const flagCount = {}
  for (const p of flagged) for (const f of p.tags.cosmo_flags) flagCount[f] = (flagCount[f] || 0) + 1
  const chars = cleared.reduce((a, p) => a + p.prompt.length + p.completion.length, 0)

  const stats = {
    generated_at: new Date().toISOString(),
    vector_version: VECTOR.vector_version,
    inventory,
    excluded_dirs: EXCLUDED_DIRS,
    gated_sources_pending: GATED_SOURCES,
    totals: {
      pairs_total: pairs.length,
      cosmo_cleared: cleared.length,
      cosmo_flagged: flagged.length,
      duplicates_dropped: dupes,
      est_tokens: Math.round(chars / 4),
      malformed_lines: malformed,
    },
    by_source: count(cleared, 'source'),
    by_type: count(cleared, 'type'),
    by_arc_position: count(cleared, 'arc_position'),
    by_body_state: count(cleared, 'body_state'),
    by_register: regCount,
    flag_reasons: flagCount,
    gate: {
      sources_inventoried: true,
      tagged_per_schema: malformed === 0,
      all_training_cosmo_cleared: cleared.every((p) => p.tags.cosmo_cleared),
      corpus_over_10000_pairs: cleared.length > 10000,
      jsonl_valid: malformed === 0,
      vadik_review_100: false,
    },
  }
  stats.gate.result = Object.values(stats.gate).every(Boolean) ? 'PASS' : 'HOLD'
  fs.writeFileSync(path.join(ROOT, 'qi46/corpus/stats.json'), JSON.stringify(stats, null, 2) + '\n')
  console.log(JSON.stringify(stats, null, 2))
}

main()
