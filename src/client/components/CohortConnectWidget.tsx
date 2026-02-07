import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button } from '#client/components/ui'
import { useCohorts } from '#client/queries'
import { useLogContext } from '#client/hooks/useLogContext'
import { recordSignal } from '#client/stores/intentionEngine'

/**
 * Cohort Connect Widget - Find and connect with cohort members
 *
 * Shows users in the same cohort with shared patterns and behaviors
 * Enriched with user log context for personalized cohort presentation
 */
export const CohortConnectWidget: React.FC = () => {
  const me = useStore(stores.me)
  const { data: cohortData, isLoading } = useCohorts()
  const [expandedMemberId, setExpandedMemberId] = React.useState<string | null>(null)
  const logCtx = useLogContext()

  if (isLoading || !cohortData?.matches || cohortData.matches.length === 0) {
    return null
  }

  const { matches, yourPatterns } = cohortData

  // Determine cohort name from patterns
  const cohort = yourPatterns && yourPatterns.length > 0
    ? yourPatterns[0].type.replace('-', ' ')
    : 'explorer'

  // Show only top 5 matches by similarity
  const topMatches = matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)

  const handleViewProfile = (userId: string) => {
    recordSignal('mood', 'cohort_profile_viewed', { userId, hour: new Date().getHours() })
    window.location.href = `/users/${userId}`
  }

  const handleToggleExpand = (userId: string) => {
    setExpandedMemberId(expandedMemberId === userId ? null : userId)
  }

  return (
    <Block label="Cohort:" blockView>
      <div className="font-mono">
        {/* Cohort name */}
        <div className="mb-16">
          <div className="  mb-4">Your cohort</div>
          <div className="capitalize">{cohort}</div>
        </div>

        {/* Total members */}
        <div className="mb-16  ">
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
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        {match.user.firstName} {match.user.lastName?.charAt(0)}.
                      </div>
                    </div>
                    <div className=" ">
                      {match.user.city || 'Location unknown'} • {similarity}% match
                    </div>
                  </div>

                  <div className=" ">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-8 ml-4 space-y-8">
                    {/* Shared patterns */}
                    {match.sharedPatterns.length > 0 && (
                      <div>
                        <div className="  mb-4">Shared patterns</div>
                        <div className=" space-y-2">
                          {match.sharedPatterns.slice(0, 3).map((pattern, i) => (
                            <div key={i}>• {pattern}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProfile(match.user.id)
                        }}
                      >
                        View profile
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = '/sync'
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
          <div className="mt-16 text-center">
            <button
              onClick={() => window.location.href = '/community'}
              className="  hover:opacity-100 transition-opacity"
            >
              View all {matches.length} members
            </button>
          </div>
        )}

        {/* Log-context-grounded cohort insight */}
        <div className="mt-16 opacity-30 text-center">
          {!logCtx.isEmpty && logCtx.widgetDiversity >= 3
            ? `Matched on ${logCtx.widgetDiversity} behavioral dimensions.`
            : 'Connections based on shared patterns.'
          }
        </div>
      </div>
    </Block>
  )
}
