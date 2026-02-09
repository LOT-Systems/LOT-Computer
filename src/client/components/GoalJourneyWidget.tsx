import React from 'react'
import { Block } from '#client/components/ui'
import { useGoalProgression } from '#client/queries'
import { recordSignal } from '#client/stores/intentionEngine'

type GoalView = 'journey' | 'goals' | 'narrative'

/**
 * Goal Journey Widget - Show user's detected goals and progress
 * Cycles: Journey > Goals > Narrative
 *
 * Clean, minimal display of goal understanding system
 */
export function GoalJourneyWidget() {
  const [view, setView] = React.useState<GoalView>('journey')
  const { data, isLoading } = useGoalProgression()
  const hasRecordedRef = React.useRef(false)

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'journey': return 'goals'
        case 'goals': return 'narrative'
        case 'narrative': return 'journey'
        default: return 'journey'
      }
    })
  }

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (!data.progression) return null

  const { progression } = data
  const { goals, overallJourney, narrative } = progression

  // Record goal signal once per mount
  if (!hasRecordedRef.current) {
    const activeGoals = goals?.filter((g: any) => g.state === 'active' || g.state === 'progressing') || []
    recordSignal('intentions', 'goals_viewed', {
      activeGoalCount: activeGoals.length,
      primaryGoal: overallJourney?.primaryGoal?.title || null,
      hour: new Date().getHours()
    })
    hasRecordedRef.current = true
  }

  const label =
    view === 'journey' ? 'Journey:' :
    view === 'goals' ? 'Goals:' :
    'Path:'

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'journey' && (
        <div>
          {/* Primary goal */}
          {overallJourney.primaryGoal ? (
            <>
              <div className="mb-8">
                {overallJourney.primaryGoal.title}
              </div>
              <div className="mb-8">
                {overallJourney.primaryGoal.narrative}
              </div>
              {overallJourney.recentBreakthroughs.length > 0 && (
                <div>
                  Recent progress: {overallJourney.recentBreakthroughs.length} {overallJourney.recentBreakthroughs.length === 1 ? 'breakthrough' : 'breakthroughs'}
                </div>
              )}
            </>
          ) : (
            <div>
              Your goals are emerging. Continue your practice.
            </div>
          )}
        </div>
      )}

      {view === 'goals' && (
        <div>
          {goals.filter(g => g.state === 'active' || g.state === 'progressing').length === 0 ? (
            <div>
              No active goals detected yet. Your journey reveals them.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {goals
                .filter(g => g.state === 'active' || g.state === 'progressing')
                .slice(0, 5)
                .map((goal) => (
                  <div key={goal.id}>
                    <div className="mb-4">
                      {goal.title}
                    </div>
                    <div className="opacity-30">
                      {goal.journeyStage === 'beginning' && 'Beginning'}
                      {goal.journeyStage === 'struggle' && 'In progress'}
                      {goal.journeyStage === 'breakthrough' && 'Breakthrough'}
                      {goal.journeyStage === 'integration' && 'Integrating'}
                      {goal.journeyStage === 'mastery' && 'Mastery'}
                      {goal.progressMarkers.length > 0 && ` . ${goal.progressMarkers.length} ${goal.progressMarkers.length === 1 ? 'marker' : 'markers'}`}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {view === 'narrative' && (
        <div>
          {/* Chapter title */}
          <div className="mb-8">
            {narrative.currentChapter}
          </div>

          {/* Story arc */}
          <div className="mb-8">
            {narrative.storyArc}
          </div>

          {/* Next milestone */}
          <div>
            Next: {narrative.nextMilestone}
          </div>
        </div>
      )}
    </Block>
  )
}
