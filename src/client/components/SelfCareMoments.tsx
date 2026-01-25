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
 * Self-care Moments Widget – Context-aware recommendations
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
      checkInsData?.stats.dominantMood,
      currentStreak,
      false
    )
    setCurrentSuggestion(suggestion)
    // Fade in on mount
    setTimeout(() => setIsShown(true), 100)
  }, [weather?.description, profile?.archetype, checkInsData?.stats.dominantMood, currentStreak])

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
      currentStreak,
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
          {(() => {
            const quantumReason = localStorage.getItem('selfcare-quantum-reason')
            return quantumReason ? (
              <div className="opacity-60 mb-8">
                {quantumReason}
              </div>
            ) : null
          })()}
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
 * Language adapts based on user's practice level (streak)
 */
function generateContextualSuggestion(
  weatherDesc?: string,
  archetype?: string,
  dominantMood?: string,
  streak: number = 0,
  forceNew: boolean = false
): CareSuggestion {
  const suggestions: CareSuggestion[] = []

  // Get current hour for time-aware suggestions
  const hour = new Date().getHours()

  // Determine language style based on badge progression
  // 7+ days: Mix technical and natural
  // 30+ days: More technical/systems language
  // 100+ days: Full technical mastery
  const useTechLanguage = streak >= 7 && Math.random() > 0.5 // 50/50 mix at 7+
  const preferTechLanguage = streak >= 30 // Prefer technical at 30+

  // Weather-based suggestions (time-aware)
  if (weatherDesc) {
    const weatherLower = weatherDesc.toLowerCase()
    if (weatherLower.includes('rain') || weatherLower.includes('storm')) {
      suggestions.push({
        action: 'Create a cozy moment with warm tea and gentle music',
        why: 'Rainy weather invites us inward. Coziness is self-care.',
        practice: 'Make your favorite warm drink.\nFind a comfortable spot.\nPut on music that soothes you.\nJust be present for 10 minutes.',
        duration: '10 mins'
      })
    } else if ((weatherLower.includes('sun') || weatherLower.includes('clear')) && hour >= 6 && hour < 19) {
      // Only suggest sunlight during daylight hours (6 AM – 7 PM)
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
          action: useTechLanguage || preferTechLanguage ? 'Run breathing protocol to reset nervous system' : 'Practice 4–7–8 breathing to calm your nervous system',
          why: 'You\'ve been experiencing tension. This activates your parasympathetic nervous system.',
          practice: 'Breathe in for 4 counts.\nHold for 7 counts.\nExhale slowly for 8 counts.\nRepeat 4 times.',
          duration: '2 mins'
        },
        {
          action: 'Use Breathe module to guide your breathing',
          why: 'Visual breathing guidance helps maintain rhythm when anxiety makes focus hard.',
          practice: 'Go to top of System.\nClick Breathe.\nFollow the expanding circle.\nLet it pace you.\nStay for 5 cycles.',
          duration: '3 mins'
        },
        {
          action: 'Name and release your worries',
          why: 'Anxiety lives in the unnamed. Speaking worries aloud diminishes their power.',
          practice: 'Close your eyes.\nName one worry out loud.\nSay: "I see you, but you don\'t control me."\nTake a deep breath and let it go.',
          duration: '3 mins'
        },
        {
          action: useTechLanguage || preferTechLanguage ? 'Run grounding sequence: 5–4–3–2–1 sensory scan' : 'Ground yourself with the 5–4–3–2–1 technique',
          why: 'Overwhelm pulls you from the present. Grounding brings you back.',
          practice: 'Name 5 things you see.\n4 things you can touch.\n3 things you hear.\n2 things you smell.\n1 thing you taste.',
          duration: '3 mins'
        },
        {
          action: 'Turn on Sound for calming ambient tones',
          why: 'Sound masks anxious thoughts and creates a soothing container.',
          practice: 'Go to top of System.\nClick Sound.\nChoose calming tones.\nClose your eyes.\nLet the sound hold you.',
          duration: '5 mins'
        }
      )
    } else if (['tired', 'exhausted'].includes(dominantMood)) {
      suggestions.push(
        {
          action: useTechLanguage || preferTechLanguage ? 'Initialize power rest cycle (not nap)' : 'Take a power rest (not nap)',
          why: 'Your body is asking for restoration. Short rest can restore energy.',
          practice: 'Lie down comfortably.\nClose your eyes.\nDon\'t try to sleep.\nJust let your body rest.\nSet a timer for 10 minutes.',
          duration: '10 mins'
        },
        {
          action: 'Practice radical permission to rest',
          why: 'Tiredness is not weakness. Your body deserves rest without guilt.',
          practice: 'Say out loud: "I give myself permission to be tired."\nPlace hand on heart.\nBreathe slowly.\nRest for 5 minutes without doing anything.',
          duration: '5 mins'
        },
        {
          action: 'Rest with ambient Sound to support restoration',
          why: 'Gentle sound creates a safe container for deep rest without full sleep.',
          practice: 'Turn on Sound.\nChoose soft flowing tones.\nLie down or sit back.\nClose eyes.\nLet sound carry you.',
          duration: '10 mins'
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
          action: 'Journal this peaceful state in your Log',
          why: 'Recording peace helps you remember what created it. Future you will thank you.',
          practice: 'Open your Log.\nWrite what contributed to this peace.\nName the feeling.\nNote the conditions.\nSave it.',
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
      suggestions.push(
        {
          action: 'Channel your energy into creative movement',
          why: 'High energy is a gift. Movement helps you embody and direct it.',
          practice: 'Put on music that matches your energy.\nMove freely for 3 minutes.\nNo rules, just expression.\nNotice how the energy flows.',
          duration: '3 mins'
        },
        {
          action: 'Put on Radio and move to the music',
          why: 'Music amplifies energy and gives it direction. Let your body express what you feel.',
          practice: 'Turn on Radio.\nFind a track that matches your vibe.\nStand up.\nMove however feels right.\nEmbody the aliveness.',
          duration: '5 mins'
        }
      )
    } else if (['lonely', 'disconnected', 'isolated'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Connect with your cohort in Sync',
          why: 'Loneliness dissolves through shared presence. Your cohort is there.',
          practice: 'Open Sync tab.\nRead messages from others.\nShare something honest.\nRemember: you\'re not alone.',
          duration: '10 mins'
        },
        {
          action: 'Write about the disconnection in your Log',
          why: 'Naming isolation begins the path back to connection. Your words matter.',
          practice: 'Open your Log.\nWrite: "I feel disconnected."\nExplore why.\nBe honest.\nNo one has to see this but you.',
          duration: '5 mins'
        }
      )
    }
  }

  // Archetype-based suggestions
  if (archetype) {
    if (archetype === 'The Seeker') {
      suggestions.push(
        {
          action: 'Reflective inquiry practice',
          why: 'Your Seeker nature thrives on self-discovery.',
          practice: 'Ask yourself: "What am I discovering about myself right now?"\n\nSit with the question.\nDon\'t force answers.\nNotice what arises.',
          duration: '5 mins'
        },
        {
          action: 'Journal your seeking in your Log',
          why: 'Seekers discover themselves through writing. Your Log holds your journey.',
          practice: 'Open your Log.\nWrite what you\'re seeking right now.\nWhat questions live in you?\nLet the writing reveal answers.',
          duration: '10 mins'
        }
      )
    } else if (archetype === 'The Nurturer') {
      suggestions.push(
        {
          action: 'Practice nurturing yourself as you would a loved one',
          why: 'Nurturers often forget to care for themselves.',
          practice: 'Place hand on heart.\nSay: "I deserve care too."\nDo one small kind thing for yourself.\nNotice how it feels.',
          duration: '3 mins'
        },
        {
          action: 'Share care with your cohort in Sync',
          why: 'Nurturers thrive in community. Giving and receiving care creates balance.',
          practice: 'Open Sync.\nOffer encouragement to someone.\nReceive messages sent to you.\nLet care flow both ways.',
          duration: '10 mins'
        }
      )
    } else if (archetype === 'The Creator') {
      suggestions.push(
        {
          action: 'Free expression: creating without purpose',
          why: 'Your Creator soul needs expression without judgment.',
          practice: 'Grab any creative medium.\nSet timer for 5 minutes.\nCreate without planning.\nNo goal, just expression.',
          duration: '5 mins'
        },
        {
          action: 'Write stream-of-consciousness in your Log',
          why: 'Creators need raw expression. Your Log is canvas for unfiltered creation.',
          practice: 'Open your Log.\nWrite without stopping.\nDon\'t edit, censor, or plan.\nLet words flow.\nThis is creation.',
          duration: '10 mins'
        }
      )
    }
  }

  // Time-based suggestions
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
      },
      {
        action: useTechLanguage || preferTechLanguage ? 'Clear cache: clean one surface' : 'Morning space clearing: clean one surface',
        why: 'Clean space creates mental clarity. One clear surface changes the energy.',
        practice: 'Choose one surface (desk, counter, nightstand).\nClear everything off.\nWipe it clean.\nPlace back only what serves you.\nNotice the clarity.',
        duration: '5 mins'
      },
      {
        action: 'Shinrin-yoku (Japanese forest bathing)',
        why: 'Nature connection lowers stress hormones and restores vitality.',
        practice: 'Step outside, even to a small green space.\nMove slowly.\nEngage all 5 senses.\nNotice trees, plants, earth.\nBreathe deeply.',
        duration: '10 mins'
      },
      {
        action: 'Korean facial cleansing ritual',
        why: 'Cleansing is both physical and symbolic. It releases what you carried from yesterday.',
        practice: 'Wash face with warm water.\nGentle circular motions.\nSplash with cool water.\nPat dry softly.\nSay: "I begin fresh."',
        duration: '3 mins'
      }
    )
  } else if (hour >= 12 && hour < 14) {
    suggestions.push(
      {
        action: useTechLanguage || preferTechLanguage ? 'Execute midday reset: pause and recalibrate systems' : 'Midday reset: pause and recalibrate',
        why: 'Midday is when we lose ourselves in doing. Pausing restores awareness.',
        practice: 'Stop what you\'re doing.\nClose your eyes.\nAsk: "What do I need right now?"\nListen for the answer.\nGive yourself that one thing.',
        duration: '3 mins'
      },
      {
        action: 'Fika (Swedish coffee break ritual)',
        why: 'Fika is sacred pause, not productivity break. Pleasure is restorative.',
        practice: 'Make your favorite warm drink.\nSit without devices.\nSip slowly.\nNotice the taste, warmth, moment.\nDo absolutely nothing else.',
        duration: '10 mins'
      },
      {
        action: 'Sobremesa (Latin American after-meal lingering)',
        why: 'Rushing from meal to task denies digestion and connection. Lingering is nourishing.',
        practice: 'After eating, stay seated.\nDon\'t rush to the next thing.\nBreathe.\nLet your body digest.\nSavor the transition.',
        duration: '5 mins'
      }
    )
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
        action: useTechLanguage || preferTechLanguage ? 'Run body scan: head to toes diagnostic' : 'Body scan to transition from day to night',
        why: 'Your body holds the day\'s stress. Releasing it prepares you for rest.',
        practice: 'Lie down or sit comfortably.\nClose your eyes.\nScan from head to toes.\nWhere is tension?\nBreathe into those places.',
        duration: '5 mins'
      },
      {
        action: useTechLanguage || preferTechLanguage ? 'Clear daily cache: reset your environment' : 'Evening space reset: clear what accumulated today',
        why: 'Physical clutter mirrors mental clutter. Evening clearing creates morning ease.',
        practice: 'Spend 5 minutes resetting your space.\nPut items back where they belong.\nClear one surface.\nPrepare for tomorrow.\nNotice the calm.',
        duration: '5 mins'
      },
      {
        action: 'Abhyanga (Ayurvedic self-massage)',
        why: 'Warm oil massage calms the nervous system and honors the body.',
        practice: 'Warm a small amount of oil.\nMassage feet, hands, or scalp with gentle circles.\nTake your time.\nAppreciate your body.\nBreathe slowly.',
        duration: '10 mins'
      },
      {
        action: 'Hot towel face rest (Korean jjimjilbang-inspired)',
        why: 'Heat releases tension held in facial muscles. It signals safety to your nervous system.',
        practice: 'Heat a damp towel (warm, not burning).\nPlace over face and breathe.\nLie down if possible.\nStay for 5 minutes.\nFeel tension melt.',
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
        action: 'Use Breathe for visual breath guidance',
        why: 'The Breathe module offers gentle visual pacing for your breath.',
        practice: 'Click Breathe at top of System.\nWatch the circle expand and contract.\nSync your breath to its rhythm.\nStay present.',
        duration: '3 mins'
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
        action: 'Write one sentence in your Log',
        why: 'Even one sentence captures the moment. Your Log preserves what matters.',
        practice: 'Open your Log.\nWrite one true sentence about right now.\nThat\'s it.\nOne sentence is enough.',
        duration: '1 min'
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
      },
      {
        action: 'Mindful cleaning: wash one dish slowly',
        why: 'Cleaning is meditation when done with full attention. Clarity comes through care.',
        practice: 'Choose one dish.\nFeel the warm water.\nNotice the soap, the movements.\nMake it a meditation.\nFinish with gratitude.',
        duration: '3 mins'
      },
      {
        action: 'Wabi-sabi moment: find beauty in imperfection',
        why: 'Japanese wabi-sabi teaches us perfection is not the goal. Beauty lives in the worn, the weathered, the real.',
        practice: 'Look for something imperfect nearby.\nA crack, a stain, asymmetry.\nSee its unique beauty.\nSay: "This too is perfect as it is."',
        duration: '2 mins'
      },
      {
        action: 'Ubuntu practice: recognize your connection',
        why: 'African Ubuntu philosophy: "I am because we are." Connection is fundamental.',
        practice: 'Think of someone in your life.\nSay: "I am because you are."\nFeel the truth of interdependence.\nBreathe with gratitude.',
        duration: '2 mins'
      },
      {
        action: 'Connect with others in Sync',
        why: 'Community dissolves isolation. Your cohort understands.',
        practice: 'Open Sync tab.\nRead what others shared.\nOffer a kind word.\nReceive support.\nYou belong.',
        duration: '10 mins'
      },
      {
        action: 'Mediterranean olive oil hand ritual',
        why: 'The hands carry the day\'s work. Honoring them honors your effort.',
        practice: 'Warm a few drops of oil in palms.\nMassage each finger slowly.\nPress thumbs into palm.\nNotice the texture, warmth.\nThank your hands.',
        duration: '3 mins'
      },
      {
        action: 'Turn on Sound and just listen',
        why: 'Sound creates spaciousness. Listening is meditation.',
        practice: 'Click Sound at top.\nChoose any tone.\nClose your eyes.\nDon\'t do anything else.\nJust listen.',
        duration: '5 mins'
      },
      {
        action: 'Explore Radio for musical medicine',
        why: 'Music shifts state instantly. Let sound move through you.',
        practice: 'Turn on Radio.\nListen to a few tracks.\nNotice how each one affects you.\nStay with what resonates.',
        duration: '10 mins'
      },
      {
        action: 'Organize one small drawer or space',
        why: 'Order in small spaces creates mental spaciousness. Start small.',
        practice: 'Choose one drawer or shelf.\nEmpty it completely.\nWipe clean.\nReturn only what belongs.\nArrange with care.',
        duration: '10 mins'
      },
      {
        action: 'Cold water face splash (Scandinavian tradition)',
        why: 'Cold water activates your vagus nerve, reducing stress and increasing alertness.',
        practice: 'Splash face with cold water 3 times.\nPat dry.\nNotice the clarity.\nFeel the aliveness.\nTake a full breath.',
        duration: '1 min'
      },
      {
        action: 'Golden milk moment (Indian tradition)',
        why: 'Turmeric, warm milk, and spices calm inflammation and signal comfort to your body.',
        practice: 'Make warm milk with turmeric and honey.\nStir slowly.\nCup in both hands.\nSip with full attention.\nFeel the warmth spread.',
        duration: '5 mins'
      },
      {
        action: 'Clear one surface as sacred space',
        why: 'Every cleared space is a sanctuary. Creating it is a practice of devotion.',
        practice: 'Choose one surface.\nRemove everything.\nWipe clean.\nPlace only one meaningful object.\nSit nearby and breathe.',
        duration: '5 mins'
      },
      {
        action: 'Window cleaning meditation',
        why: 'Clean windows change how light enters. Clarity outside creates clarity within.',
        practice: 'Clean one window pane.\nSlow circles.\nNotice the transformation.\nWatch light differently.\nAppreciate the view.',
        duration: '5 mins'
      }
    )
  }

  // Random selection from contextual suggestions
  const randomIndex = Math.floor(Math.random() * suggestions.length)
  return suggestions[randomIndex]
}
