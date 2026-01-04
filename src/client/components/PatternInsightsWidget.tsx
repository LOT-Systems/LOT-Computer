import * as React from 'react'
import { Block, GhostButton } from '#client/components/ui'
import { usePatterns, useCohorts } from '#client/queries'

export const PatternInsightsWidget = () => {
  const { data: patternsData } = usePatterns()
  const { data: cohortsData } = useCohorts()
  const [view, setView] = React.useState<'patterns' | 'cohorts'>('patterns')

  // Don't show if no data
  if (!patternsData && !cohortsData) return null

  const insights = patternsData?.insights || []
  const matches = cohortsData?.matches || []
  const hasPatterns = insights.length > 0
  const hasCohorts = matches.length > 0

  // Don't show if no patterns and no cohorts
  if (!hasPatterns && !hasCohorts) {
    // Show encouraging message if user has started but needs more data
    if (patternsData?.message || cohortsData?.message) {
      return (
        <div>
          <Block label="Patterns:" blockView>
            <div className="mb-8">
              {patternsData?.message || cohortsData?.message}
            </div>
          </Block>
        </div>
      )
    }
    return null
  }

  // Cycle between views if both are available
  const handleLabelClick = () => {
    if (hasPatterns && hasCohorts) {
      setView(view === 'patterns' ? 'cohorts' : 'patterns')
    }
  }

  return (
    <div>
      <Block
        label={view === 'patterns' ? 'Patterns:' : 'Your Cohort:'}
        onLabelClick={hasPatterns && hasCohorts ? handleLabelClick : undefined}
        blockView
      >
        {view === 'patterns' && hasPatterns && (
          <div className="flex flex-col gap-12">
            {insights.map((insight, idx) => (
              <div key={idx} className="inline-block">
                <div className="mb-8">{insight.title}</div>
                <div>{insight.description}</div>
                {insight.dataPoints && (
                  <div className="mt-4">
                    Based on {insight.dataPoints} observation{insight.dataPoints > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'cohorts' && hasCohorts && (
          <div className="flex flex-col gap-12">
            <div className="mb-8">
              People with similar patterns:
            </div>
            {matches.map((match, idx) => (
              <div key={idx} className="inline-block">
                <div className="mb-8">
                  <GhostButton href={`/@${match.user.id}`} rel="external">
                    {match.user.firstName} {match.user.lastName}
                  </GhostButton>
                  {match.user.archetype && (
                    <span> • {match.user.archetype}</span>
                  )}
                </div>
                <div className="mb-4">
                  {match.user.city}, {match.user.country}
                </div>
                {match.sharedPatterns.length > 0 && (
                  <div>
                    {match.sharedPatterns.map((pattern, pidx) => (
                      <div key={pidx}>• {pattern}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Block>
    </div>
  )
}
