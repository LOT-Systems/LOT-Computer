import React from 'react'
import { Block } from '#client/components/ui'
import { useNarrative } from '#client/queries'
import { useLogContext } from '#client/hooks/useLogContext'
import { ProgressBars } from '#client/utils/progressBars'
import { recordSignal } from '#client/stores/intentionEngine'

type NarrativeView = 'story' | 'achievements' | 'quests' | 'context'

/**
 * Narrative Widget - RPG-style story progression grounded in user log context
 * Cycles: Story > Achievements > Quests > Context
 */
export function NarrativeWidget() {
  const [view, setView] = React.useState<NarrativeView>('story')
  const { data, isLoading } = useNarrative()
  const logCtx = useLogContext()

  const cycleView = () => {
    setView(prev => {
      const next = prev === 'story' ? 'achievements'
        : prev === 'achievements' ? 'quests'
        : prev === 'quests' ? 'context'
        : 'story'
      try { recordSignal('journal', 'narrative_explored', { view: next, hour: new Date().getHours() }) } catch (e) {}
      return next
    })
  }

  if (isLoading) return null
  if (!data || data.message) return null
  if (!data.narrative) return null

  const { narrative } = data

  const label =
    view === 'story' ? 'Arc:' :
    view === 'achievements' ? 'Unlocked:' :
    view === 'quests' ? 'Active Quests:' :
    'Runtime Context:'

  // Log-context-aware narrative enhancement
  const getContextNarrative = (): string => {
    if (logCtx.isEmpty) return 'No telemetry to compile narrative context.'

    const parts: string[] = []

    // Engagement level narrative
    const engagementNarr: Record<string, string> = {
      'new': 'You are at the beginning. Every signal matters.',
      'exploring': 'The exploration phase is active. Each new module broadens the map.',
      'building': 'Foundation is compiling. Patterns are beginning to converge.',
      'integrated': 'Systems integrated. Deep correlations forming across modules.',
      'mastered': 'Full observability achieved. The system mirrors your rhythm.'
    }
    parts.push(engagementNarr[logCtx.engagementLevel] || '')

    // Mood trajectory narrative
    if (logCtx.moodTrend === 'improving') {
      parts.push('Mood trajectory ascending. The current arc favors forward momentum.')
    } else if (logCtx.moodTrend === 'declining') {
      parts.push('Mood signal weakening. This chapter calls for restoration and reflection.')
    }

    // Streak narrative
    if (logCtx.streak >= 7) {
      parts.push(`${logCtx.streak}-day streak compiled. Consistency is your strongest pattern.`)
    } else if (logCtx.streak >= 3) {
      parts.push(`${logCtx.streak} consecutive days logged. Momentum building.`)
    }

    return parts.filter(Boolean).join(' ')
  }

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'story' && (
        <div>
          {/* Level and chapter */}
          <div className="mb-8 flex items-center gap-8">
            <span>Level {narrative.currentLevel}</span>
            <span>Chapter {narrative.currentArc.chapter}: {narrative.currentArc.title}</span>
          </div>

          {/* Current narrative */}
          <div className="mb-8">
            {narrative.currentArc.narrative}
          </div>

          {/* Next milestone with log-aware context */}
          {narrative.nextMilestone && (
            <div className="mb-8">
              Next: {narrative.nextMilestone.title} at level {narrative.nextMilestone.level}
            </div>
          )}

          {/* Log-derived progress context */}
          {!logCtx.isEmpty && (
            <div className="opacity-30">
              {logCtx.totalEntries} total entries . {logCtx.activeDays} active day{logCtx.activeDays === 1 ? '' : 's'}
              {logCtx.streak > 1 ? ` . ${logCtx.streak}d streak` : ''}
            </div>
          )}
        </div>
      )}

      {view === 'achievements' && (
        <div>
          {narrative.achievements.filter(a => a.unlocked).length === 0 ? (
            <div>
              No achievements unlocked yet. Continue input.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {narrative.achievements
                .filter(a => a.unlocked)
                .sort((a, b) => {
                  if (!a.unlockedAt || !b.unlockedAt) return 0
                  return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
                })
                .slice(0, 5)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-8">
                    <span>{achievement.title}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {view === 'quests' && (
        <div>
          {narrative.currentArc.activeQuests.length === 0 ? (
            <div>
              No active quests. Awaiting next directive.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {narrative.currentArc.activeQuests.map((quest: any) => (
                <div key={quest.id}>
                  <div className="mb-4 flex items-center gap-8">
                    <span>{quest.title}</span>
                    {quest.complete && <span>completed.</span>}
                  </div>
                  {!quest.complete && quest.progress !== undefined && (
                    <div className="flex items-center gap-8">
                      <ProgressBars percentage={quest.progress} barCount={10} />
                      <span className="opacity-30 tabular-nums">{quest.progress}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'context' && (
        <div>
          {logCtx.isEmpty ? (
            <div className="opacity-30">No log data to compile narrative context.</div>
          ) : (
            <>
              {/* Runtime narrative derived from logs */}
              <div className="mb-8">
                {getContextNarrative()}
              </div>

              {/* Module coverage for quest context */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Modules deployed</span>
                <span className="tabular-nums">{logCtx.activeModules.length}/6</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Widget diversity</span>
                <span className="tabular-nums">{logCtx.widgetDiversity}</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Session depth</span>
                <span className="tabular-nums">{logCtx.sessionDepth}</span>
              </div>

              {logCtx.dominantMood && (
                <div className="flex justify-between items-baseline mb-8">
                  <span className="opacity-30">Dominant mood</span>
                  <span>{logCtx.dominantMood}</span>
                </div>
              )}

              {/* Dormant modules as potential quests */}
              {logCtx.dormantModules.length > 0 && (
                <div className="mt-8 opacity-30">
                  Unexplored: {logCtx.dormantModules.join(', ')}.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Block>
  )
}
