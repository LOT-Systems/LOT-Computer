import * as React from 'react'
import { Block, GhostButton, Button } from '#client/components/ui'
import { usePatterns, useCohorts, usePatternEvolution } from '#client/queries'
import { recordSignal } from '#client/stores/intentionEngine'
import * as stores from '#client/stores'
import dayjs from '#client/utils/dayjs'

export const PatternInsightsWidget = () => {
  const { data: patternsData } = usePatterns()
  const { data: cohortsData } = useCohorts()
  const { data: evolutionData } = usePatternEvolution()
  const [view, setView] = React.useState<'patterns' | 'cohorts' | 'evolution'>('patterns')
  const [selectedInsight, setSelectedInsight] = React.useState<number | null>(null)

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
    // Show message if user has started but needs more data
    if (patternsData?.message || cohortsData?.message) {
      return (
        <div>
          <Block label="Pattern Compiler:" blockView>
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
    setSelectedInsight(null)
  }

  const getLabel = () => {
    switch (view) {
      case 'patterns': return 'Pattern Index:'
      case 'cohorts': return 'Cohort Map:'
      case 'evolution': return 'Pattern Changelog:'
      default: return 'Pattern Index:'
    }
  }

  const canCycleViews = (hasPatterns ? 1 : 0) + (hasCohorts ? 1 : 0) + (hasEvolution ? 1 : 0) > 1

  // Context actions for pattern insights
  const getPatternActions = (insight: any) => {
    const actions: { label: string; handler: () => void }[] = []

    // Check-in action
    actions.push({
      label: 'Check in',
      handler: () => {
        recordSignal('mood', 'pattern_checkin', {
          pattern: insight.title,
          hour: new Date().getHours()
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })

    // Reflect action
    actions.push({
      label: 'Reflect',
      handler: () => {
        recordSignal('memory', 'pattern_reflect', {
          pattern: insight.title,
          hour: new Date().getHours()
        })
        stores.goTo('logs')
      }
    })

    // Integrate action
    actions.push({
      label: 'Integrate',
      handler: () => {
        recordSignal('intentions', 'pattern_integrate', {
          pattern: insight.title,
          hour: new Date().getHours()
        })
      }
    })

    return actions
  }

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
                <div
                  className="mb-8 cursor-pointer"
                  onClick={() => setSelectedInsight(selectedInsight === idx ? null : idx)}
                >
                  {insight.title}
                </div>
                <div className="opacity-60">{insight.description}</div>
                {insight.dataPoints && (
                  <div className="mt-4 opacity-40">
                    Compiled from {insight.dataPoints} data point{insight.dataPoints > 1 ? 's' : ''}.
                  </div>
                )}

                {/* Interactive context buttons - shown when pattern is selected */}
                {selectedInsight === idx && (
                  <div className="mt-8 flex gap-8">
                    {getPatternActions(insight).map((action, aidx) => (
                      <Button key={aidx} onClick={action.handler}>
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'cohorts' && hasCohorts && (
          <div className="flex flex-col gap-12">
            <div className="mb-8 opacity-60">
              Users with correlated behavioral signatures:
            </div>
            {matches.map((match, idx) => (
              <div key={idx} className="inline-block">
                <div className="mb-8">
                  <GhostButton href={`/@${match.user.id}`} rel="external">
                    {match.user.firstName} {match.user.lastName}
                  </GhostButton>
                  {match.user.archetype && (
                    <span className="opacity-60"> . {match.user.archetype}</span>
                  )}
                </div>
                <div className="mb-4 opacity-60">
                  {match.user.city}, {match.user.country}
                </div>
                {match.sharedPatterns.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {match.sharedPatterns.map((pattern, pidx) => (
                      <div key={pidx} className="opacity-60">{pattern}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'evolution' && hasEvolution && (
          <div className="flex flex-col gap-12">
            <div className="mb-8 opacity-60">
              Pattern delta over observed windows:
            </div>
            {evolution.slice(0, 3).map((evo, idx) => (
              <div key={idx} className="inline-block">
                <div className="mb-8">
                  {evo.patternTitle}
                </div>
                <div className="mb-4 opacity-60">
                  {evo.trend === 'strengthening' && 'Signal strengthening. Pattern compiling.'}
                  {evo.trend === 'stable' && 'Stable oscillation. Pattern integrated.'}
                  {evo.trend === 'weakening' && 'Signal attenuating. Pattern deprecating.'}
                  {evo.trend === 'emerging' && 'New signal detected. Pattern initializing.'}
                </div>
                {evo.timeline.length > 0 && (
                  <div className="opacity-40">
                    {evo.timeline.length} observation{evo.timeline.length > 1 ? 's' : ''} from{' '}
                    {dayjs(evo.lastSeen).subtract(7, 'day').format('MMM D')} to {dayjs(evo.lastSeen).format('MMM D')}
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
