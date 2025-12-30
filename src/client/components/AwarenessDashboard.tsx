import React from 'react'
import { Block, Tag, TagsContainer } from '#client/components/ui'
import { useProfile } from '#client/queries'

type AwarenessView =
  | 'overview'
  | 'archetype'
  | 'values'
  | 'patterns'
  | 'needs'
  | 'sentiment'
  | 'reflection'

/**
 * Awareness Dashboard - Clickable cycling through psychological profile views
 * Pattern: Overview > Archetype > Values > Patterns > Needs > Sentiment > Reflection
 */
export function AwarenessDashboard() {
  const { data: profile } = useProfile()
  const [awarenessView, setAwarenessView] = React.useState<AwarenessView>('overview')

  if (!profile || typeof profile.selfAwarenessLevel === 'undefined') {
    return (
      <Block label="Awareness:" blockView>
        <div className="opacity-60">
          Answer more Memory questions to reveal your psychological profile.
        </div>
      </Block>
    )
  }

  const awarenessPercentage = Math.round((profile.selfAwarenessLevel / 10) * 100)

  // Cycle through views on label click
  const cycleView = () => {
    setAwarenessView(prev => {
      switch (prev) {
        case 'overview': return 'archetype'
        case 'archetype': return 'values'
        case 'values': return 'patterns'
        case 'patterns': return 'needs'
        case 'needs': return 'sentiment'
        case 'sentiment': return 'reflection'
        case 'reflection': return 'overview'
        default: return 'overview'
      }
    })
  }

  // Determine label based on view
  const label =
    awarenessView === 'overview' ? 'Awareness:' :
    awarenessView === 'archetype' ? 'Archetype:' :
    awarenessView === 'values' ? 'Values:' :
    awarenessView === 'patterns' ? 'Patterns:' :
    awarenessView === 'needs' ? 'Needs:' :
    awarenessView === 'sentiment' ? 'Sentiment:' :
    'Reflection:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {awarenessView === 'overview' && (
        <div className="inline-block">
          <div className="flex items-center gap-8">
            <span className="text-[20px]">{awarenessPercentage}%</span>
            <span className="opacity-60">Self-Awareness</span>
          </div>
          {profile.growthTrajectory && (
            <div className="mt-4 opacity-60 capitalize">
              Journey: {profile.growthTrajectory}
            </div>
          )}
        </div>
      )}

      {awarenessView === 'archetype' && profile.archetype && (
        <div className="inline-block">
          <div className="mb-8">
            <span className="font-medium">{profile.archetype}</span>
          </div>
          {profile.archetypeDescription && (
            <div className="opacity-70 text-[14px] mb-12">
              {profile.archetypeDescription}
            </div>
          )}
          {profile.behavioralCohort && (
            <div className="opacity-60">
              Cohort: {profile.behavioralCohort}
            </div>
          )}
        </div>
      )}

      {awarenessView === 'values' && profile.values && profile.values.length > 0 && (
        <div className="inline-block">
          <TagsContainer>
            {profile.values.map((value) => (
              <Tag key={value} color="#acc">
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Tag>
            ))}
          </TagsContainer>
          <div className="mt-8 opacity-60 text-[14px]">
            Core values appearing in your choices
          </div>
        </div>
      )}

      {awarenessView === 'patterns' && profile.emotionalPatterns && profile.emotionalPatterns.length > 0 && (
        <div className="inline-block">
          <div className="flex flex-col gap-4">
            {profile.emotionalPatterns.map((pattern) => (
              <div key={pattern}>• {pattern}</div>
            ))}
          </div>
          {profile.emotionalRange !== undefined && (
            <div className="mt-12 opacity-60 text-[14px]">
              Emotional range: {profile.emotionalRange}/10
            </div>
          )}
        </div>
      )}

      {awarenessView === 'needs' && profile.dominantNeeds && profile.dominantNeeds.length > 0 && (
        <div className="inline-block">
          <div className="flex flex-col gap-8">
            {profile.dominantNeeds.map((need, index) => (
              <div key={need} className="flex items-center gap-8">
                <span className="opacity-40">{index + 1}.</span>
                <span>{need.charAt(0).toUpperCase() + need.slice(1)}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 opacity-60 text-[14px]">
            Core psychological needs in your patterns
          </div>
        </div>
      )}

      {awarenessView === 'sentiment' && profile.journalSentiment && (
        <div className="inline-block">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-16">
              <span>Positive:</span>
              <span>{profile.journalSentiment.positive}%</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span>Neutral:</span>
              <span>{profile.journalSentiment.neutral}%</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span>Challenging:</span>
              <span>{profile.journalSentiment.challenging}%</span>
            </div>
          </div>
          <div className="mt-12 opacity-60 text-[14px]">
            Emotional tone across journal entries
          </div>
        </div>
      )}

      {awarenessView === 'reflection' && profile.reflectionQuality !== undefined && (
        <div className="inline-block">
          <div className="flex items-center gap-8 mb-8">
            <span className="text-[20px]">{profile.reflectionQuality}/10</span>
            <span className="opacity-60">Introspection depth</span>
          </div>
          {profile.growthTrajectory && (
            <div className="opacity-60 text-[14px] capitalize">
              Quality of self-reflection in your writing
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
