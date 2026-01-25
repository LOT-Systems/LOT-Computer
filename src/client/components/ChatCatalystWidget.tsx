import React from 'react'
import { useStore } from '@nanostores/react'
import { Block, Button } from '#client/components/ui'
import { useChatCatalysts } from '#client/queries'
import * as stores from '#client/stores'
import { UserTag } from '#shared/types'
import { getChatCatalystNarrative } from '#client/utils/narrative'

/**
 * Chat Catalyst Widget - Prompts to connect with cohort members
 * Shows when similar users are online or social energy needs attention
 */
export function ChatCatalystWidget() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const { data, isLoading } = useChatCatalysts()
  const me = useStore(stores.me)

  const cycleCatalyst = () => {
    if (!data || data.catalysts.length === 0) return
    setCurrentIndex(prev => (prev + 1) % data.catalysts.length)
  }

  // Check if current user can access /us section (admin-level access)
  const canAccessUserProfiles = React.useMemo(() => {
    if (!me) return false
    if (me.isAdmin) return true
    return me.tags.some((tag) =>
      tag.toLowerCase() === UserTag.Usership.toLowerCase() ||
      tag.toLowerCase() === UserTag.RND.toLowerCase()
    )
  }, [me])

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (data.catalysts.length === 0) return null // No connection prompts

  const catalyst = data.catalysts[currentIndex]
  const hasMultiple = data.catalysts.length > 1

  const handleAction = () => {
    // Navigate to specific user profile or community chat
    if (catalyst.action.cohortMember) {
      // Navigate to user profile (using same pattern as Sync.tsx)
      const userId = catalyst.action.cohortMember.id
      window.location.href = canAccessUserProfiles ? `/us/u/${userId}` : `/u/${userId}`
    } else {
      // Navigate to community chat
      stores.goTo('sync')
    }
  }

  return (
    <Block
      label="Connect:"
      blockView
      onLabelClick={hasMultiple ? cycleCatalyst : undefined}
    >
      <div className="inline-block">
        {/* Narrative context */}
        <div className="mb-12 opacity-75">
          {getChatCatalystNarrative(catalyst.priority)}
        </div>

        {/* Catalyst title */}
        <div className="mb-12">
          {catalyst.title}
        </div>

        {/* Main message */}
        <div className="mb-12">
          {catalyst.message}
        </div>

        {/* Action button */}
        <div className="mb-8">
          <Button onClick={handleAction}>
            {catalyst.action.label}
          </Button>
        </div>

        {/* Conversation starters if available */}
        {catalyst.conversationStarters && catalyst.conversationStarters.length > 0 && (
          <div className="mb-12 text-[12px] opacity-60">
            <div className="mb-4">Conversation ideas:</div>
            {catalyst.conversationStarters.map((starter, i) => (
              <div key={i} className="mb-2">• {starter}</div>
            ))}
          </div>
        )}

        {/* Cohort member info if present */}
        {catalyst.action.cohortMember && (
          <div className="text-[12px] opacity-60">
            {catalyst.action.cohortMember.name}
          </div>
        )}

        {/* Multiple catalysts indicator */}
        {hasMultiple && (
          <div className="mt-8 text-[12px] opacity-60">
            {currentIndex + 1} of {data.catalysts.length}
          </div>
        )}
      </div>
    </Block>
  )
}
