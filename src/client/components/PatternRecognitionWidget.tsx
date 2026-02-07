import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, analyzeIntentions, getOptimalWidget, type IntentionPattern } from '#client/stores/intentionEngine'
import { useLogs } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'
import { cn } from '#client/utils'

type PatternView = 'active' | 'recommendation' | 'confidence'

/**
 * Pattern Recognition Widget - Shows detected behavioral patterns from QIE
 * Displays confidence levels as text-based progress bars
 * Cycles: Active Patterns > Recommendation > Confidence Map
 */
export function PatternRecognitionWidget() {
  const [view, setView] = React.useState<PatternView>('active')
  const engine = useStore(intentionEngine)
  const { data: logs = [] } = useLogs()

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
    view === 'active' ? 'Recognized:' :
    view === 'recommendation' ? 'Recommended:' :
    'Confidence:'

  // Human-readable pattern names
  const getPatternName = (pattern: string): string => {
    const names: Record<string, string> = {
      'anxiety-pattern': 'Anxiety pattern detected',
      'lack-of-structure': 'Structure needed',
      'seeking-direction': 'Seeking direction',
      'flow-potential': 'Flow state potential',
      'evening-overwhelm': 'Evening overwhelm',
      'surface-awareness': 'Surface-level tracking',
      'morning-clarity': 'Morning clarity window'
    }
    return names[pattern] || pattern.replace(/-/g, ' ')
  }

  // Human-readable timing
  const getTimingLabel = (timing: string): string => {
    const labels: Record<string, string> = {
      'immediate': 'Now',
      'soon': 'Soon',
      'next-session': 'Next session',
      'passive': 'When ready'
    }
    return labels[timing] || timing
  }

  // Human-readable widget names
  const getWidgetLabel = (widget: string): string => {
    const labels: Record<string, string> = {
      'selfcare': 'Self-care',
      'planner': 'Planner',
      'intentions': 'Intentions',
      'memory': 'Memory',
      'journal': 'Journal',
      'mood': 'Mood'
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
        <div className="inline-block">
          {patterns.length === 0 ? (
            <div>No behavioral patterns detected yet.</div>
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
                      <span className="opacity-60">{Math.round(pattern.confidence * 100)}%</span>
                    </div>
                    {/* Confidence-based messaging: >0.8 specific, 0.5-0.8 general */}
                    <div className="opacity-60">
                      {pattern.confidence >= 0.8
                        ? `${getWidgetLabel(pattern.suggestedWidget)}. ${getTimingLabel(pattern.suggestedTiming)}.`
                        : 'Pattern emerging. Continue for clarity.'
                      }
                    </div>
                  </div>
                ))
              }
              {patterns.filter(p => p.confidence < 0.5).length > 0 && (
                <div className="opacity-40">
                  {patterns.filter(p => p.confidence < 0.5).length} weak signal{patterns.filter(p => p.confidence < 0.5).length === 1 ? '' : 's'} below threshold.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'recommendation' && (
        <div className="inline-block">
          {optimal ? (
            <>
              <div className="mb-12">
                {optimal.reason}
              </div>
              <div className="mb-8">
                Suggested: {getWidgetLabel(optimal.widget)}.
              </div>
              {/* Show confidence context */}
              {patterns.length > 0 && (
                <div className="opacity-40">
                  Based on {patterns.filter(p => p.confidence >= 0.5).length} pattern{patterns.filter(p => p.confidence >= 0.5).length === 1 ? '' : 's'} above threshold.
                </div>
              )}
            </>
          ) : (
            <div>
              No specific recommendation at this time. Continue as you are.
            </div>
          )}
        </div>
      )}

      {view === 'confidence' && (
        <div className="inline-block">
          {patterns.length === 0 ? (
            <div>Insufficient data for confidence mapping.</div>
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

              {/* Summary */}
              <div className="mt-8 opacity-60">
                {patterns.length} pattern{patterns.length === 1 ? '' : 's'} above threshold.
              </div>
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
