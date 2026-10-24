/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button } from '#client/components/ui'
import { useCohorts, useEnergy, useProfile } from '#client/queries'
import { useLogContext } from '#client/hooks/useLogContext'
import { usePunctuationContext } from '#client/hooks/usePunctuationContext'
import { recordSignal, getUserState } from '#client/stores/intentionEngine'

/**
 * Cohort Connect Widget - Find and connect with cohort members
 *
 * Shows users in the same cohort with shared patterns and behaviors
 * Enriched with user log context for personalized cohort presentation
 * Connection-state aware: factors in user's energy and alignment
 */
export const CohortConnectWidget: React.FC = () => {
  const me = useStore(stores.me)
  const { data: cohortData, isLoading } = useCohorts()
  const { data: energyData } = useEnergy()
  const { data: profileData } = useProfile()
  const [expandedMemberId, setExpandedMemberId] = React.useState<string | null>(null)
  const logCtx = useLogContext()
  const punctuation = usePunctuationContext()
  const hasRecordedRef = React.useRef(false)

  // Resolved physiological classification from profile (server-derived archetype)
  const physiologicalArchetype = profileData?.archetype
  const physiologicalCohort = profileData?.behavioralCohort
  const energyLevel = energyData?.energyState?.currentLevel
  const energyTrajectory = energyData?.energyState?.trajectory

  // Record cohort widget view signal once. Include punctuation tone
  // so the intent engine can correlate cohort engagement with the
  // user's current intonation.
  if (!hasRecordedRef.current && cohortData?.matches?.length) {
    recordSignal('mood', 'cohort_widget_viewed', {
      matchCount: cohortData.matches.length,
      hour: new Date().getHours(),
      punctuationTone: punctuation.aggregate.tone,
      punctuationIntensity: punctuation.aggregate.intensity,
      callForHelp: punctuation.callForHelp,
    })
    hasRecordedRef.current = true
  }

  if (isLoading || !cohortData?.matches || cohortData.matches.length === 0) {
    return null
  }

  const { matches, yourPatterns } = cohortData

  // Determine cohort name from patterns
  const cohort = yourPatterns && yourPatterns.length > 0
    ? yourPatterns[0].type.replace('-', ' ')
    : 'explorer'

  // Get connection state context for richer matching insight
  const userState = getUserState()
  const connectionQuality = energyData?.energyState?.romanticConnection?.connectionQuality
  const energyStatus = energyData?.energyState?.status

  // Connection readiness - combine energy + alignment + punctuation for cohort context.
  // Punctuation is a live, unfiltered signal — a "call for help" detected
  // in the user's log takes precedence over steadier state indicators.
  const connectionReadiness = punctuation.callForHelp
    ? 'needs-support'
    : userState.alignment === 'flowing' || userState.alignment === 'aligned'
      ? 'open'
      : userState.needsSupport === 'critical' || userState.needsSupport === 'moderate'
        ? 'needs-support'
        : userState.energy === 'depleted' || userState.energy === 'low'
          ? 'low-energy'
          : punctuation.aggregate.tone === 'excited'
            ? 'open'
            : 'neutral'

  // Show top 5 matches. When the user's punctuation context signals a
  // "call for help", we gently boost matches whose shared patterns hint
  // at calm/steady archetypes so that the first people the user sees
  // are the ones most likely to help regulate — without hiding the
  // underlying similarity order. This is cohort matching that reads
  // the room.
  const CALM_HINTS = ['calm', 'peaceful', 'steady', 'grounded', 'supportive', 'grateful']
  const topMatches = [...matches]
    .map((m) => {
      let boost = 0
      if (punctuation.callForHelp) {
        const text = m.sharedPatterns.join(' ').toLowerCase()
        if (CALM_HINTS.some((h) => text.includes(h))) boost += 0.08
      }
      if (punctuation.aggregate.tone === 'excited') {
        const text = m.sharedPatterns.join(' ').toLowerCase()
        if (text.includes('excited') || text.includes('energized')) boost += 0.05
      }
      return { ...m, rankScore: m.similarity + boost }
    })
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 5)

  const handleViewProfile = (userId: string, similarity: number) => {
    recordSignal('mood', 'cohort_profile_viewed', {
      userId,
      similarity,
      connectionReadiness,
      hour: new Date().getHours()
    })
    window.location.href = `/users/${userId}`
  }

  const handleSendMessage = (userId: string, similarity: number) => {
    recordSignal('mood', 'cohort_message_initiated', {
      userId,
      similarity,
      connectionReadiness,
      hour: new Date().getHours()
    })
    stores.goTo('sync')
  }

  const handleToggleExpand = (userId: string) => {
    const willExpand = expandedMemberId !== userId
    if (willExpand) {
      recordSignal('mood', 'cohort_member_expanded', { userId, hour: new Date().getHours() })
    }
    setExpandedMemberId(expandedMemberId === userId ? null : userId)
  }

  // Connection context message based on user state.
  // Punctuation-driven copy takes precedence when it is meaningful —
  // the user's voice is treated as the freshest signal.
  const connectionContext = punctuation.callForHelp
    ? 'We read your voice. Reach out — these members are close to you now.'
    : connectionReadiness === 'needs-support'
      ? 'Reaching out can help. These members share your patterns.'
      : connectionReadiness === 'low-energy'
        ? 'Low energy. Gentle connections only.'
        : connectionReadiness === 'open' && punctuation.aggregate.tone === 'excited'
          ? 'Your energy is high. Share it.'
          : connectionReadiness === 'open'
            ? 'Good energy for connection.'
            : punctuation.aggregate.tone === 'questioning'
              ? 'Your log is full of questions. Someone here has answers.'
              : null

  return (
    <Block label="Cohort:" blockView>
      <div>
        {/* Physiological classification */}
        {(physiologicalArchetype || physiologicalCohort) && (
          <div className="mb-16">
            <div className="opacity-30 mb-4 uppercase tracking-widest text-xs">Physiological profile</div>
            <div className="flex flex-col gap-y-4">
              {physiologicalArchetype && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">Archetype</span>
                  <span>{physiologicalArchetype}</span>
                </div>
              )}
              {physiologicalCohort && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">Cohort</span>
                  <span>{physiologicalCohort}</span>
                </div>
              )}
              {energyLevel !== undefined && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">ATP</span>
                  <span className="tabular-nums">
                    {energyLevel}%
                    {energyTrajectory && (
                      <span className="opacity-30 ml-8 capitalize">{energyTrajectory}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cohort name */}
        <div className="mb-16">
          <div className="opacity-30 mb-4">Behavioral cohort</div>
          <div className="capitalize">{cohort}</div>
        </div>

        {/* Connection context from user state */}
        {connectionContext && (
          <div className="mb-16 opacity-30">
            {connectionContext}
          </div>
        )}

        {/* Total members */}
        <div className="mb-16">
          {matches.length} {matches.length === 1 ? 'member' : 'members'} with shared patterns
        </div>

        {/* Member list - minimal */}
        <div className="space-y-4">
          {topMatches.map((match) => {
            const isExpanded = expandedMemberId === match.user.id
            const similarity = Math.round(match.similarity * 100)

            return (
              <div
                key={match.user.id}
                className="border-t border-acc/10 pt-8 first:border-t-0 first:pt-0"
              >
                {/* Member header - clickable */}
                <div
                  className="flex items-start justify-between cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
                  onClick={() => handleToggleExpand(match.user.id)}
                >
                  <div className="flex-1">
                    <div className="mb-4">
                      {match.user.firstName} {match.user.lastName?.charAt(0)}.
                    </div>
                    <div>
                      {match.user.city || 'Location unknown'} • {similarity}% match
                    </div>
                  </div>

                  <div>
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-8 ml-4 space-y-8">
                    {/* Shared patterns */}
                    {match.sharedPatterns.length > 0 && (
                      <div>
                        <div className="mb-4">Shared patterns</div>
                        <div className="space-y-2">
                          {match.sharedPatterns.slice(0, 3).map((pattern, i) => (
                            <div key={i}>. {pattern}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        size="small"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          handleViewProfile(match.user.id, match.similarity)
                        }}
                      >
                        View profile
                      </Button>
                      <Button
                        size="small"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          handleSendMessage(match.user.id, match.similarity)
                        }}
                      >
                        Send message
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* View all link */}
        {matches.length > 5 && (
          <div className="mt-16">
            <button
              onClick={() => window.location.href = '/community'}
              className="hover:opacity-100 transition-opacity"
            >
              View all {matches.length} members
            </button>
          </div>
        )}

        {/* Log-context-grounded cohort insight */}
        <div className="mt-16 opacity-30">
          {punctuation.sampleSize > 0 && punctuation.aggregate.tone !== 'flat'
            ? `Matched on ${logCtx.widgetDiversity || 1} dimensions · voice: ${punctuation.aggregate.tone}.`
            : !logCtx.isEmpty && logCtx.widgetDiversity >= 3
              ? `Matched on ${logCtx.widgetDiversity} behavioral dimensions.`
              : 'Connections based on shared patterns.'
          }
        </div>
      </div>
    </Block>
  )
}
