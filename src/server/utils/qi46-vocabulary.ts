/**
 * QI·46 — Journal Vocabulary Extractor
 * Node 2: The mirror layer. The engine learns the subscriber's language.
 *
 * "The interface starts speaking back in the user's own language."
 *
 * Parses note/journal entries and emotional check-in notes.
 * Extracts recurring phrases, distinctive words, and metaphorical frames.
 * Returns a personal lexicon injected into the QI·46 calibration vector.
 *
 * When someone says "I feel scattered" three times —
 * the engine says "scattered" back. Not "overwhelmed."
 * The word that belongs to them.
 */

import type { Log } from '#shared/types'

// ============================================================================
// STOP WORDS — filtered out of vocabulary extraction
// Common function words that carry no personal signal
// ============================================================================

const STOP_WORDS = new Set([
  // Articles / determiners
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her',
  'our', 'their', 'its', 'some', 'any', 'all', 'both', 'each', 'few', 'more',
  'most', 'other', 'such', 'no', 'not', 'only', 'same', 'than', 'too', 'very',
  // Prepositions
  'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
  'out', 'off', 'over', 'under', 'again', 'then', 'once', 'of', 'to', 'as',
  // Conjunctions
  'and', 'but', 'or', 'nor', 'so', 'yet', 'because', 'since', 'while', 'although',
  'though', 'if', 'when', 'where', 'which', 'who', 'whom', 'that', 'whether',
  // Pronouns
  'i', 'me', 'we', 'us', 'you', 'he', 'she', 'it', 'they', 'them', 'what',
  'which', 'who', 'whom', 'myself', 'yourself', 'himself', 'herself', 'itself',
  // Common verbs (too generic to carry personal signal)
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall',
  'can', 'need', 'dare', 'ought', 'used', 'going', 'get', 'got', 'go', 'come',
  'came', 'know', 'think', 'see', 'look', 'want', 'give', 'use', 'find', 'tell',
  'ask', 'seem', 'feel', 'try', 'leave', 'call', 'keep', 'let', 'begin', 'show',
  'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen',
  'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue',
  // Time words (too common)
  'today', 'yesterday', 'tomorrow', 'now', 'then', 'here', 'there', 'when',
  'always', 'never', 'sometimes', 'often', 'usually', 'still', 'already',
  'just', 'even', 'also', 'back', 'well', 'way', 'really', 'actually', 'things',
  // Check-in boilerplate
  'feeling', 'morning', 'evening', 'right', 'day', 'time', 'night',
])

// ============================================================================
// METAPHOR SEEDS — body/emotional vocabulary with high personal signal
// When these appear repeatedly, they define a person's expressive frame
// ============================================================================

const BODY_METAPHORS = [
  'heavy', 'light', 'stuck', 'flow', 'scattered', 'grounded', 'drifting',
  'burning', 'frozen', 'empty', 'full', 'broken', 'whole', 'tight', 'open',
  'closed', 'spinning', 'sinking', 'floating', 'sharp', 'numb', 'raw',
  'soft', 'hard', 'tangled', 'clear', 'cloudy', 'sharp', 'blunt', 'carrying',
  'weight', 'pressure', 'space', 'breath', 'edge', 'center', 'lost', 'found',
  'quiet', 'noise', 'still', 'rushing', 'held', 'falling', 'rising', 'landing',
]

// ============================================================================
// TYPES
// ============================================================================

export interface VocabEntry {
  text: string
  frequency: number
  lastUsed: Date
  score: number // frequency × recency weight (0–1 scale, recency = last 30 days full, decays after)
}

export interface PersonalVocabulary {
  phrases: VocabEntry[]    // 2–3 word recurring phrases (score-sorted, top 6)
  keywords: VocabEntry[]   // Single distinctive words (score-sorted, top 8)
  metaphors: string[]      // Body/emotional metaphor frames that recur (top 4)
  corpusSize: number       // Total notes analyzed
  isEmpty: boolean         // True if subscriber has no meaningful text yet
}

// ============================================================================
// TEXT EXTRACTION — pull all subscriber-authored text
// ============================================================================

function extractAllText(logs: Log[]): { text: string; createdAt: Date }[] {
  const texts: { text: string; createdAt: Date }[] = []

  for (const log of logs) {
    // Direct note entries
    if (log.event === 'note' && log.text && log.text.trim().length > 15) {
      texts.push({ text: log.text.trim(), createdAt: new Date(log.createdAt) })
    }

    // Emotional check-in free-text notes
    if (log.event === 'emotional_checkin' && log.metadata?.note) {
      const note = (log.metadata.note as string).trim()
      if (note.length > 10) {
        texts.push({ text: note, createdAt: new Date(log.createdAt) })
      }
    }
  }

  return texts
}

// ============================================================================
// RECENCY WEIGHT
// Full weight for last 30 days. Linear decay to 0.2 at 180 days. Floor at 0.2.
// ============================================================================

function recencyWeight(createdAt: Date): number {
  const daysDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysDiff <= 30) return 1.0
  if (daysDiff >= 180) return 0.2
  // Linear interpolation between 30→180 days: 1.0 → 0.2
  return 1.0 - (0.8 * (daysDiff - 30) / 150)
}

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')   // keep apostrophes (can't, don't)
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .map(w => w.replace(/^'+|'+$/g, '')) // strip leading/trailing apostrophes
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
}

// ============================================================================
// N-GRAM EXTRACTION
// ============================================================================

function extractNgrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    // Only generate n-gram if all component tokens pass the stop-word filter
    // (already filtered in tokenize — but double-check for the joining)
    ngrams.push(tokens.slice(i, i + n).join(' '))
  }
  return ngrams
}

// ============================================================================
// MAIN EXTRACTOR
// ============================================================================

export function extractPersonalVocabulary(logs: Log[]): PersonalVocabulary {
  const allTexts = extractAllText(logs)

  if (allTexts.length === 0) {
    return { phrases: [], keywords: [], metaphors: [], corpusSize: 0, isEmpty: true }
  }

  // ── Phrase map (2-grams + 3-grams) ──────────────────────────────────────
  const phraseMap = new Map<string, { count: number; lastUsed: Date; weightedScore: number }>()

  // ── Keyword map (single words) ───────────────────────────────────────────
  const keywordMap = new Map<string, { count: number; lastUsed: Date; weightedScore: number }>()

  // ── Metaphor counts ───────────────────────────────────────────────────────
  const metaphorCounts = new Map<string, number>()

  for (const { text, createdAt } of allTexts) {
    const tokens = tokenize(text)
    const weight = recencyWeight(createdAt)

    // Keywords
    for (const token of tokens) {
      const entry = keywordMap.get(token) || { count: 0, lastUsed: createdAt, weightedScore: 0 }
      entry.count++
      entry.weightedScore += weight
      if (createdAt > entry.lastUsed) entry.lastUsed = createdAt
      keywordMap.set(token, entry)
    }

    // 2-grams
    for (const ngram of extractNgrams(tokens, 2)) {
      const entry = phraseMap.get(ngram) || { count: 0, lastUsed: createdAt, weightedScore: 0 }
      entry.count++
      entry.weightedScore += weight
      if (createdAt > entry.lastUsed) entry.lastUsed = createdAt
      phraseMap.set(ngram, entry)
    }

    // 3-grams
    for (const ngram of extractNgrams(tokens, 3)) {
      const entry = phraseMap.get(ngram) || { count: 0, lastUsed: createdAt, weightedScore: 0 }
      entry.count++
      entry.weightedScore += weight
      if (createdAt > entry.lastUsed) entry.lastUsed = createdAt
      phraseMap.set(ngram, entry)
    }

    // Metaphor detection (use raw normalized text — don't filter stop words)
    const rawNormalized = normalize(text)
    for (const metaphor of BODY_METAPHORS) {
      // Match whole word
      const pattern = new RegExp(`\\b${metaphor}\\b`)
      if (pattern.test(rawNormalized)) {
        metaphorCounts.set(metaphor, (metaphorCounts.get(metaphor) || 0) + 1)
      }
    }
  }

  // ── Filter + sort phrases ─────────────────────────────────────────────────
  // Only include phrases that appear at least twice
  const phrases: VocabEntry[] = Array.from(phraseMap.entries())
    .filter(([, v]) => v.count >= 2)
    .map(([text, v]) => ({
      text,
      frequency: v.count,
      lastUsed: v.lastUsed,
      score: v.weightedScore,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  // ── Filter + sort keywords ────────────────────────────────────────────────
  // Only include keywords appearing at least twice, exclude body metaphors (handled separately)
  const keywords: VocabEntry[] = Array.from(keywordMap.entries())
    .filter(([text, v]) => v.count >= 2 && !BODY_METAPHORS.includes(text))
    .map(([text, v]) => ({
      text,
      frequency: v.count,
      lastUsed: v.lastUsed,
      score: v.weightedScore,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  // ── Top metaphors ─────────────────────────────────────────────────────────
  const metaphors = Array.from(metaphorCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([metaphor]) => metaphor)

  return {
    phrases,
    keywords,
    metaphors,
    corpusSize: allTexts.length,
    isEmpty: phrases.length === 0 && keywords.length === 0,
  }
}

// ============================================================================
// VOCABULARY → SYSTEM PROMPT INJECTION
// Formats personal lexicon for injection into the QI·46 calibration context
// ============================================================================

export function formatVocabularyForPrompt(vocab: PersonalVocabulary): string | null {
  if (vocab.isEmpty) return null

  const lines: string[] = ['[SUBSCRIBER PERSONAL LEXICON]']
  lines.push(`Corpus: ${vocab.corpusSize} journal ${vocab.corpusSize === 1 ? 'entry' : 'entries'} analyzed`)

  if (vocab.phrases.length > 0) {
    const phraseList = vocab.phrases.map(p => `"${p.text}"`).join(', ')
    lines.push(`Their recurring phrases: ${phraseList}`)
  }

  if (vocab.keywords.length > 0) {
    const wordList = vocab.keywords.map(k => k.text).join(', ')
    lines.push(`Their distinctive words: ${wordList}`)
  }

  if (vocab.metaphors.length > 0) {
    lines.push(`Their body metaphors: ${vocab.metaphors.join(', ')}`)
  }

  lines.push('Mirror their language when it fits. Never force it.')

  return lines.join('\n')
}
