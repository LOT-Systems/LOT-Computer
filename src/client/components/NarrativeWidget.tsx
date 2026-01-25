import React from 'react'
import { Block } from '#client/components/ui'
import { useNarrative } from '#client/queries'

type NarrativeView = 'story' | 'achievements' | 'quests'

/**
 * Narrative Widget - RPG-style story progression and achievements
 * Cycles: Story > Achievements > Quests
 */
export function NarrativeWidget() {
  const [view, setView] = React.useState<NarrativeView>('story')
  const { data, isLoading } = useNarrative()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'story': return 'achievements'
        case 'achievements': return 'quests'
        case 'quests': return 'story'
        default: return 'story'
      }
    })
  }

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (!data.narrative) return null

  const { narrative } = data

  const label =
    view === 'story' ? 'Story:' :
    view === 'achievements' ? 'Achievements:' :
    'Quests:'

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'story' && (
        <div className="inline-block">
          {/* Level and chapter */}
          <div className="mb-12 flex items-center gap-12">
            <span className="text-[20px]">Level {narrative.currentLevel}</span>
            <span>Chapter {narrative.currentArc.chapter}: {narrative.currentArc.title}</span>
          </div>

          {/* Current narrative */}
          <div className="mb-12">
            {narrative.currentArc.narrative}
          </div>

          {/* Next milestone */}
          {narrative.nextMilestone && (
            <div>
              Next: {narrative.nextMilestone.title} at level {narrative.nextMilestone.level}
            </div>
          )}
        </div>
      )}

      {view === 'achievements' && (
        <div className="inline-block">
          {narrative.achievements.filter(a => a.unlocked).length === 0 ? (
            <div>
              No achievements yet. Keep practicing.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {narrative.achievements
                .filter(a => a.unlocked)
                .sort((a, b) => {
                  // Sort by unlocked date, newest first
                  if (!a.unlockedAt || !b.unlockedAt) return 0
                  return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
                })
                .slice(0, 5)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-8">
                    <span>{achievement.icon}</span>
                    <span>{achievement.title}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {view === 'quests' && (
        <div className="inline-block">
          {narrative.currentArc.activeQuests.length === 0 ? (
            <div>
              No active quests right now.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {narrative.currentArc.activeQuests.map((quest: any) => (
                <div key={quest.id}>
                  <div className="mb-4 flex items-center gap-8">
                    <span>{quest.title}</span>
                    {quest.complete && <span>✓</span>}
                  </div>
                  {!quest.complete && quest.progress !== undefined && (
                    <div className="text-[12px]">
                      {quest.progress}% complete
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
