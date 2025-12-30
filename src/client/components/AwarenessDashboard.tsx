import React from 'react'
import { Block, ToggleSection, ToggleGroup, Tag, TagsContainer } from '#client/components/ui'
import { useProfile } from '#client/queries'
import { cn } from '#client/utils'

type PsychologicalProfile = {
  selfAwarenessLevel?: number
  emotionalRange?: number
  reflectionQuality?: number
  growthTrajectory?: 'emerging' | 'developing' | 'deepening' | 'integrated'
  dominantNeeds?: string[]
  values?: string[]
  emotionalPatterns?: string[]
  journalSentiment?: {
    positive: number
    neutral: number
    challenging: number
  }
  archetype?: string
  archetypeDescription?: string
  behavioralCohort?: string
}

/**
 * Awareness Dashboard - Display psychological profile with toggle sections
 */
export function AwarenessDashboard() {
  const { data: profile } = useProfile()

  if (!profile || typeof profile.selfAwarenessLevel === 'undefined') {
    return (
      <Block label="Awareness:" blockView>
        <div className="opacity-60">
          Answer more Memory questions to reveal your psychological profile.
        </div>
      </Block>
    )
  }

  const psychProfile: PsychologicalProfile = {
    selfAwarenessLevel: profile.selfAwarenessLevel,
    emotionalRange: profile.emotionalRange,
    reflectionQuality: profile.reflectionQuality,
    growthTrajectory: profile.growthTrajectory,
    dominantNeeds: profile.dominantNeeds,
    values: profile.values,
    emotionalPatterns: profile.emotionalPatterns,
    journalSentiment: profile.journalSentiment,
    archetype: profile.archetype,
    archetypeDescription: profile.archetypeDescription,
    behavioralCohort: profile.behavioralCohort,
  }

  const awarenessPercentage = Math.round((profile.selfAwarenessLevel / 10) * 100)

  return (
    <Block label="Awareness:" blockView>
      <ToggleGroup>
        {/* Main Awareness Score */}
        <div className="mb-16">
          <div className="flex items-center gap-8">
            <span className="text-[20px]">{awarenessPercentage}%</span>
            <span className="opacity-60">Self-Awareness Index</span>
          </div>
          {psychProfile.growthTrajectory && (
            <div className="mt-4 opacity-60 capitalize">
              Journey: {psychProfile.growthTrajectory}
            </div>
          )}
        </div>

        {/* Archetype Section */}
        {psychProfile.archetype && (
          <ToggleSection label="Soul Archetype" defaultOpen={true}>
            <div className="pl-16">
              <div className="mb-8">
                <span className="font-medium">{psychProfile.archetype}</span>
              </div>
              {psychProfile.archetypeDescription && (
                <div className="opacity-70 text-[14px] mb-12">
                  {psychProfile.archetypeDescription}
                </div>
              )}
              {psychProfile.behavioralCohort && (
                <div className="mt-8 opacity-60">
                  Behavioral cohort: {psychProfile.behavioralCohort}
                </div>
              )}
            </div>
          </ToggleSection>
        )}

        {/* Core Values */}
        {psychProfile.values && psychProfile.values.length > 0 && (
          <ToggleSection label="Core Values" defaultOpen={false}>
            <div className="pl-16">
              <TagsContainer>
                {psychProfile.values.map((value) => (
                  <Tag key={value} color="#acc">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Tag>
                ))}
              </TagsContainer>
              <div className="mt-8 opacity-60 text-[14px]">
                Values that appear consistently in your choices
              </div>
            </div>
          </ToggleSection>
        )}

        {/* Emotional Patterns */}
        {psychProfile.emotionalPatterns && psychProfile.emotionalPatterns.length > 0 && (
          <ToggleSection label="Emotional Patterns" defaultOpen={false}>
            <div className="pl-16">
              <div className="flex flex-col gap-4">
                {psychProfile.emotionalPatterns.map((pattern) => (
                  <div key={pattern}>
                    • {formatPattern(pattern)}
                  </div>
                ))}
              </div>
              {psychProfile.emotionalRange !== undefined && (
                <div className="mt-12 opacity-60 text-[14px]">
                  Emotional range: {psychProfile.emotionalRange}/10
                </div>
              )}
            </div>
          </ToggleSection>
        )}

        {/* Dominant Needs */}
        {psychProfile.dominantNeeds && psychProfile.dominantNeeds.length > 0 && (
          <ToggleSection label="Dominant Needs" defaultOpen={false}>
            <div className="pl-16">
              <div className="flex flex-col gap-8">
                {psychProfile.dominantNeeds.map((need, index) => (
                  <div key={need} className="flex items-center gap-8">
                    <span className="opacity-40">{index + 1}.</span>
                    <span>{need.charAt(0).toUpperCase() + need.slice(1)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 opacity-60 text-[14px]">
                Core psychological needs appearing in your patterns
              </div>
            </div>
          </ToggleSection>
        )}

        {/* Journal Sentiment */}
        {psychProfile.journalSentiment && (
          <ToggleSection label="Journal Sentiment" defaultOpen={false}>
            <div className="pl-16">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <span>Positive:</span>
                  <span>{psychProfile.journalSentiment.positive}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Neutral:</span>
                  <span>{psychProfile.journalSentiment.neutral}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Challenging:</span>
                  <span>{psychProfile.journalSentiment.challenging}%</span>
                </div>
              </div>
              <div className="mt-12 opacity-60 text-[14px]">
                Emotional tone across your journal entries
              </div>
            </div>
          </ToggleSection>
        )}

        {/* Reflection Quality */}
        {psychProfile.reflectionQuality !== undefined && (
          <ToggleSection label="Reflection Depth" defaultOpen={false}>
            <div className="pl-16">
              <div className="flex items-center gap-8">
                <span>{psychProfile.reflectionQuality}/10</span>
                <span className="opacity-60">Introspection quality</span>
              </div>
              <div className="mt-8 opacity-60 text-[14px]">
                Depth of self-reflection in your writing
              </div>
            </div>
          </ToggleSection>
        )}
      </ToggleGroup>
    </Block>
  )
}

/**
 * Format camelCase pattern names to readable text
 */
function formatPattern(pattern: string): string {
  return pattern
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
