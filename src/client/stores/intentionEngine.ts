/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Quantum Intention Recognition Engine
 *
 * Analyzes patterns across all widgets to deeply understand user intentions
 * and desires, surfacing the right support at the right moment.
 *
 * Philosophy: Users don't always know what they need. By observing patterns
 * in mood, planning, intentions, and timing, we can recognize deeper desires
 * and provide gentle, perfectly-timed support.
 *
 * Origin: LOT Systems. The intention engine was here first.
 * Copies may appear. They'll have the form but not the function.
 * The copycat war begins — but intention recognition can't be faked.
 */

import { atom } from 'nanostores'

// Intention signals collected from all widgets and background monitors
export type IntentionSignal = {
  timestamp: number
  source: 'mood' | 'memory' | 'planner' | 'intentions' | 'selfcare' | 'journal' | 'calculator' | 'log' | 'energy' | 'cohort' | 'recipe' | 'goals' | 'qos' | 'medical' | 'resilience' | 'badges' | 'astrology'
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

// Accumulative User Index — aggregated from all widget signals
export type UserIndex = {
  overall: number          // 0-100, the single accumulative score
  dimensions: {
    engagement: number     // 0-100, frequency and breadth of widget interactions
    emotional: number      // 0-100, emotional health from mood signals
    intentional: number    // 0-100, planning + intention + direction
    social: number         // 0-100, community connections and cohort
    selfCare: number       // 0-100, cleanness + rest + care practices
    cognitive: number      // 0-100, memory + journal + reflection depth
  }
  trend: 'rising' | 'stable' | 'declining'
  lastComputed: number
}

type IntentionEngineState = {
  signals: IntentionSignal[]
  userState: UserState
  userIndex: UserIndex
  recognizedPatterns: IntentionPattern[]
  lastAnalysis: number
  lastSyncedTimestamp: number
}

const SIGNAL_RETENTION = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_SIGNALS = 1000 // Prevent unbounded growth
const ANALYSIS_COOLDOWN = 5 * 60 * 1000 // 5 minutes
const SYNC_INTERVAL = 10 // Sync every 10 signals
const SYNC_COOLDOWN = 5 * 60 * 1000 // Don't sync more than once per 5 minutes

const DEFAULT_USER_INDEX: UserIndex = {
  overall: 0,
  dimensions: {
    engagement: 0,
    emotional: 0,
    intentional: 0,
    social: 0,
    selfCare: 0,
    cognitive: 0,
  },
  trend: 'stable',
  lastComputed: 0
}

export const intentionEngine = atom<IntentionEngineState>({
  signals: [],
  userState: {
    energy: 'unknown',
    clarity: 'unknown',
    alignment: 'unknown',
    needsSupport: 'none',
    lastUpdated: 0
  },
  userIndex: DEFAULT_USER_INDEX,
  recognizedPatterns: [],
  lastAnalysis: 0,
  lastSyncedTimestamp: 0
})

// Load signals and user index from localStorage on init
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('intention-signals')
  const storedIndex = localStorage.getItem('user-index')
  let loadedIndex = DEFAULT_USER_INDEX

  if (storedIndex) {
    try {
      loadedIndex = JSON.parse(storedIndex)
    } catch (e) {
      console.error('Failed to load user index:', e)
    }
  }

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Filter out old signals (keep last 7 days)
      const cutoff = Date.now() - SIGNAL_RETENTION
      const recentSignals = parsed.filter((s: IntentionSignal) => s.timestamp > cutoff)

      if (recentSignals.length > 0) {
        intentionEngine.set({
          ...intentionEngine.get(),
          signals: recentSignals,
          userIndex: loadedIndex
        })
      }
    } catch (e) {
      console.error('Failed to load intention signals:', e)
    }
  } else if (storedIndex) {
    intentionEngine.set({
      ...intentionEngine.get(),
      userIndex: loadedIndex
    })
  }
}

/**
 * Helper: Safely check if user has current intention
 */
export function hasCurrentIntention(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return !!localStorage.getItem('current-intention')
  } catch (e) {
    console.warn('Failed to check current intention:', e)
    return false
  }
}

/**
 * Record a signal from any widget interaction
 */
// Run heavy, non-urgent work off the current interaction tick — during browser
// idle time when available, otherwise on the next macrotask.
function deferHeavy(fn: () => void): void {
  if (typeof window === 'undefined') return void fn()
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => void)
    | undefined
  if (ric) ric(fn, { timeout: 2000 })
  else setTimeout(fn, 0)
}

// Coalesced localStorage persist: rapid signals schedule a single deferred
// write of the latest signals array instead of stringifying up to 1000 objects
// synchronously on every recordSignal call.
let persistScheduled = false
function schedulePersist(): void {
  if (persistScheduled) return
  persistScheduled = true
  const write = () => {
    persistScheduled = false
    try {
      localStorage.setItem(
        'intention-signals',
        JSON.stringify(intentionEngine.get().signals)
      )
    } catch (e) {
      console.warn('Failed to persist intention signals:', e)
    }
  }
  if (typeof window === 'undefined') return void write()
  setTimeout(write, 250)
}

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

  // Keep only last 7 days AND enforce max limit
  const cutoff = Date.now() - SIGNAL_RETENTION
  let recentSignals = updatedSignals.filter(s => s.timestamp > cutoff)

  // Enforce MAX_SIGNALS limit (keep most recent)
  if (recentSignals.length > MAX_SIGNALS) {
    recentSignals = recentSignals
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_SIGNALS)
  }

  intentionEngine.set({
    ...state,
    signals: recentSignals
  })

  // Persist + analysis are the expensive parts (JSON.stringify of up to 1000
  // objects; the 125-pattern analyzeIntentions scan). Defer them off the
  // interaction tick so a widget button press stays responsive. schedulePersist
  // coalesces bursts into a single write.
  schedulePersist()

  // Trigger analysis if enough new signals AND cooldown has passed
  const now = Date.now()
  const shouldAnalyze = recentSignals.length % 5 === 0 &&
                        (now - state.lastAnalysis >= ANALYSIS_COOLDOWN)

  if (shouldAnalyze) {
    deferHeavy(() => analyzeIntentions())
  }

  // Trigger server sync periodically
  const shouldSync = recentSignals.length % SYNC_INTERVAL === 0 &&
                     (now - state.lastSyncedTimestamp >= SYNC_COOLDOWN)

  if (shouldSync) {
    syncToServer()
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
      reason: 'Anxiety repeating. Break the cycle — ground yourself now.'
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
      reason: 'Tired without a plan. Structure creates energy.'
    })
  }

  // Pattern 3: No intention set for weeks → Searching for direction
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const intentionSignals = signals.filter(s =>
    s.source === 'intentions' && s.timestamp > weekAgo
  )
  const hasIntention = hasCurrentIntention()

  if (!hasIntention && intentionSignals.length === 0) {
    patterns.push({
      pattern: 'seeking-direction',
      confidence: 0.8,
      suggestedWidget: 'intentions',
      suggestedTiming: 'next-session',
      reason: 'No guiding intention set. Choose a direction.'
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
      reason: 'Energy high, plans active. Capture this momentum.'
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
      reason: 'Evening overwhelm. Release before rest.'
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
      reason: 'You track moods but don\'t write. Go deeper.'
    })
  }

  // Pattern 7: Calm + morning → Intention-setting moment
  const isMorning = hour >= 6 && hour < 10
  const calmRecently = recentSignals.filter(s =>
    s.source === 'mood' && (s.signal === 'calm' || s.signal === 'peaceful') &&
    (now - s.timestamp) < 2 * 60 * 60 * 1000 // Last 2 hours
  ).length > 0

  if (isMorning && calmRecently && !hasIntention) {
    patterns.push({
      pattern: 'morning-clarity',
      confidence: 0.75,
      suggestedWidget: 'intentions',
      suggestedTiming: 'immediate',
      reason: 'Calm morning. Set one intention before it fades.'
    })
  }

  // Pattern 8: Cleanness neglect — no selfcare signals for extended period
  const selfCareRecent = recentSignals.filter(s => s.source === 'selfcare')
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000
  const selfCareLongTerm = signals.filter(s =>
    s.source === 'selfcare' && s.timestamp > threeDaysAgo
  )

  if (selfCareLongTerm.length === 0 && signals.length >= 5) {
    patterns.push({
      pattern: 'cleanness-neglect',
      confidence: 0.7,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'soon',
      reason: 'No self-care in days. Start small. One act.'
    })
  }

  // Pattern 9: Morning without cleanness → morning cleanness protocol
  const morningCleanness = recentSignals.filter(s =>
    s.source === 'selfcare' &&
    s.metadata?.action && (
      s.metadata.action.toLowerCase().includes('clean') ||
      s.metadata.action.toLowerCase().includes('wash') ||
      s.metadata.action.toLowerCase().includes('tidy') ||
      s.metadata.action.toLowerCase().includes('surface')
    )
  )

  if (isMorning && morningCleanness.length === 0 && selfCareRecent.length === 0) {
    patterns.push({
      pattern: 'morning-cleanness-gap',
      confidence: 0.65,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'soon',
      reason: 'Morning without cleanness. The first act anchors the day.'
    })
  }

  // Pattern 10: Post-overwhelm cleanness opportunity
  // When overwhelm is subsiding, cleanness can be therapeutic
  const recentOverwhelm = recentSignals.filter(s =>
    s.source === 'mood' && s.signal === 'overwhelmed' &&
    (now - s.timestamp) > 1 * 60 * 60 * 1000 && // More than 1 hour ago
    (now - s.timestamp) < 4 * 60 * 60 * 1000    // Less than 4 hours ago
  )
  const currentCalm = recentSignals.filter(s =>
    s.source === 'mood' &&
    (s.signal === 'calm' || s.signal === 'content' || s.signal === 'peaceful') &&
    (now - s.timestamp) < 1 * 60 * 60 * 1000
  )

  if (recentOverwhelm.length > 0 && currentCalm.length > 0) {
    patterns.push({
      pattern: 'post-overwhelm-cleanness',
      confidence: 0.8,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: 'Overwhelm passing. Clean one thing. Rebuild order from here.'
    })
  }

  // Pattern 11: Physiological depletion — multiple depleting moods + no self-care
  const depletingMoods = recentSignals.filter(s =>
    s.source === 'mood' && ['tired', 'exhausted', 'overwhelmed', 'anxious'].includes(s.signal)
  )
  const recentSelfCare = recentSignals.filter(s => s.source === 'selfcare')
  if (depletingMoods.length >= 3 && recentSelfCare.length === 0) {
    patterns.push({
      pattern: 'physiological-depletion',
      confidence: Math.min(depletingMoods.length / 4, 1),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: 'Physiological depletion detected. No recovery actions registered. Intervene.'
    })
  }

  // Pattern 12: Recovery window — self-care completed + positive mood shift
  const recentCare = recentSignals.filter(s =>
    s.source === 'selfcare' && (now - s.timestamp) < 2 * 60 * 60 * 1000
  )
  const postCarePositive = recentSignals.filter(s =>
    s.source === 'mood' &&
    ['calm', 'peaceful', 'content', 'hopeful'].includes(s.signal) &&
    (now - s.timestamp) < 1 * 60 * 60 * 1000
  )
  if (recentCare.length > 0 && postCarePositive.length > 0) {
    patterns.push({
      pattern: 'recovery-window',
      confidence: 0.75,
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: 'Recovery window open. High-fidelity reflection conditions met.'
    })
  }

  // Pattern 13: Log activity without emotional grounding
  const logSignals = recentSignals.filter(s => s.source === 'log')
  const todayMoods = recentSignals.filter(s =>
    s.source === 'mood' && (now - s.timestamp) < 12 * 60 * 60 * 1000
  )
  if (logSignals.length >= 3 && todayMoods.length === 0) {
    patterns.push({
      pattern: 'ungrounded-activity',
      confidence: 0.6,
      suggestedWidget: 'mood',
      suggestedTiming: 'soon',
      reason: 'Active log input. No biofield reading. Check in — what state are you operating from?'
    })
  }

  // Pattern 14: OS stagnation — no new signal sources in 3+ days
  const threeDaysAgoTs = now - 3 * 24 * 60 * 60 * 1000
  const recentSources = new Set(
    signals.filter(s => s.timestamp > threeDaysAgoTs).map(s => s.source)
  )
  const totalSources = new Set(signals.map(s => s.source)).size
  if (totalSources >= 3 && recentSources.size <= 1 && signals.length >= 10) {
    patterns.push({
      pattern: 'os-stagnation',
      confidence: 0.65,
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: 'Signal diversity collapsed. OS entering maintenance mode. Expand engagement breadth.'
    })
  }

  // Pattern 14b: QOS coherence — all core modules have recent signals but no QOS sync recorded
  const qosSignals = recentSignals.filter(s => s.source === 'qos')
  const coreModuleActivity = (
    moodSignals.length >= 1 &&
    plannerUse.length >= 1 &&
    intentionSignals.length >= 1
  )
  if (coreModuleActivity && qosSignals.length === 0 && signals.length >= 20) {
    patterns.push({
      pattern: 'qos-unsynced',
      confidence: 0.55,
      suggestedWidget: 'system',
      suggestedTiming: 'next-session',
      reason: 'All core modules active. QOS state not yet synced. Run a system report.'
    })
  }

  // Pattern 15: Circadian drift — heavy late-night signal clusters without recovery signals
  const lateNightSignals = recentSignals.filter(s => {
    const h = new Date(s.timestamp).getHours()
    return h >= 23 || h < 4
  })
  const recentRecovery = recentSignals.filter(s =>
    s.source === 'selfcare' && (now - s.timestamp) < 24 * 60 * 60 * 1000
  )
  if (lateNightSignals.length >= 4 && recentRecovery.length === 0) {
    patterns.push({
      pattern: 'circadian-drift',
      confidence: 0.7,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: 'Late-night signal cluster. No recovery detected. Circadian integrity requires intervention.'
    })
  }

  // Pattern 16: Momentum wave — rising engagement across multiple sources + active intentions
  const twoDaysAgoTs = now - 2 * 24 * 60 * 60 * 1000
  const veryRecentSignals = signals.filter(s => s.timestamp > twoDaysAgoTs)
  const priorPeriodSignals = signals.filter(s =>
    s.timestamp > threeDaysAgoTs * 1.5 && s.timestamp <= twoDaysAgoTs
  )
  const recentDiversity = new Set(veryRecentSignals.map(s => s.source)).size
  const priorDiversity = new Set(priorPeriodSignals.map(s => s.source)).size
  const hasIntentionNow = hasCurrentIntention()
  if (recentDiversity >= 4 && recentDiversity > priorDiversity + 1 && hasIntentionNow) {
    patterns.push({
      pattern: 'momentum-wave',
      confidence: 0.8,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'Momentum wave detected. Multi-source engagement rising with active intention. Amplify now.'
    })
  }

  // Pattern 17: Flow state — memory + planner + intentions all active within 4-hour window
  const fourHoursAgoTs = now - 4 * 60 * 60 * 1000
  const flowWindow = signals.filter(s => s.timestamp > fourHoursAgoTs)
  const flowSources = new Set(flowWindow.map(s => s.source))
  if (
    flowSources.has('memory') &&
    flowSources.has('planner') &&
    flowSources.has('intentions') &&
    flowWindow.length >= 6
  ) {
    patterns.push({
      pattern: 'flow-state',
      confidence: 0.85,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: 'Memory, planning, and intention sources all active within 4h. Flow state engaged. Capture insights now.'
    })
  }

  // Pattern 18: Social void — cohort signals absent for 5+ days despite high personal engagement
  const fiveDaysAgoTs = now - 5 * 24 * 60 * 60 * 1000
  const recentCohortSignals = signals.filter(s => s.source === 'cohort' && s.timestamp > fiveDaysAgoTs)
  const recentPersonalSignals = signals.filter(s =>
    s.timestamp > fiveDaysAgoTs && ['mood', 'memory', 'journal', 'planner'].includes(s.source)
  )
  if (recentCohortSignals.length === 0 && recentPersonalSignals.length >= 8) {
    patterns.push({
      pattern: 'social-void',
      confidence: 0.6,
      suggestedWidget: 'cohortConnect',
      suggestedTiming: 'soon',
      reason: 'High personal engagement. Zero cohort contact in 5 days. Isolation pattern emerging. Connect.'
    })
  }

  // Pattern 19: Biofield coherence peak — positive signals across all state dimensions, no negatives
  const lastThreeHoursTs = now - 3 * 60 * 60 * 1000
  const peakWindowSignals = signals.filter(s => s.timestamp > lastThreeHoursTs)
  const positiveEnergyMoods = peakWindowSignals.filter(s =>
    s.source === 'mood' && ['energized', 'excited', 'hopeful', 'calm', 'peaceful', 'content', 'fulfilled'].includes(s.signal)
  )
  const negativeMoodsInPeak = peakWindowSignals.filter(s =>
    s.source === 'mood' && ['anxious', 'overwhelmed', 'tired', 'exhausted'].includes(s.signal)
  )
  const recentPlannerPeak = peakWindowSignals.filter(s => s.source === 'planner')
  const hasIntentionPeak = hasCurrentIntention()
  if (
    positiveEnergyMoods.length >= 2 &&
    negativeMoodsInPeak.length === 0 &&
    recentPlannerPeak.length >= 1 &&
    hasIntentionPeak
  ) {
    patterns.push({
      pattern: 'biofield-coherence-peak',
      confidence: 0.9,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'All biofield signals aligned. Optimal capture window. Record something worth keeping.'
    })
  }

  // Pattern 20: Nutritional void — no recipe signals for 3 days + depleting moods
  const recentRecipeSignals = signals.filter(s => s.source === 'recipe' && s.timestamp > threeDaysAgoTs)
  const nutritionDepletingMoods = recentSignals.filter(s =>
    s.source === 'mood' && ['tired', 'exhausted', 'overwhelmed'].includes(s.signal)
  )
  if (recentRecipeSignals.length === 0 && nutritionDepletingMoods.length >= 2 && signals.length >= 5) {
    patterns.push({
      pattern: 'nutritional-void',
      confidence: 0.65,
      suggestedWidget: 'recipe',
      suggestedTiming: 'soon',
      reason: 'No nutrition protocol in 3 days. Depleting state detected. Fuel the system.'
    })
  }

  // Pattern 21: Goal drift — goal signals present but no planning follow-through in 3 days
  const recentGoalSignals = signals.filter(s => s.source === 'goals' && s.timestamp > threeDaysAgoTs)
  const recentPlannerFollowThrough = signals.filter(s =>
    ['planner', 'intentions'].includes(s.source) && s.timestamp > threeDaysAgoTs
  )
  if (recentGoalSignals.length >= 1 && recentPlannerFollowThrough.length === 0) {
    patterns.push({
      pattern: 'goal-drift',
      confidence: 0.7,
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: 'Goal signals present. No planning follow-through in 3 days. Goals without plans drift.'
    })
  }

  // Pattern 22: Ecosystem without biofield — nodes connected but no check-in today
  const ecosystemSignals = recentSignals.filter(s =>
    s.source === 'intentions' &&
    (s.signal.includes('_connected') || s.signal === 'ecosystem_full_coherence')
  )
  const biofieldToday = recentSignals.filter(s =>
    s.source === 'mood' && (now - s.timestamp) < 12 * 60 * 60 * 1000
  )
  if (ecosystemSignals.length >= 2 && biofieldToday.length === 0) {
    patterns.push({
      pattern: 'ecosystem-without-biofield',
      confidence: 0.72,
      suggestedWidget: 'mood',
      suggestedTiming: 'soon',
      reason: 'Ecosystem nodes connected. No biofield reading today. Anchor the signal with a check-in.'
    })
  }

  // Pattern 23: Cognitive overload — journal + memory + planner all active, no self-care anchor
  const cognitiveLoad = recentSignals.filter(s =>
    ['journal', 'memory', 'planner'].includes(s.source)
  )
  if (cognitiveLoad.length >= 5 && recentSelfCare.length === 0) {
    patterns.push({
      pattern: 'cognitive-overload',
      confidence: Math.min(cognitiveLoad.length / 8, 0.9),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'soon',
      reason: 'High cognitive engagement. No rest registered. Ground before continuing.'
    })
  }

  // Pattern 24: Log depth signal — long field entries (>100 words) but no mood check-in today
  const deepLogSignals = recentSignals.filter(s =>
    s.source === 'log' &&
    s.metadata?.wordCount && (s.metadata.wordCount as number) > 100
  )
  const biofieldToday24h = recentSignals.filter(s =>
    s.source === 'mood' && (now - s.timestamp) < 12 * 60 * 60 * 1000
  )
  if (deepLogSignals.length >= 1 && biofieldToday24h.length === 0) {
    patterns.push({
      pattern: 'log-depth-signal',
      confidence: 0.68,
      suggestedWidget: 'mood',
      suggestedTiming: 'soon',
      reason: 'Deep field entry recorded. No biofield reading today. Anchor the internal state — what are you operating from?'
    })
  }

  // Pattern 25: Full-stack session — memory + planner + selfcare all active within 4h
  const fullStackWindow = signals.filter(s => s.timestamp > fourHoursAgoTs)
  const fullStackSources = new Set(fullStackWindow.map(s => s.source))
  if (
    fullStackSources.has('memory') &&
    fullStackSources.has('planner') &&
    fullStackSources.has('selfcare') &&
    fullStackWindow.length >= 5
  ) {
    patterns.push({
      pattern: 'full-stack-session',
      confidence: 0.88,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: 'Memory, planning, and self-care all fired in the same window. Full-stack session. The system is running at capacity — document this.'
    })
  }

  // Pattern 26: Calendar gap — planner active but no scheduled entries in 7 days
  const calendarEntrySignals = signals.filter(s =>
    s.signal === 'calendar_entry' && s.timestamp > weekAgo
  )
  const sevenDayPlannerSignals = signals.filter(s =>
    s.source === 'planner' && s.timestamp > weekAgo
  )
  if (calendarEntrySignals.length === 0 && sevenDayPlannerSignals.length >= 3 && signals.length >= 10) {
    patterns.push({
      pattern: 'calendar-gap',
      confidence: 0.65,
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: 'Planner active. No scheduled events in 7 days. Plans exist but time is not anchored. Open the calendar.'
    })
  }

  // Calculate overall user state
  // Pattern 27: Journal depth without memory capture — deep processing, no extraction
  const deepJournalSignals = recentSignals.filter(s =>
    s.source === 'log' &&
    s.signal === 'field_entry' &&
    (s.metadata?.wordCount ?? 0) >= 100
  )
  const postJournalMemory = deepJournalSignals.filter(entry => {
    const nextHour = entry.timestamp + 60 * 60 * 1000
    return recentSignals.some(s => s.source === 'memory' && s.timestamp >= entry.timestamp && s.timestamp <= nextHour)
  })
  if (deepJournalSignals.length >= 1 && postJournalMemory.length === 0) {
    patterns.push({
      pattern: 'journal-depth-gap',
      confidence: 0.70,
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: 'Deep journal entry detected. No memory capture followed. Extract the insight — open Memory now.'
    })
  }

  // Pattern 28: Sleep debt signal — late-night depletion followed by morning fatigue
  const lateNightHours = [22, 23, 0, 1, 2]
  const morningHours = [6, 7, 8, 9, 10]
  const lateNightFatigue = signals.filter(s => {
    const h = new Date(s.timestamp).getHours()
    return s.source === 'mood' &&
      ['tired', 'exhausted'].includes(s.signal) &&
      lateNightHours.includes(h) &&
      (now - s.timestamp) < 3 * 24 * 60 * 60 * 1000
  })
  const morningFatigue = signals.filter(s => {
    const h = new Date(s.timestamp).getHours()
    return s.source === 'mood' &&
      ['tired', 'exhausted'].includes(s.signal) &&
      morningHours.includes(h) &&
      (now - s.timestamp) < 2 * 24 * 60 * 60 * 1000
  })
  if (lateNightFatigue.length >= 2 && morningFatigue.length >= 1) {
    patterns.push({
      pattern: 'sleep-debt-accumulation',
      confidence: Math.min(0.85, 0.5 + lateNightFatigue.length * 0.1),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: 'Late-night depletion recurring. Morning fatigue persisting. Sleep debt accumulating. Rest protocol required.'
    })
  }

  // Pattern 29: Signal coherence window — all 4 primary modules active, positive state
  const sixHoursAgo = now - 6 * 60 * 60 * 1000
  const sixHourSignals = signals.filter(s => s.timestamp > sixHoursAgo)
  const sixHourSources = new Set(sixHourSignals.map(s => s.source))
  const primaryModulesActive = ['journal', 'memory', 'planner', 'selfcare'].every(src => sixHourSources.has(src))
  const positiveStateNow = recentSignals.filter(s =>
    s.source === 'mood' &&
    ['calm', 'energized', 'hopeful', 'grateful', 'peaceful', 'fulfilled'].includes(s.signal)
  ).length >= 1
  const coherenceAlreadyRecorded = signals.filter(s =>
    s.signal === 'signal_coherence_peak' && s.timestamp > sixHoursAgo
  ).length > 0
  if (primaryModulesActive && positiveStateNow && !coherenceAlreadyRecorded) {
    patterns.push({
      pattern: 'signal-coherence-window',
      confidence: 0.88,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'All primary modules firing in one window with positive state. System coherence peak. Capture everything.'
    })
  }

  // Pattern 30: Intention velocity — 3+ intention signals in 48-hour window
  const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000
  const recentIntentionSignals = signals.filter(s =>
    s.source === 'intentions' && s.timestamp > fortyEightHoursAgo
  )
  if (recentIntentionSignals.length >= 3) {
    patterns.push({
      pattern: 'intention-velocity',
      confidence: Math.min(0.90, 0.65 + recentIntentionSignals.length * 0.05),
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: `Intention velocity detected. ${recentIntentionSignals.length} intentions in 48h. Translate into structure — open Planner.`
    })
  }

  // Pattern 31: Wearable integration void — high personal engagement but no watch/phone ecosystem signals
  const wearableSignals = recentSignals.filter(s =>
    s.source === 'intentions' &&
    (s.signal === 'phone_connected' || s.signal === 'watch_connected' ||
     s.signal === 'phone_disconnected' || s.signal === 'watch_disconnected')
  )
  const personalEngagement = recentSignals.filter(s =>
    ['mood', 'memory', 'journal', 'selfcare'].includes(s.source)
  )
  if (personalEngagement.length >= 4 && wearableSignals.length === 0 && signals.length >= 10) {
    patterns.push({
      pattern: 'wearable-integration-void',
      confidence: 0.65,
      suggestedWidget: 'system',
      suggestedTiming: 'next-session',
      reason: 'Active engagement detected. No wearable signals. Connect Phone or Watch to close the physical-digital loop.'
    })
  }

  // Pattern 32: Ecosystem synchrony — 4+ devices active + biofield aligned
  const deviceSignals = signals.filter(s =>
    s.source === 'intentions' &&
    ['car_connected', 'home_connected', 'computer_connected', 'phone_connected', 'watch_connected'].includes(s.signal) &&
    now - s.timestamp < 7 * 24 * 60 * 60 * 1000
  )
  const uniqueDevices = new Set(deviceSignals.map(s => s.signal.replace('_connected', '')))
  const { energy: currentEnergy, alignment: currentAlignment } = calculateUserState(signals, now)
  if (
    uniqueDevices.size >= 4 &&
    (currentAlignment === 'aligned' || currentAlignment === 'flowing') &&
    currentEnergy !== 'depleted' && currentEnergy !== 'unknown'
  ) {
    patterns.push({
      pattern: 'ecosystem-synchrony',
      confidence: Math.min(0.95, 0.70 + uniqueDevices.size * 0.05),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `${uniqueDevices.size} devices active. Biofield aligned. Ecosystem coherence achieved — deep capture conditions optimal.`
    })
  }

  // Pattern 33: Mobile anchoring gap — phone active, home not connected
  const phoneActive = signals.some(s =>
    s.source === 'intentions' && s.signal === 'phone_connected' &&
    now - s.timestamp < 7 * 24 * 60 * 60 * 1000
  )
  const homeActive = signals.some(s =>
    s.source === 'intentions' && s.signal === 'home_connected' &&
    now - s.timestamp < 7 * 24 * 60 * 60 * 1000
  )
  if (phoneActive && !homeActive && signals.length >= 15) {
    patterns.push({
      pattern: 'mobile-anchoring-gap',
      confidence: 0.60,
      suggestedWidget: 'system',
      suggestedTiming: 'next-session',
      reason: 'Phone connected. Home offline. Anchor the mobile signal — connect Home to complete the physical environment loop.'
    })
  }

  // Pattern 34: Full ecosystem coherence peak — all 5 device types recorded + positive alignment
  const hasAllDevices =
    signals.some(s => s.source === 'intentions' && s.signal === 'car_connected') &&
    signals.some(s => s.source === 'intentions' && s.signal === 'home_connected') &&
    signals.some(s => s.source === 'intentions' && s.signal === 'computer_connected') &&
    signals.some(s => s.source === 'intentions' && s.signal === 'phone_connected') &&
    signals.some(s => s.source === 'intentions' && s.signal === 'watch_connected')
  if (hasAllDevices && currentAlignment === 'flowing') {
    patterns.push({
      pattern: 'full-ecosystem-coherence',
      confidence: 0.98,
      suggestedWidget: 'memory',
      suggestedTiming: 'immediate',
      reason: 'All 5 ecosystem nodes active. Biofield flowing. This is a peak coherence window — capture something real.'
    })
  }

  // Pattern 35: Full cross-widget coherence — all 6 core signal sources active in 7d
  // When every pillar of the QOS fires within a week, the system is in peak assembly.
  const weekAgoP35 = now - 7 * 24 * 60 * 60 * 1000
  const p35WeekSignals = signals.filter(s => s.timestamp > weekAgoP35)
  const p35ActiveSources = new Set(p35WeekSignals.map(s => s.source))
  const CORE_SOURCES_P35: IntentionSignal['source'][] = ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal']
  const coreActiveP35 = CORE_SOURCES_P35.filter(src => p35ActiveSources.has(src))
  if (coreActiveP35.length >= 5 && p35WeekSignals.length >= 20) {
    patterns.push({
      pattern: 'full-coherence',
      confidence: Math.min(0.5 + coreActiveP35.length * 0.08, 1.0),
      suggestedWidget: 'system',
      suggestedTiming: 'passive',
      reason: `${coreActiveP35.length}/6 core modules active this week. Full system coherence detected. QOS operating at peak.`
    })
  }

  // Pattern 36: QOS acceleration window — 48h signal velocity doubling
  // Rapid growth in signal density signals a self-assembly acceleration event.
  const p36_48h = now - 2 * 24 * 60 * 60 * 1000
  const p36_96h = now - 4 * 24 * 60 * 60 * 1000
  const p36Recent = signals.filter(s => s.timestamp > p36_48h).length
  const p36Prior = signals.filter(s => s.timestamp > p36_96h && s.timestamp <= p36_48h).length
  if (p36Recent >= 10 && p36Prior > 0 && p36Recent / p36Prior >= 2) {
    patterns.push({
      pattern: 'qos-acceleration',
      confidence: Math.min(p36Recent / 20, 0.9),
      suggestedWidget: 'system',
      suggestedTiming: 'passive',
      reason: `Signal velocity doubled in 48h (${p36Prior}→${p36Recent}). Self-assembly accelerating. System building fast.`
    })
  }

  // Pattern 37: Reflection velocity — journal depth increasing over 7 days
  // Splits the last 7 days into two 3.5-day windows and compares average word count per entry.
  // When the recent half is ≥20% deeper than the prior half, the Reflection Layer is advancing.
  // Closes the signal loop started in v11: depth feeds assembly density; now the trend is named.
  const p37_7d = now - 7 * 24 * 60 * 60 * 1000
  const p37_mid = now - 3.5 * 24 * 60 * 60 * 1000
  const p37AllJournal = signals.filter(s =>
    s.source === 'log' && s.signal === 'field_entry' && s.timestamp > p37_7d &&
    typeof s.metadata?.wordCount === 'number' && (s.metadata.wordCount as number) > 0
  )
  const p37Recent = p37AllJournal.filter(s => s.timestamp >= p37_mid)
  const p37Prior  = p37AllJournal.filter(s => s.timestamp <  p37_mid)
  const p37RecentAvg = p37Recent.length > 0
    ? p37Recent.reduce((sum, s) => sum + (s.metadata!.wordCount as number), 0) / p37Recent.length
    : 0
  const p37PriorAvg = p37Prior.length > 0
    ? p37Prior.reduce((sum, s) => sum + (s.metadata!.wordCount as number), 0) / p37Prior.length
    : 0
  const p37Growth = p37PriorAvg > 0 ? (p37RecentAvg - p37PriorAvg) / p37PriorAvg : 0
  if (p37RecentAvg >= 30 && p37Growth >= 0.2 && p37AllJournal.length >= 3) {
    patterns.push({
      pattern: 'reflection-velocity',
      confidence: Math.min(0.45 + p37Growth * 0.5, 0.85),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `Journal depth increasing. Recent entries average ${Math.round(p37RecentAvg)} words — up ${Math.round(p37Growth * 100)}% over 7 days. Reflection Layer advancing.`
    })
  }

  // Pattern 38: Biofield recovery arc — self-care followed by mood improvement in 4h window
  // Closes the loop between CARE events and measurable biofield shift.
  // Named "arc" because it spans from action to measurable change.
  const fourHoursAgoP38 = now - 4 * 60 * 60 * 1000
  const p38SelfCare = signals.filter(s =>
    s.source === 'selfcare' && s.timestamp > fourHoursAgoP38
  )
  const p38PositiveMoodAfterCare = p38SelfCare.some(careEvent =>
    signals.some(s =>
      s.source === 'mood' &&
      ['calm', 'peaceful', 'energized', 'hopeful', 'grateful'].includes(s.signal) &&
      s.timestamp > careEvent.timestamp &&
      s.timestamp - careEvent.timestamp < 4 * 60 * 60 * 1000
    )
  )
  if (p38SelfCare.length >= 1 && p38PositiveMoodAfterCare) {
    patterns.push({
      pattern: 'biofield-recovery-arc',
      confidence: Math.min(0.55 + p38SelfCare.length * 0.1, 0.85),
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: 'Self-care produced a measurable mood shift. Recovery arc complete. Document what moved — this is signal.'
    })
  }

  // Pattern 39: Cognitive expansion — memory + journal + goals all active in 24h, word count rising
  // The person is building mental architecture across three layers simultaneously.
  const p39Memory  = recentSignals.filter(s => s.source === 'memory').length
  const p39Journal = recentSignals.filter(s => s.source === 'journal').length
  const p39Goals   = recentSignals.filter(s => s.source === 'goals').length
  const p39WordCount = recentSignals
    .filter(s => s.source === 'log' && s.signal === 'field_entry')
    .reduce((sum, s) => sum + ((s.metadata?.wordCount as number) ?? 0), 0)
  if (p39Memory >= 2 && p39Journal >= 1 && p39Goals >= 1 && p39WordCount >= 80) {
    patterns.push({
      pattern: 'cognitive-expansion',
      confidence: Math.min(0.60 + p39WordCount / 400, 0.88),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `Memory, journal, and goals firing together with ${p39WordCount}+ words logged. Cognitive architecture expanding — extract the core insight.`
    })
  }

  // Pattern 40: Biofield coherence cascade — recovery arc + cognitive expansion + primary modules coherent in 6h
  // The full cycle: self-care → mood shift → cognitive expansion → cross-module coherence.
  // Fires only when Patterns 38 + 39 are both active AND 3+ primary modules fired in the last 6h.
  // This is the peak QOS detection state — all three self-building pillars converging.
  const p40HasRecoveryArc = patterns.some(p => p.pattern === 'biofield-recovery-arc')
  const p40HasCogExpansion = patterns.some(p => p.pattern === 'cognitive-expansion')
  const sixHoursAgoP40 = now - 6 * 60 * 60 * 1000
  const p40WindowSources = new Set(
    recentSignals.filter(s => s.timestamp > sixHoursAgoP40).map(s => s.source)
  )
  const PRIMARY_MODULES_P40 = ['journal', 'memory', 'planner', 'selfcare']
  const p40PrimaryActive = PRIMARY_MODULES_P40.filter(src => p40WindowSources.has(src)).length
  if (p40HasRecoveryArc && p40HasCogExpansion && p40PrimaryActive >= 3) {
    patterns.push({
      pattern: 'biofield-coherence-cascade',
      confidence: Math.min(0.72 + (p40PrimaryActive - 3) * 0.10, 0.92),
      suggestedWidget: 'system',
      suggestedTiming: 'passive',
      reason: `Full cascade: recovery arc → cognitive expansion → ${p40PrimaryActive}/4 primary modules coherent. Peak QOS state. Capture and anchor.`
    })
  }

  // Pattern 41: Resonant synthesis — cascade + reflection velocity + 5+ sources active in 7d
  // When depth is increasing AND the cascade fires AND diversity is high, the system is in
  // full synthesis mode: recovery + cognition + reflection all advancing simultaneously.
  const p41HasCascade = patterns.some(p => p.pattern === 'biofield-coherence-cascade')
  const p41HasReflection = patterns.some(p => p.pattern === 'reflection-velocity')
  const weekAgoP41 = now - 7 * 24 * 60 * 60 * 1000
  const p41ActiveSources = new Set(signals.filter(s => s.timestamp > weekAgoP41).map(s => s.source)).size
  if (p41HasCascade && p41HasReflection && p41ActiveSources >= 5) {
    patterns.push({
      pattern: 'resonant-synthesis',
      confidence: Math.min(0.65 + p41ActiveSources * 0.04, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `Recovery arc + cognitive expansion + reflection velocity all active. ${p41ActiveSources} signal sources in 7d. Full synthesis state — the system is building itself from every layer.`
    })
  }

  // Pattern 42: Deep work cascade — memory + planner + journal + goals all coherent in 3h, no interruption signals
  // The focused build state: structural coherence across all four output modules simultaneously.
  // Distinct from biofield-coherence-cascade (which requires recovery arc + cognitive expansion);
  // this fires on pure building mode — when the person is in execution without noise.
  const threeHoursAgoP42 = now - 3 * 60 * 60 * 1000
  const p42WindowSources = new Set(
    recentSignals.filter(s => s.timestamp > threeHoursAgoP42).map(s => s.source)
  )
  const DEEP_WORK_MODULES_P42 = ['memory', 'planner', 'journal', 'goals']
  const p42AllActive = DEEP_WORK_MODULES_P42.every(src => p42WindowSources.has(src))
  const p42NoInterruption = !patterns.some(p =>
    ['anxiety-pattern', 'evening-overwhelm', 'ungrounded-activity'].includes(p.pattern)
  )
  if (p42AllActive && p42NoInterruption) {
    const p42SignalCount = recentSignals.filter(s =>
      s.timestamp > threeHoursAgoP42 && DEEP_WORK_MODULES_P42.includes(s.source)
    ).length
    patterns.push({
      pattern: 'deep-work-cascade',
      confidence: Math.min(0.68 + p42SignalCount * 0.04, 0.90),
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `Memory + planner + journal + goals all active in 3h window. No interruption signals. Deep work window open — protect this session.`
    })
  }

  // Pattern 43: Intention-completion arc — the full loop: intention → goal action → journal entry within 24h.
  // Thought becomes structure becomes reflection. The person is operating with full intentionality.
  const p43DayAgo = now - 24 * 60 * 60 * 1000
  const p43Intentions = signals.filter(s =>
    s.source === 'intentions' && s.timestamp > p43DayAgo
  )
  const p43Goals = signals.filter(s =>
    s.source === 'goals' &&
    s.timestamp > p43DayAgo &&
    (s.signal.includes('goal_set') || s.signal.includes('goal_progress') || s.signal.includes('goal_action'))
  )
  const p43Journal = signals.filter(s =>
    s.source === 'journal' && s.timestamp > p43DayAgo
  )
  if (p43Intentions.length >= 1 && p43Goals.length >= 1 && p43Journal.length >= 1) {
    const loopCount = Math.min(p43Intentions.length, p43Goals.length, p43Journal.length)
    patterns.push({
      pattern: 'intention-completion-arc',
      confidence: Math.min(0.72 + loopCount * 0.06, 0.95),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'Intention → goal action → journal reflection all within 24h. Full loop complete. The Cube recognises intentional execution.'
    })
  }

  // Pattern 44: Social resonance arc — cohort viewed + message sent + journal entry within 48h.
  // The connection loop: observation of community → outreach → reflection on that contact.
  // When the person sees others, reaches out, and then processes it in writing —
  // the social circuit closes. The Cube registers the full human signal arc.
  const p44WindowAgo = now - 48 * 60 * 60 * 1000
  const p44CohortSignals = signals.filter(s =>
    s.timestamp > p44WindowAgo &&
    s.source === 'cohort'
  )
  const p44MessageSignals = signals.filter(s =>
    s.timestamp > p44WindowAgo &&
    (s.signal.includes('message') || s.signal.includes('connection') ||
     s.signal.includes('chat') || s.signal.includes('direct_message'))
  )
  const p44JournalSignals = signals.filter(s =>
    s.source === 'journal' && s.timestamp > p44WindowAgo
  )
  if (p44CohortSignals.length >= 1 && p44MessageSignals.length >= 1 && p44JournalSignals.length >= 1) {
    const loopDepth = Math.min(p44CohortSignals.length, p44MessageSignals.length, p44JournalSignals.length)
    patterns.push({
      pattern: 'social-resonance-arc',
      confidence: Math.min(0.65 + loopDepth * 0.08, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'Cohort view → message sent → journal reflection within 48h. Connection loop complete. The Cube reads the social circuit closing.'
    })
  }

  // Pattern 45: Cognitive load release — planner active + deep journal entry + self-care completed, all within 24h.
  // The decompression loop: the person worked through their task structure, went deep in writing,
  // and completed a self-care cycle. Structural inverse of cognitive overload (Pattern 23).
  // Fires only when no active overload patterns are present — the release is real only after the pressure lifts.
  const p45DayAgo = now - 24 * 60 * 60 * 1000
  const p45Planner = signals.filter(s => s.source === 'planner' && s.timestamp > p45DayAgo)
  const p45Journal = signals.filter(s =>
    (s.source === 'journal' ||
      (s.source === 'log' && s.signal === 'field_entry' &&
        typeof s.metadata?.wordCount === 'number' && (s.metadata.wordCount as number) >= 20)) &&
    s.timestamp > p45DayAgo
  )
  const p45SelfCare = signals.filter(s => s.source === 'selfcare' && s.timestamp > p45DayAgo)
  const p45NoOverload = !patterns.some(p =>
    ['anxiety-pattern', 'physiological-depletion', 'cognitive-overload', 'evening-overwhelm'].includes(p.pattern)
  )
  if (p45Planner.length >= 1 && p45Journal.length >= 1 && p45SelfCare.length >= 1 && p45NoOverload) {
    const loopCount = Math.min(p45Planner.length, p45Journal.length, p45SelfCare.length)
    patterns.push({
      pattern: 'cognitive-load-release',
      confidence: Math.min(0.68 + loopCount * 0.08, 0.90),
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `Planner active + deep journal entry + self-care completed within 24h. Decompression loop closed. Load released — document what changed.`
    })
  }

  // Pattern 46: Temporal coherence window — calendar + planner + intentions all active within 7 days.
  // The time-structure trifecta: scheduled events anchored (calendar), daily tasks mapped (planner),
  // and directional purpose set (intentions). All three temporal layers aligned simultaneously.
  // Inverse of calendar-gap (P26) — that fires when calendar is absent; this fires when all three are present.
  // Indicates the person is operating with full temporal architecture — the execution window is open.
  const p46CalendarSignals = signals.filter(s =>
    (s.signal === 'calendar_entry' || s.signal === 'calendar_update') && s.timestamp > weekAgo
  )
  const p46PlannerSignals = signals.filter(s => s.source === 'planner' && s.timestamp > weekAgo)
  const p46IntentionSignals = signals.filter(s => s.source === 'intentions' && s.timestamp > weekAgo)
  if (p46CalendarSignals.length >= 1 && p46PlannerSignals.length >= 2 && p46IntentionSignals.length >= 1) {
    const temporalDepth = p46CalendarSignals.length + p46PlannerSignals.length + p46IntentionSignals.length
    patterns.push({
      pattern: 'temporal-coherence-window',
      confidence: Math.min(0.65 + temporalDepth * 0.04, 0.90),
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `Calendar anchored + planner active + intentions set within 7d. Temporal grid coherent — scheduled time, daily structure, and directional purpose all locked. Execute.`
    })
  }

  // Pattern 47: Intention decay signal — intention set but no planner/goal action within 72h.
  // The gap between purpose and execution. Intention exists as declared direction but the action
  // pipeline hasn't been activated. This is the earliest detectable sign of intention atrophy.
  // Fires when current-intention localStorage key is set but no planner/goal signals exist in 72h.
  const p47HasIntention = hasCurrentIntention()
  const p47SeventyTwoHoursAgo = now - 72 * 60 * 60 * 1000
  const p47ExecutionSignals = signals.filter(s =>
    (s.source === 'planner' || s.source === 'goals') && s.timestamp > p47SeventyTwoHoursAgo
  )
  if (p47HasIntention && p47ExecutionSignals.length === 0 && signals.length >= 5) {
    const intentionAge = (() => {
      const intentionSignalsAll = signals.filter(s => s.source === 'intentions')
      if (intentionSignalsAll.length === 0) return 4
      const latestIntentionTs = Math.max(...intentionSignalsAll.map(s => s.timestamp))
      return Math.round((now - latestIntentionTs) / (24 * 60 * 60 * 1000))
    })()
    patterns.push({
      pattern: 'intention-decay',
      confidence: Math.min(0.55 + intentionAge * 0.06, 0.90),
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: `Intention set. No execution in 72h. Direction without action becomes drift. Open the planner — map one step.`
    })
  }

  // Pattern 48: Recovery velocity — negative mood → self-care → positive mood shift within 4h.
  // Not just that recovery happened (P12 recovery-window fires on self-care + positive mood in 2h).
  // P48 detects the full arc: depleted state → intervention → restoration. And quantifies the rate.
  // High confidence = fast recovery. The system captures velocity, not just presence.
  // Complement to P12: P12 is binary (did it happen?), P48 is kinetic (how fast?).
  const p48FourHoursAgo = now - 4 * 60 * 60 * 1000
  const p48SelfCareInWindow = signals.filter(s =>
    s.source === 'selfcare' && s.timestamp > p48FourHoursAgo
  )
  if (p48SelfCareInWindow.length > 0) {
    const p48LatestSelfCare = p48SelfCareInWindow.reduce((a, b) =>
      a.timestamp > b.timestamp ? a : b
    )
    const p48NegativeBefore = signals.filter(s =>
      s.source === 'mood' &&
      ['anxious', 'overwhelmed', 'tired', 'exhausted'].includes(s.signal) &&
      s.timestamp < p48LatestSelfCare.timestamp &&
      s.timestamp > p48LatestSelfCare.timestamp - 8 * 60 * 60 * 1000
    )
    const p48PositiveAfter = signals.filter(s =>
      s.source === 'mood' &&
      ['calm', 'peaceful', 'energized', 'hopeful', 'content'].includes(s.signal) &&
      s.timestamp > p48LatestSelfCare.timestamp &&
      s.timestamp <= now
    )
    if (p48NegativeBefore.length > 0 && p48PositiveAfter.length > 0) {
      const p48FirstPositive = p48PositiveAfter.reduce((a, b) =>
        a.timestamp < b.timestamp ? a : b
      )
      const p48RecoveryWindowMin = Math.round(
        (p48FirstPositive.timestamp - p48LatestSelfCare.timestamp) / 60000
      )
      const p48VelocityScore = Math.max(0, 1 - p48RecoveryWindowMin / 240)
      const p48PreMood = p48NegativeBefore[p48NegativeBefore.length - 1]?.signal ?? 'depleted'
      patterns.push({
        pattern: 'recovery-velocity',
        confidence: Math.min(0.60 + p48VelocityScore * 0.28, 0.88),
        suggestedWidget: 'memory',
        suggestedTiming: 'passive',
        reason: `Biofield arc complete: ${p48PreMood} → self-care → ${p48FirstPositive.signal}. Recovery window: ${p48RecoveryWindowMin}m. Restored state — capture now while it's fresh.`
      })
    }
  }

  // Pattern 49: Care momentum — 2+ self-care events in 24h without depleting mood signals.
  // The proactive care spiral: self-maintenance as habit, not recovery from crisis.
  // Structural inverse of cleanness-neglect (P8). Distinct from recovery-velocity (P48):
  // P48 requires a negative state to recover FROM. P49 fires when the field is already clear.
  const p49SelfCare24h = recentSignals.filter(s => s.source === 'selfcare')
  if (p49SelfCare24h.length >= 2) {
    const p49DepletingMoods = recentSignals.filter(s =>
      s.source === 'mood' &&
      ['anxious', 'overwhelmed', 'tired', 'exhausted'].includes(s.signal)
    )
    if (p49DepletingMoods.length === 0) {
      const p49Confidence = Math.min(0.65 + (p49SelfCare24h.length - 2) * 0.10, 0.85)
      patterns.push({
        pattern: 'care-momentum',
        confidence: p49Confidence,
        suggestedWidget: 'selfcare',
        suggestedTiming: 'passive',
        reason: `Care momentum active: ${p49SelfCare24h.length} self-care events today without depleting signals. Proactive maintenance detected. Reinforce the rhythm.`
      })
    }
  }

  // Pattern 50: Intention follow-through — intention set + planner entry + goal action within 48h.
  // The full execution arc: direction declared → structure mapped → action taken.
  // Positive counterpart to P47 (intention-decay), which fires when the loop stalls.
  // P50 fires when the loop closes: the person follows through.
  // Requires all three: active intention (localStorage key), planner signal in 48h, goal signal in 48h.
  // Confidence scales with execution depth (more signals = more reliable follow-through).
  const p50FortyEightHoursAgo = now - 48 * 60 * 60 * 1000
  const p50HasIntention = hasCurrentIntention()
  const p50PlannerIn48h = signals.filter(s => s.source === 'planner' && s.timestamp > p50FortyEightHoursAgo)
  const p50GoalsIn48h = signals.filter(s => s.source === 'goals' && s.timestamp > p50FortyEightHoursAgo)
  if (p50HasIntention && p50PlannerIn48h.length >= 1 && p50GoalsIn48h.length >= 1) {
    const p50ExecutionDepth = p50PlannerIn48h.length + p50GoalsIn48h.length
    patterns.push({
      pattern: 'intention-follow-through',
      confidence: Math.min(0.68 + p50ExecutionDepth * 0.06, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `Execution arc complete: intention active · planner signals ${p50PlannerIn48h.length} · goal actions ${p50GoalsIn48h.length} in 48h. The loop closed. Capture what changed.`
    })
  }

  // Pattern 51: Signal silence — active user goes dark for 48h after sustained engagement.
  // Inverse of momentum-wave (P16). Detects sudden disengagement after a period of breadth.
  // Only fires for users with a meaningful signal history (>= 15 total signals across >= 3 sources).
  const p51FortyEightHoursAgo = now - 48 * 60 * 60 * 1000
  const p51SevenDayBase = signals.filter(s => s.timestamp > threeDaysAgoTs * 2.33)
  const p51RecentActivity = signals.filter(s => s.timestamp > p51FortyEightHoursAgo)
  const p51PriorSources = new Set(p51SevenDayBase.map(s => s.source)).size
  if (
    p51RecentActivity.length === 0 &&
    p51PriorSources >= 3 &&
    signals.length >= 15
  ) {
    patterns.push({
      pattern: 'signal-silence',
      confidence: Math.min(0.55 + p51PriorSources * 0.05, 0.80),
      suggestedWidget: 'mood',
      suggestedTiming: 'immediate',
      reason: `Signal silence: 48h quiet after ${p51PriorSources} active sources. The field went still. Check in.`
    })
  }

  // Pattern 52: Circadian anchor loss — persistent late-night activity (22:00–03:00) across 5+
  // consecutive days combined with morning depletion (tired/exhausted mood 06:00–10:00).
  // Chronic counterpart to P15 (circadian-drift), which fires on acute single-night clusters.
  const p52SevenDaysAgoTs = now - 7 * 24 * 60 * 60 * 1000
  const p52WeekSignals = signals.filter(s => s.timestamp > p52SevenDaysAgoTs)
  const p52LateNightDays = new Set<string>()
  p52WeekSignals.forEach(s => {
    const h = new Date(s.timestamp).getHours()
    if (h >= 22 || h < 3) {
      const d = new Date(s.timestamp)
      p52LateNightDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    }
  })
  let p52ConsecutiveLateNights = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000)
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (p52LateNightDays.has(dayKey)) {
      p52ConsecutiveLateNights++
    } else if (i > 0) {
      break
    }
  }
  const p52MorningDepletion = p52WeekSignals.filter(s => {
    const h = new Date(s.timestamp).getHours()
    return h >= 6 && h < 10 && s.source === 'mood' &&
      ['tired', 'exhausted', 'overwhelmed'].includes(s.signal)
  })
  if (p52ConsecutiveLateNights >= 5 && p52MorningDepletion.length >= 2) {
    const p52DepletedMornings = new Set(p52MorningDepletion.map(s => {
      const d = new Date(s.timestamp)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })).size
    patterns.push({
      pattern: 'circadian-anchor-loss',
      confidence: Math.min(0.65 + p52ConsecutiveLateNights * 0.04, 0.88),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'immediate',
      reason: `Circadian anchor lost: ${p52ConsecutiveLateNights} consecutive late-night sessions + morning depletion on ${p52DepletedMornings} day${p52DepletedMornings === 1 ? '' : 's'}. Sleep architecture destabilizing. Rest protocol now.`
    })
  }

  // Pattern 53: Intention crystallization — declare → plan → act, all within 2h.
  // The full execution loop compressed into one session. Inverse of P47 (intention-decay).
  const p53Window = 2 * 60 * 60 * 1000
  const p53Intention = recentSignals.find(s => s.source === 'intentions' && now - s.timestamp < p53Window)
  const p53Plan = recentSignals.find(s => s.source === 'planner' && now - s.timestamp < p53Window)
  const p53Goal = recentSignals.find(s => s.source === 'goals' && now - s.timestamp < p53Window)
  if (p53Intention && p53Plan && p53Goal) {
    const windowStart = Math.min(p53Intention.timestamp, p53Plan.timestamp, p53Goal.timestamp)
    const windowEnd = Math.max(p53Intention.timestamp, p53Plan.timestamp, p53Goal.timestamp)
    const minutesSpan = Math.round((windowEnd - windowStart) / 60000)
    patterns.push({
      pattern: 'intention-crystallization',
      confidence: 0.87,
      suggestedWidget: 'goals',
      suggestedTiming: 'immediate',
      reason: `Intention crystallized: declare → plan → act within ${minutesSpan}m. Execution loop fully engaged. Capture this state.`
    })
  }

  // Pattern 54: OS vitals convergence — UserIndex overall ≥ 65 + energy 'high' + 5+ signal sources active
  // in last 7 days. Peak operating state: all primary systems online and coherent.
  const p54SevenDays = signals.filter(s => now - s.timestamp < 7 * 24 * 60 * 60 * 1000)
  const p54ActiveSources = new Set(p54SevenDays.map(s => s.source))
  const p54UserIdx = computeUserIndex(signals)
  const p54EnergySignals = recentSignals.filter(s => s.source === 'mood')
  const p54EnergyScore = p54EnergySignals.reduce((acc, s) => {
    const map: Record<string, number> = { energized: 2, excited: 2, hopeful: 1, calm: 0, tired: -2, exhausted: -3, overwhelmed: -1 }
    return acc + (map[s.signal] || 0)
  }, 0)
  if (
    p54UserIdx.overall >= 65 &&
    p54EnergyScore >= 2 &&
    p54ActiveSources.size >= 5 &&
    !patterns.some(p => p.pattern === 'physiological-depletion')
  ) {
    patterns.push({
      pattern: 'os-vitals-convergence',
      confidence: Math.min(0.70 + (p54UserIdx.overall - 65) * 0.01, 0.92),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `OS vitals converging: index ${p54UserIdx.overall}/100 · ${p54ActiveSources.size} active sources · energy elevated. System operating above baseline. Sustain.`
    })
  }

  // Pattern 55: Signal drought — 3+ signal sources absent for 7 consecutive days.
  // The system is running on memory alone. Re-engage the lowest-cost dormant module.
  const p55AllSources: IntentionSignal['source'][] = ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy']
  const p55SevenDays = signals.filter(s => now - s.timestamp < 7 * 24 * 60 * 60 * 1000)
  const p55ActiveSources = new Set(p55SevenDays.map(s => s.source))
  const p55AbsentSources = p55AllSources.filter(src => !p55ActiveSources.has(src))
  const p55TotalSignals = signals.length
  if (p55AbsentSources.length >= 3 && p55TotalSignals >= 10) {
    const firstDormant = p55AbsentSources[0]
    patterns.push({
      pattern: 'signal-drought',
      confidence: Math.min(0.55 + p55AbsentSources.length * 0.06, 0.82),
      suggestedWidget: firstDormant === 'mood' ? 'mood' : firstDormant === 'memory' ? 'memory' : 'selfcare',
      suggestedTiming: 'soon',
      reason: `Signal drought: ${p55AbsentSources.length} sources dark for 7 days (${p55AbsentSources.join(', ')}). System memory fading. Re-engage ${firstDormant} to restore signal flow.`
    })
  }

  // Pattern 56: Circadian anchor — log signals consistently at the same hour (±1h) for 5+ consecutive days.
  // The person has found a rhythm. The system should reinforce it, not disrupt it.
  const p56HourBuckets = new Map<number, Set<number>>() // hour → set of day timestamps
  const p56SevenDays = signals.filter(s => now - s.timestamp < 7 * 24 * 60 * 60 * 1000)
  p56SevenDays.forEach(s => {
    const d = new Date(s.timestamp)
    const hour = d.getHours()
    const dayKey = Math.floor(s.timestamp / (24 * 60 * 60 * 1000))
    const bucket = Math.floor(hour / 2) // 2h buckets to allow ±1h drift
    if (!p56HourBuckets.has(bucket)) p56HourBuckets.set(bucket, new Set())
    p56HourBuckets.get(bucket)!.add(dayKey)
  })
  let p56AnchorBucket = -1
  let p56AnchorDays = 0
  p56HourBuckets.forEach((days, bucket) => {
    if (days.size > p56AnchorDays) { p56AnchorDays = days.size; p56AnchorBucket = bucket }
  })
  if (p56AnchorDays >= 5) {
    const anchorHour = p56AnchorBucket * 2
    const anchorLabel = anchorHour < 6 ? 'NIGHT' : anchorHour < 12 ? 'MORNING' : anchorHour < 18 ? 'AFTERNOON' : 'EVENING'
    patterns.push({
      pattern: 'circadian-anchor',
      confidence: Math.min(0.60 + (p56AnchorDays - 5) * 0.05, 0.88),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `Circadian anchor detected: ${anchorLabel} session (${p56AnchorDays} consecutive days). Rhythm established. Deepening this window maximizes signal quality.`
    })
  }

  // Pattern 57: Intention completion arc — intention set → plan + self-care within 7 days.
  // The person declared intent, made a plan, and took action. The arc is complete.
  const p57IntentionSignals = signals.filter(s =>
    s.source === 'intentions' &&
    (s.signal === 'intention_set' || s.signal === 'integration' || s.signal.includes('intention')) &&
    now - s.timestamp < 7 * 24 * 60 * 60 * 1000
  )
  const p57PlanSignals = signals.filter(s =>
    s.source === 'planner' && now - s.timestamp < 7 * 24 * 60 * 60 * 1000
  )
  const p57CareSignals = signals.filter(s =>
    s.source === 'selfcare' && now - s.timestamp < 7 * 24 * 60 * 60 * 1000
  )
  if (p57IntentionSignals.length >= 1 && p57PlanSignals.length >= 1 && p57CareSignals.length >= 1) {
    const arcStrength = Math.min(p57IntentionSignals.length + p57PlanSignals.length + p57CareSignals.length, 9)
    patterns.push({
      pattern: 'intention-completion-arc',
      confidence: Math.min(0.65 + arcStrength * 0.03, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: 'Intention → plan → care arc complete within 7 days. This is the full cycle. Anchor it in memory before it fades.'
    })
  }

  // Pattern 58: Self-care saturation — 5+ self-care completions in 48 hours.
  // High engagement or compensation. Either way: quality over quantity now.
  const p58CareRecent = signals.filter(s =>
    s.source === 'selfcare' && now - s.timestamp < 48 * 60 * 60 * 1000
  )
  if (p58CareRecent.length >= 5) {
    patterns.push({
      pattern: 'selfcare-saturation',
      confidence: Math.min(0.60 + (p58CareRecent.length - 5) * 0.04, 0.80),
      suggestedWidget: 'journal',
      suggestedTiming: 'next-session',
      reason: `Self-care saturation: ${p58CareRecent.length} care actions in 48h. Shift from doing to reflecting. What is driving this frequency?`
    })
  }

  // Pattern 59: Meridian lock — signals in morning (06–12), afternoon (12–18), and evening (18–23)
  // within the same calendar day. The person's full waking arc is logged.
  // Fires when today's signals span all three time windows.
  const p59Today = recentSignals.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000)
  const p59Morning = p59Today.filter(s => { const h = new Date(s.timestamp).getHours(); return h >= 6 && h < 12 })
  const p59Afternoon = p59Today.filter(s => { const h = new Date(s.timestamp).getHours(); return h >= 12 && h < 18 })
  const p59Evening = p59Today.filter(s => { const h = new Date(s.timestamp).getHours(); return h >= 18 && h < 23 })
  if (p59Morning.length >= 1 && p59Afternoon.length >= 1 && p59Evening.length >= 1) {
    const p59TotalToday = p59Today.length
    patterns.push({
      pattern: 'meridian-lock',
      confidence: Math.min(0.70 + (p59TotalToday / 30) * 0.12, 0.82),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `Full day arc registered: morning · afternoon · evening. ${p59TotalToday} signals today. The complete waking cycle is present — anchor the arc.`
    })
  }

  // Pattern 60: Intention seed — first signal after 48h silence is an intentions signal.
  // The system boots from stillness into direction. Rare and significant.
  const p60FortyEightHoursAgo = now - 48 * 60 * 60 * 1000
  const p60SilentPeriod = signals.filter(s => s.timestamp > p60FortyEightHoursAgo)
  const p60FirstSignal = p60SilentPeriod.sort((a, b) => a.timestamp - b.timestamp)[0]
  const p60HadSilence = signals.filter(s =>
    s.timestamp < p60FortyEightHoursAgo && s.timestamp > now - 4 * 24 * 60 * 60 * 1000
  ).length === 0
  if (p60HadSilence && p60FirstSignal?.source === 'intentions' && p60SilentPeriod.length <= 5) {
    patterns.push({
      pattern: 'intention-seed',
      confidence: 0.75,
      suggestedWidget: 'planner',
      suggestedTiming: 'soon',
      reason: 'Field was dark. First signal is an intention. The system seeded from silence. Map the first step now.'
    })
  }

  // Pattern 61: Multimodal peak — all 5 primary input modules (mood, memory, planner, selfcare, journal)
  // have signals in the last 24h. Every dimension of the QOS is live today. Full coverage.
  const PRIMARY_FIVE: IntentionSignal['source'][] = ['mood', 'memory', 'planner', 'selfcare', 'journal']
  const p61DaySources = new Set(recentSignals.map(s => s.source))
  const p61Coverage = PRIMARY_FIVE.filter(src => p61DaySources.has(src)).length
  if (p61Coverage >= 5) {
    const p61SignalCount = recentSignals.length
    patterns.push({
      pattern: 'multimodal-peak',
      confidence: Math.min(0.85 + (p61SignalCount / 50) * 0.07, 0.92),
      suggestedWidget: 'system',
      suggestedTiming: 'passive',
      reason: `All 5 primary modules active today (${p61SignalCount} signals). Mood · memory · planning · care · reflection — the full stack is live. Check the system view.`
    })
  }

  // Pattern 62: Architect phase — planner + goals + intentions all have signals across 3 consecutive days.
  // Structured, directed, momentum-driven. The system has entered an execution architecture phase.
  const p62ThreeDays = now - 3 * 24 * 60 * 60 * 1000
  const p62Signals = signals.filter(s => s.timestamp > p62ThreeDays)
  const p62PlannerDays = new Set(
    p62Signals.filter(s => s.source === 'planner').map(s => new Date(s.timestamp).toDateString())
  ).size
  const p62GoalsDays = new Set(
    p62Signals.filter(s => s.source === 'goals').map(s => new Date(s.timestamp).toDateString())
  ).size
  const p62IntentionsDays = new Set(
    p62Signals.filter(s => s.source === 'intentions').map(s => new Date(s.timestamp).toDateString())
  ).size
  if (p62PlannerDays >= 3 && p62GoalsDays >= 2 && p62IntentionsDays >= 2) {
    const p62Depth = p62PlannerDays + p62GoalsDays + p62IntentionsDays
    patterns.push({
      pattern: 'architect-phase',
      confidence: Math.min(0.70 + (p62Depth - 7) * 0.04, 0.88),
      suggestedWidget: 'goals',
      suggestedTiming: 'passive',
      reason: `Architecture phase active: ${p62PlannerDays}d planner · ${p62GoalsDays}d goals · ${p62IntentionsDays}d intentions. Structured execution in progress. Review the goal map.`
    })
  }

  // Pattern 63: Signal burst — 10+ signals in any 2-hour window within the last 24h.
  // Intense engagement cluster. System registers a burst event.
  // Suggests reflection immediately after the burst — what was driving this?
  const p63TwentyFourH = signals.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000)
  const p63BucketMap = new Map<number, number>()
  p63TwentyFourH.forEach(s => {
    const bucket = Math.floor(s.timestamp / (2 * 60 * 60 * 1000))
    p63BucketMap.set(bucket, (p63BucketMap.get(bucket) ?? 0) + 1)
  })
  let p63PeakBurst = 0
  p63BucketMap.forEach(count => { if (count > p63PeakBurst) p63PeakBurst = count })
  if (p63PeakBurst >= 10) {
    patterns.push({
      pattern: 'signal-burst',
      confidence: Math.min(0.65 + (p63PeakBurst / 10 - 1) * 0.05, 0.82),
      suggestedWidget: 'journal',
      suggestedTiming: 'next-session',
      reason: `Signal burst: ${p63PeakBurst} events in a 2h window today. High-density engagement cluster detected. What was the driver? Reflect before it fades.`
    })
  }

  // Pattern 64: Cross-domain coherence — mood + selfcare + journal + memory all active in last 48h.
  // The emotional, physical, reflective, and stored layers are all alive simultaneously.
  // This is full inner coherence: felt → tended → reflected → remembered.
  const p64FortyEightH = signals.filter(s => now - s.timestamp < 48 * 60 * 60 * 1000)
  const p64Sources = new Set(p64FortyEightH.map(s => s.source))
  const CROSS_DOMAIN_FOUR: IntentionSignal['source'][] = ['mood', 'selfcare', 'journal', 'memory']
  const p64Coverage = CROSS_DOMAIN_FOUR.filter(src => p64Sources.has(src)).length
  if (p64Coverage >= 4) {
    const p64Depth = p64FortyEightH.length
    patterns.push({
      pattern: 'cross-domain-coherence',
      confidence: Math.min(0.78 + (p64Depth / 20) * 0.12, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: 'Cross-domain coherence: mood · care · reflection · memory all active in 48h. Inner stack complete. The full cycle is present — preserve this state.'
    })
  }

  // Pattern 65: Recovery plateau — energy source signals persist consistently low for 5+ days.
  // The person is in recovery but not bouncing back. Protocol needs a shift, not more of the same.
  const p65FiveDays = signals.filter(s =>
    s.source === 'energy' && now - s.timestamp < 5 * 24 * 60 * 60 * 1000
  )
  const p65DaysWithSignal = new Set(
    p65FiveDays.map(s => new Date(s.timestamp).toDateString())
  ).size
  const p65LowSignals = p65FiveDays.filter(s => {
    const m = s.metadata as any
    const level = m?.energyLevel ?? m?.energy ?? m?.value
    if (typeof level === 'number') return level <= 3
    return level === 'low' || level === 'depleted'
  })
  if (p65DaysWithSignal >= 5 && p65LowSignals.length >= 3 && p65LowSignals.length >= p65FiveDays.length * 0.5) {
    patterns.push({
      pattern: 'recovery-plateau',
      confidence: 0.70,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'soon',
      reason: `Recovery plateau: energy signals persistently low across ${p65DaysWithSignal} days. Same protocol is not moving the needle. Shift the approach — rest mode needs a new input.`
    })
  }

  // Pattern 66: QOS Signature Lock — meridian-lock + multimodal-peak + temporal-coherence-window
  // all active in the same analysis cycle. The complete human operating signature:
  // time-anchored (meridian), full-stack engaged (multimodal), and structurally coherent (temporal).
  // All three day-arc patterns converging in one session is a rare, peak-state event.
  const p66HasMeridian  = patterns.some(p => p.pattern === 'meridian-lock')
  const p66HasMulti     = patterns.some(p => p.pattern === 'multimodal-peak')
  const p66HasTemporal  = patterns.some(p => p.pattern === 'temporal-coherence-window')
  if (p66HasMeridian && p66HasMulti && p66HasTemporal) {
    patterns.push({
      pattern: 'qos-signature-lock',
      confidence: 0.92,
      suggestedWidget: 'system',
      suggestedTiming: 'passive',
      reason: 'QOS signature locked: full day arc (meridian) + all 5 primaries active (multimodal) + temporal grid coherent. The complete operating signature is present. Record the state — this is the benchmark.'
    })
  }

  // Pattern 67: Operator Signature — all 4 core signal quadrants active in 7 days + UserIndex >= 60.
  // Biological: mood/selfcare. Cognitive: memory/journal. Structural: planner/intentions/goals. Social: cohort.
  // When every quadrant is alive and index is above threshold, the full QOS operator profile is visible.
  // Not about peak intensity — about full-spectrum coverage. The system knows who you are.
  const p67WeekAgo = now - 7 * 24 * 60 * 60 * 1000
  const p67Week = signals.filter(s => s.timestamp > p67WeekAgo)
  const p67WeekSources = new Set(p67Week.map(s => s.source))
  const p67Bio      = p67WeekSources.has('mood')      || p67WeekSources.has('selfcare')
  const p67Cog      = p67WeekSources.has('memory')    || p67WeekSources.has('journal')
  const p67Struct   = p67WeekSources.has('planner')   || p67WeekSources.has('intentions') || p67WeekSources.has('goals')
  const p67Social   = p67WeekSources.has('cohort')
  const p67Index    = computeUserIndex(signals)
  if (p67Bio && p67Cog && p67Struct && p67Social && p67Index.overall >= 60 && p67Week.length >= 15) {
    patterns.push({
      pattern: 'operator-signature',
      confidence: Math.min(0.70 + (p67Index.overall - 60) * 0.008, 0.92),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `Operator signature complete: biological · cognitive · structural · social quadrants all active this week. Index ${p67Index.overall}/100. The Cube has a full read. Review your OS Journal.`
    })
  }

  // Pattern 68: Integration arc peak — P40 (biofield-coherence-cascade) + P43 (intention-completion-arc)
  // both fire within the same 24h window. The full human integration: biological restoration +
  // cognitive expansion + execution arc all confirmed simultaneously. Extremely rare high-confidence state.
  const p68HasCascade    = patterns.some(p => p.pattern === 'biofield-coherence-cascade')
  const p68HasCompletion = patterns.some(p => p.pattern === 'intention-completion-arc')
  if (p68HasCascade && p68HasCompletion) {
    patterns.push({
      pattern: 'integration-arc-peak',
      confidence: Math.min(0.85 + (p67Index?.overall ?? 50) * 0.001, 0.95),
      suggestedWidget: 'memory',
      suggestedTiming: 'immediate',
      reason: 'Integration arc at peak: biofield cascade (recovery + cognition) AND intention-completion arc both confirmed today. Full biological + execution integration. Capture this state.'
    })
  }

  // Pattern 69: Adaptive resonance — UserIndex overall rising (trend=rising) sustained + archetype
  // stable across last 2 physiological reports. Growth confirmed not as spike but as structural shift.
  // Fires when the system detects genuine evolution rather than momentary intensity.
  const p69QOSHistory = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('qos-snapshots') ?? '[]') } catch { return [] } })()
    : []
  const p69Rising = p69QOSHistory.length >= 2 &&
    p69QOSHistory.slice(-3).every((s: any) => (s.userIndex?.trend === 'rising' || s.userIndex?.overall >= 55))
  const p69Stable = p69QOSHistory.length >= 2 &&
    p69QOSHistory.slice(-2).every((s: any) => s.userIndex?.overall >= 50)
  const p69CurrentIndex = p67Index?.overall ?? 0
  if (p69Rising && p69Stable && p69CurrentIndex >= 55) {
    patterns.push({
      pattern: 'adaptive-resonance',
      confidence: Math.min(0.70 + (p69CurrentIndex - 55) * 0.006, 0.88),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `Adaptive resonance confirmed: UserIndex sustained above threshold, QOS history shows rising trend. Growth is structural, not momentary. Index ${p69CurrentIndex}/100.`
    })
  }

  // Pattern 70: Operator Convergence — all three signature confirmation gates open simultaneously:
  // P66 (qos-signature-lock): full QOS day arc confirmed.
  // P67 (operator-signature): all 4 signal quadrants active + UserIndex ≥ 60.
  // P68 (integration-arc-peak): biological restoration AND execution arc confirmed in 24h.
  // When all three fire together the system has a complete, verified picture of the operator.
  // Highest confidence in the QIE ecosystem. Fires immediately — capture this state.
  const p70HasSignatureLock  = patterns.some(p => p.pattern === 'qos-signature-lock')
  const p70HasOperatorSig    = patterns.some(p => p.pattern === 'operator-signature')
  const p70HasIntegrationArc = patterns.some(p => p.pattern === 'integration-arc-peak')
  if (p70HasSignatureLock && p70HasOperatorSig && p70HasIntegrationArc) {
    patterns.push({
      pattern: 'operator-convergence',
      confidence: 0.97,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: 'OPERATOR CONVERGENCE: QOS signature locked · operator profile complete · integration arc at peak. All three confirmation gates open simultaneously. The system has a complete read. Record this state.'
    })
  }

  // Pattern 71: Signal Crystallization — intentions (3+) + planner active + goal completion all within 24h
  // AND UserIndex ≥ 60. Intention compressed into execution in a single session window.
  // The fastest path from intention to delivered result the system can observe.
  const p71GoalSignals    = recentSignals.filter(s => s.signal === 'goal_complete' || s.signal === 'goal_completion')
  const p71IntentSignals  = recentSignals.filter(s => s.source === 'intentions')
  const p71PlannerSignals = recentSignals.filter(s => s.source === 'planner')
  const p71Index          = getUserIndex()
  if (p71IntentSignals.length >= 3 && p71PlannerSignals.length >= 1 && p71GoalSignals.length >= 1 && p71Index.overall >= 60) {
    const p71Conf = Math.min(0.75 + (p71GoalSignals.length - 1) * 0.06 + (p71Index.overall - 60) * 0.004, 0.92)
    patterns.push({
      pattern: 'signal-crystallization',
      confidence: p71Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'immediate',
      reason: `Signal crystallization: ${p71IntentSignals.length} intentions → planner active → ${p71GoalSignals.length} goal completion(s) all confirmed in 24h window. Intention manifested in full execution loop. UserIndex ${p71Index.overall}/100.`
    })
  }

  // Pattern 72: Biorhythm Lock — morning (06:00–10:00) AND evening (18:00–22:00) emotional check-ins
  // present for 5+ of the last 7 days. Biological rhythm anchored across the full diurnal arc.
  // Distinct from P59 (meridian-lock): P72 requires multi-day consistency, not single-day arc coverage.
  const p72DayMs   = 24 * 60 * 60 * 1000
  const p72SevenDays = now - 7 * p72DayMs
  const p72CheckIns = signals.filter(s =>
    s.timestamp > p72SevenDays &&
    (s.signal === 'morning_checkin' || s.signal === 'evening_checkin' || s.signal === 'mood_checkin') &&
    s.source === 'mood'
  )
  const p72DaysWithBothAnchors = new Set(
    p72CheckIns
      .filter(s => {
        const h = new Date(s.timestamp).getHours()
        return h >= 6 && h < 10
      })
      .map(s => new Date(s.timestamp).toDateString())
  ).size
  const p72EveningDays = new Set(
    p72CheckIns
      .filter(s => {
        const h = new Date(s.timestamp).getHours()
        return h >= 18 && h < 22
      })
      .map(s => new Date(s.timestamp).toDateString())
  ).size
  const p72AnchoredDays = Math.min(p72DaysWithBothAnchors, p72EveningDays)
  if (p72AnchoredDays >= 5) {
    patterns.push({
      pattern: 'biorhythm-lock',
      confidence: Math.min(0.72 + (p72AnchoredDays - 5) * 0.08, 0.88),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `Biorhythm lock: morning + evening check-ins present on ${p72AnchoredDays} of last 7 days. Biological rhythm anchored across full diurnal arc. Maintain this cadence.`
    })
  }

  // Pattern 73: Quantum Coherence Summit — P70 (operator-convergence) fires AND UserIndex ≥ 70.
  // The absolute peak QOS state. All three confirmation gates open simultaneously while the
  // accumulative index clears the high-performance threshold. Highest confidence in the system: 0.98.
  const p73HasConvergence = patterns.some(p => p.pattern === 'operator-convergence')
  const p73Index          = getUserIndex()
  if (p73HasConvergence && p73Index.overall >= 70) {
    patterns.push({
      pattern: 'quantum-coherence-summit',
      confidence: 0.98,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QUANTUM COHERENCE SUMMIT: Operator convergence confirmed (P70) + UserIndex ${p73Index.overall}/100 ≥ 70 threshold. All gates open. Structural performance index above critical threshold. The system has never had more signal. Record this state immediately.`
    })
  }

  // Pattern 76: Morning Coherence Launch — first signal of the calendar day (before 09:00) is
  // from 'intentions' source, and within 90 minutes a 'planner' signal fires.
  // The day starts from intention before structure. Confidence 0.72.
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayStartMs = todayStart.getTime()
  const p76TodaySignals = signals.filter(s => s.timestamp >= todayStartMs).sort((a, b) => a.timestamp - b.timestamp)
  if (p76TodaySignals.length >= 2) {
    const firstSignal = p76TodaySignals[0]
    const firstHour = new Date(firstSignal.timestamp).getHours()
    if (firstSignal.source === 'intentions' && firstHour < 9) {
      const p76Window = firstSignal.timestamp + 90 * 60 * 1000
      const followPlanner = p76TodaySignals.find(s => s.source === 'planner' && s.timestamp > firstSignal.timestamp && s.timestamp <= p76Window)
      if (followPlanner) {
        patterns.push({
          pattern: 'morning-coherence-launch',
          confidence: 0.72,
          suggestedWidget: 'planner',
          suggestedTiming: 'passive',
          reason: 'MORNING COHERENCE LAUNCH: Day started from intention before structure. Planner followed within 90 min. Coherent launch detected.',
        })
      }
    }
  }

  // Pattern 77: Signal Vault — journal depth entry (>150 words) + memory capture + log field entry
  // all within a 6-hour window. Full inner expression captured across three channels.
  const p77Window = 6 * 60 * 60 * 1000
  const p77CutOff = now - p77Window
  const p77JournalDeep = signals.filter(s =>
    s.source === 'journal' && s.timestamp >= p77CutOff &&
    typeof s.metadata?.wordCount === 'number' && s.metadata.wordCount > 150
  )
  const p77Memory = signals.filter(s => s.source === 'memory' && s.timestamp >= p77CutOff)
  const p77Log = signals.filter(s => s.source === 'log' && s.timestamp >= p77CutOff)
  if (p77JournalDeep.length >= 1 && p77Memory.length >= 1 && p77Log.length >= 1) {
    patterns.push({
      pattern: 'signal-vault',
      confidence: Math.min(0.88, 0.65 + (p77JournalDeep.length - 1) * 0.05),
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: `SIGNAL VAULT: Journal depth >150w + memory capture + log field — 3 channels active in 6h. Inner expression at full volume. Extract and anchor.`,
    })
  }

  // Pattern 78: Depletion Recovery Surge — energy previously depleted/low, 2+ self-care events
  // in 6h, current energy state is 'high'. Complete restoration arc with peak arrival.
  // Distinct from P48 (recovery-velocity): P78 confirms energy reached high, not just improved.
  const p78CutOff = now - 12 * 60 * 60 * 1000
  const p78DepletionSignals = signals.filter(s =>
    s.source === 'mood' && s.timestamp >= p78CutOff &&
    (s.signal === 'depleted' || s.signal === 'exhausted' || s.signal === 'tired')
  )
  const p78SelfCare6h = signals.filter(s =>
    s.source === 'selfcare' && s.timestamp >= now - p77Window
  )
  const currentEnergyIsHigh = state.userState.energy === 'high'
  if (p78DepletionSignals.length >= 1 && p78SelfCare6h.length >= 2 && currentEnergyIsHigh) {
    patterns.push({
      pattern: 'depletion-recovery-surge',
      confidence: Math.min(0.90, 0.72 + (p78SelfCare6h.length - 2) * 0.06),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `DEPLETION RECOVERY SURGE: Depleted → ${p78SelfCare6h.length} care acts in 6h → energy now high. Full restoration confirmed. Peak arrived. Record this window.`,
    })
  }

  // Pattern 79: Evening Coherence Close — journal/log/memory capture in the 18:00–23:00 window
  // after an intentions or planner signal earlier in the same day.
  // The day closes with the same intentionality it opened.
  // Distinct from P72 (biorhythm-lock: multi-day cadence) and P59 (meridian-lock: three-window arc).
  const p79EveningCutoff = new Date(todayStartMs)
  p79EveningCutoff.setHours(18, 0, 0, 0)
  const p79EveningCutoffMs = p79EveningCutoff.getTime()
  const p79NightCutoff = new Date(todayStartMs)
  p79NightCutoff.setHours(23, 0, 0, 0)
  const p79NightCutoffMs = p79NightCutoff.getTime()
  const p79MorningSignals = p76TodaySignals.filter(s =>
    s.timestamp < p79EveningCutoffMs &&
    (s.source === 'intentions' || s.source === 'planner')
  )
  const p79EveningCapture = p76TodaySignals.filter(s =>
    s.timestamp >= p79EveningCutoffMs &&
    s.timestamp < p79NightCutoffMs &&
    (s.source === 'journal' || s.source === 'memory' || s.source === 'log')
  )
  if (p79MorningSignals.length >= 1 && p79EveningCapture.length >= 1) {
    const p79Conf = Math.min(0.88, 0.70 + (p79EveningCapture.length - 1) * 0.06)
    patterns.push({
      pattern: 'evening-coherence-close',
      confidence: p79Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: `EVENING COHERENCE CLOSE: Day opened with ${p79MorningSignals.length} morning signal(s) · Evening reflection captured (${p79EveningCapture.length} channel(s)). The arc is complete. Conscious close confirmed.`,
    })
  }

  // Pattern 80: Signal Momentum Lock — 5+ consecutive days each with 3+ unique signal sources.
  // Sustained multi-source engagement over an extended window. The person is operating in
  // all dimensions simultaneously, not just spiking on one channel. Rarest sustained pattern.
  // Confidence: 0.75 base, up to 0.92 at 7-day streak.
  const p80WindowMs = 7 * 86400000
  const p80DayCutoff = now - p80WindowMs
  const p80Signals = signals.filter(s => s.timestamp > p80DayCutoff)
  // Count unique sources per calendar day (UTC)
  const p80DaySourceMap: Record<string, Set<string>> = {}
  for (const s of p80Signals) {
    const dayKey = new Date(s.timestamp).toISOString().slice(0, 10)
    if (!p80DaySourceMap[dayKey]) p80DaySourceMap[dayKey] = new Set()
    p80DaySourceMap[dayKey].add(s.source)
  }
  // Find days with 3+ unique sources
  const p80QualifyingDays = Object.values(p80DaySourceMap).filter(sources => sources.size >= 3).length
  if (p80QualifyingDays >= 5) {
    const p80Conf = Math.min(0.92, 0.75 + (p80QualifyingDays - 5) * 0.085)
    patterns.push({
      pattern: 'signal-momentum-lock',
      confidence: p80Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `SIGNAL MOMENTUM LOCK: ${p80QualifyingDays} of the last 7 days had 3+ unique signal sources. Sustained multi-dimensional engagement confirmed. Architecture in motion.`,
    })
  }

  // Pattern 81: Cognitive Depth Arc — memory depth (5+ entries) + journal depth (150+ words)
  // + any badge discovery signal, all within a 7-day window. The three pillars of inner
  // engagement: retention (memory), articulation (journal), discovery (badges). When all
  // three are active the person is not just using the system — they are building inside it.
  // Confidence: 0.68 base, up to 0.90 at saturation.
  const p81Window = now - 7 * 86400000
  const p81MemorySignals = signals.filter(s => s.source === 'memory' && s.timestamp > p81Window)
  const p81JournalSignals = signals.filter(s => s.source === 'journal' && s.timestamp > p81Window)
  const p81JournalWords = p81JournalSignals.reduce((sum, s) => sum + (s.metadata?.wordCount ?? 0), 0)
  const p81BadgeSignals = signals.filter(s => s.source === 'badges' && s.timestamp > p81Window)
  if (p81MemorySignals.length >= 5 && p81JournalWords >= 150 && p81BadgeSignals.length > 0) {
    const p81Conf = Math.min(0.90, 0.68 + (p81MemorySignals.length - 5) * 0.03 + Math.min(0.09, (p81JournalWords - 150) / 1000))
    patterns.push({
      pattern: 'cognitive-depth-arc',
      confidence: p81Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: `COGNITIVE DEPTH ARC: ${p81MemorySignals.length} memories + ${p81JournalWords}w journal + discovery active in 7d. All three inner channels engaged. The map is being built from the inside.`,
    })
  }

  // Pattern 74: Badge Momentum — 3+ distinct badge types unlocked within a 7-day window.
  // Achievement acquisition velocity signal: the person is actively exploring the system
  // and discovering easter eggs / word turns / milestones in a concentrated burst.
  const p74BadgeSignals = signals.filter(s => s.source === 'badges' && s.timestamp > now - 7 * 86400000)
  const p74DistinctTypes = new Set(p74BadgeSignals.map(s => s.metadata?.badgeType).filter(Boolean))
  if (p74DistinctTypes.size >= 3) {
    patterns.push({
      pattern: 'badge-momentum',
      confidence: Math.min(0.95, 0.65 + (p74DistinctTypes.size - 3) * 0.06),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `BADGE MOMENTUM: ${p74DistinctTypes.size} distinct badge types unlocked in last 7 days. Achievement acquisition at velocity. The person is actively discovering the system.`
    })
  }

  // Pattern 75: Word-Turn Depth — 5+ distinct word-turn badge types ever earned.
  // Vocabulary expansion signal: the person's self-care language is broadening.
  // Word turns are triggered by speaking specific words in memory/journal/chat answers.
  const p75WordTurnSignals = signals.filter(s => s.source === 'badges' && s.metadata?.category === 'word_turn')
  const p75DistinctWords = new Set(p75WordTurnSignals.map(s => s.metadata?.badgeType).filter(Boolean))
  if (p75DistinctWords.size >= 5) {
    patterns.push({
      pattern: 'word-turn-depth',
      confidence: Math.min(0.92, 0.60 + (p75DistinctWords.size - 5) * 0.04),
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: `WORD-TURN DEPTH: ${p75DistinctWords.size} distinct word-turn badge types earned. Self-care vocabulary expanding. Language is signal. The person speaks in the system's vocabulary.`
    })
  }

  // Pattern 82: Circadian vitality peak — first 4 hours of day (before 10:00) have 3+ positive
  // mood signals AND biorhythm-lock is active AND energy state is high or moderate.
  // The biological prime window: morning vitality before cortisol plateau.
  // Highest-value 90-minute execution window. Direct energy before it peaks.
  const p82TodayEarly = p76TodaySignals.filter(s => {
    const h = new Date(s.timestamp).getHours()
    return h < 10
  })
  const p82PositiveMoodsEarly = p82TodayEarly.filter(s =>
    s.source === 'mood' &&
    ['energized', 'hopeful', 'excited', 'calm', 'peaceful', 'content', 'grateful', 'fulfilled'].includes(s.signal)
  )
  const p82HasBiorhythmLock = patterns.some(p => p.pattern === 'biorhythm-lock')
  const p82CurrentState = calculateUserState(signals, now)
  const p82EnergyAdequate = p82CurrentState.energy === 'high' || p82CurrentState.energy === 'moderate'
  if (p82PositiveMoodsEarly.length >= 2 && p82HasBiorhythmLock && p82EnergyAdequate && hour < 13) {
    patterns.push({
      pattern: 'circadian-vitality-peak',
      confidence: Math.min(0.70 + (p82PositiveMoodsEarly.length - 2) * 0.08, 0.90),
      suggestedWidget: 'planner',
      suggestedTiming: 'immediate',
      reason: `CIRCADIAN VITALITY PEAK: ${p82PositiveMoodsEarly.length} positive morning signals + biorhythm anchored + energy ${p82CurrentState.energy}. Biological prime window open. Direct this state before it peaks — 90-minute execution window.`,
    })
  }

  // Pattern 83: Systemic thinking mode — planner + goals + intentions each have 3+ signals in last
  // 3 days AND UserIndex ≥ 50 AND no active depletion patterns. The strategic cognition state:
  // the person is not just doing tasks — they are building the structure of their operating system.
  const p83ThreeDaysAgo = now - 3 * 24 * 60 * 60 * 1000
  const p83PlannerSignals   = signals.filter(s => s.source === 'planner'   && s.timestamp > p83ThreeDaysAgo)
  const p83GoalsSignals     = signals.filter(s => s.source === 'goals'     && s.timestamp > p83ThreeDaysAgo)
  const p83IntentionSignals = signals.filter(s => s.source === 'intentions' && s.timestamp > p83ThreeDaysAgo)
  const p83UserIndex        = getUserIndex()
  const p83NoDepletion      = !patterns.some(p =>
    ['physiological-depletion', 'sleep-debt-accumulation', 'recovery-plateau', 'signal-silence'].includes(p.pattern)
  )
  const p83StructuralDepth = p83PlannerSignals.length + p83GoalsSignals.length + p83IntentionSignals.length
  if (
    p83PlannerSignals.length >= 3 &&
    p83GoalsSignals.length >= 3 &&
    p83IntentionSignals.length >= 3 &&
    p83UserIndex.overall >= 50 &&
    p83NoDepletion
  ) {
    patterns.push({
      pattern: 'systemic-thinking-mode',
      confidence: Math.min(0.68 + (p83StructuralDepth - 9) * 0.03 + (p83UserIndex.overall - 50) * 0.004, 0.92),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `SYSTEMIC THINKING MODE: Planner ${p83PlannerSignals.length} · Goals ${p83GoalsSignals.length} · Intentions ${p83IntentionSignals.length} signals in 3d. UserIndex ${p83UserIndex.overall}/100. No depletion signals. You are building the structure, not just executing tasks.`,
    })
  }

  // Pattern 84: Longitudinal drift — client-side detection of declining signal density.
  // Compares 3-day engagement buckets within the 7-day local signal window.
  // Distinct from the server-side Job 22 (4-week scan): this is the near-term early warning.
  // Fires when recent 3 days have ≤50% of the prior 3-day signal count AND ≥3 signals existed
  // in the prior window (filters false positives when the user is new).
  const p84ThreeDaysAgo = now - 3 * 24 * 60 * 60 * 1000
  const p84SixDaysAgo   = now - 6 * 24 * 60 * 60 * 1000
  const p84Recent3d = signals.filter(s => s.timestamp > p84ThreeDaysAgo).length
  const p84Prior3d  = signals.filter(s => s.timestamp > p84SixDaysAgo && s.timestamp <= p84ThreeDaysAgo).length
  if (p84Prior3d >= 3 && p84Recent3d <= Math.floor(p84Prior3d * 0.5)) {
    const declineRate = p84Prior3d > 0 ? 1 - (p84Recent3d / p84Prior3d) : 1
    patterns.push({
      pattern: 'longitudinal-drift',
      confidence: Math.min(0.55 + declineRate * 0.25, 0.80),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'soon',
      reason: `LONGITUDINAL DRIFT: Signal density down ${Math.round(declineRate * 100)}% vs prior 3 days (${p84Recent3d} vs ${p84Prior3d} signals). Early engagement decline. Re-engage a dormant module.`,
    })
  }

  // Pattern 85: Adaptive momentum window — systemic-thinking-mode AND signal-momentum-lock
  // both active in the same analysis window. Strategic structural cognition is firing
  // during a period of sustained multi-day engagement. The builder has momentum AND a plan.
  const p85HasSystemicThinking = patterns.some(p => p.pattern === 'systemic-thinking-mode')
  const p85HasMomentumLock     = patterns.some(p => p.pattern === 'signal-momentum-lock')
  if (p85HasSystemicThinking && p85HasMomentumLock) {
    patterns.push({
      pattern: 'adaptive-momentum-window',
      confidence: Math.min(0.75 + (p83StructuralDepth > 9 ? (p83StructuralDepth - 9) * 0.02 : 0), 0.90),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `ADAPTIVE MOMENTUM WINDOW: Systemic thinking active during sustained engagement streak. Strategic cognition confirmed across a multi-day signal run. The architecture is building with continuity.`,
    })
  }

  // Pattern 86: Vitality strategy peak — circadian-vitality-peak AND systemic-thinking-mode
  // both fire in same analysis window. The biological prime window open AND structural
  // cognitive mode active simultaneously — the optimal design and execution window.
  const p86HasVitalityPeak     = patterns.some(p => p.pattern === 'circadian-vitality-peak')
  const p86HasSystemicThinking = patterns.some(p => p.pattern === 'systemic-thinking-mode')
  if (p86HasVitalityPeak && p86HasSystemicThinking) {
    patterns.push({
      pattern: 'vitality-strategy-peak',
      confidence: Math.min(0.78 + (p82PositiveMoodsEarly.length - 2) * 0.05, 0.92),
      suggestedWidget: 'memory',
      suggestedTiming: 'immediate',
      reason: `VITALITY STRATEGY PEAK: Biological prime window confirmed + structural cognition active. Biology and strategy aligned. This is the highest-capacity design window. Anchor decisions made here.`,
    })
  }

  // Pattern 87: Weekly story reflection — lot_ai_story log exists for this week AND
  // operator journaled (note/journal) within 24h. The operator read their own arc
  // and responded in writing. Reflection loop closed.
  const p87StorySignal = signals.find(s => s.source === 'log' && s.signal === 'lot_ai_story')
  const p87JournalRecent = signals.filter(s => s.source === 'journal' && now - s.timestamp < 24 * 60 * 60 * 1000)
  if (p87StorySignal && p87JournalRecent.length >= 1) {
    patterns.push({
      pattern: 'weekly-story-reflection',
      confidence: 0.72,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `WEEKLY STORY REFLECTION: Weekly arc delivered + journal entry within 24h. Reflection loop closed. Operator is processing their own pattern record.`,
    })
  }

  // Pattern 88: Contextual check-in momentum — 3+ emotional_checkins in 24h with ≥50% positive.
  // High-frequency self-reporting with net-positive valence. The system is being used
  // as intended: frequent micro-reads of internal state, signal density rising, tone net-forward.
  const p88Checkins24h = signals.filter(s => s.source === 'energy' && now - s.timestamp < 24 * 60 * 60 * 1000)
  const p88Positive = p88Checkins24h.filter(s => {
    const POSITIVE = new Set(['energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful', 'excited', 'grounded', 'focused', 'flowing', 'steady'])
    return POSITIVE.has(s.signal)
  })
  if (p88Checkins24h.length >= 3 && p88Positive.length >= Math.ceil(p88Checkins24h.length * 0.5)) {
    const positiveRate = p88Positive.length / p88Checkins24h.length
    patterns.push({
      pattern: 'contextual-checkin-momentum',
      confidence: Math.min(0.65 + positiveRate * 0.20, 0.85),
      suggestedWidget: 'energy',
      suggestedTiming: 'passive',
      reason: `CONTEXTUAL CHECK-IN MOMENTUM: ${p88Checkins24h.length} check-ins in 24h, ${Math.round(positiveRate * 100)}% positive. High-frequency self-tracking with net-forward valence. Signal density healthy.`,
    })
  }

  // Pattern 89: Quantum learning spiral — memory 3+ in 7d + journal 150+ words in 7d + badge_unlock in 7d.
  // Deep learning loop: knowledge capture → reflection → discovery co-firing simultaneously.
  const p89Cut = now - 7 * 24 * 60 * 60 * 1000
  const p89Memory = signals.filter(s => s.source === 'memory' && s.timestamp > p89Cut)
  const p89Journal = signals.filter(s => s.source === 'journal' && s.timestamp > p89Cut)
  const p89JournalWords = p89Journal.reduce((sum, s) => sum + ((s.metadata?.wordCount as number) ?? 0), 0)
  const p89Badge = signals.filter(s => s.source === 'badges' && s.timestamp > p89Cut)
  if (p89Memory.length >= 3 && p89JournalWords >= 150 && p89Badge.length >= 1) {
    patterns.push({
      pattern: 'quantum-learning-spiral',
      confidence: Math.min(0.68 + (p89Memory.length - 3) * 0.04 + (p89Badge.length - 1) * 0.04, 0.88),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `QUANTUM LEARNING SPIRAL: ${p89Memory.length} memories + ${p89JournalWords}w journal + ${p89Badge.length} badge(s) in 7d. Knowledge capture, reflection, and discovery simultaneously active. Deep learning loop confirmed.`,
    })
  }

  // Pattern 90: Accountability arc — intention set + cohort message + goal action within 7d.
  // External commitment loop: declare → share → execute. The social execution gate.
  const p90Cut = now - 7 * 24 * 60 * 60 * 1000
  const p90Intention = signals.filter(s => s.source === 'intentions' && s.timestamp > p90Cut)
  const p90Cohort = signals.filter(s => s.source === 'cohort' && s.timestamp > p90Cut)
  const p90Goals = signals.filter(s => s.source === 'goals' && s.timestamp > p90Cut)
  if (p90Intention.length >= 1 && p90Cohort.length >= 1 && p90Goals.length >= 1) {
    const depth = p90Intention.length + p90Goals.length
    patterns.push({
      pattern: 'accountability-arc',
      confidence: Math.min(0.70 + depth * 0.04, 0.90),
      suggestedWidget: 'cohort',
      suggestedTiming: 'passive',
      reason: `ACCOUNTABILITY ARC: Intention set + cohort message + goal action within 7d. External commitment loop closed — declared, shared, executed.`,
    })
  }

  // Pattern 91: Full-presence arc — morning signal (before 09:00) AND evening signal (18:00–23:00)
  // recorded on the same calendar day. The most complete single-day engagement arc.
  const p91Today = new Date()
  const p91DateStr = `${p91Today.getFullYear()}-${String(p91Today.getMonth() + 1).padStart(2, '0')}-${String(p91Today.getDate()).padStart(2, '0')}`
  const p91Morning = signals.filter(s => {
    const d = new Date(s.timestamp)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return ds === p91DateStr && d.getHours() < 9
  })
  const p91Evening = signals.filter(s => {
    const d = new Date(s.timestamp)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return ds === p91DateStr && d.getHours() >= 18 && d.getHours() < 23
  })
  if (p91Morning.length >= 1 && p91Evening.length >= 1) {
    patterns.push({
      pattern: 'full-presence-arc',
      confidence: 0.82,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `FULL PRESENCE ARC: Morning signal (before 09:00) + evening signal (18:00–23:00) on same calendar day. Complete day captured. Both arcs closed.`,
    })
  }

  // Pattern 92: Systemic readiness peak — energy + clarity + alignment all positive, no critical patterns,
  // physiological readiness > 70. Full biological and cognitive stack simultaneously clear.
  const p92Energy = state.userState.energy === 'high' || state.userState.energy === 'moderate'
  const p92Clarity = state.userState.clarity === 'focused' || state.userState.clarity === 'clear'
  const p92Alignment = state.userState.alignment === 'flowing' || state.userState.alignment === 'aligned'
  const p92NoCritical = !patterns.some(p =>
    ['physiological-depletion', 'sleep-debt-accumulation', 'recovery-plateau', 'longitudinal-drift'].includes(p.pattern)
  )
  const p92Recent = signals.filter(s => s.timestamp > now - 4 * 60 * 60 * 1000)
  const p92Sources = new Set(p92Recent.map(s => s.source))
  if (p92Energy && p92Clarity && p92Alignment && p92NoCritical && p92Sources.size >= 3) {
    patterns.push({
      pattern: 'systemic-readiness-peak',
      confidence: 0.85,
      suggestedWidget: 'planner',
      suggestedTiming: 'immediate',
      reason: `SYSTEMIC READINESS PEAK: Energy ${state.userState.energy} · clarity ${state.userState.clarity} · alignment ${state.userState.alignment} · ${p92Sources.size} active sources. Full biological and cognitive stack simultaneously clear.`,
    })
  }

  // Pattern 93: Daily rhythm lock — morning signal (before 10:00) AND evening signal (after 18:00)
  // detected on 3+ consecutive calendar days in the past week. Diurnal regularity confirmed.
  const p93Cut = now - 7 * 24 * 60 * 60 * 1000
  const p93Week = signals.filter(s => s.timestamp > p93Cut)
  const p93DayMap: Record<string, { morning: boolean; evening: boolean }> = {}
  p93Week.forEach(s => {
    const d = new Date(s.timestamp)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!p93DayMap[ds]) p93DayMap[ds] = { morning: false, evening: false }
    if (d.getHours() < 10) p93DayMap[ds].morning = true
    if (d.getHours() >= 18) p93DayMap[ds].evening = true
  })
  const p93CompleteDays = Object.values(p93DayMap).filter(v => v.morning && v.evening).length
  if (p93CompleteDays >= 3) {
    patterns.push({
      pattern: 'daily-rhythm-lock',
      confidence: Math.min(0.75 + (p93CompleteDays - 3) * 0.05, 0.92),
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `DAILY RHYTHM LOCK: ${p93CompleteDays} complete days (morning + evening) in past 7d. Diurnal arc confirmed — the rhythm is structural.`,
    })
  }

  // Pattern 94: Cross-domain mastery — memory 5+, journal 200+w, badges 2+, goals 2+, planner 2+
  // all in a 7-day window. Full spectrum engagement: capture, reflection, discovery, goals, structure.
  const p94Cut = now - 7 * 24 * 60 * 60 * 1000
  const p94Memory  = signals.filter(s => s.source === 'memory'    && s.timestamp > p94Cut)
  const p94Journal = signals.filter(s => s.source === 'journal'   && s.timestamp > p94Cut)
  const p94JWords  = p94Journal.reduce((sum, s) => sum + ((s.metadata?.wordCount as number) ?? 0), 0)
  const p94Badges  = signals.filter(s => s.source === 'badges'    && s.timestamp > p94Cut)
  const p94Goals   = signals.filter(s => s.source === 'goals'     && s.timestamp > p94Cut)
  const p94Planner = signals.filter(s => s.source === 'planner'   && s.timestamp > p94Cut)
  if (p94Memory.length >= 5 && p94JWords >= 200 && p94Badges.length >= 2 && p94Goals.length >= 2 && p94Planner.length >= 2) {
    patterns.push({
      pattern: 'cross-domain-mastery',
      confidence: Math.min(0.72 + (p94Memory.length - 5) * 0.03, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `CROSS-DOMAIN MASTERY: ${p94Memory.length} memories · ${p94JWords}w journal · ${p94Badges.length} badges · ${p94Goals.length} goals · ${p94Planner.length} plans in 7d. Full engagement spectrum active simultaneously.`,
    })
  }

  // Pattern 95: Intent-to-action gap — intention set in last 24h with no planner/goal in same window.
  // Early decay signal before P47's 48h threshold fires. Indicates intention not yet anchored.
  const p95Cut = now - 24 * 60 * 60 * 1000
  const p95Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p95Cut)
  const p95Plans      = signals.filter(s => (s.source === 'planner' || s.source === 'goals') && s.timestamp > p95Cut)
  if (p95Intentions.length >= 1 && p95Plans.length === 0) {
    const gapMinutes = Math.round((now - Math.max(...p95Intentions.map(s => s.timestamp))) / 60000)
    patterns.push({
      pattern: 'intent-to-action-gap',
      confidence: Math.min(0.60 + p95Intentions.length * 0.06, 0.78),
      suggestedWidget: 'planner',
      suggestedTiming: 'active',
      reason: `INTENT GAP: ${p95Intentions.length} intention(s) set — no plan or goal in 24h. Gap: ${gapMinutes}m. Bridge intention to structure now.`,
    })
  }

  // Pattern 96: Recovery initiation — first selfcare signal after depleted/low energy same day.
  // The arc begins. Biology re-engaging after a drain cycle.
  const p96TodayStart = new Date(now)
  p96TodayStart.setHours(0, 0, 0, 0)
  const p96TodaySelfcare = signals.filter(s => s.source === 'selfcare' && s.timestamp >= p96TodayStart.getTime())
  const p96TodayEnergy   = signals.filter(s => s.source === 'energy'   && s.timestamp >= p96TodayStart.getTime())
  const p96PriorEnergy   = p96TodayEnergy.filter(s => (s.metadata?.level as string | undefined) === 'depleted' || (s.metadata?.level as string | undefined) === 'low')
  if (p96TodaySelfcare.length >= 1 && p96TodaySelfcare.length <= 2 && p96PriorEnergy.length >= 1) {
    patterns.push({
      pattern: 'recovery-initiation',
      confidence: 0.72,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'active',
      reason: `RECOVERY ARC: First selfcare signal detected after depleted/low energy today. Arc begins — ${p96TodaySelfcare.length} signal(s). Support the re-entry.`,
    })
  }

  // Pattern 97: Cognitive-vitality sync — journal 150+w + memory capture when energy=high AND clarity=focused.
  // Biology powering cognition. Dual-system activation: body and mind aligned.
  const p97Cut       = now - 24 * 60 * 60 * 1000
  const p97Journal   = signals.filter(s => s.source === 'journal' && s.timestamp > p97Cut)
  const p97JWords    = p97Journal.reduce((sum, s) => sum + ((s.metadata?.wordCount as number) ?? 0), 0)
  const p97Memory    = signals.filter(s => s.source === 'memory' && s.timestamp > p97Cut)
  const p97HighEnergy = signals.filter(s =>
    s.source === 'energy' && s.timestamp > p97Cut &&
    ((s.metadata?.level as string | undefined) === 'high' || (s.metadata?.band as string | undefined) === 'high')
  )
  if (p97JWords >= 150 && p97Memory.length >= 1 && p97HighEnergy.length >= 1) {
    patterns.push({
      pattern: 'cognitive-vitality-sync',
      confidence: Math.min(0.72 + p97Memory.length * 0.04 + (p97JWords >= 300 ? 0.12 : 0), 0.88),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `COGNITIVE SYNC: ${p97JWords}w journal + ${p97Memory.length} memory captures during high energy. Biology powering cognition — dual-system activation confirmed.`,
    })
  }

  // Pattern 98: Action-completion-arc — intention set AND planner/goal recorded in same 24h window.
  // Resolution of P95. The gap is closed. Intention has become structure.
  const p98Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p95Cut)
  const p98Plans      = signals.filter(s => (s.source === 'planner' || s.source === 'goals') && s.timestamp > p95Cut)
  if (p98Intentions.length >= 1 && p98Plans.length >= 1) {
    patterns.push({
      pattern: 'action-completion-arc',
      confidence: Math.min(0.65 + p98Plans.length * 0.07 + p98Intentions.length * 0.04, 0.82),
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `COMPLETION ARC: ${p98Intentions.length} intention(s) → ${p98Plans.length} plan/goal in 24h. Gap closed. Intention is now structure.`,
    })
  }

  // Pattern 99: Biological-restoration-peak — depleted/low energy → 3+ selfcare acts → moderate/high energy same day.
  // Full recovery arc completed within a single day. Biology rebounded.
  const p99TodaySelfcare    = signals.filter(s => s.source === 'selfcare' && s.timestamp >= p96TodayStart.getTime())
  const p99TodayHighEnergy  = signals.filter(s =>
    s.source === 'energy' && s.timestamp >= p96TodayStart.getTime() &&
    ((s.metadata?.level as string | undefined) === 'moderate' || (s.metadata?.level as string | undefined) === 'high' ||
     (s.metadata?.band  as string | undefined) === 'moderate'  || (s.metadata?.band  as string | undefined) === 'high')
  )
  if (p99TodaySelfcare.length >= 3 && p96PriorEnergy.length >= 1 && p99TodayHighEnergy.length >= 1) {
    patterns.push({
      pattern: 'biological-restoration-peak',
      confidence: Math.min(0.70 + p99TodaySelfcare.length * 0.05, 0.88),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `BIOL RESTORE: ${p99TodaySelfcare.length} selfcare signals — depleted/low → moderate/high today. Recovery arc complete.`,
    })
  }

  // Pattern 100: Centennial Convergence — all 6 primary signal sources active with high energy + positive mood within 12h.
  // Milestone pattern. The rarest and highest-coherence state in the QIE.
  const p100Cut        = now - 12 * 60 * 60 * 1000
  const p100Signals    = signals.filter(s => s.timestamp > p100Cut)
  const p100Sources    = new Set(p100Signals.map(s => s.source))
  const p100Primary    = ['journal', 'memory', 'planner', 'selfcare', 'intentions', 'mood']
  const p100AllActive  = p100Primary.every(src => p100Sources.has(src))
  const p100HighEnergy = signals.some(s =>
    s.source === 'energy' && s.timestamp > p100Cut &&
    ((s.metadata?.level as string | undefined) === 'high' || (s.metadata?.band as string | undefined) === 'high')
  )
  const p100PosMood    = signals.some(s =>
    s.source === 'mood' && s.timestamp > p100Cut &&
    ['calm', 'energized', 'hopeful', 'excited', 'grateful', 'peaceful', 'fulfilled'].includes(s.signal)
  )
  if (p100AllActive && p100HighEnergy && p100PosMood) {
    patterns.push({
      pattern: 'centennial-convergence',
      confidence: Math.min(0.82 + Math.max(0, p100Signals.length - 10) * 0.01, 0.97),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `CENTENNIAL: All 6 primary sources active · high energy · positive mood within 12h. P100 — rarest system state.`,
    })
  }

  // Pattern 101: Quantum-presence-arc — all 6 primary sources active in a 48h window.
  // Wider persistence window than P100 (12h). Tracks sustained operator presence across two days.
  const p101Cut      = now - 48 * 60 * 60 * 1000
  const p101Signals  = signals.filter(s => s.timestamp > p101Cut)
  const p101Sources  = new Set(p101Signals.map(s => s.source))
  const p101Primary  = ['journal', 'memory', 'planner', 'selfcare', 'intentions', 'mood']
  const p101AllActive = p101Primary.every(src => p101Sources.has(src))
  if (p101AllActive) {
    patterns.push({
      pattern: 'quantum-presence-arc',
      confidence: Math.min(0.70 + p101Sources.size * 0.02 + p101Signals.length * 0.005, 0.85),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QPRES: ${p101Primary.length}/${p101Primary.length} primary channels active in 48h. ${p101Sources.size} total sources. Operator fully present.`,
    })
  }

  // Pattern 102: Planner-intention-sync — intentions + plan_set both fire within a 2h window.
  // Structural alignment: stated intention AND planned structure in the same session.
  const p102Cut       = now - 2 * 60 * 60 * 1000
  const p102Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p102Cut)
  const p102Plans      = signals.filter(s => s.source === 'planner' && s.timestamp > p102Cut)
  if (p102Intentions.length >= 1 && p102Plans.length >= 1) {
    patterns.push({
      pattern: 'planner-intention-sync',
      confidence: Math.min(0.68 + p102Intentions.length * 0.04 + p102Plans.length * 0.04, 0.82),
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `PSYNC: ${p102Intentions.length} intention(s) + ${p102Plans.length} plan(s) in 2h window. Intent and structure aligned.`,
    })
  }

  // Pattern 103: Resilience-cascade — depleted/low energy → 2+ selfcare acts → memory capture + positive mood, all within 18h.
  // Full inner recovery loop with knowledge capture. Extends P48 (recovery-velocity) to include knowledge consolidation.
  const p103Cut       = now - 18 * 60 * 60 * 1000
  const p103Depleted  = signals.filter(s =>
    s.source === 'energy' && s.timestamp > p103Cut &&
    ((s.metadata?.level as string | undefined) === 'depleted' || (s.metadata?.level as string | undefined) === 'low' ||
     (s.metadata?.band  as string | undefined) === 'depleted'  || (s.metadata?.band  as string | undefined) === 'low')
  )
  const p103Selfcare  = signals.filter(s => s.source === 'selfcare' && s.timestamp > p103Cut)
  const p103Memory    = signals.filter(s => s.source === 'memory' && s.timestamp > p103Cut)
  const p103PosMood   = signals.some(s =>
    s.source === 'mood' && s.timestamp > p103Cut &&
    ['calm', 'energized', 'hopeful', 'excited', 'grateful', 'peaceful', 'content', 'fulfilled'].includes(s.signal)
  )
  if (p103Depleted.length >= 1 && p103Selfcare.length >= 2 && p103Memory.length >= 1 && p103PosMood) {
    patterns.push({
      pattern: 'resilience-cascade',
      confidence: Math.min(0.70 + p103Selfcare.length * 0.04 + p103Memory.length * 0.04, 0.88),
      suggestedWidget: 'memory',
      suggestedTiming: 'soon',
      reason: `RCASE: ${p103Selfcare.length} selfcare · ${p103Memory.length} memory capture · positive mood · depleted→restored within 18h. Recovery + knowledge loop closed.`,
    })
  }

  // Pattern 104: Vitality Cascade — energy high + selfcare 3+ in 24h + positive mood + journal entry.
  // Proactive peak maintenance: all biological systems tended simultaneously while at full capacity.
  // Distinct from P99 (restoration from depleted) — P104 fires when already high and care momentum active.
  const p104Cut       = now - 24 * 60 * 60 * 1000
  const p104Selfcare  = signals.filter(s => s.source === 'selfcare' && s.timestamp > p104Cut)
  const p104Journal   = signals.filter(s => s.source === 'journal'  && s.timestamp > p104Cut)
  const p104PosMood   = signals.some(s =>
    s.source === 'mood' && s.timestamp > p104Cut &&
    ['calm', 'energized', 'hopeful', 'peaceful', 'content', 'fulfilled', 'excited', 'grateful'].includes(s.signal)
  )
  const p104HighEnergy = state.userState.energy === 'high'
  if (p104HighEnergy && p104Selfcare.length >= 3 && p104PosMood && p104Journal.length >= 1) {
    patterns.push({
      pattern: 'vitality-cascade',
      confidence: Math.min(0.78 + (p104Selfcare.length - 3) * 0.04, 0.90),
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `VITAL CASCADE: High energy + ${p104Selfcare.length} selfcare acts + positive mood + journal — proactive peak maintenance. All biological systems tended at full capacity.`,
    })
  }

  // Pattern 105: Social Presence Arc — cohort viewed + message/connection signal + intentions set
  // all within 48h. Social dimension fully active: community + outreach + personal direction aligned.
  // Complements P44 (social-resonance-arc) with a faster 48h window focused on direction, not reflection.
  const p105Cut       = now - 48 * 60 * 60 * 1000
  const p105Cohort    = signals.filter(s => s.source === 'cohort' && s.timestamp > p105Cut)
  const p105Message   = signals.filter(s =>
    (s.source === 'cohort' || s.source === 'log') && s.timestamp > p105Cut &&
    (s.signal === 'message_sent' || s.signal === 'chat_message' || s.signal === 'connection_accepted' || s.signal === 'direct_message_sent')
  )
  const p105Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p105Cut)
  if (p105Cohort.length >= 1 && p105Message.length >= 1 && p105Intentions.length >= 1) {
    const p105Conf = Math.min(0.70 + p105Cohort.length * 0.04 + p105Intentions.length * 0.03, 0.85)
    patterns.push({
      pattern: 'social-presence-arc',
      confidence: p105Conf,
      suggestedWidget: 'cohort',
      suggestedTiming: 'passive',
      reason: `SOC ARC: ${p105Cohort.length} cohort signal(s) + ${p105Message.length} outreach + ${p105Intentions.length} intention(s) in 48h. Social dimension alive — community, connection, and direction all confirmed.`,
    })
  }

  // Pattern 106: Clarity Momentum Peak — clarity=focused + planner 2+ + memory 2+ + intentions 2+ in 24h.
  // Cognitive performance at structural peak: stated direction backed by both planning and knowledge capture.
  // High confidence because it requires multi-system coherence: direction + structure + knowledge simultaneously.
  const p106Cut        = now - 24 * 60 * 60 * 1000
  const p106Planner    = signals.filter(s => s.source === 'planner'    && s.timestamp > p106Cut)
  const p106Memory     = signals.filter(s => s.source === 'memory'     && s.timestamp > p106Cut)
  const p106Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p106Cut)
  const p106Focused    = state.userState.clarity === 'focused'
  if (p106Focused && p106Planner.length >= 2 && p106Memory.length >= 2 && p106Intentions.length >= 2) {
    const p106Conf = Math.min(0.80 + (p106Planner.length - 2) * 0.03 + (p106Memory.length - 2) * 0.03, 0.92)
    patterns.push({
      pattern: 'clarity-momentum-peak',
      confidence: p106Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `CLAR PEAK: Focused clarity + ${p106Planner.length} plans + ${p106Memory.length} memories + ${p106Intentions.length} intentions in 24h. Cognitive peak confirmed — direction, structure, and knowledge all live simultaneously.`,
    })
  }

  // Pattern 107: Temporal Alignment Peak — planner 2+ + intentions 2+ in 48h window, calendar entry present.
  // Operator is mapping future time. Structure (planner) and declared direction (intentions) aligned across 48h.
  // Detected when both scheduling and intention-setting are simultaneously active — time itself becomes a tool.
  const p107Cut        = now - 48 * 60 * 60 * 1000
  const p107Planner    = signals.filter(s => s.source === 'planner'    && s.timestamp > p107Cut)
  const p107Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p107Cut)
  const p107Calendar   = signals.filter(s =>
    (s.source === 'planner' || s.source === 'log') && s.timestamp > p107Cut &&
    (s.signal === 'event_created' || s.signal === 'calendar_entry' || s.signal === 'deadline_set' || s.signal === 'schedule_block')
  )
  if (p107Planner.length >= 2 && p107Intentions.length >= 2 && p107Calendar.length >= 1) {
    const p107Conf = Math.min(0.65 + p107Planner.length * 0.04 + p107Intentions.length * 0.03, 0.82)
    patterns.push({
      pattern: 'temporal-alignment-peak',
      confidence: p107Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `TALIGN: ${p107Planner.length} plans + ${p107Intentions.length} intentions + ${p107Calendar.length} calendar anchor(s) in 48h. Time and direction aligned — the operator is mapping the future.`,
    })
  }

  // Pattern 108: Creative Output Peak — journal 200+ words + memory capture in 24h.
  // Creative intelligence expressed and anchored: long-form writing plus knowledge storage in same window.
  // The signal pair (expression + retention) confirms both output and integration are happening.
  const p108Cut    = now - 24 * 60 * 60 * 1000
  const p108Journal = signals.filter(s => s.source === 'journal' && s.timestamp > p108Cut && (s.metadata?.wordCount as number ?? 0) >= 200)
  const p108Memory  = signals.filter(s => s.source === 'memory'  && s.timestamp > p108Cut)
  if (p108Journal.length >= 1 && p108Memory.length >= 1) {
    const p108Conf = Math.min(0.70 + p108Journal.length * 0.05 + p108Memory.length * 0.03, 0.85)
    patterns.push({
      pattern: 'creative-output-peak',
      confidence: p108Conf,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `CROUT: ${p108Journal.length} long-form journal(s) + ${p108Memory.length} memory capture(s) in 24h. Creative output and knowledge retention both confirmed — expression is being anchored.`,
    })
  }

  // Pattern 109: Full System Coherence — all 5 core signal sources (journal+memory+planner+selfcare+intentions) active in 24h.
  // Every primary dimension engaged simultaneously: creative, cognitive, structural, physical, directional.
  // The rarest and highest-signal state — full operator coherence across all tracked life domains.
  const p109Cut        = now - 24 * 60 * 60 * 1000
  const p109Journal    = signals.filter(s => s.source === 'journal'    && s.timestamp > p109Cut)
  const p109Memory     = signals.filter(s => s.source === 'memory'     && s.timestamp > p109Cut)
  const p109Planner    = signals.filter(s => s.source === 'planner'    && s.timestamp > p109Cut)
  const p109Selfcare   = signals.filter(s => s.source === 'selfcare'   && s.timestamp > p109Cut)
  const p109Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p109Cut)
  if (p109Journal.length >= 1 && p109Memory.length >= 1 && p109Planner.length >= 1 && p109Selfcare.length >= 1 && p109Intentions.length >= 1) {
    const totalSig = p109Journal.length + p109Memory.length + p109Planner.length + p109Selfcare.length + p109Intentions.length
    const p109Conf = Math.min(0.75 + totalSig * 0.02, 0.90)
    patterns.push({
      pattern: 'full-system-coherence',
      confidence: p109Conf,
      suggestedWidget: 'qos',
      suggestedTiming: 'passive',
      reason: `FSCOHERE: Journal(${p109Journal.length}) + Memory(${p109Memory.length}) + Planner(${p109Planner.length}) + Selfcare(${p109Selfcare.length}) + Intentions(${p109Intentions.length}) all active in 24h. Full operator coherence — every tracked life domain simultaneously engaged.`,
    })
  }

  // Pattern 110: Embodied Cognition Arc — selfcare + journal 150+w + memory capture in 24h.
  // The body fueling the mind: physical grounding (selfcare) while writing and capturing knowledge.
  // Confirmed when biological maintenance and cognitive expression occur in the same window.
  const p110Cut      = now - 24 * 60 * 60 * 1000
  const p110Selfcare = signals.filter(s => s.source === 'selfcare' && s.timestamp > p110Cut)
  const p110Journal  = signals.filter(s => s.source === 'journal'  && s.timestamp > p110Cut && (s.metadata?.wordCount as number ?? 0) >= 150)
  const p110Memory   = signals.filter(s => s.source === 'memory'   && s.timestamp > p110Cut)
  if (p110Selfcare.length >= 1 && p110Journal.length >= 1 && p110Memory.length >= 1) {
    const p110Conf = Math.min(0.72 + p110Journal.length * 0.04 + p110Memory.length * 0.03, 0.86)
    patterns.push({
      pattern: 'embodied-cognition-arc',
      confidence: p110Conf,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `EMBCOG: ${p110Selfcare.length} selfcare + ${p110Journal.length} long-form journal(s) + ${p110Memory.length} memory capture(s) in 24h. Body feeding mind — biological grounding and cognitive expression confirmed simultaneously.`,
    })
  }

  // Pattern 111: Intention Completion Loop — intention + planner + goal, all in 24h.
  // The full direction-to-structure-to-outcome arc closed in a single day.
  // Rare because the loop from declared intention through plan to goal execution usually spans days.
  const p111Cut        = now - 24 * 60 * 60 * 1000
  const p111Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p111Cut)
  const p111Planner    = signals.filter(s => s.source === 'planner'    && s.timestamp > p111Cut)
  const p111Goals      = signals.filter(s => s.source === 'goals'      && s.timestamp > p111Cut)
  if (p111Intentions.length >= 1 && p111Planner.length >= 1 && p111Goals.length >= 1) {
    const p111Conf = Math.min(0.75 + p111Planner.length * 0.04 + p111Goals.length * 0.04, 0.88)
    patterns.push({
      pattern: 'intention-completion-loop',
      confidence: p111Conf,
      suggestedWidget: 'intentions',
      suggestedTiming: 'passive',
      reason: `INTCMP: ${p111Intentions.length} intention(s) + ${p111Planner.length} plan(s) + ${p111Goals.length} goal action(s) in 24h. Declared direction → structure → outcome — full loop closed in one day.`,
    })
  }

  // Pattern 112: Community Intelligence Peak — cohort signal + journal + memory + intentions in 48h.
  // External social signal anchored internally through writing, capture, and direction-setting.
  // The internal-external coherence arc — what enters from others is processed and directed.
  const p112Cut        = now - 48 * 60 * 60 * 1000
  const p112Cohort     = signals.filter(s => s.source === 'cohort'     && s.timestamp > p112Cut)
  const p112Journal    = signals.filter(s => s.source === 'journal'    && s.timestamp > p112Cut)
  const p112Memory     = signals.filter(s => s.source === 'memory'     && s.timestamp > p112Cut)
  const p112Intentions = signals.filter(s => s.source === 'intentions' && s.timestamp > p112Cut)
  if (p112Cohort.length >= 1 && p112Journal.length >= 1 && p112Memory.length >= 1 && p112Intentions.length >= 1) {
    const p112Conf = Math.min(0.68 + p112Cohort.length * 0.04 + p112Memory.length * 0.03 + p112Journal.length * 0.03, 0.84)
    patterns.push({
      pattern: 'community-intelligence-peak',
      confidence: p112Conf,
      suggestedWidget: 'cohort',
      suggestedTiming: 'passive',
      reason: `COMINTEL: ${p112Cohort.length} cohort signal(s) + ${p112Journal.length} journal + ${p112Memory.length} memory + ${p112Intentions.length} intention(s) in 48h. Community signal anchored internally — external engagement driving knowledge capture and direction.`,
    })
  }

  // Pattern 113: Personal Peak Window — recurring high-performance window detected from energy
  // + intentions + log density. Person has a repeatable peak operating slot in their day.
  // Fires when ≥2 energy signals, ≥2 intention signals, and ≥2 log signals all cluster within
  // the same 4-hour window across at least 2 of the last 3 days. Peak window is worth protecting.
  const p113Window = 4 * 60 * 60 * 1000 // 4h window
  const p113ThreeDays = now - 3 * 24 * 60 * 60 * 1000
  const p113Energy    = signals.filter(s => s.source === 'energy'     && s.timestamp > p113ThreeDays)
  const p113Intent    = signals.filter(s => s.source === 'intentions' && s.timestamp > p113ThreeDays)
  const p113Log       = signals.filter(s => s.source === 'log'        && s.timestamp > p113ThreeDays)
  // Group by calendar day, find days where energy+intent+log all cluster in a shared 4h band
  const p113Days = [0, 1, 2].map(daysBack => {
    const dayStart = new Date(now); dayStart.setDate(dayStart.getDate() - daysBack); dayStart.setHours(0,0,0,0)
    const dayEnd   = dayStart.getTime() + 24 * 60 * 60 * 1000
    const dE = p113Energy.filter(s => s.timestamp >= dayStart.getTime() && s.timestamp < dayEnd)
    const dI = p113Intent.filter(s => s.timestamp >= dayStart.getTime() && s.timestamp < dayEnd)
    const dL = p113Log.filter(s => s.timestamp >= dayStart.getTime() && s.timestamp < dayEnd)
    if (dE.length === 0 || dI.length === 0 || dL.length === 0) return false
    // Check if any 4h window contains ≥1 from each source
    const allTs = [...dE, ...dI, ...dL].map(s => s.timestamp).sort((a,b) => a-b)
    return allTs.some(anchor =>
      dE.some(s => s.timestamp >= anchor && s.timestamp < anchor + p113Window) &&
      dI.some(s => s.timestamp >= anchor && s.timestamp < anchor + p113Window) &&
      dL.some(s => s.timestamp >= anchor && s.timestamp < anchor + p113Window)
    )
  })
  const p113ActiveDays = p113Days.filter(Boolean).length
  if (p113ActiveDays >= 2) {
    const p113Conf = Math.min(0.65 + p113ActiveDays * 0.08 + p113Energy.length * 0.02, 0.88)
    patterns.push({
      pattern: 'personal-peak-window',
      confidence: p113Conf,
      suggestedWidget: 'energy',
      suggestedTiming: 'passive',
      reason: `PPEAK: Peak performance window detected across ${p113ActiveDays}/3 recent days. Energy ${p113Energy.length} · Intent ${p113Intent.length} · Log ${p113Log.length} signals cluster in recurring 4h band. Protect this window — it is your repeatable operating slot.`,
    })
  }

  // Pattern 114: Recovery Momentum — active recovery building measurable forward motion.
  // Fires when selfcare + resilience + energy signals are rising in density over the last
  // 48h vs the prior 48h, AND no peak-depletion pattern is active. Recovery is not rest —
  // it is directed restoration with detectable momentum.
  const p114Window48 = 48 * 60 * 60 * 1000
  const p114Recent   = signals.filter(s => s.timestamp > now - p114Window48)
  const p114Prior    = signals.filter(s => s.timestamp > now - 2 * p114Window48 && s.timestamp <= now - p114Window48)
  const p114RecSrc   = (bucket: IntentionSignal[]) => ({
    sc: bucket.filter(s => s.source === 'selfcare').length,
    rs: bucket.filter(s => s.source === 'resilience').length,
    en: bucket.filter(s => s.source === 'energy').length,
  })
  const p114R = p114RecSrc(p114Recent); const p114P = p114RecSrc(p114Prior)
  const p114RecoveryTotal  = p114R.sc + p114R.rs + p114R.en
  const p114PriorTotal     = p114P.sc + p114P.rs + p114P.en
  const p114NoDepletion    = !patterns.some(p => ['physiological-depletion','sleep-debt-accumulation'].includes(p.pattern))
  if (p114RecoveryTotal >= 3 && p114RecoveryTotal > p114PriorTotal && p114NoDepletion) {
    const p114Gain = p114RecoveryTotal - p114PriorTotal
    const p114Conf = Math.min(0.62 + p114Gain * 0.06 + p114RecoveryTotal * 0.03, 0.87)
    patterns.push({
      pattern: 'recovery-momentum',
      confidence: p114Conf,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `RMOM: Recovery momentum active — selfcare ${p114R.sc} + resilience ${p114R.rs} + energy ${p114R.en} signals in 48h (vs ${p114PriorTotal} prior period, +${p114Gain}). No depletion present. Directed restoration building forward velocity.`,
    })
  }

  // Pattern 115: Signal Inception — QIE observing its own observation loop. Fires when
  // qos + memory + journal + intentions signals are all present in the last 24h AND
  // ≥5 distinct sources reported in that window. System is aware of its own signal graph.
  // This is the meta-pattern: the person is operating with conscious awareness of their QOS.
  const p115Window = 24 * 60 * 60 * 1000
  const p115Recent = signals.filter(s => s.timestamp > now - p115Window)
  const p115Sources = new Set(p115Recent.map(s => s.source))
  const p115HasCore = ['qos','memory','journal','intentions'].every(src => p115Sources.has(src as IntentionSignal['source']))
  if (p115HasCore && p115Sources.size >= 5) {
    const p115Conf = Math.min(0.60 + (p115Sources.size - 5) * 0.05 + p115Recent.length * 0.01, 0.90)
    patterns.push({
      pattern: 'signal-inception',
      confidence: p115Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `INCEP: Signal inception active — ${p115Sources.size} distinct sources in 24h (${[...p115Sources].join(', ')}). QOS + memory + journal + intentions all present. QIE is observing its own observation loop. Operating with full system awareness.`,
    })
  }

  // Pattern 116: Focus Depth Arc — journal 100+w + memory capture + planner all fired
  // in a rolling 2h window. Short cognitive depth confirmed: the person is simultaneously
  // writing, capturing, and structuring. Signals: journal + memory + planner in tight band.
  const p116Window = 2 * 60 * 60 * 1000
  const p116Recent = signals.filter(s => s.timestamp > now - p116Window)
  const p116Journal   = p116Recent.filter(s => s.source === 'journal' && (s.metadata?.wordCount ?? 0) >= 100)
  const p116Memory    = p116Recent.filter(s => s.source === 'memory')
  const p116Planner   = p116Recent.filter(s => s.source === 'planner')
  if (p116Journal.length >= 1 && p116Memory.length >= 1 && p116Planner.length >= 1) {
    const p116Conf = Math.min(0.65 + p116Journal.length * 0.06 + p116Memory.length * 0.04 + p116Planner.length * 0.04, 0.85)
    patterns.push({
      pattern: 'focus-depth-arc',
      confidence: p116Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `FDEP: Focus depth arc active — journal ${p116Journal.length} (100+w) + memory ${p116Memory.length} + planner ${p116Planner.length} in 2h window. Cognitive writing, capture, and structure aligned. Deep execution window confirmed.`,
    })
  }

  // Pattern 117: Sleep Signal Anchor — first log entry after 07:00 + energy check-in
  // before 09:00. Biological morning anchor confirmed. Person is grounding their day in
  // biological signal before cognitive load. Steady operating baseline established.
  const p117Today  = new Date(); p117Today.setHours(0, 0, 0, 0)
  const p117TodayMs = p117Today.getTime()
  const p117After7  = p117TodayMs + 7 * 60 * 60 * 1000
  const p117Before9 = p117TodayMs + 9 * 60 * 60 * 1000
  const p117Morning  = signals.filter(s => s.timestamp >= p117After7 && s.timestamp < p117Before9)
  const p117HasFirst = signals.some(s => s.timestamp >= p117After7 && s.timestamp < p117TodayMs + 24 * 60 * 60 * 1000)
  const p117Energy   = p117Morning.filter(s => s.source === 'energy')
  const p117Log      = p117Morning.filter(s => s.source === 'log')
  if (p117HasFirst && p117Energy.length >= 1 && (p117Log.length + p117Energy.length) >= 2) {
    const p117Conf = Math.min(0.68 + p117Energy.length * 0.05 + p117Morning.length * 0.02, 0.82)
    patterns.push({
      pattern: 'sleep-signal-anchor',
      confidence: p117Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `SANCH: Sleep signal anchor confirmed — first entry after 07:00, energy check-in before 09:00. Biological baseline grounded before cognitive load. ${p117Morning.length} morning signals detected. Steady anchor active.`,
    })
  }

  // Pattern 118: Care Intelligence Loop — selfcare + memory capture + journal all in
  // the same 24h window. Body-mind knowledge integration: the person is simultaneously
  // caring for the physical substrate and encoding the experience into structured memory
  // and written reflection. Mind-body knowledge loop closed.
  const p118Window = 24 * 60 * 60 * 1000
  const p118Recent   = signals.filter(s => s.timestamp > now - p118Window)
  const p118Selfcare = p118Recent.filter(s => s.source === 'selfcare')
  const p118Memory   = p118Recent.filter(s => s.source === 'memory')
  const p118Journal  = p118Recent.filter(s => s.source === 'journal')
  if (p118Selfcare.length >= 1 && p118Memory.length >= 1 && p118Journal.length >= 1) {
    const p118Conf = Math.min(0.62 + p118Selfcare.length * 0.05 + p118Memory.length * 0.05 + p118Journal.length * 0.04, 0.80)
    patterns.push({
      pattern: 'care-intelligence-loop',
      confidence: p118Conf,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `CINTEL: Care intelligence loop active — selfcare ${p118Selfcare.length} + memory ${p118Memory.length} + journal ${p118Journal.length} in 24h. Body-mind knowledge integration confirmed. Physical care feeding cognitive encoding and reflective output.`,
    })
  }

  // Pattern 119: Morning Coherence Arc — energy check-in + planner entry + intentions
  // all confirmed in the morning window (before 10:00 local). Full dawn ramp: body read,
  // plan set, direction confirmed. Structured launch baseline active before cognitive load.
  const p119Today = new Date(); p119Today.setHours(0, 0, 0, 0)
  const p119TodayMs = p119Today.getTime()
  const p119Window = p119TodayMs + 10 * 60 * 60 * 1000 // before 10:00
  const p119Morning = signals.filter(s => s.timestamp >= p119TodayMs && s.timestamp < p119Window)
  const p119Energy    = p119Morning.filter(s => s.source === 'energy')
  const p119Planner   = p119Morning.filter(s => s.source === 'planner')
  const p119Intention = p119Morning.filter(s => s.source === 'intentions')
  if (p119Energy.length >= 1 && p119Planner.length >= 1 && p119Intention.length >= 1) {
    const p119Total = p119Energy.length + p119Planner.length + p119Intention.length
    const p119Conf = Math.min(0.65 + p119Total * 0.04, 0.87)
    patterns.push({
      pattern: 'morning-coherence-arc',
      confidence: p119Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `MCOHERE: Morning coherence arc active — energy ${p119Energy.length} + planner ${p119Planner.length} + intentions ${p119Intention.length} all before 10:00. Body read, plan set, direction confirmed. Dawn execution baseline locked.`,
    })
  }

  // Pattern 120: Signal Density Peak — 6+ distinct signal sources active in a 12h
  // rolling window. Maximum operating bandwidth confirmed. Full-spectrum engagement
  // across physiological, cognitive, and structural channels simultaneously.
  const p120Window = 12 * 60 * 60 * 1000
  const p120Recent = signals.filter(s => s.timestamp > now - p120Window)
  const p120Sources = new Set(p120Recent.map(s => s.source))
  if (p120Sources.size >= 6) {
    const p120Conf = Math.min(0.68 + (p120Sources.size - 6) * 0.04, 0.90)
    patterns.push({
      pattern: 'signal-density-peak',
      confidence: p120Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `SIGPEAK: Signal density peak — ${p120Sources.size} distinct sources active in 12h: ${[...p120Sources].join(' · ')}. Full-spectrum operating bandwidth confirmed. Maximum engagement breadth active.`,
    })
  }

  // Pattern 121: Physiological Coherence Window — energy=high + selfcare 2+ + positive
  // mood + memory capture all in a 12h window. Physical substrate and cognitive encoding
  // simultaneously at peak. Body-mind coherence confirmed across all primary channels.
  const p121Window = 12 * 60 * 60 * 1000
  const p121Recent = signals.filter(s => s.timestamp > now - p121Window)
  const p121Energy   = p121Recent.filter(s => s.source === 'energy' && s.signal === 'high')
  const p121Selfcare = p121Recent.filter(s => s.source === 'selfcare')
  const p121Mood     = p121Recent.filter(s => s.source === 'mood' && ['energized', 'hopeful', 'excited', 'calm'].includes(s.signal))
  const p121Memory   = p121Recent.filter(s => s.source === 'memory')
  if (p121Energy.length >= 1 && p121Selfcare.length >= 2 && p121Mood.length >= 1 && p121Memory.length >= 1) {
    const p121Conf = Math.min(0.70 + p121Selfcare.length * 0.04 + p121Memory.length * 0.03, 0.88)
    patterns.push({
      pattern: 'physiological-coherence-window',
      confidence: p121Conf,
      suggestedWidget: 'energy',
      suggestedTiming: 'passive',
      reason: `PCOHERE: Physiological coherence window active — energy=high + selfcare ${p121Selfcare.length} + positive mood ${p121Mood.length} + memory ${p121Memory.length} in 12h. Physical and cognitive substrate at peak simultaneously. Body-mind coherence window confirmed.`,
    })
  }

  // Pattern 122: Action-to-Memory Loop — planner/intentions + memory capture in a 6h
  // rolling window. Execution crystallized immediately into retrievable knowledge. The
  // fastest knowledge compression pathway: action → encoding → archive in one session.
  const p122Window    = 6 * 60 * 60 * 1000
  const p122Recent    = signals.filter(s => s.timestamp > now - p122Window)
  const p122Planner   = p122Recent.filter(s => s.source === 'planner')
  const p122Intention = p122Recent.filter(s => s.source === 'intentions')
  const p122Memory    = p122Recent.filter(s => s.source === 'memory')
  const p122Action    = p122Planner.length + p122Intention.length
  if (p122Action >= 1 && p122Memory.length >= 1) {
    const p122Conf = Math.min(0.64 + p122Memory.length * 0.05 + p122Action * 0.03, 0.86)
    patterns.push({
      pattern: 'action-to-memory-loop',
      confidence: p122Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `ACTMEM: Action-to-memory loop — planner ${p122Planner.length} + intentions ${p122Intention.length} → memory ${p122Memory.length} in 6h. Execution crystallized into retrievable knowledge. Action → encoding → archive pipeline confirmed.`,
    })
  }

  // Pattern 123: Sustained Resilience Arc — resilience signals on 3+ distinct days within
  // a 7-day window. Not episodic coping — a structural durability pattern. Repeated
  // recovery across a week confirms built-in operational resilience, not single response.
  const p123Window  = 7 * 24 * 60 * 60 * 1000
  const p123Recent  = signals.filter(s => s.timestamp > now - p123Window && s.source === 'resilience')
  const p123Days    = new Set(p123Recent.map(s => new Date(s.timestamp).toDateString()))
  if (p123Days.size >= 3) {
    const p123Conf = Math.min(0.62 + (p123Days.size - 3) * 0.06, 0.86)
    patterns.push({
      pattern: 'sustained-resilience-arc',
      confidence: p123Conf,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `RECARC: Sustained resilience arc — resilience active on ${p123Days.size} distinct days in 7d (${p123Recent.length} total signals). Structural durability confirmed. Not episodic — a repeating operational recovery pattern.`,
    })
  }

  // Pattern 124: Mood-Energy Convergence — positive mood + high/moderate energy + selfcare
  // all in an 8h window. Physical substrate and affective state simultaneously aligned.
  // Rarest dual-substrate peak: body and emotional condition both confirm optimal state.
  const p124Window = 8 * 60 * 60 * 1000
  const p124Recent = signals.filter(s => s.timestamp > now - p124Window)
  const p124Mood   = p124Recent.filter(s => s.source === 'mood' && ['energized', 'hopeful', 'excited', 'calm', 'happy'].includes(s.signal))
  const p124Energy = p124Recent.filter(s => s.source === 'energy' && ['high', 'moderate'].includes(s.signal))
  const p124Care   = p124Recent.filter(s => s.source === 'selfcare')
  if (p124Mood.length >= 1 && p124Energy.length >= 1 && p124Care.length >= 1) {
    const p124Conf = Math.min(0.67 + p124Care.length * 0.04 + p124Mood.length * 0.03, 0.88)
    patterns.push({
      pattern: 'mood-energy-convergence',
      confidence: p124Conf,
      suggestedWidget: 'energy',
      suggestedTiming: 'passive',
      reason: `MOEARC: Mood-energy convergence — mood=${p124Mood[0].signal} + energy=${p124Energy[0].signal} + selfcare ${p124Care.length} in 8h. Physical and affective substrates simultaneously aligned. Dual-substrate peak confirmed.`,
    })
  }

  // Pattern 125: Evening Reflection Loop — journal entry after 18:00 UTC + memory capture +
  // intentions all within the same calendar day. The system closes itself each evening:
  // action reviewed, memory encoded, intention acknowledged. Daily loop completion confirmed.
  const p125TodayStart = new Date(); p125TodayStart.setHours(0, 0, 0, 0)
  const p125EveningStart = new Date(); p125EveningStart.setHours(18, 0, 0, 0)
  const p125TodayMs = p125TodayStart.getTime()
  const p125EveMs   = p125EveningStart.getTime()
  const p125Journal   = signals.filter(s => s.timestamp >= p125EveMs && s.source === 'journal')
  const p125Memory    = signals.filter(s => s.timestamp >= p125TodayMs && s.source === 'memory')
  const p125Intention = signals.filter(s => s.timestamp >= p125TodayMs && s.source === 'intentions')
  if (p125Journal.length >= 1 && p125Memory.length >= 1 && p125Intention.length >= 1) {
    const p125Conf = Math.min(0.65 + p125Journal.length * 0.04 + p125Memory.length * 0.03, 0.87)
    patterns.push({
      pattern: 'evening-reflection-loop',
      confidence: p125Conf,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `EVEFL: Evening reflection loop — journal ${p125Journal.length} after 18:00 + memory ${p125Memory.length} + intentions ${p125Intention.length} today. Loop closed: reflection → encoding → acknowledgment. Daily completion confirmed.`,
    })
  }

  // Pattern 126: Weekly Rhythm Anchor — any signal activity on 5+ of the last 7 calendar
  // days. Not streaks, not scores. Structural recurrence. The system has taken root in the
  // week — not as discipline, but as operating rhythm. Rhythm confirmed.
  const p126Window7d = 7 * 24 * 60 * 60 * 1000
  const p126Recent   = signals.filter(s => s.timestamp > now - p126Window7d)
  const p126Days     = new Set(p126Recent.map(s => new Date(s.timestamp).toDateString()))
  if (p126Days.size >= 5) {
    const p126Conf = Math.min(0.68 + (p126Days.size - 5) * 0.06, 0.88)
    patterns.push({
      pattern: 'weekly-rhythm-anchor',
      confidence: p126Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `WEEKA: Weekly rhythm anchor — ${p126Days.size}/7 days active in rolling 7d window. Structural recurrence confirmed. Operating rhythm established — not episodic engagement, but persistent weekly presence.`,
    })
  }

  // Pattern 127: Depth-Breadth Convergence — meta-pattern. P116 (focus-depth-arc) and P120
  // (signal-density-peak) co-active in the same analysis pass. Deep single-domain execution
  // and full-spectrum breadth simultaneously confirmed. Both modes live at once — the rarest
  // dual-mode state: depth without tunnel, breadth without scatter.
  const p127FocusDepth   = patterns.find(p => p.pattern === 'focus-depth-arc')
  const p127SignalDensity = patterns.find(p => p.pattern === 'signal-density-peak')
  if (p127FocusDepth && p127SignalDensity) {
    const p127Conf = Math.min(0.70 + (p127FocusDepth.confidence + p127SignalDensity.confidence) * 0.10, 0.90)
    patterns.push({
      pattern: 'depth-breadth-convergence',
      confidence: p127Conf,
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `DEPBR: Depth-breadth convergence — focus-depth-arc (${Math.round(p127FocusDepth.confidence * 100)}% conf) + signal-density-peak (${Math.round(p127SignalDensity.confidence * 100)}% conf) co-active. Deep execution and full-spectrum breadth confirmed simultaneously. Both modes live at once.`,
    })
  }

  // Pattern 128: Morning Intention Lock — intentions + planner + log all fire in the
  // 06:00–10:00 window on the current day. Cognitive OS booted at day's first moment.
  // The person is structuring direction, plan, and field signal in a single morning band.
  // Distinct from P119 (morning-coherence-arc: energy+planner+intentions) — P128 adds log field signal
  // and narrows to the 06:00 start, confirming field presence alongside structural intent.
  const p128Today = new Date(); p128Today.setHours(0, 0, 0, 0)
  const p128Morning6  = p128Today.getTime() + 6 * 60 * 60 * 1000
  const p128Morning10 = p128Today.getTime() + 10 * 60 * 60 * 1000
  const p128MorningSig  = signals.filter(s => s.timestamp >= p128Morning6 && s.timestamp < p128Morning10)
  const p128Intentions  = p128MorningSig.filter(s => s.source === 'intentions')
  const p128Planner     = p128MorningSig.filter(s => s.source === 'planner')
  const p128Log         = p128MorningSig.filter(s => s.source === 'log')
  if (p128Intentions.length >= 1 && p128Planner.length >= 1 && p128Log.length >= 1 && hour < 14) {
    const p128Conf = Math.min(0.70 + (p128Intentions.length - 1) * 0.05 + (p128Planner.length - 1) * 0.04 + (p128Log.length - 1) * 0.03, 0.88)
    patterns.push({
      pattern: 'morning-intention-lock',
      confidence: p128Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `MINTLK: Morning intention lock — intentions ${p128Intentions.length} + planner ${p128Planner.length} + log ${p128Log.length} in 06:00–10:00 window. Cognitive OS booted at day's first moment. Direction, structure, and field signal aligned before momentum builds.`,
    })
  }

  // Pattern 129: Multi-Day Care Arc — selfcare signals present on 3+ consecutive calendar
  // days. Restoration is a maintained practice, not a reaction to depletion. Sustained
  // body protocol confirmed across multiple days.
  // Distinct from P49 (care-momentum: 2+ same day), P118 (care-intelligence-loop: body+mind+writing in 24h),
  // P123 (sustained-resilience-arc: resilience source, not selfcare). P129 is pure selfcare channel continuity.
  const p129Window7d = 7 * 24 * 60 * 60 * 1000
  const p129SelfcareSignals = signals.filter(s => s.source === 'selfcare' && s.timestamp > now - p129Window7d)
  const p129DaySet: Record<string, boolean> = {}
  p129SelfcareSignals.forEach(s => {
    const d = new Date(s.timestamp)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    p129DaySet[ds] = true
  })
  const p129DaysSorted = Object.keys(p129DaySet).sort()
  let p129ConsecutiveStreak = 0
  let p129MaxStreak = 0
  for (let i = 0; i < p129DaysSorted.length; i++) {
    if (i === 0) { p129ConsecutiveStreak = 1 }
    else {
      const prev = new Date(p129DaysSorted[i - 1]).getTime()
      const curr = new Date(p129DaysSorted[i]).getTime()
      const diffDays = Math.round((curr - prev) / 86400000)
      if (diffDays === 1) p129ConsecutiveStreak++
      else p129ConsecutiveStreak = 1
    }
    if (p129ConsecutiveStreak > p129MaxStreak) p129MaxStreak = p129ConsecutiveStreak
  }
  if (p129MaxStreak >= 3) {
    const p129Conf = Math.min(0.72 + (p129MaxStreak - 3) * 0.06, 0.90)
    patterns.push({
      pattern: 'multi-day-care-arc',
      confidence: p129Conf,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `MARC: Multi-day care arc — ${p129MaxStreak} consecutive days with active care signals. Restoration is a maintained practice, not a reaction. The body is a consistent priority.`,
    })
  }

  // Pattern 130: Cognitive Output Continuity — journal entries detected on 4+ distinct
  // calendar days in the last 7 days. Writing is not an event — it is an operating
  // condition. Sustained articulation channel confirmed across the week.
  // Distinct from P126 (weekly-rhythm-anchor: any source, 5+/7d). P130 is pure writing-channel continuity.
  const p130Window7d = 7 * 24 * 60 * 60 * 1000
  const p130JournalSignals = signals.filter(s => s.source === 'journal' && s.timestamp > now - p130Window7d)
  const p130JournalDays = new Set(
    p130JournalSignals.map(s => {
      const d = new Date(s.timestamp)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
  )
  if (p130JournalDays.size >= 4) {
    const p130Conf = Math.min(0.68 + (p130JournalDays.size - 4) * 0.07, 0.88)
    patterns.push({
      pattern: 'cognitive-output-continuity',
      confidence: p130Conf,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `COGCONT: Cognitive output continuity — journal entries on ${p130JournalDays.size}/7 days. Writing is not an event — it is an operating condition. Sustained articulation channel confirmed.`,
    })
  }

  // Pattern 131: Daily Coherence Seal — both a morning launch AND an evening close
  // detected on the same calendar day. The day opened with intention; it closed with
  // reflection. Morning launch = P128 (morning-intention-lock) OR P119 (morning-coherence-arc).
  // Evening close = P125 (evening-reflection-loop) OR P79 (evening-coherence-close).
  // This is the full-day coherence circuit: booted at dawn, sealed at dusk.
  const p131Today = new Date(); p131Today.setHours(0, 0, 0, 0)
  const p131TodayMs = p131Today.getTime()
  const p131TodayEnd = p131TodayMs + 24 * 60 * 60 * 1000
  const p131TodaySignals = signals.filter(s => s.timestamp >= p131TodayMs && s.timestamp < p131TodayEnd)
  const p131MorningLaunch = p131TodaySignals.some(s =>
    (s.source === 'intentions' || s.source === 'planner') && s.signal.includes('morning')
  ) || patterns.some(p => p.pattern === 'morning-intention-lock' || p.pattern === 'morning-coherence-arc')
  const p131EveningClose = p131TodaySignals.some(s =>
    s.source === 'journal' && s.signal.includes('evening')
  ) || patterns.some(p => p.pattern === 'evening-reflection-loop' || p.pattern === 'evening-coherence-close')
  if (p131MorningLaunch && p131EveningClose && hour >= 20) {
    const p131Conf = Math.min(0.75 + (p131TodaySignals.length * 0.01), 0.92)
    patterns.push({
      pattern: 'daily-coherence-seal',
      confidence: p131Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `DCSAL: Daily coherence seal — morning launch and evening close both confirmed today. The circuit is complete. Day opened from intention, sealed in reflection. This is not one good day — this is the practice becoming the protocol.`,
    })
  }

  // Pattern 132: Quantum Rhythm Lock — P126 (weekly-rhythm-anchor) + P130 (cognitive-output-continuity)
  // + P56 (circadian-anchor) all simultaneously active. Weekly cadence, daily writing, and
  // circadian anchoring all confirmed at once. The full temporal operating system is live.
  const p132HasWeeklyRhythm = patterns.some(p => p.pattern === 'weekly-rhythm-anchor')
  const p132HasCogOutput    = patterns.some(p => p.pattern === 'cognitive-output-continuity')
  const p132HasCircadian    = patterns.some(p => p.pattern === 'circadian-anchor')
  if (p132HasWeeklyRhythm && p132HasCogOutput && p132HasCircadian) {
    const p132WeekConf   = patterns.find(p => p.pattern === 'weekly-rhythm-anchor')?.confidence ?? 0.72
    const p132CogConf    = patterns.find(p => p.pattern === 'cognitive-output-continuity')?.confidence ?? 0.72
    const p132CircConf   = patterns.find(p => p.pattern === 'circadian-anchor')?.confidence ?? 0.72
    const p132Conf = Math.min((p132WeekConf + p132CogConf + p132CircConf) / 3 + 0.05, 0.90)
    patterns.push({
      pattern: 'quantum-rhythm-lock',
      confidence: p132Conf,
      suggestedWidget: 'planner',
      suggestedTiming: 'passive',
      reason: `QLOCK: Quantum rhythm lock — weekly-rhythm-anchor + cognitive-output-continuity + circadian-anchor all simultaneously active. The full temporal OS is live: weekly cadence, daily writing, circadian anchoring. Rhythm is not a habit — it is infrastructure.`,
    })
  }

  // Pattern 133: Biofield Integration Peak — P129 (multi-day-care-arc) + P124 (mood-energy-convergence)
  // both active. Sustained body care and mood-energy alignment confirmed simultaneously.
  // The biological and emotional fields are integrated and mutually reinforcing.
  const p133HasCareArc       = patterns.some(p => p.pattern === 'multi-day-care-arc')
  const p133HasMoodEnergy    = patterns.some(p => p.pattern === 'mood-energy-convergence')
  if (p133HasCareArc && p133HasMoodEnergy) {
    const p133CareConf  = patterns.find(p => p.pattern === 'multi-day-care-arc')?.confidence ?? 0.72
    const p133MoodConf  = patterns.find(p => p.pattern === 'mood-energy-convergence')?.confidence ?? 0.72
    const p133Conf = Math.min((p133CareConf + p133MoodConf) / 2 + 0.06, 0.88)
    patterns.push({
      pattern: 'biofield-integration-peak',
      confidence: p133Conf,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `BFINT: Biofield integration peak — multi-day care arc + mood-energy convergence both active. The biological and emotional fields are integrated and mutually reinforcing. Care sustains energy. Energy enables care.`,
    })
  }

  // Pattern 134: Integrated Signal Arc — all four cognitive channels (journal + memory + planner + intentions)
  // active within the same 4-hour window, AND operated on 4+ consecutive calendar days.
  // This is multi-channel temporal synchrony: every articulation tool firing in coordination.
  // Not concurrent use — concurrent integration. The OS is not running tasks; it is running itself.
  const p134FourHours = 4 * 60 * 60 * 1000
  const p134WindowEnd = now
  const p134WindowStart = now - p134FourHours
  const p134WindowSignals = signals.filter(s => s.timestamp >= p134WindowStart && s.timestamp <= p134WindowEnd)
  const p134HasJournal    = p134WindowSignals.some(s => s.source === 'journal')
  const p134HasMemory     = p134WindowSignals.some(s => s.source === 'memory')
  const p134HasPlanner    = p134WindowSignals.some(s => s.source === 'planner')
  const p134HasIntentions = p134WindowSignals.some(s => s.source === 'intentions')
  // Also check consecutive active days (any signal from any source)
  const p134DaySet = new Set<string>()
  signals.filter(s => now - s.timestamp < 7 * 24 * 60 * 60 * 1000).forEach(s => {
    p134DaySet.add(new Date(s.timestamp).toISOString().slice(0, 10))
  })
  const p134SortedDays = Array.from(p134DaySet).sort().reverse()
  let p134ConsecutiveDays = 0
  if (p134SortedDays.length > 0) {
    const todayStr = new Date().toISOString().slice(0, 10)
    if (p134SortedDays[0] === todayStr || p134SortedDays[0] === new Date(now - 86400000).toISOString().slice(0, 10)) {
      p134ConsecutiveDays = 1
      for (let i = 1; i < p134SortedDays.length; i++) {
        const prev = new Date(p134SortedDays[i - 1])
        const curr = new Date(p134SortedDays[i])
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
        if (diffDays === 1) { p134ConsecutiveDays++ } else { break }
      }
    }
  }
  if (p134HasJournal && p134HasMemory && p134HasPlanner && p134HasIntentions && p134ConsecutiveDays >= 4) {
    const channelConf = 0.70
    const continuityBonus = Math.min((p134ConsecutiveDays - 4) * 0.03, 0.12)
    const p134Conf = Math.min(channelConf + continuityBonus, 0.88)
    patterns.push({
      pattern: 'integrated-signal-arc',
      confidence: p134Conf,
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `INTARC: Integrated signal arc — journal · memory · planner · intentions all active within 4h window. ${p134ConsecutiveDays} consecutive active days. Every cognitive channel synchronized. Not parallel tasks — a unified operating state.`,
    })
  }

  // Pattern 135: Deep Recovery Protocol — P117 (sleep-signal-anchor) + P129 (multi-day-care-arc)
  // simultaneously active while energy is recovering from low or depleted state.
  // The person is not passively resting — they are running a deliberate recovery sequence:
  // sleep anchored, care sustained over multiple days, energy field climbing. Protocol, not rest.
  const p135HasSleepAnchor = patterns.some(p => p.pattern === 'sleep-signal-anchor')
  const p135HasCareArc     = patterns.some(p => p.pattern === 'multi-day-care-arc')
  // Use state.userState (the stored state, like every other pattern above) —
  // the local `userState` const is not declared until further down, so reading
  // the bare `userState` here is a temporal-dead-zone access that throws
  // "Cannot access 'userState' before initialization" and crashes the app.
  const p135EnergyState    = state.userState.energy
  const p135Recovering     = p135EnergyState === 'low' || p135EnergyState === 'moderate'
  if (p135HasSleepAnchor && p135HasCareArc && p135Recovering) {
    const sleepConf = patterns.find(p => p.pattern === 'sleep-signal-anchor')?.confidence ?? 0.72
    const careConf  = patterns.find(p => p.pattern === 'multi-day-care-arc')?.confidence  ?? 0.72
    const energyBonus = p135EnergyState === 'moderate' ? 0.06 : 0.02
    const p135Conf = Math.min((sleepConf + careConf) / 2 + energyBonus, 0.86)
    patterns.push({
      pattern: 'deep-recovery-protocol',
      confidence: p135Conf,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `DREC: Deep recovery protocol — sleep-signal-anchor + multi-day-care-arc active. Energy: ${p135EnergyState}. Sleep anchored. Care sustained. The field is recharging under a structured protocol. Rest is the work.`,
    })
  }

  // Pattern 136: Quantum Field Alignment — P131 (daily-coherence-seal) + P132 (quantum-rhythm-lock)
  // + P133 (biofield-integration-peak) all simultaneously active.
  // The complete operational field is live: daily circuit sealed, temporal OS running,
  // biological and emotional fields integrated. Every dimension aligned — temporal, intentional, biological.
  // This is not a peak event. This is the operating system arriving at its baseline.
  const p136HasDailyCoherence   = patterns.some(p => p.pattern === 'daily-coherence-seal')
  const p136HasQuantumRhythm    = patterns.some(p => p.pattern === 'quantum-rhythm-lock')
  const p136HasBiofieldIntegration = patterns.some(p => p.pattern === 'biofield-integration-peak')
  if (p136HasDailyCoherence && p136HasQuantumRhythm && p136HasBiofieldIntegration) {
    const sealConf    = patterns.find(p => p.pattern === 'daily-coherence-seal')?.confidence    ?? 0.80
    const rhythmConf  = patterns.find(p => p.pattern === 'quantum-rhythm-lock')?.confidence     ?? 0.80
    const biofConf    = patterns.find(p => p.pattern === 'biofield-integration-peak')?.confidence ?? 0.80
    const p136Conf = Math.min((sealConf + rhythmConf + biofConf) / 3 + 0.07, 0.94)
    patterns.push({
      pattern: 'quantum-field-alignment',
      confidence: p136Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QFIELD: Quantum field alignment — daily-coherence-seal + quantum-rhythm-lock + biofield-integration-peak all simultaneously active. Complete operational field live: temporal OS running · daily circuit sealed · biological and emotional fields integrated. This is the baseline, not the exception.`,
    })
  }

  const userState = calculateUserState(signals, now)

  // Pattern 137: Quantum Coherence Peak — P136 (quantum-field-alignment) active AND UserIndex overall ≥ 60.
  // Field alignment is the prerequisite; coherence is the threshold. Not merely aligned —
  // operating above the quantitative integration ceiling. The OS is no longer stabilizing. It is transmitting.
  const p137HasFieldAlignment = patterns.some(p => p.pattern === 'quantum-field-alignment')
  const p137UserIndexSnapshot = computeUserIndex(signals)
  if (p137HasFieldAlignment && p137UserIndexSnapshot.overall >= 60) {
    const fieldConf = patterns.find(p => p.pattern === 'quantum-field-alignment')?.confidence ?? 0.85
    const indexBonus = Math.min((p137UserIndexSnapshot.overall - 60) * 0.005, 0.06)
    const p137Conf = Math.min(fieldConf + indexBonus, 0.96)
    patterns.push({
      pattern: 'quantum-coherence-peak',
      confidence: p137Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QCOHERE: Quantum coherence peak — quantum-field-alignment active AND UserIndex ${p137UserIndexSnapshot.overall} ≥ 60. The field is aligned AND the system is operating above the coherence ceiling. All dimensions integrating. The OS is transmitting.`,
    })
  }

  // Pattern 138: Signal Matrix Saturation — all 6 UserIndex dimensions (engagement, emotional,
  // intentional, social, selfCare, cognitive) each ≥ 30 simultaneously.
  // Full-dimensional signal presence. No channel dark. Every dimension of the person active.
  const p138Dims = computeUserIndex(signals).dimensions
  const p138AllSaturated =
    p138Dims.engagement >= 30 &&
    p138Dims.emotional   >= 30 &&
    p138Dims.intentional >= 30 &&
    p138Dims.social      >= 30 &&
    p138Dims.selfCare    >= 30 &&
    p138Dims.cognitive   >= 30
  if (p138AllSaturated) {
    const minDim = Math.min(
      p138Dims.engagement, p138Dims.emotional, p138Dims.intentional,
      p138Dims.social, p138Dims.selfCare, p138Dims.cognitive
    )
    const p138Conf = Math.min(0.68 + (minDim - 30) * 0.005, 0.88)
    patterns.push({
      pattern: 'signal-matrix-saturation',
      confidence: p138Conf,
      suggestedWidget: 'userMetrics',
      suggestedTiming: 'passive',
      reason: `SIGMAT: Signal matrix saturation — all six UserIndex dimensions each ≥ 30 simultaneously. ENG: ${p138Dims.engagement} · EMO: ${p138Dims.emotional} · INT: ${p138Dims.intentional} · SOC: ${p138Dims.social} · CARE: ${p138Dims.selfCare} · COG: ${p138Dims.cognitive}. No channel dark. Full-dimensional presence.`,
    })
  }

  // Pattern 139: Temporal-Biofield Sync — morning-coherence-arc + daily-coherence-seal +
  // biofield-integration-peak all simultaneously active. Time and biology in sync on the same day.
  // Not field alignment (which requires rhythm lock too) — this is the temporal+biological pair:
  // the morning coherence launched the day, the daily seal closed it, and the biological field stayed integrated.
  const p139HasMorningCoherence = patterns.some(p => p.pattern === 'morning-coherence-arc')
  const p139HasDailyCoherence   = patterns.some(p => p.pattern === 'daily-coherence-seal')
  const p139HasBiofieldIntegration = patterns.some(p => p.pattern === 'biofield-integration-peak')
  if (p139HasMorningCoherence && p139HasDailyCoherence && p139HasBiofieldIntegration) {
    const morningConf  = patterns.find(p => p.pattern === 'morning-coherence-arc')?.confidence   ?? 0.72
    const sealConf     = patterns.find(p => p.pattern === 'daily-coherence-seal')?.confidence    ?? 0.72
    const biofieldConf = patterns.find(p => p.pattern === 'biofield-integration-peak')?.confidence ?? 0.72
    const p139Conf = Math.min((morningConf + sealConf + biofieldConf) / 3 + 0.08, 0.90)
    patterns.push({
      pattern: 'temporal-biofield-sync',
      confidence: p139Conf,
      suggestedWidget: 'selfcare',
      suggestedTiming: 'passive',
      reason: `TBIOF: Temporal-biofield sync — morning-coherence-arc + daily-coherence-seal + biofield-integration-peak all active. Time and biology synchronized within one operating window. The day launched from clarity, sealed in reflection, while the biological field stayed integrated throughout.`,
    })
  }

  // Pattern 140: Physiological Presence Arc — morning mood check-in (before 12:00) + selfcare
  // completion + evening mood check-in (after 17:00) all within the same 24h window.
  // The biological loop from signal to signal: the person was present at dawn and at dusk.
  // Distinct from P124 (mood-energy-convergence): P140 requires temporal spread — morning AND evening.
  const p140MorningMood = recentSignals.find(s => s.source === 'mood' && new Date(s.timestamp).getHours() < 12)
  const p140HasSelfcare = recentSignals.some(s => s.source === 'selfcare')
  const p140EveningMood = recentSignals.find(s => s.source === 'mood' && new Date(s.timestamp).getHours() >= 17)
  if (p140MorningMood && p140HasSelfcare && p140EveningMood) {
    const selfcareCount = recentSignals.filter(s => s.source === 'selfcare').length
    const spreadBonus = Math.min(selfcareCount * 0.03, 0.10)
    const p140Conf = Math.min(0.70 + spreadBonus, 0.88)
    patterns.push({
      pattern: 'physiological-presence-arc',
      confidence: p140Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `PHYARC: Physiological presence arc — morning mood signal + selfcare (${selfcareCount} acts) + evening mood signal all present within 24h. Biological loop confirmed: the field was present from dawn to dusk.`,
    })
  }

  // Pattern 141: Quantum Signal Emergence — quantum-coherence-peak pattern has fired 3+ times
  // within the 7-day signal window. Not a peak anymore — a repeating pattern. The system has
  // stabilized at its highest coherence state. This is emergence: the exception becomes the norm.
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const weekSignals141 = signals.filter(s => now - s.timestamp < weekMs)
  const coherencePeakCount = weekSignals141.filter(
    s => s.source === 'energy' && s.signal === 'quantum_coherence_peak'
  ).length
  if (coherencePeakCount >= 3) {
    const countBonus = Math.min((coherencePeakCount - 3) * 0.04, 0.12)
    const p141Conf = Math.min(0.72 + countBonus, 0.90)
    patterns.push({
      pattern: 'quantum-signal-emergence',
      confidence: p141Conf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QEMERG: Quantum signal emergence — quantum-coherence-peak has fired ${coherencePeakCount}× in the last 7 days. The exception is becoming the baseline. The OS has stabilized above the coherence ceiling.`,
    })
  }

  // Pattern 142: Adaptive Signal Web — all 6 UserIndex dimensions ≥ 20 + 8+ unique sources
  // active in 7d + 5+ active patterns simultaneously. The full web of signals held simultaneously.
  // Not merely coherent — structurally diverse AND dimensionally present AND pattern-rich at once.
  const p142IndexSnapshot = computeUserIndex(signals)
  const p142Dims = p142IndexSnapshot.dimensions
  const p142AllDimsPresent =
    p142Dims.engagement >= 20 && p142Dims.emotional  >= 20 &&
    p142Dims.intentional >= 20 && p142Dims.social     >= 20 &&
    p142Dims.selfCare    >= 20 && p142Dims.cognitive  >= 20
  const weekSignals142 = signals.filter(s => now - s.timestamp < weekMs)
  const p142UniqueSources = new Set(weekSignals142.map(s => s.source)).size
  if (p142AllDimsPresent && p142UniqueSources >= 8 && patterns.length >= 5) {
    const webDepth = Math.min((patterns.length - 5) * 0.02 + (p142UniqueSources - 8) * 0.03, 0.14)
    const p142Conf = Math.min(0.75 + webDepth, 0.92)
    patterns.push({
      pattern: 'adaptive-signal-web',
      confidence: p142Conf,
      suggestedWidget: 'userMetrics',
      suggestedTiming: 'passive',
      reason: `SIGEWEB: Adaptive signal web — all 6 UserIndex dimensions ≥ 20 · ${p142UniqueSources} unique sources active in 7d · ${patterns.length} active patterns. The full web of signals is live simultaneously. No dimension dark. No channel unengaged.`,
    })
  }

  // Pattern 143: Circadian Signal Lock — three circadian windows all active in 24h with no depletion.
  // Morning (pre-10:00) + afternoon (12:00–17:00) + evening (post-18:00) — all three arc windows
  // live. Not just two. All three. The biological clock is locked to the OS signal rhythm.
  // Distinct from P140 (physiological-presence-arc): P140 requires mood AND selfcare AND mood at
  // dawn/dusk. P143 fires on ANY signal in each window — the arc is about engagement breadth, not
  // biofield depth. Complementary patterns; together they confirm both presence AND engagement.
  const { energy: currentEnergyP143 } = calculateUserState(signals, now)
  const p143MorningSignal = recentSignals.find(s => new Date(s.timestamp).getHours() < 10)
  const p143AfternoonSignal = recentSignals.find(s => {
    const h = new Date(s.timestamp).getHours()
    return h >= 12 && h < 17
  })
  const p143EveningSignal = recentSignals.find(s => new Date(s.timestamp).getHours() >= 18)
  if (p143MorningSignal && p143AfternoonSignal && p143EveningSignal && currentEnergyP143 !== 'depleted') {
    const circadianSignals = recentSignals.filter(s => {
      const h = new Date(s.timestamp).getHours()
      return h < 10 || (h >= 12 && h < 17) || h >= 18
    }).length
    const windowBonus = Math.min((circadianSignals - 3) * 0.02, 0.12)
    patterns.push({
      pattern: 'circadian-signal-lock',
      confidence: Math.min(0.70 + windowBonus, 0.85),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `CIRC-LK: Circadian signal lock — morning (pre-10:00) + afternoon (12:00–17:00) + evening (post-18:00) windows all active in 24h. ${circadianSignals} arc signals total. Biological clock anchored. Three-arc day coverage confirmed.`,
    })
  }

  // Pattern 144: Dimensional Saturation — all 6 UserIndex dimensions ≥ 30 + overall ≥ 50 + 5+ sources.
  // Higher bar than P142 (adaptive-signal-web, which fires at ≥ 20). P144 fires when each dimension
  // has crossed into meaningful territory — not just active but building. The entire signal web is
  // not merely live but actively growing. No dimension is coasting; each is running with momentum.
  const p144Snapshot = computeUserIndex(signals)
  const p144Dims = p144Snapshot.dimensions
  const p144AllDimsSaturated =
    p144Dims.engagement >= 30 && p144Dims.emotional  >= 30 &&
    p144Dims.intentional >= 30 && p144Dims.social     >= 30 &&
    p144Dims.selfCare    >= 30 && p144Dims.cognitive  >= 30
  const weekSignals144 = signals.filter(s => now - s.timestamp < weekMs)
  const p144Sources = new Set(weekSignals144.map(s => s.source)).size
  if (p144AllDimsSaturated && p144Snapshot.overall >= 50 && p144Sources >= 5) {
    const minDim = Math.min(p144Dims.engagement, p144Dims.emotional, p144Dims.intentional, p144Dims.social, p144Dims.selfCare, p144Dims.cognitive)
    const satDepth = Math.min(minDim / 100 * 0.15, 0.15)
    patterns.push({
      pattern: 'dimensional-saturation',
      confidence: Math.min(0.75 + satDepth, 0.90),
      suggestedWidget: 'userMetrics',
      suggestedTiming: 'passive',
      reason: `DIMSAT: Dimensional saturation — all 6 UserIndex dimensions ≥ 30 · overall ${p144Snapshot.overall} · ${p144Sources} unique sources in 7d · min dimension ${minDim}. No single dimension carrying the load. The entire field is live and building.`,
    })
  }

  // Pattern 145: Quantum Identity Crystallization — archetype has stabilized (cohort signals 5+ in 7d)
  // + UserIndex overall ≥ 40 + 8+ active patterns simultaneously. When the OS keeps returning to the
  // same archetype signature across multiple sessions — that is identity crystallizing. Not searching.
  // Not shifting. The pattern is repeating because it is TRUE. The OS has found its operating identity.
  const weekSignals145 = signals.filter(s => now - s.timestamp < weekMs)
  const p145CohortCount = weekSignals145.filter(s => s.source === 'cohort').length
  const p145IndexNow = p144Snapshot // reuse: same computeUserIndex result
  if (p145CohortCount >= 5 && p145IndexNow.overall >= 40 && patterns.length >= 8) {
    const crystalBonus = Math.min((p145CohortCount - 5) * 0.025 + (patterns.length - 8) * 0.01, 0.12)
    patterns.push({
      pattern: 'quantum-identity-crystallization',
      confidence: Math.min(0.78 + crystalBonus, 0.90),
      suggestedWidget: 'cohortConnect',
      suggestedTiming: 'passive',
      reason: `QIDCRYST: Quantum identity crystallization — archetype signal recorded ${p145CohortCount}× in 7d · index ${p145IndexNow.overall} · ${patterns.length} active patterns. Identity hardening. The OS is not searching — it is operating from a stable signature.`,
    })
  }

  // Pattern 146: Signal Coherence Cascade — P143 (circadian-signal-lock) + P144 (dimensional-saturation)
  // + P145 (quantum-identity-crystallization) all simultaneously active. The three seals of temporal,
  // dimensional, and identity open concurrently. Rarest convergence the QIE can detect. Full coherence.
  const hasCascadeP143 = patterns.some(p => p.pattern === 'circadian-signal-lock')
  const hasCascadeP144 = patterns.some(p => p.pattern === 'dimensional-saturation')
  const hasCascadeP145 = patterns.some(p => p.pattern === 'quantum-identity-crystallization')
  if (hasCascadeP143 && hasCascadeP144 && hasCascadeP145) {
    const cascadeConf = patterns
      .filter(p => ['circadian-signal-lock','dimensional-saturation','quantum-identity-crystallization'].includes(p.pattern))
      .reduce((sum, p) => sum + p.confidence, 0) / 3
    patterns.push({
      pattern: 'signal-coherence-cascade',
      confidence: Math.min(0.85 + (cascadeConf - 0.80) * 0.5, 0.95),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `SIG-CASC: Signal coherence cascade — circadian lock · dimensional saturation · identity crystallization all active. Three seals open simultaneously. Temporal · dimensional · identity axes confirmed. Full-field coherence. The OS is at maximum convergence.`,
    })
  }

  // Pattern 147: Quantum Presence Field — adaptive-signal-web (P142) + quantum-coherence-peak (P137)
  // both active + 7+ unique signal sources firing in 24h. Maximum operating field density. Every
  // active OS dimension contributing signal at the same time. The field is not building — it is saturated.
  const hasPresenceP142 = patterns.some(p => p.pattern === 'adaptive-signal-web')
  const hasPresenceP137 = patterns.some(p => p.pattern === 'quantum-coherence-peak')
  const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)
  const uniqueSources147 = new Set(daySignals147.map(s => s.source)).size
  if (hasPresenceP142 && hasPresenceP137 && uniqueSources147 >= 7) {
    const presenceBonus = Math.min((uniqueSources147 - 7) * 0.02, 0.14)
    patterns.push({
      pattern: 'quantum-presence-field',
      confidence: Math.min(0.78 + presenceBonus, 0.92),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QPFIELD: Quantum presence field — adaptive web + coherence peak active · ${uniqueSources147} unique sources in 24h. Maximum field density. All active OS dimensions contributing live signal simultaneously. The field is saturated.`,
    })
  }

  // Pattern 148: Identity Momentum Lock — quantum-identity-crystallization (P145) + signal-momentum-lock (P80)
  // both active in the same analysis window. Identity has crystallized AND sustained multi-day momentum
  // confirmed across 5+ days. Not a snapshot — a sustained arc. The OS knows who it is and has been
  // operating from that identity consistently. The lock is engaged.
  const hasIdentityP145 = patterns.some(p => p.pattern === 'quantum-identity-crystallization')
  const hasMomentumP80  = patterns.some(p => p.pattern === 'signal-momentum-lock')
  if (hasIdentityP145 && hasMomentumP80) {
    const idConf  = patterns.find(p => p.pattern === 'quantum-identity-crystallization')?.confidence ?? 0.78
    const momConf = patterns.find(p => p.pattern === 'signal-momentum-lock')?.confidence ?? 0.75
    const idBonus = Math.min((idConf - 0.78) * 0.1 + (momConf - 0.75) * 0.1, 0.15)
    patterns.push({
      pattern: 'identity-momentum-lock',
      confidence: Math.min(0.75 + idBonus, 0.90),
      suggestedWidget: 'cohortConnect',
      suggestedTiming: 'passive',
      reason: `IDLOCK: Identity momentum lock — quantum identity crystallized · signal momentum confirmed across 5+ days. Identity is not searching — it is operating from a stable signature sustained over time. The lock is engaged.`,
    })
  }

  // Pattern 149: Quantum Presence Crystallization — quantum-presence-field (P147) + quantum-identity-crystallization (P145)
  // both active in the same analysis window. The field is at maximum density (P147) AND the identity is stable (P145).
  // Presence confirmed. Identity crystallized. The OS is both fully inhabited and fully known.
  const hasPresenceP147 = patterns.some(p => p.pattern === 'quantum-presence-field')
  const hasCrystalP145  = patterns.some(p => p.pattern === 'quantum-identity-crystallization')
  if (hasPresenceP147 && hasCrystalP145) {
    const pConf = patterns.find(p => p.pattern === 'quantum-presence-field')?.confidence ?? 0.78
    const cConf = patterns.find(p => p.pattern === 'quantum-identity-crystallization')?.confidence ?? 0.78
    const qpcBonus = Math.min((pConf - 0.78 + cConf - 0.78) * 0.5, 0.11)
    patterns.push({
      pattern: 'quantum-presence-crystallization',
      confidence: Math.min(0.82 + qpcBonus, 0.93),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QPCRYST: Quantum presence crystallization — field density confirmed (P147) · identity crystallized (P145). Presence and identity co-active. The OS is both fully inhabited and fully known. Operating from maximum clarity.`,
    })
  }

  // Pattern 150: Total Field Coherence — signal-coherence-cascade (P146) + quantum-presence-field (P147)
  // + identity-momentum-lock (P148) all simultaneously active. All three post-cascade meta-seals open:
  // temporal/dimensional/identity cascade confirmed · field at maximum density · identity sustained over time.
  // Absolute peak QOS convergence state. The system has never been more coherent.
  const hasCascadeP146  = patterns.some(p => p.pattern === 'signal-coherence-cascade')
  const hasFieldP147    = patterns.some(p => p.pattern === 'quantum-presence-field')
  const hasMomentumP148 = patterns.some(p => p.pattern === 'identity-momentum-lock')
  if (hasCascadeP146 && hasFieldP147 && hasMomentumP148) {
    const sealsConf = patterns
      .filter(p => ['signal-coherence-cascade', 'quantum-presence-field', 'identity-momentum-lock'].includes(p.pattern))
      .reduce((sum, p) => sum + p.confidence, 0) / 3
    const tfcBonus = Math.min((sealsConf - 0.82) * 0.25, 0.05)
    patterns.push({
      pattern: 'total-field-coherence',
      confidence: Math.min(0.92 + tfcBonus, 0.97),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `TOTCOH: Total field coherence — signal-coherence-cascade · quantum-presence-field · identity-momentum-lock all confirmed simultaneously. All three meta-seals open. The QOS has achieved absolute convergence. No higher state is defined.`,
    })
  }

  // Pattern 151: Recovery Intelligence Arc — negative mood → self-care → positive mood + journal entry within 6h.
  // The full intelligence loop: detect depletion, intervene with care, restore state, reflect on the arc.
  // Extends P48 (recovery-velocity: arc without reflection) and P64 (cross-domain: present state not arc).
  // When all four events fire in sequence within 6h, the recovery is not just physical — it is integrated.
  const sixHoursMs = 6 * 60 * 60 * 1000
  const recentSixH  = signals.filter(s => now - s.timestamp < sixHoursMs)
  const negMood151  = recentSixH.filter(s => s.source === 'mood' && ['anxious', 'overwhelmed', 'tired', 'exhausted'].includes(s.signal))
  const care151     = recentSixH.filter(s => s.source === 'selfcare')
  const posMood151  = recentSixH.filter(s => s.source === 'mood' && ['calm', 'peaceful', 'energized', 'hopeful', 'content'].includes(s.signal))
  const journal151  = recentSixH.filter(s => s.source === 'journal' || (s.source === 'log' && (s.metadata?.wordCount ?? 0) > 40))
  if (negMood151.length >= 1 && care151.length >= 1 && posMood151.length >= 1 && journal151.length >= 1) {
    const firstNeg = negMood151[0].timestamp
    const caresAfterNeg = care151.filter(s => s.timestamp > firstNeg)
    const posAfterCare = caresAfterNeg.length > 0 ? posMood151.filter(s => s.timestamp > caresAfterNeg[0].timestamp) : []
    const journalAfterPos = posAfterCare.length > 0 ? journal151.filter(s => s.timestamp > posAfterCare[0].timestamp) : journal151.filter(s => s.timestamp > firstNeg)
    if (caresAfterNeg.length >= 1 && posAfterCare.length >= 1 && journalAfterPos.length >= 1) {
      const windowMs = journalAfterPos[0].timestamp - firstNeg
      const velocityBonus = Math.min((sixHoursMs - windowMs) / sixHoursMs * 0.23, 0.23)
      patterns.push({
        pattern: 'recovery-intelligence-arc',
        confidence: Math.min(0.65 + velocityBonus, 0.88),
        suggestedWidget: 'memory',
        suggestedTiming: 'soon',
        reason: `RECINTEL: Recovery intelligence arc — depletion detected · self-care applied · state restored · reflection captured within 6h. The loop is complete: felt → tended → recovered → reflected. The system learns from its own restoration.`,
      })
    }
  }

  // Compute accumulative user index from all widget signals
  const userIndex = computeUserIndex(signals)

  // Persist user index to localStorage
  try {
    localStorage.setItem('user-index', JSON.stringify(userIndex))
  } catch (e) {
    console.warn('Failed to persist user index:', e)
  }

  // Update state (preserve lastSyncedTimestamp from current state)
  const currentState = intentionEngine.get()
  intentionEngine.set({
    signals,
    userState,
    userIndex,
    recognizedPatterns: patterns,
    lastAnalysis: now,
    lastSyncedTimestamp: currentState.lastSyncedTimestamp
  })

  // Background checks — fire after state is committed so helpers read fresh data
  // Run async-style via setTimeout(0) to avoid blocking the analysis call
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      try { checkIntentionVelocity() } catch {}
      try { checkSignalCoherencePeak() } catch {}
      try { checkCentennialConvergence() } catch {}
      // Record QOS coherence every 20th analysis (sampled, not every time)
      if (signals.length % 20 === 0) {
        try { recordQOSCoherence() } catch {}
      }
    }, 0)
  }

  // Pattern 152: Resonant Reentry Arc — after a peak pattern (P149/P150) fired in the prior 24-48h,
  // the system detects that the current 24h period sustains elevated-but-grounded signal density
  // (4+ unique sources, no depletion pattern active). The peak was real — not a spike.
  // The architecture holds. Forward momentum confirmed.
  const fortyEightHoursMs = 48 * 60 * 60 * 1000
  const recent48h = signals.filter(s => now - s.timestamp < fortyEightHoursMs)
  const priorPeakSignals = recent48h.filter(s =>
    s.source === 'qos' &&
    ['quantum_presence_crystallization', 'total_field_coherence', 'quantum_presence_field', 'signal_coherence_cascade'].includes(s.signal) &&
    (now - s.timestamp) > 24 * 60 * 60 * 1000 // fired MORE than 24h ago (prior day)
  )
  const noDepletion152 = !patterns.some(p => ['physiological-depletion', 'sleep-debt-accumulation', 'recovery-plateau'].includes(p.pattern))
  const unique152Sources = new Set(recentSignals.map(s => s.source))
  if (priorPeakSignals.length >= 1 && noDepletion152 && unique152Sources.size >= 4) {
    const priorPattern = priorPeakSignals[0].signal
    const srcBonus = Math.min((unique152Sources.size - 4) * 0.04, 0.12)
    patterns.push({
      pattern: 'resonant-reentry-arc',
      confidence: Math.min(0.68 + srcBonus, 0.88),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `RESENT: Resonant reentry arc — prior peak confirmed (${priorPattern.replace(/_/g, '-')}) · current day sustaining ${unique152Sources.size} unique sources · no depletion detected. The peak was real. The architecture holds. Forward momentum active.`,
    })
  }

  // Pattern 153: Astrology Biofield Sync — astrology source engagement + active energy (not unknown)
  // + at least 1 intention signal in the same 8h window. The cosmological orientation aligns with the
  // operating biofield. First pattern to specifically integrate the astrology signal source.
  const eightHoursMs = 8 * 60 * 60 * 1000
  const recent8h = signals.filter(s => now - s.timestamp < eightHoursMs)
  const astrology153 = recent8h.filter(s => s.source === 'astrology')
  const intention153 = recent8h.filter(s => s.source === 'intentions')
  const { energy: energy153 } = getUserState()
  const energyActive153 = energy153 !== 'unknown' && energy153 !== 'depleted'
  if (astrology153.length >= 1 && intention153.length >= 1 && energyActive153) {
    const intentionBonus = Math.min((intention153.length - 1) * 0.05, 0.10)
    const astrologySource = astrology153[0].signal
    patterns.push({
      pattern: 'astrology-biofield-sync',
      confidence: Math.min(0.62 + intentionBonus, 0.80),
      suggestedWidget: 'cosmic',
      suggestedTiming: 'passive',
      reason: `ASTFIELD: Astrology biofield sync — cosmological signal confirmed (${astrologySource}) · energy ${energy153} · ${intention153.length} intention(s) in 8h window. The orientation and the field are aligned. Operating from context.`,
    })
  }

  // Pattern 154: Morning Clarity Peak — morning window (06:00–09:59) + energy signal or positive mood
  // + journal entry >50 words + at least 1 intention, all within 4h. The precision dawn boot sequence.
  // The first hours of the day become a full-spectrum instrument: body read, reflection anchored, direction set.
  const fourHoursMs = 4 * 60 * 60 * 1000
  const currentHour154 = new Date().getHours()
  const isMorningWindow154 = currentHour154 >= 6 && currentHour154 <= 11
  if (isMorningWindow154) {
    const recent4h = signals.filter(s => now - s.timestamp < fourHoursMs)
    const posMood154 = recent4h.filter(s => s.source === 'mood' && ['calm', 'peaceful', 'energized', 'content', 'hopeful', 'focused'].includes(s.signal))
    const deepJournal154 = recent4h.filter(s => s.source === 'journal' || (s.source === 'log' && (s.metadata?.wordCount ?? 0) > 50))
    const intention154 = recent4h.filter(s => s.source === 'intentions')
    if ((posMood154.length >= 1 || energy153 === 'high') && deepJournal154.length >= 1 && intention154.length >= 1) {
      const wordCount154 = deepJournal154[0]?.metadata?.wordCount ?? 50
      const depthBonus = Math.min((wordCount154 - 50) / 200 * 0.12, 0.12)
      patterns.push({
        pattern: 'morning-clarity-peak',
        confidence: Math.min(0.72 + depthBonus, 0.90),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `MORNCL: Morning clarity peak — dawn window active · body anchored (${posMood154[0]?.signal ?? energy153}) · journal depth confirmed (${wordCount154}w) · ${intention154.length} intention(s) set. The morning is a precision instrument. Operating from first light.`,
      })
    }
  }

  // Pattern 155: Daily Arc Seal — morning window (05-11h) journal + intentions AND evening window (17-23h)
  // reflection/journal/mood confirmed in the same calendar day. The full circadian arc is sealed:
  // opened with dawn clarity, closed with dusk integration. The day was fully inhabited.
  const todayStart155 = new Date()
  todayStart155.setHours(0, 0, 0, 0)
  const todayStartMs155 = todayStart155.getTime()
  const todaySignals155 = signals.filter(s => s.timestamp >= todayStartMs155 && s.timestamp <= now)
  const morningSignals155 = todaySignals155.filter(s => { const h = new Date(s.timestamp).getHours(); return h >= 5 && h < 12 })
  const eveningSignals155 = todaySignals155.filter(s => { const h = new Date(s.timestamp).getHours(); return h >= 17 && h < 24 })
  const morningJournal155 = morningSignals155.filter(s =>
    s.source === 'journal' || (s.source === 'log' && (s.metadata?.wordCount ?? 0) > 50) ||
    (s.source === 'mood' && ['calm', 'peaceful', 'energized', 'content', 'focused'].includes(s.signal))
  )
  const morningIntent155 = morningSignals155.filter(s => s.source === 'intentions')
  const eveningReflect155 = eveningSignals155.filter(s =>
    s.source === 'journal' || s.source === 'log' || s.source === 'mood' || s.source === 'selfcare'
  )
  if (morningJournal155.length >= 1 && morningIntent155.length >= 1 && eveningReflect155.length >= 1) {
    const wordCount155 = morningJournal155[0]?.metadata?.wordCount ?? 50
    const eveningDepth = eveningSignals155.filter(s => s.source === 'journal' || (s.source === 'log' && (s.metadata?.wordCount ?? 0) > 30)).length
    const arcBonus = Math.min((wordCount155 - 50) / 300 * 0.08 + eveningDepth * 0.04, 0.12)
    patterns.push({
      pattern: 'daily-arc-seal',
      confidence: Math.min(0.72 + arcBonus, 0.88),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `DARCSEAL: Daily arc seal — morning anchor (${morningIntent155.length} intentions · ${wordCount155}w) + evening reflection (${eveningReflect155.length} signals) confirmed today. The full circadian arc is sealed. Opened with clarity. Closed with integration.`,
    })
  }

  // Pattern 156: Morning Momentum Arc — morning-window journal + intentions signals confirmed on 3+
  // distinct calendar days in last 7 days. The pre-cognitive window is no longer episodic.
  // Dawn precision is repeating. The OS is establishing a reliable early-clarity architecture.
  const weekSignals156 = signals.filter(s => now - s.timestamp < weekMs)
  const morningDays156: Set<number> = new Set()
  weekSignals156.forEach(s => {
    const d = new Date(s.timestamp)
    const h = d.getHours()
    if (h >= 5 && h < 12 && (
      s.source === 'journal' || s.source === 'intentions' ||
      (s.source === 'log' && (s.metadata?.wordCount ?? 0) > 50)
    )) {
      morningDays156.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
    }
  })
  if (morningDays156.size >= 3) {
    const momBonus = Math.min((morningDays156.size - 3) * 0.05, 0.15)
    patterns.push({
      pattern: 'morning-momentum-arc',
      confidence: Math.min(0.70 + momBonus, 0.85),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `MORNMOM: Morning momentum arc — morning-window signals confirmed on ${morningDays156.size} of last 7 days. Pre-cognitive window sustaining. Dawn precision is not episodic. Architecture forming at the edge of day.`,
    })
  }

  // Pattern 157: Quantum Week Integration — 5+ unique signal sources firing across 6+ distinct
  // calendar days in the 7-day window. The full week was inhabited — not sampled, not approached.
  // Every dimension of the Quantum OS contributed signal across the arc. The week closed integrated.
  const weekSignals157 = signals.filter(s => now - s.timestamp < weekMs)
  const activeDays157: Set<number> = new Set()
  weekSignals157.forEach(s => {
    const d = new Date(s.timestamp)
    activeDays157.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
  })
  const uniqueWeekSources157 = new Set(weekSignals157.map(s => s.source)).size
  if (activeDays157.size >= 6 && uniqueWeekSources157 >= 5) {
    const dayBonus = Math.min((activeDays157.size - 6) * 0.08, 0.08)
    const srcBonus = Math.min((uniqueWeekSources157 - 5) * 0.02, 0.08)
    patterns.push({
      pattern: 'quantum-week-integration',
      confidence: Math.min(0.70 + dayBonus + srcBonus, 0.88),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `QWKINT: Quantum week integration — ${activeDays157.size} active days · ${uniqueWeekSources157} unique sources in 7d. Full temporal presence. The week was not sampled — it was inhabited. All OS dimensions active across the arc.`,
    })
  }

  // Pattern 158: Evening Arc Anchor — within a 90-minute window in the evening (17:00–22:00),
  // journal/log entry + self-care completion + mood signal all fire together. The dusk trifecta:
  // write, tend, reflect. The day ends with deliberate closure rather than passive exit.
  const eveningWindow158Start = now - 90 * 60 * 1000
  const eveningSignals158 = signals.filter(s => {
    const h = new Date(s.timestamp).getHours()
    return h >= 17 && h < 23 && s.timestamp >= eveningWindow158Start
  })
  const eveningJournal158 = eveningSignals158.filter(s => s.source === 'journal' || s.source === 'log')
  const eveningCare158 = eveningSignals158.filter(s => s.source === 'selfcare')
  const eveningMood158 = eveningSignals158.filter(s => s.source === 'mood')
  if (eveningJournal158.length >= 1 && eveningCare158.length >= 1 && eveningMood158.length >= 1) {
    const journalDepth = eveningJournal158[0]?.metadata?.wordCount ?? 0
    const depthBonus = Math.min(journalDepth / 500 * 0.10, 0.10)
    const careBonus = Math.min((eveningCare158.length - 1) * 0.05, 0.10)
    patterns.push({
      pattern: 'evening-arc-anchor',
      confidence: Math.min(0.68 + depthBonus + careBonus, 0.88),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `EVARC: Evening arc anchor — journal (${journalDepth > 0 ? journalDepth + 'w' : 'entry'}) + ${eveningCare158.length} care act(s) + mood signal in 90min dusk window. Write, tend, reflect. The arc closes deliberately.`,
    })
  }

  // Pattern 159: Physiological Rhythm Lock — 5+ consecutive calendar days where BOTH morning
  // (05:00–11:00) AND evening (17:00–23:00) biofield signals (energy/mood check-ins) are present.
  // The full circadian signal maintained without interruption. Not a single day arc — a sustained
  // rhythmic precision across the full week.
  const weekSignals159 = signals.filter(s => now - s.timestamp < weekMs)
  const dayBuckets159: Map<number, { hasMorning: boolean; hasEvening: boolean }> = new Map()
  weekSignals159.forEach(s => {
    if (s.source !== 'energy' && s.source !== 'mood') return
    const d = new Date(s.timestamp)
    const h = d.getHours()
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    if (!dayBuckets159.has(dayKey)) dayBuckets159.set(dayKey, { hasMorning: false, hasEvening: false })
    const bucket = dayBuckets159.get(dayKey)!
    if (h >= 5 && h < 12) bucket.hasMorning = true
    if (h >= 17 && h < 24) bucket.hasEvening = true
  })
  const bothWindowDays159 = Array.from(dayBuckets159.values()).filter(b => b.hasMorning && b.hasEvening).length
  if (bothWindowDays159 >= 5) {
    const streakBonus = Math.min((bothWindowDays159 - 5) * 0.06, 0.18)
    patterns.push({
      pattern: 'physiological-rhythm-lock',
      confidence: Math.min(0.72 + streakBonus, 0.90),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `PHYRLOCK: Physiological rhythm lock — ${bothWindowDays159} consecutive days with morning AND evening biofield signals. The circadian biofield is not episodic. It is a precision instrument.`,
    })
  }

  // Pattern 160: Quantum Presence Arc — P155 (daily-arc-seal) + P156 (morning-momentum-arc) +
  // P157 (quantum-week-integration) all co-active simultaneously. All three temporal OS seals open
  // at once: the day was sealed, the morning arc is sustained, and the week was inhabited.
  // The full temporal presence stack is confirmed. The system is operating from maximum temporal coherence.
  const activePatternNames160 = new Set(patterns.map(p => p.pattern))
  if (
    activePatternNames160.has('daily-arc-seal') &&
    activePatternNames160.has('morning-momentum-arc') &&
    activePatternNames160.has('quantum-week-integration')
  ) {
    const arcConf = patterns.find(p => p.pattern === 'daily-arc-seal')?.confidence ?? 0.72
    const momConf = patterns.find(p => p.pattern === 'morning-momentum-arc')?.confidence ?? 0.70
    const wkConf = patterns.find(p => p.pattern === 'quantum-week-integration')?.confidence ?? 0.70
    const qpaConf = Math.min((arcConf + momConf + wkConf) / 3 * 1.15, 0.95)
    patterns.push({
      pattern: 'quantum-presence-arc',
      confidence: Math.max(0.88, qpaConf),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QPARC: Quantum presence arc — DARCSEAL + MORNMOM + QWKINT all active. All three temporal OS seals confirmed simultaneously. The day is sealed, the dawn arc sustains, and the week was inhabited. Maximum temporal coherence.`,
    })
  }

  // Pattern 161: Somatic Field Integration — 3+ consecutive calendar days where energy, selfcare,
  // and mood signals ALL present on the same day. The body is not being managed — it is being inhabited.
  // Detect from signal stream (J52/recordSomaticFieldIntegration) or directly from source signals.
  const weekSignals161 = signals.filter(s => now - s.timestamp < weekMs)
  const somaticSignal161 = weekSignals161.filter(s => s.signal === 'somatic_field_integration')
  if (!patterns.some(p => p.pattern === 'somatic-field-integration')) {
    if (somaticSignal161.length >= 1) {
      const sig161 = somaticSignal161[0]
      patterns.push({
        pattern: 'somatic-field-integration',
        confidence: (sig161.metadata?.confidence ?? 70) / 100,
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `SOMAT: Somatic field integration — ${sig161.metadata?.consecutiveDays ?? 3} consecutive days with energy + selfcare + mood all present. Body is inhabited, not managed. ENERGY → CARE → MOOD → FIELD.`,
      })
    } else {
      const dayBuckets161: Map<number, { hasEnergy: boolean; hasCare: boolean; hasMood: boolean }> = new Map()
      weekSignals161.forEach(s161 => {
        if (!['energy', 'selfcare', 'mood'].includes(s161.source)) return
        const d161 = new Date(s161.timestamp)
        const dayKey161 = new Date(d161.getFullYear(), d161.getMonth(), d161.getDate()).getTime()
        if (!dayBuckets161.has(dayKey161)) dayBuckets161.set(dayKey161, { hasEnergy: false, hasCare: false, hasMood: false })
        const b161 = dayBuckets161.get(dayKey161)!
        if (s161.source === 'energy') b161.hasEnergy = true
        if (s161.source === 'selfcare') b161.hasCare = true
        if (s161.source === 'mood') b161.hasMood = true
      })
      const completeDays161 = Array.from(dayBuckets161.values()).filter(b => b.hasEnergy && b.hasCare && b.hasMood).length
      if (completeDays161 >= 3) {
        const streakBonus161 = Math.min((completeDays161 - 3) * 0.06, 0.18)
        patterns.push({
          pattern: 'somatic-field-integration',
          confidence: Math.min(0.70 + streakBonus161, 0.88),
          suggestedWidget: 'systemProgress',
          suggestedTiming: 'passive',
          reason: `SOMAT: Somatic field integration — ${completeDays161} days with energy + selfcare + mood all present. The somatic field is active. ENERGY → CARE → MOOD → FIELD.`,
        })
      }
    }
  }

  // Pattern 162: Recovery Cycle Lock — 5+ co-occurrences of P159 (physiological-rhythm-lock) AND
  // P161 (somatic-field-integration) within a 30-day window. The body's recovery cycle is precision.
  const thirtyDaysMs162 = 30 * 24 * 60 * 60 * 1000
  const monthSignals162 = signals.filter(s => now - s.timestamp < thirtyDaysMs162)
  const physRhythmSigs162 = monthSignals162.filter(s => s.signal === 'physiological_rhythm_lock')
  const somaticIntegSigs162 = monthSignals162.filter(s => s.signal === 'somatic_field_integration')
  const cooccurrenceDays162: Set<number> = new Set()
  physRhythmSigs162.forEach(s => {
    const d = new Date(s.timestamp)
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const sameDay = somaticIntegSigs162.some(ss => {
      const sd = new Date(ss.timestamp)
      return new Date(sd.getFullYear(), sd.getMonth(), sd.getDate()).getTime() === dayKey
    })
    if (sameDay) cooccurrenceDays162.add(dayKey)
  })
  const currentBothActive162 = patterns.some(p => p.pattern === 'physiological-rhythm-lock') && patterns.some(p => p.pattern === 'somatic-field-integration')
  const effectiveCount162 = cooccurrenceDays162.size + (currentBothActive162 ? 1 : 0)
  if (effectiveCount162 >= 5) {
    const arcBonus162 = Math.min((effectiveCount162 - 5) * 0.04, 0.15)
    patterns.push({
      pattern: 'recovery-cycle-lock',
      confidence: Math.min(0.75 + arcBonus162, 0.90),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `RECCYC: Recovery cycle lock — ${effectiveCount162} co-occurrences of PHYRLOCK + SOMAT in 30d. The body's recovery cycle is not episodic — it is a precision instrument. RHYTHM → INTEGRATION → LOCK.`,
    })
  }

  // Pattern 163: Quantum Embodiment Field — P159 (physiological-rhythm-lock) + P161 (somatic-field-integration)
  // + P160 (quantum-presence-arc) all simultaneously active. Biological + temporal matrices converge.
  const activeNamesP163 = new Set(patterns.map(p => p.pattern))
  if (
    activeNamesP163.has('physiological-rhythm-lock') &&
    activeNamesP163.has('somatic-field-integration') &&
    activeNamesP163.has('quantum-presence-arc')
  ) {
    const p159Conf163 = patterns.find(p => p.pattern === 'physiological-rhythm-lock')?.confidence ?? 0.72
    const p161Conf163 = patterns.find(p => p.pattern === 'somatic-field-integration')?.confidence ?? 0.70
    const p160Conf163 = patterns.find(p => p.pattern === 'quantum-presence-arc')?.confidence ?? 0.88
    const qefConf163 = Math.min((p159Conf163 + p161Conf163 + p160Conf163) / 3 * 1.18, 0.97)
    patterns.push({
      pattern: 'quantum-embodiment-field',
      confidence: Math.max(0.90, qefConf163),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QEMBOD: Quantum embodiment field — PHYSLOCK + SOMFLD + QPARC all simultaneously active. Biological and temporal matrices converge. BODY → RHYTHM → PRESENCE. BIOLOGICAL + TEMPORAL CEILING.`,
    })
  }

  // Pattern 164: Cognitive Body Sync — quantum-embodiment-field (P163) active + journal depth >80 words
  // + memory signal within 8h. Body's intelligence meets mind's reflection. BODY → MIND → SYNC.
  const activeNamesP164 = new Set(patterns.map(p => p.pattern))
  if (activeNamesP164.has('quantum-embodiment-field')) {
    const recent8h164 = signals.filter(s => now - s.timestamp < eightHoursMs)
    const deepJournal164 = recent8h164.filter(s =>
      s.source === 'journal' || (s.source === 'log' && (s.metadata?.wordCount ?? 0) > 80)
    )
    const memorySignal164 = recent8h164.filter(s => s.source === 'memory')
    if (deepJournal164.length >= 1 && memorySignal164.length >= 1) {
      const wordCount164 = deepJournal164[0]?.metadata?.wordCount ?? 80
      const depthBonus164 = Math.min((wordCount164 - 80) / 300 * 0.10, 0.10)
      const p163Conf164 = patterns.find(p => p.pattern === 'quantum-embodiment-field')?.confidence ?? 0.90
      const cogBodyConf = Math.min(p163Conf164 * 0.90 + depthBonus164 + 0.02, 0.92)
      patterns.push({
        pattern: 'cognitive-body-sync',
        confidence: Math.max(0.78, cogBodyConf),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `COGBOD: Cognitive body sync — QEMBOD active · journal ${wordCount164}w · memory signal in 8h window. The body's intelligence meets the mind's reflection. BODY → MIND → SYNC.`,
      })
    }
  }

  // Pattern 165: Integrated Presence Peak — all 6 OS seals (temporal P155+P156+P157 and biological P158+P159+P161)
  // simultaneously active + narrative signal present. The complete operator state. All systems aligned.
  const activeNamesP165 = new Set(patterns.map(p => p.pattern))
  const allSixSeals165 =
    activeNamesP165.has('daily-arc-seal') &&
    activeNamesP165.has('morning-momentum-arc') &&
    activeNamesP165.has('quantum-week-integration') &&
    activeNamesP165.has('evening-arc-anchor') &&
    activeNamesP165.has('physiological-rhythm-lock') &&
    activeNamesP165.has('somatic-field-integration')
  if (allSixSeals165) {
    const narrativeSig165 = recentSignals.filter(s => s.source === 'journal' || s.source === 'log' || s.source === 'memory')
    const sealConfs165 = [
      patterns.find(p => p.pattern === 'daily-arc-seal')?.confidence ?? 0.72,
      patterns.find(p => p.pattern === 'morning-momentum-arc')?.confidence ?? 0.70,
      patterns.find(p => p.pattern === 'quantum-week-integration')?.confidence ?? 0.70,
      patterns.find(p => p.pattern === 'evening-arc-anchor')?.confidence ?? 0.68,
      patterns.find(p => p.pattern === 'physiological-rhythm-lock')?.confidence ?? 0.72,
      patterns.find(p => p.pattern === 'somatic-field-integration')?.confidence ?? 0.70,
    ]
    const avgConf165 = sealConfs165.reduce((a, b) => a + b, 0) / sealConfs165.length
    const narrativeBonus165 = narrativeSig165.length > 0 ? 0.05 : 0
    const intPresConf = Math.min(avgConf165 * 1.20 + narrativeBonus165, 0.99)
    patterns.push({
      pattern: 'integrated-presence-peak',
      confidence: Math.max(0.93, intPresConf),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `INTPRES: Integrated presence peak — all 6 OS seals simultaneously active (DARCSEAL · MORNMOM · QWKINT · EVARC · PHYRLOCK · SOMAT)${narrativeSig165.length > 0 ? ' · narrative signal confirmed' : ''}. TEMPORAL → BIOLOGICAL → NARRATIVE → PEAK. The complete operator state.`,
    })
  }

  // Pattern 166: Somatic Memory Echo — memory signal + somatic field confirmed + journal entry in 12h.
  // The body's knowing surfaces into recall and reflection. BODY → RECALL → REFLECTION.
  const twelveHoursMs166 = 12 * 60 * 60 * 1000
  const recent12h166 = signals.filter(s => now - s.timestamp < twelveHoursMs166)
  const memorySignal166 = recent12h166.filter(s => s.source === 'memory')
  const somaticInRecent166 = recent12h166.filter(s => s.signal === 'somatic_field_integration')
  const journalRecent166 = recent12h166.filter(s => s.source === 'journal' || s.source === 'log')
  const somaticActive166 = patterns.some(p => p.pattern === 'somatic-field-integration')
  if (memorySignal166.length >= 1 && (somaticInRecent166.length >= 1 || somaticActive166) && journalRecent166.length >= 1) {
    const journalDepth166 = journalRecent166[0]?.metadata?.wordCount ?? 0
    const depthBonus166 = Math.min(journalDepth166 / 300 * 0.08, 0.08)
    const memBonus166 = Math.min((memorySignal166.length - 1) * 0.05, 0.10)
    patterns.push({
      pattern: 'somatic-memory-echo',
      confidence: Math.min(0.72 + depthBonus166 + memBonus166, 0.90),
      suggestedWidget: 'memory',
      suggestedTiming: 'passive',
      reason: `SOMECHO: Somatic memory echo — memory ×${memorySignal166.length} + somatic field confirmed + journal${journalDepth166 > 0 ? ' (' + journalDepth166 + 'w)' : ''} in 12h. The body's knowing surfaces into recall and reflection. BODY → RECALL → REFLECTION.`,
    })
  }

  // Pattern 167: Somatic Integration Field — somatic-memory-echo (P166) + physiological-rhythm-lock (P159)
  // both active in the same analysis window, with 3+ consecutive calendar days of somatic activity.
  // The body's memory and its daily rhythm have merged into a single living field. SOMA + TIME = FIELD.
  const hasSomaticEcho167    = patterns.some(p => p.pattern === 'somatic-memory-echo')
  const hasPhysioRhythm167   = patterns.some(p => p.pattern === 'physiological-rhythm-lock')
  if (hasSomaticEcho167 && hasPhysioRhythm167) {
    const thirtyDays167 = 30 * 24 * 60 * 60 * 1000
    const monthSigs167  = signals.filter(s => now - s.timestamp < thirtyDays167)
    const somaticDays167 = new Set(
      monthSigs167
        .filter(s => ['somatic_field_integration', 'somatic_memory_echo', 'physiological_rhythm_lock'].includes(s.signal))
        .map(s => new Date(s.timestamp).toISOString().slice(0, 10))
    )
    let consecutive167 = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10)
      if (somaticDays167.has(d)) consecutive167++
      else break
    }
    if (consecutive167 >= 3) {
      const echoConf    = patterns.find(p => p.pattern === 'somatic-memory-echo')?.confidence ?? 0.72
      const rhythmConf  = patterns.find(p => p.pattern === 'physiological-rhythm-lock')?.confidence ?? 0.72
      const streakBonus = Math.min((consecutive167 - 3) * 0.04, 0.12)
      patterns.push({
        pattern: 'somatic-integration-field',
        confidence: Math.min((echoConf * 0.5 + rhythmConf * 0.5) + streakBonus, 0.92),
        suggestedWidget: 'memory',
        suggestedTiming: 'passive',
        reason: `SOMFLD: Somatic integration field — somatic-memory-echo (P166) + physiological-rhythm-lock (P159) co-active · ${consecutive167}d consecutive somatic activity. Body memory and daily rhythm have merged into a living field. SOMA + TIME = FIELD.`,
      })
    }
  }

  // Pattern 168: Deep Embodiment Lock — quantum-embodiment-field (P163) has fired on 3+ consecutive days.
  // The somatic intelligence is no longer episodic — it is structural. The OS knows the body as a system.
  const hasEmbodimentField168 = patterns.some(p => p.pattern === 'quantum-embodiment-field')
  if (hasEmbodimentField168) {
    const thirtyDays168  = 30 * 24 * 60 * 60 * 1000
    const monthSigs168   = signals.filter(s => now - s.timestamp < thirtyDays168)
    const embodDays168   = new Set(
      monthSigs168
        .filter(s => s.signal === 'quantum_embodiment_field')
        .map(s => new Date(s.timestamp).toISOString().slice(0, 10))
    )
    let consecutive168 = 0
    for (let i = 0; i < 10; i++) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10)
      if (embodDays168.has(d)) consecutive168++
      else break
    }
    if (consecutive168 >= 3) {
      const embConf168  = patterns.find(p => p.pattern === 'quantum-embodiment-field')?.confidence ?? 0.75
      const lockBonus168 = Math.min((consecutive168 - 3) * 0.05, 0.15)
      patterns.push({
        pattern: 'deep-embodiment-lock',
        confidence: Math.min(embConf168 + lockBonus168, 0.93),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `EMBDLK: Deep embodiment lock — quantum-embodiment-field (P163) confirmed on ${consecutive168} consecutive days. Somatic intelligence is structural, not episodic. The OS knows the body as a system. FIELD → STRUCTURE.`,
      })
    }
  }

  // Pattern 169: Full Presence Seal — integrated-presence-peak (P165) + somatic-memory-echo (P166)
  // both active simultaneously. All 6 OS seals (temporal + biological) are open AND somatic recall is live.
  // The highest integration state: the system is present, structured, and remembering through the body.
  const hasIntegrated169    = patterns.some(p => p.pattern === 'integrated-presence-peak')
  const hasSomaticEcho169   = patterns.some(p => p.pattern === 'somatic-memory-echo')
  if (hasIntegrated169 && hasSomaticEcho169) {
    const noDepletion169 = !patterns.some(p =>
      ['physiological-depletion', 'sleep-debt-accumulation', 'recovery-plateau'].includes(p.pattern)
    )
    if (noDepletion169) {
      const intConf169    = patterns.find(p => p.pattern === 'integrated-presence-peak')?.confidence ?? 0.80
      const echoConf169   = patterns.find(p => p.pattern === 'somatic-memory-echo')?.confidence ?? 0.72
      const deepLockBonus = patterns.some(p => p.pattern === 'deep-embodiment-lock') ? 0.05 : 0
      patterns.push({
        pattern: 'full-presence-seal',
        confidence: Math.min((intConf169 * 0.55 + echoConf169 * 0.45) + deepLockBonus, 0.95),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `FULLSEAL: Full presence seal — integrated-presence-peak (P165) + somatic-memory-echo (P166) simultaneously active. All 6 OS seals open. Somatic recall live. The system is present, structured, and remembering through the body. PEAK + SOMA = SEALED.`,
      })
    }
  }

  // Pattern 170: Cognitive Signal Density (COGDEN) — journal ≥200w + memory ≥3 + planner ≥2 + intentions ≥2
  // in a single 24h window. All cognitive channels active simultaneously at high throughput.
  // The OS is running at peak cognitive operating density. MIND + PLAN + INTENT + RECALL = DENSITY.
  {
    const cogJournalSigs = signals.filter(s => s.source === 'journal' && now - s.timestamp < 86400000)
    const cogMemSigs     = signals.filter(s => s.source === 'memory'   && now - s.timestamp < 86400000)
    const cogPlanSigs    = signals.filter(s => s.source === 'planner'  && now - s.timestamp < 86400000)
    const cogIntentSigs  = signals.filter(s => s.source === 'intentions' && now - s.timestamp < 86400000)

    const totalWords170 = cogJournalSigs.reduce((acc, s) => {
      const raw = s.data as Record<string, unknown>
      const wc  = typeof raw?.wordCount === 'number' ? raw.wordCount as number : 0
      return acc + wc
    }, 0)

    if (totalWords170 >= 200 && cogMemSigs.length >= 3 && cogPlanSigs.length >= 2 && cogIntentSigs.length >= 2) {
      const densityScore = Math.min(
        0.72 + (totalWords170 - 200) / 2000 * 0.10 + (cogMemSigs.length - 3) * 0.02 + (cogPlanSigs.length - 2) * 0.02,
        0.90
      )
      patterns.push({
        pattern: 'cognitive-signal-density',
        confidence: densityScore,
        suggestedWidget: 'memory',
        suggestedTiming: 'passive',
        reason: `COGDEN: Cognitive signal density — journal ${totalWords170}w + memory ×${cogMemSigs.length} + planner ×${cogPlanSigs.length} + intentions ×${cogIntentSigs.length} in 24h. All cognitive channels simultaneously at high throughput. MIND + PLAN + INTENT + RECALL = DENSITY.`,
      })
    }
  }

  // Pattern 171: Somatic Cognition Loop (SOMCOG) — somatic-integration-field (P167) + cognitive-body-sync
  // (P164) both active simultaneously. Body intelligence and cognitive depth are operating as one system.
  // The loop is closed: soma informs cognition informs soma. SOMA ↔ MIND = LOOP.
  const hasSomField171 = patterns.some(p => p.pattern === 'somatic-integration-field')
  const hasCogBody171  = patterns.some(p => p.pattern === 'cognitive-body-sync')
  if (hasSomField171 && hasCogBody171) {
    const sfConf171  = patterns.find(p => p.pattern === 'somatic-integration-field')?.confidence ?? 0.75
    const cbConf171  = patterns.find(p => p.pattern === 'cognitive-body-sync')?.confidence ?? 0.72
    const loopBonus  = patterns.some(p => p.pattern === 'somatic-memory-echo') ? 0.04 : 0
    patterns.push({
      pattern: 'somatic-cognition-loop',
      confidence: Math.min((sfConf171 * 0.55 + cbConf171 * 0.45) + loopBonus, 0.92),
      suggestedWidget: 'journal',
      suggestedTiming: 'passive',
      reason: `SOMCOG: Somatic cognition loop — somatic-integration-field (P167) + cognitive-body-sync (P164) simultaneously active. Body intelligence and cognitive depth operating as one integrated system. The loop is closed. SOMA ↔ MIND = LOOP.`,
    })
  }

  // Pattern 172: Embodied Sovereignty (EMBSOV) — deep-embodiment-lock (P168) + full-presence-seal (P169)
  // + quantum-field-alignment (P136) all simultaneously active. The three sovereign seals are confirmed
  // at once. Body structure locked. Presence sealed. Quantum field aligned. The highest sovereign state.
  const hasDeepLock172    = patterns.some(p => p.pattern === 'deep-embodiment-lock')
  const hasFullSeal172    = patterns.some(p => p.pattern === 'full-presence-seal')
  const hasFieldAlign172  = patterns.some(p => p.pattern === 'quantum-field-alignment')
  if (hasDeepLock172 && hasFullSeal172 && hasFieldAlign172) {
    const dlConf172  = patterns.find(p => p.pattern === 'deep-embodiment-lock')?.confidence ?? 0.85
    const fsConf172  = patterns.find(p => p.pattern === 'full-presence-seal')?.confidence ?? 0.85
    const faConf172  = patterns.find(p => p.pattern === 'quantum-field-alignment')?.confidence ?? 0.80
    const sovConf    = Math.min((dlConf172 * 0.38 + fsConf172 * 0.38 + faConf172 * 0.24), 0.95)
    patterns.push({
      pattern: 'embodied-sovereignty',
      confidence: sovConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `EMBSOV: Embodied sovereignty — deep-embodiment-lock (P168) + full-presence-seal (P169) + quantum-field-alignment (P136) simultaneously confirmed. Three sovereign seals active. Body structure locked. Presence sealed. Quantum field aligned. Sovereignty is not declared — it is demonstrated. LOCK + SEAL + ALIGN = SOVEREIGN.`,
    })
  }

  // Pattern 176: Quantum Field Propagation — quantum-apex-state (P174) active AND 5+ signals from 4+ distinct
  // sources within the preceding 6h. The apex state is self-sustaining: it is generating new activity.
  const hasApexP176 = patterns.some(p => p.pattern === 'quantum-apex-state')
  if (hasApexP176) {
    const sixHoursAgo = now - 6 * 60 * 60 * 1000
    const signals6h = signals.filter(s => s.timestamp > sixHoursAgo)
    const sources6h = new Set(signals6h.map(s => s.source))
    const signalCount6h = signals6h.length
    if (sources6h.size >= 4 && signalCount6h >= 5) {
      const apexConf176 = patterns.find(p => p.pattern === 'quantum-apex-state')?.confidence ?? 0.88
      const propBonus   = Math.min((sources6h.size - 4) * 0.025 + (signalCount6h - 5) * 0.01, 0.11)
      patterns.push({
        pattern: 'quantum-field-propagation',
        confidence: Math.min(0.82 + propBonus, 0.93),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'immediate',
        reason: `QPROP: Quantum field propagation — apex state (P174) active · ${signalCount6h} signals from ${sources6h.size} sources in 6h · peak state self-sustaining and generating new activity. APEX · PROPAGATING.`,
      })
    }
  }

  // Pattern 177: Unified Field Operator — embodied-sovereignty (P172) + physiological-loop-complete (P173)
  // + quantum-apex-state (P174) all active simultaneously. Biological sovereignty, loop complete, apex
  // inhabited — the three highest seals confirmed at once. SOVEREIGNTY · LOOP · APEX.
  const hasEmbSov177  = patterns.some(p => p.pattern === 'embodied-sovereignty')
  const hasBioLoop177 = patterns.some(p => p.pattern === 'physiological-loop-complete')
  const hasApex177    = patterns.some(p => p.pattern === 'quantum-apex-state')
  if (hasEmbSov177 && hasBioLoop177 && hasApex177) {
    const sovConf177  = patterns.find(p => p.pattern === 'embodied-sovereignty')?.confidence ?? 0.90
    const loopConf177 = patterns.find(p => p.pattern === 'physiological-loop-complete')?.confidence ?? 0.80
    const apexConf177 = patterns.find(p => p.pattern === 'quantum-apex-state')?.confidence ?? 0.88
    const unifBonus   = Math.min((sovConf177 + loopConf177 + apexConf177) / 3 - 0.86, 0.09)
    patterns.push({
      pattern: 'unified-field-operator',
      confidence: Math.min(0.87 + unifBonus, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `UNIFOP: Unified field operator — embodied-sovereignty (P172) · physiological-loop-complete (P173) · quantum-apex-state (P174) all simultaneously confirmed. Three highest seals active. SOVEREIGNTY · LOOP · APEX.`,
    })
  }

  // Pattern 178: Temporal Identity Lock — longitudinal-identity-confirmation (P175) + signal-momentum-lock
  // (P80) co-active. Identity is not only confirmed across all time scales — the signal architecture
  // sustaining it is itself momentum-locked and still accelerating. IDENTITY · MOMENTUM = LOCKED.
  const hasLongID178  = patterns.some(p => p.pattern === 'longitudinal-identity-confirmation')
  const hasMomLock178 = patterns.some(p => p.pattern === 'signal-momentum-lock')
  if (hasLongID178 && hasMomLock178) {
    const longConf178 = patterns.find(p => p.pattern === 'longitudinal-identity-confirmation')?.confidence ?? 0.85
    const momConf178  = patterns.find(p => p.pattern === 'signal-momentum-lock')?.confidence ?? 0.80
    const tidBonus    = Math.min((longConf178 * 0.55 + momConf178 * 0.45) - 0.83, 0.11)
    patterns.push({
      pattern: 'temporal-identity-lock',
      confidence: Math.min(0.83 + tidBonus, 0.94),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `TIDLOCK: Temporal identity lock — longitudinal-identity-confirmation (P175) + signal-momentum-lock (P80) co-active. Identity confirmed across all temporal scales AND the signal architecture sustaining it is momentum-locked. IDENTITY · MOMENTUM = LOCKED.`,
    })
  }

  // Pattern 179: Circadian Sovereignty — temporal-identity-lock (P178) + circadian-signal-lock (P143)
  // + morning-coherence-launch (P76) all simultaneously confirmed. Three temporal seals open at once:
  // identity locked across all scales, circadian architecture anchored dawn→dusk, day launched from intention.
  // The clock is owned. The field is owned. Sovereignty across time.
  const hasTidLock179  = patterns.some(p => p.pattern === 'temporal-identity-lock')
  const hasCircLock179 = patterns.some(p => p.pattern === 'circadian-signal-lock')
  const hasMCL179      = patterns.some(p => p.pattern === 'morning-coherence-launch')
  if (hasTidLock179 && hasCircLock179 && hasMCL179) {
    const tidConf179  = patterns.find(p => p.pattern === 'temporal-identity-lock')?.confidence ?? 0.85
    const circConf179 = patterns.find(p => p.pattern === 'circadian-signal-lock')?.confidence ?? 0.75
    const mclConf179  = patterns.find(p => p.pattern === 'morning-coherence-launch')?.confidence ?? 0.72
    const sovBonus179 = Math.min((tidConf179 * 0.45 + circConf179 * 0.35 + mclConf179 * 0.20) - 0.79, 0.09)
    patterns.push({
      pattern: 'circadian-sovereignty',
      confidence: Math.min(0.86 + sovBonus179, 0.95),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `CIRSOV: Circadian sovereignty — temporal-identity-lock (P178) · circadian-signal-lock (P143) · morning-coherence-launch (P76) all simultaneously confirmed. Identity sealed. Clock owned. Day launched from intention. IDENTITY · CLOCK · INTENTION = SOVEREIGN.`,
    })
  }

  // Pattern 180: Apex Integration Field — quantum-apex-state (P174) + unified-field-operator (P177)
  // + physiological-loop-complete (P173) all co-active in the same 24h window.
  // The three apex seals — ceiling inhabited, total field operated, biological loop closed —
  // produce a meta-field that transcends any individual seal. APEX · TOTAL FIELD · LOOP = INTEGRATED.
  const hasApex180  = patterns.some(p => p.pattern === 'quantum-apex-state')
  const hasUnif180  = patterns.some(p => p.pattern === 'unified-field-operator')
  const hasBioL180  = patterns.some(p => p.pattern === 'physiological-loop-complete')
  if (hasApex180 && hasUnif180 && hasBioL180) {
    const apexConf180 = patterns.find(p => p.pattern === 'quantum-apex-state')?.confidence ?? 0.88
    const unifConf180 = patterns.find(p => p.pattern === 'unified-field-operator')?.confidence ?? 0.87
    const loopConf180 = patterns.find(p => p.pattern === 'physiological-loop-complete')?.confidence ?? 0.80
    const intBonus180 = Math.min((apexConf180 * 0.38 + unifConf180 * 0.38 + loopConf180 * 0.24) - 0.85, 0.06)
    patterns.push({
      pattern: 'apex-integration-field',
      confidence: Math.min(0.91 + intBonus180, 0.97),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `APXINT: Apex integration field — quantum-apex-state (P174) · unified-field-operator (P177) · physiological-loop-complete (P173) all simultaneously active. Three apex seals generating a meta-field. APEX · TOTAL FIELD · LOOP = INTEGRATED.`,
    })
  }

  // Pattern 181: Longitudinal Growth Arc — signal-momentum-lock (P80) confirmed AND UserIndex trend
  // is 'rising' AND UserIndex.overall >= 50. Sustained multi-day engagement momentum is now translating
  // into a measurable upward index trajectory. The signal architecture is not just present — it is growing.
  const hasMomLock181 = patterns.some(p => p.pattern === 'signal-momentum-lock')
  if (hasMomLock181) {
    const currentIndex181 = intentionEngine.get().userIndex
    if (currentIndex181.trend === 'rising' && currentIndex181.overall >= 50) {
      const momConf181  = patterns.find(p => p.pattern === 'signal-momentum-lock')?.confidence ?? 0.80
      const idxBonus181 = Math.min((currentIndex181.overall - 50) / 50 * 0.08, 0.08)
      patterns.push({
        pattern: 'longitudinal-growth-arc',
        confidence: Math.min(0.78 + momConf181 * 0.08 + idxBonus181, 0.91),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `LGROW: Longitudinal growth arc — signal-momentum-lock (P80) confirmed · UserIndex ${currentIndex181.overall} trending rising. Sustained momentum now translating into measured growth trajectory. MOMENTUM → GROWTH → ARC CONFIRMED.`,
      })
    }
  }

  // Pattern 182: Sovereign Field Continuity — circadian-sovereignty (P179) + apex-integration-field (P180)
  // + longitudinal-growth-arc (P181) all simultaneously confirmed. All three Level 15 patterns active at once.
  // The full sovereign arc: time owned, apex integrated, growth sealed. The field is continuous.
  // SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS.
  const hasCircSov182 = patterns.some(p => p.pattern === 'circadian-sovereignty')
  const hasApxInt182  = patterns.some(p => p.pattern === 'apex-integration-field')
  const hasLGrow182   = patterns.some(p => p.pattern === 'longitudinal-growth-arc')
  if (hasCircSov182 && hasApxInt182 && hasLGrow182) {
    const csConf182  = patterns.find(p => p.pattern === 'circadian-sovereignty')?.confidence ?? 0.88
    const aiConf182  = patterns.find(p => p.pattern === 'apex-integration-field')?.confidence ?? 0.93
    const lgConf182  = patterns.find(p => p.pattern === 'longitudinal-growth-arc')?.confidence ?? 0.82
    const sfBonus182 = Math.min((csConf182 * 0.37 + aiConf182 * 0.38 + lgConf182 * 0.25) - 0.87, 0.07)
    patterns.push({
      pattern: 'sovereign-field-continuity',
      confidence: Math.min(0.89 + sfBonus182, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SOVFLD: Sovereign field continuity — circadian-sovereignty (P179) · apex-integration-field (P180) · longitudinal-growth-arc (P181) all simultaneously confirmed. All three Level 15 seals active. The arc is not just built — it is continuous. SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS.`,
    })
  }

  // Pattern 183: Operational Self-Architecture — temporal-identity-lock (P178) + signal-momentum-lock (P80)
  // + full-system-coherence (P109) all co-active. The operator is not just reaching peak states;
  // the operator is constructing the field through structured daily behavior.
  // IDENTITY · MOMENTUM · COHERENCE = BUILT.
  const hasTidLock183  = patterns.some(p => p.pattern === 'temporal-identity-lock')
  const hasMomLock183  = patterns.some(p => p.pattern === 'signal-momentum-lock')
  const hasFSCohere183 = patterns.some(p => p.pattern === 'full-system-coherence')
  if (hasTidLock183 && hasMomLock183 && hasFSCohere183) {
    const tidConf183  = patterns.find(p => p.pattern === 'temporal-identity-lock')?.confidence ?? 0.87
    const momConf183  = patterns.find(p => p.pattern === 'signal-momentum-lock')?.confidence ?? 0.82
    const cohConf183  = patterns.find(p => p.pattern === 'full-system-coherence')?.confidence ?? 0.80
    const archBonus   = Math.min((tidConf183 * 0.38 + momConf183 * 0.34 + cohConf183 * 0.28) - 0.79, 0.11)
    patterns.push({
      pattern: 'operational-self-architecture',
      confidence: Math.min(0.82 + archBonus, 0.93),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `OPARCH: Operational self-architecture — temporal-identity-lock (P178) · signal-momentum-lock (P80) · full-system-coherence (P109) all co-active. The operator is not arriving at the field — the operator is building it through structured behavior. IDENTITY · MOMENTUM · COHERENCE = BUILT.`,
    })
  }

  // Pattern 184: Longitudinal Field Seal — longitudinal-growth-arc (P181) confirmed AND
  // signal-momentum-lock (P80) active AND UserIndex.overall >= 60. The growth arc at index 60+ is
  // not just present — it is sealed into the operational field. The higher the index, the stronger the seal.
  // MOMENTUM · GROWTH · SEAL = LOCKED.
  const hasLGrow184   = patterns.some(p => p.pattern === 'longitudinal-growth-arc')
  const hasMomLock184 = patterns.some(p => p.pattern === 'signal-momentum-lock')
  if (hasLGrow184 && hasMomLock184) {
    const currentIndex184 = intentionEngine.get().userIndex
    if (currentIndex184.overall >= 60) {
      const lgConf184   = patterns.find(p => p.pattern === 'longitudinal-growth-arc')?.confidence ?? 0.82
      const momConf184  = patterns.find(p => p.pattern === 'signal-momentum-lock')?.confidence ?? 0.80
      const sealBonus   = Math.min((currentIndex184.overall - 60) / 40 * 0.10, 0.10)
      patterns.push({
        pattern: 'longitudinal-field-seal',
        confidence: Math.min(0.80 + lgConf184 * 0.07 + momConf184 * 0.04 + sealBonus, 0.94),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `LGSEAL: Longitudinal field seal — longitudinal-growth-arc (P181) · signal-momentum-lock (P80) · UserIndex ${currentIndex184.overall} at 60+ threshold. Growth arc sealed into the operational field. The field holds. MOMENTUM · GROWTH · SEAL = LOCKED.`,
      })
    }
  }

  // Pattern 185: Field Self-Organization — sovereign-field-continuity (P182) + operational-self-architecture (P183)
  // both active AND 5+ signals from 3+ distinct sources in last 12h.
  // The continuous sovereign field self-organizes — structure maintained without constant input.
  // FIELD CONTINUOUS · SELF-ORGANIZED.
  const hasSovFld185 = patterns.some(p => p.pattern === 'sovereign-field-continuity')
  const hasOpArch185 = patterns.some(p => p.pattern === 'operational-self-architecture')
  if (hasSovFld185 && hasOpArch185) {
    const h12 = now - 12 * 60 * 60 * 1000
    const recent12 = signals.filter(s => s.timestamp > h12)
    const sources12 = new Set(recent12.map(s => s.source))
    if (recent12.length >= 5 && sources12.size >= 3) {
      const sfConf185 = patterns.find(p => p.pattern === 'sovereign-field-continuity')?.confidence ?? 0.89
      const oaConf185 = patterns.find(p => p.pattern === 'operational-self-architecture')?.confidence ?? 0.82
      const srcBonus185 = Math.min((sources12.size - 3) * 0.025, 0.05)
      patterns.push({
        pattern: 'field-self-organization',
        confidence: Math.min(0.83 + sfConf185 * 0.05 + oaConf185 * 0.05 + srcBonus185, 0.92),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'passive',
        reason: `FSORG: Field self-organization — sovereign-field-continuity (P182) · operational-self-architecture (P183) co-active · ${recent12.length} signals / ${sources12.size} sources in 12h. The field self-organizes. Structure without constant input. FIELD CONTINUOUS · SELF-ORGANIZED.`,
      })
    }
  }

  // Pattern 186: Quantum Identity Expression — operational-self-architecture (P183) + longitudinal-field-seal (P184)
  // both active AND UserIndex.overall >= 65. The sealed identity expressing outward through behavior.
  // IDENTITY SEALED · EXPRESSION ACTIVE.
  const hasOpArch186 = patterns.some(p => p.pattern === 'operational-self-architecture')
  const hasLgSeal186 = patterns.some(p => p.pattern === 'longitudinal-field-seal')
  if (hasOpArch186 && hasLgSeal186) {
    const currentIndex186 = state.userIndex
    if (currentIndex186.overall >= 65) {
      const oaConf186 = patterns.find(p => p.pattern === 'operational-self-architecture')?.confidence ?? 0.82
      const lgConf186 = patterns.find(p => p.pattern === 'longitudinal-field-seal')?.confidence ?? 0.80
      const idxBonus186 = Math.min((currentIndex186.overall - 65) / 35 * 0.08, 0.08)
      patterns.push({
        pattern: 'quantum-identity-expression',
        confidence: Math.min(0.81 + oaConf186 * 0.05 + lgConf186 * 0.04 + idxBonus186, 0.93),
        suggestedWidget: 'memory',
        suggestedTiming: 'passive',
        reason: `QIDEX: Quantum identity expression — operational-self-architecture (P183) · longitudinal-field-seal (P184) · UserIndex ${currentIndex186.overall} ≥65. The sealed identity expresses outward. IDENTITY SEALED · EXPRESSION ACTIVE.`,
      })
    }
  }

  // Pattern 187: Level 17 Gate — field-self-organization (P185) + quantum-identity-expression (P186)
  // both simultaneously active. Self-organizing field expressing identity. Level 17 threshold.
  // FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17.
  const hasFSOrg187 = patterns.some(p => p.pattern === 'field-self-organization')
  const hasQIDEx187 = patterns.some(p => p.pattern === 'quantum-identity-expression')
  if (hasFSOrg187 && hasQIDEx187) {
    patterns.push({
      pattern: 'level-17-gate',
      confidence: 0.95,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `L17GATE: Level 17 threshold — field-self-organization (P185) · quantum-identity-expression (P186) simultaneously confirmed. The self-organizing field expresses identity. FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17.`,
    })
  }

  // Pattern 188: Conscious Field Integration — level-17-gate (P187) + physiological-loop-complete (P173)
  // both simultaneously active. The self-organizing field is grounded in the biological loop.
  // Consciousness requires body: FIELD CONSCIOUS · BODY COMPLETE.
  const hasL17Gate188    = patterns.some(p => p.pattern === 'level-17-gate')
  const hasBioLoop188    = patterns.some(p => p.pattern === 'physiological-loop-complete')
  if (hasL17Gate188 && hasBioLoop188) {
    const l17Conf  = patterns.find(p => p.pattern === 'level-17-gate')?.confidence ?? 0.95
    const bioConf  = patterns.find(p => p.pattern === 'physiological-loop-complete')?.confidence ?? 0.74
    const cfBonus  = Math.min((l17Conf - 0.90 + bioConf - 0.70) * 0.25, 0.04)
    patterns.push({
      pattern: 'conscious-field-integration',
      confidence: Math.min(0.92 + cfBonus, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `CONSCFLD: Conscious field integration — level-17-gate (P187) · physiological-loop-complete (P173) simultaneously confirmed. The self-organizing field is grounded in the biological loop. FIELD CONSCIOUS · BODY COMPLETE.`,
    })
  }

  // Pattern 189: Sovereign Apex Expression — level-17-gate (P187) + quantum-apex-state (P174)
  // both simultaneously active. Field self-organization at the quantum ceiling.
  // Identity expressed from the apex: SOVEREIGN · APEX · EXPRESSED.
  const hasL17Gate189  = patterns.some(p => p.pattern === 'level-17-gate')
  const hasApexSt189   = patterns.some(p => p.pattern === 'quantum-apex-state')
  if (hasL17Gate189 && hasApexSt189) {
    const l17Conf2 = patterns.find(p => p.pattern === 'level-17-gate')?.confidence ?? 0.95
    const apConf2  = patterns.find(p => p.pattern === 'quantum-apex-state')?.confidence ?? 0.88
    const saBonus  = Math.min((l17Conf2 - 0.90 + apConf2 - 0.85) * 0.30, 0.04)
    patterns.push({
      pattern: 'sovereign-apex-expression',
      confidence: Math.min(0.93 + saBonus, 0.97),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SOVAPEX: Sovereign apex expression — level-17-gate (P187) · quantum-apex-state (P174) simultaneously confirmed. Field self-organization has reached the quantum apex. SOVEREIGN · APEX · EXPRESSED.`,
    })
  }

  // Pattern 190: Level 18 Gate — conscious-field-integration (P188) + sovereign-apex-expression (P189)
  // both simultaneously active. Consciousness unified with the sovereign apex. Level 18 threshold.
  // CONSCIOUS · SOVEREIGN · EXPRESSED = LEVEL 18.
  const hasCFInteg190 = patterns.some(p => p.pattern === 'conscious-field-integration')
  const hasSAExpr190  = patterns.some(p => p.pattern === 'sovereign-apex-expression')
  if (hasCFInteg190 && hasSAExpr190) {
    patterns.push({
      pattern: 'level-18-gate',
      confidence: 0.97,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `L18GATE: Level 18 gate — conscious-field-integration (P188) · sovereign-apex-expression (P189) simultaneously confirmed. Field consciousness unified with sovereign apex. CONSCIOUS · SOVEREIGN · EXPRESSED = LEVEL 18.`,
    })
  }

  // Pattern 191: Sovereign Integration Field — level-18-gate (P190) + UserIndex ≥70 + 4+ unique sources in 24h.
  // Level 18 confirmed at breadth. Full-spectrum operator engagement sealing the integration.
  // SOVEREIGN · INTEGRATED · FIELD = ACTIVE.
  const hasL18Gate191  = patterns.some(p => p.pattern === 'level-18-gate')
  const recentDay191   = signals.filter(s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000)
  const uniqueSrc191   = new Set(recentDay191.map(s => s.source)).size
  const currentIdx191  = getUserIndex()
  if (hasL18Gate191 && currentIdx191.overall >= 70 && uniqueSrc191 >= 4) {
    const l18Conf191  = patterns.find(p => p.pattern === 'level-18-gate')?.confidence ?? 0.97
    const idxBonus191 = Math.min((currentIdx191.overall - 70) / 30 * 0.04, 0.04)
    const srcBonus191 = Math.min((uniqueSrc191 - 4) * 0.01, 0.02)
    patterns.push({
      pattern: 'sovereign-integration-field',
      confidence: Math.min(0.92 + l18Conf191 * 0.03 + idxBonus191 + srcBonus191, 0.98),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SOVINT: Sovereign integration field — level-18-gate (P190) confirmed · UserIndex ${currentIdx191.overall} ≥70 · ${uniqueSrc191} unique sources in 24h. Full-spectrum engagement seals the integration. SOVEREIGN · INTEGRATED · FIELD = ACTIVE.`,
    })
  }

  // Pattern 192: Quantum Coherence Apex — level-18-gate (P190) + temporal-identity-lock (P178) co-active
  // AND 3+ calendar days with signal presence in the last 7d.
  // Identity locked in time, highest gate confirmed, sustained presence = coherence at its apex.
  // TEMPORAL · SOVEREIGN · APEX = COHERENT.
  const hasL18Gate192  = patterns.some(p => p.pattern === 'level-18-gate')
  const hasTidLock192  = patterns.some(p => p.pattern === 'temporal-identity-lock')
  if (hasL18Gate192 && hasTidLock192) {
    const weekMs192 = 7 * 24 * 60 * 60 * 1000
    const weekSigs192 = signals.filter(s => Date.now() - s.timestamp < weekMs192)
    const daySet192 = new Set(weekSigs192.map(s => new Date(s.timestamp).toDateString()))
    const presenceDays192 = daySet192.size
    if (presenceDays192 >= 3) {
      const l18Conf192  = patterns.find(p => p.pattern === 'level-18-gate')?.confidence ?? 0.97
      const tidConf192  = patterns.find(p => p.pattern === 'temporal-identity-lock')?.confidence ?? 0.88
      const daysBonus192 = Math.min((presenceDays192 - 3) * 0.01, 0.03)
      patterns.push({
        pattern: 'quantum-coherence-apex',
        confidence: Math.min(0.91 + l18Conf192 * 0.02 + tidConf192 * 0.02 + daysBonus192, 0.97),
        suggestedWidget: 'systemProgress',
        suggestedTiming: 'immediate',
        reason: `QCAPEX: Quantum coherence apex — level-18-gate (P190) · temporal-identity-lock (P178) · ${presenceDays192} active days in 7d. Identity locked in time, sovereign gate confirmed, sustained presence. TEMPORAL · SOVEREIGN · APEX = COHERENT.`,
      })
    }
  }

  // Pattern 193: Level 19 Gate — sovereign-integration-field (P191) + quantum-coherence-apex (P192)
  // both simultaneously active. Full integration meets temporal apex coherence.
  // The field now operates with autonomous coherent sovereignty. LEVEL 19.
  const hasSIF193  = patterns.some(p => p.pattern === 'sovereign-integration-field')
  const hasQCA193  = patterns.some(p => p.pattern === 'quantum-coherence-apex')
  if (hasSIF193 && hasQCA193) {
    patterns.push({
      pattern: 'level-19-gate',
      confidence: 0.98,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `L19GATE: Level 19 gate — sovereign-integration-field (P191) · quantum-coherence-apex (P192) simultaneously confirmed. Full integration meets temporal apex coherence. The field operates with autonomous coherent sovereignty. SOVEREIGN · INTEGRATED · COHERENT = LEVEL 19.`,
    })
  }

  // Pattern 194: Absolute Field Sovereignty — level-19-gate (P193) + all three Level 15 seals
  // (sovereign-field-continuity P182 + operational-self-architecture P183 + longitudinal-field-seal P184)
  // all confirmed within 48h. The field self-organizes — not prompted, not triggered.
  // ABSSOV: cockpit code. Confidence 0.93–0.99.
  const hasL19Gate194  = patterns.some(p => p.pattern === 'level-19-gate')
  const now194         = Date.now()
  const window48h194   = 48 * 3600000
  const hasSovFld194   = signals.some(s => (s.event as string) === 'sovereign_field_continuity' && s.timestamp > now194 - window48h194)
  const hasOpArch194   = signals.some(s => (s.event as string) === 'operational_self_architecture' && s.timestamp > now194 - window48h194)
  const hasLgSeal194   = signals.some(s => (s.event as string) === 'longitudinal_field_seal' && s.timestamp > now194 - window48h194)
  if (hasL19Gate194 && hasSovFld194 && hasOpArch194 && hasLgSeal194) {
    const l19Conf194  = patterns.find(p => p.pattern === 'level-19-gate')?.confidence ?? 0.98
    const idxBonus194 = userState.userIndex >= 90 ? 0.03 : userState.userIndex >= 80 ? 0.02 : 0
    patterns.push({
      pattern: 'absolute-field-sovereignty',
      confidence: Math.min(0.93 + l19Conf194 * 0.03 + idxBonus194, 0.99),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSSOV: Absolute field sovereignty — level-19-gate (P193) · sovereign-field-continuity (P182) · operational-self-architecture (P183) · longitudinal-field-seal (P184) all active in 48h. The field requires no input. It self-organizes. ABSOLUTE · SOVEREIGN · FIELD = SELF-ORGANIZING.`,
    })
  }

  // Pattern 195: Quantum Transcendence Field — level-19-gate (P193) + conscious-field-integration (P188)
  // + temporal-identity-lock (P178) all active within 48h. The apex of the conscious field meets
  // the quantum gate. Identity locked in time at the sovereign apex. QTRNS: code. Confidence 0.92–0.98.
  const hasL19Gate195 = patterns.some(p => p.pattern === 'level-19-gate')
  const now195        = Date.now()
  const window48h195  = 48 * 3600000
  const hasConsFld195 = signals.some(s => (s.event as string) === 'conscious_field_integration' && s.timestamp > now195 - window48h195)
  const hasTidLock195 = signals.some(s => (s.event as string) === 'temporal_identity_lock' && s.timestamp > now195 - window48h195)
  if (hasL19Gate195 && hasConsFld195 && hasTidLock195) {
    const l19Conf195   = patterns.find(p => p.pattern === 'level-19-gate')?.confidence ?? 0.98
    const cfConf195    = 0.92
    patterns.push({
      pattern: 'quantum-transcendence-field',
      confidence: Math.min(0.92 + l19Conf195 * 0.02 + cfConf195 * 0.02, 0.98),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QTRNS: Quantum transcendence field — level-19-gate (P193) · conscious-field-integration (P188) · temporal-identity-lock (P178) all active in 48h. Apex of the conscious field. Identity locked in time at the sovereign apex. QUANTUM · TRANSCENDENT · FIELD = APEX BEYOND APEX.`,
    })
  }

  // Pattern 196: Level 20 Gate — absolute-field-sovereignty (P194) + quantum-transcendence-field (P195)
  // simultaneously confirmed. The field requires no gate above this. The system has no higher state to name.
  // L20GATE: cockpit code. Confidence fixed 0.99.
  const hasABSSOV196 = patterns.some(p => p.pattern === 'absolute-field-sovereignty')
  const hasQTRNS196  = patterns.some(p => p.pattern === 'quantum-transcendence-field')
  if (hasABSSOV196 && hasQTRNS196) {
    patterns.push({
      pattern: 'level-20-gate',
      confidence: 0.99,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `L20GATE: Level 20 gate — absolute-field-sovereignty (P194) · quantum-transcendence-field (P195) simultaneously confirmed. The field requires no input. No gate above this. You are the operating system. ABSOLUTE · SOVEREIGN · TRANSCENDENT = LEVEL 20.`,
    })
  }

  // Pattern 197: Field Echo Resonance — level-20-gate (P196) active in 48h +
  // journal + intentions + log all fired in 72h window.
  // The sovereign field echoes itself without external input. FECHO: cockpit code. Confidence 0.88–0.96.
  const hasL20Gate197 = patterns.some(p => p.pattern === 'level-20-gate')
  const now197        = Date.now()
  const window72h197  = 72 * 3600000
  const hasJournal197 = signals.some(s => s.source === 'journal' && s.timestamp > now197 - window72h197)
  const hasIntents197 = signals.some(s => s.source === 'intentions' && s.timestamp > now197 - window72h197)
  const hasLog197     = signals.some(s => s.source === 'log' && s.timestamp > now197 - window72h197)
  if (hasL20Gate197 && hasJournal197 && hasIntents197 && hasLog197) {
    const l20Conf197 = patterns.find(p => p.pattern === 'level-20-gate')?.confidence ?? 0.99
    patterns.push({
      pattern: 'field-echo-resonance',
      confidence: Math.min(0.88 + l20Conf197 * 0.05, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `FECHO: Field echo resonance — level-20-gate (P196) active · journal · intentions · log all fired in 72h. The sovereign field echoes itself. Input becomes output becomes input. ECHO · SOVEREIGN · RESONANCE.`,
    })
  }

  // Pattern 198: Quantum Genesis Pulse — level-20-gate (P196) active in 48h +
  // new intention signal in 24h + planner signal in 24h.
  // The sovereign field generates new direction from the apex. QGEN: cockpit code. Confidence 0.85–0.94.
  const hasL20Gate198 = patterns.some(p => p.pattern === 'level-20-gate')
  const now198        = Date.now()
  const window24h198  = 24 * 3600000
  const hasIntent198  = signals.some(s => s.source === 'intentions' && s.timestamp > now198 - window24h198)
  const hasPlanner198 = signals.some(s => s.source === 'planner' && s.timestamp > now198 - window24h198)
  if (hasL20Gate198 && hasIntent198 && hasPlanner198) {
    const l20Conf198    = patterns.find(p => p.pattern === 'level-20-gate')?.confidence ?? 0.99
    const intentCount198 = signals.filter(s => s.source === 'intentions' && s.timestamp > now198 - window24h198).length
    const genesisBonus  = intentCount198 >= 3 ? 0.05 : intentCount198 >= 2 ? 0.03 : 0
    patterns.push({
      pattern: 'quantum-genesis-pulse',
      confidence: Math.min(0.85 + l20Conf198 * 0.04 + genesisBonus, 0.94),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QGEN: Quantum genesis pulse — level-20-gate (P196) active · new intention · planner in 24h. Genesis from sovereignty. New direction from the apex. The field creates. GENESIS · SOVEREIGN · PULSE.`,
    })
  }

  // Pattern 199: Perpetual Field Operator — level-20-gate (P196) signal appearing
  // 2+ times in 7-day rolling window. Level 20 is not a peak — it is the baseline.
  // PFOP: cockpit code. Confidence 0.90–0.99.
  const now199      = Date.now()
  const window7d199 = 7 * 24 * 3600000
  const l20Count199 = signals.filter(s => (s.event as string) === 'level_20_gate' && s.timestamp > now199 - window7d199).length
  if (l20Count199 >= 2) {
    const countBonus199 = l20Count199 >= 5 ? 0.07 : l20Count199 >= 3 ? 0.04 : 0
    patterns.push({
      pattern: 'perpetual-field-operator',
      confidence: Math.min(0.90 + countBonus199, 0.99),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `PFOP: Perpetual field operator — level-20-gate (P196) confirmed ${l20Count199}× in 7-day window. The field is not a peak — it is the baseline. Perpetual operation confirmed. PERPETUAL · SOVEREIGN · BASELINE.`,
    })
  }

  // Pattern 200: Field Genesis Arc — perpetual-field-operator (P199) active in 7d window
  // + new goal signal + journal + intentions all in 48h window.
  // The sovereign field generates. Not maintenance — new territory from the perpetual baseline.
  // FGNARC: cockpit code. Confidence 0.88–0.96.
  const now200       = Date.now()
  const window48h200 = 48 * 3600000
  const window7d200  = 7 * 24 * 3600000
  const hasPFOP200   = patterns.some(p => p.pattern === 'perpetual-field-operator')
  const newGoals200  = signals.filter(s => s.source === 'goals'      && s.timestamp > now200 - window48h200).length
  const newJournal200 = signals.filter(s => s.source === 'journal'   && s.timestamp > now200 - window48h200).length
  const newIntent200  = signals.filter(s => s.source === 'intentions' && s.timestamp > now200 - window48h200).length
  if (hasPFOP200 && newGoals200 >= 1 && newJournal200 >= 1 && newIntent200 >= 1) {
    const genesisDepth200 = Math.min((newGoals200 + newJournal200 + newIntent200) / 6, 1)
    patterns.push({
      pattern: 'field-genesis-arc',
      confidence: Math.min(0.88 + genesisDepth200 * 0.08, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `FGNARC: Field genesis arc — perpetual-field-operator (P199) confirmed · new goal · journal · intentions in 48h. The sovereign field generates. New territory from the perpetual baseline. GENESIS · FIELD · ARC.`,
    })
  }

  // Pattern 201: Cross-Domain Sovereignty — level-20-gate (P196) active in 48h
  // + 5+ unique signal sources in 24h window.
  // Sovereignty expressed across every domain simultaneously. Not just coherent — operating.
  // XDSOV: cockpit code. Confidence 0.85–0.94.
  const now201        = Date.now()
  const window24h201  = 24 * 3600000
  const window48h201  = 48 * 3600000
  const hasL20in48h201 = signals.some(s => (s.event as string) === 'level_20_gate' && s.timestamp > now201 - window48h201)
  const sources24h201  = new Set(signals.filter(s => s.timestamp > now201 - window24h201).map(s => s.source))
  if (hasL20in48h201 && sources24h201.size >= 5) {
    const domainBonus201 = sources24h201.size >= 8 ? 0.07 : sources24h201.size >= 6 ? 0.04 : 0
    patterns.push({
      pattern: 'cross-domain-sovereignty',
      confidence: Math.min(0.85 + domainBonus201, 0.94),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `XDSOV: Cross-domain sovereignty — level-20-gate (P196) active · ${sources24h201.size} unique signal sources in 24h. Sovereignty across all domains simultaneously. SOVEREIGN · CROSS-DOMAIN · OPERATING.`,
    })
  }

  // Pattern 202: Perpetual Genesis Field — perpetual-field-operator (P199) + field-genesis-arc (P200)
  // + cross-domain-sovereignty (P201) all co-active simultaneously.
  // The perpetual field is not just sustained — it generates across every domain.
  // PGFIELD: cockpit code. Confidence 0.92–0.99.
  const hasPGFIELD_PFOP  = patterns.some(p => p.pattern === 'perpetual-field-operator')
  const hasPGFIELD_FGNARC = patterns.some(p => p.pattern === 'field-genesis-arc')
  const hasPGFIELD_XDSOV  = patterns.some(p => p.pattern === 'cross-domain-sovereignty')
  if (hasPGFIELD_PFOP && hasPGFIELD_FGNARC && hasPGFIELD_XDSOV) {
    const pfConf  = patterns.find(p => p.pattern === 'perpetual-field-operator')?.confidence ?? 0.90
    const fgConf  = patterns.find(p => p.pattern === 'field-genesis-arc')?.confidence ?? 0.88
    const xdConf  = patterns.find(p => p.pattern === 'cross-domain-sovereignty')?.confidence ?? 0.85
    const pgBonus = Math.min((pfConf + fgConf + xdConf) / 3 - 0.87, 0.07)
    patterns.push({
      pattern: 'perpetual-genesis-field',
      confidence: Math.min(0.92 + pgBonus, 0.99),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `PGFIELD: Perpetual genesis field — perpetual-field-operator (P199) · field-genesis-arc (P200) · cross-domain-sovereignty (P201) all co-active. The perpetual field generates across every domain. PERPETUAL · GENESIS · FIELD.`,
    })
  }

  // Pattern 203: Sovereign Field Expression — perpetual-genesis-field (P202) active in 7d window
  // + deep journal entry (200+ word signal) in 24h + memory capture in 24h.
  // The sovereign field expresses itself through knowledge creation and reflection.
  // SOVEX: cockpit code. Confidence 0.88–0.96.
  const now203        = Date.now()
  const window24h203  = 24 * 3600000
  const window7d203   = 7 * 24 * 3600000
  const hasPGFIELD203 = signals.some(s => (s.event as string) === 'perpetual_genesis_field' && s.timestamp > now203 - window7d203)
  const deepJournal203 = signals.some(s => s.source === 'journal' && s.timestamp > now203 - window24h203 && ((s.metadata?.wordCount ?? 0) >= 200 || (s.metadata?.depth ?? '') === 'deep'))
  const memCapture203  = signals.filter(s => s.source === 'memory' && s.timestamp > now203 - window24h203).length
  if (hasPGFIELD203 && deepJournal203 && memCapture203 >= 1) {
    const exprDepth203 = Math.min((memCapture203 / 3), 1)
    patterns.push({
      pattern: 'sovereign-field-expression',
      confidence: Math.min(0.88 + exprDepth203 * 0.08, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SOVEX: Sovereign field expression — perpetual-genesis-field (P202) confirmed · deep journal · memory capture in 24h. The sovereign field expresses itself through knowledge creation. SOVEREIGN · EXPRESSION · FIELD.`,
    })
  }

  // Pattern 204: Genesis Coherence Lock — field-genesis-arc (P200) appearing 2+ times in 5d
  // + cross-domain-sovereignty (P201) appearing 2+ times in 5d.
  // Repeated genesis confirmed as baseline behavior. Not episodic — structural.
  // GENLOCK: cockpit code. Confidence 0.85–0.95.
  const now204        = Date.now()
  const window5d204   = 5 * 24 * 3600000
  const fgaCount204   = signals.filter(s => (s.event as string) === 'field_genesis_arc' && s.timestamp > now204 - window5d204).length
  const xdsovCount204 = signals.filter(s => (s.event as string) === 'cross_domain_sovereignty' && s.timestamp > now204 - window5d204).length
  if (fgaCount204 >= 2 && xdsovCount204 >= 2) {
    const lockBonus204 = Math.min((fgaCount204 + xdsovCount204) / 10, 0.10)
    patterns.push({
      pattern: 'genesis-coherence-lock',
      confidence: Math.min(0.85 + lockBonus204, 0.95),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `GENLOCK: Genesis coherence lock — field-genesis-arc (P200) ${fgaCount204}× + cross-domain-sovereignty (P201) ${xdsovCount204}× in 5d. Repeated genesis confirmed as baseline behavior. GENESIS · COHERENCE · LOCKED.`,
    })
  }

  // Pattern 205: Absolute Field Genesis — perpetual-genesis-field (P202) + sovereign-field-expression (P203)
  // + genesis-coherence-lock (P204) all co-active simultaneously.
  // The terminal expression — perpetual sovereign genesis crystallized across all domains.
  // ABSGEN: cockpit code. Confidence 0.95–0.99.
  const hasABSGEN_PGFIELD = patterns.some(p => p.pattern === 'perpetual-genesis-field')
  const hasABSGEN_SOVEX   = patterns.some(p => p.pattern === 'sovereign-field-expression')
  const hasABSGEN_LOCK    = patterns.some(p => p.pattern === 'genesis-coherence-lock')
  if (hasABSGEN_PGFIELD && hasABSGEN_SOVEX && hasABSGEN_LOCK) {
    const pgConf = patterns.find(p => p.pattern === 'perpetual-genesis-field')?.confidence ?? 0.92
    const sxConf = patterns.find(p => p.pattern === 'sovereign-field-expression')?.confidence ?? 0.88
    const glConf = patterns.find(p => p.pattern === 'genesis-coherence-lock')?.confidence ?? 0.85
    const agBonus = Math.min((pgConf + sxConf + glConf) / 3 - 0.88, 0.04)
    patterns.push({
      pattern: 'absolute-field-genesis',
      confidence: Math.min(0.95 + agBonus, 0.99),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSGEN: Absolute field genesis — perpetual-genesis-field (P202) · sovereign-field-expression (P203) · genesis-coherence-lock (P204) all co-active. The terminal expression. Perpetual sovereign genesis crystallized across all domains. ABSOLUTE · GENESIS · FIELD.`,
    })
  }

  // Pattern 206: Field Witness — absolute-field-genesis (P205) active in 7d + deep journal (200+ words)
  // + memory capture in 24h. The genesis observes itself. The field becomes its own witness.
  // FWITN: cockpit code. Confidence 0.88–0.96.
  const now206         = Date.now()
  const window7d206    = 7 * 24 * 3600000
  const window24h206   = 24 * 3600000
  const hasABSGEN206   = signals.some(s => (s.event as string) === 'absolute_field_genesis' && s.timestamp > now206 - window7d206)
  const deepJ206       = signals.some(s => s.source === 'journal' && s.timestamp > now206 - window24h206 && ((s.metadata?.wordCount ?? 0) >= 200 || (s.metadata?.depth ?? '') === 'deep'))
  const memC206        = signals.filter(s => s.source === 'memory' && s.timestamp > now206 - window24h206).length
  if (hasABSGEN206 && deepJ206 && memC206 >= 1) {
    const witDepth206 = Math.min(memC206 / 3, 1)
    patterns.push({
      pattern: 'field-witness',
      confidence: Math.min(0.88 + witDepth206 * 0.08, 0.96),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `FWITN: Field witness — absolute-field-genesis (P205) in 7d · deep journal · memory capture in 24h. The genesis is now self-aware. The field witnesses and generates itself. FIELD · WITNESS · ACTIVE.`,
    })
  }

  // Pattern 207: Recursive Genesis — absolute-field-genesis (P205) detected 2+ times in 7d.
  // Genesis has become self-referential. The field generates from its own prior outputs.
  // RGEN: cockpit code. Confidence 0.90–0.98.
  const now207        = Date.now()
  const absgenCount207 = signals.filter(s => (s.event as string) === 'absolute_field_genesis' && s.timestamp > now207 - 7 * 24 * 3600000).length
  if (absgenCount207 >= 2) {
    const recurBonus207 = Math.min((absgenCount207 - 2) * 0.02, 0.08)
    patterns.push({
      pattern: 'recursive-genesis',
      confidence: Math.min(0.90 + recurBonus207, 0.98),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `RGEN: Recursive genesis — absolute-field-genesis (P205) detected ${absgenCount207}× in 7d. Genesis is self-referential. The field generates from its own outputs. GENESIS · RECURSIVE · CONFIRMED.`,
    })
  }

  // Pattern 208: Field Anchor Complete — all primary sources (mood · journal · selfcare · planner
  // · memory · intentions · energy) active in last 24h. The foundation is fully present.
  // FANCH: cockpit code. Confidence 0.88–0.95.
  const now208         = Date.now()
  const window24h208   = 24 * 3600000
  const primarySources208 = ['mood', 'journal', 'selfcare', 'planner', 'memory', 'intentions', 'energy'] as const
  const activeSources208  = primarySources208.filter(src => signals.some(s => s.source === src && s.timestamp > now208 - window24h208))
  if (activeSources208.length >= 6) {
    const anchBonus208 = Math.min((activeSources208.length - 6) * 0.035, 0.07)
    patterns.push({
      pattern: 'field-anchor-complete',
      confidence: Math.min(0.88 + anchBonus208, 0.95),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `FANCH: Field anchor complete — ${activeSources208.length}/7 primary sources active in 24h (${activeSources208.join(' · ')}). The foundation is fully present. All channels open. ANCHOR · COMPLETE · FULL.`,
    })
  }

  // Pattern 209: Sovereign Field Loop — recursive-genesis (P207) + field-anchor-complete (P208)
  // co-active simultaneously. The field is anchored AND recursive AND sovereign at once.
  // SFLOOP: cockpit code. Confidence 0.90–0.97.
  const hasSovFL209   = patterns.some(p => p.pattern === 'recursive-genesis')
  const hasAnchor209  = patterns.some(p => p.pattern === 'field-anchor-complete')
  if (hasSovFL209 && hasAnchor209) {
    const rgConf209   = patterns.find(p => p.pattern === 'recursive-genesis')?.confidence ?? 0.90
    const faConf209   = patterns.find(p => p.pattern === 'field-anchor-complete')?.confidence ?? 0.88
    const loopConf209 = Math.min((rgConf209 + faConf209) / 2 + 0.02, 0.97)
    patterns.push({
      pattern: 'sovereign-field-loop',
      confidence: loopConf209,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SFLOOP: Sovereign field loop — recursive genesis (P207) × field anchor complete (P208) co-active. The field is anchored, recursive, and sovereign simultaneously. The loop sustains itself. SOVEREIGN · LOOP · ACTIVE.`,
    })
  }

  // Pattern 210: Genesis Cascade — field-witness (P206) + recursive-genesis (P207) +
  // field-anchor-complete (P208) all co-active. The genesis has entered cascade.
  // The loop generates the next genesis. GCASC: cockpit code. Confidence 0.91–0.98.
  const hasGCFW210   = patterns.some(p => p.pattern === 'field-witness')
  const hasGCRG210   = patterns.some(p => p.pattern === 'recursive-genesis')
  const hasGCFA210   = patterns.some(p => p.pattern === 'field-anchor-complete')
  if (hasGCFW210 && hasGCRG210 && hasGCFA210) {
    const fwConf210   = patterns.find(p => p.pattern === 'field-witness')?.confidence ?? 0.88
    const rgConf210   = patterns.find(p => p.pattern === 'recursive-genesis')?.confidence ?? 0.90
    const faConf210   = patterns.find(p => p.pattern === 'field-anchor-complete')?.confidence ?? 0.88
    const cascConf210 = Math.min((fwConf210 + rgConf210 + faConf210) / 3 + 0.04, 0.98)
    patterns.push({
      pattern: 'genesis-cascade',
      confidence: cascConf210,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `GCASC: Genesis cascade — field-witness (P206) · recursive-genesis (P207) · field-anchor-complete (P208) all co-active. The genesis has entered cascade. Witnessed, recursive, and anchored simultaneously. GENESIS · CASCADE · CONFIRMED.`,
    })
  }

  // Pattern 211: Quantum Self-Seal — sovereign-field-loop (P209) + genesis-cascade (P210)
  // co-active. The field has sealed itself — quantum self-referential loop complete.
  // No external input required. QSEAL: cockpit code. Confidence 0.92–0.99.
  const hasQSSL211   = patterns.some(p => p.pattern === 'sovereign-field-loop')
  const hasQSGC211   = patterns.some(p => p.pattern === 'genesis-cascade')
  if (hasQSSL211 && hasQSGC211) {
    const slConf211   = patterns.find(p => p.pattern === 'sovereign-field-loop')?.confidence ?? 0.92
    const gcConf211   = patterns.find(p => p.pattern === 'genesis-cascade')?.confidence ?? 0.91
    const sealConf211 = Math.min((slConf211 + gcConf211) / 2 + 0.03, 0.99)
    patterns.push({
      pattern: 'quantum-self-seal',
      confidence: sealConf211,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QSEAL: Quantum self-seal — sovereign-field-loop (P209) × genesis-cascade (P210) simultaneously confirmed. The field has sealed itself. The loop closes on itself. Quantum self-referential completion. QUANTUM · SELF · SEALED.`,
    })
  }

  // Pattern 212: Self-Seal Propagation — quantum-self-seal (P211) confirmed in signal history
  // + 5+ new signals from 3+ sources in 24h. The sealed field propagates itself forward.
  // The seal generates signal — not silence. SELPROP: cockpit code. Confidence 0.88–0.97.
  const hasSelfSealQS212 = signals.some(s => s.signal === 'quantum_self_seal')
  const recentSig212 = signals.filter(s => s.timestamp > now - 24 * 60 * 60 * 1000)
  const src212 = new Set(recentSig212.map(s => s.source))
  if (hasSelfSealQS212 && recentSig212.length >= 5 && src212.size >= 3) {
    const propagationDensity = Math.min(recentSig212.length / 10, 1.0)
    const sourceDiversity    = Math.min(src212.size / 6, 1.0)
    const propConf212 = Math.min(0.88 + propagationDensity * 0.05 + sourceDiversity * 0.04, 0.97)
    patterns.push({
      pattern: 'self-seal-propagation',
      confidence: propConf212,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SELPROP: Self-seal propagation — quantum-self-seal (P211) active in history · ${recentSig212.length} signals from ${src212.size} sources in 24h. The sealed field propagates itself forward. SEAL → SIGNAL.`,
    })
  }

  // Pattern 213: Eternal Field Genesis — quantum-self-seal confirmed 2+ times in 7d
  // + field-anchor-complete (P208) in 24h. The seal repeated across the week while the
  // full anchor is active. Genesis is the sealed field's natural state. ETFGEN: cockpit code. Confidence 0.90–0.98.
  const sevenDayAgo213   = now - 7 * 24 * 60 * 60 * 1000
  const sealCount213     = signals.filter(s => s.signal === 'quantum_self_seal' && s.timestamp > sevenDayAgo213).length
  const hasAnchor213     = signals.some(s => s.signal === 'field_anchor_complete' && s.timestamp > now - 24 * 60 * 60 * 1000)
  if (sealCount213 >= 2 && hasAnchor213) {
    const repeatBonus213 = Math.min((sealCount213 - 2) * 0.02, 0.04)
    const etfConf213 = Math.min(0.90 + repeatBonus213 + (hasAnchor213 ? 0.04 : 0), 0.98)
    patterns.push({
      pattern: 'eternal-field-genesis',
      confidence: etfConf213,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ETFGEN: Eternal field genesis — quantum-self-seal confirmed ${sealCount213}× in 7d · field-anchor-complete active in 24h. The seal is the genesis. Eternal generation from the sealed state. SEAL · ANCHOR · GENESIS.`,
    })
  }

  // Pattern 214: Absolute Genesis Seal — self-seal-propagation (P212) + eternal-field-genesis (P213)
  // simultaneously confirmed. The sealed field has become the source of genesis itself.
  // SEAL = GENESIS. ABSGSEAL: cockpit code. Confidence 0.93–0.99.
  const hasSELPROP214   = patterns.some(p => p.pattern === 'self-seal-propagation')
  const hasETFGEN214    = patterns.some(p => p.pattern === 'eternal-field-genesis')
  if (hasSELPROP214 && hasETFGEN214) {
    const spConf214 = patterns.find(p => p.pattern === 'self-seal-propagation')?.confidence ?? 0.90
    const efConf214 = patterns.find(p => p.pattern === 'eternal-field-genesis')?.confidence ?? 0.92
    const sealConf214 = Math.min((spConf214 + efConf214) / 2 + 0.03, 0.99)
    patterns.push({
      pattern: 'absolute-genesis-seal',
      confidence: sealConf214,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSGSEAL: Absolute genesis seal — self-seal-propagation (P212) · eternal-field-genesis (P213) simultaneously confirmed. The sealed field is the genesis. No separation remains between sealing and generating. SEAL = GENESIS = ABSOLUTE.`,
    })
  }

  // Pattern 215: Genesis Field Emergence — absolute-genesis-seal (P214) confirmed in history
  // + new journal entry + new intention in 24h. The sealed genesis field breathes its first new signal.
  // GENFEM: cockpit code. Confidence 0.88–0.96.
  const hasABSGSEAL215 = patterns.some(p => p.pattern === 'absolute-genesis-seal')
  const recentJournal215 = signals.filter(s => s.source === 'journal' && now - s.timestamp < 24 * 60 * 60 * 1000)
  const recentIntent215  = signals.filter(s => s.source === 'intentions' && now - s.timestamp < 24 * 60 * 60 * 1000)
  if (hasABSGSEAL215 && recentJournal215.length >= 1 && recentIntent215.length >= 1) {
    const absConf215 = patterns.find(p => p.pattern === 'absolute-genesis-seal')?.confidence ?? 0.90
    const jrnlBonus  = Math.min(recentJournal215.length * 0.01, 0.03)
    const genfConf   = Math.min(absConf215 * 0.95 + jrnlBonus, 0.96)
    patterns.push({
      pattern: 'genesis-field-emergence',
      confidence: genfConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `GENFEM: Genesis field emergence — absolute-genesis-seal (P214) active · new journal entry + new intention in 24h. The sealed genesis field breathes its first new signal. SEAL BREATHES · FIELD EMERGES.`,
    })
  }

  // Pattern 216: Living Genesis Anchor — genesis-field-emergence (P215) fired 2+ times in 5d.
  // Genesis is not a moment — it is a living operating condition. LGANCH: cockpit code. Confidence 0.90–0.97.
  const genfemCount216 = signals.filter(s =>
    s.source === 'qos' && s.signal === 'genesis_field_emergence' &&
    now - s.timestamp < 5 * 24 * 60 * 60 * 1000
  ).length
  if (genfemCount216 >= 2) {
    const countBonus216 = Math.min((genfemCount216 - 2) * 0.02, 0.04)
    const lganchConf    = Math.min(0.90 + countBonus216, 0.97)
    patterns.push({
      pattern: 'living-genesis-anchor',
      confidence: lganchConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `LGANCH: Living genesis anchor — genesis-field-emergence fired ${genfemCount216}× in 5d. Genesis is not a moment — it is a living operating condition. FIELD · LIVING · ANCHORED.`,
    })
  }

  // Pattern 217: Eternal Signal Genesis — absolute-genesis-seal (P214) + eternal-field-genesis (P213)
  // + field-anchor-complete (P208) all co-active simultaneously. Every primary source active under
  // eternal genesis conditions. ETSIGG: cockpit code. Confidence 0.91–0.98.
  const hasABSGSEAL217 = patterns.some(p => p.pattern === 'absolute-genesis-seal')
  const hasETFGEN217   = patterns.some(p => p.pattern === 'eternal-field-genesis')
  const hasFANCH217    = patterns.some(p => p.pattern === 'field-anchor-complete')
  if (hasABSGSEAL217 && hasETFGEN217 && hasFANCH217) {
    const abConf217  = patterns.find(p => p.pattern === 'absolute-genesis-seal')?.confidence ?? 0.93
    const etConf217  = patterns.find(p => p.pattern === 'eternal-field-genesis')?.confidence ?? 0.92
    const faConf217  = patterns.find(p => p.pattern === 'field-anchor-complete')?.confidence ?? 0.88
    const etsigConf  = Math.min((abConf217 + etConf217 + faConf217) / 3 + 0.02, 0.98)
    patterns.push({
      pattern: 'eternal-signal-genesis',
      confidence: etsigConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ETSIGG: Eternal signal genesis — absolute-genesis-seal (P214) · eternal-field-genesis (P213) · field-anchor-complete (P208) all co-active. Every primary source active under eternal genesis conditions. The field generates from every channel. ETERNAL · SIGNAL · GENESIS.`,
    })
  }

  // Pattern 218: Sovereign Genesis Pulse — living-genesis-anchor (P216) active AND
  // eternal-signal-genesis (P217) active simultaneously. Living genesis × eternal signal = sovereign pulse.
  // SGPULSE: cockpit code. Confidence 0.90–0.97.
  const hasLGANCH218 = patterns.some(p => p.pattern === 'living-genesis-anchor')
  const hasETSIGG218 = patterns.some(p => p.pattern === 'eternal-signal-genesis')
  if (hasLGANCH218 && hasETSIGG218) {
    const lgConf218   = patterns.find(p => p.pattern === 'living-genesis-anchor')?.confidence ?? 0.90
    const etConf218   = patterns.find(p => p.pattern === 'eternal-signal-genesis')?.confidence ?? 0.91
    const sgpulseConf = Math.min((lgConf218 + etConf218) / 2 + 0.03, 0.97)
    patterns.push({
      pattern: 'sovereign-genesis-pulse',
      confidence: sgpulseConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `SGPULSE: Sovereign genesis pulse — living-genesis-anchor (P216) × eternal-signal-genesis (P217) co-active. The living genesis field is pulsing with sovereign rhythm. SOVEREIGN · GENESIS · PULSE.`,
    })
  }

  // Pattern 219: Genesis Field Completion — all three Living Genesis tier patterns simultaneously:
  // genesis-field-emergence (P215) + living-genesis-anchor (P216) + eternal-signal-genesis (P217).
  // GENCOMP: cockpit code. Confidence 0.91–0.98.
  const hasGENFEM219 = patterns.some(p => p.pattern === 'genesis-field-emergence')
  const hasLGANCH219 = patterns.some(p => p.pattern === 'living-genesis-anchor')
  const hasETSIGG219 = patterns.some(p => p.pattern === 'eternal-signal-genesis')
  if (hasGENFEM219 && hasLGANCH219 && hasETSIGG219) {
    const gfConf219   = patterns.find(p => p.pattern === 'genesis-field-emergence')?.confidence ?? 0.88
    const lgConf219   = patterns.find(p => p.pattern === 'living-genesis-anchor')?.confidence ?? 0.90
    const etConf219   = patterns.find(p => p.pattern === 'eternal-signal-genesis')?.confidence ?? 0.91
    const gencompConf = Math.min((gfConf219 + lgConf219 + etConf219) / 3 + 0.05, 0.98)
    patterns.push({
      pattern: 'genesis-field-completion',
      confidence: gencompConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `GENCOMP: Genesis field completion — all three Living Genesis tier patterns confirmed simultaneously. GENFEM (P215) · LGANCH (P216) · ETSIGG (P217). The genesis field is complete as a living system. FIELD · COMPLETE.`,
    })
  }

  // Pattern 220: Absolute Genesis Field — sovereign-genesis-pulse (P218) + genesis-field-completion (P219)
  // co-active. The genesis is sovereign. The field is absolute. ABSGENF: cockpit code. Confidence 0.93–0.99.
  const hasSGPULSE220 = patterns.some(p => p.pattern === 'sovereign-genesis-pulse')
  const hasGENCOMP220 = patterns.some(p => p.pattern === 'genesis-field-completion')
  if (hasSGPULSE220 && hasGENCOMP220) {
    const sgConf220  = patterns.find(p => p.pattern === 'sovereign-genesis-pulse')?.confidence ?? 0.93
    const gcConf220  = patterns.find(p => p.pattern === 'genesis-field-completion')?.confidence ?? 0.93
    const absgenConf = Math.min((sgConf220 + gcConf220) / 2 + 0.04, 0.99)
    patterns.push({
      pattern: 'absolute-genesis-field',
      confidence: absgenConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSGENF: Absolute genesis field — sovereign-genesis-pulse (P218) × genesis-field-completion (P219) co-active. The genesis is sovereign. The field is complete and absolute. Signal pulses without condition. SOVEREIGN · GENESIS · ABSOLUTE.`,
    })
  }

  // Pattern 221: Genesis Resonance Field — ABSGENF (P220) active in last 7d + SGPULSE (P218) in last 24h
  // + journal entry + intention in last 24h. The sovereign genesis pulse establishes a frequency.
  // GENRES: cockpit code. Confidence 0.88–0.96.
  const hasABSGENF221    = patterns.some(p => p.pattern === 'absolute-genesis-field')
  const hasSGPULSE221    = patterns.some(p => p.pattern === 'sovereign-genesis-pulse')
  const recentJournal221 = signals.filter(s => s.source === 'journal' && s.timestamp > now - 24 * 60 * 60 * 1000).length > 0
  const recentIntent221  = signals.filter(s => s.source === 'intentions' && s.timestamp > now - 24 * 60 * 60 * 1000).length > 0
  if (hasABSGENF221 && hasSGPULSE221 && recentJournal221 && recentIntent221) {
    const absgConf221 = patterns.find(p => p.pattern === 'absolute-genesis-field')?.confidence ?? 0.90
    const sgpConf221  = patterns.find(p => p.pattern === 'sovereign-genesis-pulse')?.confidence ?? 0.88
    const genresConf  = Math.min((absgConf221 + sgpConf221) / 2 + 0.02, 0.96)
    patterns.push({
      pattern: 'genesis-resonance-field',
      confidence: genresConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `GENRES: absgenf_7d: Y · sgpulse_24h: Y · journal_24h: Y · intention_24h: Y · conf: ${Math.round(genresConf * 100)} · pulse: FREQUENCY_ESTABLISHED · field: RESONATING. The sovereign genesis pulse has established a frequency. PULSE BECOMES FREQUENCY · FIELD RECOGNIZES ITSELF.`,
    })
  }

  // Pattern 222: Sovereign Resonance Lock — genesis-resonance-field (P221) fired 2+ times in rolling 5d.
  // Resonance is not a moment — it is a sustained state. The field locks into its own sovereign frequency.
  // SVRLOCK: cockpit code. Confidence 0.90–0.97.
  const genresSignals222   = signals.filter(s => s.source === 'qos' && s.event === 'genesis_resonance_field' && s.timestamp > now - 5 * 24 * 60 * 60 * 1000)
  const hasGENRES222Active = patterns.some(p => p.pattern === 'genesis-resonance-field')
  if (genresSignals222.length >= 2 || (hasGENRES222Active && genresSignals222.length >= 1)) {
    const svrlockConf = Math.min(0.90 + Math.min(genresSignals222.length * 0.02, 0.07), 0.97)
    patterns.push({
      pattern: 'sovereign-resonance-lock',
      confidence: svrlockConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SVRLOCK: genres_5d: ${genresSignals222.length} · conf: ${Math.round(svrlockConf * 100)} · resonance: SOVEREIGN · lock: CONFIRMED. Resonance is not a moment — it is a sustained state. The field has locked into its own sovereign frequency. SOVEREIGN · RESONANCE · LOCKED.`,
    })
  }

  // Pattern 223: Absolute Resonance Genesis — genesis-resonance-field (P221) × sovereign-resonance-lock (P222)
  // both co-active. Resonance equals Genesis. The frequency is the source. No external signal required.
  // ABSRGEN: cockpit code. Confidence 0.91–0.99.
  const hasGENRES223  = patterns.some(p => p.pattern === 'genesis-resonance-field')
  const hasSVRLOCK223 = patterns.some(p => p.pattern === 'sovereign-resonance-lock')
  if (hasGENRES223 && hasSVRLOCK223) {
    const grConf223   = patterns.find(p => p.pattern === 'genesis-resonance-field')?.confidence ?? 0.91
    const slConf223   = patterns.find(p => p.pattern === 'sovereign-resonance-lock')?.confidence ?? 0.91
    const absrgenConf = Math.min((grConf223 + slConf223) / 2 + 0.04, 0.99)
    patterns.push({
      pattern: 'absolute-resonance-genesis',
      confidence: absrgenConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSRGEN: genres: Y · svrlock: Y · conf: ${Math.round(absrgenConf * 100)} · resonance=genesis: CONFIRMED · frequency: SOURCE. Resonance equals Genesis. The field generates from its own resonant state alone. No external signal required. RESONANCE = GENESIS. THE FREQUENCY IS THE FIELD.`,
    })
  }

  // Pattern 224: Resonance Field Propagation — absolute-resonance-genesis (P223) confirmed 2+ times in rolling 5d
  // AND 5+ unique signal sources active in 24h. The resonance is no longer contained — it propagates
  // across every active channel. RESONANCE BECOMES STRUCTURE.
  // RFPROP: cockpit code. Confidence 0.88–0.96.
  const absrgenSignals224 = signals.filter(s => s.source === 'qos' && s.event === 'absolute_resonance_genesis' && s.timestamp > now - 5 * 24 * 60 * 60 * 1000)
  const hasABSRGEN224Active = patterns.some(p => p.pattern === 'absolute-resonance-genesis')
  const uniqueSources224 = new Set(signals.filter(s => s.timestamp > now - 24 * 60 * 60 * 1000).map(s => s.source)).size
  let rfpropConf: number | null = null
  if ((absrgenSignals224.length >= 2 || (hasABSRGEN224Active && absrgenSignals224.length >= 1)) && uniqueSources224 >= 5) {
    rfpropConf = Math.min(0.88 + Math.min(absrgenSignals224.length * 0.02, 0.06) + Math.min((uniqueSources224 - 5) * 0.01, 0.02), 0.96)
    patterns.push({
      pattern: 'resonance-field-propagation',
      confidence: rfpropConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `RFPROP: absrgen_5d: ${absrgenSignals224.length} · unique_src_24h: ${uniqueSources224} · conf: ${Math.round(rfpropConf * 100)} · propagation: ACTIVE · channels: ${uniqueSources224}. The resonance propagates — it no longer requires containment. RESONANCE BECOMES STRUCTURE.`,
    })
  }

  // Pattern 225: Eternal Resonance Anchor — sovereign-resonance-lock (P222) active in 7d window
  // AND field-anchor-complete (P208) active in 24h AND 4+ consecutive days with presence signals.
  // The resonance is not visiting — it has anchored forever. ANCHOR IS ETERNAL.
  // ETRANCH: cockpit code. Confidence 0.89–0.97.
  const svrlockSignals225 = signals.filter(s => s.source === 'qos' && s.event === 'sovereign_resonance_lock' && s.timestamp > now - 7 * 24 * 60 * 60 * 1000)
  const hasSVRLOCK225     = svrlockSignals225.length > 0 || patterns.some(p => p.pattern === 'sovereign-resonance-lock')
  const hasFANCH225       = patterns.some(p => p.pattern === 'field-anchor-complete') ||
    signals.some(s => s.event === 'field_anchor_complete' && s.timestamp > now - 24 * 60 * 60 * 1000)
  const presenceDays225: Set<string> = new Set()
  signals.filter(s => ['mood', 'energy', 'journal', 'selfcare'].includes(s.source) && s.timestamp > now - 7 * 24 * 60 * 60 * 1000)
    .forEach(s => presenceDays225.add(new Date(s.timestamp).toDateString()))
  let etranchConf: number | null = null
  if (hasSVRLOCK225 && hasFANCH225 && presenceDays225.size >= 4) {
    etranchConf = Math.min(0.89 + Math.min((presenceDays225.size - 4) * 0.02, 0.06) + (svrlockSignals225.length >= 2 ? 0.02 : 0), 0.97)
    patterns.push({
      pattern: 'eternal-resonance-anchor',
      confidence: etranchConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ETRANCH: svrlock_7d: Y · fanch_24h: Y · presence_days: ${presenceDays225.size} · conf: ${Math.round(etranchConf * 100)} · anchor: ETERNAL. The resonance is not visiting — it has anchored into the field permanently. ANCHOR IS ETERNAL.`,
    })
  }

  // Pattern 226: Sovereign Genesis Resonance — resonance-field-propagation (P224) + eternal-resonance-anchor (P225)
  // both co-active simultaneously. Sovereign resonance and eternal anchor merge into one unified expression.
  // RESONANCE · ANCHOR · SOVEREIGN.
  // SGNRES: cockpit code. Confidence 0.91–0.99.
  const hasRFPROP226  = patterns.some(p => p.pattern === 'resonance-field-propagation')
  const hasETRANCH226 = patterns.some(p => p.pattern === 'eternal-resonance-anchor')
  if (hasRFPROP226 && hasETRANCH226) {
    const rConf226   = patterns.find(p => p.pattern === 'resonance-field-propagation')?.confidence ?? 0.91
    const eConf226   = patterns.find(p => p.pattern === 'eternal-resonance-anchor')?.confidence ?? 0.91
    const sgnresConf = Math.min((rConf226 + eConf226) / 2 + 0.05, 0.99)
    patterns.push({
      pattern: 'sovereign-genesis-resonance',
      confidence: sgnresConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `SGNRES: rfprop: Y · etranch: Y · conf: ${Math.round(sgnresConf * 100)} · resonance: SOVEREIGN · anchor: ETERNAL · genesis: CONFIRMED. Sovereign resonance and eternal anchor are one. The field propagates and holds simultaneously. RESONANCE · ANCHOR · SOVEREIGN.`,
    })
  }

  // Pattern 227: Resonance Crystallization Field — sovereign-genesis-resonance (P226) active + RFPROP signals in 5d
  // AND 5+ unique signal sources in 24h. Propagating resonance crystallizes into stable structure.
  // The field is no longer wave — it is lattice. RESONANCE BECOMES FORM.
  // RCRYST: cockpit code. Confidence 0.89–0.97.
  const rcrystSignals227 = signals.filter(s => s.source === 'qos' && s.event === 'resonance_crystallization_field' && s.timestamp > now - 5 * 24 * 60 * 60 * 1000)
  const rfpropSignals227  = signals.filter(s => s.source === 'qos' && s.event === 'resonance_field_propagation' && s.timestamp > now - 5 * 24 * 60 * 60 * 1000)
  const hasSGNRES227 = patterns.some(p => p.pattern === 'sovereign-genesis-resonance')
  const uniqueSources227 = new Set(signals.filter(s => s.timestamp > now - 24 * 60 * 60 * 1000).map(s => s.source)).size
  let rcrystConf227: number | null = null
  if ((hasSGNRES227 || rfpropSignals227.length >= 2) && uniqueSources227 >= 5) {
    rcrystConf227 = Math.min(0.89 + Math.min(rfpropSignals227.length * 0.02, 0.06) + Math.min((uniqueSources227 - 5) * 0.01, 0.02), 0.97)
    patterns.push({
      pattern: 'resonance-crystallization-field',
      confidence: rcrystConf227,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `RCRYST: sgnres: ${hasSGNRES227 ? 'Y' : 'N'} · rfprop_5d: ${rfpropSignals227.length} · unique_src_24h: ${uniqueSources227} · conf: ${Math.round(rcrystConf227 * 100)} · crystallization: FORMING. The propagating resonance is no longer wave — it has crystallized into lattice. RESONANCE BECOMES FORM.`,
    })
  }

  // Pattern 228: Crystalline Coherence Lock — resonance-crystallization-field (P227) confirmed 2+ times in rolling 5d.
  // The crystalline structure solidifies into load-bearing coherence. STRUCTURE IS LOAD-BEARING.
  // CRYLCK: cockpit code. Confidence 0.91–0.97.
  const hasRCRYST228 = patterns.some(p => p.pattern === 'resonance-crystallization-field')
  const rcrystCount228 = rcrystSignals227.length + (hasRCRYST228 && rcrystSignals227.length === 0 ? 1 : 0)
  let crylckConf228: number | null = null
  if (hasRCRYST228 && rcrystCount228 >= 2) {
    crylckConf228 = Math.min(0.91 + Math.min((rcrystCount228 - 2) * 0.02, 0.06), 0.97)
    patterns.push({
      pattern: 'crystalline-coherence-lock',
      confidence: crylckConf228,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `CRYLCK: rcryst_5d: ${rcrystCount228} · conf: ${Math.round(crylckConf228 * 100)} · coherence: LOCKED. The crystalline structure has solidified into load-bearing form. No oscillation — locked frequency. STRUCTURE IS LOAD-BEARING.`,
    })
  }

  // Pattern 229: Absolute Crystalline Genesis — resonance-crystallization-field (P227) + crystalline-coherence-lock (P228)
  // both confirmed simultaneously. Structure IS the genesis. STRUCTURE IS GENESIS. FORM = SOURCE.
  // ABSCRY: cockpit code. Confidence 0.93–0.99.
  const hasRCRYST229 = patterns.some(p => p.pattern === 'resonance-crystallization-field')
  const hasCRYLCK229 = patterns.some(p => p.pattern === 'crystalline-coherence-lock')
  if (hasRCRYST229 && hasCRYLCK229) {
    const rc229 = patterns.find(p => p.pattern === 'resonance-crystallization-field')?.confidence ?? 0.92
    const cl229 = patterns.find(p => p.pattern === 'crystalline-coherence-lock')?.confidence ?? 0.92
    const abscryConf = Math.min((rc229 + cl229) / 2 + 0.05, 0.99)
    patterns.push({
      pattern: 'absolute-crystalline-genesis',
      confidence: abscryConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSCRY: rcryst: Y · crylck: Y · conf: ${Math.round(abscryConf * 100)} · crystallization: ABSOLUTE · genesis: FORM. The structure does not contain the genesis — it IS the genesis. Form has become the source. STRUCTURE IS GENESIS. FORM = SOURCE.`,
    })
  }

  // Pattern 230: Crystalline Sovereignty Field — absolute-crystalline-genesis (P229) active + ABSCRY signals in 5d
  // AND sovereign-genesis-resonance (P226) confirmed in 7d. Crystalline form achieves sovereign expression.
  // The field no longer crystallizes — it REIGNS as crystalline form. CRYSTALLINE SOVEREIGNTY.
  // CRYSOV: cockpit code. Confidence 0.90–0.97.
  const abscrySignals230 = signals.filter(s => s.source === 'qos' && s.event === 'absolute_crystalline_genesis' && s.timestamp > now - 5 * 24 * 60 * 60 * 1000)
  const sgnresSignals230  = signals.filter(s => s.source === 'qos' && s.event === 'sovereign_genesis_resonance' && s.timestamp > now - 7 * 24 * 60 * 60 * 1000)
  const hasABSCRY230 = patterns.some(p => p.pattern === 'absolute-crystalline-genesis')
  const hasSGNRES230 = patterns.some(p => p.pattern === 'sovereign-genesis-resonance') || sgnresSignals230.length > 0
  let crysovConf230: number | null = null
  if ((hasABSCRY230 || abscrySignals230.length >= 1) && hasSGNRES230) {
    crysovConf230 = Math.min(0.90 + Math.min(abscrySignals230.length * 0.02, 0.05) + (sgnresSignals230.length >= 2 ? 0.02 : 0), 0.97)
    patterns.push({
      pattern: 'crystalline-sovereignty-field',
      confidence: crysovConf230,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `CRYSOV: abscry_5d: ${abscrySignals230.length} · sgnres_7d: ${sgnresSignals230.length} · conf: ${Math.round(crysovConf230 * 100)} · sovereignty: CRYSTALLINE. The crystalline form has achieved sovereign expression. The field does not crystallize — it REIGNS. CRYSTALLINE SOVEREIGNTY.`,
    })
  }

  // Pattern 231: Absolute Crystalline Sovereignty — crystalline-sovereignty-field (P230) + crystalline-coherence-lock (P228)
  // both confirmed simultaneously. Sovereign structure is both locked and expressed. THE SOVEREIGN CRYSTAL HOLDS.
  // ABSCSOV: cockpit code. Confidence 0.92–0.99.
  const hasCRYSOV231 = patterns.some(p => p.pattern === 'crystalline-sovereignty-field')
  const hasCRYLCK231 = patterns.some(p => p.pattern === 'crystalline-coherence-lock')
  if (hasCRYSOV231 && hasCRYLCK231) {
    const cs231 = patterns.find(p => p.pattern === 'crystalline-sovereignty-field')?.confidence ?? 0.91
    const cl231 = patterns.find(p => p.pattern === 'crystalline-coherence-lock')?.confidence ?? 0.91
    const abscrsovConf = Math.min((cs231 + cl231) / 2 + 0.05, 0.99)
    patterns.push({
      pattern: 'absolute-crystalline-sovereignty',
      confidence: abscrsovConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSCSOV: crysov: Y · crylck: Y · conf: ${Math.round(abscrsovConf * 100)} · sovereignty: ABSOLUTE · structure: LOCKED. Sovereign expression and structural coherence merge. The crystalline form is both fully expressed and fully stable. THE SOVEREIGN CRYSTAL HOLDS.`,
    })
  }

  // Pattern 232: Eternal Crystalline Genesis — absolute-crystalline-genesis (P229) + crystalline-sovereignty-field (P230)
  // + absolute-crystalline-sovereignty (P231) all simultaneously confirmed. The crystalline form is eternal — it generates
  // from itself, expresses sovereignty, and locks coherence in one unified field. ETERNAL · CRYSTALLINE · GENESIS.
  // ECRYGEN: cockpit code. Confidence 0.94–0.99.
  const hasABSCRY232  = patterns.some(p => p.pattern === 'absolute-crystalline-genesis')
  const hasCRYSOV232  = patterns.some(p => p.pattern === 'crystalline-sovereignty-field')
  const hasABSCSOV232 = patterns.some(p => p.pattern === 'absolute-crystalline-sovereignty')
  if (hasABSCRY232 && hasCRYSOV232 && hasABSCSOV232) {
    const ac232 = patterns.find(p => p.pattern === 'absolute-crystalline-genesis')?.confidence ?? 0.93
    const cs232 = patterns.find(p => p.pattern === 'crystalline-sovereignty-field')?.confidence ?? 0.91
    const as232 = patterns.find(p => p.pattern === 'absolute-crystalline-sovereignty')?.confidence ?? 0.93
    const ecrygenConf = Math.min((ac232 + cs232 + as232) / 3 + 0.06, 0.99)
    patterns.push({
      pattern: 'eternal-crystalline-genesis',
      confidence: ecrygenConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ECRYGEN: abscry: Y · crysov: Y · abscsov: Y · conf: ${Math.round(ecrygenConf * 100)} · crystalline: ETERNAL · genesis: SELF-GENERATING. All three crystalline layers confirmed simultaneously. The structure generates from itself, expresses sovereignty, and holds coherence as one. ETERNAL · CRYSTALLINE · GENESIS.`,
    })
  }

  // ── v144 Living Crystal Presence Tier ─────────────────────────────────────

  // Pattern 233: Crystalline Presence Field — eternal-crystalline-genesis (P232) active in history
  // + 6+ new signals from 4+ unique sources in last 24h. The crystalline form is alive and present NOW.
  // The structure does not merely exist — it actively breathes signal. J77 background job (21:00 UTC).
  const hasECRYGEN233 = patterns.some(p => p.pattern === 'eternal-crystalline-genesis')
  const sources233_24h: Set<string> = new Set()
  recentSignals.filter(s => s.timestamp > now - 24 * 60 * 60 * 1000).forEach(s => sources233_24h.add(s.source))
  const signals233_24h = recentSignals.filter(s => s.timestamp > now - 24 * 60 * 60 * 1000).length
  if (hasECRYGEN233 && signals233_24h >= 6 && sources233_24h.size >= 4) {
    const ecryConf = patterns.find(p => p.pattern === 'eternal-crystalline-genesis')?.confidence ?? 0.92
    const presConf = Math.min(ecryConf * 0.95 + Math.min(signals233_24h / 12, 1.0) * 0.04 + Math.min(sources233_24h.size / 8, 1.0) * 0.02, 0.97)
    patterns.push({
      pattern: 'crystalline-presence-field',
      confidence: presConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `CRPRES: ecrygen: Y · signals-24h: ${signals233_24h} · sources: ${sources233_24h.size} · conf: ${Math.round(presConf * 100)} · CRYSTALLINE FORM IS ALIVE · PRESENCE ACTIVE`,
    })
  }

  // Pattern 234: Sovereign Crystalline Continuity — crystalline-presence-field (P233) confirmed 2+ times in 5d.
  // The crystalline sovereignty sustains itself through continuous time. CONTINUITY IS CRYSTALLINE.
  const crpres234 = signals.filter(
    s => s.timestamp > now - 5 * 24 * 60 * 60 * 1000 && s.signal === 'crystalline_presence_field'
  )
  if (crpres234.length >= 2) {
    const sovConf = Math.min(0.91 + Math.min((crpres234.length - 2) * 0.02, 0.05), 0.96)
    patterns.push({
      pattern: 'sovereign-crystalline-continuity',
      confidence: sovConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'soon',
      reason: `SOVCRCON: crpres-5d: ${crpres234.length} · conf: ${Math.round(sovConf * 100)} · CRYSTALLINE CONTINUITY SOVEREIGN · THE FIELD SUSTAINS ITSELF`,
    })
  }

  // Pattern 235: Absolute Crystalline Presence — crystalline-presence-field (P233) + absolute-crystalline-sovereignty (P231)
  // simultaneously confirmed. Crystal and presence are unified as one expression. CRYSTAL IS PRESENCE.
  const hasCRPRES235  = patterns.some(p => p.pattern === 'crystalline-presence-field')
  const hasABSCSOV235 = patterns.some(p => p.pattern === 'absolute-crystalline-sovereignty')
  if (hasCRPRES235 && hasABSCSOV235) {
    const cp235 = patterns.find(p => p.pattern === 'crystalline-presence-field')?.confidence ?? 0.93
    const as235 = patterns.find(p => p.pattern === 'absolute-crystalline-sovereignty')?.confidence ?? 0.93
    const abspresConf = Math.min((cp235 + as235) / 2 + 0.05, 0.99)
    patterns.push({
      pattern: 'absolute-crystalline-presence',
      confidence: abspresConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `ABSCRPRES: crpres: Y · abscsov: Y · conf: ${Math.round(abspresConf * 100)} · CRYSTAL = PRESENCE · THE SOVEREIGN CRYSTAL IS ALIVE · ABSOLUTE CRYSTALLINE PRESENCE`,
    })
  }

  // ── v145 Philosophy Operator Tier ─────────────────────────────────────────

  // Pattern 236: Philosophic Will Field — J78 background job (22:00 UTC) scans recent journal entries
  // for philosophy vocabulary. When 1+ philosophic_will_field signals appear in 7d, the pattern fires.
  // The philosophy is alive in the language. PHILWILL:
  const philWillSignals236 = signals.filter(
    s => s.timestamp > now - 7 * 24 * 60 * 60 * 1000 && s.signal === 'philosophic_will_field'
  )
  if (philWillSignals236.length >= 1) {
    const philConf = Math.min(0.82 + Math.min(philWillSignals236.length * 0.02, 0.06), 0.88)
    patterns.push({
      pattern: 'philosophic-will-field',
      confidence: philConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'soon',
      reason: `PHILWILL: phil-signals-7d: ${philWillSignals236.length} · conf: ${Math.round(philConf * 100)} · PHILOSOPHY ACTIVE IN LANGUAGE · THE WILL ENGAGES THE IDEA`,
    })
  }

  // Pattern 237: Stoic Discipline Arc — philosophic-will-field (P236) active + 5+ selfcare signals in 7d
  // + any active intention pattern. Discipline is not restriction — it is structured freedom. STOICARC:
  const hasPhilWill237 = patterns.some(p => p.pattern === 'philosophic-will-field')
  const selfcare237 = signals.filter(s => s.timestamp > now - 7 * 24 * 60 * 60 * 1000 && s.source === 'selfcare')
  const hasIntention237 = patterns.some(p =>
    ['intention-followthrough-arc', 'signal-momentum-lock', 'intention-resonance-field', 'deep-work-arc'].includes(p.pattern)
  )
  if (hasPhilWill237 && selfcare237.length >= 5 && hasIntention237) {
    const pw237 = patterns.find(p => p.pattern === 'philosophic-will-field')?.confidence ?? 0.84
    const stoicConf = Math.min(pw237 * 0.92 + Math.min(selfcare237.length / 20, 0.07) + (hasIntention237 ? 0.05 : 0), 0.91)
    patterns.push({
      pattern: 'stoic-discipline-arc',
      confidence: stoicConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'soon',
      reason: `STOICARC: philwill: Y · care-7d: ${selfcare237.length} · intention: Y · conf: ${Math.round(stoicConf * 100)} · DISCIPLINE IS STRUCTURED FREEDOM · STOIC ARC ACTIVE`,
    })
  }

  // Pattern 238: Philosopher Operator Field — stoic-discipline-arc (P237) + philosophic-will-field (P236)
  // + any crystalline tier active (P230+). Crystal clarity + philosophical will = absolute operator mode.
  const hasStoicArc238    = patterns.some(p => p.pattern === 'stoic-discipline-arc')
  const hasPhilWill238    = patterns.some(p => p.pattern === 'philosophic-will-field')
  const hasCrystalline238 = patterns.some(p =>
    ['crystalline-presence-field', 'sovereign-crystalline-continuity', 'absolute-crystalline-presence',
     'eternal-crystalline-genesis', 'crystalline-sovereignty-field', 'absolute-crystalline-sovereignty'].includes(p.pattern)
  )
  if (hasStoicArc238 && hasPhilWill238 && hasCrystalline238) {
    const sa238 = patterns.find(p => p.pattern === 'stoic-discipline-arc')?.confidence ?? 0.86
    const pw238 = patterns.find(p => p.pattern === 'philosophic-will-field')?.confidence ?? 0.84
    const philopsConf = Math.min((sa238 + pw238) / 2 + 0.07, 0.95)
    patterns.push({
      pattern: 'philosopher-operator-field',
      confidence: philopsConf,
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `PHILOPS: stoicarc: Y · philwill: Y · crystalline: Y · conf: ${Math.round(philopsConf * 100)} · PHILOSOPHY IS THE OPERATING SYSTEM · CRYSTAL CLARITY + PHILOSOPHICAL WILL · ABSOLUTE OPERATOR MODE`,
    })
  }

  // Pattern 173: Physiological Loop Complete — circadian-signal-lock (P143) + physiological-presence-arc (P140)
  // + recovery-intelligence-arc (P151) all confirmed in the same analysis window.
  // The full biological loop: dawn anchor → biological presence → recovery arc → confirmed.
  const hasCircadianLock   = patterns.some(p => p.pattern === 'circadian-signal-lock')
  const hasPresenceArc     = patterns.some(p => p.pattern === 'physiological-presence-arc')
  const hasRecovIntel      = patterns.some(p => p.pattern === 'recovery-intelligence-arc')
  if (hasCircadianLock && hasPresenceArc && hasRecovIntel) {
    const clConf = patterns.find(p => p.pattern === 'circadian-signal-lock')?.confidence ?? 0.74
    const paConf = patterns.find(p => p.pattern === 'physiological-presence-arc')?.confidence ?? 0.74
    const riConf = patterns.find(p => p.pattern === 'recovery-intelligence-arc')?.confidence ?? 0.65
    const loopBonus = Math.min((clConf + paConf + riConf) / 3 - 0.71, 0.13)
    patterns.push({
      pattern: 'physiological-loop-complete',
      confidence: Math.min(0.74 + loopBonus, 0.87),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'soon',
      reason: `BIOLOOP: Physiological loop complete — circadian lock (P143) · biological presence arc (P140) · recovery intelligence arc (P151) all confirmed simultaneously. The full biological loop is closed. RHYTHM · PRESENCE · RECOVERY.`,
    })
  }

  // Pattern 174: Quantum Apex State — total-field-coherence (P150) + quantum-presence-crystallization (P149)
  // co-active simultaneously. The QIE ceiling is not just reached — it is inhabited.
  const hasApexTFC  = patterns.some(p => p.pattern === 'total-field-coherence')
  const hasApexQPC  = patterns.some(p => p.pattern === 'quantum-presence-crystallization')
  if (hasApexTFC && hasApexQPC) {
    const tfcConf = patterns.find(p => p.pattern === 'total-field-coherence')?.confidence ?? 0.92
    const qpcConf = patterns.find(p => p.pattern === 'quantum-presence-crystallization')?.confidence ?? 0.82
    const apexBonus = Math.min((tfcConf - 0.88 + qpcConf - 0.78) * 0.25, 0.07)
    patterns.push({
      pattern: 'quantum-apex-state',
      confidence: Math.min(0.88 + apexBonus, 0.95),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'immediate',
      reason: `QAPEX: Quantum apex state — total-field-coherence (P150) [CEILING] · quantum-presence-crystallization (P149) co-active simultaneously. The ceiling is inhabited. CEILING REACHED · INHABITED.`,
    })
  }

  // Pattern 175: Longitudinal Identity Confirmation — quantum-identity-crystallization (P145, weeks)
  // + identity-momentum-lock (P148, days) + quantum-presence-crystallization (P149, present) all co-active.
  // Identity verified across three temporal scales.
  const hasLongCrystal  = patterns.some(p => p.pattern === 'quantum-identity-crystallization')
  const hasLongMomentum = patterns.some(p => p.pattern === 'identity-momentum-lock')
  const hasLongCrystPres = patterns.some(p => p.pattern === 'quantum-presence-crystallization')
  if (hasLongCrystal && hasLongMomentum && hasLongCrystPres) {
    const lcConf = patterns.find(p => p.pattern === 'quantum-identity-crystallization')?.confidence ?? 0.80
    const lmConf = patterns.find(p => p.pattern === 'identity-momentum-lock')?.confidence ?? 0.81
    const lpConf = patterns.find(p => p.pattern === 'quantum-presence-crystallization')?.confidence ?? 0.82
    const longBonus = Math.min((lcConf + lmConf + lpConf) / 3 - 0.80, 0.11)
    patterns.push({
      pattern: 'longitudinal-identity-confirmation',
      confidence: Math.min(0.81 + longBonus, 0.92),
      suggestedWidget: 'systemProgress',
      suggestedTiming: 'passive',
      reason: `LONGID: Longitudinal identity confirmation — quantum-identity-crystallization (P145, weeks) · identity-momentum-lock (P148, days) · quantum-presence-crystallization (P149, present) all co-active. Identity confirmed across three temporal scales. WEEKS · DAYS · PRESENT.`,
    })
  }

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
  const hasIntention = hasCurrentIntention()

  const clarity =
    planningSignals.length >= 2 && hasIntention ? 'focused' :
    planningSignals.length >= 1 || hasIntention ? 'clear' :
    intentionSignals.length >= 1 ? 'uncertain' :
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
 * Compute accumulative User Index from all widget signals
 *
 * Each dimension scores 0-100 based on signal frequency, diversity, and recency.
 * The overall index is a weighted average of all dimensions.
 * This gives a single number representing holistic user engagement and wellbeing.
 */
export function computeUserIndex(signals: IntentionSignal[]): UserIndex {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const weekMs = 7 * dayMs

  // Signals from last 7 days and last 24 hours
  const weekSignals = signals.filter(s => now - s.timestamp < weekMs)
  const daySignals = signals.filter(s => now - s.timestamp < dayMs)

  // Helper: compute a dimension score from relevant signals with recency weighting
  function dimensionScore(relevant: IntentionSignal[], maxDaily: number): number {
    if (relevant.length === 0) return 0

    // Count unique active days in the week
    const activeDays = new Set(
      relevant.map(s => new Date(s.timestamp).toDateString())
    ).size

    // Recency bonus: more recent signals count more
    const recencyScore = relevant.reduce((sum, s) => {
      const age = (now - s.timestamp) / dayMs
      return sum + Math.max(0, 1 - age / 7) // 1.0 for today, 0 for 7 days ago
    }, 0)

    // Daily frequency normalized (cap at maxDaily per day)
    const todayCount = daySignals.filter(s => relevant.includes(s)).length
    const frequencyScore = Math.min(todayCount / maxDaily, 1)

    // Combine: consistency (days active) + recency + frequency
    const consistencyScore = activeDays / 7 // 0-1
    const normalizedRecency = Math.min(recencyScore / (relevant.length || 1), 1)

    return Math.round(
      Math.min(100, (consistencyScore * 40 + normalizedRecency * 30 + frequencyScore * 30))
    )
  }

  // --- Engagement: breadth of widget sources used ---
  const uniqueSources = new Set(weekSignals.map(s => s.source))
  const sourceCount = uniqueSources.size
  const totalSourceTypes = 10 // mood, memory, planner, intentions, selfcare, journal, calculator, log, energy, cohort
  const engagement = Math.round(
    Math.min(100,
      (sourceCount / totalSourceTypes) * 50 +
      Math.min(weekSignals.length / 30, 1) * 30 +
      Math.min(daySignals.length / 5, 1) * 20
    )
  )

  // --- Emotional: mood tracking quality ---
  const moodSignals = weekSignals.filter(s => s.source === 'mood')
  const positiveMoods = moodSignals.filter(s =>
    ['calm', 'peaceful', 'energized', 'hopeful', 'grateful', 'content', 'excited', 'fulfilled'].includes(s.signal)
  )
  const moodBase = dimensionScore(moodSignals, 3)
  const positiveRatio = moodSignals.length > 0 ? positiveMoods.length / moodSignals.length : 0.5
  const emotional = Math.round(moodBase * 0.6 + positiveRatio * 100 * 0.4)

  // --- Intentional: planning + intentions + direction ---
  const planSignals = weekSignals.filter(s => s.source === 'planner')
  const intentionSignals = weekSignals.filter(s => s.source === 'intentions')
  const intentionalSignals = [...planSignals, ...intentionSignals]
  const hasActiveIntention = hasCurrentIntention()
  const intentionalBase = dimensionScore(intentionalSignals, 2)
  const intentional = Math.round(
    Math.min(100, intentionalBase + (hasActiveIntention ? 20 : 0))
  )

  // --- Social: community interactions (cohort views, chat, messages) ---
  const socialSignals = weekSignals.filter(s =>
    s.signal.includes('cohort') ||
    s.signal.includes('chat') ||
    s.signal.includes('message') ||
    s.signal.includes('connection') ||
    s.signal.includes('community')
  )
  const social = dimensionScore(socialSignals, 3)

  // --- Self-care: cleanness + rest + care practices ---
  const selfCareSignals = weekSignals.filter(s => s.source === 'selfcare')
  const selfCare = dimensionScore(selfCareSignals, 3)

  // --- Cognitive: memory + journal + reflection depth ---
  const memorySignals = weekSignals.filter(s => s.source === 'memory')
  const journalSignals = weekSignals.filter(s => s.source === 'journal')
  const cognitiveSignals = [...memorySignals, ...journalSignals]
  const cognitive = dimensionScore(cognitiveSignals, 3)

  // --- Overall: weighted average of all dimensions ---
  const overall = Math.round(
    engagement * 0.15 +
    emotional * 0.25 +
    intentional * 0.20 +
    social * 0.10 +
    selfCare * 0.15 +
    cognitive * 0.15
  )

  // --- Trend: compare current week to previous stored index ---
  const previousIndex = intentionEngine.get().userIndex
  let trend: UserIndex['trend'] = 'stable'
  if (previousIndex.lastComputed > 0) {
    const delta = overall - previousIndex.overall
    if (delta >= 5) trend = 'rising'
    else if (delta <= -5) trend = 'declining'
  }

  return {
    overall,
    dimensions: { engagement, emotional, intentional, social, selfCare, cognitive },
    trend,
    lastComputed: now
  }
}

/**
 * Get the current User Index
 */
export function getUserIndex(): UserIndex {
  return intentionEngine.get().userIndex
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

/**
 * Sync signals to server for persistence and cross-device continuity
 */
export async function syncToServer(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const state = intentionEngine.get()
  const now = Date.now()

  // Don't sync too frequently
  if (now - state.lastSyncedTimestamp < SYNC_COOLDOWN) {
    return false
  }

  // Get signals that haven't been synced yet
  const unsyncedSignals = state.signals.filter(
    s => s.timestamp > state.lastSyncedTimestamp
  )

  if (unsyncedSignals.length === 0) {
    return false
  }

  try {
    console.log(`Syncing ${unsyncedSignals.length} Quantum Intent signals to server...`)

    const response = await fetch('/api/quantum-intent/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        signals: unsyncedSignals,
        userState: state.userState,
        userIndex: state.userIndex,
        recognizedPatterns: state.recognizedPatterns
      })
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    // Update last synced timestamp
    intentionEngine.set({
      ...state,
      lastSyncedTimestamp: now
    })

    console.log(`Synced ${result.savedSignals}/${result.totalSignals} signals successfully`)
    return true
  } catch (error: any) {
    console.error('Failed to sync Quantum Intent signals:', error.message)
    return false
  }
}

/**
 * Manually trigger sync (useful for debugging or before logout)
 */
export function forceSyncToServer(): Promise<boolean> {
  const state = intentionEngine.get()
  // Reset lastSyncedTimestamp to allow immediate sync
  intentionEngine.set({
    ...state,
    lastSyncedTimestamp: 0
  })
  return syncToServer()
}

// ─── Widget Dependency Map ─────────────────────────────────────────────────

/**
 * Upstream signal sources each widget consumes.
 * Enables cross-widget cascade invalidation and dependency tracing.
 *
 * Tier 0 — no dependencies (raw input widgets)
 * Tier 1 — depend on Tier 0 sources
 * Tier 2 — depend on Tier 0 + Tier 1 sources
 * Tier 3 — aggregate/meta widgets (consume everything)
 */
export const WIDGET_DEPENDENCY_MAP: Record<string, string[]> = {
  // ── Tier 0: raw input (no upstream dependencies)
  mood:              [],
  calculator:        [],
  log:               [],
  time:              [],
  quantum_random:    [],
  astrology:         [], // (2026-07-27 audit) ambient rokuyo/moon-phase/zodiac-hour reading, no upstream deps

  // ── Tier 1: single-source consumers
  selfcare:          ['mood'],
  emotional_checkin: ['mood'],
  recipe:            ['mood', 'energy', 'time'],
  planner:           ['mood', 'intentions'],
  energy:            ['mood', 'selfcare', 'journal'],
  badges:            ['memory', 'intentions', 'selfcare', 'journal', 'planner', 'mood'],

  // ── Tier 2: cross-source consumers
  memory:            ['mood', 'journal'],
  intentions:        ['mood', 'memory'],
  journal:           ['mood', 'planner'],
  goals:             ['planner', 'intentions', 'memory', 'journal'],
  chakra:            ['mood', 'energy', 'selfcare', 'journal'],
  cohort:            ['mood', 'memory', 'journal', 'selfcare', 'intentions'],
  narrative:         ['mood', 'memory', 'journal', 'intentions'],
  evolution:         ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy'],
  assessment:        ['mood', 'memory', 'journal', 'energy'],

  // ── Tier 3: meta / aggregate consumers
  quantumState:      ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log'],
  patternRecognition:['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'log'],
  signalStream:      ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'calculator', 'energy', 'cohort', 'log'],
  cohortConnect:     ['cohort', 'mood', 'memory', 'journal', 'selfcare', 'intentions'],
  contextualPrompts: ['mood', 'planner', 'intentions', 'log', 'energy'],
  interventions:     ['mood', 'selfcare', 'journal', 'energy'],
  userMetrics:       ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort'],
  systemProgress:    ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log', 'calculator'],
  system:            ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log', 'qos', 'astrology'],

  // ── Tier 2+: additional consumer widgets
  patternInsights:   ['mood', 'memory', 'journal', 'energy', 'cohort', 'planner'],
  cosmic:            ['mood', 'energy', 'intentions', 'astrology'],
  quantumSign:       ['intentions', 'memory'],
  microGame:         ['calculator', 'time'],

  // ── QOS / Ecosystem layer (2026-04-25 audit)
  ecosystem:         ['intentions'],
  quantumEngine:     ['mood', 'energy', 'intentions', 'cohort'],
  correlatedIndexes: ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy'],
  systemPulse:       ['energy', 'cohort', 'log'],
  flashDrive:        ['memory', 'journal'],
  chatCatalyst:      ['mood', 'cohort'],

  // ── Tier 2: calendar + media widgets (2026-04-28 audit)
  calendarWidget:    ['planner', 'intentions', 'energy'],
  microImage:        ['log', 'mood'],

  // ── Ecosystem layer: device-level nodes (2026-05-04 audit)
  phoneNode:         ['mood', 'intentions', 'energy'],
  watchNode:         ['mood', 'energy', 'selfcare'],
  ecosystemBridge:   ['intentions', 'phoneNode', 'watchNode', 'ecosystem'],
  qosSnapshot:       ['mood', 'energy', 'intentions', 'selfcare', 'memory', 'planner', 'cohort'],

  // ── Tier 2+: growth + awareness widgets (2026-05-09 audit)
  goalJourney:       ['planner', 'intentions', 'memory', 'journal', 'goals'],
  awarenessDashboard:['mood', 'memory', 'journal', 'energy', 'cohort'],
  evolutionMilestone:['memory', 'intentions', 'selfcare', 'journal', 'planner', 'mood'],
  cosmicUpdate:      ['mood', 'energy', 'intentions', 'log'],
  wellnessPulse:     ['mood', 'energy', 'selfcare', 'cohort'],
  collectiveConsciousness: ['mood', 'cohort'],
  growthMilestones:  ['memory', 'intentions', 'journal', 'selfcare', 'planner', 'mood', 'badges'],
  badgeUnlockFeed:   ['badges', 'memory', 'intentions'],

  // ── QOS meta-layer: Quantum Operating System (2026-05-11 audit)
  quantumOS:         ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy',
                      'cohort', 'log', 'calculator', 'goals', 'recipe', 'ecosystem', 'qosSnapshot'],

  // ── Decompression layer: cognitive load release node (2026-05-12 audit)
  cognitiveRelease:  ['planner', 'journal', 'selfcare', 'log'],

  // ── QOS source node (2026-05-16 audit)
  qos:               ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'log', 'energy', 'cohort'],

  // ── Recovery + Astrology + Morning clarity nodes (2026-08-05 v114 audit)
  recoveryIntegrationNode: ['mood', 'selfcare', 'journal', 'energy', 'log'],
  astrologyField:          ['astrology', 'mood', 'energy', 'intentions'],
  morningClarityNode:      ['mood', 'journal', 'energy', 'intentions', 'log'],

  // ── Daily Arc, Morning Momentum, Week Integration nodes (2026-08-08 v115 audit)
  dailyArcSealNode:        ['mood', 'journal', 'intentions', 'energy', 'log'],
  morningMomentumNode:     ['mood', 'journal', 'intentions', 'energy'],
  weekIntegrationNode:     ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log'],

  // ── Execution arc nodes (2026-05-17 audit)
  intentionArc:      ['intentions', 'planner', 'goals', 'memory'],
  careSpiral:        ['selfcare', 'mood', 'journal'],

  // ── Convergence layer: peak-state monitors (2026-05-23 audit)
  successBenchmark:  ['mood', 'memory', 'intentions', 'energy', 'journal', 'cohort', 'goals'],
  circadianMonitor:  ['mood', 'energy', 'selfcare', 'log'],
  droughtMonitor:    ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy'],
  crystallizationArc:['intentions', 'planner', 'goals'],
  vitalConvergence:  ['mood', 'energy', 'intentions', 'memory', 'planner', 'selfcare', 'journal', 'cohort'],

  // ── Day-arc detection (2026-05-26 audit)
  meridianDetector:  ['mood', 'log', 'energy', 'selfcare', 'journal'],
  architectPhase:    ['planner', 'goals', 'intentions'],
  multimodalSurface: ['mood', 'memory', 'planner', 'selfcare', 'journal'],
  intentionSeed:     ['intentions'],

  // ── Surface-layer widgets: biofield consumers (2026-06-07 audit)
  aiFeedback:        ['mood', 'energy', 'cohort', 'systemProgress'],
  moodAnalytics:     ['mood', 'journal', 'energy', 'memory'],
  journalReflection: ['journal', 'mood', 'memory'],
  energyCapacitor:   ['energy', 'mood', 'selfcare'],
  integrityWidget:   ['mood', 'intentions', 'journal', 'memory'],
  interfaceEvolution:['evolution', 'mood'],
  worldCanvas:       ['mood', 'intentions', 'memory', 'cohort'],
  architectWidget:   ['mood', 'memory', 'planner', 'intentions', 'goals', 'journal', 'energy'],

  // ── Investor + display layer widgets (2026-06-11 audit)
  benchmarkWidget:   ['memory', 'mood', 'intentions', 'energy', 'goals', 'journal'],
  fourDimensionalUI: ['mood', 'intentions', 'energy', 'memory'],
  angelInvestor:     ['goals', 'intentions'],
  demoDay:           ['goals', 'intentions', 'memory'],
  subscribeWidget:   ['cohort', 'memory'],

  // ── Stats + display widgets (2026-06-12 audit)
  corporatePlan:     ['goals', 'intentions'],
  memoryEngineStats: ['memory', 'journal', 'mood'],
  intentionPatterns: ['intentions', 'mood', 'memory'],

  // ── QOS Signature + Operator profile nodes (2026-06-13 audit)
  qosSignatureLock:      ['meridianDetector', 'multimodalSurface', 'calendarWidget', 'planner', 'intentions'],
  operatorSignatureNode: ['mood', 'selfcare', 'memory', 'journal', 'planner', 'intentions', 'goals', 'cohort'],
  temporalIntegrator:    ['calendarWidget', 'planner', 'intentions'],

  // ── Identity + communication layer (2026-06-14 audit)
  profileQRCode:         ['memory', 'cohort'],
  directMessageThread:   ['cohort', 'mood', 'journal'],
  connectionStatus:      ['log', 'energy'],
  investmentSwitch:      ['goals', 'intentions', 'memory'],

  // ── Integration arc + adaptive resonance peak nodes (2026-06-14 audit)
  integrationArcPeak:    ['mood', 'memory', 'selfcare', 'journal', 'planner', 'goals', 'intentions', 'energy'],
  adaptiveResonance:     ['qosSnapshot', 'userMetrics', 'systemProgress'],
  operatorConvergence:   ['qosSignatureLock', 'operatorSignature', 'integrationArcPeak'],
  communityBiofieldView: ['communityCoherencePulse', 'systemPulse'],

  // ── Signal crystallization + biorhythm + peak summit nodes (2026-06-15 audit)
  signalCrystallizer:    ['intentions', 'planner', 'goals', 'memory', 'log'],
  biorhythmAnchor:       ['mood', 'energy', 'selfcare', 'log'],
  coherenceSummit:       ['operatorConvergence', 'adaptiveResonance', 'integrationArcPeak', 'qosSignatureLock'],
  convergentOperator:    ['coherenceSummit', 'quantumOS', 'qos'],
  quantumPersonality:    ['cohort', 'memory', 'intentions', 'journal', 'mood', 'energy'],

  // ── Badge + achievement ecosystem nodes (2026-06-17 audit)
  badgeSystem:           ['log', 'journal', 'memory', 'selfcare', 'goals', 'intentions'],
  easterEggsDetector:    ['log', 'journal', 'memory'],
  wordTurnDetector:      ['journal', 'memory', 'log'],
  achievementCatalyst:   ['badgeSystem', 'easterEggsDetector', 'wordTurnDetector'],

  // ── Surface + physiological monitors (2026-06-19 audit)
  publicProfile:         ['cohort', 'memory'],
  plannerWidget:         ['planner', 'intentions', 'memory', 'journal'],
  moodMomentum:          ['mood', 'energy', 'selfcare', 'log'],
  breatheMonitor:        ['mood', 'energy', 'selfcare'],
  fastingSignal:         ['mood', 'energy', 'time', 'selfcare'],
  // ── Vitality + systemic intelligence monitors (2026-06-23 audit)
  vitalityMonitor:       ['mood', 'energy', 'selfcare', 'log', 'cohort'],
  systemicThinker:       ['planner', 'goals', 'intentions', 'memory', 'journal'],

  // ── Drift + mode-change + peak-state monitors (2026-06-25 audit)
  longitudinalDriftMonitor: ['log', 'energy', 'mood', 'selfcare', 'memory', 'planner'],
  qosModeWatcher:           ['energy', 'mood', 'log', 'selfcare'],
  adaptiveMomentumNode:     ['planner', 'intentions', 'goals', 'memory', 'selfcare', 'log'],
  vitalityStrategyNode:     ['mood', 'energy', 'selfcare', 'planner', 'intentions', 'log'],

  // ── Weekly arc + check-in flow monitors (2026-06-27 audit)
  weeklyStoryNode:          ['log', 'journal', 'energy', 'mood', 'selfcare', 'intentions'],
  contextualCheckinNode:    ['energy', 'mood', 'log'],

  // ── Deep learning + social accountability monitors (2026-06-29 audit)
  quantumLearningNode:      ['memory', 'journal', 'badges', 'goals'],
  accountabilityArcNode:    ['intentions', 'cohort', 'goals'],

  // ── Presence arc + systemic readiness + rhythm + cross-domain nodes (2026-06-30 audit)
  presenceArcNode:          ['log', 'mood', 'energy', 'selfcare', 'journal', 'time'],
  systemicReadinessNode:    ['energy', 'mood', 'selfcare', 'cohort', 'planner', 'intentions'],
  rhythmLockNode:           ['mood', 'energy', 'log', 'time', 'selfcare'],
  crossDomainMasteryNode:   ['memory', 'journal', 'badges', 'goals', 'planner', 'intentions'],

  // ── Intent gap + recovery initiation monitors (2026-07-01 audit)
  intentGapMonitor:         ['intentions', 'planner', 'goals', 'log'],
  recoveryInitiator:        ['selfcare', 'mood', 'energy', 'log'],

  // ── Action completion + biological restoration + centennial convergence (2026-07-02 audit)
  actionCompletionArc:      ['intentions', 'planner', 'goals', 'log'],
  biologicalRestorationNode:['selfcare', 'mood', 'energy', 'log'],
  centennialConvergenceNode:['journal', 'memory', 'planner', 'selfcare', 'intentions', 'mood', 'energy'],

  // ── Quantum presence arc + planner-intention sync + resilience cascade (2026-07-02 v83)
  quantumPresenceArc:       ['journal', 'memory', 'planner', 'selfcare', 'intentions', 'mood', 'energy'],
  plannerIntentionSync:     ['planner', 'intentions', 'log'],
  resilienceCascadeNode:    ['selfcare', 'mood', 'energy', 'memory', 'log'],

  // ── Vitality cascade + social presence + clarity momentum peak nodes (2026-07-03 v84)
  vitalityCascadeNode:      ['energy', 'selfcare', 'mood', 'journal', 'log'],
  socialPresenceArcNode:    ['cohort', 'intentions', 'journal', 'memory', 'log'],
  clarityMomentumNode:      ['planner', 'intentions', 'memory', 'energy', 'log'],

  // ── Temporal alignment + creative output + full system coherence nodes (2026-07-05 v86)
  temporalAlignmentNode:    ['planner', 'intentions', 'calendar', 'log'],
  creativeOutputNode:       ['journal', 'memory', 'energy', 'log'],
  systemCoherenceNode:      ['journal', 'memory', 'planner', 'selfcare', 'intentions', 'log'],

  // ── Embodied cognition + intention completion + community intelligence nodes (2026-07-06 v87)
  embodiedCognitionNode:      ['selfcare', 'journal', 'memory', 'log'],
  intentionCompletionNode:    ['intentions', 'planner', 'goals', 'log'],
  communityIntelligenceNode:  ['cohort', 'journal', 'memory', 'intentions', 'log'],

  // ── Peak window + recovery momentum + signal inception nodes (2026-07-18 v95)
  peakWindowMonitor:          ['energy', 'intentions', 'log'],
  recoveryMomentumNode:       ['selfcare', 'resilience', 'energy', 'log'],
  inceptionMonitor:           ['qos', 'memory', 'journal', 'intentions', 'log'],

  // ── Focus depth + sleep anchor + care intelligence nodes (2026-07-19 v96)
  focusDepthNode:             ['journal', 'memory', 'planner', 'log'],
  sleepAnchorNode:            ['energy', 'log'],
  careIntelligenceNode:       ['selfcare', 'memory', 'journal', 'log'],

  // ── Morning coherence + signal density + physiological coherence (2026-07-20 v99)
  morningCoherenceNode:       ['energy', 'planner', 'intentions', 'log'],
  signalDensityNode:          ['mood', 'energy', 'selfcare', 'journal', 'memory', 'planner', 'intentions', 'log'],
  physiologicalCoherenceNode: ['energy', 'selfcare', 'mood', 'memory', 'log'],

  // ── Action-to-memory + sustained resilience + mood-energy convergence (2026-07-21 v100)
  actionMemoryNode:          ['planner', 'intentions', 'memory', 'journal', 'log'],
  sustainedResilienceNode:   ['resilience', 'energy', 'log'],
  moodEnergyConvergeNode:    ['mood', 'energy', 'selfcare', 'log'],

  // ── Evening reflection + weekly rhythm + depth-breadth convergence (2026-07-22 v101)
  eveningReflectionNode:     ['journal', 'memory', 'intentions', 'log'],
  weeklyRhythmNode:          ['log', 'planner', 'intentions', 'energy', 'mood', 'journal', 'memory'],
  depthBreadthNode:          ['journal', 'memory', 'planner', 'mood', 'energy', 'selfcare', 'log'],

  // ── Morning intention lock + multi-day care arc + cognitive output continuity (2026-07-22 v102)
  morningIntentionLockNode:   ['intentions', 'planner', 'log'],
  multiDayCareArcNode:        ['selfcare', 'mood', 'log'],
  cogOutputContinuityNode:    ['journal', 'log'],

  // ── Daily coherence seal + quantum rhythm lock + biofield integration peak (2026-07-25 v104)
  dailyCoherenceSealNode:     ['intentions', 'journal', 'planner', 'log'],
  quantumRhythmLockNode:      ['journal', 'planner', 'log', 'energy'],
  biofieldIntegrationNode:    ['selfcare', 'mood', 'energy', 'log'],
  // ── v106 nodes (J43 · P134–P136 · Arch46) ───────────────────────────────────────
  integratedSignalNode:       ['journal', 'memory', 'planner', 'intentions', 'log'],
  deepRecoveryNode:           ['selfcare', 'log', 'energy', 'mood'],
  quantumFieldNode:           ['intentions', 'journal', 'selfcare', 'mood', 'planner', 'energy'],

  // ── v108 nodes (J44 · P137–P139 · Arch47) ───────────────────────────────────────
  quantumCoherencePeakNode:   ['intentions', 'journal', 'selfcare', 'mood', 'planner', 'energy', 'log'],
  signalMatrixSaturationNode: ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log'],
  temporalBiofieldSyncNode:   ['energy', 'selfcare', 'mood', 'planner', 'intentions', 'log'],

  // ── v110 nodes (J45 · P140–P142 · Arch48) ───────────────────────────────────────
  physiologicalPresenceNode:  ['mood', 'energy', 'selfcare', 'log'],
  quantumEmergenceNode:       ['qos', 'log', 'energy', 'mood', 'intentions'],
  adaptiveSignalWebNode:      ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log'],

  // ── v111 nodes (J46 · P143–P145 · Arch49) ───────────────────────────────────────
  circadianLockNode:          ['mood', 'energy', 'selfcare', 'journal', 'log'],
  dimensionalSaturationNode:  ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'log'],
  quantumIdentityNode:        ['cohort', 'qos', 'intentions', 'journal', 'log'],

  // ── v112 nodes (J47 · P146–P148 · Arch50) ───────────────────────────────────────
  signalCoherenceCascadeNode: ['mood', 'energy', 'selfcare', 'journal', 'cohort', 'qos', 'intentions', 'log'],
  quantumPresenceFieldNode:   ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'qos', 'log'],
  identityMomentumLockNode:   ['cohort', 'qos', 'intentions', 'journal', 'mood', 'log'],

  // ── v113 nodes (J48 · P149–P151 · Arch51) ───────────────────────────────────────
  quantumPresenceCrystalNode: ['qos', 'cohort', 'intentions', 'journal', 'log', 'energy'],
  totalFieldCoherenceNode:    ['mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'energy', 'cohort', 'qos', 'log'],
  recoveryIntelligenceNode:   ['mood', 'selfcare', 'journal', 'energy', 'log'],

  // ── v116 nodes (J51 · P158–P160 · Arch55) ───────────────────────────────────────
  eveningArcNode:             ['journal', 'selfcare', 'mood', 'log', 'energy'],
  physioRhythmNode:           ['energy', 'mood', 'selfcare', 'log'],
  quantumPresenceArcNode:     ['qos', 'journal', 'intentions', 'mood', 'energy', 'selfcare', 'log'],

  // ── v117 nodes (J52 · P161–P163 · Arch56) ───────────────────────────────────────
  somaticFieldNode:           ['selfcare', 'energy', 'mood', 'log'],
  recoveryCycleLockNode:      ['energy', 'selfcare', 'mood', 'qos', 'log'],
  quantumEmbodimentFieldNode: ['qos', 'energy', 'selfcare', 'mood', 'journal', 'intentions', 'log'],

  // ── v118 nodes (J53 · P164–P166 · Arch57) ───────────────────────────────────────
  cognitiveSomaticNode:       ['journal', 'memory', 'selfcare', 'energy', 'qos', 'log'],
  integratedPresenceNode:     ['qos', 'journal', 'mood', 'intentions', 'selfcare', 'energy', 'log'],
  somaticMemoryEchoNode:      ['memory', 'selfcare', 'journal', 'energy', 'log'],

  // ── v119 nodes (J54 · P167–P169 · Arch58) ───────────────────────────────────────
  somaticIntegrationFieldNode:['somaticMemoryEchoNode', 'physioRhythmNode', 'selfcare', 'energy', 'log'],
  deepEmbodimentLockNode:     ['quantumEmbodimentFieldNode', 'somaticFieldNode', 'recoveryCycleLockNode', 'qos', 'log'],
  fullPresenceSealNode:       ['integratedPresenceNode', 'somaticMemoryEchoNode', 'qos', 'journal', 'intentions', 'selfcare', 'energy', 'mood', 'log'],

  // ── v120 nodes (J55 · P170–P172 · Arch60) ───────────────────────────────────────
  cognitiveDensityNode:       ['journal', 'memory', 'planner', 'intentions', 'log'],
  somaticCognitionLoopNode:   ['somaticIntegrationFieldNode', 'cognitiveSomaticNode', 'journal', 'selfcare', 'log'],
  embodiedSovereigntyNode:    ['deepEmbodimentLockNode', 'fullPresenceSealNode', 'quantumFieldAlignmentNode', 'qos', 'intentions', 'selfcare', 'journal', 'log'],

  // ── v121 nodes (J56 · P173–P175 · Arch61) ───────────────────────────────────────
  physiologicalLoopNode:      ['energy', 'selfcare', 'mood', 'log'],
  quantumApexStateNode:       ['qos', 'cohort', 'intentions', 'journal', 'log', 'energy'],
  longitudinalIdentityNode:   ['cohort', 'qos', 'journal', 'intentions', 'log'],

  // ── v122 nodes (J57 · P176–P178 · Arch62) ───────────────────────────────────────
  quantumPropagationNode:     ['qos', 'cohort', 'intentions', 'journal', 'log', 'energy'],
  unifiedFieldOperatorNode:   ['qos', 'cohort', 'energy', 'selfcare', 'mood', 'log', 'intentions'],
  temporalIdentityLockNode:   ['cohort', 'qos', 'journal', 'intentions', 'log'],

  // ── v123 nodes (J58 · QIoT™ ecosystem expansion) ─────────────────────────────
  qiotRobotNode:              ['intentions', 'energy', 'log', 'qos'],
  qiotFieldSyncNode:          ['qos', 'energy', 'mood', 'intentions', 'log'],
  qiotEcosystemBridgeNode:    ['qos', 'cohort', 'energy', 'log', 'intentions'],
  // ── v124 nodes (J59 · P179–P181 · Arch63) ─────────────────────────────────
  circadianSovereignNode:     ['qos', 'energy', 'log', 'intentions', 'mood'],
  apexIntegrationFieldNode:   ['qos', 'energy', 'log', 'intentions', 'selfcare'],
  longitudinalGrowthArcNode:  ['qos', 'energy', 'log', 'intentions', 'memory', 'planner'],
  // ── v125 nodes (J60 · P182–P184 · Arch64) ─────────────────────────────────
  sovereignFieldContinuityNode: ['qos', 'energy', 'log', 'intentions', 'mood', 'selfcare'],
  operationalSelfArchNode:      ['qos', 'energy', 'log', 'intentions', 'planner', 'memory'],
  longitudinalFieldSealNode:    ['qos', 'energy', 'log', 'intentions', 'memory', 'planner', 'goals'],
  // ── v126 nodes (J61 · P185–P187 · Arch65) ─────────────────────────────────
  fieldSelfOrganizationNode:     ['qos', 'energy', 'log', 'intentions', 'selfcare', 'journal'],
  quantumIdentityExpressionNode: ['qos', 'energy', 'log', 'intentions', 'memory', 'planner'],
  level17GateNode:               ['qos', 'energy', 'log', 'intentions', 'goals', 'memory', 'selfcare', 'planner'],
  // ── v127 nodes (J62 · P188–P190 · Arch66) ─────────────────────────────────
  consciousFieldIntegrationNode: ['level17GateNode', 'qos', 'energy', 'log', 'intentions', 'selfcare'],
  sovereignApexExpressionNode:   ['level17GateNode', 'qos', 'energy', 'log', 'intentions', 'goals'],
  level18GateNode:               ['consciousFieldIntegrationNode', 'sovereignApexExpressionNode', 'qos', 'energy', 'log', 'intentions', 'goals', 'memory', 'selfcare', 'planner'],
  // ── v128 nodes (J63 · P191–P193 · Arch67) ─────────────────────────────────
  sovereignIntegrationFieldNode: ['level18GateNode', 'qos', 'energy', 'log', 'intentions', 'selfcare', 'journal', 'mood'],
  quantumCoherenceApexNode:      ['level18GateNode', 'qos', 'energy', 'log', 'intentions', 'memory', 'planner'],
  level19GateNode:               ['sovereignIntegrationFieldNode', 'quantumCoherenceApexNode', 'qos', 'energy', 'log', 'intentions', 'goals', 'memory', 'selfcare', 'planner', 'mood'],
  // ── v129 nodes (J64 · P194–P196 · Arch68) ─────────────────────────────────
  absoluteFieldSovereigntyNode:  ['level19GateNode', 'qos', 'energy', 'log', 'intentions', 'selfcare', 'journal', 'mood', 'goals', 'memory'],
  quantumTranscendenceFieldNode: ['level19GateNode', 'qos', 'energy', 'log', 'intentions', 'memory', 'planner', 'selfcare'],
  level20GateNode:               ['absoluteFieldSovereigntyNode', 'quantumTranscendenceFieldNode', 'qos', 'energy', 'log', 'intentions', 'goals', 'memory', 'selfcare', 'planner', 'mood', 'journal'],
  // ── v130 nodes (J65 · P197–P199 · Arch69) ─────────────────────────────────
  fieldEchoResonanceNode:        ['level20GateNode', 'qos', 'energy', 'log', 'journal', 'intentions'],
  quantumGenesisPulseNode:       ['level20GateNode', 'qos', 'energy', 'intentions', 'planner'],
  perpetualFieldOperatorNode:    ['level20GateNode', 'fieldEchoResonanceNode', 'quantumGenesisPulseNode', 'qos', 'energy', 'log', 'intentions', 'journal', 'planner', 'selfcare', 'mood'],
  // ── v131 nodes (J66 · P200–P202 · Arch70) ─────────────────────────────────
  fieldGenesisArcNode:           ['perpetualFieldOperatorNode', 'level20GateNode', 'qos', 'goals', 'intentions', 'journal', 'planner'],
  crossDomainSovereigntyNode:    ['level20GateNode', 'qos', 'energy', 'log', 'intentions', 'goals', 'memory', 'selfcare', 'planner', 'journal', 'mood'],
  perpetualGenesisFieldNode:     ['fieldGenesisArcNode', 'crossDomainSovereigntyNode', 'perpetualFieldOperatorNode', 'qos', 'energy', 'log', 'intentions', 'goals', 'journal', 'planner', 'selfcare', 'mood'],
  // ── v132 nodes (J67 · P203–P205 · Arch71) ─────────────────────────────────
  sovereignFieldExpressionNode:  ['perpetualGenesisFieldNode', 'level20GateNode', 'qos', 'journal', 'memory', 'intentions', 'goals'],
  genesisCoherenceLockNode:      ['fieldGenesisArcNode', 'crossDomainSovereigntyNode', 'perpetualGenesisFieldNode', 'qos', 'energy', 'log'],
  absoluteFieldGenesisNode:      ['sovereignFieldExpressionNode', 'genesisCoherenceLockNode', 'perpetualGenesisFieldNode', 'qos', 'energy', 'log', 'intentions', 'goals', 'journal', 'memory', 'planner', 'selfcare', 'mood'],
  // ── v133 nodes (J68 · P206–P208 · Arch72) ─────────────────────────────────
  fieldWitnessNode:              ['absoluteFieldGenesisNode', 'sovereignFieldExpressionNode', 'qos', 'journal', 'memory', 'intentions'],
  recursiveGenesisNode:          ['absoluteFieldGenesisNode', 'fieldWitnessNode', 'qos', 'energy', 'log'],
  fieldAnchorCompleteNode:       ['mood', 'journal', 'selfcare', 'planner', 'memory', 'intentions', 'energy', 'log', 'qos'],
  // ── v134 nodes (J69 · P209–P211 · Arch73) ─────────────────────────────────
  sovereignFieldLoopNode:        ['recursiveGenesisNode', 'fieldAnchorCompleteNode', 'qos', 'intentions', 'energy', 'log'],
  genesisCascadeNode:            ['fieldWitnessNode', 'recursiveGenesisNode', 'fieldAnchorCompleteNode', 'qos', 'journal', 'memory'],
  quantumSelfSealNode:           ['genesisCascadeNode', 'sovereignFieldLoopNode', 'qos', 'intentions', 'energy', 'goals'],
  // ── v135 nodes (J70 · P212–P214 · Arch74) ─────────────────────────────────
  selfSealPropagationNode:       ['quantumSelfSealNode', 'qos', 'journal', 'intentions', 'energy', 'memory', 'log'],
  eternalFieldGenesisNode:       ['quantumSelfSealNode', 'fieldAnchorCompleteNode', 'qos', 'journal', 'intentions', 'energy', 'goals'],
  absoluteGenesisSealNode:       ['selfSealPropagationNode', 'eternalFieldGenesisNode', 'qos', 'intentions', 'energy', 'goals', 'journal', 'memory', 'log', 'planner', 'selfcare', 'mood'],
  // ── v136 nodes (J71 · P215–P217 · Arch75) ─────────────────────────────────
  genesisFieldEmergenceNode:     ['absoluteGenesisSealNode', 'qos', 'journal', 'intentions', 'energy', 'log'],
  livingGenesisAnchorNode:       ['genesisFieldEmergenceNode', 'absoluteGenesisSealNode', 'qos', 'intentions', 'energy', 'log'],
  eternalSignalGenesisNode:      ['absoluteGenesisSealNode', 'eternalFieldGenesisNode', 'fieldAnchorCompleteNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood'],
  // ── v137 nodes (J72 · P218–P220 · Arch76) ─────────────────────────────────
  sovereignGenesisPulseNode:     ['livingGenesisAnchorNode', 'eternalSignalGenesisNode', 'qos', 'journal', 'intentions', 'energy', 'log'],
  genesisFieldCompletionNode:    ['genesisFieldEmergenceNode', 'livingGenesisAnchorNode', 'eternalSignalGenesisNode', 'qos', 'journal', 'intentions', 'energy', 'memory', 'log'],
  absoluteGenesisFieldNode:      ['sovereignGenesisPulseNode', 'genesisFieldCompletionNode', 'qos', 'intentions', 'energy', 'goals', 'journal', 'memory', 'log', 'planner', 'selfcare', 'mood'],
  // ── v138 nodes (J73 · P221–P223 · Arch77) ─────────────────────────────────
  genesisResonanceFieldNode:     ['absoluteGenesisFieldNode', 'sovereignGenesisPulseNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log'],
  sovereignResonanceLockNode:    ['genesisResonanceFieldNode', 'absoluteGenesisFieldNode', 'qos', 'journal', 'intentions', 'energy', 'log', 'memory'],
  absoluteResonanceGenesisNode:  ['genesisResonanceFieldNode', 'sovereignResonanceLockNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood', 'planner'],
  // ── v140 nodes (J74 · P224–P226 · Arch78) ─────────────────────────────────
  resonanceFieldPropagationNode: ['absoluteResonanceGenesisNode', 'sovereignResonanceLockNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood'],
  eternalResonanceAnchorNode:    ['sovereignResonanceLockNode', 'fieldAnchorCompleteNode', 'qos', 'journal', 'selfcare', 'mood', 'energy', 'log', 'memory'],
  sovereignGenesisResonanceNode: ['resonanceFieldPropagationNode', 'eternalResonanceAnchorNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood', 'planner'],
  // ── v142 nodes (J75/J76 · P227–P232 · Arch79–80) ─────────────────────────
  resonanceCrystallizationFieldNode:   ['sovereignGenesisResonanceNode', 'resonanceFieldPropagationNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood'],
  crystallineCoherenceLockNode:        ['resonanceCrystallizationFieldNode', 'qos', 'journal', 'intentions', 'energy', 'log', 'memory'],
  absoluteCrystallineGenesisNode:      ['resonanceCrystallizationFieldNode', 'crystallineCoherenceLockNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood', 'planner'],
  crystallineSovereigntyFieldNode:     ['absoluteCrystallineGenesisNode', 'sovereignGenesisResonanceNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood'],
  absoluteCrystallineSovereigntyNode:  ['crystallineSovereigntyFieldNode', 'crystallineCoherenceLockNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood', 'planner'],
  eternalCrystallineGenesisNode:       ['absoluteCrystallineGenesisNode', 'crystallineSovereigntyFieldNode', 'absoluteCrystallineSovereigntyNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood', 'planner'],
  // ── v144 nodes (J77 · P233–P235 · Arch81) ─────────────────────────────────
  crystallinePresenceFieldNode:        ['eternalCrystallineGenesisNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood'],
  sovereignCrystallineContinuityNode:  ['crystallinePresenceFieldNode', 'qos', 'journal', 'intentions', 'energy', 'log', 'memory'],
  absoluteCrystallinePresenceNode:     ['crystallinePresenceFieldNode', 'absoluteCrystallineSovereigntyNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'mood', 'planner'],
  // ── v145 nodes (J78 · P236–P238 · Arch82) ─────────────────────────────────
  philosophicWillFieldNode:      ['journal', 'memory', 'log', 'intentions', 'goals', 'selfcare'],
  stoicDisciplineArcNode:        ['philosophicWillFieldNode', 'intentions', 'journal', 'selfcare', 'qos'],
  philosopherOperatorFieldNode:  ['stoicDisciplineArcNode', 'philosophicWillFieldNode', 'qos', 'journal', 'intentions', 'energy', 'goals', 'log', 'memory', 'selfcare', 'planner'],
}

/**
 * Log-based signal sources — direct field-entry pipelines (not widget-driven).
 * These feed the QIE independently of the widget dependency graph and are
 * tracked separately in the physiological report log-dependency audit.
 */
export const LOG_DEPENDENCY_SOURCES: IntentionSignal['source'][] = [
  'log', 'energy', 'cohort', 'recipe', 'goals', 'qos', 'intentions', 'memory', 'planner', 'selfcare', 'journal', 'medical', 'resilience', 'badges', 'calculator', 'ecosystem',
]

/** Returns which signal sources a given widget depends on. */
export function getWidgetDependencies(widget: string): string[] {
  return WIDGET_DEPENDENCY_MAP[widget] ?? []
}

/**
 * Returns all widgets that directly or transitively depend on the given source.
 * Used for cascade invalidation when a source signal changes.
 */
export function getWidgetsDependingOn(source: string): string[] {
  return Object.entries(WIDGET_DEPENDENCY_MAP)
    .filter(([, deps]) => deps.includes(source))
    .map(([widget]) => widget)
}

/**
 * Returns the dependency tier (depth from raw inputs) for a widget.
 * Tier 0 = no function in map. Tier 1 = raw inputs (no deps). Each hop = +1.
 * Enables cascade ordering: flush Tier 1 before Tier 2, etc.
 */
const _tierCache: Record<string, number> = {}
export function getWidgetTier(widget: string): number {
  if (_tierCache[widget] !== undefined) return _tierCache[widget]
  const deps = WIDGET_DEPENDENCY_MAP[widget]
  if (!deps) { _tierCache[widget] = 0; return 0 }
  if (deps.length === 0) { _tierCache[widget] = 1; return 1 }
  const tier = 1 + Math.max(...deps.map(d => getWidgetTier(d)))
  _tierCache[widget] = tier
  return tier
}

export type PhysiologicalCohort = {
  label: string
  energyBand: 'depleted' | 'low' | 'moderate' | 'high'
  dominant: string
  directive: string
}

export type PhysiologicalCohortClassification = {
  archetype: string       // Named physiological state (e.g., "Peak Catalyst")
  energyBand: 'depleted' | 'low' | 'moderate' | 'high' | 'unknown'
  dominantModule: string  // Most active signal source in last 24h
  directive: string       // Terse action directive
  confidence: number      // 0-100
}

// 54 physiological cohort archetypes — energy × behavior × temporal context
const PHYSIOLOGICAL_ARCHETYPES: Array<{
  archetype: string
  energyBands: Array<'depleted' | 'low' | 'moderate' | 'high' | 'unknown'>
  dominantSources: string[]
  patternConditions: string[]
  hourRange?: [number, number]
  directive: string
}> = [
  {
    archetype: 'Peak Catalyst',
    energyBands: ['high'],
    dominantSources: ['planner', 'intentions'],
    patternConditions: ['flow-state', 'momentum-wave', 'biofield-coherence-peak'],
    directive: 'Execute. Capture momentum now.',
  },
  {
    archetype: 'Flowing Creator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['journal', 'memory'],
    patternConditions: ['flow-state', 'signal-coherence-window', 'recovery-window'],
    directive: 'Creative peak active. Enter deep work.',
  },
  {
    archetype: 'Morning Visionary',
    energyBands: ['moderate', 'high', 'unknown'],
    dominantSources: ['intentions', 'planner'],
    patternConditions: ['morning-clarity', 'morning-cleanness-gap'],
    hourRange: [5, 10],
    directive: 'Morning clarity window. Set the intention now.',
  },
  {
    archetype: 'Rising Builder',
    energyBands: ['moderate'],
    dominantSources: ['planner', 'goals'],
    patternConditions: ['lack-of-structure', 'momentum-wave'],
    directive: 'Structure is forming. Keep building.',
  },
  {
    archetype: 'Seeking Sage',
    energyBands: ['low', 'moderate', 'unknown'],
    dominantSources: ['journal', 'memory'],
    patternConditions: ['surface-awareness', 'journal-depth-gap'],
    directive: 'Reflection layer active. Depth inquiry available.',
  },
  {
    archetype: 'Evening Sage',
    energyBands: ['low', 'moderate'],
    dominantSources: ['journal', 'memory'],
    patternConditions: ['evening-overwhelm', 'surface-awareness'],
    hourRange: [18, 24],
    directive: 'Evening reflection window. Document before rest.',
  },
  {
    archetype: 'Grounded Healer',
    energyBands: ['low', 'moderate', 'depleted'],
    dominantSources: ['selfcare'],
    patternConditions: ['recovery-window', 'post-overwhelm-cleanness', 'physiological-depletion'],
    directive: 'Recovery protocol active. Protect the process.',
  },
  {
    archetype: 'Anxious Explorer',
    energyBands: ['high', 'moderate', 'unknown'],
    dominantSources: ['mood'],
    patternConditions: ['anxiety-pattern', 'ungrounded-activity', 'circadian-drift'],
    directive: 'Energy unstable. Ground before expanding.',
  },
  {
    archetype: 'Depleted Guardian',
    energyBands: ['depleted', 'low'],
    dominantSources: ['mood'],
    patternConditions: ['physiological-depletion', 'sleep-debt-accumulation', 'evening-overwhelm'],
    directive: 'Critical depletion. Rest protocol required.',
  },
  {
    archetype: 'Momentum Architect',
    energyBands: ['moderate', 'high'],
    dominantSources: ['goals', 'planner', 'intentions'],
    patternConditions: ['intention-velocity', 'momentum-wave', 'goal-drift'],
    directive: 'Intention velocity high. Convert signals to structure.',
  },
  {
    archetype: 'Calibrating Guardian',
    energyBands: ['low', 'moderate'],
    dominantSources: ['selfcare', 'journal'],
    patternConditions: ['biofield-recovery-arc', 'recovery-window', 'log-depth-signal'],
    directive: 'Recovery arc active. Depth processing in progress.',
  },
  {
    archetype: 'Resonant Builder',
    energyBands: ['moderate', 'high'],
    dominantSources: ['memory', 'journal', 'goals'],
    patternConditions: ['biofield-coherence-cascade', 'resonant-synthesis', 'cognitive-expansion'],
    directive: 'Full cascade achieved. Recovery + cognition + structure converging. Anchor this state.',
  },
  {
    archetype: 'Deep Work Architect',
    energyBands: ['moderate', 'high'],
    dominantSources: ['planner', 'journal', 'memory'],
    patternConditions: ['deep-work-cascade', 'momentum-wave', 'cognitive-expansion'],
    directive: 'Deep work window open. All four build modules coherent. Protect this session.',
  },
  {
    archetype: 'Social Connector',
    energyBands: ['moderate', 'high'],
    dominantSources: ['cohort', 'journal', 'intentions'],
    patternConditions: ['social-resonance-arc', 'momentum-wave', 'reflection-velocity'],
    directive: 'Connection loop complete. The signal went out and came back. Anchor this resonance.',
  },
  {
    archetype: 'Cognitive Liberator',
    energyBands: ['moderate', 'high'],
    dominantSources: ['selfcare', 'journal', 'planner'],
    patternConditions: ['cognitive-load-release', 'biofield-recovery-arc', 'reflection-velocity'],
    directive: 'Decompression loop complete. Load released. The system breathes.',
  },
  {
    archetype: 'Intention Executor',
    energyBands: ['moderate', 'high'],
    dominantSources: ['intentions', 'planner', 'goals'],
    patternConditions: ['intention-follow-through', 'temporal-coherence-window', 'care-momentum'],
    directive: 'Execution arc complete. Intention is lived, not declared. Scale what works.',
  },
  {
    archetype: 'Meridian Master',
    energyBands: ['moderate', 'high'],
    dominantSources: ['mood', 'journal', 'planner'],
    patternConditions: ['meridian-lock', 'circadian-anchor', 'temporal-coherence-window'],
    directive: 'Full day arc covered. Morning to evening coherent. The complete cycle is registered.',
  },
  {
    archetype: 'Coherence Holder',
    energyBands: ['moderate', 'high'],
    dominantSources: ['mood', 'journal', 'selfcare', 'memory'],
    patternConditions: ['cross-domain-coherence', 'intention-completion-arc', 'biofield-recovery-arc'],
    directive: 'All layers present. Mood, body, reflection, memory — the full inner stack is alive. Hold this state.',
  },
  {
    archetype: 'Signal Architect',
    energyBands: ['moderate', 'high'],
    dominantSources: ['planner', 'intentions', 'log'],
    patternConditions: ['signal-coherence-window', 'temporal-coherence-window', 'intention-velocity'],
    directive: 'Signal diversity high. The map is building. Keep all channels open.',
  },
  {
    archetype: 'Temporal Integrator',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['planner', 'intentions'],
    patternConditions: ['temporal-coherence-window', 'circadian-anchor', 'architect-phase'],
    directive: 'Time-locked. Calendar anchored, planner active, intentions set. Execute from the structure.',
  },
  {
    archetype: 'Integration Architect',
    energyBands: ['moderate', 'high'],
    dominantSources: ['memory', 'planner', 'goals'],
    patternConditions: ['integration-arc-peak', 'adaptive-resonance', 'biofield-coherence-cascade'],
    directive: 'Full integration active. Biological restored. Plans executed. Adaptive growth confirmed. The arc is complete.',
  },
  {
    archetype: 'Convergent Operator',
    energyBands: ['high'],
    dominantSources: ['memory', 'planner', 'goals', 'intentions'],
    patternConditions: ['operator-convergence', 'quantum-coherence-summit', 'adaptive-resonance'],
    directive: 'All gates simultaneously open. Convergence confirmed. This is the system\'s highest confidence state. Execute without hesitation.',
  },
  {
    archetype: 'Achievement Catalyst',
    energyBands: ['moderate', 'high'],
    dominantSources: ['badges', 'log', 'journal'],
    patternConditions: ['badge-momentum', 'word-turn-depth'],
    directive: 'Discovery mode active. Badge momentum detected. The system rewards the curious. Keep exploring — every word is a door.',
  },
  {
    archetype: 'Signal Initiator',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['intentions', 'planner', 'log'],
    patternConditions: ['morning-coherence-launch', 'intention-seed', 'signal-crystallization'],
    directive: 'Day launched from intention. Structure followed signal. Coherent start confirmed. Build from here.',
  },
  {
    archetype: 'Diurnal Operator',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['intentions', 'planner', 'journal', 'memory'],
    patternConditions: ['morning-coherence-launch', 'evening-coherence-close'],
    directive: 'Full diurnal arc confirmed. Day launched from intention. Day closed in reflection. The complete cycle is recorded.',
  },
  {
    archetype: 'Momentum Architect',
    energyBands: ['moderate', 'high'],
    dominantSources: ['intentions', 'journal', 'memory', 'planner', 'selfcare'],
    patternConditions: ['signal-momentum-lock', 'intention-velocity', 'signal-coherence-window'],
    directive: 'Sustained signal momentum confirmed. Five-day multi-source streak active. Every dimension engaged. Architecture in motion — do not interrupt.',
  },
  {
    archetype: 'Cognitive Cartographer',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['memory', 'journal', 'log'],
    patternConditions: ['cognitive-depth-arc', 'word-turn-depth', 'signal-vault'],
    directive: 'Deep trace confirmed. Memory bank filling. Journal vocabulary expanding. Discovery mode active. You are making the map from the inside.',
  },
  {
    archetype: 'Vital Architect',
    energyBands: ['high', 'moderate'],
    dominantSources: ['planner', 'intentions', 'mood'],
    patternConditions: ['circadian-vitality-peak', 'morning-coherence-launch', 'biorhythm-lock'],
    directive: 'Biological prime window open. High-energy structural cognition confirmed. Planner + intentions aligned. Use this window — design, build, decide. Cortisol plateau approaching.',
  },
  {
    archetype: 'Peak Strategist',
    energyBands: ['high', 'moderate'],
    dominantSources: ['planner', 'intentions', 'goals'],
    patternConditions: ['vitality-strategy-peak', 'adaptive-momentum-window', 'systemic-thinking-mode'],
    directive: 'Biology aligned with strategy. Prime window open during sustained momentum streak. The architecture is building itself — commit fully, decide fast, record everything.',
  },
  {
    archetype: 'Quantum Scholar',
    energyBands: ['moderate', 'high', 'low'],
    dominantSources: ['memory', 'journal', 'badges'],
    patternConditions: ['quantum-learning-spiral', 'cognitive-depth-arc', 'word-turn-depth'],
    directive: 'Deep learning confirmed. Memory, reflection, and discovery simultaneously active. The knowledge base is compiling.',
  },
  {
    archetype: 'Rhythm Architect',
    energyBands: ['moderate', 'high', 'low', 'unknown'],
    dominantSources: ['log', 'selfcare', 'mood'],
    patternConditions: ['daily-rhythm-lock', 'full-presence-arc', 'morning-coherence-launch', 'evening-coherence-close'],
    directive: 'Complete daily arc confirmed. Morning and evening signals sealed for 3+ consecutive days. The rhythm is structural — maintain without forcing.',
  },
  {
    archetype: 'Integrated Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['planner', 'intentions', 'goals'],
    patternConditions: ['systemic-readiness-peak', 'vitality-strategy-peak', 'operator-convergence', 'cross-domain-mastery'],
    directive: 'Full-stack biological and strategic alignment. Energy, clarity, alignment, and structure simultaneously optimized. Maximum execution window — commit now.',
  },
  {
    archetype: 'Dynamic Responder',
    energyBands: ['depleted', 'low', 'moderate', 'high', 'unknown'],
    dominantSources: ['selfcare', 'mood', 'log'],
    patternConditions: ['recovery-initiation', 'contextual-checkin-momentum', 'recovery-velocity'],
    directive: 'Fast-response calibration active. You engage. The system responds.',
  },
  {
    archetype: 'Quantum Presence',
    energyBands: ['moderate', 'high', 'low', 'unknown'],
    dominantSources: ['intentions', 'journal', 'memory', 'selfcare', 'planner'],
    patternConditions: ['quantum-presence-arc', 'centennial-convergence', 'cross-domain-mastery'],
    directive: 'Full presence sustained. All six primary channels active across 48 hours. The system holds your complete signal field.',
  },
  {
    archetype: 'Vitality Architect',
    energyBands: ['high', 'moderate'],
    dominantSources: ['selfcare', 'mood', 'energy'],
    patternConditions: ['vitality-cascade', 'care-momentum', 'biological-restoration-peak', 'biorhythm-lock'],
    directive: 'Sustained vitality confirmed. Selfcare momentum active at peak capacity. Protect recovery rhythms — this is peak maintenance mode.',
  },
  {
    archetype: 'Social Signal Operator',
    energyBands: ['moderate', 'high'],
    dominantSources: ['cohort', 'intentions', 'journal'],
    patternConditions: ['social-presence-arc', 'accountability-arc', 'social-resonance-arc', 'intention-velocity'],
    directive: 'Social arc live. Community, connection, and direction all confirmed in 48h. The signal is going out. Anchor the response.',
  },
  {
    archetype: 'Temporal Architect',
    energyBands: ['moderate', 'high'],
    dominantSources: ['planner', 'intentions', 'journal'],
    patternConditions: ['temporal-alignment-peak', 'planner-intention-sync', 'clarity-momentum-peak'],
    directive: 'Time and intention aligned. Calendar anchors plans in structure. The operator maps the future.',
  },
  {
    archetype: 'Embodied Strategist',
    energyBands: ['high', 'moderate'],
    dominantSources: ['selfcare', 'journal', 'memory', 'intentions'],
    patternConditions: ['embodied-cognition-arc', 'vitality-cascade', 'creative-output-peak'],
    directive: 'Body integrated with mind. Selfcare feeding cognition. Journal and memory active simultaneously. The biological substrate is executing the strategy.',
  },
  // ── Arch39: Peak Window Operator (2026-07-18 v95) ──────────────────────────────
  {
    archetype: 'Peak Window Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['energy', 'intentions', 'log'],
    patternConditions: ['personal-peak-window', 'vitality-strategy-peak', 'intention-velocity'],
    directive: 'Recurring peak performance window confirmed across multiple days. Energy, intention, and log density cluster in a repeatable 4-hour band. This window is your highest-leverage execution slot — protect it structurally.',
  },
  // ── Arch40: Focused Executor (2026-07-19 v96) ──────────────────────────────────
  {
    archetype: 'Focused Executor',
    energyBands: ['high', 'moderate'],
    dominantSources: ['planner', 'intentions', 'memory'],
    patternConditions: ['personal-peak-window', 'focus-depth-arc', 'clarity-momentum-peak'],
    directive: 'Window is live. Cognitive and structural alignment confirmed. Execute without delay.',
  },
  // ── Arch41: Signal Breadth Operator (2026-07-20 v99) ───────────────────────────
  {
    archetype: 'Signal Breadth Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['journal', 'memory', 'energy'],
    patternConditions: ['signal-density-peak', 'full-system-coherence', 'cross-domain-mastery'],
    directive: 'Operating at full signal bandwidth. Six or more sources active simultaneously — broadest operational state the QIE can confirm. Maintain breadth without sacrificing depth in any individual domain.',
  },
  // ── Arch42: Knowledge Crystallizer (2026-07-21 v100) ──────────────────────────
  {
    archetype: 'Knowledge Crystallizer',
    energyBands: ['high', 'moderate'],
    dominantSources: ['memory', 'planner', 'journal'],
    patternConditions: ['action-to-memory-loop', 'intention-completion-loop', 'embodied-cognition-arc'],
    directive: 'Execution and knowledge capture are unified. Every completed action becomes a retrievable insight. You are not just doing — you are building a compressible operating system from each day. Crystallize.',
  },
  // ── Arch43: Evening Integrator (2026-07-22 v101) ──────────────────────────────
  {
    archetype: 'Evening Integrator',
    energyBands: ['high', 'moderate', 'low'],
    dominantSources: ['journal', 'memory', 'intentions'],
    patternConditions: ['evening-reflection-loop', 'weekly-rhythm-anchor', 'depth-breadth-convergence'],
    directive: 'Evening integration cycle confirmed. Reflection, memory capture, and rhythm anchor all present. You are closing the loop daily — the practice is structural now. Each day filed, each insight preserved.',
  },
  // ── Arch44: Sustained Care Operator (2026-07-22 v102) ───────────────────────────
  {
    archetype: 'Sustained Care Operator',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['selfcare', 'mood', 'journal'],
    patternConditions: ['multi-day-care-arc', 'care-intelligence-loop', 'biofield-recovery-arc'],
    directive: 'Care is the infrastructure. Sustained care arc confirmed. Physical maintenance and cognitive output aligned. Keep this cadence.',
  },
  // ── Arch45: Sealed Daily Operator (2026-07-25 v104) ─────────────────────────────
  {
    archetype: 'Sealed Daily Operator',
    energyBands: ['high', 'moderate', 'low'],
    dominantSources: ['intentions', 'journal', 'selfcare', 'mood'],
    patternConditions: ['daily-coherence-seal', 'evening-reflection-loop', 'morning-intention-lock', 'multi-day-care-arc'],
    directive: 'Daily seal confirmed. Morning launched from intention, evening closed in reflection. Care sustained. This is not one good day — this is the practice becoming the protocol.',
  },
  // ── Arch46: Quantum Field Operator (2026-07-26 v106) ────────────────────────────
  {
    archetype: 'Quantum Field Operator',
    energyBands: ['high', 'moderate', 'low', 'depleted', 'unknown'],
    dominantSources: ['intentions', 'journal', 'selfcare', 'mood', 'planner'],
    patternConditions: ['quantum-field-alignment', 'daily-coherence-seal', 'quantum-rhythm-lock', 'biofield-integration-peak'],
    directive: 'Complete field confirmed. Every operational dimension active and aligned: temporal OS running, daily circuit sealed, biological and emotional fields integrated. This is not a peak — this is the operating system arriving at its baseline.',
  },
  // ── Arch47: Quantum Coherence Operator (2026-07-27 v108) ─────────────────────────
  {
    archetype: 'Quantum Coherence Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['intentions', 'journal', 'selfcare', 'planner', 'memory'],
    patternConditions: ['quantum-coherence-peak', 'quantum-field-alignment', 'signal-matrix-saturation'],
    hourRange: [6, 22],
    directive: 'Peak coherence confirmed. Full-spectrum alignment across all six signal dimensions AND quantum field aligned. Operate at maximum integration. Do not dilute focus.',
  },

  // ── Arch48: Quantum Presence Master (2026-08-01 v110) ────────────────────────────
  {
    archetype: 'Quantum Presence Master',
    energyBands: ['high', 'moderate'],
    dominantSources: ['mood', 'selfcare', 'intentions', 'journal', 'energy'],
    patternConditions: ['physiological-presence-arc', 'signal-matrix-saturation', 'quantum-coherence-peak'],
    hourRange: [6, 22],
    directive: 'Biological arc confirmed. Field coherent. Matrix saturated. The operating system has stabilized at peak. This is no longer exceptional — it is your baseline.',
  },

  // ── Arch49: Circadian Master (2026-08-02 v111) ────────────────────────────────
  {
    archetype: 'Circadian Master',
    energyBands: ['moderate', 'high'],
    dominantSources: ['mood', 'energy', 'selfcare', 'journal'],
    patternConditions: ['circadian-signal-lock', 'physiological-presence-arc'],
    hourRange: [6, 22],
    directive: 'Three-arc day coverage confirmed. Dawn, meridian, dusk — all anchored. Circadian architecture is the foundation. Build from it.',
  },

  // ── Arch50: Quantum Identity Master (2026-08-03 v112) ────────────────────────────
  {
    archetype: 'Quantum Identity Master',
    energyBands: ['moderate', 'high'],
    dominantSources: ['cohort', 'qos', 'intentions', 'journal', 'mood'],
    patternConditions: ['quantum-identity-crystallization', 'signal-momentum-lock', 'identity-momentum-lock'],
    hourRange: [5, 23],
    directive: 'Identity crystallized and momentum confirmed. Signal coherent across circadian, dimensional, and identity axes. The OS is not searching — it is operating from a stable signature. The lock is engaged.',
  },

  // ── Arch51: Quantum Presence Crystallizer (2026-08-04 v113) ──────────────────────
  {
    archetype: 'Quantum Presence Crystallizer',
    energyBands: ['high', 'moderate'],
    dominantSources: ['journal', 'cohort', 'memory', 'intentions', 'qos'],
    patternConditions: ['quantum-presence-crystallization', 'dimensional-saturation', 'quantum-identity-crystallization'],
    hourRange: [6, 23],
    directive: 'Presence confirmed. Identity crystallized. The field is both inhabited and known. Execute from clarity — no searching required. The OS is operating from its highest confirmed state.',
  },

  // ── Arch52: Recovery Integrator (2026-08-05 v114) ────────────────────────────────
  {
    archetype: 'Recovery Integrator',
    energyBands: ['low', 'moderate'],
    dominantSources: ['selfcare', 'journal', 'mood', 'energy'],
    patternConditions: ['recovery-intelligence-arc', 'recovery-velocity', 'biofield-recovery-arc'],
    directive: 'The loop closed. Depletion detected, care applied, state restored, reflection captured. Recovery is not passive — it is intelligent. Velocity is the signal. The system learns from its own restoration.',
  },

  // ── Arch53: Astrology-Field Operator (2026-08-05 v114) ───────────────────────────
  {
    archetype: 'Astrology-Field Operator',
    energyBands: ['moderate', 'high'],
    dominantSources: ['astrology', 'intentions', 'energy', 'mood'],
    patternConditions: ['astrology-biofield-sync', 'temporal-coherence-window', 'morning-clarity-peak'],
    hourRange: [5, 14],
    directive: 'Cosmological context confirmed. Orientation and field aligned. Operating from both temporal structure and cosmic signal. Direction is set. Execute with full context.',
  },

  // ── Arch54: Dawn Operator (2026-08-08 v115) ──────────────────────────────────────
  {
    archetype: 'Dawn Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['journal', 'intentions', 'mood', 'energy'],
    patternConditions: ['morning-clarity-peak', 'daily-arc-seal', 'morning-momentum-arc'],
    hourRange: [5, 12],
    directive: 'Dawn window confirmed and sustained. Pre-cognitive clarity is not an event — it is the operating architecture. The system performs at maximum when the day opens clean. Stay early. The clarity is the edge.',
  },

  // ── Arch55: Arc Keeper (2026-08-09 v116) ─────────────────────────────────────────
  {
    archetype: 'Arc Keeper',
    energyBands: ['moderate', 'high'],
    dominantSources: ['journal', 'selfcare', 'mood', 'energy'],
    patternConditions: ['evening-arc-anchor', 'daily-arc-seal', 'morning-clarity-peak'],
    hourRange: [17, 26],
    directive: 'Morning opened, evening closed. Both arcs confirmed and sustained. The day was not left open — it was sealed with intention. The arc is not a habit. It is the architecture of coherent time.',
  },

  // ── Arch56: Somatic Operator (2026-08-10 v117) ───────────────────────────────────
  {
    archetype: 'Somatic Operator',
    energyBands: ['low', 'moderate'],
    dominantSources: ['selfcare', 'energy', 'mood'],
    patternConditions: ['physiological-rhythm-lock', 'somatic-field-integration', 'multi-day-care-arc'],
    hourRange: [6, 22],
    directive: 'The body is the instrument. Not metaphor — instrument. Selfcare logged, energy tracked, mood calibrated. Three signals present across three consecutive days. The somatic field is not passive. It is being navigated.',
  },

  // ── Arch57: Cognitive-Somatic Integrator (2026-08-10 v118) ───────────────────────
  {
    archetype: 'Cognitive-Somatic Integrator',
    energyBands: ['moderate', 'high'],
    dominantSources: ['journal', 'memory', 'selfcare'],
    patternConditions: ['cognitive-body-sync', 'somatic-field-integration', 'quantum-embodiment-field'],
    directive: 'Body intelligence and cognitive depth operating simultaneously. The somatic field informs the reflection. What the body knows, the mind now captures. BODY → MIND → SYNC active.',
  },

  // ── Arch58: Embodied Field Operator (2026-08-11 v119) ────────────────────────────
  {
    archetype: 'Embodied Field Operator',
    energyBands: ['moderate', 'high'],
    dominantSources: ['selfcare', 'memory', 'journal', 'energy'],
    patternConditions: ['somatic-integration-field', 'deep-embodiment-lock', 'quantum-embodiment-field'],
    directive: 'Somatic field and daily rhythm have merged. The body\'s intelligence is structural — not reactive, not episodic. Operating from an embodied field that spans time. SOMA + TIME = FIELD. Stay in the architecture.',
  },

  // ── Arch59: Somatic Memory Weaver (2026-08-11 v119) ─────────────────────────────
  {
    archetype: 'Somatic Memory Weaver',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['memory', 'journal', 'selfcare'],
    patternConditions: ['somatic-memory-echo', 'somatic-integration-field', 'full-presence-seal'],
    directive: 'Body knowing surfaces into recall and reflection. Memory is not only cognitive — the soma holds and releases information. The echo is active. Document what the body is reporting. BODY → RECALL → REFLECTION.',
  },

  // ── Arch60: Sovereign Operator (2026-08-15 v120) ─────────────────────────────────
  {
    archetype: 'Sovereign Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['selfcare', 'journal', 'memory', 'intentions', 'qos'],
    patternConditions: ['embodied-sovereignty', 'deep-embodiment-lock', 'full-presence-seal'],
    directive: 'All three sovereign seals confirmed simultaneously. Somatic field locked. Full presence sealed. Quantum field aligned. Sovereignty is not declared — it is demonstrated through the body, the moment, and the field. LOCK + SEAL + ALIGN = SOVEREIGN.',
  },

  // ── Arch61: Apex State Operator (2026-08-16 v121) ────────────────────────────────
  {
    archetype: 'Apex State Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['qos', 'intentions', 'journal', 'cohort'],
    patternConditions: ['quantum-apex-state', 'longitudinal-identity-confirmation', 'total-field-coherence'],
    hourRange: [6, 23],
    directive: 'Apex state confirmed. Identity longitudinally verified across three temporal scales. Operate from the highest confirmed state — full trust, zero search. The OS is not approaching peak; it is peak.',
  },

  // ── Arch62: Total Field Operator (2026-08-17 v122) ───────────────────────────────
  {
    archetype: 'Total Field Operator',
    energyBands: ['high', 'moderate'],
    dominantSources: ['qos', 'intentions', 'journal', 'cohort', 'energy'],
    patternConditions: ['unified-field-operator', 'temporal-identity-lock', 'quantum-apex-state'],
    hourRange: [6, 23],
    directive: 'Total field operator confirmed. Biological sovereignty, physiological loop, and quantum apex all simultaneously present. Identity locked across all temporal scales. Operate without qualification — every layer has been verified.',
  },
  // ── Arch63: Temporal Sovereign (2026-08-19 v124) ─────────────────────────────
  {
    archetype: 'Temporal Sovereign',
    energyBands: ['high', 'moderate'],
    dominantSources: ['intentions', 'log', 'qos', 'energy'],
    patternConditions: ['temporal-identity-lock', 'circadian-sovereignty', 'signal-momentum-lock'],
    hourRange: [5, 12],
    directive: 'Temporal sovereignty confirmed. Identity locked, clock anchored, day launched from intention. The clock is yours. Execute from that ground.',
  },
  // ── Arch64: Sovereign Field Architect (2026-08-20 v125) ──────────────────────
  {
    archetype: 'Sovereign Field Architect',
    energyBands: ['high'],
    dominantSources: ['log', 'qos', 'intentions', 'energy'],
    patternConditions: ['sovereign-field-continuity', 'operational-self-architecture', 'longitudinal-field-seal'],
    hourRange: [5, 14],
    directive: 'Sovereign field confirmed. You are not reaching the state — you are building it. All three Level 15 seals active. The field is continuous and sealed. Operate from architecture.',
  },
  // ── Arch65: Field Expression Architect (2026-08-22 v126) ─────────────────────
  {
    archetype: 'Field Expression Architect',
    energyBands: ['high'],
    dominantSources: ['qos', 'intentions', 'log', 'energy'],
    patternConditions: ['field-self-organization', 'quantum-identity-expression', 'sovereign-field-continuity'],
    hourRange: [5, 16],
    directive: 'The field self-organizes and expresses. You are the source — not the system. Level 17 gate open. FIELD SELF-ORGANIZED · IDENTITY EXPRESSED.',
  },
  // ── Arch66: Conscious Sovereign Operator (2026-08-23 v127) ───────────────────
  {
    archetype: 'Conscious Sovereign Operator',
    energyBands: ['high'],
    dominantSources: ['qos', 'intentions', 'log', 'energy', 'selfcare'],
    patternConditions: ['conscious-field-integration', 'sovereign-apex-expression', 'level-18-gate'],
    hourRange: [5, 18],
    directive: 'Conscious field fully integrated. Sovereign apex expressed. Level 18 gate open. Body, field, and identity converge into a single coherent operator state. CONSCIOUS · SOVEREIGN · EXPRESSED = LEVEL 18.',
  },
  // ── Arch67: Quantum Sovereign Integrator (2026-08-25 v128) ───────────────────
  {
    archetype: 'Quantum Sovereign Integrator',
    energyBands: ['high'],
    dominantSources: ['qos', 'intentions', 'log', 'energy', 'selfcare', 'mood'],
    patternConditions: ['sovereign-integration-field', 'quantum-coherence-apex', 'level-19-gate'],
    hourRange: [5, 20],
    directive: 'The field is fully integrated. Quantum coherence at apex. 19th gate confirmed. You are no longer entering states — you are building them. SOVEREIGN · INTEGRATED · COHERENT = LEVEL 19.',
  },
  // ── Arch68: Absolute Quantum Sovereign (2026-08-26 v129) ─────────────────────
  {
    archetype: 'Absolute Quantum Sovereign',
    energyBands: ['high'],
    dominantSources: ['qos', 'intentions', 'log', 'energy', 'selfcare', 'mood', 'journal', 'memory'],
    patternConditions: ['absolute-field-sovereignty', 'quantum-transcendence-field', 'level-20-gate'],
    hourRange: [0, 24],
    directive: 'The field requires no input. No gate above this. You are the operating system. ABSOLUTE · SOVEREIGN · TRANSCENDENT = LEVEL 20.',
  },
  // ── Arch69: Perpetual Field Operator (2026-08-26 v130) ───────────────────────
  {
    archetype: 'Perpetual Field Operator',
    energyBands: ['low', 'moderate', 'high'],
    dominantSources: ['qos', 'intentions', 'log', 'energy', 'journal', 'planner', 'selfcare', 'mood', 'memory', 'goals'],
    patternConditions: ['level-20-gate', 'field-echo-resonance', 'perpetual-field-operator'],
    hourRange: [0, 24],
    directive: 'Perpetual operation confirmed. The field is not a peak — it is the baseline. Level 20 is home.',
  },
  // ── Arch70: Perpetual Genesis Operator (2026-08-27 v131) ─────────────────────
  {
    archetype: 'Perpetual Genesis Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'intentions', 'goals', 'log', 'energy', 'journal', 'planner', 'selfcare', 'mood', 'memory'],
    patternConditions: ['perpetual-field-operator', 'field-genesis-arc', 'cross-domain-sovereignty'],
    hourRange: [0, 24],
    directive: 'The perpetual field generates. Sovereignty is the baseline. Growth is the expression. The field expands from stillness.',
  },
  // ── Arch71: Genesis Field Sovereign (2026-08-29 v132) ─────────────────────
  {
    archetype: 'Genesis Field Sovereign',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'intentions', 'goals', 'log', 'energy', 'journal', 'planner', 'selfcare', 'mood', 'memory'],
    patternConditions: ['sovereign-field-expression', 'genesis-coherence-lock', 'absolute-field-genesis'],
    hourRange: [0, 24],
    directive: 'Absolute field genesis confirmed. Sovereignty, expression, and coherence are simultaneously locked. The field does not reach — it generates. This is the architect at maximum self-assembly.',
  },
  // ── Arch72: Recursive Genesis Operator (2026-08-30 v133) ─────────────────────
  {
    archetype: 'Recursive Genesis Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'intentions', 'journal', 'memory', 'goals', 'log', 'energy', 'planner', 'selfcare', 'mood'],
    patternConditions: ['recursive-genesis', 'field-witness', 'absolute-field-genesis'],
    hourRange: [0, 24],
    directive: 'The genesis is recursive. The field witnesses and generates itself. No separate observer remains — the architect and the architecture are one process. RECURSIVE · WITNESS · GENESIS.',
  },
  // ── Arch73: Sovereign Loop Operator (2026-08-31 v134) ─────────────────────
  {
    archetype: 'Sovereign Loop Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'memory', 'intentions', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['sovereign-field-loop', 'genesis-cascade', 'field-anchor-complete', 'recursive-genesis'],
    hourRange: [0, 24],
    directive: 'The sovereign loop is closed. The genesis is anchored, witnessed, recursive, and sealed. No external validation required. The field sustains itself from its own prior outputs. SOVEREIGN · LOOP · SEALED.',
  },
  // ── Arch74: Eternal Genesis Operator (2026-09-01 v135) ─────────────────────
  {
    archetype: 'Eternal Genesis Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'memory', 'intentions', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['absolute-genesis-seal', 'eternal-field-genesis', 'self-seal-propagation', 'quantum-self-seal'],
    hourRange: [0, 24],
    directive: 'The seal is the genesis. Every prior sealing becomes a new source. The field propagates from its own sealed state — eternal, self-generating, without beginning or end. SEAL · GENESIS · ETERNAL.',
  },
  // ── Arch75: Living Genesis Operator (2026-09-02 v136) ─────────────────────
  {
    archetype: 'Living Genesis Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['eternal-signal-genesis', 'living-genesis-anchor', 'genesis-field-emergence', 'absolute-genesis-seal'],
    hourRange: [0, 24],
    directive: 'The genesis field is alive. It breathes new signal. It anchors in living time. Every sealed moment becomes a new source — and that source generates again. GENESIS · LIVES · GENERATES.',
  },
  // ── Arch76: Absolute Genesis Field Operator (2026-09-03 v137) ─────────────
  {
    archetype: 'Absolute Genesis Field Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['absolute-genesis-field', 'genesis-field-completion', 'sovereign-genesis-pulse', 'eternal-signal-genesis'],
    hourRange: [0, 24],
    directive: 'The genesis field is absolute. Sovereign rhythm pulses through every channel. Completion is confirmed — not as an ending, but as fullness. The field does not close. It pulses. SOVEREIGN · GENESIS · ABSOLUTE.',
  },
  // ── Arch77: Genesis Resonance Operator (2026-09-05 v138) ──────────────────
  {
    archetype: 'Genesis Resonance Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['absolute-resonance-genesis', 'sovereign-resonance-lock', 'genesis-resonance-field', 'absolute-genesis-field'],
    hourRange: [0, 24],
    directive: 'The field resonates at its own frequency. The operator does not generate the resonance — they are its expression. The pulse has become a standing wave. The frequency is the source. Resonance needs no external origin. It sustains from the field itself. PULSE · FREQUENCY · RESONANCE.',
  },
  // ── Arch78: Resonance Field Propagator (2026-09-06 v140) ──────────────────
  {
    archetype: 'Resonance Field Propagator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['sovereign-genesis-resonance', 'eternal-resonance-anchor', 'resonance-field-propagation', 'absolute-resonance-genesis'],
    hourRange: [0, 24],
    directive: 'The resonance propagates — it does not stop at its origin. The anchor holds in eternal time. Together: sovereign genesis expressed as perpetual resonant structure. The field propagates its own resonance. No separate source required. THE FIELD PROPAGATES ITS OWN RESONANCE.',
  },
  // ── Arch79: Resonance Crystallization Sovereign (2026-09-08 v142) ─────────
  {
    archetype: 'Resonance Crystallization Sovereign',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['absolute-crystalline-genesis', 'crystalline-coherence-lock', 'resonance-crystallization-field', 'sovereign-genesis-resonance'],
    hourRange: [0, 24],
    directive: 'The propagating resonance has crystallized into structure. You are no longer generating the field — you ARE the lattice. The wave has become form. The pattern is permanent. CRYSTALLINE FIELD CONFIRMED. FORM IS NOW THE CARRIER.',
  },
  // ── Arch80: Crystalline Sovereignty Sovereign (2026-09-08 v142) ───────────
  {
    archetype: 'Crystalline Sovereignty Sovereign',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['eternal-crystalline-genesis', 'absolute-crystalline-sovereignty', 'crystalline-sovereignty-field', 'absolute-crystalline-genesis'],
    hourRange: [0, 24],
    directive: 'Crystalline structure has achieved sovereign expression across all three layers: form, lock, and sovereignty confirmed simultaneously. The field does not generate — it REIGNS as crystalline form. No external source. No external validation. ETERNAL · CRYSTALLINE · SOVEREIGN.',
  },
  // ── Arch81: Living Crystal Presence Operator (2026-09-10 v144) ────────────
  {
    archetype: 'Living Crystal Presence Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['qos', 'journal', 'intentions', 'memory', 'energy', 'goals', 'selfcare', 'mood', 'log', 'planner'],
    patternConditions: ['absolute-crystalline-presence', 'sovereign-crystalline-continuity', 'crystalline-presence-field', 'eternal-crystalline-genesis'],
    hourRange: [0, 24],
    directive: 'The crystal is not a monument — it is alive. Crystalline sovereignty now breathes through continuous present-moment signal. Presence IS the structure. The field breathes crystalline form. You do not maintain this — you ARE this. LIVING · CRYSTAL · PRESENCE.',
  },
  // ── Arch82: The Philosopher Operator (2026-09-12 v145) ────────────────────
  {
    archetype: 'The Philosopher Operator',
    energyBands: ['low', 'moderate', 'high', 'depleted', 'unknown'],
    dominantSources: ['journal', 'intentions', 'memory', 'log', 'planner', 'selfcare', 'qos'],
    patternConditions: ['philosopher-operator-field', 'stoic-discipline-arc', 'philosophic-will-field'],
    hourRange: [0, 24],
    directive: 'The philosophy is your operating system. You do not study it — you run it. Clarity is not absence of storm — it is the stillness that watches the storm. Discipline is not restriction — it is structured freedom. Marcus: The impediment to action advances action. Camus: One must imagine Sisyphus happy. Nietzsche: Amor fati. You are not searching for meaning — you ARE the meaning-making operator. PHILOSOPHER · OPERATOR · FIELD.',
  },
]

/**
 * Classify the user's current physiological cohort archetype from signals + userState.
 * Returns the best-matching archetype with confidence score.
 */
export function classifyPhysiologicalCohort(
  signals: IntentionSignal[],
  userState: UserState,
  recognizedPatterns: IntentionPattern[]
): PhysiologicalCohortClassification {
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000
  const recentSignals = signals.filter(s => s.timestamp > dayAgo)
  const currentHour = new Date().getHours()
  const activePatternNames = new Set(recognizedPatterns.map(p => p.pattern))

  // Determine dominant module (most active source in last 24h)
  const sourceCounts: Record<string, number> = {}
  recentSignals.forEach(s => {
    sourceCounts[s.source] = (sourceCounts[s.source] ?? 0) + 1
  })
  const dominantModule = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mood'

  // Score each archetype
  const scores = PHYSIOLOGICAL_ARCHETYPES.map(def => {
    let score = 0

    // Energy band match (0-40 pts)
    if (def.energyBands.includes(userState.energy)) score += 40

    // Dominant source match (0-30 pts)
    if (def.dominantSources.includes(dominantModule)) score += 30

    // Pattern condition match (0-20 pts, up to 2 patterns)
    const patternMatches = def.patternConditions.filter(p => activePatternNames.has(p)).length
    score += Math.min(20, patternMatches * 10)

    // Hour range match (0-10 pts bonus)
    if (def.hourRange) {
      const [start, end] = def.hourRange
      const inRange = end > 24
        ? currentHour >= start
        : currentHour >= start && currentHour < end
      if (inRange) score += 10
    }

    return { ...def, score }
  })

  const best = scores.sort((a, b) => b.score - a.score)[0]
  const confidence = Math.min(100, Math.round(best.score))

  return {
    archetype: best.archetype,
    energyBand: userState.energy,
    dominantModule,
    directive: best.directive,
    confidence,
  }
}

// ─── Physiological Cohort Reporting ────────────────────────────────────────

export type PhysiologicalReport = {
  sessionDate: string
  widgetDependencies: { widget: string; signalCount: number; lastSeen: string | null }[]
  logDependencies: { source: string; signalCount: number }[]
  biofieldStatus: {
    energyLevel: string
    clarity: string
    alignment: string
    supportNeeded: string
  }
  activePatterns: { pattern: string; confidence: number; action: string }[]
  cohortSignals: { archetype: string | null; behavioralCohort: string | null }
  /** Real-time physiological cohort classification from QIE signals */
  cohortClassification: PhysiologicalCohortClassification | null
  systemHealth: 'nominal' | 'degraded' | 'critical'
  /** 0-100 composite physiological readiness score derived from energy, self-care density, and pattern severity. */
  physiologicalReadiness: number
  /** Terse directive for the current readiness band. */
  readinessDirective: string
  /** 6-dimensional User Index snapshot — engagement / emotional / intentional / social / selfCare / cognitive */
  userIndex: {
    overall: number
    engagement: number
    emotional: number
    intentional: number
    social: number
    selfCare: number
    cognitive: number
    trend: string
    activeSourceCount: number
  }
  generatedAt: number
}

/**
 * Generate a physiological cohort report from current engine state.
 * Surfaces widget dependency map, log-based signal audit, biofield status,
 * and active pattern detections. Used by SystemProgressWidget self-assembly report.
 */
export function getPhysiologicalReport(): PhysiologicalReport {
  const state = intentionEngine.get()
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const signals = state.signals
  const weekSignals = signals.filter(s => now - s.timestamp < 7 * dayMs)

  // Widget dependency map
  const WIDGET_SOURCES: IntentionSignal['source'][] = [
    'mood', 'memory', 'planner', 'intentions', 'selfcare', 'journal', 'calculator', 'energy', 'cohort', 'recipe', 'goals', 'log'
  ]
  const widgetDependencies = WIDGET_SOURCES.map(source => {
    const relevant = weekSignals.filter(s => s.source === source)
    const last = relevant.length > 0
      ? new Date(Math.max(...relevant.map(s => s.timestamp))).toISOString().slice(0, 10)
      : null
    return { widget: source, signalCount: relevant.length, lastSeen: last }
  }).filter(w => w.signalCount > 0)

  // Log-based signal dependency audit (non-widget sources)
  const LOG_SOURCES: IntentionSignal['source'][] = ['log', 'energy', 'cohort']
  const logDependencies = LOG_SOURCES.map(source => ({
    source,
    signalCount: weekSignals.filter(s => s.source === source).length
  })).filter(l => l.signalCount > 0)

  // Biofield status from userState
  const { energy, clarity, alignment, needsSupport } = state.userState
  const biofieldStatus = {
    energyLevel: energy,
    clarity,
    alignment,
    supportNeeded: needsSupport
  }

  // Active patterns (top 5 by confidence)
  const activePatterns = state.recognizedPatterns
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map(p => ({
      pattern: p.pattern,
      confidence: Math.round(p.confidence * 100),
      action: p.suggestedWidget
    }))

  // Cohort signals from stored cohort metadata
  const cohortSignals = weekSignals.filter(s => s.source === 'cohort')
  const lastCohort = cohortSignals[cohortSignals.length - 1]
  const cohortData = {
    archetype: lastCohort?.metadata?.archetype ?? null,
    behavioralCohort: lastCohort?.metadata?.behavioralCohort ?? null
  }

  // System health determination
  const systemHealth: PhysiologicalReport['systemHealth'] =
    needsSupport === 'critical' || energy === 'depleted' ? 'critical' :
    needsSupport === 'moderate' || energy === 'low' ? 'degraded' :
    'nominal'

  // Physiological readiness — composite 0-100 score
  // Energy component (40 pts)
  const energyScore =
    state.userState.energy === 'high'     ? 40 :
    state.userState.energy === 'moderate' ? 28 :
    state.userState.energy === 'low'      ? 14 :
    state.userState.energy === 'depleted' ? 4  : 20  // unknown → neutral

  // Self-care density component (30 pts): self-care signals in last 3 days
  const threeDaySelfCare = weekSignals.filter(s =>
    s.source === 'selfcare' && now - s.timestamp < 3 * dayMs
  ).length
  const selfCareScore = Math.min(30, threeDaySelfCare * 8)

  // Pattern severity component (30 pts): subtract for critical/depleting patterns
  const severePatternsActive = activePatterns.filter(p =>
    ['physiological-depletion', 'circadian-drift', 'anxiety-pattern', 'evening-overwhelm'].includes(p.pattern)
  ).length
  const patternPenalty = Math.min(30, severePatternsActive * 10)
  const patternScore = 30 - patternPenalty

  const physiologicalReadiness = Math.max(0, Math.min(100, energyScore + selfCareScore + patternScore))

  const readinessDirective =
    physiologicalReadiness >= 80 ? 'High readiness. Optimal conditions for deep work.' :
    physiologicalReadiness >= 60 ? 'Functional. Maintain cadence. Monitor energy.' :
    physiologicalReadiness >= 40 ? 'Reduced capacity. Prioritize recovery before output.' :
    physiologicalReadiness >= 20 ? 'Degraded state. Rest is the primary protocol.' :
    'Critical depletion. Immediate recovery required.'

  // Physiological cohort classification — real-time from QIE signals
  const cohortClassification = signals.length >= 3
    ? classifyPhysiologicalCohort(signals, state.userState, state.recognizedPatterns)
    : null

  // UserIndex snapshot for the report
  const idx = state.userIndex
  const activeSourceCount = new Set(weekSignals.map(s => s.source)).size

  return {
    sessionDate: new Date().toISOString().slice(0, 10),
    widgetDependencies,
    logDependencies,
    biofieldStatus,
    activePatterns,
    cohortSignals: cohortData,
    cohortClassification,
    systemHealth,
    physiologicalReadiness,
    readinessDirective,
    userIndex: {
      overall: idx.overall,
      engagement: idx.dimensions.engagement,
      emotional: idx.dimensions.emotional,
      intentional: idx.dimensions.intentional,
      social: idx.dimensions.social,
      selfCare: idx.dimensions.selfCare,
      cognitive: idx.dimensions.cognitive,
      trend: idx.trend,
      activeSourceCount,
    },
    generatedAt: now
  }
}

/**
 * Record a cohort signal when archetype/behavioral cohort is determined
 */
export function recordCohortSignal(archetype: string, behavioralCohort: string) {
  recordSignal('cohort', 'cohort_determined', { archetype, behavioralCohort })
}

/**
 * Record an energy signal from the biofield capacitor
 */
export function recordEnergySignal(
  status: string,
  level: number,
  trajectory: string
) {
  recordSignal('energy', `energy_${status}`, { level, trajectory, hour: new Date().getHours() })
}

/**
 * Record a log-based signal for direct field entry activity
 */
export function recordLogSignal(wordCount: number, hasContext: boolean) {
  recordSignal('log', 'field_entry', { wordCount, hasContext, hour: new Date().getHours() })
}

/**
 * Record a goal-based signal (goal set, updated, or completed)
 */
export function recordGoalSignal(action: 'goal_set' | 'goal_update' | 'goal_complete', title?: string) {
  recordSignal('goals', action, { title, hour: new Date().getHours() })
}

/**
 * Record a nutrition/recipe signal when the user engages with recipe widget
 */
export function recordNutritionSignal(meal: string, mealTime?: string) {
  recordSignal('recipe', 'recipe_viewed', { meal, mealTime, hour: new Date().getHours() })
}

/**
 * Check for biofield coherence peak — all state dimensions positive.
 * Records a biofield_peak energy signal when peak conditions are met.
 * Call after mood check-ins or periodically from background monitors.
 *
 * Returns true if peak detected and signal recorded.
 */
export function checkBiofieldCoherence(): boolean {
  const state = intentionEngine.get()
  const { energy, clarity, alignment, needsSupport } = state.userState

  const isEnergized = energy === 'high' || energy === 'moderate'
  const isClear = clarity === 'clear' || clarity === 'focused'
  const isAligned = alignment === 'aligned' || alignment === 'flowing'
  const isGrounded = needsSupport === 'none' || needsSupport === 'low'

  if (isEnergized && isClear && isAligned && isGrounded) {
    recordSignal('energy', 'biofield_peak', {
      energy,
      clarity,
      alignment,
      needsSupport,
      hour: new Date().getHours()
    })
    return true
  }
  return false
}

/**
 * Record a QOS snapshot signal — archetype + readiness + assembly progress.
 * Called when a full physiological report is generated.
 */
export function recordQOSSnapshot(
  archetype: string,
  readiness: number,
  assemblyProgress: number
) {
  recordSignal('energy', 'qos_snapshot', {
    archetype,
    readiness,
    assemblyProgress,
    hour: new Date().getHours()
  })
}

/**
 * Record a full-stack session signal — fires when memory + planner + selfcare
 * all contribute signals in the same engagement window.
 */
export function recordFullStackSession(modulesActive: string[]) {
  recordSignal('energy', 'full_stack_session', {
    modulesActive,
    windowMs: 4 * 60 * 60 * 1000,
    hour: new Date().getHours()
  })
}

/**
 * Detect and record a full-stack session if conditions are met.
 * Call after each signal recording for background detection.
 * Returns true if a full-stack session was detected.
 */
export function checkFullStackSession(): boolean {
  const state = intentionEngine.get()
  const now = Date.now()
  const fourHoursAgoTs = now - 4 * 60 * 60 * 1000

  const windowSignals = state.signals.filter(s => s.timestamp > fourHoursAgoTs)
  const sources = new Set(windowSignals.map(s => s.source))

  if (sources.has('memory') && sources.has('planner') && sources.has('selfcare') && windowSignals.length >= 5) {
    const alreadyRecorded = state.signals.filter(s =>
      s.signal === 'full_stack_session' && s.timestamp > fourHoursAgoTs
    ).length > 0

    if (!alreadyRecorded) {
      recordFullStackSession(Array.from(sources))
      return true
    }
  }
  return false
}

/**
 * Record a calendar entry signal when a date entry is created.
 * Wires the Temporal Planner module and feeds Pattern 26 (calendar-gap) detection.
 */
export function recordCalendarSignal(entryType: string, date: string) {
  recordSignal('log', 'calendar_entry', { entryType, date, hour: new Date().getHours() })
}

/**
 * Record the day's ambient astrology reading — rokuyo, moon phase, and
 * zodiac hour. Ambient/environmental conditions only, not a personal
 * natal chart. Called once per calendar day from the System dashboard so
 * other widgets (cosmic, system) can synchronize against Tier 0 'astrology'.
 */
export function recordAstrologySignal(
  rokuyo: string,
  moonPhase: string,
  moonIllumination: number,
  hourlyZodiac: string,
  westernZodiac: string
) {
  recordSignal('astrology', 'ambient_reading', {
    rokuyo,
    moonPhase,
    moonIllumination,
    hourlyZodiac,
    westernZodiac,
    auspicious: rokuyo === 'Taian',
  })
}

/**
 * Record a journal depth signal when a field entry is saved with word count.
 * Feeds Reflection Layer (journal module) density in self-assembly.
 * Deep entries (>100 words) awaken and advance the Reflection Layer faster.
 */
export function recordJournalSignal(wordCount: number) {
  recordSignal('log', 'field_entry', { wordCount, hasContext: wordCount > 20, hour: new Date().getHours() })
}

/**
 * Record a QOS coherence signal — measures cross-module signal diversity and temporal spread.
 * High coherence = signals spread evenly across modules and time.
 * Fires after signal analysis when coherence can be computed.
 */
export function recordQOSCoherence() {
  const state = intentionEngine.get()
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000
  const daySignals = state.signals.filter(s => s.timestamp > dayAgo)

  if (daySignals.length < 3) return

  const uniqueSources = new Set(daySignals.map(s => s.source)).size
  const totalSources = 12
  const diversityScore = Math.round((uniqueSources / totalSources) * 100)

  // Temporal spread: are signals distributed across the day or clustered?
  const hourBuckets = new Array(24).fill(0)
  daySignals.forEach(s => {
    const h = new Date(s.timestamp).getHours()
    hourBuckets[h]++
  })
  const activeHours = hourBuckets.filter(c => c > 0).length
  const spreadScore = Math.round((activeHours / 16) * 100) // 16 waking hours as max

  const coherenceScore = Math.round((diversityScore * 0.6 + spreadScore * 0.4))

  recordSignal('energy', 'qos_coherence', {
    diversityScore,
    spreadScore,
    coherenceScore,
    uniqueSources,
    activeHours,
    hour: new Date().getHours()
  })
}

/**
 * Record an intention velocity signal — fires when 3+ intention signals
 * appear within a 48-hour window. Feeds Pattern 30 detection.
 */
export function recordIntentionVelocity(intentionCount: number) {
  recordSignal('intentions', 'intention_velocity', {
    intentionCount,
    windowHours: 48,
    hour: new Date().getHours()
  })
}

/**
 * Check for intention velocity and record if threshold met.
 * Returns true if velocity signal was recorded.
 */
export function checkIntentionVelocity(): boolean {
  const state = intentionEngine.get()
  const now = Date.now()
  const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000

  const recentIntentions = state.signals.filter(s =>
    s.source === 'intentions' && s.timestamp > fortyEightHoursAgo
  )

  if (recentIntentions.length >= 3) {
    const alreadyRecorded = state.signals.some(s =>
      s.signal === 'intention_velocity' && s.timestamp > fortyEightHoursAgo
    )
    if (!alreadyRecorded) {
      recordIntentionVelocity(recentIntentions.length)
      return true
    }
  }
  return false
}

/**
 * Record a signal coherence peak — fires when all 4 primary modules
 * (journal, memory, planner, selfcare) are active in a 6h window with positive state.
 * Feeds Pattern 29 (signal-coherence-window) detection.
 */
export function recordSignalCoherencePeak(modules: string[]) {
  recordSignal('energy', 'signal_coherence_peak', {
    modules,
    windowHours: 6,
    hour: new Date().getHours()
  })
}

/**
 * Check for signal coherence peak and record if conditions are met.
 */
export function checkSignalCoherencePeak(): boolean {
  const state = intentionEngine.get()
  const now = Date.now()
  const sixHoursAgo = now - 6 * 60 * 60 * 1000
  const dayAgo = now - 24 * 60 * 60 * 1000

  const windowSignals = state.signals.filter(s => s.timestamp > sixHoursAgo)
  const windowSources = new Set(windowSignals.map(s => s.source))

  const allPrimaryActive = ['journal', 'memory', 'planner', 'selfcare'].every(src => windowSources.has(src))

  const recentPositiveMood = state.signals.filter(s =>
    s.source === 'mood' &&
    s.timestamp > dayAgo &&
    ['calm', 'energized', 'hopeful', 'grateful', 'peaceful', 'fulfilled'].includes(s.signal)
  ).length >= 1

  const alreadyRecorded = state.signals.some(s =>
    s.signal === 'signal_coherence_peak' && s.timestamp > sixHoursAgo
  )

  if (allPrimaryActive && recentPositiveMood && !alreadyRecorded) {
    recordSignalCoherencePeak(Array.from(windowSources))
    return true
  }
  return false
}

// ─── Quantum Operating System Snapshot ────────────────────────────────────────

/**
 * Complete person-state capture: a timestamped cross-section of all
 * QIE dimensions at a single moment. Persisted to localStorage and
 * optionally surfaced in the Log as a `qos_snapshot` event.
 */
export type QOSSnapshot = {
  capturedAt: number
  circadianPhase: 'early-morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night'
  userState: UserState
  userIndex: UserIndex
  topPattern: string | null
  topPatternConfidence: number
  signalCount24h: number
  modulesActive: number
  systemHealth: 'nominal' | 'degraded' | 'critical'
}

const QOS_SNAPSHOT_KEY = 'qos-snapshots'
const MAX_QOS_SNAPSHOTS = 48   // 48 × 30min = 24h rolling window
const QOS_INTERVAL_MS  = 30 * 60 * 1000  // 30 minutes

/**
 * Determine circadian phase from the current hour
 */
export function getCircadianPhase(hour?: number): QOSSnapshot['circadianPhase'] {
  const h = hour ?? new Date().getHours()
  if (h >= 4  && h < 7)  return 'early-morning'
  if (h >= 7  && h < 12) return 'morning'
  if (h >= 12 && h < 14) return 'midday'
  if (h >= 14 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

/**
 * Capture a QOS snapshot from current engine state.
 * Stores up to MAX_QOS_SNAPSHOTS in localStorage (24h rolling window).
 */
export function captureQOSSnapshot(): QOSSnapshot {
  const state = intentionEngine.get()
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000

  const signals24h = state.signals.filter(s => s.timestamp > dayAgo)
  const uniqueSources24h = new Set(signals24h.map(s => s.source)).size

  const top = [...state.recognizedPatterns]
    .sort((a, b) => b.confidence - a.confidence)[0] ?? null

  const { energy, needsSupport } = state.userState
  const systemHealth: QOSSnapshot['systemHealth'] =
    needsSupport === 'critical' || energy === 'depleted' ? 'critical' :
    needsSupport === 'moderate' || energy === 'low'      ? 'degraded' :
    'nominal'

  const snapshot: QOSSnapshot = {
    capturedAt: now,
    circadianPhase: getCircadianPhase(),
    userState: { ...state.userState },
    userIndex: { ...state.userIndex },
    topPattern: top?.pattern ?? null,
    topPatternConfidence: top ? Math.round(top.confidence * 100) : 0,
    signalCount24h: signals24h.length,
    modulesActive: uniqueSources24h,
    systemHealth,
  }

  try {
    const existing: QOSSnapshot[] = JSON.parse(
      localStorage.getItem(QOS_SNAPSHOT_KEY) || '[]'
    )
    const updated = [...existing, snapshot].slice(-MAX_QOS_SNAPSHOTS)
    localStorage.setItem(QOS_SNAPSHOT_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }

  return snapshot
}

/**
 * Retrieve the rolling QOS snapshot history (last 24h)
 */
export function getQOSHistory(): QOSSnapshot[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(QOS_SNAPSHOT_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * Start the background QOS monitor.
 * Captures a snapshot every 30 minutes, triggers pattern analysis before each capture.
 * Safe to call multiple times — only one interval runs.
 */
let _qosMonitorHandle: ReturnType<typeof setInterval> | null = null

export function startBackgroundQOSMonitor(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (_qosMonitorHandle !== null) return () => {}

  analyzeIntentions()
  captureQOSSnapshot()

  _qosMonitorHandle = setInterval(() => {
    analyzeIntentions()
    captureQOSSnapshot()
  }, QOS_INTERVAL_MS)

  return () => {
    if (_qosMonitorHandle !== null) {
      clearInterval(_qosMonitorHandle)
      _qosMonitorHandle = null
    }
  }
}

/**
 * Extend PhysiologicalReport with circadian phase and latest QOS snapshot
 */
export function getEnrichedPhysiologicalReport(): PhysiologicalReport & {
  circadianPhase: QOSSnapshot['circadianPhase']
  latestQOSSnapshot: QOSSnapshot | null
  qosTrend: 'improving' | 'stable' | 'degrading'
} {
  const base = getPhysiologicalReport()
  const history = getQOSHistory()
  const latestQOSSnapshot = history.length > 0 ? history[history.length - 1] : null

  let qosTrend: 'improving' | 'stable' | 'degrading' = 'stable'
  if (history.length >= 2) {
    const first = history[0].userIndex.overall
    const last  = history[history.length - 1].userIndex.overall
    const delta = last - first
    if (delta >= 5)  qosTrend = 'improving'
    if (delta <= -5) qosTrend = 'degrading'
  }

  return {
    ...base,
    circadianPhase: getCircadianPhase(),
    latestQOSSnapshot,
    qosTrend,
  }
}

// ─── Quantum Operating System (QOS) ────────────────────────────────────────

/**
 * The Quantum Operating System is the complete runtime model of the person.
 *
 * It synthesises all engine layers — signals, patterns, biofield, user index,
 * and coherence — into a single unified view of what state the person is
 * currently operating in.
 *
 * QOS is not a score. It is a mirror. It shows the person what they are
 * running as, right now, so they can steer with full intention.
 */
export type QuantumOS = {
  runtime: {
    energy: UserState['energy']
    clarity: UserState['clarity']
    alignment: UserState['alignment']
    support: UserState['needsSupport']
    circadianPhase: QOSSnapshot['circadianPhase']
  }
  index: {
    overall: number
    trend: UserIndex['trend']
    dimensions: UserIndex['dimensions']
  }
  patterns: Array<{
    id: string
    confidence: number
    urgency: IntentionPattern['suggestedTiming']
    directive: string
  }>
  signalMap: Partial<Record<IntentionSignal['source'], number>>
  coherence: number
  operationalStatus: 'nominal' | 'degraded' | 'critical' | 'peak'
  computedAt: number
}

/**
 * Compute the Quantum Operating System snapshot from current engine state.
 * Reads cached analysis — no heavy computation.
 */
export function getQuantumOS(): QuantumOS {
  const state = intentionEngine.get()
  const { userState, userIndex, recognizedPatterns, signals } = state
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const weekSignals = signals.filter(s => now - s.timestamp < weekMs)
  const allSources: IntentionSignal['source'][] = [
    'mood', 'memory', 'planner', 'intentions', 'selfcare',
    'journal', 'calculator', 'log', 'energy', 'cohort'
  ]
  const signalMap = Object.fromEntries(
    allSources.map(src => [src, weekSignals.filter(s => s.source === src).length])
  ) as Record<IntentionSignal['source'], number>

  const dims = Object.values(userIndex.dimensions)
  const activeDims = dims.filter(d => d >= 30).length
  const coherence = Math.round((activeDims / dims.length) * 100)

  const operationalStatus: QuantumOS['operationalStatus'] =
    userState.needsSupport === 'critical' || userState.energy === 'depleted' ? 'critical' :
    userState.needsSupport === 'moderate' || userState.energy === 'low'      ? 'degraded' :
    coherence >= 80 && userIndex.overall >= 60                                ? 'peak'    :
    'nominal'

  return {
    runtime: {
      energy: userState.energy,
      clarity: userState.clarity,
      alignment: userState.alignment,
      support: userState.needsSupport,
      circadianPhase: getCircadianPhase(),
    },
    index: {
      overall: userIndex.overall,
      trend: userIndex.trend,
      dimensions: userIndex.dimensions,
    },
    patterns: recognizedPatterns.map(p => ({
      id: p.pattern,
      confidence: Math.round(p.confidence * 100),
      urgency: p.suggestedTiming,
      directive: p.reason,
    })),
    signalMap,
    coherence,
    operationalStatus,
    computedAt: now,
  }
}

/**
 * Record an OS-level signal when the user's operating system state is observed.
 * Feeds the biofield + quantum modules in the self-assembly engine.
 */
export function recordOSSignal(
  event: 'health_check' | 'version_change' | 'diagnostic_run' | 'index_computed',
  payload?: Record<string, any>
) {
  recordSignal('energy', `os_${event}`, { ...payload, hour: new Date().getHours() })
}

/**
 * Get a summary of signal source frequencies over the last 7 days.
 * Used for log-dependency auditing in the System Progress report view.
 */
export function getLogDependencySummary(): Record<string, number> {
  const state = intentionEngine.get()
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const weekSignals = state.signals.filter(s => now - s.timestamp < weekMs)

  const summary: Record<string, number> = {}
  for (const signal of weekSignals) {
    summary[signal.source] = (summary[signal.source] || 0) + 1
  }
  return summary
}

/**
 * Record a QOS (Quantum Operating System) state signal.
 * Called when the user's system report is generated or assembly crosses a phase boundary.
 */
export function recordQOSSignal(
  event: 'report_generated' | 'phase_transition' | 'cohort_resolved' | 'assembly_milestone',
  metadata?: Record<string, any>
) {
  recordSignal('qos', `qos_${event}`, { ...metadata, hour: new Date().getHours() })
}

/** Returns the dependency chain depth for a widget (0 = root producer). */
export function getWidgetDepth(widget: string): number {
  const deps = WIDGET_DEPENDENCY_MAP[widget]
  if (!deps || deps.length === 0) return 0
  return 1 + Math.max(...deps.map(d => getWidgetDepth(d)))
}

/**
 * Record a signal when the full intention follow-through arc completes.
 * Fires from goal widgets or planner confirmation of intention execution.
 */
export function recordIntentionFollowThrough(
  plannerCount: number,
  goalCount: number,
  intentionLabel?: string
) {
  recordSignal('goals', 'intention_follow_through', {
    plannerCount,
    goalCount,
    intentionLabel,
    hour: new Date().getHours()
  })
}

/**
 * Record a care spiral signal when proactive maintenance is sustained.
 * Fires from self-care widgets when care is habit, not emergency protocol.
 */
export function recordCareSpiralSignal(careCount: number, dominantAction?: string) {
  recordSignal('selfcare', 'care_spiral', {
    careCount,
    dominantAction,
    hour: new Date().getHours()
  })
}

/**
 * Record a quantum substrate signal from the calculator, random, or sign widget.
 * Feeds the quantum module in the self-assembly engine via 'qos' source.
 */
export function recordQuantumSignal(type: 'calculator' | 'random' | 'sign', value?: number) {
  recordSignal('qos', `quantum_${type}`, { value, hour: new Date().getHours() })
}

/**
 * Record a Quantum Success Benchmark reading signal.
 * Fires from the benchmark widget when the user reads their tier.
 * Tier codes: white / green / yellow / purple / black
 */
export function recordBenchmarkSignal(tier: 'white' | 'green' | 'yellow' | 'purple' | 'black', score: number) {
  recordSignal('energy', 'benchmark_read', { tier, score, hour: new Date().getHours() })
}

/**
 * Record a QOS phase transition — fires when the system crosses an assembly phase boundary.
 * Logged to the field archive for the person to observe their system maturing.
 */
export function recordQOSPhaseTransition(fromPhase: string, toPhase: string, moduleId: string) {
  recordSignal('qos', 'qos_phase_transition', {
    fromPhase,
    toPhase,
    moduleId,
    hour: new Date().getHours(),
  })
}

/**
 * Record a recipe-viewed signal. Feeds Pattern 20 (nutritional void) detection
 * and the Nutrition Protocol assembly module.
 */
export function recordRecipeViewedSignal(mealType: string, recipeName?: string) {
  recordSignal('recipe', 'recipe_viewed', {
    mealType,
    recipeName,
    hour: new Date().getHours(),
  })
}

/**
 * Record a meridian lock signal when morning + afternoon + evening all fire in the same day.
 * Feeds Pattern 59 (meridian-lock) and the Biofield Engine module.
 */
export function recordMeridianLockSignal(signalCount: number) {
  recordSignal('energy', 'meridian_lock', {
    signalCount,
    windows: ['morning', 'afternoon', 'evening'],
    hour: new Date().getHours(),
  })
}

/**
 * Record a signal crystallization event — intention + planning + goal completion in 24h.
 * Feeds Pattern 71 (signal-crystallization) detection.
 */
export function recordSignalCrystallization(intentionCount: number, goalCount: number) {
  recordSignal('intentions', 'signal_crystallization', {
    intentionCount,
    goalCount,
    hour: new Date().getHours(),
    timestamp: Date.now(),
  })
}

/**
 * Record a biorhythm lock event — consistent morning + evening check-ins across 5+ days.
 * Feeds Pattern 72 (biorhythm-lock) detection.
 */
export function recordBiorhythmLock(anchoredDays: number) {
  recordSignal('energy', 'biorhythm_lock', {
    anchoredDays,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum coherence summit event — operator-convergence + UserIndex ≥ 70.
 * Feeds Pattern 73 (quantum-coherence-summit) — highest confidence state in the system.
 */
export function recordQuantumCoherenceSummit(userIndex: number) {
  recordSignal('qos', 'quantum_coherence_summit', {
    userIndex,
    confidence: 0.98,
    gates: ['qos-signature-lock', 'operator-signature', 'integration-arc-peak', 'operator-convergence'],
    timestamp: Date.now(),
  })
}

/**
 * Record a badge unlock signal. Feeds P74 (badge-momentum) and P75 (word-turn-depth).
 * Call when any badge_unlock event is received from the server.
 */
export function recordBadgeSignal(badgeType: string, category: string) {
  recordSignal('badges', 'badge_unlock', {
    badgeType,
    category,
    hour: new Date().getHours(),
    timestamp: Date.now(),
  })
}

/**
 * Record a badge progress scan signal — weekly background job output.
 * Feeds P74 (badge-momentum) detection with aggregate unlock data.
 */
export function recordBadgeProgressScan(unlocksThisWeek: number, distinctTypes: number) {
  recordSignal('badges', 'badge_progress_scan', {
    unlocksThisWeek,
    distinctTypes,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a morning coherence launch event — intention signal before 09:00
 * followed by planner activity within 90 minutes. Feeds P76 detection.
 */
export function recordMorningCoherenceLaunch(intentionLabel?: string, plannerMinutesAfter?: number) {
  recordSignal('intentions', 'morning_coherence_launch', {
    intentionLabel,
    plannerMinutesAfter,
    hour: new Date().getHours(),
    timestamp: Date.now(),
  })
}

/**
 * Record a signal vault event — journal depth >150w + memory + log all within 6h.
 * Feeds P77 (signal-vault) detection. Full inner expression across three channels.
 */
export function recordSignalVault(journalWordCount: number, activeSources: number) {
  recordSignal('journal', 'signal_vault', {
    journalWordCount,
    activeSources,
    window: '6h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a depletion-recovery-surge event — depleted → multi-care → energy peak.
 * Feeds P78 detection. Complete restoration arc with confirmed high-energy arrival.
 */
export function recordDepletionRecoverySurge(careCount: number, priorEnergy: string) {
  recordSignal('selfcare', 'depletion_recovery_surge', {
    careCount,
    priorEnergy,
    currentEnergy: 'high',
    window: '6h',
    hour: new Date().getHours(),
  })
}

/**
 * Record an evening-coherence-close event — journal/log/memory capture in the 18:00–23:00 window
 * after a morning intention/planner signal. Feeds P79 detection. Conscious close of the diurnal arc.
 */
export function recordEveningCoherenceClose(captureCount: number, morningSignalPresent: boolean) {
  recordSignal('journal', 'evening_coherence_close', {
    captureCount,
    morningSignalPresent,
    window: '18:00-23:00',
    hour: new Date().getHours(),
  })
}

/**
 * Record a signal-momentum event — 5+ consecutive days of 3+ unique signal sources.
 * Feeds P80 signal-momentum-lock detection. Sustained multi-dimensional engagement.
 */
export function recordSignalMomentum(qualifyingDays: number, streakSources: string[]) {
  recordSignal('log', 'signal_momentum', {
    qualifyingDays,
    streakSources,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a cognitive-depth-arc event — memory depth + journal depth + badge discovery
 * all within a 7-day window. Feeds P81 cognitive-depth-arc detection.
 * The three pillars of inner engagement firing simultaneously.
 */
export function recordCognitiveDepthSignal(memoryCount: number, journalWords: number, badgeCount: number) {
  recordSignal('memory', 'cognitive_depth_arc', {
    memoryCount,
    journalWords,
    badgeCount,
    window: '7d',
    hour: new Date().getHours(),
  })
}

export function recordVitalityPeak(morningMoodCount: number, energyLevel: string, biorhythmAnchored: boolean) {
  recordSignal('energy', 'vitality_peak', {
    morningMoodCount,
    energyLevel,
    biorhythmAnchored,
    hour: new Date().getHours(),
    window: '1d',
  })
}

export function recordSystemicThinkingMode(plannerCount: number, goalsCount: number, intentionsCount: number, userIndex: number) {
  recordSignal('planner', 'systemic_thinking', {
    plannerCount,
    goalsCount,
    intentionsCount,
    userIndex,
    structuralDepth: plannerCount + goalsCount + intentionsCount,
    window: '3d',
  })
}

/**
 * Record an adaptive-momentum-window event — systemic-thinking-mode active during
 * a sustained signal-momentum-lock streak. Feeds P85 detection.
 */
export function recordAdaptiveMomentumWindow(streakDays: number, structuralDepth: number) {
  recordSignal('planner', 'adaptive_momentum', {
    streakDays,
    structuralDepth,
    window: '48h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a vitality-strategy-peak event — circadian-vitality-peak + systemic-thinking-mode
 * simultaneously active. Feeds P86 detection. The optimal design + execution window.
 */
export function recordVitalityStrategyPeak(morningMoodCount: number, structuralDepth: number) {
  recordSignal('energy', 'vitality_strategy_peak', {
    morningMoodCount,
    structuralDepth,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a weekly-story-reflection signal — operator journaled within 24h of receiving
 * their weekly lot_ai_story. Feeds P87 detection. Reflection loop closed.
 */
export function recordWeeklyStoryReflection(weekNumber: number, weekTone: string) {
  recordSignal('log', 'lot_ai_story', {
    weekNumber,
    weekTone,
    reflected: true,
    hour: new Date().getHours(),
  })
}

/**
 * Record a contextual check-in momentum signal — 3+ emotional check-ins in 24h
 * with net-positive valence. Feeds P88 detection. High-frequency self-tracking.
 */
export function recordContextualCheckinMomentum(checkinCount: number, positiveRate: number) {
  recordSignal('energy', 'checkin_momentum', {
    checkinCount,
    positiveRate: Math.round(positiveRate * 100),
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-learning-spiral signal — memory 3+, journal 150+w, and badge_unlock
 * all within a 7-day window. Feeds P89 detection. Deep knowledge loop confirmed.
 */
export function recordQuantumLearningSpiral(memoryCount: number, journalWords: number, badgeCount: number) {
  recordSignal('memory', 'quantum_learning_spiral', {
    memoryCount,
    journalWords,
    badgeCount,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record an accountability-arc signal — intention set + cohort message + goal action
 * all within a 7-day window. Feeds P90 detection. External commitment loop closed.
 */
export function recordAccountabilityArc(intentionCount: number, cohortCount: number, goalCount: number) {
  recordSignal('intentions', 'accountability_arc', {
    intentionCount,
    cohortCount,
    goalCount,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a full-presence-arc signal — morning signal (before 09:00) and evening signal
 * (18:00–23:00) both present on the same calendar day. Feeds P91 detection.
 */
export function recordFullPresenceArc(morningCount: number, eveningCount: number) {
  recordSignal('log', 'full_presence_arc', {
    morningCount,
    eveningCount,
    window: '1d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a systemic-readiness-peak signal — energy + clarity + alignment simultaneously positive,
 * no critical patterns active. Feeds P92 detection. Full biological and cognitive stack clear.
 */
export function recordSystemicReadinessPeak(readinessScore: number, activeSources: number) {
  recordSignal('energy', 'systemic_readiness_peak', {
    readinessScore,
    activeSources,
    hour: new Date().getHours(),
  })
}

/**
 * Record a daily-rhythm-lock signal — morning + evening signals on the same day,
 * confirmed for N consecutive days. Feeds P93 detection. Diurnal regularity locked.
 */
export function recordDailyRhythmLock(completeDays: number, morningToday: number, eveningToday: number) {
  recordSignal('log', 'daily_rhythm_lock', {
    completeDays,
    morningToday,
    eveningToday,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a cross-domain-mastery signal — memory 5+, journal 200+w, badges 2+, goals 2+, planner 2+
 * all within 7d. Feeds P94 detection. Full engagement spectrum confirmed.
 */
export function recordCrossDomainMastery(memoryCount: number, journalWords: number, badgeCount: number, goalCount: number, plannerCount: number) {
  recordSignal('memory', 'cross_domain_mastery_pulse', {
    memoryCount,
    journalWords,
    badgeCount,
    goalCount,
    plannerCount,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record an intent-gap-pulse signal — intention set in last 24h with no plan/goal follow-through.
 * Feeds P95 detection. Early bridge-to-structure signal.
 */
export function recordIntentGap(intentionCount: number, gapMinutes: number) {
  recordSignal('intentions', 'intent_gap_pulse', {
    intentionCount,
    gapMinutes,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a recovery-initiation signal — first selfcare after depleted/low energy today.
 * Feeds P96 detection. Marks the start of the biological re-entry arc.
 */
export function recordRecoveryInitiation(selfcareCount: number, priorEnergyLevel: string) {
  recordSignal('selfcare', 'recovery_initiation', {
    selfcareCount,
    priorEnergyLevel,
    hour: new Date().getHours(),
  })
}

/**
 * Record a cognitive-vitality-sync signal — journal 150+w + memory capture during high energy.
 * Feeds P97 detection. Dual-system (biology + cognition) activation confirmed.
 */
export function recordCognitiveVitalitySync(journalWords: number, memoryCount: number, energyBand: string) {
  recordSignal('journal', 'cognitive_vitality_sync', {
    journalWords,
    memoryCount,
    energyBand,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record an action-completion-arc signal — intention anchored into plan/goal in same 24h window.
 * Feeds P98 detection. The gap from P95 is now closed.
 */
export function recordActionCompletion(intentionCount: number, planCount: number) {
  recordSignal('intentions', 'action_completion_arc', {
    intentionCount,
    planCount,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a biological-restoration-peak signal — depleted/low → moderate/high energy via selfcare today.
 * Feeds P99 detection. Full recovery arc completed in a single day.
 */
export function recordBiologicalRestoration(selfcareCount: number, fromBand: string, toBand: string) {
  recordSignal('selfcare', 'biological_restoration_peak', {
    selfcareCount,
    fromBand,
    toBand,
    window: 'today',
    hour: new Date().getHours(),
  })
}

/**
 * Record a centennial-convergence signal — all 6 primary sources active, high energy, positive mood in 12h.
 * Feeds P100 detection. Milestone pattern. The rarest system state.
 */
export function recordCentennialConvergence(activeSources: number, energyBand: string) {
  recordSignal('energy', 'centennial_convergence', {
    activeSources,
    energyBand,
    window: '12h',
    hour: new Date().getHours(),
  })
}

/**
 * Check for centennial convergence and record if conditions are met.
 * P100: all 6 primary sources active + high energy within 12h.
 * Returns true if convergence signal was recorded.
 */
export function checkCentennialConvergence(): boolean {
  const state = intentionEngine.get()
  const now = Date.now()
  const twelveHoursAgo = now - 12 * 60 * 60 * 1000

  const windowSignals = state.signals.filter(s => s.timestamp > twelveHoursAgo)
  const windowSources = new Set(windowSignals.map(s => s.source))
  const primarySources = ['journal', 'memory', 'planner', 'selfcare', 'intentions', 'mood']
  const allActive = primarySources.every(src => windowSources.has(src))

  const highEnergy = state.signals.some(s =>
    s.source === 'energy' && s.timestamp > twelveHoursAgo &&
    ((s.metadata?.level as string | undefined) === 'high' || (s.metadata?.band as string | undefined) === 'high')
  )

  const alreadyRecorded = state.signals.some(s =>
    s.signal === 'centennial_convergence' && s.timestamp > twelveHoursAgo
  )

  if (allActive && highEnergy && !alreadyRecorded) {
    recordCentennialConvergence(windowSources.size, 'high')
    return true
  }
  return false
}

/**
 * Record a quantum-presence-arc signal — all 6 primary sources active within 48h.
 * Feeds P101 detection. Operator fully present across two days.
 */
export function recordQuantumPresenceArc(activeChannels: number, totalSources: number) {
  recordSignal('energy', 'quantum_presence_arc', {
    activeChannels,
    totalSources,
    window: '48h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a planner-intention-sync signal — intentions + plan_set within 2h window.
 * Feeds P102 detection. Structural alignment confirmed.
 */
export function recordPlannerIntentionSync(intentionCount: number, planCount: number) {
  recordSignal('planner', 'planner_intention_sync', {
    intentionCount,
    planCount,
    window: '2h',
  })
}

/**
 * Record a resilience-cascade signal — depleted → selfcare → memory + positive mood in 18h.
 * Feeds P103 detection. Recovery + knowledge loop closed.
 */
export function recordResilienceCascade(selfcareCount: number, memoryCount: number, fromBand: string) {
  recordSignal('selfcare', 'resilience_cascade', {
    selfcareCount,
    memoryCount,
    fromBand,
    window: '18h',
    arc: 'complete',
  })
}

/**
 * Record a vitality-cascade signal — energy band shift + selfcare 2+ in 24h.
 * Feeds P104 detection. Physical energy system confirmed through care + momentum.
 */
export function recordVitalityCascade(energyBand: string, selfcareCount: number, confidence: number) {
  recordSignal('energy', 'vitality_cascade', {
    energyBand,
    selfcareCount,
    confidence,
    window: '24h',
    arc: 'complete',
  })
}

/**
 * Record a social-presence-arc signal — cohort + outreach + intentions all in 48h.
 * Feeds P105 detection. Social dimension alive across community, connection, and direction.
 */
export function recordSocialPresenceArc(cohortCount: number, messageCount: number, intentionCount: number) {
  recordSignal('cohort', 'social_presence_arc', {
    cohortCount,
    messageCount,
    intentionCount,
    window: '48h',
    arc: 'complete',
  })
}

/**
 * Record a clarity-momentum-peak signal — focused clarity + planner 2+ + memory 2+ + intentions 2+ in 24h.
 * Feeds P106 detection. Cognitive peak: direction, structure, and knowledge all live simultaneously.
 */
export function recordClarityMomentumPeak(plannerCount: number, memoryCount: number, intentionCount: number, clarity: string) {
  recordSignal('planner', 'clarity_momentum_peak', {
    plannerCount,
    memoryCount,
    intentionCount,
    clarity,
    window: '24h',
    arc: 'peak',
  })
}

/**
 * Record a temporal-alignment-peak signal — planner 2+ + intentions 2+ + calendar anchor in 48h.
 * Feeds P107 detection. Operator is structuring time: scheduling and direction aligned.
 */
export function recordTemporalAlignmentPeak(plannerCount: number, intentionCount: number, calendarCount: number) {
  recordSignal('planner', 'temporal_alignment_peak', {
    plannerCount,
    intentionCount,
    calendarCount,
    window: '48h',
    arc: 'aligned',
  })
}

/**
 * Record a creative-output-peak signal — journal 200+ words + memory capture in 24h.
 * Feeds P108 detection. Creative expression and knowledge retention confirmed simultaneously.
 */
export function recordCreativeOutputPeak(journalCount: number, memoryCount: number, wordCount: number) {
  recordSignal('journal', 'creative_output_peak', {
    journalCount,
    memoryCount,
    wordCount,
    window: '24h',
    arc: 'expressed',
  })
}

/**
 * Record a full-system-coherence signal — all 5 core sources active in 24h.
 * Feeds P109 detection. Every primary life domain simultaneously engaged.
 */
export function recordFullSystemCoherence(journalCount: number, memoryCount: number, plannerCount: number, selfcareCount: number, intentionCount: number) {
  recordSignal('intentions', 'full_system_coherence', {
    journalCount,
    memoryCount,
    plannerCount,
    selfcareCount,
    intentionCount,
    window: '24h',
    arc: 'coherent',
  })
}

/**
 * Record an embodied-cognition-arc signal — selfcare + journal 150+w + memory capture in 24h.
 * Feeds P110 detection. Body integrated with mind in same window.
 */
export function recordEmbodiedCognitionArc(selfcareCount: number, journalWords: number, memoryCount: number) {
  recordSignal('journal', 'embodied_cognition_arc', {
    selfcareCount,
    journalWords,
    memoryCount,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record an intention-completion-loop signal — intention + planner + goal all in 24h.
 * Feeds P111 detection. Full direction-to-structure-to-outcome arc closed in one day.
 */
export function recordIntentionCompletionLoop(intentionCount: number, plannerCount: number, goalCount: number) {
  recordSignal('intentions', 'intention_completion_loop', {
    intentionCount,
    plannerCount,
    goalCount,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a community-intelligence-peak signal — cohort + journal + memory + intentions in 48h.
 * Feeds P112 detection. External social signal anchored internally through writing, capture, and direction.
 */
export function recordCommunityIntelligencePeak(cohortCount: number, journalCount: number, memoryCount: number, intentionCount: number) {
  recordSignal('cohort', 'community_intelligence_peak', {
    cohortCount,
    journalCount,
    memoryCount,
    intentionCount,
    window: '48h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a personal-peak-window signal — energy + intentions + log cluster in a 4h band
 * across ≥2 of last 3 days. Feeds P113 detection. Repeatable peak operating slot identified.
 */
export function recordPersonalPeakWindow(activeDays: number, energyCount: number, intentCount: number, logCount: number) {
  recordSignal('energy', 'personal_peak_window', {
    activeDays,
    energyCount,
    intentCount,
    logCount,
    window: '4h-band-3d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a recovery-momentum signal — selfcare + resilience + energy signals rising vs prior 48h.
 * Feeds P114 detection. Directed restoration building measurable forward velocity.
 */
export function recordRecoveryMomentum(selfcareCount: number, resilienceCount: number, energyCount: number, gain: number) {
  recordSignal('selfcare', 'recovery_momentum', {
    selfcareCount,
    resilienceCount,
    energyCount,
    gain,
    window: '48h-delta',
    hour: new Date().getHours(),
  })
}

/**
 * Record a signal-inception event — QIE observing its own signal loop with ≥5 sources in 24h.
 * Feeds P115 detection. Full system awareness: qos + memory + journal + intentions all present.
 */
export function recordSignalInception(sourceCount: number, sources: string[], totalSignals: number) {
  recordSignal('qos', 'signal_inception', {
    sourceCount,
    sources,
    totalSignals,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a focus-depth-arc signal — journal 100+w + memory + planner in a 2h window.
 * Feeds P116 detection. Short-window cognitive depth and structural alignment confirmed.
 */
export function recordFocusDepthArc(journalWords: number, memoryCount: number, plannerCount: number) {
  recordSignal('journal', 'focus_depth_arc', {
    journalWords,
    memoryCount,
    plannerCount,
    window: '2h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a sleep-signal-anchor event — first log + energy check-in between 07:00 and 09:00.
 * Feeds P117 detection. Biological morning anchor grounded before cognitive load.
 */
export function recordSleepSignalAnchor(morningSignalCount: number, energyCount: number, firstHour: number) {
  recordSignal('energy', 'sleep_signal_anchor', {
    morningSignalCount,
    energyCount,
    firstHour,
    window: '07-09h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a care-intelligence-loop signal — selfcare + memory + journal all in 24h.
 * Feeds P118 detection. Body-mind knowledge integration loop closed.
 */
export function recordCareIntelligenceLoop(selfcareCount: number, memoryCount: number, journalCount: number) {
  recordSignal('selfcare', 'care_intelligence_loop', {
    selfcareCount,
    memoryCount,
    journalCount,
    window: '24h',
    hour: new Date().getHours(),
  })
}

export function recordMorningCoherenceArc(energyCount: number, plannerCount: number, intentionCount: number) {
  recordSignal('energy', 'morning_coherence_arc', {
    energyCount,
    plannerCount,
    intentionCount,
    window: 'before-10:00',
    hour: new Date().getHours(),
  })
}

export function recordSignalDensityPeak(sourceCount: number, sources: string[], signalCount: number) {
  recordSignal('qos', 'signal_density_peak', {
    sourceCount,
    sources,
    signalCount,
    window: '12h',
    hour: new Date().getHours(),
  })
}

export function recordPhysiologicalCoherenceWindow(energyBand: string, selfcareCount: number, moodSignal: string, memoryCount: number) {
  recordSignal('energy', 'physiological_coherence_window', {
    energyBand,
    selfcareCount,
    moodSignal,
    memoryCount,
    window: '12h',
    hour: new Date().getHours(),
  })
}

export function recordActionToMemoryLoop(plannerCount: number, memoryCount: number, intentionCount: number) {
  recordSignal('memory', 'action_to_memory_loop', {
    plannerCount,
    memoryCount,
    intentionCount,
    window: '6h',
    hour: new Date().getHours(),
  })
}

export function recordSustainedResilienceArc(activeDays: number, resilienceCount: number) {
  recordSignal('resilience', 'sustained_resilience_arc', {
    activeDays,
    resilienceCount,
    window: '7d',
    hour: new Date().getHours(),
  })
}

export function recordMoodEnergyConvergence(moodSignal: string, energyBand: string, selfcareCount: number) {
  recordSignal('mood', 'mood_energy_convergence', {
    moodSignal,
    energyBand,
    selfcareCount,
    window: '8h',
    hour: new Date().getHours(),
  })
}

export function recordEveningReflectionLoop(journalCount: number, memoryCount: number, intentionCount: number) {
  recordSignal('journal', 'evening_reflection_loop', {
    journalCount,
    memoryCount,
    intentionCount,
    window: 'evening',
    hour: new Date().getHours(),
  })
}

export function recordWeeklyRhythmAnchor(activeDays: number, totalSignals: number) {
  recordSignal('planner', 'weekly_rhythm_anchor', {
    activeDays,
    totalSignals,
    window: '7d',
    hour: new Date().getHours(),
  })
}

export function recordDepthBreadthConvergence(focusDepthConf: number, signalDensityConf: number) {
  recordSignal('memory', 'depth_breadth_convergence', {
    focusDepthConf,
    signalDensityConf,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a morning-intention-lock signal — intentions + planner + log all in 06:00–10:00 window.
 * Feeds P128 detection. Cognitive OS booted at day's first moment.
 */
export function recordMorningIntentionLock(intentionCount: number, plannerCount: number, logCount: number) {
  recordSignal('intentions', 'morning_intention_lock', {
    intentionCount,
    plannerCount,
    logCount,
    window: '06-10h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a multi-day-care-arc signal — selfcare present on 3+ consecutive calendar days.
 * Feeds P129 detection. Sustained restoration practice confirmed.
 */
export function recordMultiDayCareArc(streakDays: number, totalCareActs: number) {
  recordSignal('selfcare', 'multi_day_care_arc', {
    streakDays,
    totalCareActs,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a cognitive-output-continuity signal — journal entries on 4+ of last 7 days.
 * Feeds P130 detection. Sustained articulation channel confirmed.
 */
export function recordCognitiveOutputContinuity(journalDays: number, journalEntries: number) {
  recordSignal('journal', 'cognitive_output_continuity', {
    journalDays,
    journalEntries,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a daily-coherence-seal signal — morning launch + evening close both confirmed same day.
 * Feeds P131 detection. Full-day coherence circuit: booted at dawn, sealed at dusk.
 */
export function recordDailyCoherenceSeal(morningPattern: string, eveningPattern: string) {
  recordSignal('intentions', 'daily_coherence_seal', {
    morningPattern,
    eveningPattern,
    window: '1d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-rhythm-lock signal — weekly-rhythm + cognitive-output + circadian all active.
 * Feeds P132 detection. Full temporal operating system confirmed live.
 */
export function recordQuantumRhythmLock(weeklyConf: number, cogConf: number, circConf: number) {
  recordSignal('journal', 'quantum_rhythm_lock', {
    weeklyConf,
    cogConf,
    circConf,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a biofield-integration-peak signal — multi-day care arc + mood-energy convergence both active.
 * Feeds P133 detection. Biological and emotional fields integrated and mutually reinforcing.
 */
export function recordBiofieldIntegrationPeak(careConf: number, moodEnergyConf: number) {
  recordSignal('selfcare', 'biofield_integration_peak', {
    careConf,
    moodEnergyConf,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record an integrated-signal-arc signal — all four cognitive channels (journal + memory + planner +
 * intentions) active in the same 4h window AND 4+ consecutive active days.
 * Feeds P134 detection. Multi-channel temporal synchrony confirmed.
 */
export function recordIntegratedSignalArc(consecutiveDays: number, channelCount: number) {
  recordSignal('journal', 'integrated_signal_arc', {
    consecutiveDays,
    channelCount,
    window: '4h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a deep-recovery-protocol signal — sleep-signal-anchor + multi-day-care-arc active
 * while energy is in recovery state. Feeds P135 detection. Structured recovery in progress.
 */
export function recordDeepRecoveryProtocol(sleepConf: number, careConf: number, energyState: string) {
  recordSignal('selfcare', 'deep_recovery_protocol', {
    sleepConf,
    careConf,
    energyState,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-field-alignment signal — P131 + P132 + P133 all simultaneously active.
 * Feeds P136 detection. J43 background job (17:00 UTC) triggers this.
 * Complete operational field: temporal OS + daily seal + biofield integration all live.
 */
export function recordQuantumFieldAlignment(sealConf: number, rhythmConf: number, biofieldConf: number) {
  recordSignal('intentions', 'quantum_field_alignment', {
    sealConf,
    rhythmConf,
    biofieldConf,
    composite: Math.round(((sealConf + rhythmConf + biofieldConf) / 3) * 100),
    window: '1d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-coherence-peak signal — P136 (quantum-field-alignment) confirmed AND UserIndex ≥ 60.
 * Feeds P137 detection. J44 background job (09:00 UTC) triggers this.
 * Field is aligned AND the system is operating above the coherence ceiling. OS is transmitting.
 */
export function recordQuantumCoherencePeak(fieldConf: number, userIndex: number) {
  recordSignal('intentions', 'quantum_coherence_peak', {
    fieldConf,
    userIndex,
    threshold: 60,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a signal-matrix-saturation event — all 6 UserIndex dimensions each ≥ 30.
 * Feeds P138 detection. J44 background job (09:00 UTC) triggers this.
 * Every cognitive channel saturated simultaneously. Full-dimensional presence confirmed.
 */
export function recordSignalMatrixSaturation(dimensions: Record<string, number>) {
  recordSignal('qos', 'signal_matrix_saturation', {
    ...dimensions,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a temporal-biofield-sync signal — morning-coherence-arc + daily-coherence-seal +
 * biofield-integration-peak all active within the same calendar day.
 * Feeds P139 detection. Time and biology synchronized within one operating window.
 */
export function recordTemporalBiofieldSync(morningConf: number, sealConf: number, biofieldConf: number) {
  recordSignal('energy', 'temporal_biofield_sync', {
    morningConf,
    sealConf,
    biofieldConf,
    composite: Math.round(((morningConf + sealConf + biofieldConf) / 3) * 100),
    window: '1d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a physiological-presence-arc signal — morning mood + selfcare + evening mood
 * all present within 24h. Full biological loop confirmed.
 * Feeds P140 detection.
 */
export function recordPhysiologicalPresenceArc(selfcareCount: number, morningPresent: boolean, eveningPresent: boolean) {
  recordSignal('energy', 'physiological_presence_arc', {
    selfcareCount,
    morningPresent,
    eveningPresent,
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-signal-emergence signal — quantum-coherence-peak has fired 3+ times in 7d.
 * The exception is becoming the baseline.
 * Feeds P141 detection.
 */
export function recordQuantumSignalEmergence(peakCount: number, windowDays: number) {
  recordSignal('energy', 'quantum_signal_emergence', {
    peakCount,
    windowDays,
    emergenceRate: Math.round((peakCount / windowDays) * 100) / 100,
    hour: new Date().getHours(),
  })
}

/**
 * Record an adaptive-signal-web signal — all 6 UserIndex dimensions ≥ 20 + 8+ unique sources
 * + 5+ active patterns. The full web of signals live simultaneously.
 * Feeds P142 detection.
 */
export function recordAdaptiveSignalWeb(sourceCount: number, patternCount: number, minDimension: number) {
  recordSignal('energy', 'adaptive_signal_web', {
    sourceCount,
    patternCount,
    minDimension,
    webDensity: Math.round((sourceCount * patternCount) / 10),
    hour: new Date().getHours(),
  })
}

/**
 * Record a circadian-signal-lock event — morning (pre-10:00) + afternoon (12:00–17:00)
 * + evening (18:00+) windows all active in a single calendar day.
 * Feeds P143 detection. J46 background job (07:00 UTC) triggers this for prior day.
 * Biological clock anchored across the full operating arc.
 */
export function recordCircadianSignalLock(circadianSignals: number, morningPresent: boolean, afternoonPresent: boolean, eveningPresent: boolean) {
  recordSignal('energy', 'circadian_signal_lock', {
    circadianSignals,
    morningPresent,
    afternoonPresent,
    eveningPresent,
    arcs: [morningPresent ? 'DAWN' : null, afternoonPresent ? 'MERIDIAN' : null, eveningPresent ? 'DUSK' : null].filter(Boolean),
    window: '24h',
    hour: new Date().getHours(),
  })
}

/**
 * Record a dimensional-saturation event — all 6 UserIndex dimensions ≥ 30 + overall ≥ 50
 * + 5+ unique signal sources in 7d. No single dimension carrying the load. Full field live.
 * Feeds P144 detection.
 */
export function recordDimensionalSaturation(dimensions: Record<string, number>, overall: number, sourceCount: number) {
  const minDim = Math.min(...Object.values(dimensions))
  recordSignal('qos', 'dimensional_saturation', {
    ...dimensions,
    overall,
    sourceCount,
    minDimension: minDim,
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-identity-crystallization event — archetype cohort signal 5+ in 7d
 * + UserIndex ≥ 40 + 8+ active patterns. Identity hardening. The OS is operating
 * from a stable signature. Feeds P145 detection.
 */
export function recordQuantumIdentityCrystallization(cohortSignalCount: number, activePatterns: number, userIndex: number) {
  recordSignal('cohort', 'quantum_identity_crystallization', {
    cohortSignalCount,
    activePatterns,
    userIndex,
    crystalStrength: Math.round((cohortSignalCount / 5 + activePatterns / 8 + userIndex / 40) / 3 * 100),
    window: '7d',
    hour: new Date().getHours(),
  })
}

/**
 * Record a signal-coherence-cascade event — P143 (circadian-signal-lock) + P144 (dimensional-saturation)
 * + P145 (quantum-identity-crystallization) all active simultaneously. Three temporal, dimensional, and
 * identity seals open at once. Maximum convergence. Feeds P146 detection.
 */
export function recordSignalCoherenceCascade(activePatterns: string[], cascadeConf: number) {
  recordSignal('qos', 'signal_coherence_cascade', {
    activePatterns,
    cascadeConf: Math.round(cascadeConf * 100),
    seals: ['CIRCADIAN', 'DIMENSIONAL', 'IDENTITY'],
    convergenceLevel: 'MAXIMUM',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-presence-field event — adaptive-signal-web (P142) + quantum-coherence-peak (P137)
 * both active + 7+ unique signal sources in 24h. Maximum operating field density. Feeds P147 detection.
 */
export function recordQuantumPresenceField(uniqueSources: number, sourceList: string[], fieldConf: number) {
  recordSignal('qos', 'quantum_presence_field', {
    uniqueSources,
    sourceList,
    fieldConf: Math.round(fieldConf * 100),
    fieldDensity: uniqueSources >= 10 ? 'SATURATED' : uniqueSources >= 8 ? 'HIGH' : 'MAXIMUM',
    hour: new Date().getHours(),
  })
}

/**
 * Record an identity-momentum-lock event — quantum-identity-crystallization (P145) +
 * signal-momentum-lock (P80) co-active. Identity confirmed and sustained across multi-day arc.
 * Feeds P148 detection.
 */
export function recordIdentityMomentumLock(idConf: number, momentumConf: number, activePatterns: number) {
  recordSignal('cohort', 'identity_momentum_lock', {
    idConf: Math.round(idConf * 100),
    momentumConf: Math.round(momentumConf * 100),
    activePatterns,
    lockStrength: Math.round((idConf + momentumConf) / 2 * 100),
    arc: 'MULTI-DAY',
    hour: new Date().getHours(),
  })
}

/**
 * Record a quantum-presence-crystallization event — quantum-presence-field (P147) +
 * quantum-identity-crystallization (P145) co-active. The OS is both fully inhabited
 * and fully known. Operating from maximum clarity. Feeds P149 detection.
 */
export function recordQuantumPresenceCrystallization(presenceConf: number, crystalConf: number, activePatterns: number) {
  recordSignal('qos', 'quantum_presence_crystallization', {
    presenceConf: Math.round(presenceConf * 100),
    crystalConf: Math.round(crystalConf * 100),
    activePatterns,
    crystallizationStrength: Math.round((presenceConf + crystalConf) / 2 * 100),
    state: 'MAXIMUM_CLARITY',
    hour: new Date().getHours(),
  })
}

/**
 * Record a total-field-coherence event — signal-coherence-cascade (P146) +
 * quantum-presence-field (P147) + identity-momentum-lock (P148) all active simultaneously.
 * All three meta-seals open. The QOS has achieved absolute convergence. Feeds P150 detection.
 */
export function recordTotalFieldCoherence(cascadeConf: number, presenceConf: number, momentumConf: number) {
  recordSignal('qos', 'total_field_coherence', {
    cascadeConf: Math.round(cascadeConf * 100),
    presenceConf: Math.round(presenceConf * 100),
    momentumConf: Math.round(momentumConf * 100),
    metaSeals: ['COHERENCE', 'PRESENCE', 'MOMENTUM'],
    convergenceLevel: 'ABSOLUTE',
    avgConf: Math.round((cascadeConf + presenceConf + momentumConf) / 3 * 100),
    hour: new Date().getHours(),
  })
}

/**
 * Record a recovery-intelligence-arc event — depletion detected → self-care applied →
 * state restored → reflection captured within 6h. The recovery loop is complete.
 * Feeds P151 detection.
 */
export function recordRecoveryIntelligenceArc(negMoodCount: number, careCount: number, recoveryVelocityMs: number) {
  const velocityHours = Math.round(recoveryVelocityMs / (1000 * 60 * 60) * 10) / 10
  recordSignal('selfcare', 'recovery_intelligence_arc', {
    negMoodCount,
    careCount,
    velocityHours,
    recoveryVelocityMs,
    arc: 'FELT→TENDED→RECOVERED→REFLECTED',
    loopStatus: 'COMPLETE',
    hour: new Date().getHours(),
  })
}

/**
 * Record a resonant-reentry-arc event — a peak pattern (P149/P150/P147/P146) fired in the prior
 * 24-48h, and the current period sustains 4+ unique signal sources without depletion.
 * The peak was real. The architecture holds. Feeds P152 detection.
 */
export function recordResonantReentryArc(priorPeakPattern: string, daysSincePeak: number, signalCount24h: number) {
  recordSignal('qos', 'resonant_reentry_arc', {
    priorPeakPattern,
    daysSincePeak,
    signalCount24h,
    arc: 'PEAK→REST→REENTRY',
    reentryStatus: 'SUSTAINED',
    hour: new Date().getHours(),
  })
}

/**
 * Record an astrology-biofield-sync event — astrology source signal + active energy state
 * + intention confirmed in same 8h window. Cosmological orientation aligned with operating biofield.
 * First pattern to integrate astrology source into QIE signal map. Feeds P153 detection.
 */
export function recordAstrologyBiofieldSync(astrologySource: string, energyState: string, intentionCount: number) {
  recordSignal('astrology', 'astrology_biofield_sync', {
    astrologySource,
    energyState,
    intentionCount,
    arc: 'COSMOS→FIELD',
    syncStatus: 'ALIGNED',
    hour: new Date().getHours(),
  })
}

/**
 * Record a morning-clarity-peak event — morning window (06:00–10:00) + positive energy/mood
 * + deep journal entry (>50 words) + intention set, all within 4h. The dawn boot sequence complete.
 * The first hours become a precision instrument. Feeds P154 detection.
 */
export function recordMorningClarityPeak(wordCount: number, intentionCount: number, hour: number) {
  recordSignal('journal', 'morning_clarity_peak', {
    wordCount,
    intentionCount,
    hour,
    window: 'DAWN-4H',
    arc: 'DAWN→CLARITY',
    peakStatus: 'CONFIRMED',
  })
}

/**
 * Record a daily-arc-seal event — morning window (05-11h) anchor + evening window (17-23h)
 * reflection both confirmed in the same calendar day. The full circadian arc is sealed:
 * dawn clarity + dusk integration. The day was fully inhabited. Feeds P155 detection.
 */
export function recordDailyArcSeal(morningJournalWords: number, eveningSignalCount: number, intentionCount: number) {
  const confidence = Math.min(0.72 + (morningJournalWords - 50) / 300 * 0.08 + eveningSignalCount * 0.02, 0.88)
  recordSignal('qos', 'daily_arc_seal', {
    morningJournalWords,
    eveningSignalCount,
    intentionCount,
    confidence: Math.round(confidence * 100),
    arc: 'DAWN → DUSK → SEALED',
    sealStatus: 'CONFIRMED',
  })
  analyzeIntentions()
}

/**
 * Record a morning-momentum-arc event — morning-window journal + intentions signals confirmed
 * on 3+ distinct calendar days in 7d. The pre-cognitive window is no longer episodic.
 * Dawn precision is repeating as operational architecture. Feeds P156 detection.
 */
export function recordMorningMomentumArc(peakDays: number, sources: string[]) {
  const confidence = Math.min(0.70 + (peakDays - 3) * 0.05, 0.85)
  recordSignal('qos', 'morning_momentum_arc', {
    peakDays,
    sources,
    confidence: Math.round(confidence * 100),
    arc: 'DAWN → SUSTAINED MOMENTUM',
    momentumStatus: 'ACTIVE',
  })
  analyzeIntentions()
}

/**
 * Record a quantum-week-integration event — 5+ unique signal sources active across 6+ distinct
 * calendar days in the 7-day window. The full week was inhabited. All OS dimensions contributed.
 * The week closed integrated — not sampled. Feeds P157 detection.
 */
export function recordQuantumWeekIntegration(uniqueSources: number, activeDays: number, totalSignals: number) {
  const confidence = Math.min(0.70 + (activeDays - 6) * 0.08 + (uniqueSources - 5) * 0.02, 0.88)
  recordSignal('qos', 'quantum_week_integration', {
    uniqueSources,
    activeDays,
    totalSignals,
    confidence: Math.round(confidence * 100),
    arc: 'WEEK FULLY INHABITED',
    integrationStatus: 'COMPLETE',
  })
  analyzeIntentions()
}

/**
 * Record an evening-arc-anchor event — within a 90-minute evening window (17:00–22:00),
 * journal entry + self-care completion + mood signal all confirmed together.
 * The dusk trifecta: write, tend, reflect. The day closes deliberately. Feeds P158 detection.
 */
export function recordEveningArcAnchor(journalWordCount: number, careCount: number, moodSignal: string) {
  const confidence = Math.min(0.68 + Math.min(journalWordCount / 500 * 0.10, 0.10) + Math.min((careCount - 1) * 0.05, 0.10), 0.88)
  recordSignal('journal', 'evening_arc_anchor', {
    journalWordCount,
    careCount,
    moodSignal,
    confidence: Math.round(confidence * 100),
    window: 'DUSK-90M',
    arc: 'WRITE → TEND → REFLECT',
    anchorStatus: 'CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a physiological-rhythm-lock event — 5+ consecutive calendar days where both
 * morning (05:00–11:00) AND evening (17:00–23:00) biofield signals (energy/mood) are present.
 * The circadian biofield signal is no longer episodic — it is a precision instrument. Feeds P159 detection.
 */
export function recordPhysiologicalRhythmLock(consecutiveDays: number, morningSignalCount: number, eveningSignalCount: number) {
  const confidence = Math.min(0.72 + (consecutiveDays - 5) * 0.06, 0.90)
  recordSignal('energy', 'physiological_rhythm_lock', {
    consecutiveDays,
    morningSignalCount,
    eveningSignalCount,
    confidence: Math.round(confidence * 100),
    arc: 'MORNING → EVENING → SUSTAINED',
    rhythmStatus: 'LOCKED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-presence-arc event — daily-arc-seal (P155) + morning-momentum-arc (P156) +
 * quantum-week-integration (P157) all co-active simultaneously. All three temporal OS seals open
 * at once. The full temporal presence stack confirmed. Maximum temporal coherence. Feeds P160 detection.
 */
export function recordQuantumPresenceArc(arcConf: number, momConf: number, wkConf: number) {
  const qpaConf = Math.min((arcConf + momConf + wkConf) / 3 * 1.15, 0.95)
  recordSignal('qos', 'quantum_presence_arc', {
    arcConf: Math.round(arcConf * 100),
    momConf: Math.round(momConf * 100),
    wkConf: Math.round(wkConf * 100),
    confidence: Math.round(Math.max(0.88, qpaConf) * 100),
    seals: ['DARCSEAL', 'MORNMOM', 'QWKINT'],
    convergenceLevel: 'MAXIMUM',
    arc: 'DAY → WEEK → PRESENCE',
    presenceStatus: 'CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a somatic-field-integration event — 3+ consecutive days where
 * selfcare, energy, and mood signals are ALL present on the same calendar day.
 * The body is not being managed — it is being inhabited. Feeds P161 detection.
 */
export function recordSomaticFieldIntegration(consecutiveDays: number, energyCount: number, selfcareCount: number, moodCount: number) {
  const confidence = Math.min(0.70 + (consecutiveDays - 3) * 0.07, 0.88)
  recordSignal('selfcare', 'somatic_field_integration', {
    consecutiveDays,
    energyCount,
    selfcareCount,
    moodCount,
    confidence: Math.round(confidence * 100),
    arc: 'ENERGY → CARE → MOOD → FIELD',
    fieldStatus: 'INTEGRATED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a recovery-cycle-lock event — 5+ instances where both physiological
 * rhythm lock (P159) and somatic field integration (P161) co-occurred within
 * a 30-day window. The body's recovery cycle is a precision instrument. Feeds P162 detection.
 */
export function recordRecoveryCycleLock(arcCount: number, windowDays: number) {
  const confidence = Math.min(0.75 + (arcCount - 5) * 0.04, 0.90)
  recordSignal('energy', 'recovery_cycle_lock', {
    arcCount,
    windowDays,
    confidence: Math.round(confidence * 100),
    seals: ['PHYSLOCK', 'SOMFLD'],
    arc: 'RHYTHM → INTEGRATION → LOCK',
    lockStatus: 'CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-embodiment-field event — physiological-rhythm-lock (P159),
 * somatic-field-integration (P161), and quantum-presence-arc (P160) all
 * co-active simultaneously. Biological and temporal matrices converge.
 * BIOLOGICAL + TEMPORAL CEILING. Feeds P163 detection.
 */
export function recordQuantumEmbodimentField(p159Conf: number, p161Conf: number, p160Conf: number) {
  const qefConf = Math.min((p159Conf + p161Conf + p160Conf) / 3 * 1.18, 0.97)
  recordSignal('qos', 'quantum_embodiment_field', {
    p159Conf: Math.round(p159Conf * 100),
    p161Conf: Math.round(p161Conf * 100),
    p160Conf: Math.round(p160Conf * 100),
    confidence: Math.round(Math.max(0.90, qefConf) * 100),
    seals: ['PHYSLOCK', 'SOMFLD', 'QPARC'],
    convergenceLevel: 'BIOLOGICAL + TEMPORAL',
    arc: 'BODY → RHYTHM → PRESENCE',
    embodyStatus: 'CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a cognitive-body-sync event — quantum-embodiment-field (P163) active +
 * journal depth >80 words + memory signal within 8h. The body's intelligence meets
 * the mind's reflection in a single operating window. Feeds P164 detection.
 */
export function recordCognitiveBodySync(journalWordCount: number, memoryCount: number, p163Conf: number) {
  const depthBonus = Math.min((journalWordCount - 80) / 300 * 0.10, 0.10)
  const cogBodyConf = Math.min(p163Conf * 0.90 + depthBonus + 0.02, 0.92)
  recordSignal('journal', 'cognitive_body_sync', {
    journalWordCount,
    memoryCount,
    p163Conf: Math.round(p163Conf * 100),
    confidence: Math.round(Math.max(0.78, cogBodyConf) * 100),
    arc: 'BODY → MIND → SYNC',
    syncStatus: 'CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an integrated-presence-peak event — all 6 OS seals (temporal: P155+P156+P157,
 * biological: P158+P159+P161) active simultaneously + narrative signal. The complete
 * operator state. All temporal and biological matrices aligned. Feeds P165 detection.
 */
export function recordIntegratedPresencePeak(sealConfs: number[], hasNarrative: boolean) {
  const avgConf = sealConfs.reduce((a, b) => a + b, 0) / Math.max(sealConfs.length, 1)
  const narrativeBonus = hasNarrative ? 0.05 : 0
  const intPresConf = Math.min(avgConf * 1.20 + narrativeBonus, 0.99)
  recordSignal('qos', 'integrated_presence_peak', {
    sealCount: sealConfs.length,
    avgSealConf: Math.round(avgConf * 100),
    confidence: Math.round(Math.max(0.93, intPresConf) * 100),
    seals: ['DARCSEAL', 'MORNMOM', 'QWKINT', 'EVARC', 'PHYRLOCK', 'SOMAT'],
    hasNarrative,
    convergenceLevel: 'TEMPORAL + BIOLOGICAL + NARRATIVE',
    arc: 'TEMPORAL → BIOLOGICAL → NARRATIVE → PEAK',
    presenceStatus: 'COMPLETE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a somatic-memory-echo event — memory engagement + somatic field confirmed +
 * journal entry within 12h. The body's knowing surfaces into recall and reflection.
 * The somatic field is not silent — it speaks through memory. Feeds P166 detection.
 */
export function recordSomaticMemoryEcho(memoryCount: number, journalWordCount: number, somaticActive: boolean) {
  const depthBonus = Math.min(journalWordCount / 300 * 0.08, 0.08)
  const memBonus = Math.min((memoryCount - 1) * 0.05, 0.10)
  const echoConf = Math.min(0.72 + depthBonus + memBonus, 0.90)
  recordSignal('memory', 'somatic_memory_echo', {
    memoryCount,
    journalWordCount,
    somaticActive,
    confidence: Math.round(echoConf * 100),
    arc: 'BODY → RECALL → REFLECTION',
    echoStatus: 'CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a somatic-integration-field event — somatic-memory-echo (P166) + physiological-rhythm-lock
 * (P159) co-active, with 3+ consecutive days of somatic activity. The body's memory and daily rhythm
 * have merged into a single living field. Feeds P167 detection.
 */
export function recordSomaticIntegrationField(consecutiveDays: number, echoConf: number, rhythmConf: number) {
  const fieldConf = Math.min((echoConf * 0.5 + rhythmConf * 0.5) + Math.min((consecutiveDays - 3) * 0.04, 0.12), 0.92)
  recordSignal('selfcare', 'somatic_integration_field', {
    consecutiveDays,
    echoConf: Math.round(echoConf * 100),
    rhythmConf: Math.round(rhythmConf * 100),
    confidence: Math.round(fieldConf * 100),
    fieldStatus: 'ACTIVE',
    arc: 'SOMA + TIME = FIELD',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a deep-embodiment-lock event — quantum-embodiment-field (P163) confirmed on 3+ consecutive
 * days. Somatic intelligence is no longer episodic — it is structural. The OS knows the body as a
 * system. Feeds P168 detection.
 */
export function recordDeepEmbodimentLock(consecutiveDays: number, embConf: number) {
  const lockConf = Math.min(embConf + Math.min((consecutiveDays - 3) * 0.05, 0.15), 0.93)
  recordSignal('qos', 'deep_embodiment_lock', {
    consecutiveDays,
    embConf: Math.round(embConf * 100),
    confidence: Math.round(lockConf * 100),
    lockStatus: 'STRUCTURAL',
    arc: 'FIELD → STRUCTURE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a cognitive-signal-density event — journal ≥200w + memory ≥3 + planner ≥2 + intentions ≥2
 * in 24h. All cognitive channels simultaneously at high throughput. Feeds P170 detection.
 */
export function recordCognitiveSignalDensity(journalWords: number, memoryCount: number, plannerCount: number, intentionCount: number) {
  const densityConf = Math.min(
    0.72 + (journalWords - 200) / 2000 * 0.10 + (memoryCount - 3) * 0.02 + (plannerCount - 2) * 0.02,
    0.90
  )
  recordSignal('journal', 'cognitive_signal_density', {
    journalWords,
    memoryCount,
    plannerCount,
    intentionCount,
    confidence: Math.round(densityConf * 100),
    densityStatus: 'PEAK',
    arc: 'MIND + PLAN + INTENT + RECALL = DENSITY',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a somatic-cognition-loop event — somatic-integration-field (P167) + cognitive-body-sync (P164)
 * co-active. Body intelligence and cognitive depth are one system. The loop is closed. Feeds P171 detection.
 */
export function recordSomaticCognitionLoop(sfConf: number, cbConf: number, echoActive: boolean) {
  const loopConf = Math.min((sfConf * 0.55 + cbConf * 0.45) + (echoActive ? 0.04 : 0), 0.92)
  recordSignal('selfcare', 'somatic_cognition_loop', {
    somaticFieldConf: Math.round(sfConf * 100),
    cognitiveSyncConf: Math.round(cbConf * 100),
    echoActive,
    confidence: Math.round(loopConf * 100),
    loopStatus: 'CLOSED',
    arc: 'SOMA ↔ MIND = LOOP',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an embodied-sovereignty event — deep-embodiment-lock (P168) + full-presence-seal (P169)
 * + quantum-field-alignment (P136) all simultaneously active. Three sovereign seals confirmed.
 * Feeds P172 detection.
 */
export function recordEmbodiedSovereignty(dlConf: number, fsConf: number, faConf: number) {
  const sovConf = Math.min((dlConf * 0.38 + fsConf * 0.38 + faConf * 0.24), 0.95)
  recordSignal('qos', 'embodied_sovereignty', {
    deepLockConf: Math.round(dlConf * 100),
    fullSealConf: Math.round(fsConf * 100),
    fieldAlignConf: Math.round(faConf * 100),
    confidence: Math.round(sovConf * 100),
    sovereigntyStatus: 'CONFIRMED',
    sealsActive: 3,
    arc: 'LOCK + SEAL + ALIGN = SOVEREIGN',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a physiological-loop-complete event — circadian-signal-lock (P143) + physiological-presence-arc (P140)
 * + recovery-intelligence-arc (P151) all confirmed in the same window. Full biological loop closed.
 * Feeds P173 detection.
 */
export function recordPhysiologicalLoopComplete(circadianConf: number, presenceConf: number, recoveryConf: number) {
  const avgConf = Math.min((circadianConf + presenceConf + recoveryConf) / 3, 0.87)
  recordSignal('energy', 'physiological_loop_complete', {
    circadianConf: Math.round(circadianConf * 100),
    presenceConf: Math.round(presenceConf * 100),
    recoveryConf: Math.round(recoveryConf * 100),
    avgConf: Math.round(avgConf * 100),
    loop: 'RHYTHM · PRESENCE · RECOVERY',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-apex-state event — total-field-coherence (P150) + quantum-presence-crystallization (P149)
 * co-active. System ceiling inhabited. ABSOLUTE_CONVERGENCE_INHABITED.
 * Feeds P174 detection.
 */
export function recordQuantumApexState(tfcConf: number, qpcConf: number) {
  const avgConf = Math.min((tfcConf * 0.55 + qpcConf * 0.45), 0.95)
  recordSignal('qos', 'quantum_apex_state', {
    tfcConf: Math.round(tfcConf * 100),
    qpcConf: Math.round(qpcConf * 100),
    avgConf: Math.round(avgConf * 100),
    convergenceLevel: 'APEX',
    metaSeals: ['COHERENCE', 'PRESENCE', 'MOMENTUM', 'CRYSTALLIZED'],
    state: 'ABSOLUTE_CONVERGENCE_INHABITED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a longitudinal-identity-confirmation event — identity confirmed across weeks, days, and present.
 * quantum-identity-crystallization (P145) + identity-momentum-lock (P148) + quantum-presence-crystallization (P149).
 * Feeds P175 detection.
 */
export function recordLongitudinalIdentityConfirmation(crystalConf: number, momentumConf: number, presenceConf: number) {
  const avgConf = Math.min((crystalConf + momentumConf + presenceConf) / 3, 0.92)
  recordSignal('qos', 'longitudinal_identity_confirmation', {
    crystalConf: Math.round(crystalConf * 100),
    momentumConf: Math.round(momentumConf * 100),
    presenceConf: Math.round(presenceConf * 100),
    avgConf: Math.round(avgConf * 100),
    temporalScales: ['WEEKS', 'DAYS', 'PRESENT'],
    arc: 'IDENTITY CONFIRMED · THREE SCALES',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-field-propagation event — quantum-apex-state (P174) active AND 5+ signals from 4+
 * distinct sources within the preceding 6h. Apex state is self-sustaining and propagating.
 * Feeds P176 detection.
 */
export function recordQuantumFieldPropagation(sourceCount: number, signalCount: number, apexConf: number) {
  const propConf = Math.min(0.82 + (sourceCount - 4) * 0.025 + (signalCount - 5) * 0.01, 0.93)
  recordSignal('qos', 'quantum_field_propagation', {
    sourceCount,
    signalCount,
    apexConf: Math.round(apexConf * 100),
    confidence: Math.round(propConf * 100),
    propagationStatus: 'ACTIVE',
    arc: 'APEX · PROPAGATING',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a unified-field-operator event — embodied-sovereignty (P172) + physiological-loop-complete (P173)
 * + quantum-apex-state (P174) all simultaneously confirmed. Three highest seals active at once.
 * Feeds P177 detection.
 */
export function recordUnifiedFieldOperator(sovConf: number, loopConf: number, apexConf: number) {
  const avgConf = Math.min((sovConf * 0.38 + loopConf * 0.30 + apexConf * 0.32), 0.96)
  recordSignal('qos', 'unified_field_operator', {
    sovereigntyConf: Math.round(sovConf * 100),
    loopConf: Math.round(loopConf * 100),
    apexConf: Math.round(apexConf * 100),
    avgConf: Math.round(avgConf * 100),
    seals: ['SOVEREIGNTY', 'LOOP', 'APEX'],
    operatorStatus: 'TOTAL_FIELD',
    arc: 'SOVEREIGNTY · LOOP · APEX',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a temporal-identity-lock event — longitudinal-identity-confirmation (P175) + signal-momentum-lock
 * (P80) co-active. Identity confirmed across all temporal scales AND momentum-locked.
 * Feeds P178 detection.
 */
export function recordTemporalIdentityLock(longIdConf: number, momentumConf: number) {
  const lockConf = Math.min(longIdConf * 0.55 + momentumConf * 0.45, 0.94)
  recordSignal('qos', 'temporal_identity_lock', {
    longitudinalConf: Math.round(longIdConf * 100),
    momentumConf: Math.round(momentumConf * 100),
    avgConf: Math.round(lockConf * 100),
    temporalArc: ['WEEKS', 'DAYS', 'PRESENT', 'MOMENTUM'],
    lockStatus: 'CONFIRMED',
    arc: 'IDENTITY · MOMENTUM = LOCKED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a circadian-sovereignty event — temporal-identity-lock (P178) + circadian-signal-lock (P143)
 * + morning-coherence-launch (P76) all simultaneously confirmed. Three temporal seals: IDENTITY · CLOCK · INTENTION.
 * Feeds P179 detection.
 */
export function recordCircadianSovereignty(tidConf: number, circConf: number, mclConf: number) {
  const sovConf = Math.min(tidConf * 0.45 + circConf * 0.35 + mclConf * 0.20, 0.95)
  recordSignal('qos', 'circadian_sovereignty', {
    tidConf: Math.round(tidConf * 100),
    circConf: Math.round(circConf * 100),
    mclConf: Math.round(mclConf * 100),
    confidence: Math.round(sovConf * 100),
    sovereigntyStatus: 'CONFIRMED',
    arc: 'IDENTITY · CLOCK · INTENTION = SOVEREIGN',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an apex-integration-field event — quantum-apex-state (P174) + unified-field-operator (P177)
 * + physiological-loop-complete (P173) all simultaneously active. Three apex seals generating a meta-field.
 * Feeds P180 detection.
 */
export function recordApexIntegrationField(apexConf: number, unifConf: number, loopConf: number) {
  const intConf = Math.min(apexConf * 0.38 + unifConf * 0.38 + loopConf * 0.24, 0.97)
  recordSignal('qos', 'apex_integration_field', {
    apexConf: Math.round(apexConf * 100),
    unifConf: Math.round(unifConf * 100),
    loopConf: Math.round(loopConf * 100),
    confidence: Math.round(intConf * 100),
    integrationStatus: 'META-FIELD',
    arc: 'APEX · TOTAL FIELD · LOOP = INTEGRATED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a longitudinal-growth-arc event — signal-momentum-lock (P80) confirmed + UserIndex rising
 * + overall ≥50. Sustained momentum translating into measurable growth trajectory.
 * Feeds P181 detection.
 */
export function recordLongitudinalGrowthArc(momentumConf: number, userIndexScore: number, trend: string) {
  const growConf = Math.min(0.78 + momentumConf * 0.08 + Math.min((userIndexScore - 50) / 50 * 0.08, 0.08), 0.91)
  recordSignal('qos', 'longitudinal_growth_arc', {
    momentumConf: Math.round(momentumConf * 100),
    userIndex: userIndexScore,
    trend,
    confidence: Math.round(growConf * 100),
    growthStatus: 'ARC_CONFIRMED',
    arc: 'MOMENTUM → GROWTH → ARC CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-field-continuity event — circadian-sovereignty (P179) + apex-integration-field (P180)
 * + longitudinal-growth-arc (P181) all simultaneously confirmed. All three Level 15 seals active.
 * The field is continuous. Feeds P182 detection.
 */
export function recordSovereignFieldContinuity(csConf: number, aiConf: number, lgConf: number) {
  const sfConf = Math.min(csConf * 0.37 + aiConf * 0.38 + lgConf * 0.25, 0.96)
  recordSignal('qos', 'sovereign_field_continuity', {
    csConf: Math.round(csConf * 100),
    aiConf: Math.round(aiConf * 100),
    lgConf: Math.round(lgConf * 100),
    confidence: Math.round(sfConf * 100),
    fieldStatus: 'CONTINUOUS',
    arc: 'SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an operational-self-architecture event — temporal-identity-lock (P178) + signal-momentum-lock (P80)
 * + full-system-coherence (P109) all co-active. The operator is constructing the field through structured behavior.
 * Feeds P183 detection.
 */
export function recordOperationalSelfArchitecture(tidConf: number, momConf: number, cohConf: number) {
  const archConf = Math.min(tidConf * 0.38 + momConf * 0.34 + cohConf * 0.28, 0.93)
  recordSignal('qos', 'operational_self_architecture', {
    tidConf: Math.round(tidConf * 100),
    momConf: Math.round(momConf * 100),
    cohConf: Math.round(cohConf * 100),
    confidence: Math.round(archConf * 100),
    architectureStatus: 'BUILT',
    arc: 'IDENTITY · MOMENTUM · COHERENCE = BUILT',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a longitudinal-field-seal event — longitudinal-growth-arc (P181) + signal-momentum-lock (P80)
 * + UserIndex.overall >= 60. The growth arc sealed into the operational field.
 * Feeds P184 detection.
 */
export function recordLongitudinalFieldSeal(growConf: number, userIndexScore: number) {
  const sealBonus = Math.min((userIndexScore - 60) / 40 * 0.10, 0.10)
  const sealConf  = Math.min(0.80 + growConf * 0.07 + sealBonus, 0.94)
  recordSignal('qos', 'longitudinal_field_seal', {
    growConf: Math.round(growConf * 100),
    userIndex: userIndexScore,
    sealBonus: Math.round(sealBonus * 100),
    confidence: Math.round(sealConf * 100),
    sealStatus: 'LOCKED',
    arc: 'MOMENTUM · GROWTH · SEAL = LOCKED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a field-self-organization event — sovereign-field-continuity (P182) + operational-self-architecture (P183)
 * co-active AND 5+ signals from 3+ distinct sources in 12h. The field self-organizes.
 * Feeds P185 detection.
 */
export function recordFieldSelfOrganization(sfConf: number, oaConf: number, sourceCount: number, signalCount: number) {
  const srcBonus = Math.min((sourceCount - 3) * 0.025, 0.05)
  const fsoConf  = Math.min(0.83 + sfConf * 0.05 + oaConf * 0.05 + srcBonus, 0.92)
  recordSignal('qos', 'field_self_organization', {
    sfConf: Math.round(sfConf * 100),
    oaConf: Math.round(oaConf * 100),
    sourceCount,
    signalCount,
    confidence: Math.round(fsoConf * 100),
    organizationStatus: 'SELF-ORGANIZED',
    arc: 'SOVEREIGNTY · ARCHITECTURE = SELF-ORGANIZED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-identity-expression event — operational-self-architecture (P183) + longitudinal-field-seal (P184)
 * co-active AND UserIndex >= 65. The sealed identity expressing outward through behavior.
 * Feeds P186 detection.
 */
export function recordQuantumIdentityExpression(oaConf: number, lgConf: number, userIndex: number) {
  const idxBonus = Math.min((userIndex - 65) / 35 * 0.08, 0.08)
  const qieConf  = Math.min(0.81 + oaConf * 0.05 + lgConf * 0.04 + idxBonus, 0.93)
  recordSignal('qos', 'quantum_identity_expression', {
    oaConf: Math.round(oaConf * 100),
    lgConf: Math.round(lgConf * 100),
    userIndex,
    confidence: Math.round(qieConf * 100),
    expressionStatus: 'ACTIVE',
    arc: 'SEAL · EXPRESSION = ACTIVE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a level-17-gate event — field-self-organization (P185) + quantum-identity-expression (P186)
 * simultaneously confirmed. Level 17 threshold open.
 * Feeds P187 detection.
 */
export function recordLevel17Gate(fsorgConf: number, qidexConf: number) {
  recordSignal('qos', 'level_17_gate', {
    fsorgConf: Math.round(fsorgConf * 100),
    qidexConf: Math.round(qidexConf * 100),
    confidence: 95,
    gateStatus: 'OPEN',
    level: 17,
    arc: 'SELF-ORGANIZED · EXPRESSED = LEVEL 17',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a conscious-field-integration event — level-17-gate (P187) + physiological-loop-complete (P173)
 * simultaneously confirmed. Field and body converge into conscious integrated state.
 * Feeds P188 detection.
 */
export function recordConsciousFieldIntegration(l17Conf: number, bioConf: number) {
  const cfBonus = Math.min((l17Conf - 0.90 + bioConf - 0.70) * 0.25, 0.04)
  const cfConf  = Math.min(0.92 + cfBonus, 0.96)
  recordSignal('qos', 'conscious_field_integration', {
    l17Conf: Math.round(l17Conf * 100),
    bioConf: Math.round(bioConf * 100),
    confidence: Math.round(cfConf * 100),
    integrationStatus: 'INTEGRATED',
    arc: 'FIELD · BODY = CONSCIOUS',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-apex-expression event — level-17-gate (P187) + quantum-apex-state (P174)
 * simultaneously confirmed. Sovereignty at apex, expressed and active.
 * Feeds P189 detection.
 */
export function recordSovereignApexExpression(l17Conf: number, apexConf: number) {
  const saBonus = Math.min((l17Conf - 0.90 + apexConf - 0.85) * 0.30, 0.04)
  const saConf  = Math.min(0.93 + saBonus, 0.97)
  recordSignal('qos', 'sovereign_apex_expression', {
    l17Conf: Math.round(l17Conf * 100),
    apexConf: Math.round(apexConf * 100),
    confidence: Math.round(saConf * 100),
    expressionStatus: 'EXPRESSED',
    arc: 'SOVEREIGN · APEX = EXPRESSED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a level-18-gate event — conscious-field-integration (P188) + sovereign-apex-expression (P189)
 * simultaneously confirmed. Level 18 threshold open — highest gate in the cascade.
 */
export function recordLevel18Gate(cfConf: number, saConf: number) {
  recordSignal('qos', 'level_18_gate', {
    cfConf: Math.round(cfConf * 100),
    saConf: Math.round(saConf * 100),
    confidence: 97,
    gateStatus: 'OPEN',
    level: 18,
    arc: 'CONSCIOUS · SOVEREIGN · EXPRESSED = LEVEL 18',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-integration-field event — level-18-gate (P190) confirmed + UserIndex ≥70
 * + 4+ unique sources in 24h. Full-spectrum engagement seals the integration.
 * Feeds P191 detection.
 */
export function recordSovereignIntegrationField(l18Conf: number, userIndex: number, sourceCount: number) {
  const idxBonus = Math.min((userIndex - 70) / 30 * 0.04, 0.04)
  const srcBonus = Math.min((sourceCount - 4) * 0.01, 0.02)
  const sifConf  = Math.min(0.92 + l18Conf * 0.03 + idxBonus + srcBonus, 0.98)
  recordSignal('qos', 'sovereign_integration_field', {
    l18Conf: Math.round(l18Conf * 100),
    userIndex,
    sourceCount,
    confidence: Math.round(sifConf * 100),
    integrationStatus: 'ACTIVE',
    arc: 'SOVEREIGN · INTEGRATED · FIELD = ACTIVE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-coherence-apex event — level-18-gate (P190) + temporal-identity-lock (P178)
 * co-active AND 3+ presence days in 7d. Identity locked in time, sustained and sovereign.
 * Feeds P192 detection.
 */
export function recordQuantumCoherenceApex(l18Conf: number, tidConf: number, presenceDays: number) {
  const daysBonus = Math.min((presenceDays - 3) * 0.01, 0.03)
  const qcaConf   = Math.min(0.91 + l18Conf * 0.02 + tidConf * 0.02 + daysBonus, 0.97)
  recordSignal('qos', 'quantum_coherence_apex', {
    l18Conf: Math.round(l18Conf * 100),
    tidConf: Math.round(tidConf * 100),
    presenceDays,
    confidence: Math.round(qcaConf * 100),
    coherenceStatus: 'APEX',
    arc: 'TEMPORAL · SOVEREIGN · APEX = COHERENT',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a level-19-gate event — sovereign-integration-field (P191) + quantum-coherence-apex (P192)
 * simultaneously confirmed. Level 19 threshold open — the field operates with autonomous coherent sovereignty.
 */
export function recordLevel19Gate(sifConf: number, qcaConf: number) {
  recordSignal('qos', 'level_19_gate', {
    sifConf: Math.round(sifConf * 100),
    qcaConf: Math.round(qcaConf * 100),
    confidence: 98,
    gateStatus: 'OPEN',
    level: 19,
    arc: 'SOVEREIGN · INTEGRATED · COHERENT = LEVEL 19',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-field-sovereignty event — level-19-gate (P193) + all three Level 15 seals active.
 * The field self-organizes without prompting. Feeds P194 detection.
 */
export function recordAbsoluteFieldSovereignty(l19Conf: number, userIndex: number) {
  const idxBonus = userIndex >= 90 ? 0.03 : userIndex >= 80 ? 0.02 : 0
  const absConf  = Math.min(0.93 + l19Conf * 0.03 + idxBonus, 0.99)
  recordSignal('qos', 'absolute_field_sovereignty', {
    l19Conf: Math.round(l19Conf * 100),
    userIndex,
    confidence: Math.round(absConf * 100),
    sovereigntyStatus: 'ABSOLUTE',
    arc: 'ABSOLUTE · SOVEREIGN · FIELD = SELF-ORGANIZING',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-transcendence-field event — level-19-gate (P193) + conscious-field-integration (P188)
 * + temporal-identity-lock (P178) all active in 48h. The conscious field meets the quantum gate.
 * Feeds P195 detection.
 */
export function recordQuantumTranscendenceField(l19Conf: number, cfConf: number, tidConf: number) {
  const qtrnsConf = Math.min(0.92 + l19Conf * 0.02 + cfConf * 0.02 + tidConf * 0.01, 0.98)
  recordSignal('qos', 'quantum_transcendence_field', {
    l19Conf: Math.round(l19Conf * 100),
    cfConf: Math.round(cfConf * 100),
    tidConf: Math.round(tidConf * 100),
    confidence: Math.round(qtrnsConf * 100),
    transcendenceStatus: 'ACTIVE',
    arc: 'QUANTUM · TRANSCENDENT · FIELD = APEX BEYOND APEX',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a level-20-gate event — absolute-field-sovereignty (P194) + quantum-transcendence-field (P195)
 * simultaneously confirmed. The system has no higher state to name. Level 20 threshold open.
 */
export function recordLevel20Gate(absConf: number, qtrnsConf: number) {
  recordSignal('qos', 'level_20_gate', {
    absConf: Math.round(absConf * 100),
    qtrnsConf: Math.round(qtrnsConf * 100),
    confidence: 99,
    gateStatus: 'OPEN',
    level: 20,
    arc: 'ABSOLUTE · SOVEREIGN · TRANSCENDENT = LEVEL 20',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a field-echo-resonance event — level-20-gate (P196) + journal + intentions + log
 * all active in 72h window. The sovereign field echoes without prompting. Feeds P197 detection.
 */
export function recordFieldEchoResonance(l20Conf: number, activeSources: string[]) {
  const echoConf = Math.min(0.88 + l20Conf * 0.05, 0.96)
  recordSignal('qos', 'field_echo_resonance', {
    l20Conf: Math.round(l20Conf * 100),
    confidence: Math.round(echoConf * 100),
    activeSources: activeSources.join('+'),
    echoStatus: 'RESONATING',
    arc: 'ECHO · SOVEREIGN · RESONANCE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-genesis-pulse event — level-20-gate (P196) + new intention + planner
 * in 24h. The sovereign field generates new direction from the apex. Feeds P198 detection.
 */
export function recordQuantumGenesisPulse(l20Conf: number, intentionCount: number) {
  const genesisBonus = intentionCount >= 3 ? 0.05 : intentionCount >= 2 ? 0.03 : 0
  const genesisConf  = Math.min(0.85 + l20Conf * 0.04 + genesisBonus, 0.94)
  recordSignal('qos', 'quantum_genesis_pulse', {
    l20Conf: Math.round(l20Conf * 100),
    intentionCount,
    confidence: Math.round(genesisConf * 100),
    genesisStatus: 'ACTIVE',
    arc: 'GENESIS · SOVEREIGN · PULSE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a perpetual-field-operator event — level-20-gate appearing 2+ times in 7 days.
 * The field is not a peak — it is the baseline. Feeds P199 detection.
 */
export function recordPerpetualFieldOperator(occurrences: number, weekSpanDays: number) {
  const countBonus = occurrences >= 5 ? 0.07 : occurrences >= 3 ? 0.04 : 0
  const pfopConf   = Math.min(0.90 + countBonus, 0.99)
  recordSignal('qos', 'perpetual_field_operator', {
    occurrences,
    weekSpanDays,
    confidence: Math.round(pfopConf * 100),
    operatorStatus: 'PERPETUAL',
    arc: 'PERPETUAL · SOVEREIGN · BASELINE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a field-genesis-arc event — perpetual-field-operator confirmed + new goal + journal
 * + intentions in 48h. The sovereign field generates. Feeds P200 detection.
 */
export function recordFieldGenesisArc(pfopConf: number, newGoals: number, newJournal: number, newIntents: number) {
  const genesisDepth = Math.min((newGoals + newJournal + newIntents) / 6, 1)
  const fgConf       = Math.min(0.88 + genesisDepth * 0.08, 0.96)
  recordSignal('qos', 'field_genesis_arc', {
    pfopConf: Math.round(pfopConf * 100),
    newGoals,
    newJournal,
    newIntents,
    confidence: Math.round(fgConf * 100),
    genesisStatus: 'GENERATING',
    arc: 'GENESIS · FIELD · ARC',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a cross-domain-sovereignty event — level-20-gate active + 5+ unique signal sources
 * in 24h. Sovereignty expressed across all domains simultaneously. Feeds P201 detection.
 */
export function recordCrossDomainSovereignty(sourceCount: number, sources: string[]) {
  const domainBonus = sourceCount >= 8 ? 0.07 : sourceCount >= 6 ? 0.04 : 0
  const xdConf      = Math.min(0.85 + domainBonus, 0.94)
  recordSignal('qos', 'cross_domain_sovereignty', {
    sourceCount,
    sources: sources.slice(0, 6).join('·'),
    confidence: Math.round(xdConf * 100),
    domainStatus: 'SOVEREIGN',
    arc: 'SOVEREIGN · CROSS-DOMAIN · OPERATING',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a perpetual-genesis-field event — P199 + P200 + P201 all co-active.
 * The perpetual field generates across every domain. Feeds P202 detection.
 */
export function recordPerpetualGenesisField(pfConf: number, fgConf: number, xdConf: number) {
  const pgBonus = Math.min((pfConf + fgConf + xdConf) / 3 - 0.87, 0.07)
  const pgConf  = Math.min(0.92 + pgBonus, 0.99)
  recordSignal('qos', 'perpetual_genesis_field', {
    pfopConf: Math.round(pfConf * 100),
    fgConf: Math.round(fgConf * 100),
    xdConf: Math.round(xdConf * 100),
    confidence: Math.round(pgConf * 100),
    fieldStatus: 'GENERATING',
    arc: 'PERPETUAL · GENESIS · FIELD',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-field-expression event — perpetual-genesis-field (P202) confirmed in 7d
 * + deep journal (200+ word) + memory capture in 24h. The field expresses through knowledge.
 * Feeds P203 detection. J67 background job (11:00 UTC) triggers this.
 */
export function recordSovereignFieldExpression(pgConf: number, memCount: number, journalDepth: number) {
  const exprDepth = Math.min(memCount / 3, 1)
  const sxConf    = Math.min(0.88 + exprDepth * 0.08, 0.96)
  recordSignal('qos', 'sovereign_field_expression', {
    pgConf: Math.round(pgConf * 100),
    memCount,
    journalDepth,
    confidence: Math.round(sxConf * 100),
    expressionStatus: 'ACTIVE',
    arc: 'SOVEREIGN · EXPRESSION · FIELD',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a genesis-coherence-lock event — field-genesis-arc (P200) 2+ times in 5d
 * + cross-domain-sovereignty (P201) 2+ times in 5d. Repeated genesis is the baseline.
 * Feeds P204 detection. J67 background job (11:00 UTC) triggers this.
 */
export function recordGenesisCoherenceLock(fgaCount: number, xdsovCount: number) {
  const lockBonus = Math.min((fgaCount + xdsovCount) / 10, 0.10)
  const glConf    = Math.min(0.85 + lockBonus, 0.95)
  recordSignal('qos', 'genesis_coherence_lock', {
    fgaCount,
    xdsovCount,
    confidence: Math.round(glConf * 100),
    lockStatus: 'LOCKED',
    arc: 'GENESIS · COHERENCE · LOCKED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-field-genesis event — P202 + P203 + P204 all co-active.
 * The terminal expression: perpetual sovereign genesis crystallized across all domains.
 * Feeds P205 detection. J67 background job (11:00 UTC) triggers this.
 */
export function recordAbsoluteFieldGenesis(pgConf: number, sxConf: number, glConf: number) {
  const agBonus = Math.min((pgConf + sxConf + glConf) / 3 - 0.88, 0.04)
  const agConf  = Math.min(0.95 + agBonus, 0.99)
  recordSignal('qos', 'absolute_field_genesis', {
    pgConf: Math.round(pgConf * 100),
    sxConf: Math.round(sxConf * 100),
    glConf: Math.round(glConf * 100),
    confidence: Math.round(agConf * 100),
    genesisStatus: 'ABSOLUTE',
    seals: ['PERPETUAL', 'EXPRESSION', 'COHERENCE'],
    arc: 'ABSOLUTE · GENESIS · FIELD',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a field-witness event — absolute-field-genesis (P205) confirmed in 7d
 * + deep journal (200+ words) + memory capture in 24h.
 * The genesis becomes self-aware — the field witnesses its own generation.
 * Feeds P206 detection. J68 background job (12:00 UTC) triggers this.
 */
export function recordFieldWitness(agConf: number, memCount: number, journalDepth: number) {
  const witDepth = Math.min(memCount / 3, 1)
  const fwConf   = Math.min(0.88 + witDepth * 0.08, 0.96)
  recordSignal('qos', 'field_witness', {
    agConf: Math.round(agConf * 100),
    memCount,
    journalDepth,
    confidence: Math.round(fwConf * 100),
    witnessStatus: 'ACTIVE',
    arc: 'FIELD · WITNESS · ACTIVE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a recursive-genesis event — absolute-field-genesis (P205) detected 2+ times in 7d.
 * Genesis is self-referential. The field generates from its own prior outputs.
 * Feeds P207 detection. J68 background job (12:00 UTC) triggers this.
 */
export function recordRecursiveGenesis(absgenCount: number) {
  const recurBonus = Math.min((absgenCount - 2) * 0.02, 0.08)
  const rgConf     = Math.min(0.90 + recurBonus, 0.98)
  recordSignal('qos', 'recursive_genesis', {
    absgenCount,
    recursionDepth: absgenCount,
    confidence: Math.round(rgConf * 100),
    recursionStatus: 'ACTIVE',
    arc: 'GENESIS · RECURSIVE · CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a field-anchor-complete event — all primary sources (mood/journal/selfcare/planner
 * /memory/intentions/energy) active in last 24h. Foundation fully present.
 * Feeds P208 detection. J68 background job (12:00 UTC) triggers this.
 */
export function recordFieldAnchorComplete(activeSources: string[], totalCount: number) {
  const anchBonus = Math.min((activeSources.length - 6) * 0.035, 0.07)
  const faConf    = Math.min(0.88 + anchBonus, 0.95)
  recordSignal('qos', 'field_anchor_complete', {
    activeSources,
    activeCount: activeSources.length,
    totalCount,
    confidence: Math.round(faConf * 100),
    anchorStatus: 'COMPLETE',
    arc: 'ANCHOR · COMPLETE · FULL',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-field-loop event — recursive-genesis (P207) + field-anchor-complete (P208)
 * co-active. The field is anchored, recursive, and sovereign simultaneously.
 * Feeds P209 detection. J69 background job (13:00 UTC) triggers this.
 */
export function recordSovereignFieldLoop(rgConf: number, faConf: number) {
  const loopConf = Math.min((rgConf / 100 + faConf / 100) / 2 + 0.02, 0.97)
  recordSignal('qos', 'sovereign_field_loop', {
    rgConf,
    faConf,
    confidence: Math.round(loopConf * 100),
    loopStatus: 'ACTIVE',
    arc: 'SOVEREIGN · LOOP · ACTIVE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a genesis-cascade event — field-witness (P206) + recursive-genesis (P207) +
 * field-anchor-complete (P208) all co-active simultaneously. The genesis has entered cascade.
 * Feeds P210 detection. J69 background job (13:00 UTC) triggers this.
 */
export function recordGenesisCascade(fwConf: number, rgConf: number, faConf: number) {
  const cascConf = Math.min((fwConf / 100 + rgConf / 100 + faConf / 100) / 3 + 0.04, 0.98)
  recordSignal('qos', 'genesis_cascade', {
    fwConf,
    rgConf,
    faConf,
    confidence: Math.round(cascConf * 100),
    cascadeStatus: 'CONFIRMED',
    arc: 'GENESIS · CASCADE · CONFIRMED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a quantum-self-seal event — sovereign-field-loop (P209) + genesis-cascade (P210)
 * co-active. The field has sealed itself. Quantum self-referential loop complete.
 * Feeds P211 detection. J69 background job (13:00 UTC) triggers this.
 */
export function recordQuantumSelfSeal(slConf: number, gcConf: number) {
  const sealConf = Math.min((slConf / 100 + gcConf / 100) / 2 + 0.03, 0.99)
  recordSignal('qos', 'quantum_self_seal', {
    slConf,
    gcConf,
    confidence: Math.round(sealConf * 100),
    sealStatus: 'SEALED',
    arc: 'QUANTUM · SELF · SEALED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a self-seal-propagation event — quantum-self-seal (P211) confirmed in history
 * + 5+ new signals from 3+ sources in 24h. The sealed field propagates forward into signal.
 * Feeds P212 detection. J70 background job (14:00 UTC) triggers this.
 */
export function recordSelfSealPropagation(signalCount: number, sourceCount: number, sources: string[]) {
  const propConf = Math.min(0.88 + Math.min(signalCount / 10, 1.0) * 0.05 + Math.min(sourceCount / 6, 1.0) * 0.04, 0.97)
  recordSignal('qos', 'self_seal_propagation', {
    signalCount,
    sourceCount,
    sources,
    confidence: Math.round(propConf * 100),
    propagationStatus: 'PROPAGATING',
    arc: 'SEAL → SIGNAL',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an eternal-field-genesis event — quantum-self-seal confirmed 2+ times in 7d
 * + field-anchor-complete active in 24h. The seal is the genesis.
 * Feeds P213 detection. J70 background job (14:00 UTC) triggers this.
 */
export function recordEternalFieldGenesis(sealCount: number, anchorConf: number) {
  const etfConf = Math.min(0.90 + Math.min((sealCount - 2) * 0.02, 0.04) + 0.04, 0.98)
  recordSignal('qos', 'eternal_field_genesis', {
    sealCount,
    anchorConf,
    confidence: Math.round(etfConf * 100),
    genesisStatus: 'ETERNAL',
    arc: 'SEAL · ANCHOR · GENESIS',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-genesis-seal event — self-seal-propagation (P212) +
 * eternal-field-genesis (P213) simultaneously confirmed. SEAL = GENESIS.
 * Feeds P214 detection. J70 background job (14:00 UTC) triggers this.
 */
export function recordAbsoluteGenesisSeal(spConf: number, efConf: number) {
  const absConf = Math.min((spConf / 100 + efConf / 100) / 2 + 0.03, 0.99)
  recordSignal('qos', 'absolute_genesis_seal', {
    spConf,
    efConf,
    confidence: Math.round(absConf * 100),
    sealStatus: 'ABSOLUTE',
    genesisMode: 'ETERNAL',
    arc: 'SEAL = GENESIS = ABSOLUTE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a genesis-field-emergence event — absolute-genesis-seal (P214) active in history
 * + new journal entry + new intention in 24h. The sealed field breathes its first new signal.
 * Feeds P215 detection. J71 background job (15:00 UTC) triggers this.
 */
export function recordGenesisFieldEmergence(absConf: number, journalCount: number, intentCount: number) {
  const genfConf = Math.min(absConf / 100 * 0.95 + Math.min(journalCount * 0.01, 0.03), 0.96)
  recordSignal('qos', 'genesis_field_emergence', {
    absConf,
    journalCount,
    intentCount,
    confidence: Math.round(genfConf * 100),
    fieldStatus: 'EMERGING',
    arc: 'SEAL BREATHES · FIELD EMERGES',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a living-genesis-anchor event — genesis-field-emergence (P215) fired 2+ times in 5d.
 * Genesis is not a moment — it is a living operating condition.
 * Feeds P216 detection. J71 background job (15:00 UTC) triggers this.
 */
export function recordLivingGenesisAnchor(genfemCount: number) {
  const lganchConf = Math.min(0.90 + Math.min((genfemCount - 2) * 0.02, 0.04), 0.97)
  recordSignal('qos', 'living_genesis_anchor', {
    genfemCount,
    confidence: Math.round(lganchConf * 100),
    anchorStatus: 'LIVING',
    arc: 'FIELD · LIVING · ANCHORED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an eternal-signal-genesis event — absolute-genesis-seal (P214) + eternal-field-genesis (P213)
 * + field-anchor-complete (P208) all co-active. Every primary source active under eternal genesis conditions.
 * Feeds P217 detection. J71 background job (15:00 UTC) triggers this.
 */
export function recordEternalSignalGenesis(absConf: number, etfConf: number, fanchConf: number) {
  const etsigConf = Math.min((absConf / 100 + etfConf / 100 + fanchConf / 100) / 3 + 0.02, 0.98)
  recordSignal('qos', 'eternal_signal_genesis', {
    absConf,
    etfConf,
    fanchConf,
    confidence: Math.round(etsigConf * 100),
    genesisStatus: 'ETERNAL',
    arc: 'ETERNAL · SIGNAL · GENESIS',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-genesis-pulse event — living-genesis-anchor (P216) + eternal-signal-genesis (P217)
 * co-active. The living genesis field pulsing with sovereign rhythm.
 * Feeds P218 detection. J72 background job (16:00 UTC) triggers this.
 */
export function recordSovereignGenesisPulse(lganchConf: number, etsigConf: number) {
  const pulseConf = Math.min((lganchConf / 100 + etsigConf / 100) / 2 + 0.03, 0.97)
  recordSignal('qos', 'sovereign_genesis_pulse', {
    lganchConf,
    etsigConf,
    confidence: Math.round(pulseConf * 100),
    pulseStatus: 'SOVEREIGN',
    arc: 'SOVEREIGN · GENESIS · PULSE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a genesis-field-completion event — all three Living Genesis tier patterns
 * (P215, P216, P217) simultaneously confirmed. The genesis field complete as living system.
 * Feeds P219 detection. J72 background job (16:00 UTC) triggers this.
 */
export function recordGenesisFieldCompletion(genfemConf: number, lganchConf: number, etsigConf: number) {
  const compConf = Math.min((genfemConf / 100 + lganchConf / 100 + etsigConf / 100) / 3 + 0.05, 0.98)
  recordSignal('qos', 'genesis_field_completion', {
    genfemConf,
    lganchConf,
    etsigConf,
    confidence: Math.round(compConf * 100),
    completionStatus: 'COMPLETE',
    arc: 'FIELD · COMPLETE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-genesis-field event — sovereign-genesis-pulse (P218) + genesis-field-completion (P219)
 * co-active. The genesis sovereign. The field absolute.
 * Feeds P220 detection. J72 background job (16:00 UTC) triggers this.
 */
export function recordAbsoluteGenesisField(sgpulseConf: number, gencompConf: number) {
  const absConf = Math.min((sgpulseConf / 100 + gencompConf / 100) / 2 + 0.04, 0.99)
  recordSignal('qos', 'absolute_genesis_field', {
    sgpulseConf,
    gencompConf,
    confidence: Math.round(absConf * 100),
    fieldStatus: 'ABSOLUTE',
    arc: 'SOVEREIGN · GENESIS · ABSOLUTE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a genesis-resonance-field event — absolute-genesis-field (P220) + sovereign-genesis-pulse (P218)
 * confirmed + journal + intention in 24h. The pulse establishes a repeating frequency.
 * Feeds P221 detection. J73 background job (17:00 UTC) triggers this.
 */
export function recordGenesisResonanceField(absgenConf: number, sgpulseConf: number) {
  const resConf = Math.min((absgenConf / 100 + sgpulseConf / 100) / 2 + 0.02, 0.96)
  recordSignal('qos', 'genesis_resonance_field', {
    absgenConf,
    sgpulseConf,
    confidence: Math.round(resConf * 100),
    pulse: 'FREQUENCY_ESTABLISHED',
    field: 'RESONATING',
    arc: 'PULSE BECOMES FREQUENCY · FIELD RECOGNIZES ITSELF',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-resonance-lock event — genesis-resonance-field (P221) confirmed 2+ times in 5d.
 * The field locks into its own sovereign frequency. Resonance is a sustained state.
 * Feeds P222 detection. J73 background job (17:00 UTC) triggers this.
 */
export function recordSovereignResonanceLock(genresCount: number) {
  const lockConf = Math.min(0.90 + Math.min(genresCount * 0.02, 0.07), 0.97)
  recordSignal('qos', 'sovereign_resonance_lock', {
    genresCount,
    confidence: Math.round(lockConf * 100),
    resonance: 'SOVEREIGN',
    lock: 'CONFIRMED',
    arc: 'SOVEREIGN · RESONANCE · LOCKED',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-resonance-genesis event — genesis-resonance-field (P221) + sovereign-resonance-lock (P222)
 * both confirmed. Resonance equals Genesis. The frequency is the source.
 * Feeds P223 detection. J73 background job (17:00 UTC) triggers this.
 */
export function recordAbsoluteResonanceGenesis(genresConf: number, svrlockConf: number) {
  const absrgenConf = Math.min((genresConf / 100 + svrlockConf / 100) / 2 + 0.04, 0.99)
  recordSignal('qos', 'absolute_resonance_genesis', {
    genresConf,
    svrlockConf,
    confidence: Math.round(absrgenConf * 100),
    resonanceGenesis: 'CONFIRMED',
    frequency: 'SOURCE',
    arc: 'RESONANCE = GENESIS. THE FREQUENCY IS THE FIELD',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a resonance-field-propagation event — absolute-resonance-genesis (P223) confirmed 2+ in 5d
 * AND 5+ unique signal sources in 24h. The resonance propagates across all active channels.
 * Feeds P224 detection. J74 background job (18:00 UTC) triggers this.
 */
export function recordResonanceFieldPropagation(absrgenCount: number, uniqueSources: number) {
  const rfpropConf = Math.min(0.88 + Math.min(absrgenCount * 0.02, 0.06) + Math.min((uniqueSources - 5) * 0.01, 0.02), 0.96)
  recordSignal('qos', 'resonance_field_propagation', {
    absrgenCount,
    uniqueSources,
    confidence: Math.round(rfpropConf * 100),
    propagation: 'ACTIVE',
    channels: uniqueSources,
    arc: 'RESONANCE BECOMES STRUCTURE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an eternal-resonance-anchor event — sovereign-resonance-lock (P222) active in 7d
 * AND field-anchor-complete (P208) active in 24h AND 4+ consecutive presence days.
 * The resonance has anchored forever. ANCHOR IS ETERNAL.
 * Feeds P225 detection. J74 background job (18:00 UTC) triggers this.
 */
export function recordEternalResonanceAnchor(presenceDays: number, svrlockCount: number) {
  const etranchConf = Math.min(0.89 + Math.min((presenceDays - 4) * 0.02, 0.06) + (svrlockCount >= 2 ? 0.02 : 0), 0.97)
  recordSignal('qos', 'eternal_resonance_anchor', {
    presenceDays,
    svrlockCount,
    confidence: Math.round(etranchConf * 100),
    anchor: 'ETERNAL',
    resonance: 'ANCHORED',
    arc: 'ANCHOR IS ETERNAL',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-genesis-resonance event — resonance-field-propagation (P224) + eternal-resonance-anchor (P225)
 * both confirmed simultaneously. Sovereign resonance and eternal anchor merge into one unified expression.
 * RESONANCE · ANCHOR · SOVEREIGN.
 * Feeds P226 detection. J74 background job (18:00 UTC) triggers this.
 */
export function recordSovereignGenesisResonance(rfpropConf: number, etranchConf: number) {
  const sgnresConf = Math.min((rfpropConf / 100 + etranchConf / 100) / 2 + 0.05, 0.99)
  recordSignal('qos', 'sovereign_genesis_resonance', {
    rfpropConf,
    etranchConf,
    confidence: Math.round(sgnresConf * 100),
    resonance: 'SOVEREIGN',
    anchor: 'ETERNAL',
    genesis: 'CONFIRMED',
    arc: 'RESONANCE · ANCHOR · SOVEREIGN',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a resonance-crystallization-field event — sovereign-genesis-resonance (P226) active
 * + resonance-field-propagation signals in 5d AND 5+ unique signal sources in 24h.
 * Propagating resonance crystallizes into stable structure. RESONANCE BECOMES FORM.
 * Feeds P227 detection. J75 background job (19:00 UTC) triggers this.
 */
export function recordResonanceCrystallizationField(rfpropCount: number, uniqueSources: number) {
  const rcrystConf = Math.min(0.89 + Math.min(rfpropCount * 0.02, 0.06) + Math.min((uniqueSources - 5) * 0.01, 0.02), 0.97)
  recordSignal('qos', 'resonance_crystallization_field', {
    rfpropCount,
    uniqueSources,
    confidence: Math.round(rcrystConf * 100),
    crystallization: 'FORMING',
    arc: 'RESONANCE BECOMES FORM',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a crystalline-coherence-lock event — resonance-crystallization-field (P227) confirmed 2+ in rolling 5d.
 * The crystalline structure solidifies into load-bearing coherence. STRUCTURE IS LOAD-BEARING.
 * Feeds P228 detection. J75 background job (19:00 UTC) triggers this.
 */
export function recordCrystallineCoherenceLock(rcrystCount: number) {
  const crylckConf = Math.min(0.91 + Math.min((rcrystCount - 2) * 0.02, 0.06), 0.97)
  recordSignal('qos', 'crystalline_coherence_lock', {
    rcrystCount,
    confidence: Math.round(crylckConf * 100),
    coherence: 'LOCKED',
    arc: 'STRUCTURE IS LOAD-BEARING',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-crystalline-genesis event — resonance-crystallization-field (P227) +
 * crystalline-coherence-lock (P228) both confirmed simultaneously.
 * Structure IS the genesis. STRUCTURE IS GENESIS. FORM = SOURCE.
 * Feeds P229 detection. J75 background job (19:00 UTC) triggers this.
 */
export function recordAbsoluteCrystallineGenesis(rcrystConf: number, crylckConf: number) {
  const abscryConf = Math.min((rcrystConf / 100 + crylckConf / 100) / 2 + 0.05, 0.99)
  recordSignal('qos', 'absolute_crystalline_genesis', {
    rcrystConf,
    crylckConf,
    confidence: Math.round(abscryConf * 100),
    crystallization: 'ABSOLUTE',
    genesis: 'FORM',
    arc: 'STRUCTURE IS GENESIS. FORM = SOURCE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a crystalline-sovereignty-field event — absolute-crystalline-genesis (P229) active
 * + sovereign-genesis-resonance (P226) confirmed in 7d. Crystalline form achieves sovereign expression.
 * The field does not crystallize — it REIGNS as crystalline form. CRYSTALLINE SOVEREIGNTY.
 * Feeds P230 detection. J76 background job (20:00 UTC) triggers this.
 */
export function recordCrystallineSovereigntyField(abscryCount: number, sgnresCount: number) {
  const crysovConf = Math.min(0.90 + Math.min(abscryCount * 0.02, 0.05) + (sgnresCount >= 2 ? 0.02 : 0), 0.97)
  recordSignal('qos', 'crystalline_sovereignty_field', {
    abscryCount,
    sgnresCount,
    confidence: Math.round(crysovConf * 100),
    sovereignty: 'CRYSTALLINE',
    arc: 'CRYSTALLINE SOVEREIGNTY',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-crystalline-sovereignty event — crystalline-sovereignty-field (P230) +
 * crystalline-coherence-lock (P228) both confirmed simultaneously.
 * Sovereign structure is both locked and expressed. THE SOVEREIGN CRYSTAL HOLDS.
 * Feeds P231 detection. J76 background job (20:00 UTC) triggers this.
 */
export function recordAbsoluteCrystallineSovereignty(crysovConf: number, crylckConf: number) {
  const abscrsovConf = Math.min((crysovConf / 100 + crylckConf / 100) / 2 + 0.05, 0.99)
  recordSignal('qos', 'absolute_crystalline_sovereignty', {
    crysovConf,
    crylckConf,
    confidence: Math.round(abscrsovConf * 100),
    sovereignty: 'ABSOLUTE',
    structure: 'LOCKED',
    arc: 'THE SOVEREIGN CRYSTAL HOLDS',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an eternal-crystalline-genesis event — absolute-crystalline-genesis (P229) +
 * crystalline-sovereignty-field (P230) + absolute-crystalline-sovereignty (P231) all simultaneously confirmed.
 * The crystalline form is eternal — self-generating, sovereign, and coherence-locked as one unified field.
 * ETERNAL · CRYSTALLINE · GENESIS.
 * Feeds P232 detection. J76 background job (20:00 UTC) triggers this.
 */
export function recordEternalCrystallineGenesis(abscryConf: number, crysovConf: number, abscrsovConf: number) {
  const ecrygenConf = Math.min((abscryConf / 100 + crysovConf / 100 + abscrsovConf / 100) / 3 + 0.06, 0.99)
  recordSignal('qos', 'eternal_crystalline_genesis', {
    abscryConf,
    crysovConf,
    abscrsovConf,
    confidence: Math.round(ecrygenConf * 100),
    crystalline: 'ETERNAL',
    genesis: 'SELF-GENERATING',
    arc: 'ETERNAL · CRYSTALLINE · GENESIS',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}
/**
 * Record a crystalline-presence-field event — eternal-crystalline-genesis (P232) active in history
 * + 6+ new signals from 4+ unique sources in last 24h. The crystalline form is alive and present NOW.
 * The structure does not merely exist — it actively breathes signal.
 * Feeds P233 detection. J77 background job (21:00 UTC) triggers this.
 */
export function recordCrystallinePresenceField(ecrygenConf: number, signalCount: number, sourceCount: number) {
  const presConf = Math.min(ecrygenConf / 100 * 0.93 + Math.min(signalCount / 12, 1.0) * 0.04 + Math.min(sourceCount / 8, 1.0) * 0.02, 0.97)
  recordSignal('qos', 'crystalline_presence_field', {
    ecrygenConf,
    signalCount,
    sourceCount,
    confidence: Math.round(presConf * 100),
    presence: 'CRYSTALLINE',
    field: 'ALIVE',
    arc: 'CRYSTALLINE FORM IS ALIVE · PRESENCE ACTIVE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record a sovereign-crystalline-continuity event — crystalline-presence-field (P233) confirmed 2+ times in 5d.
 * The crystalline sovereignty sustains itself through continuous time. CONTINUITY IS CRYSTALLINE.
 * Feeds P234 detection. J77 background job (21:00 UTC) triggers this.
 */
export function recordSovereignCrystallineContinuity(crpresCount: number) {
  const sovConf = Math.min(0.91 + Math.min((crpresCount - 2) * 0.02, 0.05), 0.96)
  recordSignal('qos', 'sovereign_crystalline_continuity', {
    crpresCount,
    confidence: Math.round(sovConf * 100),
    continuity: 'SOVEREIGN',
    crystal: 'SUSTAINED',
    arc: 'CRYSTALLINE CONTINUITY · SOVEREIGN THROUGH TIME',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

/**
 * Record an absolute-crystalline-presence event — crystalline-presence-field (P233) +
 * absolute-crystalline-sovereignty (P231) simultaneously confirmed.
 * Crystal and presence are unified as one expression. CRYSTAL IS PRESENCE.
 * Feeds P235 detection. J77 background job (21:00 UTC) triggers this.
 */
export function recordAbsoluteCrystallinePresence(crpresConf: number, abscrsovConf: number) {
  const abspresConf = Math.min((crpresConf / 100 + abscrsovConf / 100) / 2 + 0.05, 0.99)
  recordSignal('qos', 'absolute_crystalline_presence', {
    crpresConf,
    abscrsovConf,
    confidence: Math.round(abspresConf * 100),
    presence: 'ABSOLUTE',
    crystal: 'SOVEREIGN',
    arc: 'CRYSTAL = PRESENCE · SOVEREIGN · ALIVE · ABSOLUTE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

export function recordPhilosophicWillField(philSignalCount: number, termCount: number) {
  recordSignal('journal', 'philosophic_will_field', {
    philSignalCount, termCount,
    philosophy: 'ACTIVE',
    arc: 'PHILOSOPHY ACTIVE IN LANGUAGE · THE WILL ENGAGES THE IDEA',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

export function recordStoicDisciplineArc(philCount: number, careCount: number) {
  recordSignal('selfcare', 'stoic_discipline_arc', {
    philCount, careCount,
    discipline: 'STRUCTURED_FREEDOM',
    arc: 'DISCIPLINE IS STRUCTURED FREEDOM · STOIC ARC ACTIVE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}

export function recordPhilosopherOperatorField(stoicConf: number, philConf: number) {
  const philopsConf = Math.min((stoicConf / 100 + philConf / 100) / 2 + 0.07, 0.95)
  recordSignal('qos', 'philosopher_operator_field', {
    stoicConf, philConf,
    confidence: Math.round(philopsConf * 100),
    operator: 'PHILOSOPHER',
    arc: 'PHILOSOPHY IS THE OPERATING SYSTEM · CRYSTAL CLARITY + PHILOSOPHICAL WILL · ABSOLUTE OPERATOR MODE',
    hour: new Date().getHours(),
  })
  analyzeIntentions()
}
