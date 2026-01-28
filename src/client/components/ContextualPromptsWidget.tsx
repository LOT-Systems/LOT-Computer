import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { useContextualPrompts } from '#client/queries'
import * as stores from '#client/stores'

export const ContextualPromptsWidget = () => {
  const { data } = useContextualPrompts()
  const [dismissedPrompts, setDismissedPrompts] = React.useState<Set<string>>(new Set())
  const [quantumShift, setQuantumShift] = React.useState(0)

  // Quantum variation: subtle shift on mount and every 15 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuantumShift(prev => (prev + 1) % 5)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

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

  // Quantum-varied labels that shift subtly over time
  const getLabelVariations = () => {
    const variations: Record<string, string[]> = {
      'check-in': ['Context:', 'State:', 'Present:', 'Awareness:', 'Now:'],
      'suggestion': ['Suggestion:', 'Path:', 'Direction:', 'Opening:', 'Possibility:'],
      'insight': ['Insight:', 'Pattern:', 'Recognition:', 'Clarity:', 'Understanding:'],
      'connection': ['Connection:', 'Thread:', 'Link:', 'Resonance:', 'Alignment:']
    }

    const defaultVariations = ['Notice:', 'Attention:', 'Signal:', 'Observation:', 'Scan:']

    const typeVariations = variations[topPrompt.type] || defaultVariations
    return typeVariations[quantumShift % typeVariations.length]
  }

  return (
    <div>
      <Block label={getLabelVariations()} blockView>
        <div className="mb-12 opacity-75">
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
          <div className="mt-8 opacity-60">
            +{activePrompts.length - 1} more insight{activePrompts.length - 1 > 1 ? 's' : ''}
          </div>
        )}
      </Block>
    </div>
  )
}
