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
import { useCreateEmotionalCheckIn, useEmotionalCheckIns, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'

type CheckInView = 'prompt' | 'history' | 'patterns' | 'graph'

type EmotionalState =
  | 'energized'
  | 'calm'
  | 'tired'
  | 'anxious'
  | 'hopeful'
  | 'fulfilled'
  | 'exhausted'
  | 'grateful'
  | 'restless'
  | 'content'
  | 'overwhelmed'
  | 'peaceful'
  | 'excited'
  | 'uncertain'
  | 'grounded'
  | 'focused'
  | 'drained'
  | 'steady'
  | 'flowing'
  | 'depleted'
  | 'unsettled'
  | 'heavy'

/**
 * Biofield Check-In Widget - Emotional state as biofield emission
 * CQGS Bioethics: Laughter is the primary metric of a healthy human being.
 * Genuine laughter can't be faked and is always a result of curiosity.
 * Pattern: Check-In > History > Patterns > Graph
 */
// Returns a short weather context word (e.g. "Rainy", "Sunny", "Overcast") or null
function getWeatherContext(description: string | undefined): string | null {
  if (!description) return null
  const d = description.toLowerCase()
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return 'Rainy'
  if (d.includes('snow') || d.includes('sleet') || d.includes('blizzard')) return 'Snowy'
  if (d.includes('storm') || d.includes('thunder')) return 'Stormy'
  if (d.includes('clear') || d.includes('sunny')) return 'Sunny'
  if (d.includes('cloud') || d.includes('overcast')) return 'Overcast'
  if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return 'Foggy'
  if (d.includes('wind')) return 'Windy'
  return null
}

// Time-of-day labels and corresponding offered answer sets
function getTimeSlot(hour: number): { label: string; checkInType: 'morning' | 'evening' | 'moment'; answers: EmotionalState[] } {
  if (hour >= 5 && hour < 12) return {
    label: 'morning',
    checkInType: 'morning',
    answers: ['energized', 'grounded', 'anxious', 'tired', 'hopeful', 'calm'],
  }
  if (hour >= 12 && hour < 17) return {
    label: 'afternoon',
    checkInType: 'moment',
    answers: ['focused', 'flowing', 'drained', 'steady', 'overwhelmed', 'grateful'],
  }
  if (hour >= 17 && hour < 22) return {
    label: 'evening',
    checkInType: 'evening',
    answers: ['content', 'peaceful', 'depleted', 'restless', 'grateful', 'unsettled'],
  }
  return {
    label: 'now',
    checkInType: 'moment',
    answers: ['calm', 'heavy', 'peaceful', 'tired', 'grateful', 'restless'],
  }
}

export function EmotionalCheckIn() {
  const [view, setView] = React.useState<CheckInView>('prompt')
  const [response, setResponse] = React.useState<string | null>(null)
  const [insight, setInsight] = React.useState<string[] | null>(null)
  const [isDisplayed, setIsDisplayed] = React.useState(true)
  const [isShown, setIsShown] = React.useState(true)
  const [isPromptShown, setIsPromptShown] = React.useState(true)
  const [isResponseShown, setIsResponseShown] = React.useState(false)
  const [clickedButtonIndex, setClickedButtonIndex] = React.useState<number | null>(null)
  const [shouldRender, setShouldRender] = React.useState(true)
  const [pendingState, setPendingState] = React.useState<string | null>(null)

  const weather = useStore(stores.weather)
  const { data: checkInsData } = useEmotionalCheckIns(30) // Last 30 days
  const { data: logs = [] } = useLogs()

  // Check visibility based on time and cooldown
  React.useEffect(() => {
    const hour = new Date().getHours()
    const isMorning = hour >= 6 && hour < 12
    const isEvening = hour >= 17 && hour < 22
    const isMidDay = hour >= 12 && hour < 17

    // Check if 3 hours have passed since last check-in
    const emotionalCheckIns = logs.filter(log => log.event === 'emotional_checkin')
    const lastCheckIn = emotionalCheckIns[0]
    const threeHoursMs = 3 * 60 * 60 * 1000
    const threeHoursPassed = !lastCheckIn ||
      (Date.now() - new Date(lastCheckIn.createdAt).getTime()) >= threeHoursMs

    // Only hide if cooldown hasn't passed AND we're not currently showing a response
    // This ensures the widget can complete its farewell animation
    if (!threeHoursPassed && !response) {
      setShouldRender(false)
    } else if (threeHoursPassed && (isMorning || isEvening || isMidDay)) {
      setShouldRender(true)
    }
  }, [logs, response])

  const { mutate: createCheckIn, isLoading } = useCreateEmotionalCheckIn({
    onSuccess: (data) => {
      const fullResponse = data.compassionateResponse || 'Noted.'
      setPendingState(null)
      setResponse(fullResponse)
      setInsight(data.insights)

      setTimeout(() => {
        setIsResponseShown(true)

        setTimeout(() => {
          setIsShown(false)

          setTimeout(() => {
            setIsDisplayed(false)
            setIsResponseShown(false)
            setResponse(null)
            setInsight(null)
            setShouldRender(false)
          }, 1500)
        }, data.insights?.length ? 7000 : 5000)
      }, 100)
    }
  })

  // Compute time + weather context once, before any handlers
  const hour = new Date().getHours()
  const timeSlot = getTimeSlot(hour)
  const weatherCtx = getWeatherContext(weather?.description)

  // LOT AI: leads in morning + evening (check-in moments)
  // Biofield: in midday + afternoon + night (physiological tracking)
  const isLOTAIMoment = timeSlot.checkInType === 'morning' || timeSlot.checkInType === 'evening'

  const cycleView = () => {
    setIsResponseShown(false)
    setResponse(null)
    setInsight(null)
    setIsPromptShown(true)
    setClickedButtonIndex(null)

    setView(prev => {
      switch (prev) {
        case 'prompt': return 'history'
        case 'history': return 'patterns'
        case 'patterns': return 'graph'
        case 'graph': return 'prompt'
        default: return 'prompt'
      }
    })
  }

  const handleCheckIn = (emotionalState: EmotionalState, buttonIndex: number) => {
    if (isLoading || !isPromptShown) return

    setClickedButtonIndex(buttonIndex)
    setIsPromptShown(false)
    setPendingState(emotionalState)

    createCheckIn({
      checkInType: timeSlot.checkInType,
      emotionalState,
      intensity: 5,
    })

    setTimeout(() => {
      recordSignal('mood', emotionalState, { checkInType: timeSlot.checkInType, hour })
    }, 0)
  }

  if (!shouldRender || !isDisplayed) return null

  const weatherCtxStr = weatherCtx ? `${weatherCtx} ` : ''
  const timeLabel = timeSlot.label.charAt(0).toUpperCase() + timeSlot.label.slice(1)

  // Question: "[Weather][Time]. How are you?" for LOT AI moments
  //           "[Weather][Time]. How is your biofield?" for physiological moments
  const question = isLOTAIMoment
    ? `${weatherCtxStr}${timeLabel}. How are you?`
    : `${weatherCtxStr}${timeLabel}. How is your biofield?`

  const label =
    view === 'prompt'   ? (isLOTAIMoment ? 'LOT AI:' : 'Biofield:') :
    view === 'history'  ? 'History:' :
    view === 'patterns' ? 'Patterns:' :
    'Graph:'

  const getCascadeDelay = (buttonIndex: number) => {
    if (clickedButtonIndex === null || isPromptShown) return '0ms'
    const distance = Math.abs(buttonIndex - clickedButtonIndex)
    return `${distance * 120}ms`
  }

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
      className={cn(
        'opacity-0 transition-opacity duration-[1400ms]',
        isShown && 'opacity-100'
      )}
    >
      {view === 'prompt' && (
        <>
          {!response && !pendingState && (
            <>
              <div className={cn(
                'mb-16 transition-opacity duration-[1400ms]',
                isPromptShown ? 'opacity-100' : 'opacity-0'
              )}>
                → {question}
              </div>
              <div className="flex flex-wrap gap-8">
                {timeSlot.answers.map((state, idx) => (
                  <Button
                    key={state}
                    size="small"
                    onClick={() => handleCheckIn(state, idx)}
                    className={cn(
                      'transition-opacity duration-[1400ms]',
                      isPromptShown ? 'opacity-100' : 'opacity-0'
                    )}
                    style={{ transitionDelay: getCascadeDelay(idx) }}
                  >
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </Button>
                ))}
              </div>
            </>
          )}
          {!!pendingState && !response && (
            <div className="opacity-40 transition-opacity duration-[1400ms]">
              {pendingState.charAt(0).toUpperCase() + pendingState.slice(1)} — logged.
            </div>
          )}
          {!!response && (
            <div
              className={cn(
                'opacity-0 transition-opacity duration-[1400ms]',
                isResponseShown && 'opacity-100'
              )}
            >
              <div className="mb-8">{response}</div>
              {insight && insight.length > 0 && (
                <div>
                  {insight.map((i, idx) => (
                    <div key={idx}>↳ {i}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === 'history' && checkInsData && (
        <div>
          {checkInsData.checkIns.length === 0 ? (
            <div>→ No biofield readings yet. Start logging your state.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {checkInsData.checkIns.slice(0, 5).map((checkIn: any) => {
                const date = new Date(checkIn.createdAt)
                const time = date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
                return (
                  <div key={checkIn.id} className="flex items-center justify-between gap-16">
                    <span>{time}</span>
                    <span className="capitalize">{checkIn.metadata?.emotionalState}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {view === 'patterns' && checkInsData?.stats && (
        <div>
          {checkInsData.stats.total === 0 ? (
            <div>→ Log more readings to see biofield patterns.</div>
          ) : (
            <>
              <div className="mb-8">{checkInsData.stats.total} Biofield readings</div>
              {checkInsData.stats.dominantMood && (
                <div>
                  Most common: <span className="capitalize">{checkInsData.stats.dominantMood}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === 'graph' && checkInsData && (
        <div>
          {checkInsData.checkIns.length === 0 ? (
            <div>→ Log more biofield readings to see your timeline.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {(() => {
                // Group check-ins by date (last 14 days)
                const last14Days = Array.from({ length: 14 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - i)
                  return date.toISOString().split('T')[0]
                }).reverse()

                const checkInsByDate: { [key: string]: any[] } = {}
                checkInsData.checkIns.forEach((checkIn: any) => {
                  const date = new Date(checkIn.createdAt).toISOString().split('T')[0]
                  if (!checkInsByDate[date]) checkInsByDate[date] = []
                  checkInsByDate[date].push(checkIn)
                })

                // Map mood to simple indicator
                const getMoodIndicator = (state: string) => {
                  const positive = ['energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful', 'excited']
                  const neutral = ['restless', 'uncertain']
                  const challenging = ['tired', 'anxious', 'exhausted', 'overwhelmed']

                  if (positive.includes(state)) return '↑'
                  if (challenging.includes(state)) return '↓'
                  return '·'
                }

                return last14Days.map((date, idx) => {
                  const dayCheckIns = checkInsByDate[date] || []
                  const dateObj = new Date(date)
                  const dayLabel = idx === 13 ? 'Today' :
                    idx === 12 ? 'Yesterday' :
                    dateObj.toLocaleDateString('en-US', { weekday: 'short' })

                  if (dayCheckIns.length === 0) {
                    return (
                      <div key={date} className="flex items-center gap-8">
                        <span className="w-[60px]">{dayLabel}</span>
                        <span className="opacity-30">−</span>
                      </div>
                    )
                  }

                  // Show all check-ins for that day with their indicators
                  const indicators = dayCheckIns
                    .map(c => getMoodIndicator(c.metadata?.emotionalState))
                    .join(' ')

                  // Show dominant mood if multiple check-ins
                  const dominantMood = dayCheckIns.length === 1
                    ? dayCheckIns[0].metadata?.emotionalState
                    : (() => {
                        const counts: { [key: string]: number } = {}
                        dayCheckIns.forEach(c => {
                          const mood = c.metadata?.emotionalState
                          if (mood) counts[mood] = (counts[mood] || 0) + 1
                        })
                        return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0]
                      })()

                  return (
                    <div key={date} className="flex items-center gap-8">
                      <span className="w-[60px]">{dayLabel}</span>
                      <span className="w-[40px]">{indicators}</span>
                      <span className="capitalize">{dominantMood}</span>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
