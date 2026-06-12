/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { useStore } from '@nanostores/react'
import { Block, Button } from '#client/components/ui'
import { useChatCatalysts } from '#client/queries'
import * as stores from '#client/stores'
import { UserTag } from '#shared/types'
import { getChatCatalystNarrative } from '#client/utils/narrative'
import { recordSignal } from '#client/stores/intentionEngine'

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
    // Record connection signal
    recordSignal('journal', 'connection_accepted', {
      type: catalyst.type,
      cohortMember: catalyst.action.cohortMember?.name || 'community',
      hour: new Date().getHours()
    })

    // Navigate to specific user profile or community chat
    if (catalyst.action.cohortMember) {
      const userId = catalyst.action.cohortMember.id
      window.location.href = canAccessUserProfiles ? `/us/u/${userId}` : `/u/${userId}`
    } else {
      stores.goTo('sync')
    }
  }

  const handleEmail = () => {
    if (!catalyst.action.cohortMember) return
    recordSignal('journal', 'connection_accepted', {
      type: 'email',
      cohortMember: catalyst.action.cohortMember.name,
      hour: new Date().getHours()
    })
    stores.goTo('log')
    // Pre-populate the Log with an email compose command
    setTimeout(() => {
      const ta = document.querySelector<HTMLTextAreaElement>('textarea')
      if (ta) {
        const name = catalyst.action.cohortMember!.name
        ta.value = `/email to ${name} `
        ta.dispatchEvent(new Event('input', { bubbles: true }))
        ta.focus()
        ta.setSelectionRange(ta.value.length, ta.value.length)
      }
    }, 300)
  }

  return (
    <Block
      label="Connect:"
      blockView
      onLabelClick={hasMultiple ? cycleCatalyst : undefined}
    >
      <div>
        {/* Narrative context */}
        <div className="mb-8">
          {getChatCatalystNarrative(catalyst.priority)}
        </div>

        {/* Catalyst title */}
        <div className="mb-8">
          {catalyst.title}
        </div>

        {/* Main message */}
        <div className="mb-8">
          {catalyst.message}
        </div>

        {/* Action button */}
        <div className="mb-8 flex gap-x-8">
          <Button onClick={handleAction}>
            {catalyst.action.label}
          </Button>
          {catalyst.action.cohortMember && (
            <Button kind="secondary" onClick={handleEmail}>
              ✉ Mail
            </Button>
          )}
        </div>

        {/* Conversation starters if available */}
        {catalyst.conversationStarters && catalyst.conversationStarters.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">Conversation ideas:</div>
            {catalyst.conversationStarters.map((starter, i) => (
              <div key={i} className="mb-2 opacity-30">{starter}</div>
            ))}
          </div>
        )}

        {/* Cohort member info if present */}
        {catalyst.action.cohortMember && (
          <div>
            {catalyst.action.cohortMember.name}
          </div>
        )}

        {/* Multiple catalysts indicator */}
        {hasMultiple && (
          <div className="mt-8">
            {currentIndex + 1} of {data.catalysts.length}
          </div>
        )}
      </div>
    </Block>
  )
}
