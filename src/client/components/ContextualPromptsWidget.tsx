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

  // Default Memory Engine follow-up prompts when pattern-based prompts aren't available
  const defaultPrompts = React.useMemo(() => {
    const hour = new Date().getHours()
    const prompts = []

    // Morning reflection (6-11 AM)
    if (hour >= 6 && hour < 11) {
      prompts.push({
        type: 'suggestion' as const,
        title: 'Morning reflection',
        message: 'How are you starting this day? Your morning state shapes what follows.',
        action: {
          label: 'Check in',
          target: 'mood' as const
        },
        priority: 6,
        triggeredBy: 'time-morning'
      })
    }

    // Midday awareness (11 AM - 3 PM)
    if (hour >= 11 && hour < 15) {
      prompts.push({
        type: 'check-in' as const,
        title: 'Midday awareness',
        message: 'Pause for a moment. What does your body need right now?',
        action: {
          label: 'Notice',
          target: 'mood' as const
        },
        priority: 5,
        triggeredBy: 'time-midday'
      })
    }

    // Afternoon reflection (3-7 PM)
    if (hour >= 15 && hour < 19) {
      prompts.push({
        type: 'suggestion' as const,
        title: 'Afternoon reflection',
        message: 'The day is winding down. What moments are worth remembering?',
        action: {
          label: 'Reflect',
          target: 'memory' as const
        },
        priority: 7,
        triggeredBy: 'time-afternoon'
      })
    }

    // Evening integration (7 PM - midnight)
    if (hour >= 19 && hour < 24) {
      prompts.push({
        type: 'insight' as const,
        title: 'Evening integration',
        message: 'As this day closes, what did you learn about yourself?',
        action: {
          label: 'Integrate',
          target: 'memory' as const
        },
        priority: 6,
        triggeredBy: 'time-evening'
      })
    }

    // Universal prompts (always available)
    prompts.push({
      type: 'suggestion' as const,
      title: 'Memory building',
      message: 'Small moments create the pattern of a life. What do you want to remember?',
      action: {
        label: 'Remember',
        target: 'memory' as const
      },
      priority: 4,
      triggeredBy: 'memory-universal'
    })

    return prompts
  }, [quantumShift])

  // Combine pattern-based prompts with defaults
  const allPrompts = React.useMemo(() => {
    const patternPrompts = data?.prompts || []
    // If we have pattern prompts, use them; otherwise fall back to defaults
    return patternPrompts.length > 0 ? patternPrompts : defaultPrompts
  }, [data, defaultPrompts])

  if (allPrompts.length === 0) return null

  // Filter out dismissed prompts
  const activePrompts = allPrompts.filter(
    prompt => !dismissedPrompts.has(prompt.triggeredBy)
  )

  if (activePrompts.length === 0) return null

  // Sort by priority and show highest priority prompt
  const sortedPrompts = [...activePrompts].sort((a, b) => b.priority - a.priority)
  const topPrompt = sortedPrompts[0]

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
