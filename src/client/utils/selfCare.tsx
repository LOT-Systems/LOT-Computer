import * as React from 'react'
import { getTimeOfDay, getSelfCarePrompt, getBreathingPrompt } from './narrative'

/**
 * Self-Care Routines System
 *
 * Provides gentle, time-aware prompts and routines for well-being
 * Integrates breathing exercises, movement prompts, and rest reminders
 */

export interface SelfCareState {
  lastBreak: number | null // timestamp of last break
  screenTimeToday: number // minutes
  movementCount: number // number of movements today
  breathingSessionsToday: number
  lastBreathingSession: number | null
}

/**
 * Get self-care state from localStorage
 */
export function getSelfCareState(): SelfCareState {
  try {
    const stored = localStorage.getItem('selfCareState')
    if (stored) {
      const state = JSON.parse(stored) as SelfCareState
      // Check if data is from today
      const lastDate = localStorage.getItem('selfCareDate')
      const today = new Date().toDateString()
      if (lastDate !== today) {
        // Reset daily counters
        return {
          ...state,
          screenTimeToday: 0,
          movementCount: 0,
          breathingSessionsToday: 0,
          lastBreak: null,
        }
      }
      return state
    }
  } catch (e) {
    console.warn('Failed to load self-care state:', e)
  }

  return {
    lastBreak: null,
    screenTimeToday: 0,
    movementCount: 0,
    breathingSessionsToday: 0,
    lastBreathingSession: null,
  }
}

/**
 * Save self-care state to localStorage
 */
export function saveSelfCareState(state: SelfCareState): void {
  try {
    localStorage.setItem('selfCareState', JSON.stringify(state))
    localStorage.setItem('selfCareDate', new Date().toDateString())
  } catch (e) {
    console.warn('Failed to save self-care state:', e)
  }
}

/**
 * Record a break taken
 */
export function recordBreak(): void {
  const state = getSelfCareState()
  saveSelfCareState({
    ...state,
    lastBreak: Date.now(),
  })
}

/**
 * Record a breathing session
 */
export function recordBreathingSession(): void {
  const state = getSelfCareState()
  saveSelfCareState({
    ...state,
    breathingSessionsToday: state.breathingSessionsToday + 1,
    lastBreathingSession: Date.now(),
  })
}

/**
 * Record movement
 */
export function recordMovement(): void {
  const state = getSelfCareState()
  saveSelfCareState({
    ...state,
    movementCount: state.movementCount + 1,
  })
}

/**
 * Self-Care Routine Types
 */
export type SelfCareRoutineType = 'breathing' | 'movement' | 'rest' | 'hydration' | 'posture'

export interface SelfCareRoutine {
  type: SelfCareRoutineType
  title: string
  description: string
  duration: number // seconds
  instructions: string[]
  benefits: string
}

/**
 * Available self-care routines
 */
export const SELF_CARE_ROUTINES: Record<SelfCareRoutineType, SelfCareRoutine> = {
  breathing: {
    type: 'breathing',
    title: 'Breathing Exercise',
    description: 'Pilates-style breathing to center and calm',
    duration: 60, // 5 cycles of 12 seconds
    instructions: [
      'Inhale deeply for 4 seconds',
      'Hold gently for 2 seconds',
      'Exhale slowly for 6 seconds',
      'Repeat 5 times',
    ],
    benefits: 'Reduces stress, improves focus, calms nervous system',
  },
  movement: {
    type: 'movement',
    title: 'Gentle Movement',
    description: 'Simple stretches to release tension',
    duration: 120,
    instructions: [
      'Stand and reach arms overhead',
      'Roll shoulders backward 5 times',
      'Gentle neck rolls side to side',
      'Stretch arms across chest',
      'Take a short walk if possible',
    ],
    benefits: 'Reduces muscle tension, improves circulation, energizes body',
  },
  rest: {
    type: 'rest',
    title: 'Rest Break',
    description: 'Brief pause to restore energy',
    duration: 300,
    instructions: [
      'Step away from screen',
      'Close your eyes or gaze softly',
      'Let your mind rest',
      'No need to do anything',
      'Simply be present',
    ],
    benefits: 'Prevents burnout, restores mental energy, improves creativity',
  },
  hydration: {
    type: 'hydration',
    title: 'Hydration Check',
    description: 'Drink water mindfully',
    duration: 60,
    instructions: [
      'Get a glass of water',
      'Drink slowly and mindfully',
      'Notice the sensation',
      'Feel yourself rehydrating',
    ],
    benefits: 'Improves focus, supports physical health, energizes',
  },
  posture: {
    type: 'posture',
    title: 'Posture Reset',
    description: 'Realign your body',
    duration: 60,
    instructions: [
      'Sit or stand tall',
      'Roll shoulders back and down',
      'Lengthen spine upward',
      'Relax jaw and face',
      'Breathe naturally',
    ],
    benefits: 'Reduces back pain, improves breathing, boosts confidence',
  },
}

/**
 * Get recommended routine based on context
 */
export function getRecommendedRoutine(context: {
  energy?: 'depleted' | 'low' | 'moderate' | 'high'
  stress?: 'low' | 'moderate' | 'high'
  lastBreak?: number // minutes ago
  posture?: 'good' | 'poor'
}): SelfCareRoutineType {
  // High stress -> breathing
  if (context.stress === 'high') {
    return 'breathing'
  }

  // Low energy -> rest
  if (context.energy === 'depleted' || context.energy === 'low') {
    return 'rest'
  }

  // Long session without break -> movement
  if (context.lastBreak && context.lastBreak > 90) {
    return 'movement'
  }

  // Poor posture -> posture reset
  if (context.posture === 'poor') {
    return 'posture'
  }

  // Default: breathing (most universally beneficial)
  return 'breathing'
}

/**
 * Self-Care Prompt Component
 */
export interface SelfCarePromptProps {
  onDismiss?: () => void
  onStart?: (routine: SelfCareRoutineType) => void
  className?: string
}

export const SelfCarePrompt: React.FC<SelfCarePromptProps> = ({
  onDismiss,
  onStart,
  className = '',
}) => {
  const state = getSelfCareState()
  const timeOfDay = getTimeOfDay()

  // Calculate minutes since last break
  const minutesSinceBreak = state.lastBreak
    ? Math.floor((Date.now() - state.lastBreak) / 1000 / 60)
    : 999

  // Get self-care prompt
  const prompt = getSelfCarePrompt({
    timeOfDay,
    energy: minutesSinceBreak > 120 ? 'low' : 'moderate',
    lastBreak: minutesSinceBreak,
    screenTime: state.screenTimeToday / 60,
  })

  // Get recommended routine
  const recommendedRoutine = getRecommendedRoutine({
    energy: minutesSinceBreak > 120 ? 'low' : 'moderate',
    lastBreak: minutesSinceBreak,
  })

  const routine = SELF_CARE_ROUTINES[recommendedRoutine]

  if (!prompt) {
    return null
  }

  return (
    <div className={`p-4 grid-fill-light rounded-lg border border-acc/20 ${className}`}>
      <div className="mb-3 italic">{prompt}</div>
      <div className="mb-2 font-medium">{routine.title}</div>
      <div className="mb-3 text-sm opacity-70">{routine.description}</div>
      <div className="flex gap-2">
        <button
          onClick={() => onStart?.(recommendedRoutine)}
          className="px-3 py-1 bg-acc/10 hover:bg-acc/20 rounded transition-colors"
        >
          Start ({Math.floor(routine.duration / 60)} min)
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1 hover:bg-acc/10 rounded transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  )
}

/**
 * Hook to check if self-care prompt should be shown
 */
export function useSelfCareCheck(intervalMinutes: number = 60): boolean {
  const [shouldShow, setShouldShow] = React.useState(false)

  React.useEffect(() => {
    const check = () => {
      const state = getSelfCareState()
      const minutesSinceBreak = state.lastBreak
        ? Math.floor((Date.now() - state.lastBreak) / 1000 / 60)
        : 999

      // Show if more than intervalMinutes since last break
      setShouldShow(minutesSinceBreak >= intervalMinutes)
    }

    check()
    const interval = setInterval(check, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [intervalMinutes])

  return shouldShow
}
