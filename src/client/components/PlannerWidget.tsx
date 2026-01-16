import * as React from 'react'
import { useStore } from '@nanostores/react'
import { plannerWidget, cycleValue, navigateCategory, dismissPlannerWidget } from '#client/stores/plannerWidget'
import { Block, Button } from '#client/components/ui'
import { useCreateLog } from '#client/queries'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'
import { getPlanningPrompt, getCompletionPhrase } from '#client/utils/narrative'

/**
 * Planner Widget - Daily Planning Practice
 *
 * An engaging way to plan your day or next hours with intention.
 * Connect with what matters and set a clear direction.
 *
 * Four dimensions of planning:
 * - Intent: Your deeper purpose for this time
 * - Today: What you'll actually do (next few hours)
 * - How: Your approach to the time ahead
 * - Feeling: The state you're aiming for
 *
 * Navigation:
 * - ←/→: Explore different options
 * - ↑/↓: Move between dimensions
 * - OK: Set this plan (save & begin)
 */
export const PlannerWidget: React.FC = () => {
  const state = useStore(plannerWidget)
  const { mutate: createLog } = useCreateLog()
  const [isShown, setIsShown] = React.useState(false)
  const [isFading, setIsFading] = React.useState(false)
  const [completionMessage, setCompletionMessage] = React.useState<string | null>(null)

  // Fade in on mount
  React.useEffect(() => {
    if (state.isVisible && !completionMessage) {
      setTimeout(() => setIsShown(true), 100)
    } else {
      setIsShown(false)
    }
  }, [state.isVisible, completionMessage])

  const handleSetPlan = () => {
    // Record intention signal for quantum pattern recognition
    recordSignal('planner', 'plan_set', {
      intent: state.values.intent,
      today: state.values.today,
      how: state.values.how,
      feeling: state.values.feeling,
      hour: new Date().getHours()
    })

    // Log the plan
    const planText = `Intent: ${state.values.intent} • Today: ${state.values.today} • How: ${state.values.how} • Feeling: ${state.values.feeling}`
    createLog({
      text: planText,
      event: 'plan_set'
    })

    // Show completion
    setCompletionMessage(getCompletionPhrase('plan'))

    // Fade out after 2 seconds
    setTimeout(() => {
      setIsFading(true)
    }, 2000)

    // Hide widget after fade completes
    setTimeout(() => {
      dismissPlannerWidget()
      setCompletionMessage(null)
      setIsFading(false)
    }, 3400) // 2000ms visible + 1400ms fade
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (completionMessage) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        navigateCategory('left')
        break
      case 'ArrowDown':
        e.preventDefault()
        navigateCategory('right')
        break
      case 'ArrowLeft':
        e.preventDefault()
        cycleValue('up')
        break
      case 'ArrowRight':
        e.preventDefault()
        cycleValue('down')
        break
      case 'Enter':
        e.preventDefault()
        handleSetPlan()
        break
    }
  }

  if (!state.isVisible) return null

  const getCategoryLabel = (category: typeof state.selectedCategory) => {
    switch (category) {
      case 'intent': return 'Intent:'
      case 'today': return 'Today:'
      case 'how': return 'How:'
      case 'feeling': return 'Feeling:'
    }
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-[1400ms]',
        isFading ? 'opacity-0' : 'opacity-100'
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Block label="Planner:" blockView>
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
          <div
            className={cn(
              'inline-block',
              'opacity-0 transition-opacity duration-[1400ms]',
              isShown && 'opacity-100'
            )}
          >
            {/* Time-aware narrative prompt */}
            <div className="mb-16">
              {getPlanningPrompt()}
            </div>

            {/* Daily Planning - Spreadsheet format */}
            <div className="mb-16 space-y-6">
              {/* Intent */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer border',
                  state.selectedCategory === 'intent'
                    ? 'bg-acc/10 border-acc'
                    : 'border-acc/20 hover:border-acc/40 hover:bg-acc/5'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'intent') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="mb-2">
                  {getCategoryLabel('intent')}
                </div>
                <div>
                  {state.values.intent}
                </div>
              </div>

              {/* Today */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer border',
                  state.selectedCategory === 'today'
                    ? 'bg-acc/10 border-acc'
                    : 'border-acc/20 hover:border-acc/40 hover:bg-acc/5'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'today') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="mb-2">
                  {getCategoryLabel('today')}
                </div>
                <div>
                  {state.values.today}
                </div>
              </div>

              {/* How */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer border',
                  state.selectedCategory === 'how'
                    ? 'bg-acc/10 border-acc'
                    : 'border-acc/20 hover:border-acc/40 hover:bg-acc/5'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'how') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="mb-2">
                  {getCategoryLabel('how')}
                </div>
                <div>
                  {state.values.how}
                </div>
              </div>

              {/* Feeling */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer border',
                  state.selectedCategory === 'feeling'
                    ? 'bg-acc/10 border-acc'
                    : 'border-acc/20 hover:border-acc/40 hover:bg-acc/5'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'feeling') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="mb-2">
                  {getCategoryLabel('feeling')}
                </div>
                <div>
                  {state.values.feeling}
                </div>
              </div>
            </div>

            {/* Controller */}
            <div className="flex flex-col items-center gap-4 mb-16">
              {/* Up arrow */}
              <Button
                onClick={() => navigateCategory('left')}
                aria-label="Previous dimension"
                className="w-[60px]"
              >
                ↑
              </Button>

              {/* Left/Right arrows */}
              <div className="flex" style={{ gap: '60px' }}>
                <Button
                  onClick={() => cycleValue('up')}
                  aria-label="Explore previous"
                  className="w-[60px]"
                >
                  ←
                </Button>
                <Button
                  onClick={() => cycleValue('down')}
                  aria-label="Explore next"
                  className="w-[60px]"
                >
                  →
                </Button>
              </div>

              {/* Down arrow */}
              <Button
                onClick={() => navigateCategory('right')}
                aria-label="Next dimension"
                className="w-[60px]"
              >
                ↓
              </Button>
            </div>

            {/* Set Plan Button */}
            <div className="flex justify-center">
              <Button onClick={handleSetPlan}>
                Set Plan
              </Button>
            </div>

            {/* Planning hint */}
            <div className="mt-12 text-center">
              Explore options • Set your direction
            </div>
          </div>
        )}
      </Block>
    </div>
  )
}
