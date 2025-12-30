import React from 'react'
import { Block, Button } from '#client/components/ui'

/**
 * Subscribe Widget - Simple prompt to support LOT
 * Links to brand.lot-systems.com for subscription
 * Disappears after click, won't show again for a while
 */
export function SubscribeWidget() {
  const handleSubscribe = () => {
    // Store click timestamp - widget won't show again after this
    localStorage.setItem('subscribe-clicked', Date.now().toString())

    // Open subscription page in new tab
    window.open('https://brand.lot-systems.com', '_blank', 'noopener,noreferrer')
  }

  return (
    <Block label="Subscribe:" blockView>
      <div className="inline-block w-full">
        <div className="mb-16 opacity-90">Consider subscribing!</div>
        <div className="flex gap-8">
          <Button onClick={handleSubscribe}>
            R&D $15
          </Button>
          <Button onClick={handleSubscribe}>
            Usership $99
          </Button>
        </div>
      </div>
    </Block>
  )
}
