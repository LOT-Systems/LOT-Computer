import React from 'react'
import { Block } from '#client/components/ui'
import { useInterventions } from '#client/queries'
import { getInterventionNarrative } from '#client/utils/narrative'
import { recordSignal } from '#client/stores/intentionEngine'

/**
 * Interventions Widget - Compassionate care based on semantic struggle detection
 * Displays highest-severity intervention with suggestion
 */
export function InterventionsWidget() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const { data, isLoading } = useInterventions()
  const hasRecordedRef = React.useRef(false)

  const cycleIntervention = () => {
    if (!data || data.interventions.length === 0) return
    setCurrentIndex(prev => (prev + 1) % data.interventions.length)
  }

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (data.interventions.length === 0) return null // No interventions needed

  const intervention = data.interventions[currentIndex]
  const hasMultiple = data.interventions.length > 1

  // Record intervention signal once per mount
  if (!hasRecordedRef.current) {
    recordSignal('mood', `intervention_${intervention.severity}`, {
      type: intervention.type,
      severity: intervention.severity,
      hour: new Date().getHours()
    })
    hasRecordedRef.current = true
  }

  const getSeverityIndicator = () => {
    switch (intervention.severity) {
      case 'critical': return '[critical]'
      case 'high': return '[high]'
      case 'medium': return '[medium]'
      case 'low': return '[low]'
      default: return ''
    }
  }

  return (
    <Block
      label="Care:"
      blockView
      onLabelClick={hasMultiple ? cycleIntervention : undefined}
    >
      <div>
        {/* Narrative context */}
        <div className="mb-8">
          {getInterventionNarrative(
            intervention.severity === 'critical' ? 'urgent' :
            intervention.severity === 'high' ? 'high' :
            intervention.severity === 'medium' ? 'moderate' :
            'low'
          )}
        </div>

        {/* Severity indicator and title */}
        <div className="mb-8 flex items-center gap-8">
          <span>{getSeverityIndicator()}</span>
          <span>{intervention.title}</span>
        </div>

        {/* Main message */}
        <div className="mb-8">
          {intervention.message}
        </div>

        {/* Suggestion if present */}
        {intervention.suggestion && (
          <div className="opacity-30">
            {intervention.suggestion}
          </div>
        )}

        {/* Multiple interventions indicator */}
        {hasMultiple && (
          <div className="mt-12">
            {currentIndex + 1} of {data.interventions.length}
          </div>
        )}
      </div>
    </Block>
  )
}
