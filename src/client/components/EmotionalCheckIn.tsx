import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useCreateEmotionalCheckIn, useEmotionalCheckIns } from '#client/queries'
import { cn } from '#client/utils'

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

      setTimeout(() => {
        // Clear buttons and show "Noted." confirmation
        setResponse('Noted.')
        setInsight(null)

        setTimeout(() => {
          setIsResponseShown(true)

          // After showing "Noted.", optionally show compassionate response
          setTimeout(() => {
            // If there's a compassionate response or insights, show them
            if (data.compassionateResponse || data.insights?.length) {
              setIsResponseShown(false)

              setTimeout(() => {
                setResponse(data.compassionateResponse)
                setInsight(data.insights)

                setTimeout(() => {
                  setIsResponseShown(true)

                  // Fade out after showing full response
                  setTimeout(() => {
                    setIsShown(false)
                    setTimeout(() => {
                      setIsDisplayed(false)
                    }, 1400) // Match fade duration
                  }, 5000) // Show full response for 5s
                }, 100)
              }, 1400) // Fade out "Noted."
            } else {
              // No additional response, just fade out "Noted."
              setTimeout(() => {
                setIsShown(false)
                setTimeout(() => {
                  setIsDisplayed(false)
                }, 1400) // Match fade duration
              }, 2000) // Show "Noted." for 2s
            }
          }, 2000) // Show "Noted." for 2s before checking for more
        }, 100)
      }, 1400) // Wait for buttons to fade out (match CSS transition)
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
          {!response ? (
            <div
              className={cn(
                'inline-block',
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
                <Button onClick={() => handleCheckIn('energized')} disabled={isLoading}>
                  Energized
                </Button>
                <Button onClick={() => handleCheckIn('calm')} disabled={isLoading}>
                  Calm
                </Button>
                <Button onClick={() => handleCheckIn('tired')} disabled={isLoading}>
                  Tired
                </Button>
                <Button onClick={() => handleCheckIn('anxious')} disabled={isLoading}>
                  Anxious
                </Button>
                <Button onClick={() => handleCheckIn('hopeful')} disabled={isLoading}>
                  Hopeful
                </Button>
                <Button onClick={() => handleCheckIn('grateful')} disabled={isLoading}>
                  Grateful
                </Button>
                <Button onClick={() => handleCheckIn('overwhelmed')} disabled={isLoading}>
                  Overwhelmed
                </Button>
                <Button onClick={() => handleCheckIn('content')} disabled={isLoading}>
                  Content
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'inline-block',
                'opacity-0 transition-opacity duration-[1400ms]',
                isResponseShown && 'opacity-100'
              )}
            >
              <div className="mb-8 opacity-90">{response}</div>
              {insight && insight.length > 0 && (
                <div className="opacity-60 text-[14px]">
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
            <div className="opacity-60">No check-ins yet. Start tracking your mood.</div>
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
                    <span className="opacity-60">{time}</span>
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
            <div className="opacity-60">Check in more to see patterns.</div>
          ) : (
            <>
              <div className="mb-12">
                <div className="flex items-center gap-8">
                  <span className="text-[20px]">{checkInsData.stats.total}</span>
                  <span className="opacity-60">Check-ins</span>
                </div>
              </div>
              {checkInsData.stats.dominantMood && (
                <div className="opacity-70">
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
