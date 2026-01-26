import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button } from '#client/components/ui'
import { useCohorts } from '#client/queries'
import { useNavigate } from 'react-router-dom'

/**
 * Cohort Connect Widget - Find and connect with cohort members
 *
 * Shows users in the same cohort with shared patterns and behaviors
 * Enables meaningful connections based on actual user patterns
 */
export const CohortConnectWidget: React.FC = () => {
  const me = useStore(stores.me)
  const { data: cohortData, isLoading } = useCohorts()
  const navigate = useNavigate()
  const [expandedMemberId, setExpandedMemberId] = React.useState<string | null>(null)

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
    navigate(`/users/${userId}`)
  }

  const handleToggleExpand = (userId: string) => {
    setExpandedMemberId(expandedMemberId === userId ? null : userId)
  }

  return (
    <Block label="Cohort:" blockView>
      <div className="font-mono">
        {/* Cohort name */}
        <div className="mb-16">
          <div className="text-sm opacity-40 mb-4">Your cohort</div>
          <div className="text-base capitalize">{cohort}</div>
        </div>

        {/* Total members */}
        <div className="mb-16 text-sm opacity-60">
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
                      <div className="text-sm">
                        {match.user.firstName} {match.user.lastName?.charAt(0)}.
                      </div>
                    </div>
                    <div className="text-xs opacity-40">
                      {match.user.city || 'Location unknown'} • {similarity}% match
                    </div>
                  </div>

                  <div className="text-xs opacity-40">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-8 ml-4 space-y-8">
                    {/* Shared patterns */}
                    {match.sharedPatterns.length > 0 && (
                      <div>
                        <div className="text-xs opacity-40 mb-4">Shared patterns</div>
                        <div className="text-xs space-y-2">
                          {match.sharedPatterns.slice(0, 3).map((pattern, i) => (
                            <div key={i} className="opacity-70">• {pattern}</div>
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
                          navigate('/sync')
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
              onClick={() => navigate('/community')}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              View all {matches.length} members →
            </button>
          </div>
        )}

        {/* Subtle hint */}
        <div className="mt-16 text-xs opacity-30 text-center">
          Connections based on patterns
        </div>
      </div>
    </Block>
  )
}
