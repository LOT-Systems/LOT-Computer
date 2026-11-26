/**
 * LOT SYSTEMS CORPORATION
 * QI·46 — Phase 0.2 — Corpus register lexicon
 *
 * Pure module, no imports. Scores a text on the 7 humanoid calibration
 * registers. Used by scripts/qi46/assemble-corpus.mjs and the smoke test.
 *
 * v0 (2026-11-24): raw substring count. `son` matched "person", `soft`
 *   matched "software", `build` scored engineering text as masculine,
 *   `heart` scored heart-rate data as love, `hold` matched "threshold".
 * v1 (2026-11-26): whole-word match on a normalized text. Entries:
 *   - `word`   exact word, optional plural s   (care → care, cares; not careful)
 *   - `stem*`  word that starts with the stem   (embrace* → embraced, embracing)
 *   - `a b`    phrase, any whitespace between   (with you, being held)
 *   Engineering and design words (build, haptic, heart, light, grid,
 *   terminal, support, remember) are removed. Emotion, touch and voice
 *   words are added so `hugs` and `love` can be heard at all.
 *   Product names (self-care, Digital Ocean, heart rate…) are blanked first.
 */

export const LEXICON_VERSION = 'v1'

/** Corpus key → engine register name in src/server/utils/qi46.ts */
export const ENGINE_REGISTER = {
  grace: 'grace', poetry: 'poetry', love: 'love', hugs: 'hugs',
  being_there: 'beingThere', being_cool: 'beingCool', male: 'masculine',
}

export const LEXICON_V0 = {
  grace:      ['grace', 'gentle', 'calm', 'quiet', 'still', 'soft', 'patience', 'ease'],
  poetry:     ['poem', 'poetry', 'story', 'shore', 'water', 'light', 'myth', 'verse'],
  love:       ['love', 'care', 'tender', 'heart', 'devotion', 'compassion', 'kind'],
  hugs:       ['hug', 'hold', 'embrace', 'warm', 'comfort', 'touch', 'haptic'],
  being_there:['present', 'presence', 'listen', 'listening', 'with you', 'support', 'remember'],
  being_cool: ['cool', 'clean', 'minimal', 'terminal', 'grid', 'precise', 'sharp'],
  male:       ['father', 'son', 'protect', 'strength', 'steady', 'discipline', 'build'],
}

export const LEXICON_V1 = {
  // Move gently. No judgment. Nothing to fix in a hurry.
  grace: ['grace', 'graceful*', 'gentle', 'gently', 'gentleness', 'calm', 'calmly', 'calmness',
    'quiet', 'quietly', 'stillness', 'soft', 'softly', 'softness', 'soften*', 'patience',
    'ease', 'forgive*', 'forgiving', 'mercy', 'serene', 'serenity', 'peace', 'peaceful*',
    'no judgment', 'no judgement', 'unhurried', 'slow down'],
  // Let one image carry the meaning.
  poetry: ['poem', 'poet*', 'verse', 'metaphor*', 'lyric*', 'haiku', 'myth', 'mythic*', 'shore',
    'tide', 'starlight', 'river', 'ocean', 'storytell*', 'once upon'],
  // Say plainly that this person matters.
  love: ['love', 'loved', 'loving', 'lovingly', 'beloved', 'tender', 'tenderly', 'tenderness',
    'care', 'caring', 'cherish*', 'devotion', 'devoted', 'compassion*', 'kindness',
    'affection*', 'adore*', 'heartfelt', 'heartbreak*', 'you matter', 'belong', 'belonging'],
  // Use the body: breath, warmth, weight, being held.
  hugs: ['hug', 'hugged', 'hugging', 'embrace*', 'being held', 'held close', 'hold you', 'holding you',
    'cuddl*', 'snuggl*', 'cradl*', 'touch', 'warmth', 'comfort', 'comforting', 'comforted',
    'breath', 'breathe', 'breathing', 'exhale*', 'inhale*', 'shoulder*', 'arms around'],
  // Witness first. Stay. Do not rush to solve.
  being_there: ['presence', 'with you', 'by your side', "i'm here", 'i am here', 'you are here',
    'listen', 'listened', 'listening', 'witness*', 'stay with', 'not alone', 'alongside',
    'accompan*', 'show up', 'showing up', 'here for you'],
  // Keep it light. Ease over intensity. (v0 scored design words here; v1 scores the register)
  being_cool: ['cool', 'chill', 'relax*', 'laid back', 'easygoing', 'easy going', 'no drama',
    'no big deal', 'humor', 'humour', 'funny', 'laugh*', 'smile*', 'playful*', 'joke*',
    'lighthearted', 'light hearted', 'grin*', 'breezy'],
  // Steady, grounded voice. Few words. Protective calm.
  male: ['father*', 'paternal', 'dad', 'son', 'brother*', 'man', 'masculin*', 'protective',
    'protector', 'strength', 'steady', 'steadiness', 'grounded', 'discipline', 'spine'],
}

/**
 * Names and product terms that contain a register word but carry no register.
 * They are blanked before matching. `self care` is the LOT® category, not love.
 */
export const LEXICON_EXCLUDE = ['self care', 'health care', 'healthcare', 'skin care', 'customer care',
  'digital ocean', 'model (ocean)', 'heart rate', 'cool down', 'cooling']

/** Lower case, straight quotes, hyphens/underscores/slashes become spaces, exclusions blanked. */
export function normalizeForLexicon(text) {
  let t = String(text || '')
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
  for (const x of LEXICON_EXCLUDE) t = t.split(x).join(' ')
  return t
}

function entryPattern(entry) {
  const stem = entry.endsWith('*')
  const body = (stem ? entry.slice(0, -1) : entry)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+')
  return `(?<![a-z'])${body}${stem ? "[a-z']*" : 's?'}(?![a-z])`
}

const compiled = new Map()
function compile(lexicon) {
  if (!compiled.has(lexicon)) {
    compiled.set(lexicon, Object.fromEntries(Object.entries(lexicon).map(([k, words]) =>
      [k, new RegExp(words.map(entryPattern).join('|'), 'g')])))
  }
  return compiled.get(lexicon)
}

/** Whole-word hit counts per register. */
export function registerHits(text, lexicon = LEXICON_V1) {
  const t = normalizeForLexicon(text)
  const out = {}
  for (const [k, re] of Object.entries(compile(lexicon))) out[k] = (t.match(re) || []).length
  return out
}

/** v0 substring counts, kept only to report the v0 → v1 delta. */
export function registerHitsV0(text) {
  const t = String(text || '').toLowerCase()
  const out = {}
  for (const [k, words] of Object.entries(LEXICON_V0)) out[k] = words.reduce((n, w) => n + (t.split(w).length - 1), 0)
  return out
}

/** Score 0..1 per register (6 hits = full), same scale as v0. */
export function scoreRegisters(text, hitsFn = registerHits) {
  const h = hitsFn(text)
  return Object.fromEntries(Object.entries(h).map(([k, n]) => [k, Math.min(1, +(n / 6).toFixed(2))]))
}
