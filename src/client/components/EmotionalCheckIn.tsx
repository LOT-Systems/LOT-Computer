import React from 'react'
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

/**
 * Emotional Check-In Widget - Clickable cycling through check-in, history, patterns
 * Pattern: Check-In > History > Patterns
 */
export function EmotionalCheckIn() {
  const [view, setView] = React.useState<CheckInView>('prompt')
  const [response, setResponse] = React.useState<string | null>(null)
  const [insight, setInsight] = React.useState<string[] | null>(null)
  const [isDisplayed, setIsDisplayed] = React.useState(true)
  const [isShown, setIsShown] = React.useState(true)
  const [isPromptShown, setIsPromptShown] = React.useState(true)
  const [isResponseShown, setIsResponseShown] = React.useState(false)
  const [clickedButtonIndex, setClickedButtonIndex] = React.useState<number | null>(null)
  const [shouldRender, setShouldRender] = React.useState(true) // Control whether widget should render at all

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
      // Fade out buttons
      setIsPromptShown(false)

      // Wait for buttons to fade out completely (1500ms - matches Memory widget)
      setTimeout(() => {
        // Set the affirmation/response (no need to clear first - direct replacement)
        const fullResponse = data.compassionateResponse || 'Noted.'
        setResponse(fullResponse)
        setInsight(data.insights)

        // Fade in the response
        setTimeout(() => {
          setIsResponseShown(true)

          // Show response for a while, then fade out entire widget
          setTimeout(() => {
            setIsShown(false)

            // After widget fades out, hide it completely and reset state (matches Memory widget)
            setTimeout(() => {
              setIsDisplayed(false)
              setIsResponseShown(false)
              setResponse(null)
              setInsight(null)
              setShouldRender(false) // Now safe to stop rendering
            }, 1500)
          }, data.insights?.length ? 7000 : 5000) // Show longer if there are insights
        }, 100)
      }, 1500)
    }
  })

  const cycleView = () => {
    // When cycling views, reset response state
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
    // Prevent double-clicks during API call
    if (isLoading || !isPromptShown) return

    const hour = new Date().getHours()
    const checkInType = hour < 12 ? 'morning' : hour >= 19 ? 'evening' : 'moment'

    // Record which button was clicked for cascade effect
    setClickedButtonIndex(buttonIndex)

    // Record intention signal for quantum pattern recognition
    recordSignal('mood', emotionalState, { checkInType, hour })

    createCheckIn({
      checkInType,
      emotionalState,
      intensity: 5, // Default intensity
    })
  }

  if (!shouldRender || !isDisplayed) return null

  const label =
    view === 'prompt' ? 'Mood:' :
    view === 'history' ? 'History:' :
    view === 'patterns' ? 'Patterns:' :
    'Graph:'

  // Determine check-in type based on time
  const hour = new Date().getHours()
  const checkInLabel =
    hour < 12 ? 'Morning' :
    hour >= 19 ? 'Evening' :
    'Right Now'

  // Calculate cascade delay based on distance from clicked button
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
          {!response && (
            <>
              <div className={cn(
                'mb-16 transition-opacity duration-[1400ms]',
                isPromptShown ? 'opacity-100' : 'opacity-0'
              )}>
                {checkInLabel === 'Morning' && 'How is your morning?'}
                {checkInLabel === 'Evening' && 'How is your evening?'}
                {checkInLabel === 'Right Now' && 'How are you right now?'}
              </div>
              <div className="flex flex-wrap gap-8">
                <Button
                  onClick={() => handleCheckIn('energized', 0)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(0) }}
                >
                  Energized
                </Button>
                <Button
                  onClick={() => handleCheckIn('calm', 1)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(1) }}
                >
                  Calm
                </Button>
                <Button
                  onClick={() => handleCheckIn('tired', 2)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(2) }}
                >
                  Tired
                </Button>
                <Button
                  onClick={() => handleCheckIn('anxious', 3)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(3) }}
                >
                  Anxious
                </Button>
                <Button
                  onClick={() => handleCheckIn('hopeful', 4)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(4) }}
                >
                  Hopeful
                </Button>
                <Button
                  onClick={() => handleCheckIn('grateful', 5)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(5) }}
                >
                  Grateful
                </Button>
                <Button
                  onClick={() => handleCheckIn('overwhelmed', 6)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(6) }}
                >
                  Overwhelmed
                </Button>
                <Button
                  onClick={() => handleCheckIn('content', 7)}
                  className={cn(
                    'transition-opacity duration-[1400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: getCascadeDelay(7) }}
                >
                  Content
                </Button>
              </div>
            </>
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
                    <div key={idx}>• {i}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === 'history' && checkInsData && (
        <div className="inline-block">
          {checkInsData.checkIns.length === 0 ? (
            <div>No check-ins yet. Start tracking your mood.</div>
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
        <div className="inline-block">
          {checkInsData.stats.total === 0 ? (
            <div>Check in more to see patterns.</div>
          ) : (
            <>
              <div className="mb-12">
                <div className="flex items-center gap-8">
                  <span className="text-[20px]">{checkInsData.stats.total}</span>
                  <span>Check-ins</span>
                </div>
              </div>
              {checkInsData.stats.dominantMood && (
                <div className="mb-16">
                  Most common: <span className="capitalize">{checkInsData.stats.dominantMood}</span>
                </div>
              )}
              <a
                href="/api/export/emotional-checkins"
                download
                className="opacity-75 hover:opacity-100 transition-opacity underline"
              >
                Export as CSV
              </a>
            </>
          )}
        </div>
      )}

      {view === 'graph' && checkInsData && (
        <div className="inline-block">
          {checkInsData.checkIns.length === 0 ? (
            <div>Check in more to see your mood timeline.</div>
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

                  if (positive.includes(state)) return '+'
                  if (challenging.includes(state)) return '−'
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
                      <div key={date} className="flex items-center gap-8 opacity-40">
                        <span className="w-[60px]">{dayLabel}</span>
                        <span className="opacity-60">−</span>
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
                      <span className="capitalize opacity-75">{dominantMood}</span>
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
