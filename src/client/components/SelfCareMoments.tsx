import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button } from '#client/components/ui'
import { useProfile, useEmotionalCheckIns, useCreateLog, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'

type CareView = 'suggestion' | 'why' | 'practice'

type CareSuggestion = {
  action: string
  why: string
  practice: string
  duration: string
}

/**
 * Self-care Moments Widget - Context-aware recommendations
 * Pattern: Suggestion > Why This > Practice
 * Adapts based on: emotional state, weather, archetype, time
 */
export function SelfCareMoments() {
  const [view, setView] = React.useState<CareView>('suggestion')
  const [currentSuggestion, setCurrentSuggestion] = React.useState<CareSuggestion | null>(null)
  const [completedToday, setCompletedToday] = React.useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = React.useState(false)
  const [timeRemaining, setTimeRemaining] = React.useState<number>(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const [isVisible, setIsVisible] = React.useState(true)
  const [isShown, setIsShown] = React.useState(false)
  const [isFading, setIsFading] = React.useState(false)
  const [completionMessage, setCompletionMessage] = React.useState<string | null>(null)

  const weather = useStore(stores.weather)
  const { data: profile } = useProfile()
  const { data: checkInsData } = useEmotionalCheckIns(7) // Last 7 days
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()

  // Calculate current streak from logs
  const calculateStreak = React.useCallback(() => {
    if (!logs || logs.length === 0) return 0

    // Filter self-care completion logs
    const completionLogs = logs
      .filter(log => log.event === 'self_care_complete')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (completionLogs.length === 0) return 0

    // Group by date
    const dateSet = new Set<string>()
    completionLogs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      dateSet.add(date)
    })

    const dates = Array.from(dateSet).sort().reverse() // Most recent first

    // Count consecutive days starting from today or yesterday
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date()

    // Start from today or yesterday (we allow starting yesterday if user hasn't completed today yet)
    for (let i = 0; i <= dates.length; i++) {
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() - i)
      const checkDateStr = checkDate.toISOString().split('T')[0]

      if (dates.includes(checkDateStr)) {
        streak++
      } else if (i > 1) {
        // If we miss a day after the first check (allowing today to be missed), break
        break
      }
    }

    return streak
  }, [logs])

  const currentStreak = calculateStreak()

  // Load today's completed count from localStorage
  React.useEffect(() => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('self-care-completed')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.date === today) {
          setCompletedToday(parsed.count)
        } else {
          // New day, reset
          localStorage.setItem('self-care-completed', JSON.stringify({ date: today, count: 0 }))
          setCompletedToday(0)
        }
      } catch (e) {
        console.error('Failed to parse completed count:', e)
      }
    }
  }, [])

  // Timer effect
  React.useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(time => time - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      // Timer finished!
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isTimerRunning, timeRemaining])

  React.useEffect(() => {
    // Generate context-aware suggestion when component mounts or context changes
    const suggestion = generateContextualSuggestion(
      weather?.description,
      profile?.archetype,
      checkInsData?.stats.dominantMood
    )
    setCurrentSuggestion(suggestion)
    // Fade in on mount
    setTimeout(() => setIsShown(true), 100)
  }, [weather?.description, profile?.archetype, checkInsData?.stats.dominantMood])

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'suggestion': return 'why'
        case 'why': return 'practice'
        case 'practice': return 'suggestion'
        default: return 'suggestion'
      }
    })
  }

  const refreshSuggestion = () => {
    // Log the skipped activity and set cooldown
    if (currentSuggestion) {
      createLog({
        text: `Self-care skipped: ${currentSuggestion.action}`,
        event: 'self_care_skip'
      })

      // Set cooldown timestamp
      localStorage.setItem('self-care-last-interaction', Date.now().toString())
    }

    const suggestion = generateContextualSuggestion(
      weather?.description,
      profile?.archetype,
      checkInsData?.stats.dominantMood,
      true // Force different suggestion
    )
    setCurrentSuggestion(suggestion)
    setView('suggestion')
  }

  const markAsDone = () => {
    const today = new Date().toDateString()
    const newCount = completedToday + 1
    setCompletedToday(newCount)
    localStorage.setItem('self-care-completed', JSON.stringify({ date: today, count: newCount }))

    // Record intention signal for quantum pattern recognition
    if (currentSuggestion) {
      recordSignal('selfcare', 'practice_completed', {
        action: currentSuggestion.action,
        count: newCount,
        hour: new Date().getHours()
      })

      // Log the completed activity and set cooldown
      createLog({
        text: `Self-care completed: ${currentSuggestion.action}`,
        event: 'self_care_complete'
      })

      // Set cooldown timestamp
      localStorage.setItem('self-care-last-interaction', Date.now().toString())
    }

    // Show completion message
    const messages = ['Well done.', 'Complete.', 'Done.', 'Finished.']
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    setCompletionMessage(randomMessage)

    // Fade out after 3 seconds
    setTimeout(() => {
      setIsFading(true)
    }, 3000)

    // Hide widget after fade completes
    setTimeout(() => {
      setIsVisible(false)
    }, 4400) // 3000ms visible + 1400ms fade
  }

  const startTimer = () => {
    if (!currentSuggestion) return
    // Parse duration (e.g., "5 mins" -> 300 seconds)
    const match = currentSuggestion.duration.match(/(\d+)/)
    if (match) {
      const minutes = parseInt(match[1])
      setTimeRemaining(minutes * 60)
      setIsTimerRunning(true)
      setView('practice')
    }
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    setTimeRemaining(0)
  }

  if (!currentSuggestion) {
    return (
      <Block label="Self-care:" blockView>
        <div className="opacity-60">Loading suggestion...</div>
      </Block>
    )
  }

  if (!isVisible) return null

  const label =
    view === 'suggestion' ? 'Self-care:' :
    view === 'why' ? 'Why This:' :
    'Practice:'

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-[1400ms]',
        isFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <Block label={label} blockView onLabelClick={cycleView}>
      {completionMessage ? (
        <div
          className={cn(
            'transition-opacity duration-[1400ms]',
            isFading ? 'opacity-0' : 'opacity-100'
          )}
        >
          {completionMessage}
        </div>
      ) : (
        <>
      {view === 'suggestion' && (
        <div className="inline-block w-full">
          <div className={cn("opacity-90", (completedToday > 0 || currentStreak > 0) ? "mb-12" : "mb-16")}>
            {currentSuggestion.action} ({currentSuggestion.duration})
          </div>
          {(completedToday > 0 || currentStreak > 0) && (
            <div className="opacity-90 mb-16">
              {completedToday > 0 && <div>{completedToday} done today</div>}
              {currentStreak > 1 && <div>{currentStreak} day streak</div>}
            </div>
          )}
          <div className="flex gap-8">
            <Button onClick={startTimer}>
              Start
            </Button>
            <Button onClick={markAsDone}>
              Done
            </Button>
            <Button onClick={refreshSuggestion}>
              Skip
            </Button>
          </div>
        </div>
      )}

      {view === 'why' && (
        <div className="inline-block">
          <div className="opacity-80">{currentSuggestion.why}</div>
        </div>
      )}

      {view === 'practice' && (
        <div className="inline-block w-full">
          {isTimerRunning && (
            <div className="mb-12 opacity-90">
              {formatTime(timeRemaining)}
            </div>
          )}
          <div className="opacity-90 mb-16">{currentSuggestion.practice.replace(/\n+/g, ' ')}</div>
          {isTimerRunning ? (
            <div className="flex gap-8">
              <Button onClick={stopTimer}>
                Stop
              </Button>
              <Button onClick={markAsDone}>
                Done
              </Button>
            </div>
          ) : (
            <Button onClick={markAsDone}>
              Done
            </Button>
          )}
        </div>
      )}
        </>
      )}
    </Block>
    </div>
  )
}

/**
 * Generate contextual care suggestion based on multiple factors
 */
function generateContextualSuggestion(
  weatherDesc?: string,
  archetype?: string,
  dominantMood?: string,
  forceNew: boolean = false
): CareSuggestion {
  const suggestions: CareSuggestion[] = []

  // Weather-based suggestions
  if (weatherDesc) {
    const weatherLower = weatherDesc.toLowerCase()
    if (weatherLower.includes('rain') || weatherLower.includes('storm')) {
      suggestions.push({
        action: 'Create a cozy moment with warm tea and gentle music',
        why: 'Rainy weather invites us inward. Coziness is self-care.',
        practice: 'Make your favorite warm drink.\nFind a comfortable spot.\nPut on music that soothes you.\nJust be present for 10 minutes.',
        duration: '10 mins'
      })
    } else if (weatherLower.includes('sun') || weatherLower.includes('clear')) {
      suggestions.push({
        action: 'Step outside and get sunlight',
        why: 'Sunlight regulates your circadian rhythm and boosts mood.',
        practice: 'Go outside.\nFace the sun (eyes closed).\nTake 5 deep breaths.\nNotice the warmth on your skin.',
        duration: '5 mins'
      })
    }
  }

  // Mood-based suggestions
  if (dominantMood) {
    if (['anxious', 'overwhelmed', 'restless'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Practice 4-7-8 breathing to calm your nervous system',
          why: 'You\'ve been experiencing tension. This activates your parasympathetic nervous system.',
          practice: 'Breathe in for 4 counts.\nHold for 7 counts.\nExhale slowly for 8 counts.\nRepeat 4 times.',
          duration: '2 mins'
        },
        {
          action: 'Name and release your worries',
          why: 'Anxiety lives in the unnamed. Speaking worries aloud diminishes their power.',
          practice: 'Close your eyes.\nName one worry out loud.\nSay: "I see you, but you don\'t control me."\nTake a deep breath and let it go.',
          duration: '3 mins'
        },
        {
          action: 'Ground yourself with the 5-4-3-2-1 technique',
          why: 'Overwhelm pulls you from the present. Grounding brings you back.',
          practice: 'Name 5 things you see.\n4 things you can touch.\n3 things you hear.\n2 things you smell.\n1 thing you taste.',
          duration: '3 mins'
        }
      )
    } else if (['tired', 'exhausted'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Take a power rest (not nap)',
          why: 'Your body is asking for restoration. Short rest can restore energy.',
          practice: 'Lie down comfortably.\nClose your eyes.\nDon\'t try to sleep.\nJust let your body rest.\nSet a timer for 10 minutes.',
          duration: '10 mins'
        },
        {
          action: 'Practice radical permission to rest',
          why: 'Tiredness is not weakness. Your body deserves rest without guilt.',
          practice: 'Say out loud: "I give myself permission to be tired."\nPlace hand on heart.\nBreathe slowly.\nRest for 5 minutes without doing anything.',
          duration: '5 mins'
        }
      )
    } else if (['grateful', 'content', 'peaceful'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Write down 3 specific moments from today',
          why: 'You\'re in a positive state. Anchoring it deepens the experience.',
          practice: 'Get your journal.\nWrite 3 specific moments.\nWhat made each one special?\nHow did you feel?',
          duration: '5 mins'
        },
        {
          action: 'Savor this peaceful moment',
          why: 'Peace is rare and precious. Conscious savoring makes it last longer.',
          practice: 'Close your eyes.\nNotice the peace in your body.\nWhere do you feel it?\nBreathe into that feeling.\nSay: "I am here."',
          duration: '3 mins'
        }
      )
    } else if (['energized', 'excited', 'hopeful'].includes(dominantMood)) {
      suggestions.push({
        action: 'Channel your energy into creative movement',
        why: 'High energy is a gift. Movement helps you embody and direct it.',
        practice: 'Put on music that matches your energy.\nMove freely for 3 minutes.\nNo rules, just expression.\nNotice how the energy flows.',
        duration: '3 mins'
      })
    }
  }

  // Archetype-based suggestions
  if (archetype) {
    if (archetype === 'The Seeker') {
      suggestions.push({
        action: 'Reflective inquiry practice',
        why: 'Your Seeker nature thrives on self-discovery.',
        practice: 'Ask yourself: "What am I discovering about myself right now?"\n\nSit with the question.\nDon\'t force answers.\nNotice what arises.',
        duration: '5 mins'
      })
    } else if (archetype === 'The Nurturer') {
      suggestions.push({
        action: 'Practice nurturing yourself as you would a loved one',
        why: 'Nurturers often forget to care for themselves.',
        practice: 'Place hand on heart.\nSay: "I deserve care too."\nDo one small kind thing for yourself.\nNotice how it feels.',
        duration: '3 mins'
      })
    } else if (archetype === 'The Creator') {
      suggestions.push({
        action: 'Free expression: creating without purpose',
        why: 'Your Creator soul needs expression without judgment.',
        practice: 'Grab any creative medium.\nSet timer for 5 minutes.\nCreate without planning.\nNo goal, just expression.',
        duration: '5 mins'
      })
    }
  }

  // Time-based suggestions
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 9) {
    suggestions.push(
      {
        action: 'Set one intention for how you want to feel today',
        why: 'Morning is powerful for intention-setting.',
        practice: 'Close your eyes.\nAsk: "How do I want to feel today?"\nChoose one word.\nSay it out loud 3 times.',
        duration: '2 mins'
      },
      {
        action: 'Welcome the day with gentle presence',
        why: 'How you begin shapes the entire day. Gentleness is a choice.',
        practice: 'Before checking your phone.\nPlace both hands on your heart.\nSay: "I welcome this day."\nTake 3 slow breaths.',
        duration: '2 mins'
      }
    )
  } else if (hour >= 12 && hour < 14) {
    suggestions.push({
      action: 'Midday reset: pause and recalibrate',
      why: 'Midday is when we lose ourselves in doing. Pausing restores awareness.',
      practice: 'Stop what you\'re doing.\nClose your eyes.\nAsk: "What do I need right now?"\nListen for the answer.\nGive yourself that one thing.',
      duration: '3 mins'
    })
  } else if (hour >= 19 && hour < 22) {
    suggestions.push(
      {
        action: 'Release the day with a simple closing ritual',
        why: 'Evenings need closure to prepare for rest.',
        practice: 'Take 3 deep breaths.\nSay: "I release what no longer serves me."\nName one thing you\'re letting go.\nExhale it fully.',
        duration: '3 mins'
      },
      {
        action: 'Evening gratitude: name what held you today',
        why: 'Gratitude before sleep rewires your brain toward positivity.',
        practice: 'Reflect on your day.\nName one thing that held you.\nIt can be small: a smile, sunlight, a moment of ease.\nSay thank you.',
        duration: '2 mins'
      },
      {
        action: 'Body scan to transition from day to night',
        why: 'Your body holds the day\'s stress. Releasing it prepares you for rest.',
        practice: 'Lie down or sit comfortably.\nClose your eyes.\nScan from head to toes.\nWhere is tension?\nBreathe into those places.',
        duration: '5 mins'
      }
    )
  } else if (hour >= 22 || hour < 6) {
    suggestions.push({
      action: 'Nighttime self-compassion practice',
      why: 'Late hours can bring harsh thoughts. You deserve kindness, especially now.',
      practice: 'Place hand on your heart.\nSay: "I did my best today."\nBreathe.\nSay: "I am enough."\nLet yourself rest.',
      duration: '2 mins'
    })
  }

  // Default suggestions if none match
  if (suggestions.length === 0) {
    suggestions.push(
      {
        action: 'Take 3 conscious breaths right now',
        why: 'Breath is always available. It anchors you to the present.',
        practice: 'Breathe in slowly.\nPause at the top.\nBreathe out slowly.\nRepeat 3 times.\nNotice how you feel.',
        duration: '1 min'
      },
      {
        action: 'Stretch your body',
        why: 'Your body holds tension. Movement releases it.',
        practice: 'Stand up.\nReach arms overhead.\nSide bend both ways.\nRoll shoulders.\nNotice what feels tight.',
        duration: '2 mins'
      },
      {
        action: 'Drink a glass of water mindfully',
        why: 'Hydration affects everything. Mindfulness deepens the care.',
        practice: 'Get water.\nHold the glass.\nTake slow sips.\nFeel the water nourishing you.\nSay thank you to your body.',
        duration: '2 mins'
      },
      {
        action: 'Notice what you\'re holding and set it down',
        why: 'We carry invisible burdens. Sometimes we just need permission to put them down.',
        practice: 'Close your eyes.\nAsk: "What am I holding that isn\'t mine to carry?"\nImagine setting it down.\nFeel the lightness.',
        duration: '3 mins'
      },
      {
        action: 'Appreciate something in your immediate space',
        why: 'Beauty is always present. Noticing it shifts your state.',
        practice: 'Look around.\nFind one thing that brings you ease.\nReally look at it for 1 minute.\nNotice its details.\nSay: "Thank you for being here."',
        duration: '2 mins'
      },
      {
        action: 'Place your hand on your heart and just breathe',
        why: 'Touch is healing, even when it\'s your own. Your heart deserves acknowledgment.',
        practice: 'Place your hand on your chest.\nFeel your heartbeat.\nBreathe slowly.\nSay: "I am here with you."\nStay for 5 breaths.',
        duration: '2 mins'
      }
    )
  }

  // Random selection from contextual suggestions
  const randomIndex = Math.floor(Math.random() * suggestions.length)
  return suggestions[randomIndex]
}
