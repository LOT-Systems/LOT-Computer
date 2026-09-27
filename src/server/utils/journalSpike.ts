/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { Op } from 'sequelize'
import type { FastifyInstance } from 'fastify'

/**
 * Passive journal follow-up detection.
 *
 * The Log (Journal) is deliberately passive — no prompts, no questions
 * while the user is writing. This module is the other half of that
 * design: after an entry saves, it is compared (heuristically, no AI
 * call) against the user's own recent baseline. When it deviates —
 * runs much longer than usual, carries unusually charged language, or
 * breaks a multi-day silence — a single gentle follow-up line is left
 * as the next Log entry, to be found later rather than interrupting
 * the moment of writing.
 */

export type JournalSpikeType = 'length_spike' | 'intensity_spike' | 'silence_break'

export interface JournalSpikeResult {
  type: JournalSpikeType
  reason: string
  followUpText: string
}

// Modest, non-clinical vocabulary — enough to notice charged language
// without attempting diagnosis. Matched as case-insensitive substrings.
const HIGH_INTENSITY_WORDS = [
  'terrified', 'furious', 'devastated', 'hopeless', 'panic', 'crisis',
  "can't stop", "can't sleep", 'heartbroken', 'grief', 'breaking down',
  'falling apart', 'lost it', 'exhausted', 'overwhelmed', 'euphoric',
  'breakthrough', 'in love', 'amazing news', 'best day', 'worst day',
  'anxiety attack', 'shaking', 'numb', 'empty inside', 'can\'t breathe',
]

const FOLLOW_UP_TEXT: Record<JournalSpikeType, string> = {
  length_spike: 'That entry ran longer than usual — something been building?',
  intensity_spike: "That one carried more weight than your recent entries. Still sitting with it, or ready to set it down?",
  silence_break: 'Good to have you back in the log. What shifted?',
}

const BASELINE_WINDOW = 20
const MIN_BASELINE_ENTRIES = 4
const SILENCE_BREAK_DAYS = 5
const SILENCE_BREAK_MIN_WORDS = 15

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

function countIntensityWords(text: string): number {
  const lower = text.toLowerCase()
  return HIGH_INTENSITY_WORDS.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0)
}

function average(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/**
 * Returns a spike result if `text` (a just-saved 'note' log) deviates
 * from the user's recent journaling baseline, or null if it reads as
 * ordinary. Pure heuristic — no AI call, safe to run on every save.
 */
export async function detectJournalSpike(
  fastify: FastifyInstance,
  userId: string,
  currentLogId: string,
  text: string
): Promise<JournalSpikeResult | null> {
  const trimmed = text.trim()
  if (!trimmed) return null

  const priorNotes = await fastify.models.Log.findAll({
    where: {
      userId,
      event: 'note',
      id: { [Op.ne]: currentLogId },
      text: { [Op.ne]: null },
    },
    order: [['createdAt', 'DESC']],
    limit: BASELINE_WINDOW,
  })

  const wordCount = countWords(trimmed)

  // Pattern change: a substantial entry breaking a multi-day silence.
  const lastNote = priorNotes[0]
  if (lastNote) {
    const daysSinceLast =
      (Date.now() - new Date(lastNote.createdAt as any).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLast >= SILENCE_BREAK_DAYS && wordCount >= SILENCE_BREAK_MIN_WORDS) {
      return {
        type: 'silence_break',
        reason: `${Math.round(daysSinceLast)}d since last entry`,
        followUpText: FOLLOW_UP_TEXT.silence_break,
      }
    }
  }

  const baselineNotes = priorNotes.filter((l) => (l.text || '').trim().length > 0)
  if (baselineNotes.length < MIN_BASELINE_ENTRIES) return null

  const baselineWordCounts = baselineNotes.map((l) => countWords(l.text || ''))
  const avgWords = average(baselineWordCounts)

  const intensityCount = countIntensityWords(trimmed)
  const baselineIntensity = average(baselineNotes.map((l) => countIntensityWords(l.text || '')))

  // Spike: charged language well above this user's own recent baseline.
  if (intensityCount >= 2 && intensityCount > baselineIntensity + 1.2) {
    return {
      type: 'intensity_spike',
      reason: `${intensityCount} charged terms vs ${baselineIntensity.toFixed(1)} baseline`,
      followUpText: FOLLOW_UP_TEXT.intensity_spike,
    }
  }

  // Spike: an entry far longer than this user typically writes.
  if (avgWords >= 5 && wordCount > avgWords * 2.5 && wordCount - avgWords > 40) {
    return {
      type: 'length_spike',
      reason: `${wordCount}w vs ${Math.round(avgWords)}w baseline`,
      followUpText: FOLLOW_UP_TEXT.length_spike,
    }
  }

  return null
}
