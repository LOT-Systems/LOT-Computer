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

// ASCII animations for each phase
const getAsciiAnimation = (phase: BreathingPhase, count: number): string => {
  switch (phase) {
    case 'inhale':
      // Expanding: . o O ◯ ◉
      const inhaleFrames = ['.', 'o', 'O', '◯']
      const inhaleIndex = Math.floor((count / PHASE_DURATIONS.inhale) * inhaleFrames.length)
      return inhaleFrames[Math.min(inhaleIndex, inhaleFrames.length - 1)]

    case 'hold':
      // Steady pulse
      return '◉'

    case 'exhale':
      // Contracting: ◉ ◯ O o .
      const exhaleFrames = ['◉', '◯', 'O', 'o', '.']
      const exhaleIndex = Math.floor((count / PHASE_DURATIONS.exhale) * exhaleFrames.length)
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

    // Start with inhale
    setState({ phase: 'inhale', count: PHASE_DURATIONS.inhale, display: '.' })

    let currentPhase: BreathingPhase = 'inhale'
    let countdown = PHASE_DURATIONS.inhale

    const interval = setInterval(() => {
      countdown -= 1

      if (countdown <= 0) {
        // Move to next phase
        if (currentPhase === 'inhale') {
          currentPhase = 'hold'
          countdown = PHASE_DURATIONS.hold
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale'
          countdown = PHASE_DURATIONS.exhale
        } else {
          // Loop back to inhale
          currentPhase = 'inhale'
          countdown = PHASE_DURATIONS.inhale
        }
      }

      const ascii = getAsciiAnimation(currentPhase, countdown)
      const label = PHASE_LABELS[currentPhase]
      const display = `${ascii} ${label} ${countdown}s`

      setState({
        phase: currentPhase,
        count: countdown,
        display,
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [enabled])

  return state
}
