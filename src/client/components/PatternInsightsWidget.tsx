import * as React from 'react'
import { Block, GhostButton } from '#client/components/ui'
import { usePatterns, useCohorts, usePatternEvolution } from '#client/queries'
import dayjs from '#client/utils/dayjs'

export const PatternInsightsWidget = () => {
  const { data: patternsData } = usePatterns()
  const { data: cohortsData } = useCohorts()
  const { data: evolutionData } = usePatternEvolution()
  const [view, setView] = React.useState<'patterns' | 'cohorts' | 'evolution'>('patterns')

  // Don't show if no data
  if (!patternsData && !cohortsData && !evolutionData) return null

  const insights = patternsData?.insights || []
  const matches = cohortsData?.matches || []
  const evolution = evolutionData?.evolution || []
  const hasPatterns = insights.length > 0
  const hasCohorts = matches.length > 0
  const hasEvolution = evolution.length > 0

  // Don't show if no patterns, cohorts, or evolution
  if (!hasPatterns && !hasCohorts && !hasEvolution) {
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

  // Cycle between views
  const handleLabelClick = () => {
    const availableViews: Array<'patterns' | 'cohorts' | 'evolution'> = []
    if (hasPatterns) availableViews.push('patterns')
    if (hasCohorts) availableViews.push('cohorts')
    if (hasEvolution) availableViews.push('evolution')

    if (availableViews.length <= 1) return

    const currentIndex = availableViews.indexOf(view)
    const nextIndex = (currentIndex + 1) % availableViews.length
    setView(availableViews[nextIndex])
  }

  const getLabel = () => {
    switch (view) {
      case 'patterns': return 'Patterns:'
      case 'cohorts': return 'Your Cohort:'
      case 'evolution': return 'Evolution:'
      default: return 'Patterns:'
    }
  }

  const canCycleViews = (hasPatterns ? 1 : 0) + (hasCohorts ? 1 : 0) + (hasEvolution ? 1 : 0) > 1

  return (
    <div>
      <Block
        label={getLabel()}
        onLabelClick={canCycleViews ? handleLabelClick : undefined}
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

        {view === 'evolution' && hasEvolution && (
          <div className="flex flex-col gap-12">
            <div className="mb-8">
              How your patterns have evolved:
            </div>
            {evolution.slice(0, 3).map((evo, idx) => (
              <div key={idx} className="inline-block">
                <div className="mb-8">
                  {evo.patternTitle}
                </div>
                <div className="mb-4">
                  {evo.trend === 'strengthening' && '↗ Strengthening over time'}
                  {evo.trend === 'stable' && '→ Stable pattern'}
                  {evo.trend === 'weakening' && '↘ Fading pattern'}
                  {evo.trend === 'emerging' && '✦ New pattern emerging'}
                </div>
                {evo.timeline.length > 0 && (
                  <div>
                    {evo.timeline.length} observation{evo.timeline.length > 1 ? 's' : ''} from {dayjs(evo.firstSeen).format('MMM D')} to {dayjs(evo.lastSeen).format('MMM D')}
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
