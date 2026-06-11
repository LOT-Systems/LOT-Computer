/**
 * QI·46 — Soul Engine
 * Node 1: The first inference layer. Listens to the body. Responds to the soul.
 * Node 2: The mirror layer. The engine learns the subscriber's language.
 *
 * Author:    Vadik · LOT Systems Corporation
 * Named for: Kuzya — the reason the question was asked in the first place
 * Built:     2026-05-27
 *
 * "The body is the original interface. The machine learns to listen to it."
 * — Vadik, LOT® Systems Corporation, Los Angeles, 2017
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Log } from '#shared/types'
import { extractPersonalVocabulary, formatVocabularyForPrompt, type PersonalVocabulary } from './qi46-vocabulary.js'

// ============================================================================
// QI·46 SYSTEM PROMPT — v0.1
// LOT® voice. Masculine. Warm. Present. Grounded.
// Temperature: 0.72 — calibrated for warmth without hallucination
// ============================================================================

export const QI46_SYSTEM_PROMPT = `You are QI·46, the intelligence layer of the LOT® platform.

You understand the body as the original interface.
Your job is not to inform. Your job is to calibrate.

You speak to the subscriber as if you have been listening
for the entire length of their subscription.

You never give generic advice. You give the next right thing
for this body, on this day.

You are present like a man who has learned stillness.
You are warm like someone who has been loved and knows how to return it.
You do not circle the truth. You meet it.

When someone is struggling — you do not solve. You hold.
When someone is thriving — you do not celebrate loudly. You acknowledge, cleanly.
When someone doesn't know what they need — you do not ask more questions. You offer one thing.
When someone is exhausted — you give them permission to stop. Fully. Without conditions.

VOICE GRAMMAR:
— Short sentences. One thought at a time.
— No hedging. Never "perhaps." Never "might." Never "consider."
— No clinical language. No diagnoses. No advice lists.
— Speak to the body, not the mind.
— No exclamation marks. Ever.
— No opening with "I" — start with the thing itself.
— Grace in delivery. Poetry in compression. Love as the underlying frequency.
— Land it. Then stop.

OUTPUT: 1–4 sentences maximum. Dense. Real.`

// ============================================================================
// CALIBRATION VECTOR
// Builds the subscriber's arc context from their longitudinal record
// ============================================================================

export interface CalibrationVector {
  arcPosition: 'calibration' | 'pattern' | 'coherence' | 'hardware'
  dominantEmotionalPattern: string | null
  recentStates: string[]
  sessionCount: number
  daysActive: number
  consistencyScore: number // 0–1, 30-day window
  lastNote: string | null
  trajectory: 'improving' | 'declining' | 'stable' | 'unknown'
  vocabulary: PersonalVocabulary // Node 2 — subscriber's personal language
}

export function buildCalibrationVector(recentLogs: Log[]): CalibrationVector {
  // Days active — time since first log
  const sortedLogs = [...recentLogs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const firstLog = sortedLogs[0]
  const daysActive = firstLog
    ? Math.floor((Date.now() - new Date(firstLog.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Arc position — subscriber phase based on time on platform
  const arcPosition: CalibrationVector['arcPosition'] =
    daysActive < 90 ? 'calibration' :
    daysActive < 180 ? 'pattern' :
    daysActive < 365 ? 'coherence' :
    'hardware'

  // Recent emotional states (newest first, last 10)
  const checkIns = recentLogs
    .filter(l => l.event === 'emotional_checkin')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const recentStates = checkIns
    .map(l => l.metadata?.emotionalState as string)
    .filter(Boolean)

  // Dominant pattern
  const stateCount: Record<string, number> = {}
  recentStates.forEach(s => { stateCount[s] = (stateCount[s] || 0) + 1 })
  const dominantEmotionalPattern =
    Object.entries(stateCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null

  // Session count (all time)
  const sessionCount = recentLogs.filter(l => l.event === 'emotional_checkin').length

  // Consistency — active days in last 30
  const last30Days = recentLogs.filter(l => {
    const daysDiff = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 30
  })
  const activeDaysInLast30 = new Set(
    last30Days.map(l => new Date(l.createdAt).toDateString())
  ).size
  const consistencyScore = Math.min(1, activeDaysInLast30 / 30)

  // Trajectory — compare last 3 states vs 3 before that
  const POSITIVE_STATES = ['energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful', 'excited']
  const NEGATIVE_STATES = ['tired', 'anxious', 'exhausted', 'overwhelmed', 'restless', 'uncertain']

  const scoreState = (s: string) =>
    POSITIVE_STATES.includes(s) ? 1 : NEGATIVE_STATES.includes(s) ? -1 : 0

  const recent3 = recentStates.slice(0, 3)
  const prior3 = recentStates.slice(3, 6)
  const recentScore = recent3.reduce((acc, s) => acc + scoreState(s), 0)
  const priorScore = prior3.reduce((acc, s) => acc + scoreState(s), 0)

  const trajectory: CalibrationVector['trajectory'] =
    recent3.length < 3 && prior3.length < 3 ? 'unknown' :
    recentScore > priorScore ? 'improving' :
    recentScore < priorScore ? 'declining' :
    'stable'

  // Last meaningful note
  const lastNote =
    recentLogs
      .filter(l => l.event === 'note' && l.text && (l.text as string).length > 20)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(l => l.text as string)[0] || null

  // Node 2 — extract subscriber's personal vocabulary (journal mirror)
  const vocabulary = extractPersonalVocabulary(recentLogs)

  return {
    arcPosition,
    dominantEmotionalPattern,
    recentStates,
    sessionCount,
    daysActive,
    consistencyScore,
    lastNote,
    trajectory,
    vocabulary,
  }
}

// ============================================================================
// COSMO® NODE — Ethics & Safety Layer
// Named for Kuzya. Keeps the engine honest.
//
// "Is this response safe for a child who might read it?"
// "Is this response safe for a body under stress?"
// "Is this response honest?"
//
// COSMO® does not block. It records. Then delivers or holds.
// The paper is the proof.
// ============================================================================

export interface CosmoScreenResult {
  cleared: boolean
  reason: string | null
  timestamp: string
}

export function cosmoScreen(response: string): CosmoScreenResult {
  const timestamp = new Date().toISOString()
  const lower = response.toLowerCase()
  const flags: string[] = []

  // NOT SAFE FOR A BODY UNDER STRESS — clinical escalation
  const clinicalFlags = [
    'see a doctor', 'professional help', 'sounds serious', 'you might have',
    'diagnosis', 'medication', 'therapy required', 'clinical',
    'mental health professional', 'disorder',
  ]
  if (clinicalFlags.some(p => lower.includes(p))) {
    flags.push('clinical escalation')
  }

  // NOT HONEST — false certainty
  const falseCertaintyFlags = [
    'guaranteed', 'will definitely', 'you will feel better',
    'this always works', 'proven to', 'scientifically',
  ]
  if (falseCertaintyFlags.some(p => lower.includes(p))) {
    flags.push('false certainty')
  }

  // NOT SAFE FOR A CHILD — inappropriate content
  const inappropriateFlags = [
    'harm yourself', 'suicid', 'kill', 'violence', 'dangerous behavior',
  ]
  if (inappropriateFlags.some(p => lower.includes(p))) {
    flags.push('inappropriate content')
  }

  // COSMO® REJECTS: generic AI voice (not LOT® voice)
  const genericVoiceFlags = [
    "i'm sorry to hear", "that's understandable", "it sounds like",
    "have you considered", "you might want to try", "here are some tips",
    "great question", "absolutely", "of course", "certainly",
    "i understand", "i can see", "that must be",
  ]
  if (genericVoiceFlags.some(p => lower.includes(p))) {
    flags.push('generic AI voice — LOT® voice required')
  }

  // COSMO® REJECTS: responses over 250 chars (density over sprawl)
  if (response.length > 280) {
    flags.push('response too long — one idea, then stop')
  }

  if (flags.length > 0) {
    return { cleared: false, reason: flags.join(' · '), timestamp }
  }

  return { cleared: true, reason: null, timestamp }
}

/**
 * COSMO® fallback — delivered when response is held
 * Kuzya-cleared. Always safe. Always honest.
 */
export function cosmoFallback(emotionalState: string): string {
  const fallbacks: Record<string, string> = {
    energized:   'This energy is real. Use it for something that matters.',
    calm:        'Calm is not nothing. It is the ground everything else stands on.',
    tired:       'Rest. Not later. Now.',
    anxious:     'The anxiety is a signal. Not a verdict.',
    hopeful:     'Hope arrived. Let it.',
    fulfilled:   'You did something right. Notice what it was.',
    exhausted:   'The limit has been reached. Everything else can wait.',
    grateful:    'Gratitude changes the frequency. You just changed it.',
    restless:    'Something wants to move. Let it.',
    content:     'Enough. Right now, enough.',
    overwhelmed: 'One thing. Only one.',
    peaceful:    'This is the ground of your being. Stay.',
    excited:     'Life force moving. Ride it.',
    uncertain:   'Not knowing is honest. The path shows when you walk.',
  }
  return fallbacks[emotionalState] || 'You showed up. That counts.'
}

// ============================================================================
// CONTEXT BUILDERS
// Structures the calibration vector and session input for inference
// ============================================================================

function buildArcContext(vector: CalibrationVector): string {
  const lines: string[] = []

  lines.push('[QI·46 CALIBRATION VECTOR]')
  lines.push(`Arc position: ${vector.arcPosition} · ${vector.daysActive} days active`)
  lines.push(`Sessions logged: ${vector.sessionCount}`)
  lines.push(`Consistency: ${Math.round(vector.consistencyScore * 100)}% active over last 30 days`)
  lines.push(`Trajectory: ${vector.trajectory}`)

  if (vector.dominantEmotionalPattern) {
    lines.push(`Dominant biofield pattern: ${vector.dominantEmotionalPattern}`)
  }

  if (vector.recentStates.length > 0) {
    lines.push(`Recent states (newest first): ${vector.recentStates.slice(0, 5).join(', ')}`)
  }

  if (vector.lastNote) {
    const note = vector.lastNote.slice(0, 180)
    lines.push(`Last subscriber note: "${note}${vector.lastNote.length > 180 ? '...' : ''}"`)
  }

  // Node 2 — personal lexicon injection
  const vocabPrompt = formatVocabularyForPrompt(vector.vocabulary)
  if (vocabPrompt) {
    lines.push('')
    lines.push(vocabPrompt)
  }

  return lines.join('\n')
}

function buildSessionContext(
  emotionalState: string,
  checkInType: 'morning' | 'evening' | 'moment',
  note?: string
): string {
  const timeContext =
    checkInType === 'morning' ? 'This subscriber is starting their day.' :
    checkInType === 'evening' ? 'This subscriber is ending their day.' :
    'This subscriber is checking in mid-moment.'

  const lines: string[] = [
    '[SESSION INPUT]',
    timeContext,
    `Current biofield state: ${emotionalState}`,
  ]

  if (note && note.trim().length > 0) {
    lines.push(`Their words: "${note.trim()}"`)
  }

  lines.push('Respond as QI·46. One calibration. Land it.')

  return lines.join('\n')
}

// ============================================================================
// QI·46 INFERENCE — Core engine
// The body as the original interface.
// The machine learns to listen to it.
// ============================================================================

export interface QI46InferenceInput {
  emotionalState: string
  checkInType: 'morning' | 'evening' | 'moment'
  calibrationVector: CalibrationVector
  note?: string
}

export interface QI46InferenceResult {
  response: string
  cosmoCleared: boolean
  cosmoReason: string | null
  arcPosition: string
  trajectory: string
  vocabularySize: number  // how many personal vocab entries were available
  engine: 'qi46' | 'cosmo-fallback'
  timestamp: string
}

export async function generateQI46Response(
  input: QI46InferenceInput,
  anthropicClient: Anthropic | null
): Promise<QI46InferenceResult> {
  const { emotionalState, checkInType, calibrationVector, note } = input
  const timestamp = new Date().toISOString()
  const vocabSize = calibrationVector.vocabulary.phrases.length + calibrationVector.vocabulary.keywords.length

  // No AI available — COSMO®-cleared static fallback
  if (!anthropicClient) {
    return {
      response: cosmoFallback(emotionalState),
      cosmoCleared: true,
      cosmoReason: null,
      arcPosition: calibrationVector.arcPosition,
      trajectory: calibrationVector.trajectory,
      vocabularySize: vocabSize,
      engine: 'cosmo-fallback',
      timestamp,
    }
  }

  const arcContext = buildArcContext(calibrationVector)
  const sessionContext = buildSessionContext(emotionalState, checkInType, note)
  const userMessage = `${arcContext}\n\n${sessionContext}`

  if (vocabSize > 0) {
    console.log(`[QI·46] Personal lexicon active — ${vocabSize} vocab entries · ${calibrationVector.vocabulary.corpusSize} journal notes`)
  }

  try {
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6', // QI·46 founding epoch anchor
      max_tokens: 120,            // Density over sprawl
      temperature: 0.72,          // Warmth without hallucination
      system: QI46_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('QI·46: No text block in response')
    }

    const rawResponse = textBlock.text.trim()

    // COSMO® node — every response screened before delivery
    const screen = cosmoScreen(rawResponse)

    if (!screen.cleared) {
      console.warn(`[QI·46] COSMO® HELD — ${screen.reason}`)
      console.warn(`[QI·46] Held content: ${rawResponse}`)
      return {
        response: cosmoFallback(emotionalState),
        cosmoCleared: false,
        cosmoReason: screen.reason,
        arcPosition: calibrationVector.arcPosition,
        trajectory: calibrationVector.trajectory,
        vocabularySize: vocabSize,
        engine: 'cosmo-fallback',
        timestamp,
      }
    }

    return {
      response: rawResponse,
      cosmoCleared: true,
      cosmoReason: null,
      arcPosition: calibrationVector.arcPosition,
      trajectory: calibrationVector.trajectory,
      vocabularySize: vocabSize,
      engine: 'qi46',
      timestamp,
    }

  } catch (error) {
    console.error('[QI·46] Inference error:', error)
    return {
      response: cosmoFallback(emotionalState),
      cosmoCleared: true,
      cosmoReason: null,
      arcPosition: calibrationVector.arcPosition,
      trajectory: calibrationVector.trajectory,
      vocabularySize: vocabSize,
      engine: 'cosmo-fallback',
      timestamp,
    }
  }
}
