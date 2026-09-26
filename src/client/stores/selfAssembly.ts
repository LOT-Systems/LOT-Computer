/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Self-Assembly Engine
 *
 * Tracks how the system self-assembles around user activity.
 * Each module "assembles" when the user's signal pattern reaches
 * a threshold of engagement — the system literally builds itself
 * from use.
 *
 * Assembly is not a toggle. It's a gradient: dormant modules awaken
 * as signal density increases, reaching assembled state when the
 * user's rhythm has taught the module what to become.
 *
 * Derives entirely from Quantum Intention Engine signals.
 * No synthetic data. No fake progress. Real assembly from real use.
 *
 * LOT Systems — the system that builds itself.
 */

import { atom, computed } from 'nanostores'
import { intentionEngine, type IntentionSignal } from './intentionEngine'

// ─── Types ───────────────────────────────────────────────────

export type AssemblyPhase =
  | 'dormant'       // No signals — module awaits activation
  | 'awakening'     // First signals detected — module stirring
  | 'forming'       // Signal pattern emerging — structure taking shape
  | 'assembled'     // Threshold reached — module self-built
  | 'integrated'    // Cross-module signals flowing — deep wiring complete

export type ModuleId =
  | 'biofield'         // Mood + energy signals
  | 'memory'           // Memory engine signals
  | 'planner'          // Planning signals
  | 'intentions'       // Intention + direction signals
  | 'selfcare'         // Cleanness + self-care signals
  | 'journal'          // Journaling + reflection signals
  | 'community'        // Social + cohort signals
  | 'ecosystem'        // Car + home + computer connect signals
  | 'quantum'          // QIE meta-signals (calculator, cross-module)
  | 'recipe'           // Meal / nutrition signals
  | 'goals'            // Goal journey and achievement signals
  | 'cohort-classify'  // Physiological archetype + cohort determination
  | 'vitals'           // OS Vitals Monitor — snapshot, sync, and biofield peak signals
  | 'calendar'         // Temporal planner — calendar entries and scheduled events
  | 'quantum-os'       // Quantum Operating System — full coherence across all dimensions
  | 'log'              // Field entry / signal archive
  | 'qos'              // Quantum Operating System — user's living OS state
  | 'resilience'       // PTSD/C-PTSD trauma-informed protocol + medical records

export type AssembledModule = {
  id: ModuleId
  label: string
  phase: AssemblyPhase
  signalCount: number      // Total signals from this module
  firstSignal: number | null  // Timestamp of first signal
  lastSignal: number | null   // Timestamp of most recent signal
  density: number          // 0-100: signal density over last 7 days
  coherence: number        // 0-100: signal regularity/consistency
}

export type AssemblyState = {
  modules: AssembledModule[]
  overallAssembly: number    // 0-100: weighted average of all modules
  assembledCount: number     // How many modules have reached 'assembled'
  totalModules: number
  phase: AssemblyPhase       // Overall system phase
  narrative: string          // Current self-assembly narrative
  lastComputed: number
}

// ─── Constants ───────────────────────────────────────────────

const STATE_KEY = 'self-assembly-state'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// Thresholds for assembly phases (signal count over 7 days)
const AWAKENING_THRESHOLD = 1
const FORMING_THRESHOLD = 5
const ASSEMBLED_THRESHOLD = 15
const INTEGRATED_THRESHOLD = 30

const MODULE_DEFINITIONS: Pick<AssembledModule, 'id' | 'label'>[] = [
  { id: 'biofield',        label: 'Biofield Engine' },
  { id: 'memory',          label: 'Memory Architecture' },
  { id: 'planner',         label: 'Routine Compiler' },
  { id: 'intentions',      label: 'Intention Core' },
  { id: 'selfcare',        label: 'Cleanness Protocol' },
  { id: 'journal',         label: 'Reflection Layer' },
  { id: 'community',       label: 'Community Mesh' },
  { id: 'ecosystem',       label: 'Ecosystem Bridge' },
  { id: 'quantum',         label: 'Quantum Substrate' },
  { id: 'recipe',          label: 'Nutrition Protocol' },
  { id: 'goals',           label: 'Goal Architecture' },
  { id: 'cohort-classify', label: 'Archetype Classifier' },
  { id: 'vitals',          label: 'OS Vitals Monitor' },
  { id: 'calendar',        label: 'Temporal Planner' },
  { id: 'quantum-os',      label: 'Quantum Operating System' },
  { id: 'log',             label: 'Signal Archive' },
  { id: 'qos',             label: 'Quantum OS' },
  { id: 'resilience',      label: 'Resilience Protocol' },
]

// Signal source mapping: which QIE sources feed which assembly modules
const SOURCE_MAP: Record<string, ModuleId[]> = {
  'mood':        ['biofield'],
  'memory':      ['memory', 'quantum'],
  'planner':     ['planner'],
  'intentions':  ['intentions', 'ecosystem'],
  'selfcare':    ['selfcare'],
  'journal':     ['journal'],
  'calculator':  ['quantum'],
  'log':         ['log', 'journal', 'quantum', 'vitals'],
  'energy':      ['biofield', 'quantum', 'vitals'],
  'cohort':      ['community', 'cohort-classify', 'quantum'],
  'recipe':      ['recipe'],
  'goals':       ['goals', 'intentions'],
  'calendar':    ['calendar', 'planner'],
  // quantum-os assembles when cross-module coherence is detected via getQuantumOS
  'quantum_coherence': ['quantum-os', 'quantum'],
  'qos':         ['qos', 'quantum'],
  'medical':     ['resilience', 'memory'],
  'resilience':  ['resilience', 'biofield'],
}

// Specific signal patterns that map to modules beyond their source
const SIGNAL_MAP: Record<string, ModuleId> = {
  'car_connected':         'ecosystem',
  'car_disconnected':      'ecosystem',
  'home_connected':        'ecosystem',
  'home_disconnected':     'ecosystem',
  'computer_connected':    'ecosystem',
  'computer_disconnected': 'ecosystem',
  'phone_connected':       'ecosystem',
  'phone_disconnected':    'ecosystem',
  'watch_connected':       'ecosystem',
  'watch_disconnected':    'ecosystem',
  'ecosystem_full_sync':   'ecosystem',
  'device_coherence_peak': 'ecosystem',
  'ecosystem_full_coherence': 'ecosystem',
  'cohort':                'community',
  'chat':                  'community',
  'message':               'community',
  'connection':            'community',
  'community':             'community',
  'cohort_determined':     'cohort-classify',
  'archetype':             'cohort-classify',
  'recipe_viewed':         'recipe',
  'meal':                  'recipe',
  'goal_set':              'goals',
  'goal_journey':          'goals',
  'goal_complete':         'goals',
  'os_vitals_snapshot':    'vitals',
  'signal_sync':           'vitals',
  'biofield_peak':         'vitals',
  'field_entry':           'vitals',
  'qos_snapshot':          'vitals',
  'full_stack_session':    'vitals',
  'quantum-coherence':     'quantum-os',
  'quantum_coherence':     'quantum-os',
  'intention-completion-arc': 'quantum-os',
  'social-resonance-arc':  'community',
  'social_resonance_arc':  'community',
  'cognitive-load-release': 'selfcare',
  'cognitive_load_release': 'selfcare',
  'calendar_entry':            'calendar',
  'calendar_alert':            'calendar',
  'calendar_update':           'calendar',
  'temporal-coherence-window': 'calendar',
  'temporal_coherence_window': 'calendar',
  'recovery-velocity':         'selfcare',
  'recovery_velocity':         'selfcare',
  'care-momentum':             'selfcare',
  'care_momentum':             'selfcare',
  'circadian-anchor-loss':     'selfcare',
  'circadian_anchor_loss':     'selfcare',
  'meridian-lock':             'biofield',
  'meridian_lock':             'biofield',
  'architect-phase':           'goals',
  'architect_phase':           'goals',
  'multimodal-peak':           'quantum-os',
  'multimodal_peak':           'quantum-os',
  'intention-seed':            'intentions',
  'intention_seed':            'intentions',
  'medical_record':            'resilience',
  'medical_answer':            'resilience',
  'trauma_informed_answer':    'resilience',
  'resilience_signal':         'resilience',
  'recovery_indicator':        'resilience',
  'eating_recovery_answer':    'resilience',
  'nutrition_signal':          'resilience',
}

// ─── Store ───────────────────────────────────────────────────

function defaultModules(): AssembledModule[] {
  return MODULE_DEFINITIONS.map(def => ({
    ...def,
    phase: 'dormant',
    signalCount: 0,
    firstSignal: null,
    lastSignal: null,
    density: 0,
    coherence: 0,
  }))
}

function defaultState(): AssemblyState {
  return {
    modules: defaultModules(),
    overallAssembly: 0,
    assembledCount: 0,
    totalModules: MODULE_DEFINITIONS.length,
    phase: 'dormant',
    narrative: 'Quantum Cube dormant. Send the first signal — assembly begins with you.',
    lastComputed: 0,
  }
}

function loadState(): AssemblyState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AssemblyState
      // Validate structure — rebuild if module count changed (new modules added)
      if (parsed.modules && parsed.modules.length === MODULE_DEFINITIONS.length) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  return defaultState()
}

export const selfAssembly = atom<AssemblyState>(loadState())

// Derived: just the assembled modules
export const $assembledModules = computed(selfAssembly, state =>
  state.modules.filter(m => m.phase === 'assembled' || m.phase === 'integrated')
)

// Derived: overall assembly percentage
export const $assemblyProgress = computed(selfAssembly, state => state.overallAssembly)

function persist(state: AssemblyState) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

// ─── Assembly Computation ────────────────────────────────────

/**
 * Classify which assembly modules a signal contributes to
 */
function getModulesForSignal(signal: IntentionSignal): ModuleId[] {
  const modules: Set<ModuleId> = new Set()

  // Map by source
  const sourceModules = SOURCE_MAP[signal.source]
  if (sourceModules) {
    sourceModules.forEach(m => modules.add(m))
  }

  // Map by specific signal name
  const signalModule = SIGNAL_MAP[signal.signal]
  if (signalModule) {
    modules.add(signalModule)
  }

  // Check for community-related signals by keyword
  const lowerSignal = signal.signal.toLowerCase()
  for (const [keyword, moduleId] of Object.entries(SIGNAL_MAP)) {
    if (lowerSignal.includes(keyword)) {
      modules.add(moduleId)
    }
  }

  return Array.from(modules)
}

/**
 * Compute assembly phase from signal density
 */
function phaseFromDensity(count: number, density: number, coherence: number): AssemblyPhase {
  if (count === 0) return 'dormant'
  if (count >= INTEGRATED_THRESHOLD && coherence >= 40) return 'integrated'
  if (count >= ASSEMBLED_THRESHOLD || density >= 60) return 'assembled'
  if (count >= FORMING_THRESHOLD || density >= 30) return 'forming'
  if (count >= AWAKENING_THRESHOLD) return 'awakening'
  return 'dormant'
}

/**
 * Compute density: how active is this module in the last 7 days?
 * Score 0-100 based on unique active days and signal frequency.
 */
function computeDensity(signals: IntentionSignal[]): number {
  if (signals.length === 0) return 0

  const now = Date.now()
  const weekSignals = signals.filter(s => now - s.timestamp < WEEK_MS)
  if (weekSignals.length === 0) return 0

  // Unique active days this week
  const activeDays = new Set(
    weekSignals.map(s => new Date(s.timestamp).toDateString())
  ).size

  // Frequency: signals per day (capped at 10/day)
  const dailyFrequency = Math.min(weekSignals.length / 7, 10)

  return Math.round(
    Math.min(100, (activeDays / 7) * 60 + (dailyFrequency / 10) * 40)
  )
}

/**
 * Compute coherence: how regular/consistent is signal flow?
 * High coherence = signals spread evenly across days.
 * Low coherence = bursts then silence.
 */
function computeCoherence(signals: IntentionSignal[]): number {
  if (signals.length < 2) return 0

  const now = Date.now()
  const weekSignals = signals.filter(s => now - s.timestamp < WEEK_MS)
  if (weekSignals.length < 2) return 0

  // Count signals per day (7-day window)
  const dayCounts = new Array(7).fill(0)
  weekSignals.forEach(s => {
    const daysAgo = Math.floor((now - s.timestamp) / (24 * 60 * 60 * 1000))
    if (daysAgo < 7) dayCounts[daysAgo]++
  })

  // Calculate coefficient of variation (lower = more coherent)
  const mean = dayCounts.reduce((a, b) => a + b, 0) / 7
  if (mean === 0) return 0
  const variance = dayCounts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / 7
  const cv = Math.sqrt(variance) / mean

  // Convert: low CV = high coherence
  return Math.round(Math.max(0, Math.min(100, 100 - cv * 40)))
}

/**
 * Generate self-assembly narrative based on current state
 */
function generateNarrative(modules: AssembledModule[], overallAssembly: number): string {
  const assembledCount = modules.filter(m =>
    m.phase === 'assembled' || m.phase === 'integrated'
  ).length
  const formingCount = modules.filter(m => m.phase === 'forming').length
  const awakeningCount = modules.filter(m => m.phase === 'awakening').length
  const dormantCount = modules.filter(m => m.phase === 'dormant').length
  const integratedCount = modules.filter(m => m.phase === 'integrated').length
  const total = modules.length

  // No signals at all
  if (overallAssembly === 0) {
    return 'Quantum Cube dormant. Send the first signal — assembly begins with you.'
  }

  // Full integration
  if (integratedCount === total) {
    return 'All modules online. Full co-evolution achieved. The Cube holds your complete signal pattern.'
  }

  // All assembled (some may be integrated)
  if (assembledCount === total) {
    return `All ${total} modules assembled. The Cube is coherent. Integration deepening from your rhythm.`
  }

  // Majority assembled
  if (assembledCount >= Math.ceil(total * 0.7)) {
    const remaining = total - assembledCount
    return `${assembledCount}/${total} modules online. ${remaining} still forming. Signal pipeline verified — the Cube accelerates.`
  }

  // Active assembly
  if (assembledCount >= 2) {
    const recentAssembled = modules
      .filter(m => m.phase === 'assembled' || m.phase === 'integrated')
      .sort((a, b) => (b.lastSignal || 0) - (a.lastSignal || 0))
    return `${recentAssembled[0].label} active. ${assembledCount}/${total} modules assembled. Structure emerging from your signal flow.`
  }

  // First assembly
  if (assembledCount === 1) {
    const first = modules.find(m => m.phase === 'assembled' || m.phase === 'integrated')!
    return `${first.label} online. First module assembled. The Cube is initializing.`
  }

  // Forming phase
  if (formingCount > 0) {
    return `${formingCount} module${formingCount > 1 ? 's' : ''} forming. Biofield patterns resolving into architecture. The Cube is calibrating.`
  }

  // Early awakening
  if (awakeningCount > 0) {
    return `${awakeningCount} module${awakeningCount > 1 ? 's' : ''} awakening. The Cube stirs. First signals detected — self-assembly initiated.`
  }

  return 'Signal detected. The Cube is reading your rhythm. Assembly sequence initiated.'
}

/**
 * Recompute assembly state from all QIE signals.
 * Call periodically or after significant signal events.
 */
export function recomputeAssembly(): AssemblyState {
  const intentionState = intentionEngine.get()
  const signals = intentionState.signals
  const now = Date.now()

  // Classify signals by module
  const moduleSignals: Record<ModuleId, IntentionSignal[]> = {
    biofield: [],
    memory: [],
    planner: [],
    intentions: [],
    selfcare: [],
    journal: [],
    community: [],
    ecosystem: [],
    quantum: [],
    recipe: [],
    goals: [],
    'cohort-classify': [],
    vitals: [],
    calendar: [],
    'quantum-os': [],
    log: [],
    qos: [],
    resilience: [],
  }

  signals.forEach(signal => {
    const modules = getModulesForSignal(signal)
    modules.forEach(moduleId => {
      moduleSignals[moduleId].push(signal)
    })
  })

  // Reflection Layer depth bonus: deep field entries (>100 words) count twice
  // Journal word count directly feeds Reflection Layer assembly density
  signals
    .filter(s => s.source === 'log' && s.signal === 'field_entry' && (s.metadata?.wordCount ?? 0) > 100)
    .forEach(s => moduleSignals['journal'].push(s))

  // Compute each module's assembly state
  const modules: AssembledModule[] = MODULE_DEFINITIONS.map(def => {
    const modSignals = moduleSignals[def.id]
    const density = computeDensity(modSignals)
    const coherence = computeCoherence(modSignals)
    const count = modSignals.filter(s => now - s.timestamp < WEEK_MS).length
    const phase = phaseFromDensity(count, density, coherence)

    const timestamps = modSignals.map(s => s.timestamp)

    return {
      id: def.id,
      label: def.label,
      phase,
      signalCount: modSignals.length,
      firstSignal: timestamps.length > 0 ? Math.min(...timestamps) : null,
      lastSignal: timestamps.length > 0 ? Math.max(...timestamps) : null,
      density,
      coherence,
    }
  })

  // Overall assembly: weighted by module phase
  const phaseWeights: Record<AssemblyPhase, number> = {
    dormant: 0,
    awakening: 15,
    forming: 40,
    assembled: 75,
    integrated: 100,
  }

  const totalWeight = modules.reduce((sum, m) => sum + phaseWeights[m.phase], 0)
  const overallAssembly = Math.round(totalWeight / modules.length)

  const assembledCount = modules.filter(m =>
    m.phase === 'assembled' || m.phase === 'integrated'
  ).length

  // Overall system phase
  const systemPhase: AssemblyPhase =
    assembledCount === modules.length ? 'integrated' :
    assembledCount >= Math.ceil(modules.length * 0.5) ? 'assembled' :
    modules.some(m => m.phase === 'forming') ? 'forming' :
    modules.some(m => m.phase === 'awakening') ? 'awakening' :
    'dormant'

  const narrative = generateNarrative(modules, overallAssembly)

  const state: AssemblyState = {
    modules,
    overallAssembly,
    assembledCount,
    totalModules: modules.length,
    phase: systemPhase,
    narrative,
    lastComputed: now,
  }

  selfAssembly.set(state)
  persist(state)

  return state
}

/**
 * Get current assembly state (cached)
 */
export function getAssemblyState(): AssemblyState {
  return selfAssembly.get()
}

/**
 * Get assembly progress for a specific module
 */
export function getModuleAssembly(moduleId: ModuleId): AssembledModule | null {
  const state = selfAssembly.get()
  return state.modules.find(m => m.id === moduleId) || null
}

/**
 * Phase display symbol
 */
export function phaseSymbol(phase: AssemblyPhase): string {
  switch (phase) {
    case 'dormant':    return '·'
    case 'awakening':  return '∘'
    case 'forming':    return '○'
    case 'assembled':  return '◯'
    case 'integrated': return '◉'
  }
}

/**
 * Phase display label
 */
export function phaseLabel(phase: AssemblyPhase): string {
  switch (phase) {
    case 'dormant':    return 'Dormant'
    case 'awakening':  return 'Awakening'
    case 'forming':    return 'Forming'
    case 'assembled':  return 'Assembled'
    case 'integrated': return 'Integrated'
  }
}

// ─── Debug ───────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  (window as any).__assemblyDebug = {
    getState: () => selfAssembly.get(),
    recompute: recomputeAssembly,
  }
}
