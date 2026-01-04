import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useCreateEmotionalCheckIn, useEmotionalCheckIns } from '#client/queries'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'

type CheckInView = 'prompt' | 'history' | 'patterns'

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

  const { data: checkInsData } = useEmotionalCheckIns(30) // Last 30 days
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
        case 'patterns': return 'prompt'
        default: return 'prompt'
      }
    })
  }

  const handleCheckIn = (emotionalState: EmotionalState, buttonIndex: number) => {
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

  if (!isDisplayed) return null

  const label =
    view === 'prompt' ? 'Mood:' :
    view === 'history' ? 'History:' :
    'Patterns:'

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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                  disabled={!isPromptShown}
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
                <div>
                  Most common: <span className="capitalize">{checkInsData.stats.dominantMood}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Block>
  )
}
