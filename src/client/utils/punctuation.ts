/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Punctuation & Intonation Analyzer
 *
 * Reads user log text and extracts "voice-level" signal — the punctuation
 * the user chose, how they chose it, and what it implies about intent and
 * intonation. The System reads punctuation as a live carrier of mood and
 * urgency. An exclamation point can be joy OR a quiet call for help, and
 * we must be able to tell them apart in context.
 *
 * This module does not talk to the store. It is a pure analyzer. The
 * nanostore container in #client/stores/punctuationContext wraps it and
 * makes the result available across the whole System.
 */

export type PunctuationTone =
  | 'flat'        // no expressive punctuation
  | 'calm'        // mostly periods/commas, balanced rhythm
  | 'reflective'  // ellipses, trailing thought
  | 'questioning' // many '?'
  | 'urgent'      // '!' + short sentences
  | 'excited'     // '!' + positive/long runs
  | 'mixed'       // fluctuating

export type PunctuationIntent =
  | 'neutral'
  | 'celebration'
  | 'call-for-help'
  | 'inquiry'
  | 'venting'
  | 'reflection'

export interface PunctuationSample {
  exclamations: number      // count of '!'
  questions: number         // count of '?'
  ellipses: number          // count of '...' / '…'
  periods: number           // count of '.' (excluding ellipses)
  commas: number            // count of ','
  dashes: number            // count of '—' / ' - '
  semicolons: number        // count of ';'
  multiBang: number         // '!!' / '!!!' runs
  multiQuestion: number     // '??' / '???' runs
  interrobangs: number      // '?!' / '!?'
  capsWords: number         // ALL CAPS words length >= 2
  words: number
  chars: number
  avgSentenceLen: number    // approximate (chars per terminator)
  /** intensity 0..1 — how loudly the user is speaking through punctuation */
  intensity: number
  tone: PunctuationTone
  intent: PunctuationIntent
  /** short one-line readable summary, e.g. "Calm ·  3 thoughts · low intensity" */
  label: string
}

const EMPTY_SAMPLE: PunctuationSample = {
  exclamations: 0,
  questions: 0,
  ellipses: 0,
  periods: 0,
  commas: 0,
  dashes: 0,
  semicolons: 0,
  multiBang: 0,
  multiQuestion: 0,
  interrobangs: 0,
  capsWords: 0,
  words: 0,
  chars: 0,
  avgSentenceLen: 0,
  intensity: 0,
  tone: 'flat',
  intent: 'neutral',
  label: 'Silent',
}

const HELP_WORDS = [
  'help', 'please', 'cant', "can't", 'cannot', 'tired', 'exhausted',
  'overwhelmed', 'alone', 'stuck', 'lost', 'scared', 'anxious', 'panic',
  'hurt', 'hurts', 'crying', 'broken',
]

const JOY_WORDS = [
  'love', 'yes', 'yay', 'amazing', 'beautiful', 'happy', 'grateful',
  'thank', 'thanks', 'best', 'perfect', 'wonderful', 'awesome', 'finally',
]

/**
 * Analyze a single string of text. Safe to call on empty/undefined input.
 */
export function analyzePunctuation(text: string | null | undefined): PunctuationSample {
  if (!text || typeof text !== 'string') return { ...EMPTY_SAMPLE }

  const raw = text
  // Normalize unicode ellipsis to triple dot for counting
  const normalized = raw.replace(/…/g, '...')

  const chars = normalized.length
  if (chars === 0) return { ...EMPTY_SAMPLE }

  // Count ellipses first, then strip from period count
  const ellipses = (normalized.match(/\.{3,}/g) || []).length
  const periodsRaw = (normalized.match(/\./g) || []).length
  const periods = Math.max(0, periodsRaw - ellipses * 3)

  const multiBang = (normalized.match(/!{2,}/g) || []).length
  const multiQuestion = (normalized.match(/\?{2,}/g) || []).length
  const interrobangs = (normalized.match(/[!?][!?]/g) || []).filter(s =>
    s.includes('!') && s.includes('?')
  ).length

  const exclamations = (normalized.match(/!/g) || []).length
  const questions = (normalized.match(/\?/g) || []).length
  const commas = (normalized.match(/,/g) || []).length
  const dashes = (normalized.match(/—|\s-\s/g) || []).length
  const semicolons = (normalized.match(/;/g) || []).length

  const wordTokens = normalized.trim().split(/\s+/).filter(Boolean)
  const words = wordTokens.length

  // ALL CAPS words with length >= 2 (strip punctuation from edges)
  const capsWords = wordTokens.filter(w => {
    const core = w.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
    if (core.length < 2) return false
    // Must be all uppercase letters
    return core === core.toUpperCase() && /[A-ZА-ЯЁ]/.test(core)
  }).length

  const terminators = Math.max(1, periods + exclamations + questions + ellipses)
  const avgSentenceLen = chars / terminators

  // --- Intensity (0..1) -------------------------------------------------------
  // weights favor runs of bangs, interrobangs, and caps
  const intensityRaw =
    exclamations * 0.06 +
    multiBang * 0.15 +
    interrobangs * 0.18 +
    capsWords * 0.08 +
    Math.min(questions, 5) * 0.02 -
    Math.min(commas, 10) * 0.01 -
    Math.min(ellipses, 4) * 0.02
  const intensity = Math.max(0, Math.min(1, intensityRaw))

  // --- Tone -------------------------------------------------------------------
  let tone: PunctuationTone = 'flat'
  if (exclamations === 0 && questions === 0 && ellipses === 0 && periods <= 1 && capsWords === 0) {
    tone = 'flat'
  } else if (ellipses >= 2 || (ellipses >= 1 && avgSentenceLen > 40)) {
    tone = 'reflective'
  } else if (questions >= 2 && questions > exclamations) {
    tone = 'questioning'
  } else if (exclamations >= 3 || multiBang >= 1 || capsWords >= 2) {
    // urgent vs excited — look at word sentiment below
    tone = 'urgent'
  } else if (exclamations >= 1 && commas >= 1) {
    tone = 'excited'
  } else if (periods >= 2 && exclamations === 0) {
    tone = 'calm'
  } else if (exclamations >= 1 && questions >= 1) {
    tone = 'mixed'
  } else {
    tone = 'calm'
  }

  // --- Intent (use word signals as tiebreaker) --------------------------------
  const lower = normalized.toLowerCase()
  const helpHits = HELP_WORDS.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0)
  const joyHits = JOY_WORDS.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0)

  let intent: PunctuationIntent = 'neutral'
  if (tone === 'urgent' && (helpHits > joyHits || interrobangs > 0)) {
    intent = 'call-for-help'
  } else if (tone === 'urgent' && joyHits > helpHits) {
    intent = 'celebration'
    tone = 'excited'
  } else if (tone === 'excited' && joyHits > 0) {
    intent = 'celebration'
  } else if (tone === 'excited' && helpHits > 0) {
    intent = 'call-for-help'
    tone = 'urgent'
  } else if (tone === 'questioning') {
    intent = 'inquiry'
  } else if (tone === 'reflective') {
    intent = 'reflection'
  } else if (multiBang >= 2 && commas >= 3) {
    intent = 'venting'
  }

  // --- Label ------------------------------------------------------------------
  const toneLabel = tone.charAt(0).toUpperCase() + tone.slice(1)
  const thoughts = terminators
  const intensityLabel =
    intensity >= 0.7 ? 'high intensity' :
    intensity >= 0.35 ? 'medium intensity' :
    intensity > 0 ? 'low intensity' : 'silent'
  const label = `${toneLabel} · ${thoughts} ${thoughts === 1 ? 'thought' : 'thoughts'} · ${intensityLabel}`

  return {
    exclamations,
    questions,
    ellipses,
    periods,
    commas,
    dashes,
    semicolons,
    multiBang,
    multiQuestion,
    interrobangs,
    capsWords,
    words,
    chars,
    avgSentenceLen,
    intensity,
    tone,
    intent,
    label,
  }
}

/**
 * Merge a list of samples into a single aggregated sample, weighted by
 * recency (most recent items count more). `samples[0]` is assumed newest.
 */
export function aggregatePunctuation(samples: PunctuationSample[]): PunctuationSample {
  if (samples.length === 0) return { ...EMPTY_SAMPLE }

  let totalWeight = 0
  const sum: PunctuationSample = { ...EMPTY_SAMPLE }

  samples.forEach((s, i) => {
    // Recency weight: newest = 1, decays gently
    const w = 1 / (1 + i * 0.35)
    totalWeight += w
    sum.exclamations += s.exclamations * w
    sum.questions += s.questions * w
    sum.ellipses += s.ellipses * w
    sum.periods += s.periods * w
    sum.commas += s.commas * w
    sum.dashes += s.dashes * w
    sum.semicolons += s.semicolons * w
    sum.multiBang += s.multiBang * w
    sum.multiQuestion += s.multiQuestion * w
    sum.interrobangs += s.interrobangs * w
    sum.capsWords += s.capsWords * w
    sum.words += s.words * w
    sum.chars += s.chars * w
    sum.avgSentenceLen += s.avgSentenceLen * w
    sum.intensity += s.intensity * w
  })

  const norm = (n: number) => Math.round((n / totalWeight) * 100) / 100

  const aggregated: PunctuationSample = {
    exclamations: norm(sum.exclamations),
    questions: norm(sum.questions),
    ellipses: norm(sum.ellipses),
    periods: norm(sum.periods),
    commas: norm(sum.commas),
    dashes: norm(sum.dashes),
    semicolons: norm(sum.semicolons),
    multiBang: norm(sum.multiBang),
    multiQuestion: norm(sum.multiQuestion),
    interrobangs: norm(sum.interrobangs),
    capsWords: norm(sum.capsWords),
    words: norm(sum.words),
    chars: norm(sum.chars),
    avgSentenceLen: norm(sum.avgSentenceLen),
    intensity: Math.max(0, Math.min(1, sum.intensity / totalWeight)),
    tone: 'flat',
    intent: 'neutral',
    label: '',
  }

  // Re-derive tone/intent from aggregated counts by running the analyzer
  // on a synthetic summary (so aggregation stays consistent with single-text).
  const tally = [
    '!'.repeat(Math.round(aggregated.exclamations)),
    '?'.repeat(Math.round(aggregated.questions)),
    '...'.repeat(Math.round(aggregated.ellipses)),
    '.'.repeat(Math.round(aggregated.periods)),
    ','.repeat(Math.round(aggregated.commas)),
  ].join(' ')
  const derived = analyzePunctuation(tally || '.')
  aggregated.tone = derived.tone
  aggregated.intent = derived.intent
  const intensityLabel =
    aggregated.intensity >= 0.7 ? 'high intensity' :
    aggregated.intensity >= 0.35 ? 'medium intensity' :
    aggregated.intensity > 0 ? 'low intensity' : 'silent'
  const thoughts = Math.max(
    1,
    Math.round(aggregated.periods + aggregated.exclamations + aggregated.questions + aggregated.ellipses)
  )
  aggregated.label = `${aggregated.tone.charAt(0).toUpperCase() + aggregated.tone.slice(1)} · ${thoughts} ${thoughts === 1 ? 'thought' : 'thoughts'} · ${intensityLabel}`

  return aggregated
}
