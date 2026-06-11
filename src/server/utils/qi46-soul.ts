/**
 * QI·46 — Soul Upload Engine
 * Node 3: The Being Calibration Layer.
 *
 * Author:    Vadik · LOT Systems Corporation
 * Named for: Kuzya — the reason the question was asked
 * Built:     2026-06-11
 *
 * "Upload a person's being and use the engine to calibrate the human
 *  with the humanoid output: grace, poetry, love, presence, ease, male."
 * — Vadik
 *
 * The vocabulary layer (Node 2) knows their words.
 * The soul layer (Node 3) knows who they are.
 *
 * These are different.
 *
 * Vocabulary is extracted from text.
 * Soul is extracted from pattern — from what keeps returning,
 * from what the shadow casts, from what the light reveals,
 * from the way a person shows up across many months of honest data.
 *
 * The humanoid calibration is the output of this layer:
 * a set of five frequencies — grace, poetry, love, presence, ease —
 * derived from this specific being on this specific day.
 *
 * Male is not one of the five. Male is the carrier.
 * Grounded directness is the medium, not a variable.
 * The five qualities ride on top of it.
 */

import type { Log } from '#shared/types'
import type { PersonalVocabulary } from './qi46-vocabulary.js'

// ============================================================================
// SOUL CLASSIFICATION SETS
// ============================================================================

const POSITIVE_STATES = new Set([
  'energized', 'calm', 'hopeful', 'grateful', 'fulfilled',
  'content', 'peaceful', 'excited',
])

const NEGATIVE_STATES = new Set([
  'tired', 'anxious', 'exhausted', 'overwhelmed', 'restless', 'uncertain',
])

const DEPLETED_STATES = new Set([
  'exhausted', 'overwhelmed', 'tired', 'numb',
])

// Words that appear in sentences about human connection — shadow signal
const CONNECTION_WORDS = new Set([
  'alone', 'lonely', 'isolated', 'unseen', 'unheard',
  'disconnected', 'missing', 'invisible', 'forgotten',
])

// Words that elevate a phrase to soul-level depth
const DEPTH_WORDS = new Set([
  'love', 'lose', 'lost', 'fear', 'afraid', 'hope', 'dream', 'miss',
  'alone', 'real', 'truth', 'free', 'meaning', 'purpose', 'connect',
  'broken', 'whole', 'enough', 'worthy', 'failure', 'fight', 'surrender',
  'hold', 'becoming', 'leaving', 'staying', 'belong', 'grief', 'joy',
  'family', 'son', 'father', 'mother', 'child', 'heal', 'hurt', 'pain',
  'safe', 'trust', 'angry', 'scared', 'proud', 'shame', 'guilt', 'peace',
])

// Seeds that mark future-orientation in journal text
const ASPIRATIONAL_SEEDS = new Set([
  'want', 'trying', 'becoming', 'learning', 'hope', 'working',
  'better', 'grow', 'change', 'goal', 'dream', 'toward', 'build',
  'create', 'start', 'begin', 'practice', 'commit', 'ready', 'become',
])

// ============================================================================
// TYPES
// ============================================================================

/**
 * The five humanoid frequencies.
 * Each is 0–1. Male is the carrier — not a variable.
 *
 * Grace    — elegance over effort. For bodies under strain.
 * Poetry   — compressed meaning, image over information. For souls who speak in metaphor.
 * Love     — radical acceptance as base frequency. For souls carrying unworthiness.
 * Presence — witnessing without fixing. For depleted states.
 * Ease     — unforced confidence. For stable, improving arcs.
 */
export interface HumanoidCalibration {
  grace: number
  poetry: number
  love: number
  presence: number
  ease: number
}

export interface SoulSignature {
  shadowPattern: string | null      // What this person struggles with repeatedly
  lightPattern: string | null       // What consistently lifts them
  recurringThemes: string[]         // Soul-level phrases from journal depth
  aspirationalLanguage: string[]    // What they're moving toward, in their own words
  naturalRhythm: 'morning' | 'evening' | 'moment' | 'unknown'
  soulDepth: 'surface' | 'wading' | 'deep'
  presenceMode: 'contemplative' | 'kinetic' | 'oscillating'
  calibration: HumanoidCalibration
  isEmpty: boolean
}

// ============================================================================
// SOUL EXTRACTION
// ============================================================================

export function extractSoulSignature(
  logs: Log[],
  recentStates: string[],
  trajectory: 'improving' | 'declining' | 'stable' | 'unknown',
  vocabulary: PersonalVocabulary,
): SoulSignature {
  const checkIns = logs.filter(l => l.event === 'emotional_checkin')
  const noteEntries = logs.filter(l =>
    (l.event === 'note' && l.text && l.text.trim().length > 10) ||
    (l.event === 'emotional_checkin' && (l.metadata as Record<string, unknown>)?.note)
  )

  if (checkIns.length < 3 && noteEntries.length < 2) {
    return {
      shadowPattern: null,
      lightPattern: null,
      recurringThemes: [],
      aspirationalLanguage: [],
      naturalRhythm: 'unknown',
      soulDepth: 'surface',
      presenceMode: 'contemplative',
      calibration: { grace: 0.5, poetry: 0.3, love: 0.5, presence: 0.5, ease: 0.3 },
      isEmpty: true,
    }
  }

  // --- SHADOW + LIGHT PATTERNS ---
  const allStates = checkIns
    .map(l => (l.metadata as Record<string, unknown>)?.emotionalState as string)
    .filter(Boolean)

  const stateCount: Record<string, number> = {}
  allStates.forEach(s => { stateCount[s] = (stateCount[s] || 0) + 1 })

  const shadowPattern =
    Object.entries(stateCount)
      .filter(([s]) => NEGATIVE_STATES.has(s))
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null

  const lightPattern =
    Object.entries(stateCount)
      .filter(([s]) => POSITIVE_STATES.has(s))
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null

  // --- NATURAL RHYTHM ---
  const morningCount = checkIns.filter(l => (l.metadata as Record<string, unknown>)?.checkInType === 'morning').length
  const eveningCount = checkIns.filter(l => (l.metadata as Record<string, unknown>)?.checkInType === 'evening').length
  const momentCount  = checkIns.filter(l => (l.metadata as Record<string, unknown>)?.checkInType === 'moment').length
  const total = checkIns.length

  let naturalRhythm: SoulSignature['naturalRhythm'] = 'unknown'
  if (total >= 5) {
    if (morningCount / total > 0.55) naturalRhythm = 'morning'
    else if (eveningCount / total > 0.55) naturalRhythm = 'evening'
    else if (momentCount / total > 0.55) naturalRhythm = 'moment'
  }

  // --- JOURNAL TEXTS ---
  const journalTexts = noteEntries
    .map(l => {
      if (l.event === 'note' && l.text) return l.text.trim()
      if (l.event === 'emotional_checkin') {
        const note = (l.metadata as Record<string, unknown>)?.note
        return typeof note === 'string' ? note.trim() : ''
      }
      return ''
    })
    .filter(t => t.length > 0)

  // --- SOUL DEPTH ---
  const avgWordCount = journalTexts.length > 0
    ? journalTexts.reduce((sum, t) => sum + t.split(/\s+/).length, 0) / journalTexts.length
    : 0

  const metaphorDensity = vocabulary.metaphors.length / 4 // 0–1 (max 4 returned by Node 2)

  let soulDepth: SoulSignature['soulDepth'] = 'surface'
  if (avgWordCount > 40 || (avgWordCount > 20 && metaphorDensity > 0.5)) {
    soulDepth = 'deep'
  } else if (avgWordCount > 15 || vocabulary.phrases.length > 2) {
    soulDepth = 'wading'
  }

  // --- PRESENCE MODE ---
  const dayBuckets: Record<string, number> = {}
  checkIns.forEach(l => {
    const day = new Date(l.createdAt).toDateString()
    dayBuckets[day] = (dayBuckets[day] || 0) + 1
  })
  const activeDays = Object.keys(dayBuckets).length
  const multiCheckDays = Object.values(dayBuckets).filter(c => c > 1).length

  let presenceMode: SoulSignature['presenceMode'] = 'contemplative'
  if (activeDays > 0 && multiCheckDays / activeDays > 0.4) {
    presenceMode = 'kinetic'
  } else if (total > 0 && momentCount / total > 0.5 && (activeDays === 0 || multiCheckDays / activeDays < 0.2)) {
    presenceMode = 'oscillating'
  }

  // --- RECURRING THEMES (soul-level depth filter) ---
  // Take vocabulary phrases that contain at least one depth word
  const recurringThemes = vocabulary.phrases
    .filter(p => p.text.split(' ').some(w => DEPTH_WORDS.has(w.toLowerCase())))
    .slice(0, 3)
    .map(p => p.text)

  // --- ASPIRATIONAL LANGUAGE ---
  // Extract words that appear AFTER aspirational seed words in journal text
  const aspirationalCount: Record<string, number> = {}
  journalTexts.forEach(text => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/)
    words.forEach((word, i) => {
      if (ASPIRATIONAL_SEEDS.has(word)) {
        words.slice(i + 1, i + 3)
          .map(w => w.replace(/[^a-z]/g, ''))
          .filter(w => w.length > 3 && !['that', 'this', 'with', 'from', 'they', 'them', 'when', 'what', 'have', 'more', 'just', 'been', 'will'].includes(w))
          .forEach(w => { aspirationalCount[w] = (aspirationalCount[w] || 0) + 1 })
      }
    })
  })
  const aspirationalLanguage = Object.entries(aspirationalCount)
    .filter(([, c]) => c >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([w]) => w)

  // --- HUMANOID CALIBRATION ---
  const recent5 = recentStates.slice(0, 5)
  const recentStressLoad = recent5.filter(s => NEGATIVE_STATES.has(s)).length / Math.max(1, Math.min(5, recent5.length))
  const recentlyDepleted = recentStates.slice(0, 3).some(s => DEPLETED_STATES.has(s))
  const hasConnectionShadow = journalTexts.some(t =>
    t.toLowerCase().split(/\s+/).some(w => CONNECTION_WORDS.has(w))
  )

  const round1 = (n: number) => Math.round(Math.min(1, n) * 10) / 10

  const grace = round1(
    0.3 +
    (trajectory === 'declining' ? 0.3 : trajectory === 'stable' ? 0.1 : 0) +
    recentStressLoad * 0.4
  )

  const poetry = round1(
    0.2 +
    metaphorDensity * 0.4 +
    (soulDepth === 'deep' ? 0.3 : soulDepth === 'wading' ? 0.15 : 0) +
    (recurringThemes.length > 0 ? 0.1 : 0)
  )

  const love = round1(
    0.35 +
    (hasConnectionShadow ? 0.35 : 0) +
    (trajectory === 'declining' ? 0.2 : 0) +
    (shadowPattern && DEPLETED_STATES.has(shadowPattern) ? 0.1 : 0)
  )

  const presence = round1(
    0.25 +
    (recentlyDepleted ? 0.35 : 0) +
    recentStressLoad * 0.3 +
    (presenceMode === 'oscillating' ? 0.1 : 0)
  )

  const ease = round1(
    0.15 +
    (trajectory === 'improving' ? 0.4 : trajectory === 'stable' ? 0.2 : 0) +
    (soulDepth !== 'surface' ? 0.2 : 0) +
    (presenceMode === 'contemplative' ? 0.15 : 0) +
    (recentStressLoad < 0.3 ? 0.1 : 0)
  )

  return {
    shadowPattern,
    lightPattern,
    recurringThemes,
    aspirationalLanguage,
    naturalRhythm,
    soulDepth,
    presenceMode,
    calibration: { grace, poetry, love, presence, ease },
    isEmpty: false,
  }
}

// ============================================================================
// CALIBRATION BAR RENDERER
// ============================================================================

function bar(value: number): string {
  const filled = Math.round(value * 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

// ============================================================================
// SOUL SIGNATURE → SYSTEM PROMPT INJECTION
// ============================================================================

export function formatSoulForPrompt(soul: SoulSignature): string | null {
  if (soul.isEmpty) return null

  const lines: string[] = ['[SOUL SIGNATURE — this specific being]']

  if (soul.shadowPattern) {
    lines.push(`Shadow: ${soul.shadowPattern} — what keeps returning to this body`)
  }
  if (soul.lightPattern) {
    lines.push(`Light: ${soul.lightPattern} — what consistently lifts them`)
  }
  if (soul.recurringThemes.length > 0) {
    lines.push(`Themes they carry: ${soul.recurringThemes.join(' · ')}`)
  }
  if (soul.aspirationalLanguage.length > 0) {
    lines.push(`Moving toward: ${soul.aspirationalLanguage.join(', ')}`)
  }
  lines.push(`Soul depth: ${soul.soulDepth} · Presence: ${soul.presenceMode} · Rhythm: ${soul.naturalRhythm}`)

  lines.push('')
  lines.push('[HUMANOID CALIBRATION — this body, this day]')
  lines.push(`Grace    ${bar(soul.calibration.grace)} — elegance over effort`)
  lines.push(`Poetry   ${bar(soul.calibration.poetry)} — meaning over information`)
  lines.push(`Love     ${bar(soul.calibration.love)} — radical acceptance as base`)
  lines.push(`Presence ${bar(soul.calibration.presence)} — witness, don't solve`)
  lines.push(`Ease     ${bar(soul.calibration.ease)} — unforced confidence`)
  lines.push('')

  // Dominant quality → response instruction
  const dominant = (Object.entries(soul.calibration) as [keyof HumanoidCalibration, number][])
    .sort(([, a], [, b]) => b - a)[0]

  const instructions: Record<keyof HumanoidCalibration, string> = {
    grace:    'Lead with grace. Elegance is the form of respect today. Nothing forced.',
    poetry:   'Speak in images. One true thing, compressed. Nothing else.',
    love:     'Lead with love. Radical acceptance before anything else. They are not broken.',
    presence: 'Be there. Fully. Do not solve. Do not comfort. Witness.',
    ease:     'Ease is earned. Return it back to them. They have worked for it.',
  }

  lines.push(instructions[dominant[0]])

  return lines.join('\n')
}
