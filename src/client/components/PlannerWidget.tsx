import * as React from 'react'
import { useStore } from '@nanostores/react'
import { plannerWidget, cycleValue, navigateCategory, dismissPlannerWidget } from '#client/stores/plannerWidget'
import { Block, Button } from '#client/components/ui'
import { useCreateLog } from '#client/queries'
import { cn } from '#client/utils'

/**
 * Planner Widget - Spreadsheet-style mini-game for daily planning
 *
 * Shows 4 planning values:
 * - Priority: What matters most today
 * - Time: When to focus
 * - Energy: What energy level is needed
 * - Care: How to take care of yourself
 *
 * Navigation:
 * - ↑/↓: Cycle through suggestions for selected category
 * - ←/→: Move between categories
 * - OK: Save plan and dismiss
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

  const handleSave = () => {
    // Log the plan
    const planText = `Plan: ${state.values.priority} | ${state.values.time} | ${state.values.energy} | ${state.values.care}`
    createLog({
      text: planText,
      event: 'plan_set'
    })

    // Show completion message
    setCompletionMessage('Set.')

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
        handleSave()
        break
    }
  }

  if (!state.isVisible) return null

  const getCategoryLabel = (category: typeof state.selectedCategory) => {
    switch (category) {
      case 'priority': return 'Priority:'
      case 'time': return 'Time:'
      case 'energy': return 'Energy:'
      case 'care': return 'Care:'
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
            {/* Spreadsheet-style values */}
            <div className="mb-16 space-y-4">
              {/* Priority */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors',
                  state.selectedCategory === 'priority'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent'
                )}
                onClick={() => navigateCategory('right')}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('priority')}
                </div>
                <div className="opacity-90">
                  {state.values.priority}
                </div>
              </div>

              {/* Time */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors',
                  state.selectedCategory === 'time'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent'
                )}
                onClick={() => navigateCategory('right')}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('time')}
                </div>
                <div className="opacity-90">
                  {state.values.time}
                </div>
              </div>

              {/* Energy */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors',
                  state.selectedCategory === 'energy'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent'
                )}
                onClick={() => navigateCategory('right')}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('energy')}
                </div>
                <div className="opacity-90">
                  {state.values.energy}
                </div>
              </div>

              {/* Care */}
              <div
                className={cn(
                  'px-8 py-4 rounded transition-colors',
                  state.selectedCategory === 'care'
                    ? 'bg-acc/10 border border-acc/30'
                    : 'border border-transparent'
                )}
                onClick={() => navigateCategory('right')}
              >
                <div className="opacity-60 text-[12px] mb-2">
                  {getCategoryLabel('care')}
                </div>
                <div className="opacity-90">
                  {state.values.care}
                </div>
              </div>
            </div>

            {/* Controller */}
            <div className="flex flex-col items-center gap-4 mb-16">
              {/* Up arrow */}
              <button
                onClick={() => cycleValue('up')}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Previous suggestion"
              >
                ↑
              </button>

              {/* Left/Right arrows */}
              <div className="flex gap-16">
                <button
                  onClick={() => navigateCategory('left')}
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Previous category"
                >
                  ←
                </button>
                <button
                  onClick={() => navigateCategory('right')}
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Next category"
                >
                  →
                </button>
              </div>

              {/* Down arrow */}
              <button
                onClick={() => cycleValue('down')}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Next suggestion"
              >
                ↓
              </button>
            </div>

            {/* OK Button */}
            <div className="flex justify-center">
              <Button onClick={handleSave}>
                OK
              </Button>
            </div>

            {/* Hint */}
            <div className="mt-12 opacity-40 text-[12px] text-center">
              Use arrows or click to navigate • Enter to save
            </div>
          </div>
        )}
      </Block>
    </div>
  )
}
