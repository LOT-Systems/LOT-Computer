import React from 'react'
import { Block } from '#client/components/ui'
import { useGoalProgression } from '#client/queries'

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
        <div className="inline-block">
          {/* Primary goal */}
          {overallJourney.primaryGoal ? (
            <>
              <div className="mb-8">
                {overallJourney.primaryGoal.title}
              </div>
              <div className="mb-12 opacity-60">
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
        <div className="inline-block">
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
                    <div className="opacity-60">
                      {goal.journeyStage === 'beginning' && 'Beginning'}
                      {goal.journeyStage === 'struggle' && 'In progress'}
                      {goal.journeyStage === 'breakthrough' && 'Breakthrough'}
                      {goal.journeyStage === 'integration' && 'Integrating'}
                      {goal.journeyStage === 'mastery' && 'Mastery'}
                      {goal.progressMarkers.length > 0 && ` • ${goal.progressMarkers.length} ${goal.progressMarkers.length === 1 ? 'marker' : 'markers'}`}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {view === 'narrative' && (
        <div className="inline-block">
          {/* Chapter title */}
          <div className="mb-8">
            {narrative.currentChapter}
          </div>

          {/* Story arc */}
          <div className="mb-12 opacity-60">
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
