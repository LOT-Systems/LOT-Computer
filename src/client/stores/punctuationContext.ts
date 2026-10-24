/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Punctuation Context Store
 *
 * A dedicated container that holds the user's "intonation voice" as
 * derived from punctuation in the Log section. The container is
 * intentionally separate from the mood/intent store so that it can be
 * read independently by any widget in the System:
 *
 *   import { punctuationContext, updatePunctuationFromLogs } from '#client/stores/punctuationContext'
 *
 * The System reads this store to make widgets more responsive to the
 * user's voice: an exclamation point is treated as a signal — sometimes
 * joy, sometimes a quiet call for help — and the container preserves
 * that raw, un-smoothed information so downstream widgets can act.
 */

import { atom } from 'nanostores'
import {
  analyzePunctuation,
  aggregatePunctuation,
  type PunctuationSample,
} from '#client/utils/punctuation'
import type { Log } from '#shared/types'

export interface PunctuationContextState {
  /** Aggregated sample across the most recent log entries with text. */
  aggregate: PunctuationSample
  /** Most recent single-entry sample (the very latest thing the user typed). */
  latest: PunctuationSample
  /** Trend — is intensity rising, stable, or fading compared to prior snapshot? */
  trend: 'rising' | 'stable' | 'fading'
  /** Whether the system flagged the user's voice as a potential call for help. */
  callForHelp: boolean
  /** Timestamp of the last update (ms since epoch). */
  lastUpdated: number
  /** How many log entries contributed to the aggregate. */
  sampleSize: number
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

const DEFAULT_STATE: PunctuationContextState = {
  aggregate: { ...EMPTY_SAMPLE },
  latest: { ...EMPTY_SAMPLE },
  trend: 'stable',
  callForHelp: false,
  lastUpdated: 0,
  sampleSize: 0,
}

export const punctuationContext = atom<PunctuationContextState>({ ...DEFAULT_STATE })

// --- Persistence ------------------------------------------------------------

const STORAGE_KEY = 'punctuation-context'

if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PunctuationContextState
      if (parsed && typeof parsed === 'object') {
        punctuationContext.set({ ...DEFAULT_STATE, ...parsed })
      }
    }
  } catch (e) {
    // non-fatal; start from defaults
  }
}

function persist(state: PunctuationContextState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    // storage quota/private mode — ignore
  }
}

// --- Update API -------------------------------------------------------------

/**
 * Recompute the punctuation context from a list of logs. Only logs with
 * text content contribute. Logs are assumed to be DESC ordered (newest
 * first), matching how useLogs() returns them.
 *
 * Safe to call on every render — internally cheap, and short-circuits
 * when the derived aggregate hasn't meaningfully changed.
 */
export function updatePunctuationFromLogs(
  logs: Array<Pick<Log, 'text' | 'event' | 'createdAt'>>
): PunctuationContextState {
  const withText = logs
    .filter((l) => typeof l.text === 'string' && l.text.trim().length > 0)
    .slice(0, 20) // analyze the last 20 texted entries — enough signal, bounded cost

  if (withText.length === 0) {
    const next: PunctuationContextState = {
      ...DEFAULT_STATE,
      lastUpdated: Date.now(),
    }
    punctuationContext.set(next)
    persist(next)
    return next
  }

  const samples = withText.map((l) => analyzePunctuation(l.text || ''))
  const latest = samples[0]
  const aggregate = aggregatePunctuation(samples)

  const prev = punctuationContext.get()
  const delta = aggregate.intensity - prev.aggregate.intensity
  const trend: PunctuationContextState['trend'] =
    delta > 0.08 ? 'rising' : delta < -0.08 ? 'fading' : 'stable'

  // "Call for help" heuristic — high intensity AND intent points to distress.
  // We deliberately require both so celebratory bangs don't trip the flag.
  const callForHelp =
    latest.intent === 'call-for-help' ||
    (aggregate.intensity >= 0.55 && aggregate.intent === 'call-for-help') ||
    (latest.multiBang >= 1 && latest.intent === 'call-for-help')

  const next: PunctuationContextState = {
    aggregate,
    latest,
    trend,
    callForHelp,
    lastUpdated: Date.now(),
    sampleSize: withText.length,
  }

  // Skip no-op updates to avoid re-renders downstream
  const same =
    prev.aggregate.intensity === next.aggregate.intensity &&
    prev.aggregate.tone === next.aggregate.tone &&
    prev.aggregate.intent === next.aggregate.intent &&
    prev.latest.chars === next.latest.chars &&
    prev.sampleSize === next.sampleSize &&
    prev.callForHelp === next.callForHelp

  if (same) return prev

  punctuationContext.set(next)
  persist(next)
  return next
}

/** Read the current snapshot without subscribing. */
export function getPunctuationContext(): PunctuationContextState {
  return punctuationContext.get()
}

/** Reset the store to the empty default (used on logout). */
export function resetPunctuationContext() {
  punctuationContext.set({ ...DEFAULT_STATE })
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }
}
