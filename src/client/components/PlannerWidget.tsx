import * as React from 'react'
import { useStore } from '@nanostores/react'
import { plannerWidget, cycleValue, navigateCategory, dismissPlannerWidget } from '#client/stores/plannerWidget'
import { Block, Button } from '#client/components/ui'
import { useCreateLog } from '#client/queries'
import { cn } from '#client/utils'

/**
 * Planner Widget - Discover Your Ultimate Intent
 *
 * A contemplative practice for discovering and admiring your deeper purpose.
 * Not about tasks - about aligning with what calls you.
 *
 * Four dimensions of Intent:
 * - Intent: Your deeper purpose calling
 * - Expression: How it wants to manifest
 * - Alignment: What supports this intent
 * - Admiration: What you notice and appreciate
 *
 * Navigation:
 * - ↑/↓: Explore different aspects
 * - ←/→: Move between dimensions
 * - OK: Admire this plan (save & reflect)
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

  const handleAdmire = () => {
    // Log the intent as a plan to admire
    const planText = `Intent: ${state.values.intent} • ${state.values.expression} • ${state.values.alignment} • ${state.values.admiration}`
    createLog({
      text: planText,
      event: 'intent_discovered'
    })

    // Show completion with admiration
    setCompletionMessage('Admired.')

    // Fade out after 3 seconds (longer to honor the moment)
    setTimeout(() => {
      setIsFading(true)
    }, 3000)

    // Hide widget after fade completes
    setTimeout(() => {
      dismissPlannerWidget()
      setCompletionMessage(null)
      setIsFading(false)
    }, 4400) // 3000ms visible + 1400ms fade
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (completionMessage) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        cycleValue('up')
        break
      case 'ArrowDown':
        e.preventDefault()
        cycleValue('down')
        break
      case 'ArrowLeft':
        e.preventDefault()
        navigateCategory('left')
        break
      case 'ArrowRight':
        e.preventDefault()
        navigateCategory('right')
        break
      case 'Enter':
        e.preventDefault()
        handleAdmire()
        break
    }
  }

  if (!state.isVisible) return null

  const getCategoryLabel = (category: typeof state.selectedCategory) => {
    switch (category) {
      case 'intent': return 'Intent:'
      case 'expression': return 'Expression:'
      case 'alignment': return 'Alignment:'
      case 'admiration': return 'Admiration:'
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
            {/* Intent Discovery - Spreadsheet format */}
            <div className="mb-16 space-y-4">
              {/* Intent */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer',
                  state.selectedCategory === 'intent'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent hover:border-acc/10'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'intent') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('intent')}
                </div>
                <div className="opacity-90">
                  {state.values.intent}
                </div>
              </div>

              {/* Expression */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer',
                  state.selectedCategory === 'expression'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent hover:border-acc/10'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'expression') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('expression')}
                </div>
                <div className="opacity-90">
                  {state.values.expression}
                </div>
              </div>

              {/* Alignment */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer',
                  state.selectedCategory === 'alignment'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent hover:border-acc/10'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'alignment') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('alignment')}
                </div>
                <div className="opacity-90">
                  {state.values.alignment}
                </div>
              </div>

              {/* Admiration */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors cursor-pointer',
                  state.selectedCategory === 'admiration'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent hover:border-acc/10'
                )}
                onClick={() => {
                  if (state.selectedCategory !== 'admiration') {
                    navigateCategory('right')
                  }
                }}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('admiration')}
                </div>
                <div className="opacity-90">
                  {state.values.admiration}
                </div>
              </div>
            </div>

            {/* Controller */}
            <div className="flex flex-col items-center gap-4 mb-16">
              {/* Up arrow */}
              <button
                onClick={() => cycleValue('up')}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-[20px]"
                aria-label="Explore previous"
              >
                ↑
              </button>

              {/* Left/Right arrows */}
              <div className="flex gap-16">
                <button
                  onClick={() => navigateCategory('left')}
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-[20px]"
                  aria-label="Previous dimension"
                >
                  ←
                </button>
                <button
                  onClick={() => navigateCategory('right')}
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-[20px]"
                  aria-label="Next dimension"
                >
                  →
                </button>
              </div>

              {/* Down arrow */}
              <button
                onClick={() => cycleValue('down')}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-[20px]"
                aria-label="Explore next"
              >
                ↓
              </button>
            </div>

            {/* Admire Button */}
            <div className="flex justify-center">
              <Button onClick={handleAdmire}>
                Admire Plan
              </Button>
            </div>

            {/* Contemplative hint */}
            <div className="mt-12 opacity-40 text-[12px] text-center">
              Explore what calls • Admire what emerges
            </div>
          </div>
        )}
      </Block>
    </div>
  )
}
