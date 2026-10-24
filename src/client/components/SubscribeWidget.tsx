/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
      <div className="w-full">
        <div className="mb-16">Consider subscribing!</div>
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
