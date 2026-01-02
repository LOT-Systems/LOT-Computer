/**
 * Quantum Intention Recognition Engine
 *
 * Analyzes patterns across all widgets to deeply understand user intentions
 * and desires, surfacing the right support at the right moment.
 *
 * Philosophy: Users don't always know what they need. By observing patterns
 * in mood, planning, intentions, and timing, we can recognize deeper desires
 * and provide gentle, perfectly-timed support.
 */

import { atom } from 'nanostores'

// Intention signals collected from all widgets
export type IntentionSignal = {
  timestamp: number
  source: 'mood' | 'memory' | 'planner' | 'intentions' | 'selfcare' | 'journal'
  signal: string
  metadata?: Record<string, any>
}

// Recognized user states (quantum superposition of multiple states)
export type UserState = {
  energy: 'depleted' | 'low' | 'moderate' | 'high' | 'unknown'
  clarity: 'confused' | 'uncertain' | 'clear' | 'focused' | 'unknown'
  alignment: 'disconnected' | 'searching' | 'aligned' | 'flowing' | 'unknown'
  needsSupport: 'critical' | 'moderate' | 'low' | 'none'
  lastUpdated: number
}

// Deep intention patterns
export type IntentionPattern = {
  pattern: string
  confidence: number // 0-1
  suggestedWidget: string
  suggestedTiming: 'immediate' | 'soon' | 'next-session' | 'passive'
  reason: string
}

type IntentionEngineState = {
  signals: IntentionSignal[]
  userState: UserState
  recognizedPatterns: IntentionPattern[]
  lastAnalysis: number
}

const SIGNAL_RETENTION = 7 * 24 * 60 * 60 * 1000 // 7 days

export const intentionEngine = atom<IntentionEngineState>({
  signals: [],
  userState: {
    energy: 'unknown',
    clarity: 'unknown',
    alignment: 'unknown',
    needsSupport: 'none',
    lastUpdated: 0
  },
  recognizedPatterns: [],
  lastAnalysis: 0
})

// Load signals from localStorage on init
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('intention-signals')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Filter out old signals (keep last 7 days)
      const cutoff = Date.now() - SIGNAL_RETENTION
      const recentSignals = parsed.filter((s: IntentionSignal) => s.timestamp > cutoff)

      if (recentSignals.length > 0) {
        intentionEngine.set({
          ...intentionEngine.get(),
          signals: recentSignals
        })
      }
    } catch (e) {
      console.error('Failed to load intention signals:', e)
    }
  }
}

/**
 * Record a signal from any widget interaction
 */
export function recordSignal(
  source: IntentionSignal['source'],
  signal: string,
  metadata?: Record<string, any>
) {
  const state = intentionEngine.get()

  const newSignal: IntentionSignal = {
    timestamp: Date.now(),
    source,
    signal,
    metadata
  }

  const updatedSignals = [...state.signals, newSignal]

  // Keep only last 7 days
  const cutoff = Date.now() - SIGNAL_RETENTION
  const recentSignals = updatedSignals.filter(s => s.timestamp > cutoff)

  intentionEngine.set({
    ...state,
    signals: recentSignals
  })

  // Persist to localStorage
  localStorage.setItem('intention-signals', JSON.stringify(recentSignals))

  // Trigger analysis if enough new signals
  if (recentSignals.length % 5 === 0) {
    analyzeIntentions()
  }
}

/**
 * Analyze all signals to recognize deep patterns and user state
 */
export function analyzeIntentions(): IntentionPattern[] {
  const state = intentionEngine.get()
  const now = Date.now()

  // Don't re-analyze too frequently
  if (now - state.lastAnalysis < 5 * 60 * 1000) { // 5 min cooldown
    return state.recognizedPatterns
  }

  const patterns: IntentionPattern[] = []
  const signals = state.signals

  // Get recent signals (last 24 hours for immediate patterns)
  const dayAgo = now - 24 * 60 * 60 * 1000
  const recentSignals = signals.filter(s => s.timestamp > dayAgo)

  // Pattern 1: Repeated anxious/overwhelmed moods → Need self-care
  const anxiousMoods = recentSignals.filter(s =>
    s.source === 'mood' && (s.signal === 'anxious' || s.signal === 'overwhelmed')
  )
  if (anxiousMoods.length >= 2) {
    patterns.push({
      pattern: 'anxiety-pattern',
      confidence: Math.min(anxiousMoods.length / 3, 1),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: 'Multiple anxious check-ins detected - grounding practice recommended'
    })
  }

  // Pattern 2: Tired + no planning → Need structure
  const tiredMoods = recentSignals.filter(s => s.source === 'mood' && s.signal === 'tired')
  const plannerUse = recentSignals.filter(s => s.source === 'planner')
  if (tiredMoods.length >= 1 && plannerUse.length === 0) {
    patterns.push({
      pattern: 'lack-of-structure',
      confidence: 0.7,
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: 'Low energy without planning - structure might help'
    })
  }

  // Pattern 3: No intention set for weeks → Searching for direction
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const intentionSignals = signals.filter(s =>
    s.source === 'intentions' && s.timestamp > weekAgo
  )
  const hasCurrentIntention = !!localStorage.getItem('current-intention')

  if (!hasCurrentIntention && intentionSignals.length === 0) {
    patterns.push({
      pattern: 'seeking-direction',
      confidence: 0.8,
      suggestedWidget: 'intentions',
      suggestedTiming: 'next-session',
      reason: 'No guiding intention - may need direction or purpose'
    })
  }

  // Pattern 4: Energized + planning → Flow state potential
  const energizedMoods = recentSignals.filter(s =>
    s.source === 'mood' && (s.signal === 'energized' || s.signal === 'hopeful')
  )
  const recentPlanning = recentSignals.filter(s => s.source === 'planner')

  if (energizedMoods.length >= 1 && recentPlanning.length >= 1) {
    patterns.push({
      pattern: 'flow-potential',
      confidence: 0.9,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'High energy + planning active - great time for meaningful questions'
    })
  }

  // Pattern 5: Evening + overwhelmed → Rest needed
  const hour = new Date().getHours()
  const isEvening = hour >= 18 && hour < 23
  const overwhelmedRecently = recentSignals.filter(s =>
    s.source === 'mood' && s.signal === 'overwhelmed' &&
    (now - s.timestamp) < 3 * 60 * 60 * 1000 // Last 3 hours
  ).length > 0

  if (isEvening && overwhelmedRecently) {
    patterns.push({
      pattern: 'evening-overwhelm',
      confidence: 0.85,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: 'Evening overwhelm detected - gentle release practice needed'
    })
  }

  // Pattern 6: Consistent mood tracking + no journaling → Deeper reflection needed
  const moodSignals = recentSignals.filter(s => s.source === 'mood')
  const journalSignals = recentSignals.filter(s => s.source === 'journal')

  if (moodSignals.length >= 3 && journalSignals.length === 0) {
    patterns.push({
      pattern: 'surface-awareness',
      confidence: 0.6,
      suggestedWidget: 'journal',
      suggestedTiming: 'next-session',
      reason: 'Tracking moods consistently - ready for deeper reflection'
    })
  }

  // Pattern 7: Calm + morning → Intention-setting moment
  const isMorning = hour >= 6 && hour < 10
  const calmRecently = recentSignals.filter(s =>
    s.source === 'mood' && (s.signal === 'calm' || s.signal === 'peaceful') &&
    (now - s.timestamp) < 2 * 60 * 60 * 1000 // Last 2 hours
  ).length > 0

  if (isMorning && calmRecently && !hasCurrentIntention) {
    patterns.push({
      pattern: 'morning-clarity',
      confidence: 0.75,
      suggestedWidget: 'intentions',
      suggestedTiming: 'immediate',
      reason: 'Calm morning state - perfect for setting intention'
    })
  }

  // Calculate overall user state
  const userState = calculateUserState(signals, now)

  // Update state
  intentionEngine.set({
    signals,
    userState,
    recognizedPatterns: patterns,
    lastAnalysis: now
  })

  return patterns
}

/**
 * Calculate holistic user state from signals
 */
function calculateUserState(signals: IntentionSignal[], now: number): UserState {
  const recentSignals = signals.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000)

  // Analyze energy from mood signals
  const moodSignals = recentSignals.filter(s => s.source === 'mood')
  const energyMap: Record<string, number> = {
    'energized': 2, 'hopeful': 1, 'excited': 2, 'calm': 0,
    'tired': -2, 'exhausted': -3, 'overwhelmed': -1, 'anxious': -1
  }

  let energyScore = 0
  moodSignals.forEach(s => {
    energyScore += energyMap[s.signal] || 0
  })

  const energy =
    energyScore >= 3 ? 'high' :
    energyScore >= 1 ? 'moderate' :
    energyScore >= -1 ? 'low' :
    energyScore < -1 ? 'depleted' : 'unknown'

  // Analyze clarity from planning and intention signals
  const planningSignals = recentSignals.filter(s => s.source === 'planner')
  const intentionSignals = recentSignals.filter(s => s.source === 'intentions')
  const hasIntention = !!localStorage.getItem('current-intention')

  const clarity =
    planningSignals.length >= 2 && hasIntention ? 'focused' :
    planningSignals.length >= 1 || hasIntention ? 'clear' :
    intentionSignals.length >= 1 ? 'searching' :
    planningSignals.length === 0 && !hasIntention ? 'confused' : 'uncertain'

  // Analyze alignment from all signals
  const selfCareSignals = recentSignals.filter(s => s.source === 'selfcare')
  const positiveSignals = recentSignals.filter(s =>
    ['calm', 'peaceful', 'energized', 'hopeful', 'grateful', 'content'].includes(s.signal)
  )

  const alignment =
    positiveSignals.length >= 3 && planningSignals.length >= 1 ? 'flowing' :
    positiveSignals.length >= 2 || (hasIntention && planningSignals.length >= 1) ? 'aligned' :
    selfCareSignals.length >= 1 || intentionSignals.length >= 1 ? 'searching' : 'disconnected'

  // Determine support needs
  const anxiousSignals = recentSignals.filter(s =>
    ['anxious', 'overwhelmed', 'exhausted'].includes(s.signal)
  )

  const needsSupport =
    anxiousSignals.length >= 3 ? 'critical' :
    anxiousSignals.length >= 2 || energy === 'depleted' ? 'moderate' :
    anxiousSignals.length >= 1 ? 'low' : 'none'

  return {
    energy,
    clarity,
    alignment,
    needsSupport,
    lastUpdated: now
  }
}

/**
 * Get the most relevant widget to show based on deep analysis
 */
export function getOptimalWidget(): { widget: string; reason: string } | null {
  const patterns = analyzeIntentions()

  // Sort by confidence and timing priority
  const timingWeight = {
    'immediate': 3,
    'soon': 2,
    'next-session': 1,
    'passive': 0.5
  }

  const sorted = patterns
    .map(p => ({
      ...p,
      score: p.confidence * timingWeight[p.suggestedTiming]
    }))
    .sort((a, b) => b.score - a.score)

  if (sorted.length > 0 && sorted[0].score > 0.5) {
    return {
      widget: sorted[0].suggestedWidget,
      reason: sorted[0].reason
    }
  }

  return null
}

/**
 * Check if a widget should be shown based on intention analysis
 */
export function shouldShowWidget(widgetName: string): boolean {
  const optimal = getOptimalWidget()
  return optimal?.widget === widgetName
}

/**
 * Get user state for display/debugging
 */
export function getUserState(): UserState {
  return intentionEngine.get().userState
}
