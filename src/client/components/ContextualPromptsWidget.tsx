import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { useContextualPrompts } from '#client/queries'
import * as stores from '#client/stores'
import axios from 'axios'
import { useLogContext } from '#client/hooks/useLogContext'
import { recordSignal } from '#client/stores/intentionEngine'

export const ContextualPromptsWidget = () => {
  const { data } = useContextualPrompts()
  const logCtx = useLogContext()
  const [dismissedPrompts, setDismissedPrompts] = React.useState<Set<string>>(new Set())
  const [quantumShift, setQuantumShift] = React.useState(0)

  // Quantum variation: subtle shift on mount and every 15 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuantumShift(prev => (prev + 1) % 5)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Log-context-aware prompts grounded in user history
  const defaultPrompts = React.useMemo(() => {
    const prompts = []
    const { timePhase, hoursSinceLastMood, hoursSinceLastActivity, hasMood, hasMemory,
            hasIntention, dormantModules, moodTrend, todayActivity, streak,
            sessionDepth, engagementLevel, dominantMood, todayMoodCount } = logCtx

    // Priority 1: Re-engagement after absence (log-derived)
    if (hoursSinceLastActivity !== null && hoursSinceLastActivity > 12) {
      prompts.push({
        type: 'check-in' as const,
        title: 'Re-synchronize',
        message: `${Math.round(hoursSinceLastActivity)} hours since last signal. Run a state scan to re-calibrate.`,
        action: { label: 'Check in', target: 'mood' as const },
        priority: 9,
        triggeredBy: 'log-reengagement'
      })
    }

    // Priority 2: Stale mood data (log-derived)
    if (hoursSinceLastMood !== null && hoursSinceLastMood > 8 && todayMoodCount === 0) {
      prompts.push({
        type: 'check-in' as const,
        title: 'Mood telemetry stale',
        message: 'Emotional state data expired. Fresh input sharpens all downstream modules.',
        action: { label: 'Calibrate', target: 'mood' as const },
        priority: 8,
        triggeredBy: 'log-stale-mood'
      })
    }

    // Priority 3: Declining mood trend intervention (log-derived)
    if (moodTrend === 'declining') {
      prompts.push({
        type: 'insight' as const,
        title: 'Pattern shift detected',
        message: 'Biofield trajectory declining over recent readings. Consider deploying Cleanness module or reflective journaling.',
        action: { label: 'Deploy', target: 'log' as const },
        priority: 8,
        triggeredBy: 'log-mood-declining'
      })
    }

    // Priority 4: Dormant module activation (log-derived)
    if (dormantModules.length > 0 && engagementLevel !== 'new') {
      const moduleLabelMap: Record<string, string> = {
        'memory': 'Memory engine', 'mood': 'Biofield interface', 'planner': 'Routine module',
        'selfcare': 'Cleanness module', 'intentions': 'Intention engine', 'journal': 'Journal module'
      }
      const targetModule = dormantModules[0]
      const targetMap: Record<string, 'mood' | 'memory' | 'log' | 'sync'> = {
        'memory': 'memory', 'mood': 'mood', 'planner': 'log', 'selfcare': 'log',
        'intentions': 'log', 'journal': 'log'
      }
      prompts.push({
        type: 'suggestion' as const,
        title: 'Module activation',
        message: `${moduleLabelMap[targetModule] || targetModule} has zero telemetry. Initialize to expand pattern coverage.`,
        action: { label: 'Initialize', target: targetMap[targetModule] || ('log' as const) },
        priority: 7,
        triggeredBy: `log-dormant-${targetModule}`
      })
    }

    // Time-phase prompts grounded in log data
    if (timePhase === 'morning') {
      if (todayActivity.length === 0) {
        prompts.push({
          type: 'suggestion' as const,
          title: 'Morning initialization',
          message: hasIntention
            ? 'Set today\'s intention vector. Your history shows intention drives alignment.'
            : 'Morning window open. A check-in now anchors the rest of the day\'s telemetry.',
          action: { label: hasIntention ? 'Set intention' : 'Check in', target: hasIntention ? 'log' as const : 'mood' as const },
          priority: 6,
          triggeredBy: 'time-morning'
        })
      }
    }

    if (timePhase === 'midday') {
      prompts.push({
        type: 'check-in' as const,
        title: 'Midday checkpoint',
        message: todayActivity.length > 0
          ? `${todayActivity.length} signal${todayActivity.length === 1 ? '' : 's'} logged today. Pause to assess current state.`
          : 'No signals logged today. A brief check-in recalibrates the system.',
        action: { label: 'Scan', target: 'mood' as const },
        priority: 5,
        triggeredBy: 'time-midday'
      })
    }

    if (timePhase === 'afternoon') {
      prompts.push({
        type: 'suggestion' as const,
        title: 'Afternoon integration',
        message: hasMemory
          ? 'Deploy Memory Engine to compile today\'s observations into long-term storage.'
          : 'The day is winding down. What moments are worth indexing in memory?',
        action: { label: 'Reflect', target: 'memory' as const },
        priority: 7,
        triggeredBy: 'time-afternoon'
      })
    }

    if (timePhase === 'evening') {
      prompts.push({
        type: 'insight' as const,
        title: 'Evening compilation',
        message: streak > 1
          ? `Day ${streak} of continuous input. Integrate today\'s data before the daily buffer flushes.`
          : 'As this day closes, what pattern emerged? Log it before context expires.',
        action: { label: 'Integrate', target: 'memory' as const },
        priority: 6,
        triggeredBy: 'time-evening'
      })
    }

    // Engagement-level universal prompts
    if (engagementLevel === 'new') {
      prompts.push({
        type: 'suggestion' as const,
        title: 'System bootstrap',
        message: 'Pattern recognition requires input. Each interaction trains the system to serve you better.',
        action: { label: 'Begin', target: 'mood' as const },
        priority: 4,
        triggeredBy: 'log-bootstrap'
      })
    } else {
      prompts.push({
        type: 'suggestion' as const,
        title: 'Memory integration',
        message: 'Small signals compound into recognized patterns. What do you want to index?',
        action: { label: 'Remember', target: 'memory' as const },
        priority: 4,
        triggeredBy: 'memory-universal'
      })
    }

    return prompts
  }, [quantumShift, logCtx])

  // Combine pattern-based prompts with defaults
  const allPrompts = React.useMemo(() => {
    const patternPrompts = data?.prompts || []
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

    // Record signal for QIE pattern tracking
    recordSignal('mood', 'prompt_accepted', {
      type: topPrompt.type,
      triggeredBy: topPrompt.triggeredBy,
      target: topPrompt.action.target,
      hour: new Date().getHours()
    })

    switch (topPrompt.action.target) {
      case 'mood':
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'memory':
        stores.goTo('logs')
        break
      case 'sync':
        stores.goTo('sync')
        break
      case 'log':
        stores.goTo('logs')
        break
    }

    setDismissedPrompts(prev => new Set(prev).add(topPrompt.triggeredBy))
  }

  const handleDismiss = async () => {
    recordSignal('mood', 'prompt_skipped', {
      type: topPrompt.type,
      triggeredBy: topPrompt.triggeredBy,
      hour: new Date().getHours()
    })

    try {
      await axios.post('/api/logs', {
        text: `Skipped prompt: ${topPrompt.message}`
      })
    } catch (error) {
      console.error('Failed to log skip action:', error)
    }

    setDismissedPrompts(prev => new Set(prev).add(topPrompt.triggeredBy))
  }

  // Quantum-varied labels with technical terminology
  const getLabelVariations = () => {
    const variations: Record<string, string[]> = {
      'check-in': ['State Scan:', 'Telemetry:', 'Checkpoint:', 'Status:', 'Diagnostic:'],
      'suggestion': ['Directive:', 'Vector:', 'Module:', 'Deploy:', 'Initialize:'],
      'insight': ['Pattern:', 'Signal:', 'Analysis:', 'Compilation:', 'Integration:'],
      'connection': ['Upstream:', 'Sync:', 'Link:', 'Resonance:', 'Convergence:']
    }

    const defaultVariations = ['Signal:', 'Scan:', 'Telemetry:', 'Observation:', 'Context:']

    const typeVariations = variations[topPrompt.type] || defaultVariations
    return typeVariations[quantumShift % typeVariations.length]
  }

  return (
    <div>
      <Block label={getLabelVariations()} blockView>
        <div className="mb-8">
          {topPrompt.message}
        </div>
        {/* Log context summary line */}
        {!logCtx.isEmpty && (
          <div className="mb-8 opacity-30">
            {logCtx.todayActivity.length} signal{logCtx.todayActivity.length === 1 ? '' : 's'} today
            {logCtx.streak > 1 ? ` • ${logCtx.streak}d streak` : ''}
            {logCtx.sessionDepth > 0 ? ` • session depth ${logCtx.sessionDepth}` : ''}
          </div>
        )}
        <div className="flex gap-8">
          {topPrompt.action && (
            <Button onClick={handleAction}>
              {topPrompt.action.label}
            </Button>
          )}
          <Button onClick={handleDismiss}>
            Skip
          </Button>
        </div>
        {activePrompts.length > 1 && (
          <div className="mt-8 opacity-30">
            +{activePrompts.length - 1} more directive{activePrompts.length - 1 > 1 ? 's' : ''}
          </div>
        )}
      </Block>
    </div>
  )
}
