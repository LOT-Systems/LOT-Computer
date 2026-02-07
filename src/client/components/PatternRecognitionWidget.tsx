import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, analyzeIntentions, getOptimalWidget, type IntentionPattern } from '#client/stores/intentionEngine'
import { useLogs } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'
import { cn } from '#client/utils'
import { useLogContext } from '#client/hooks/useLogContext'

type PatternView = 'active' | 'recommendation' | 'confidence'

/**
 * Pattern Recognition Widget - Shows detected behavioral patterns from QIE
 * Displays confidence levels as text-based progress bars, enriched with log context
 * Cycles: Active Patterns > Recommendation > Confidence Map
 */
export function PatternRecognitionWidget() {
  const [view, setView] = React.useState<PatternView>('active')
  const engine = useStore(intentionEngine)
  const { data: logs = [] } = useLogs()
  const logCtx = useLogContext()

  // Trigger analysis
  React.useEffect(() => {
    analyzeIntentions()
  }, [logs])

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'active': return 'recommendation'
        case 'recommendation': return 'confidence'
        case 'confidence': return 'active'
        default: return 'active'
      }
    })
  }

  const patterns = engine.recognizedPatterns
  const optimal = getOptimalWidget()

  // Don't render if no patterns detected
  if (patterns.length === 0 && !optimal) return null

  const label =
    view === 'active' ? 'Recognized Patterns:' :
    view === 'recommendation' ? 'Suggested Module:' :
    'Confidence Matrix:'

  // Technical pattern names
  const getPatternName = (pattern: string): string => {
    const names: Record<string, string> = {
      'anxiety-pattern': 'Anxiety signal detected',
      'lack-of-structure': 'Structure deficit',
      'seeking-direction': 'Direction-seeking state',
      'flow-potential': 'Flow state available',
      'evening-overwhelm': 'Evening overload signal',
      'surface-awareness': 'Surface-level telemetry',
      'morning-clarity': 'Morning clarity window'
    }
    return names[pattern] || pattern.replace(/-/g, ' ')
  }

  // Timing labels
  const getTimingLabel = (timing: string): string => {
    const labels: Record<string, string> = {
      'immediate': 'Deploy now',
      'soon': 'Queue next',
      'next-session': 'Next session',
      'passive': 'Standby'
    }
    return labels[timing] || timing
  }

  // Module names
  const getWidgetLabel = (widget: string): string => {
    const labels: Record<string, string> = {
      'selfcare': 'Self-care module',
      'planner': 'Planner module',
      'intentions': 'Intention engine',
      'memory': 'Memory engine',
      'journal': 'Journal module',
      'mood': 'Mood interface'
    }
    return labels[widget] || widget
  }

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'active' && (
        <div>
          {patterns.length === 0 ? (
            <div>No behavioral patterns compiled yet.</div>
          ) : (
            <div className="flex flex-col gap-12">
              {patterns
                .filter(p => p.confidence >= 0.5) // Only show patterns above threshold
                .sort((a, b) => b.confidence - a.confidence)
                .map((pattern, idx) => (
                  <div key={idx}>
                    <div className="mb-4">{getPatternName(pattern.pattern)}</div>
                    <div className="flex items-center gap-8 mb-4">
                      <ProgressBars percentage={pattern.confidence * 100} barCount={10} />
                      <span className="opacity-30">{Math.round(pattern.confidence * 100)}%</span>
                    </div>
                    {/* Confidence-based messaging: >0.8 specific, 0.5-0.8 general */}
                    <div className="opacity-30">
                      {pattern.confidence >= 0.8
                        ? `${getWidgetLabel(pattern.suggestedWidget)}. ${getTimingLabel(pattern.suggestedTiming)}.`
                        : 'Pattern initializing. Continue for convergence.'
                      }
                    </div>
                  </div>
                ))
              }
              {patterns.filter(p => p.confidence < 0.5).length > 0 && (
                <div className="opacity-30">
                  {patterns.filter(p => p.confidence < 0.5).length} weak signal{patterns.filter(p => p.confidence < 0.5).length === 1 ? '' : 's'} below threshold.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'recommendation' && (
        <div>
          {optimal ? (
            <>
              <div className="mb-12">
                {optimal.reason}
              </div>
              <div className="mb-8">
                Suggested: {getWidgetLabel(optimal.widget)}.
              </div>
              {/* Show confidence context enriched with log data */}
              {patterns.length > 0 && (
                <div className="opacity-30">
                  Derived from {patterns.filter(p => p.confidence >= 0.5).length} pattern{patterns.filter(p => p.confidence >= 0.5).length === 1 ? '' : 's'}
                  {!logCtx.isEmpty ? ` and ${logCtx.totalEntries} log entries.` : ' above threshold.'}
                </div>
              )}
            </>
          ) : (
            <div>
              {logCtx.isEmpty
                ? 'No telemetry for pattern compilation. Begin logging to initialize.'
                : 'No module recommendation at this time. System nominal.'
              }
            </div>
          )}
        </div>
      )}

      {view === 'confidence' && (
        <div>
          {patterns.length === 0 ? (
            <div>Insufficient telemetry for confidence mapping.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Confidence distribution */}
              {patterns
                .sort((a, b) => b.confidence - a.confidence)
                .map((pattern, idx) => (
                  <div key={idx} className="flex justify-between gap-16">
                    <span className="capitalize">
                      {pattern.pattern.replace(/-/g, ' ')}
                    </span>
                    <span className="tabular-nums">
                      {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              }

              {/* Summary enriched with log context */}
              <div className="mt-8 opacity-30">
                {patterns.length} pattern{patterns.length === 1 ? '' : 's'} indexed.
                {!logCtx.isEmpty ? ` ${logCtx.activeModules.length}/6 modules reporting.` : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
