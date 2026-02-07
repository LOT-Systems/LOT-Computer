import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, getUserState, analyzeIntentions, type UserState } from '#client/stores/intentionEngine'
import { useOSDiagnostics, useProfile, useLogs } from '#client/queries'
import { useLogContext } from '#client/hooks/useLogContext'

type FeedbackView = 'insight' | 'diagnostics' | 'guidance'

/**
 * AIFeedbackWidget - Quantum-state-aware personal AI feedback
 * Combines QIE state + OS diagnostics + profile + user log context
 * to provide personalized, log-grounded guidance
 * Cycles: Insight > Diagnostics > Directive
 */
export function AIFeedbackWidget() {
  const [view, setView] = React.useState<FeedbackView>('insight')
  const engine = useStore(intentionEngine)
  const { data: diagnostics } = useOSDiagnostics()
  const { data: profile } = useProfile()
  const { data: logs = [] } = useLogs()
  const logCtx = useLogContext()

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

  // Generate state-aware insight grounded in both quantum state and log context
  const getStateInsight = (state: UserState): string => {
    const { energy, clarity, alignment, needsSupport } = state

    // Critical support needed — enriched with log context
    if (needsSupport === 'critical') {
      if (logCtx.moodTrend === 'declining') {
        return 'System strain detected. Mood trajectory declining across recent check-ins. Prioritize restoration.'
      }
      return 'System strain detected. Prioritize energy restoration before deploying further modules.'
    }

    if (needsSupport === 'moderate') {
      if (logCtx.hoursSinceLastMood !== null && logCtx.hoursSinceLastMood > 6) {
        return 'Moderate load detected. Mood data stale. Re-calibrate with a fresh check-in.'
      }
      return 'Moderate load detected. Initialize self-care or mood calibration.'
    }

    // Energy-based insights enriched with log data
    if (energy === 'depleted') {
      if (logCtx.todaySelfCareCount === 0) {
        return 'Energy buffer depleted. No self-care logged today. Deploy restoration module.'
      }
      return 'Energy buffer depleted. Suspend deep processing. Focus on input restoration.'
    }

    if (energy === 'high' && clarity === 'focused') {
      if (logCtx.sessionDepth > 5) {
        return 'Optimal state compiled. Deep session active. Deploy Memory Engine for maximum integration.'
      }
      return 'Optimal state compiled. Deploy Memory Engine for maximum integration depth.'
    }

    if (energy === 'high' && clarity === 'confused') {
      if (!logCtx.hasIntention) {
        return 'Energy available but no intention vector set. Initialize Intention Engine to calibrate.'
      }
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
      if (logCtx.engagementLevel === 'new' || logCtx.engagementLevel === 'exploring') {
        return 'Search mode active. Expected in early exploration phase. Pattern recognition accelerating.'
      }
      return 'Search mode active. Exploratory phase is part of the compilation process.'
    }

    if (alignment === 'aligned' && energy === 'moderate') {
      return 'Aligned and stable. Maintain current execution path.'
    }

    // Default — use log context for richer fallback
    if (energy === 'unknown') {
      if (logCtx.isEmpty) {
        return 'No telemetry received. Begin with any module to initialize the system.'
      }
      return 'Indexing signals. Additional telemetry will refine output.'
    }

    return 'System nominal. Continue current execution.'
  }

  // Generate guidance deeply grounded in log context
  const getGuidance = (): string[] => {
    const guidance: string[] = []
    const patterns = engine.recognizedPatterns

    // Log-context-derived guidance (highest priority)
    const logDirective = logCtx.getContextualDirective()
    if (logDirective) {
      guidance.push(logDirective)
    }

    // Pattern-based guidance
    const highConfidence = patterns.filter(p => p.confidence >= 0.8)
    if (highConfidence.length > 0) {
      guidance.push(highConfidence[0].reason)
    }

    // State + log cross-reference
    if ((userState.energy === 'depleted' || userState.energy === 'low') && logCtx.todaySelfCareCount === 0) {
      guidance.push('Energy low and no self-care today. Deploy self-care module to restore buffer.')
    } else if (userState.energy === 'depleted' || userState.energy === 'low') {
      guidance.push('Prioritize energy restoration before further module deployment.')
    }

    if (userState.clarity === 'confused' && !logCtx.hasIntention) {
      guidance.push('No intention vector found. Initialize one to calibrate direction.')
    }

    if (userState.alignment === 'flowing') {
      guidance.push('Protect this flow runtime. Minimize context switches.')
    }

    // Dormant module guidance
    if (logCtx.dormantModules.length >= 3) {
      guidance.push(`${logCtx.dormantModules.length} modules dormant. Broaden input for richer pattern coverage.`)
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
        <div>
          {/* Primary quantum-state-aware insight */}
          <div className="mb-12">
            {getStateInsight(userState)}
          </div>

          {/* Log-derived context line */}
          {!logCtx.isEmpty && (
            <div className="mb-8 opacity-30">
              {logCtx.engagementLevel} runtime
              {logCtx.dominantMood ? ` . ${logCtx.dominantMood}` : ''}
              {logCtx.streak > 1 ? ` . ${logCtx.streak}d streak` : ''}
              {profile?.archetype ? ` . ${profile.archetype}` : ''}
            </div>
          )}

          {/* Signal summary */}
          <div className="opacity-30">
            Based on {engine.signals.length} signal{engine.signals.length === 1 ? '' : 's'}
            {logCtx.totalEntries > 0 ? `, ${logCtx.totalEntries} log entries` : ''}
            {engine.recognizedPatterns.length > 0
              ? `, ${engine.recognizedPatterns.filter(p => p.confidence >= 0.5).length} pattern${engine.recognizedPatterns.filter(p => p.confidence >= 0.5).length === 1 ? '' : 's'}.`
              : '.'
            }
          </div>
        </div>
      )}

      {view === 'diagnostics' && (
        <div>
          {diagnostics ? (
            <>
              {/* System status */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Status</span>
                <span className="capitalize">{diagnostics.status.replace('_', ' ')}</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Optimization</span>
                <span className="tabular-nums">{diagnostics.optimizationScore}%</span>
              </div>

              {/* Log-derived diagnostics */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Module coverage</span>
                <span className="tabular-nums">{logCtx.activeModules.length}/6</span>
              </div>

              <div className="flex justify-between items-baseline mb-12">
                <span className="opacity-30">Session depth</span>
                <span className="tabular-nums">{logCtx.sessionDepth}</span>
              </div>

              {/* Issues */}
              {diagnostics.issues.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {diagnostics.issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx}>
                      <div className="mb-4">{issue.description}</div>
                      <div className="opacity-30">{issue.suggestion}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="opacity-30">No issues detected. System optimal.</div>
              )}
            </>
          ) : (
            // Fallback diagnostics from log context when OS diagnostics unavailable
            <div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Engagement</span>
                <span className="capitalize">{logCtx.engagementLevel}</span>
              </div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Active modules</span>
                <span className="tabular-nums">{logCtx.activeModules.length}/6</span>
              </div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Today signals</span>
                <span className="tabular-nums">{logCtx.todayActivity.length}</span>
              </div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Mood trend</span>
                <span>{logCtx.moodTrend}</span>
              </div>
              {logCtx.dormantModules.length > 0 && (
                <div className="mt-8 opacity-30">
                  Dormant: {logCtx.dormantModules.join(', ')}.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'guidance' && (
        <div>
          {/* Log-grounded guidance */}
          <div className="flex flex-col gap-8 mb-12">
            {getGuidance().map((item, idx) => (
              <div key={idx}>
                {item}
              </div>
            ))}
          </div>

          {/* Recommendations from diagnostics */}
          {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
            <div className="opacity-30">
              {diagnostics.recommendations[0]}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
