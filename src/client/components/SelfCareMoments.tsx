/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button } from '#client/components/ui'
import { useProfile, useEmotionalCheckIns, useCreateLog, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'
import { ProgressBars } from '#client/utils/progressBars'
import { getStoicReflection, getProgressAffirmation } from '#client/utils/narrative'
import { useLogContext } from '#client/hooks/useLogContext'

type CareView = 'suggestion' | 'why' | 'practice'

type CareSuggestion = {
  action: string
  why: string
  practice: string
  duration: string
}

/**
 * Cleanness Widget – CQGS Bioethics self-care module
 * Pattern: Cleanness > Why This > Practice
 * Adapts based on: biofield state, weather, archetype, time
 * CQGS Bioethics: Cleanness is the first pillar — care of the self,
 * hygiene, environment, and the daily routine that sustains the biofield.
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
  const logCtx = useLogContext()

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

    // Show completion message with stoic reflection
    const affirmation = getProgressAffirmation({
      type: 'consistency',
      value: currentStreak + 1
    })
    const stoicReflection = getStoicReflection({
      streak: currentStreak + 1,
      actionsToday: newCount
    })
    setCompletionMessage(`${affirmation}\n\n${stoicReflection}`)

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
      <Block label="Cleanness:" blockView>
        <div className="opacity-30">Loading suggestion...</div>
      </Block>
    )
  }

  if (!isVisible) return null

  const label =
    view === 'suggestion' ? 'Cleanness:' :
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
        <div className="w-full">
          {(() => {
            const quantumReason = localStorage.getItem('selfcare-quantum-reason')
            // Log-context-grounded reason when quantum reason is absent
            const contextReason = !quantumReason && !logCtx.isEmpty
              ? (logCtx.moodTrend === 'declining' ? 'Mood declining. Break the pattern.'
                : logCtx.hoursSinceLastActivity !== null && logCtx.hoursSinceLastActivity > 6 ? 'Been a while. Start with something small.'
                : logCtx.todaySelfCareCount > 0 ? `${logCtx.todaySelfCareCount} session${logCtx.todaySelfCareCount === 1 ? '' : 's'} today. Keep going.`
                : logCtx.timePhase === 'evening' ? 'Evening. Restore before rest.'
                : null)
              : null
            return (quantumReason || contextReason) ? (
              <div className="opacity-30 mb-8">
                {quantumReason || contextReason}
              </div>
            ) : null
          })()}
          <div className={cn("", (completedToday > 0 || currentStreak > 0) ? "mb-8" : "mb-16")}>
            {currentSuggestion.action} ({currentSuggestion.duration})
          </div>
          {(completedToday > 0 || currentStreak > 0) && (
            <div className="mb-16">
              {completedToday > 0 && <div>{completedToday} done today</div>}
              {currentStreak > 1 && (
                <div className="flex items-center gap-8">
                  <ProgressBars
                    percentage={Math.min(100, (currentStreak / 30) * 100)}
                    barCount={10}
                  />
                  <span>{currentStreak} day streak</span>
                </div>
              )}
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
        <div>
          <div className="opacity-30">{currentSuggestion.why}</div>
        </div>
      )}

      {view === 'practice' && (
        <div className="w-full">
          {isTimerRunning && (
            <div className="mb-8">
              {formatTime(timeRemaining)}
            </div>
          )}
          <div className="mb-16">{currentSuggestion.practice.replace(/\n+/g, ' ')}</div>
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
 * Generate contextual cleanness suggestion based on CQGS Bioethics framework
 * Language adapts based on user's practice level (streak)
 * Pillars: Cleanness, Routine, Nutrition, Laughter
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
        action: 'Warm drink. Gentle music. Be present.',
        why: 'Rain invites you inward. Use it.',
        practice: 'Make your favorite warm drink.\nFind a comfortable spot.\nPut on music that soothes you.\nJust be present for 10 minutes.',
        duration: '10 mins'
      })
    } else if ((weatherLower.includes('sun') || weatherLower.includes('clear')) && hour >= 6 && hour < 19) {
      // Only suggest sunlight during daylight hours (6 AM – 7 PM)
      suggestions.push({
        action: 'Step outside. Get sunlight.',
        why: 'Sunlight resets your rhythm and lifts mood.',
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
          action: useTechLanguage || preferTechLanguage ? 'Run 4-7-8 breathing protocol' : '4-7-8 breathing',
          why: 'Tension detected. This resets your nervous system.',
          practice: 'Breathe in for 4 counts.\nHold for 7 counts.\nExhale slowly for 8 counts.\nRepeat 4 times.',
          duration: '2 mins'
        },
        {
          action: 'Use Breathe for guided breathing',
          why: 'Visual pacing steadies you when focus is hard.',
          practice: 'Go to top of System.\nClick Breathe.\nFollow the expanding circle.\nLet it pace you.\nStay for 5 cycles.',
          duration: '3 mins'
        },
        {
          action: 'Name one worry out loud. Then release it.',
          why: 'Anxiety lives in the unnamed. Name it. Shrink it.',
          practice: 'Close your eyes.\nName one worry out loud.\nSay: "I see you, but you don\'t control me."\nTake a deep breath and let it go.',
          duration: '3 mins'
        },
        {
          action: useTechLanguage || preferTechLanguage ? 'Grounding sequence: 5-4-3-2-1 sensory scan' : '5-4-3-2-1 grounding',
          why: 'Overwhelm pulls you away. This brings you back.',
          practice: 'Name 5 things you see.\n4 things you can touch.\n3 things you hear.\n2 things you smell.\n1 thing you taste.',
          duration: '3 mins'
        },
        {
          action: 'Turn on Sound. Close your eyes.',
          why: 'Sound displaces anxious thoughts. Let it hold you.',
          practice: 'Go to top of System.\nClick Sound.\nClose your eyes.\nLet the sound hold you.',
          duration: '5 mins'
        }
      )
    } else if (['tired', 'exhausted'].includes(dominantMood)) {
      suggestions.push(
        {
          action: useTechLanguage || preferTechLanguage ? 'Power rest cycle. 10 minutes.' : 'Power rest. Not a nap. Just stop.',
          why: 'Your body is asking. Listen.',
          practice: 'Lie down comfortably.\nClose your eyes.\nDon\'t try to sleep.\nJust let your body rest.\nSet a timer for 10 minutes.',
          duration: '10 mins'
        },
        {
          action: 'Permission to be tired. Take it.',
          why: 'Tiredness is not weakness. Rest is not earned.',
          practice: 'Say out loud: "I give myself permission to be tired."\nPlace hand on heart.\nBreathe slowly.\nRest for 5 minutes without doing anything.',
          duration: '5 mins'
        },
        {
          action: 'Turn on Sound. Lie down. Let go.',
          why: 'Sound holds the space. You just rest.',
          practice: 'Turn on Sound.\nLie down or sit back.\nClose eyes.\nLet sound carry you.',
          duration: '10 mins'
        }
      )
    } else if (['grateful', 'content', 'peaceful'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Write 3 moments from today. Anchor this state.',
          why: 'Capture peace while it is here. Future you needs this.',
          practice: 'Get your journal.\nWrite 3 specific moments.\nWhat made each one special?\nHow did you feel?',
          duration: '5 mins'
        },
        {
          action: 'Log what created this peace.',
          why: 'Record it so you can recreate it.',
          practice: 'Open your Log.\nWrite what contributed to this peace.\nName the feeling.\nNote the conditions.\nSave it.',
          duration: '5 mins'
        },
        {
          action: 'Savor this. Stay in it.',
          why: 'Peace is rare. Savoring extends it.',
          practice: 'Close your eyes.\nNotice the peace in your body.\nWhere do you feel it?\nBreathe into that feeling.\nSay: "I am here."',
          duration: '3 mins'
        }
      )
    } else if (['energized', 'excited', 'hopeful'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Move. Put on music. Express this energy.',
          why: 'High energy is a gift. Move it through your body.',
          practice: 'Put on music that matches your energy.\nMove freely for 3 minutes.\nNo rules, just expression.\nNotice how the energy flows.',
          duration: '3 mins'
        },
        {
          action: 'Radio on. Stand up. Move.',
          why: 'Music amplifies energy. Let your body lead.',
          practice: 'Turn on Radio.\nFind a track that matches your vibe.\nStand up.\nMove however feels right.\nEmbody the aliveness.',
          duration: '5 mins'
        }
      )
    } else if (['lonely', 'disconnected', 'isolated'].includes(dominantMood)) {
      suggestions.push(
        {
          action: 'Open Sync. Your cohort is there.',
          why: 'Loneliness dissolves through presence. You are not alone.',
          practice: 'Open Sync tab.\nRead messages from others.\nShare something honest.\nRemember: you\'re not alone.',
          duration: '10 mins'
        },
        {
          action: 'Write about this disconnection.',
          why: 'Name it. That starts the path back.',
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
          action: 'Ask: "What am I discovering right now?"',
          why: 'Your nature thrives on inquiry. Feed it.',
          practice: 'Ask yourself: "What am I discovering about myself right now?"\n\nSit with the question.\nDon\'t force answers.\nNotice what arises.',
          duration: '5 mins'
        },
        {
          action: 'Journal what you are seeking.',
          why: 'Writing reveals what thinking cannot.',
          practice: 'Open your Log.\nWrite what you\'re seeking right now.\nWhat questions live in you?\nLet the writing reveal answers.',
          duration: '10 mins'
        }
      )
    } else if (archetype === 'The Nurturer') {
      suggestions.push(
        {
          action: 'Nurture yourself the way you nurture others.',
          why: 'You give to everyone. Include yourself.',
          practice: 'Place hand on heart.\nSay: "I deserve care too."\nDo one small kind thing for yourself.\nNotice how it feels.',
          duration: '3 mins'
        },
        {
          action: 'Share care in Sync. Give and receive.',
          why: 'Balance flows both ways. Let it.',
          practice: 'Open Sync.\nOffer encouragement to someone.\nReceive messages sent to you.\nLet care flow both ways.',
          duration: '10 mins'
        }
      )
    } else if (archetype === 'The Creator') {
      suggestions.push(
        {
          action: 'Create something. No purpose needed.',
          why: 'Expression without judgment. That is the practice.',
          practice: 'Grab any creative medium.\nSet timer for 5 minutes.\nCreate without planning.\nNo goal, just expression.',
          duration: '5 mins'
        },
        {
          action: 'Write in your Log. Unfiltered.',
          why: 'Raw expression is creation. Let it flow.',
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
        action: useTechLanguage || preferTechLanguage ? 'Morning cleanness protocol' : 'Make your bed. Clear one surface.',
        why: 'First act of order anchors the day.',
        practice: 'Make your bed.\nStraighten the sheets.\nFluff your pillow.\nClear the nearest surface.\nNotice the order you created.',
        duration: '5 mins'
      },
      {
        action: 'Morning body care. Slow and deliberate.',
        why: 'The body is the first environment. Tend to it.',
        practice: 'Wash your face with warm water.\nBrush your teeth slowly.\nLook at yourself in the mirror.\nSay: "I take care of myself."\nDress with intention.',
        duration: '5 mins'
      },
      {
        action: 'Choose one word for today.',
        why: 'Morning is the most powerful time to set direction.',
        practice: 'Close your eyes.\nAsk: "How do I want to feel today?"\nChoose one word.\nSay it out loud 3 times.',
        duration: '2 mins'
      },
      {
        action: 'Hands on heart. Welcome the day.',
        why: 'How you begin shapes everything that follows.',
        practice: 'Before checking your phone.\nPlace both hands on your heart.\nSay: "I welcome this day."\nTake 3 slow breaths.',
        duration: '2 mins'
      },
      {
        action: useTechLanguage || preferTechLanguage ? 'Cleanness protocol: one surface' : 'Clear one surface completely.',
        why: 'One clean surface changes the room.',
        practice: 'Choose one surface (desk, counter, nightstand).\nClear everything off.\nWipe it clean.\nPlace back only what serves you.\nNotice the clarity.',
        duration: '5 mins'
      },
      {
        action: 'Step outside. Move slowly. Use all senses.',
        why: 'Nature lowers stress and restores vitality.',
        practice: 'Step outside, even to a small green space.\nMove slowly.\nEngage all 5 senses.\nNotice trees, plants, earth.\nBreathe deeply.',
        duration: '10 mins'
      },
      {
        action: 'Wash your face slowly. Begin fresh.',
        why: 'Cleansing releases yesterday.',
        practice: 'Wash face with warm water.\nGentle circular motions.\nSplash with cool water.\nPat dry softly.\nSay: "I begin fresh."',
        duration: '3 mins'
      }
    )
  } else if (hour >= 12 && hour < 14) {
    suggestions.push(
      {
        action: useTechLanguage || preferTechLanguage ? 'Midday reset: pause and recalibrate' : 'Stop. Ask: "What do I need right now?"',
        why: 'Midday is when you lose yourself in doing. Pause.',
        practice: 'Stop what you\'re doing.\nClose your eyes.\nAsk: "What do I need right now?"\nListen for the answer.\nGive yourself that one thing.',
        duration: '3 mins'
      },
      {
        action: 'Warm drink. No devices. Just be.',
        why: 'Sacred pause. Not a productivity break.',
        practice: 'Make your favorite warm drink.\nSit without devices.\nSip slowly.\nNotice the taste, warmth, moment.\nDo absolutely nothing else.',
        duration: '10 mins'
      },
      {
        action: 'After eating, stay seated. Don\'t rush.',
        why: 'Lingering after a meal is nourishing. Let the body digest.',
        practice: 'After eating, stay seated.\nDon\'t rush to the next thing.\nBreathe.\nLet your body digest.\nSavor the transition.',
        duration: '5 mins'
      }
    )
  } else if (hour >= 14 && hour < 19) {
    suggestions.push(
      {
        action: useTechLanguage || preferTechLanguage ? 'Micro-cleanness sweep' : '5-minute reset. Put 5 things back.',
        why: 'Afternoon clutter compounds. Stop it now.',
        practice: 'Look around your space.\nPick up 5 items that are out of place.\nPut each one where it belongs.\nWipe one surface.\nNotice the difference.',
        duration: '5 mins'
      },
      {
        action: 'Without moving, tidy what is near you.',
        why: 'Cleanness is continuous, not an event.',
        practice: 'Without leaving your area:\nStraighten what\'s near you.\nDiscard one thing you no longer need.\nAlign objects with intention.\nCreate order from within reach.',
        duration: '3 mins'
      },
      {
        action: 'Clear your desk. Only essentials remain.',
        why: 'Clean desk, clear mind.',
        practice: 'Remove everything from your desk.\nWipe the surface.\nReturn only what you need right now.\nStore the rest.\nBreathe into the clarity.',
        duration: '5 mins'
      }
    )
  } else if (hour >= 19 && hour < 22) {
    suggestions.push(
      {
        action: 'Release the day. Three breaths. Let go.',
        why: 'Evenings need closure before rest.',
        practice: 'Take 3 deep breaths.\nSay: "I release what no longer serves me."\nName one thing you\'re letting go.\nExhale it fully.',
        duration: '3 mins'
      },
      {
        action: 'Name one thing that held you today.',
        why: 'Gratitude before sleep rewires your brain.',
        practice: 'Reflect on your day.\nName one thing that held you.\nIt can be small: a smile, sunlight, a moment of ease.\nSay thank you.',
        duration: '2 mins'
      },
      {
        action: useTechLanguage || preferTechLanguage ? 'Body scan: head to toes' : 'Scan your body. Where is the tension?',
        why: 'Your body holds the day. Release it before sleep.',
        practice: 'Lie down or sit comfortably.\nClose your eyes.\nScan from head to toes.\nWhere is tension?\nBreathe into those places.',
        duration: '5 mins'
      },
      {
        action: useTechLanguage || preferTechLanguage ? 'Cleanness flush: reset environment' : 'Reset your space. Prepare for tomorrow.',
        why: 'Evening clearing creates morning ease.',
        practice: 'Spend 5 minutes resetting your space.\nPut items back where they belong.\nClear one surface.\nPrepare for tomorrow.\nNotice the calm.',
        duration: '5 mins'
      },
      {
        action: 'Warm oil. Massage hands, feet, or scalp.',
        why: 'Self-massage calms the nervous system.',
        practice: 'Warm a small amount of oil.\nMassage feet, hands, or scalp with gentle circles.\nTake your time.\nAppreciate your body.\nBreathe slowly.',
        duration: '10 mins'
      },
      {
        action: 'Hot towel on face. Melt the tension.',
        why: 'Heat signals safety to your nervous system.',
        practice: 'Heat a damp towel (warm, not burning).\nPlace over face and breathe.\nLie down if possible.\nStay for 5 minutes.\nFeel tension melt.',
        duration: '5 mins'
      }
    )
  } else if (hour >= 22 || hour < 6) {
    suggestions.push({
      action: 'Hand on heart. "I did my best today."',
      why: 'Late hours bring harsh thoughts. Counter them with truth.',
      practice: 'Place hand on your heart.\nSay: "I did my best today."\nBreathe.\nSay: "I am enough."\nLet yourself rest.',
      duration: '2 mins'
    })
  }

  // Default suggestions if none match
  if (suggestions.length === 0) {
    suggestions.push(
      {
        action: 'Three conscious breaths. Right now.',
        why: 'Breath is always available. Use it.',
        practice: 'Breathe in slowly.\nPause at the top.\nBreathe out slowly.\nRepeat 3 times.\nNotice how you feel.',
        duration: '1 min'
      },
      {
        action: 'Open Breathe. Follow the circle.',
        why: 'Visual pacing steadies the breath.',
        practice: 'Click Breathe at top of System.\nWatch the circle expand and contract.\nSync your breath to its rhythm.\nStay present.',
        duration: '3 mins'
      },
      {
        action: 'Stand up. Stretch. Move.',
        why: 'Your body holds tension. Release it.',
        practice: 'Stand up.\nReach arms overhead.\nSide bend both ways.\nRoll shoulders.\nNotice what feels tight.',
        duration: '2 mins'
      },
      {
        action: 'Drink water. Slowly.',
        why: 'Hydration affects everything.',
        practice: 'Get water.\nHold the glass.\nTake slow sips.\nFeel the water nourishing you.\nSay thank you to your body.',
        duration: '2 mins'
      },
      {
        action: 'One sentence in your Log. That is enough.',
        why: 'One true sentence captures more than you think.',
        practice: 'Open your Log.\nWrite one true sentence about right now.\nThat\'s it.\nOne sentence is enough.',
        duration: '1 min'
      },
      {
        action: 'What are you carrying? Set it down.',
        why: 'You have permission to put it down.',
        practice: 'Close your eyes.\nAsk: "What am I holding that isn\'t mine to carry?"\nImagine setting it down.\nFeel the lightness.',
        duration: '3 mins'
      },
      {
        action: 'Find one beautiful thing near you. Look at it.',
        why: 'Noticing beauty shifts your state instantly.',
        practice: 'Look around.\nFind one thing that brings you ease.\nReally look at it for 1 minute.\nNotice its details.\nSay: "Thank you for being here."',
        duration: '2 mins'
      },
      {
        action: 'Hand on heart. Five breaths.',
        why: 'Your own touch heals.',
        practice: 'Place your hand on your chest.\nFeel your heartbeat.\nBreathe slowly.\nSay: "I am here with you."\nStay for 5 breaths.',
        duration: '2 mins'
      },
      {
        action: 'Wash one dish with full attention.',
        why: 'Cleanness with attention is meditation.',
        practice: 'Choose one dish.\nFeel the warm water.\nNotice the soap, the movements.\nMake it a meditation.\nFinish with gratitude.',
        duration: '3 mins'
      },
      {
        action: 'Find beauty in something imperfect.',
        why: 'Perfection is not the goal. The real is beautiful.',
        practice: 'Look for something imperfect nearby.\nA crack, a stain, asymmetry.\nSee its unique beauty.\nSay: "This too is perfect as it is."',
        duration: '2 mins'
      },
      {
        action: 'Think of someone. Say: "I am because you are."',
        why: 'Connection is fundamental. You are not alone.',
        practice: 'Think of someone in your life.\nSay: "I am because you are."\nFeel the truth of interdependence.\nBreathe with gratitude.',
        duration: '2 mins'
      },
      {
        action: 'Open Sync. Read. Share. Belong.',
        why: 'Community dissolves isolation.',
        practice: 'Open Sync tab.\nRead what others shared.\nOffer a kind word.\nReceive support.\nYou belong.',
        duration: '10 mins'
      },
      {
        action: 'Oil on palms. Massage each finger slowly.',
        why: 'Your hands carry the day. Honor them.',
        practice: 'Warm a few drops of oil in palms.\nMassage each finger slowly.\nPress thumbs into palm.\nNotice the texture, warmth.\nThank your hands.',
        duration: '3 mins'
      },
      {
        action: 'Sound on. Eyes closed. Just listen.',
        why: 'Listening is meditation.',
        practice: 'Click Sound at top.\nClose your eyes.\nDon\'t do anything else.\nJust listen.',
        duration: '5 mins'
      },
      {
        action: 'Radio on. Let music move through you.',
        why: 'Music shifts state instantly.',
        practice: 'Turn on Radio.\nListen to a few tracks.\nNotice how each one affects you.\nStay with what resonates.',
        duration: '10 mins'
      },
      {
        action: 'One drawer. Empty. Wipe. Rebuild.',
        why: 'Order in small spaces creates mental spaciousness.',
        practice: 'Choose one drawer or shelf.\nEmpty it completely.\nWipe clean.\nReturn only what belongs.\nArrange with care.',
        duration: '10 mins'
      },
      {
        action: 'Cold water on face. Three splashes.',
        why: 'Activates your vagus nerve. Instant clarity.',
        practice: 'Splash face with cold water 3 times.\nPat dry.\nNotice the clarity.\nFeel the aliveness.\nTake a full breath.',
        duration: '1 min'
      },
      {
        action: 'Golden milk. Both hands. Sip slowly.',
        why: 'Turmeric calms inflammation. Warmth signals comfort.',
        practice: 'Make warm milk with turmeric and honey.\nStir slowly.\nCup in both hands.\nSip with full attention.\nFeel the warmth spread.',
        duration: '5 mins'
      },
      {
        action: 'Clear one surface. Make it sacred.',
        why: 'Every cleared space is a sanctuary.',
        practice: 'Choose one surface.\nRemove everything.\nWipe clean.\nPlace only one meaningful object.\nSit nearby and breathe.',
        duration: '5 mins'
      },
      {
        action: 'Clean one window. Watch the light change.',
        why: 'Clarity outside creates clarity within.',
        practice: 'Clean one window pane.\nSlow circles.\nNotice the transformation.\nWatch light differently.\nAppreciate the view.',
        duration: '5 mins'
      },
      {
        action: useTechLanguage || preferTechLanguage ? 'Space audit: scan and fix one thing' : 'Scan your space. Fix one thing.',
        why: 'Cleanness is not perfection. It is noticing and acting.',
        practice: 'Stand in the center of your room.\nSlowly scan 360 degrees.\nNotice what calls for attention.\nFix one thing.\nThat is enough.',
        duration: '3 mins'
      },
      {
        action: 'Wash one thing by hand. Slowly.',
        why: 'Water, attention, and care transform both object and person.',
        practice: 'Choose one item: a cup, a plate, a surface.\nUse warm water.\nMove slowly.\nFeel the transformation.\nDry it with care.',
        duration: '3 mins'
      },
      {
        action: 'Close every tab you don\'t need.',
        why: 'Digital clutter drains attention. Clear it.',
        practice: 'Close every tab you don\'t need.\nQuit apps running in the background.\nClear your desktop.\nOrganize one folder.\nNotice the lightness.',
        duration: '5 mins'
      },
      {
        action: 'Empty one bin. Let go of what is done.',
        why: 'What you discard creates space for what matters.',
        practice: 'Find the nearest bin or pile.\nSort what can be recycled.\nDiscard what is done.\nWipe the container.\nNotice the space created.',
        duration: '5 mins'
      }
    )
  }

  // Random selection from contextual suggestions
  const randomIndex = Math.floor(Math.random() * suggestions.length)
  return suggestions[randomIndex]
}
