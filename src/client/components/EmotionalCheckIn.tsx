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

    setView(prev => {
      switch (prev) {
        case 'prompt': return 'history'
        case 'history': return 'patterns'
        case 'patterns': return 'prompt'
        default: return 'prompt'
      }
    })
  }

  const handleCheckIn = (emotionalState: EmotionalState) => {
    const hour = new Date().getHours()
    const checkInType = hour < 12 ? 'morning' : hour >= 19 ? 'evening' : 'moment'

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
            <div
              className={cn(
                'opacity-0 transition-opacity duration-[1400ms]',
                isPromptShown && 'opacity-100'
              )}
            >
              <div className="mb-16">
                {checkInLabel === 'Morning' && 'How is your morning?'}
                {checkInLabel === 'Evening' && 'How is your evening?'}
                {checkInLabel === 'Right Now' && 'How are you right now?'}
              </div>
              <div className="flex flex-wrap gap-8">
                <Button
                  onClick={() => handleCheckIn('energized')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '0ms' : '0ms' }}
                >
                  Energized
                </Button>
                <Button
                  onClick={() => handleCheckIn('calm')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '50ms' : '0ms' }}
                >
                  Calm
                </Button>
                <Button
                  onClick={() => handleCheckIn('tired')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '100ms' : '0ms' }}
                >
                  Tired
                </Button>
                <Button
                  onClick={() => handleCheckIn('anxious')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '150ms' : '0ms' }}
                >
                  Anxious
                </Button>
                <Button
                  onClick={() => handleCheckIn('hopeful')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '200ms' : '0ms' }}
                >
                  Hopeful
                </Button>
                <Button
                  onClick={() => handleCheckIn('grateful')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '250ms' : '0ms' }}
                >
                  Grateful
                </Button>
                <Button
                  onClick={() => handleCheckIn('overwhelmed')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '300ms' : '0ms' }}
                >
                  Overwhelmed
                </Button>
                <Button
                  onClick={() => handleCheckIn('content')}
                  disabled={isLoading}
                  className={cn(
                    'transition-opacity duration-[400ms]',
                    isPromptShown ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: !isPromptShown ? '350ms' : '0ms' }}
                >
                  Content
                </Button>
              </div>
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
