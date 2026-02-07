import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, getUserState, analyzeIntentions, type UserState } from '#client/stores/intentionEngine'
import { useOSDiagnostics, useProfile, useLogs } from '#client/queries'

type FeedbackView = 'insight' | 'diagnostics' | 'guidance'

/**
 * AIFeedbackWidget - Quantum-state-aware personal AI feedback
 * Combines QIE state with OS diagnostics and profile data
 * to provide personalized, context-aware guidance
 * Cycles: Insight > Diagnostics > Guidance
 */
export function AIFeedbackWidget() {
  const [view, setView] = React.useState<FeedbackView>('insight')
  const engine = useStore(intentionEngine)
  const { data: diagnostics } = useOSDiagnostics()
  const { data: profile } = useProfile()
  const { data: logs = [] } = useLogs()

  // Trigger analysis when logs change
  React.useEffect(() => {
    analyzeIntentions()
  }, [logs])

  const userState = getUserState()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'insight': return 'diagnostics'
        case 'diagnostics': return 'guidance'
        case 'guidance': return 'insight'
        default: return 'insight'
      }
    })
  }

  // Need some data to show meaningful feedback
  if (engine.signals.length === 0 && !diagnostics && !profile?.hasUsership) return null

  const label =
    view === 'insight' ? 'System Analysis:' :
    view === 'diagnostics' ? 'Diagnostics:' :
    'Directive:'

  // Generate state-aware insight based on quantum state
  const getStateInsight = (state: UserState): string => {
    const { energy, clarity, alignment, needsSupport } = state

    // Critical support needed
    if (needsSupport === 'critical') {
      return 'System strain detected. Prioritize energy restoration before deploying further modules.'
    }

    if (needsSupport === 'moderate') {
      return 'Moderate load detected. Initialize self-care or mood calibration.'
    }

    // Energy-based insights
    if (energy === 'depleted') {
      return 'Energy buffer depleted. Suspend deep processing. Focus on input restoration.'
    }

    if (energy === 'high' && clarity === 'focused') {
      return 'Optimal state compiled. Deploy Memory Engine for maximum integration depth.'
    }

    if (energy === 'high' && clarity === 'confused') {
      return 'Energy available but vector undefined. Initialize intention to calibrate direction.'
    }

    // Clarity-based insights
    if (clarity === 'confused' && alignment === 'disconnected') {
      return 'System requires grounding. Initialize with a baseline check-in.'
    }

    if (clarity === 'focused' && alignment === 'flowing') {
      return 'Flow state active. Protect this runtime. Deep integration possible.'
    }

    // Alignment-based insights
    if (alignment === 'searching') {
      return 'Search mode active. Exploratory phase is part of the compilation process.'
    }

    if (alignment === 'aligned' && energy === 'moderate') {
      return 'Aligned and stable. Maintain current execution path.'
    }

    // Default
    if (energy === 'unknown') {
      return 'Indexing signals. Additional telemetry will refine output.'
    }

    return 'System nominal. Continue current execution.'
  }

  // Generate guidance based on patterns and state
  const getGuidance = (): string[] => {
    const guidance: string[] = []
    const patterns = engine.recognizedPatterns

    // Pattern-based guidance
    const highConfidence = patterns.filter(p => p.confidence >= 0.8)
    if (highConfidence.length > 0) {
      guidance.push(highConfidence[0].reason)
    }

    // State-based guidance
    if (userState.energy === 'depleted' || userState.energy === 'low') {
      guidance.push('Prioritize energy restoration before further module deployment.')
    }

    if (userState.clarity === 'confused') {
      guidance.push('Initialize a simple intention to calibrate direction.')
    }

    if (userState.alignment === 'flowing') {
      guidance.push('Protect this flow runtime. Minimize context switches.')
    }

    // Profile-based guidance
    if (profile?.growthTrajectory === 'emerging') {
      guidance.push('Patterns initializing. Consistent input will accelerate compilation.')
    }

    if (profile?.growthTrajectory === 'deepening') {
      guidance.push('Practice depth increasing. Integrate new dimensions.')
    }

    // Diagnostics-based guidance
    if (diagnostics?.issues && diagnostics.issues.length > 0) {
      const highSeverity = diagnostics.issues.find(i => i.severity === 'high')
      if (highSeverity) {
        guidance.push(highSeverity.suggestion)
      }
    }

    if (guidance.length === 0) {
      guidance.push('Continue current execution path.')
    }

    return guidance.slice(0, 3)
  }

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'insight' && (
        <div className="inline-block">
          {/* Primary quantum-state-aware insight */}
          <div className="mb-12">
            {getStateInsight(userState)}
          </div>

          {/* Context: archetype and growth */}
          {profile?.archetype && (
            <div className="mb-8 opacity-60">
              {profile.archetype}
              {profile.growthTrajectory ? ` . ${profile.growthTrajectory}` : ''}
            </div>
          )}

          {/* Signal summary */}
          <div className="opacity-40">
            Based on {engine.signals.length} signal{engine.signals.length === 1 ? '' : 's'}
            {engine.recognizedPatterns.length > 0
              ? ` and ${engine.recognizedPatterns.filter(p => p.confidence >= 0.5).length} pattern${engine.recognizedPatterns.filter(p => p.confidence >= 0.5).length === 1 ? '' : 's'}.`
              : '.'
            }
          </div>
        </div>
      )}

      {view === 'diagnostics' && (
        <div className="inline-block">
          {diagnostics ? (
            <>
              {/* System status */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-60">Status</span>
                <span className="capitalize">{diagnostics.status.replace('_', ' ')}</span>
              </div>

              <div className="flex justify-between items-baseline mb-12">
                <span className="opacity-60">Optimization</span>
                <span className="tabular-nums">{diagnostics.optimizationScore}%</span>
              </div>

              {/* Issues */}
              {diagnostics.issues.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {diagnostics.issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx}>
                      <div className="mb-4">{issue.description}</div>
                      <div className="opacity-60">{issue.suggestion}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="opacity-60">No issues detected. System optimal.</div>
              )}
            </>
          ) : (
            <div className="opacity-60">Diagnostics loading.</div>
          )}
        </div>
      )}

      {view === 'guidance' && (
        <div className="inline-block">
          {/* State-aware guidance */}
          <div className="flex flex-col gap-8 mb-12">
            {getGuidance().map((item, idx) => (
              <div key={idx}>
                {item}
              </div>
            ))}
          </div>

          {/* Recommendations from diagnostics */}
          {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
            <div className="opacity-60">
              {diagnostics.recommendations[0]}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
