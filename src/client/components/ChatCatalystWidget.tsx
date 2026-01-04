import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useChatCatalysts } from '#client/queries'

/**
 * Chat Catalyst Widget - Prompts to connect with cohort members
 * Shows when similar users are online or social energy needs attention
 */
export function ChatCatalystWidget() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const { data, isLoading } = useChatCatalysts()

  const cycleCatalyst = () => {
    if (!data || data.catalysts.length === 0) return
    setCurrentIndex(prev => (prev + 1) % data.catalysts.length)
  }

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (data.catalysts.length === 0) return null // No connection prompts

  const catalyst = data.catalysts[currentIndex]
  const hasMultiple = data.catalysts.length > 1

  const handleAction = () => {
    // Navigate to community chat
    // For now, just log - could be extended to open chat with specific user
    if (catalyst.action.cohortMember) {
      console.log('Connect with:', catalyst.action.cohortMember.name)
    }
    // Could add navigation here: window.location.href = '/chat'
  }

  return (
    <Block
      label="Connect:"
      blockView
      onLabelClick={hasMultiple ? cycleCatalyst : undefined}
    >
      <div className="inline-block">
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

        {/* Cohort member info if present */}
        {catalyst.action.cohortMember && (
          <div className="text-[12px]">
            {catalyst.action.cohortMember.name}
          </div>
        )}

        {/* Multiple catalysts indicator */}
        {hasMultiple && (
          <div className="mt-8 text-[12px]">
            {currentIndex + 1} of {data.catalysts.length}
          </div>
        )}
      </div>
    </Block>
  )
}
