import React from 'react'
import { Block } from '#client/components/ui'
import { useInterventions } from '#client/queries'

/**
 * Interventions Widget - Compassionate care based on semantic struggle detection
 * Displays highest-severity intervention with suggestion
 */
export function InterventionsWidget() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const { data, isLoading } = useInterventions()

  const cycleIntervention = () => {
    if (!data || data.interventions.length === 0) return
    setCurrentIndex(prev => (prev + 1) % data.interventions.length)
  }

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (data.interventions.length === 0) return null // No interventions needed

  const intervention = data.interventions[currentIndex]
  const hasMultiple = data.interventions.length > 1

  const getSeverityIndicator = () => {
    switch (intervention.severity) {
      case 'critical': return '⚠⚠⚠'
      case 'high': return '⚠⚠'
      case 'medium': return '⚠'
      case 'low': return '•'
      default: return ''
    }
  }

  return (
    <Block
      label="Care:"
      blockView
      onLabelClick={hasMultiple ? cycleIntervention : undefined}
    >
      <div className="inline-block">
        {/* Severity indicator and title */}
        <div className="mb-12 flex items-center gap-8">
          <span>{getSeverityIndicator()}</span>
          <span>{intervention.title}</span>
        </div>

        {/* Main message */}
        <div className="mb-12">
          {intervention.message}
        </div>

        {/* Suggestion if present */}
        {intervention.suggestion && (
          <div>
            {intervention.suggestion}
          </div>
        )}

        {/* Multiple interventions indicator */}
        {hasMultiple && (
          <div className="mt-12 text-[12px]">
            {currentIndex + 1} of {data.interventions.length}
          </div>
        )}
      </div>
    </Block>
  )
}
