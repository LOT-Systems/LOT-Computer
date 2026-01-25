import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { useContextualPrompts } from '#client/queries'
import * as stores from '#client/stores'

export const ContextualPromptsWidget = () => {
  const { data } = useContextualPrompts()
  const [dismissedPrompts, setDismissedPrompts] = React.useState<Set<string>>(new Set())

  if (!data || data.prompts.length === 0) return null

  // Filter out dismissed prompts
  const activePrompts = data.prompts.filter(
    prompt => !dismissedPrompts.has(prompt.triggeredBy)
  )

  if (activePrompts.length === 0) return null

  // Show highest priority prompt
  const topPrompt = activePrompts[0]

  const handleAction = () => {
    if (!topPrompt.action) return

    // Navigate to the appropriate section
    switch (topPrompt.action.target) {
      case 'mood':
        // Scroll to mood widget (it's already on the page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'memory':
        // Scroll to memory widget (it's at the bottom)
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        break
      case 'sync':
        stores.goTo('sync')
        break
      case 'log':
        stores.goTo('log')
        break
    }

    // Dismiss this prompt after action
    setDismissedPrompts(prev => new Set(prev).add(topPrompt.triggeredBy))
  }

  const handleDismiss = () => {
    setDismissedPrompts(prev => new Set(prev).add(topPrompt.triggeredBy))
  }

  // Different labels for different prompt types
  const getLabel = () => {
    switch (topPrompt.type) {
      case 'check-in':
        return 'Context:'
      case 'suggestion':
        return 'Suggestion:'
      case 'insight':
        return 'Insight:'
      case 'connection':
        return 'Connection:'
      default:
        return 'Notice:'
    }
  }

  return (
    <div>
      <Block label={getLabel()} blockView>
        <div className="mb-12">
          {topPrompt.message}
        </div>
        <div className="flex gap-8">
          {topPrompt.action && (
            <Button onClick={handleAction}>
              {topPrompt.action.label}
            </Button>
          )}
          <Button onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
        {activePrompts.length > 1 && (
          <div className="mt-8">
            +{activePrompts.length - 1} more insight{activePrompts.length - 1 > 1 ? 's' : ''}
          </div>
        )}
      </Block>
    </div>
  )
}
