/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Chakra Ergonomics Engine
 *
 * Maps session activity to the seven-chakra model for holistic
 * wellness awareness.  Each chakra's charge is derived from real
 * interaction signals already flowing through the Quantum Intention
 * Engine — keystrokes (approximated from interaction density),
 * session duration, emotional signals, planning activity, and
 * self-care engagement.
 *
 * Ergonomic recommendations emerge naturally from the chakra state:
 * a strained Throat means communication overload → rest voice/typing;
 * a depleted Solar Plexus means core tension → walk and stretch.
 *
 * Philosophy: The body is not separate from the session.
 * CQGS Bioethics recognises that posture, breath, and energy flow
 * are inseparable from digital wellbeing.
 */

import { atom } from 'nanostores'
import { intentionEngine, recordSignal, getUserState, getUserIndex } from './intentionEngine'

// ─── Types ───────────────────────────────────────────────────

export type ChakraId =
  | 'crown'
  | 'thirdEye'
  | 'throat'
  | 'heart'
  | 'solarPlexus'
  | 'sacral'
  | 'root'

export type ChakraStatus = 'blocked' | 'strained' | 'depleted' | 'balanced' | 'open' | 'overactive' | 'grounded' | 'flowing'

export type ChakraLevel = {
  id: ChakraId
  label: string
  charge: number     // 0-100
  status: ChakraStatus
  quality: string    // short descriptor tied to the status
}

export type ErgonomicRecommendation = {
  action: string
  priority: 'low' | 'medium' | 'high'
  category: 'movement' | 'hydration' | 'posture' | 'rest' | 'breath' | 'layout'
}

export type SessionMetrics = {
  startTime: number
  durationMinutes: number
  interactionCount: number   // proxy for keystrokes
  coherence: number          // 0-100
  lastUpdated: number
}

export type ChakraErgonomicsState = {
  chakras: ChakraLevel[]
  session: SessionMetrics
  recommendations: ErgonomicRecommendation[]
  layoutSuggestion: string | null
}

// ─── Constants ───────────────────────────────────────────────

const SESSION_KEY = 'chakra-session'
const STATE_KEY = 'chakra-ergonomics-state'

const CHAKRA_DEFINITIONS: Pick<ChakraLevel, 'id' | 'label'>[] = [
  { id: 'crown',      label: 'Crown' },
  { id: 'thirdEye',   label: 'Third Eye' },
  { id: 'throat',     label: 'Throat Chakra' },
  { id: 'heart',      label: 'Heart Chakra' },
  { id: 'solarPlexus', label: 'Solar Plexus' },
  { id: 'sacral',     label: 'Sacral' },
  { id: 'root',       label: 'Root' },
]

// ─── Store ───────────────────────────────────────────────────

function defaultChakras(): ChakraLevel[] {
  return CHAKRA_DEFINITIONS.map(def => ({
    ...def,
    charge: 50,
    status: 'balanced',
    quality: 'Neutral',
  }))
}

function defaultSession(): SessionMetrics {
  return {
    startTime: Date.now(),
    durationMinutes: 0,
    interactionCount: 0,
    coherence: 50,
    lastUpdated: Date.now(),
  }
}

function loadState(): ChakraErgonomicsState {
  if (typeof window === 'undefined') {
    return {
      chakras: defaultChakras(),
      session: defaultSession(),
      recommendations: [],
      layoutSuggestion: null,
    }
  }
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ChakraErgonomicsState
      // Reset session if stale (> 2 hours since last update)
      if (Date.now() - parsed.session.lastUpdated > 2 * 60 * 60 * 1000) {
        return {
          ...parsed,
          session: defaultSession(),
        }
      }
      return parsed
    }
  } catch {
    // ignore
  }
  return {
    chakras: defaultChakras(),
    session: defaultSession(),
    recommendations: [],
    layoutSuggestion: null,
  }
}

export const chakraErgonomics = atom<ChakraErgonomicsState>(loadState())

function persist(state: ChakraErgonomicsState) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

// ─── Chakra Computation ──────────────────────────────────────

function statusFromCharge(charge: number, id: ChakraId): { status: ChakraStatus; quality: string } {
  if (id === 'root') {
    if (charge >= 80) return { status: 'grounded', quality: 'Stable session base' }
    if (charge >= 50) return { status: 'balanced', quality: 'Anchored' }
    if (charge >= 30) return { status: 'strained', quality: 'Unstable' }
    return { status: 'blocked', quality: 'Disconnected' }
  }
  if (charge >= 90) return { status: 'flowing', quality: 'Peak flow' }
  if (charge >= 70) return { status: 'open', quality: 'Engaged' }
  if (charge >= 50) return { status: 'balanced', quality: 'Steady' }
  if (charge >= 35) return { status: 'strained', quality: 'Under pressure' }
  if (charge >= 20) return { status: 'depleted', quality: 'Needs attention' }
  return { status: 'blocked', quality: 'Blocked' }
}

/**
 * Recompute all chakra levels from intention engine signals + session metrics.
 * Called on an interval and after significant interactions.
 */
export function recomputeChakras(): ChakraErgonomicsState {
  const intentionState = intentionEngine.get()
  const userState = getUserState()
  const userIndex = getUserIndex()
  const signals = intentionState.signals
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000

  const recentSignals = signals.filter(s => s.timestamp > dayAgo)
  const currentState = chakraErgonomics.get()
  const session = currentState.session

  // Update session duration
  const durationMinutes = Math.round((now - session.startTime) / 60000)

  // Count interactions as keystroke proxy (each signal ≈ cluster of keystrokes)
  const sessionSignals = signals.filter(s => s.timestamp > session.startTime)
  const interactionCount = sessionSignals.length * 100 // rough keystroke estimate

  // ── Crown (Sahasrara) — higher connection / alignment + flow ──
  const crownCharge = (() => {
    const alignmentScore =
      userState.alignment === 'flowing' ? 95 :
      userState.alignment === 'aligned' ? 75 :
      userState.alignment === 'searching' ? 45 :
      25
    const indexFactor = userIndex.overall / 100
    return Math.round(alignmentScore * 0.6 + indexFactor * 100 * 0.4)
  })()

  // ── Third Eye (Ajna) — clarity / cognitive focus ──
  const thirdEyeCharge = (() => {
    const clarityScore =
      userState.clarity === 'focused' ? 95 :
      userState.clarity === 'clear' ? 75 :
      userState.clarity === 'uncertain' ? 40 :
      20
    const cogFactor = userIndex.dimensions.cognitive / 100
    return Math.round(clarityScore * 0.5 + cogFactor * 100 * 0.5)
  })()

  // ── Throat (Vishuddha) — communication / expression ──
  const throatCharge = (() => {
    const commSignals = recentSignals.filter(s =>
      s.source === 'memory' || s.source === 'journal'
    )
    const commDensity = Math.min(commSignals.length / 8, 1)
    // High density = overactive; moderate = open
    if (commDensity > 0.85 && durationMinutes > 40) return 35  // strained
    if (commDensity > 0.6) return 80
    if (commDensity > 0.3) return 65
    return 45 + commDensity * 20
  })()

  // ── Heart (Anahata) — emotional openness / posture awareness ──
  const heartCharge = (() => {
    const emotionalScore = userIndex.dimensions.emotional
    const socialScore = userIndex.dimensions.social
    const moodSignals = recentSignals.filter(s => s.source === 'mood')
    const positiveMoods = moodSignals.filter(s =>
      ['calm', 'peaceful', 'grateful', 'hopeful', 'content', 'energized'].includes(s.signal)
    )
    const positiveRatio = moodSignals.length > 0 ? positiveMoods.length / moodSignals.length : 0.5
    return Math.round(
      emotionalScore * 0.3 +
      socialScore * 0.2 +
      positiveRatio * 100 * 0.3 +
      // Posture proxy: shorter sessions = better posture assumed
      Math.max(0, 100 - durationMinutes) * 0.2
    )
  })()

  // ── Solar Plexus (Manipura) — core energy / willpower / nourishment ──
  const solarPlexusCharge = (() => {
    const energyScore =
      userState.energy === 'high' ? 90 :
      userState.energy === 'moderate' ? 65 :
      userState.energy === 'low' ? 40 :
      userState.energy === 'depleted' ? 20 :
      50
    // Long sessions deplete core
    const fatiguePenalty = Math.max(0, (durationMinutes - 30) * 0.8)
    // Eating recovery signals strengthen solar plexus (nourishment = core energy)
    const nutritionSignals = recentSignals.filter(s =>
      s.source === 'resilience' && (s.signal === 'eating_recovery_answer' || s.signal === 'nutrition_signal')
    )
    const nutritionBoost = Math.min(nutritionSignals.length * 5, 15)
    return Math.round(Math.max(10, energyScore - fatiguePenalty + nutritionBoost))
  })()

  // ── Sacral (Svadhisthana) — creativity / flow engagement ──
  const sacralCharge = (() => {
    const engagementScore = userIndex.dimensions.engagement
    const intentionalScore = userIndex.dimensions.intentional
    const diverseWidgets = new Set(recentSignals.map(s => s.source)).size
    const diversityFactor = Math.min(diverseWidgets / 5, 1) * 100
    return Math.round(
      engagementScore * 0.35 +
      intentionalScore * 0.3 +
      diversityFactor * 0.35
    )
  })()

  // ── Root (Muladhara) — grounding / session stability / body safety ──
  const rootCharge = (() => {
    const selfCareScore = userIndex.dimensions.selfCare
    // Consistent daily use = grounding
    const hasRecentSignals = recentSignals.length > 0
    const sessionStability = hasRecentSignals ? 80 : 30
    // Resilience and medical signals ground the root (body awareness = grounding)
    const bodySignals = recentSignals.filter(s =>
      s.source === 'medical' || s.source === 'resilience'
    )
    const bodyGrounding = Math.min(bodySignals.length * 3, 12)
    // Root is stable when there's consistency
    return Math.round(
      selfCareScore * 0.25 +
      sessionStability * 0.35 +
      Math.min(durationMinutes / 60, 1) * 100 * 0.25 +
      bodyGrounding
    )
  })()

  const chargeMap: Record<ChakraId, number> = {
    crown: crownCharge,
    thirdEye: thirdEyeCharge,
    throat: throatCharge,
    heart: heartCharge,
    solarPlexus: solarPlexusCharge,
    sacral: sacralCharge,
    root: rootCharge,
  }

  const chakras = CHAKRA_DEFINITIONS.map(def => {
    const charge = Math.max(0, Math.min(100, chargeMap[def.id]))
    const { status, quality } = statusFromCharge(charge, def.id)
    return { ...def, charge, status, quality }
  })

  // ── Coherence ──
  const charges = Object.values(chargeMap)
  const avgCharge = charges.reduce((a, b) => a + b, 0) / charges.length
  const variance = charges.reduce((sum, c) => sum + Math.pow(c - avgCharge, 2), 0) / charges.length
  const coherence = Math.round(Math.max(0, Math.min(100, 100 - Math.sqrt(variance))))

  // ── Session ──
  const updatedSession: SessionMetrics = {
    startTime: session.startTime,
    durationMinutes,
    interactionCount,
    coherence,
    lastUpdated: now,
  }

  // ── Recommendations ──
  const recommendations = deriveRecommendations(chakras, updatedSession)

  // ── Layout suggestion ──
  const layoutSuggestion = deriveLayoutSuggestion(chakras, updatedSession)

  const newState: ChakraErgonomicsState = {
    chakras,
    session: updatedSession,
    recommendations,
    layoutSuggestion,
  }

  chakraErgonomics.set(newState)
  persist(newState)

  return newState
}

// ─── Recommendations ─────────────────────────────────────────

function deriveRecommendations(
  chakras: ChakraLevel[],
  session: SessionMetrics
): ErgonomicRecommendation[] {
  const recs: ErgonomicRecommendation[] = []
  const byId = Object.fromEntries(chakras.map(c => [c.id, c])) as Record<ChakraId, ChakraLevel>

  // Session duration recommendations
  if (session.durationMinutes >= 45) {
    recs.push({ action: '5 min walk. Stand and move.', priority: 'high', category: 'movement' })
  } else if (session.durationMinutes >= 25) {
    recs.push({ action: 'Micro-break: look away 20 seconds.', priority: 'low', category: 'rest' })
  }

  // Throat strained → communication overload
  if (byId.throat.charge < 40) {
    recs.push({ action: 'Rest expression. Silence for 3 min.', priority: 'medium', category: 'rest' })
  }

  // Heart → posture
  if (byId.heart.charge < 50 && session.durationMinutes > 20) {
    recs.push({ action: 'Chest stretch. Roll shoulders back.', priority: 'medium', category: 'posture' })
  }

  // Solar Plexus depleted → core tension
  if (byId.solarPlexus.charge < 40) {
    recs.push({ action: 'Stand up. Gentle twist. Release core tension.', priority: 'high', category: 'movement' })
  }

  // Third Eye strained → focus fatigue
  if (byId.thirdEye.charge < 35) {
    recs.push({ action: 'Close eyes 30 seconds. Reset focus.', priority: 'medium', category: 'rest' })
  }

  // Crown low → disconnection
  if (byId.crown.charge < 30) {
    recs.push({ action: '3 deep breaths. Reconnect intention.', priority: 'low', category: 'breath' })
  }

  // Hydration reminder every 30+ min
  if (session.durationMinutes >= 30 && session.durationMinutes % 30 < 5) {
    recs.push({ action: 'Water. Hydrate now.', priority: 'medium', category: 'hydration' })
  }

  // Root unstable → grounding
  if (byId.root.charge < 40) {
    recs.push({ action: 'Feet flat on floor. Feel the ground.', priority: 'low', category: 'posture' })
  }

  return recs
}

function deriveLayoutSuggestion(
  chakras: ChakraLevel[],
  session: SessionMetrics
): string | null {
  const byId = Object.fromEntries(chakras.map(c => [c.id, c])) as Record<ChakraId, ChakraLevel>

  if (byId.throat.charge < 40 && session.durationMinutes > 30) {
    return '+8% key spacing. Reduced reach arc.'
  }
  if (byId.solarPlexus.charge < 35) {
    return 'Raise screen 2cm. Reduce forward lean.'
  }
  if (byId.heart.charge < 45 && byId.solarPlexus.charge < 50) {
    return 'Adjust chair height. Wrists neutral. Elbows 90\u00B0.'
  }
  if (session.durationMinutes > 60) {
    return 'Switch to standing position or change posture.'
  }
  return null
}

// ─── Interaction Tracking ────────────────────────────────────

/**
 * Call this from System.tsx or app-level to bump the interaction count.
 * A lightweight proxy for keystroke volume.
 */
export function recordInteraction() {
  const state = chakraErgonomics.get()
  const updated = {
    ...state,
    session: {
      ...state.session,
      interactionCount: state.session.interactionCount + 1,
      lastUpdated: Date.now(),
    }
  }
  chakraErgonomics.set(updated)
  persist(updated)
}

/**
 * Reset session metrics (e.g. after a long break detected).
 */
export function resetSession() {
  const state = chakraErgonomics.get()
  const updated = {
    ...state,
    session: defaultSession(),
  }
  chakraErgonomics.set(updated)
  persist(updated)
}

// ─── Format Helpers ──────────────────────────────────────────

export function formatCharge(charge: number): string {
  const filled = Math.round(charge / 10)
  return '[' + '='.repeat(filled) + '-'.repeat(10 - filled) + ']'
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
