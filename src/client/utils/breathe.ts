import * as React from 'react'

type BreathingPhase = 'off' | 'inhale' | 'hold' | 'exhale'

interface BreathingState {
  phase: BreathingPhase
  count: number
  display: string
}

// Pilates breathing rhythm: Inhale (4s) > Hold (2s) > Exhale (6s)
const PHASE_DURATIONS = {
  inhale: 4,
  hold: 2,
  exhale: 6,
}

const PHASE_LABELS = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
}

// ASCII animations for each phase (based on elapsed time in phase)
const getAsciiAnimation = (phase: BreathingPhase, elapsed: number): string => {
  switch (phase) {
    case 'inhale':
      // Expanding: . o O ◯
      const inhaleFrames = ['.', 'o', 'O', '◯']
      const inhaleProgress = elapsed / PHASE_DURATIONS.inhale
      const inhaleIndex = Math.floor(inhaleProgress * inhaleFrames.length)
      return inhaleFrames[Math.min(inhaleIndex, inhaleFrames.length - 1)]

    case 'hold':
      // Steady pulse
      return '◉'

    case 'exhale':
      // Contracting: ◉ ◯ O o .
      const exhaleFrames = ['◉', '◯', 'O', 'o', '.']
      const exhaleProgress = elapsed / PHASE_DURATIONS.exhale
      const exhaleIndex = Math.floor(exhaleProgress * exhaleFrames.length)
      return exhaleFrames[Math.min(exhaleIndex, exhaleFrames.length - 1)]

    default:
      return '·'
  }
}

export function useBreathe(enabled: boolean) {
  const [state, setState] = React.useState<BreathingState>({
    phase: 'off',
    count: 0,
    display: '·',
  })

  React.useEffect(() => {
    if (!enabled) {
      setState({ phase: 'off', count: 0, display: '·' })
      return
    }

    // Use performance.now() for precise timing
    const startTime = performance.now()
    const totalCycleDuration = PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold + PHASE_DURATIONS.exhale

    const updateState = () => {
      const elapsed = (performance.now() - startTime) / 1000 // seconds
      const cyclePosition = elapsed % totalCycleDuration

      let currentPhase: BreathingPhase
      let phaseElapsed: number
      let countdown: number

      if (cyclePosition < PHASE_DURATIONS.inhale) {
        currentPhase = 'inhale'
        phaseElapsed = cyclePosition
        countdown = Math.ceil(PHASE_DURATIONS.inhale - phaseElapsed)
      } else if (cyclePosition < PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold) {
        currentPhase = 'hold'
        phaseElapsed = cyclePosition - PHASE_DURATIONS.inhale
        countdown = Math.ceil(PHASE_DURATIONS.hold - phaseElapsed)
      } else {
        currentPhase = 'exhale'
        phaseElapsed = cyclePosition - PHASE_DURATIONS.inhale - PHASE_DURATIONS.hold
        countdown = Math.ceil(PHASE_DURATIONS.exhale - phaseElapsed)
      }

      const ascii = getAsciiAnimation(currentPhase, phaseElapsed)
      const label = PHASE_LABELS[currentPhase]
      const display = `${ascii} ${label} ${countdown}s`

      setState({
        phase: currentPhase,
        count: countdown,
        display,
      })
    }

    // Update immediately
    updateState()

    // Update every 100ms for smooth countdown, but use precise timing
    const interval = setInterval(updateState, 100)

    return () => {
      clearInterval(interval)
    }
  }, [enabled])

  return state
}
