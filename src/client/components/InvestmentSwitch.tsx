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
 * Investment Switch — Settings toggle for Angel Investor mode
 * LOT is a stealth supernatural self-care startup in pre-brand, pre-product stage
 * accepting sci-fi based Angel Investors. This switch activates investor perspective.
 */
export function InvestmentSwitch() {
  const [isInvestorMode, setIsInvestorMode] = React.useState(() => {
    return localStorage.getItem('lot-investor-mode') === 'true'
  })

  const [tier, setTier] = React.useState<'angel' | 'seed' | 'series-a'>(() => {
    return (localStorage.getItem('lot-investor-tier') as any) || 'angel'
  })

  const toggle = () => {
    const next = !isInvestorMode
    setIsInvestorMode(next)
    localStorage.setItem('lot-investor-mode', String(next))

    if (next) {
      localStorage.setItem('lot-investor-activated', Date.now().toString())
    }
  }

  const cycleTier = () => {
    const tiers: Array<'angel' | 'seed' | 'series-a'> = ['angel', 'seed', 'series-a']
    const idx = tiers.indexOf(tier)
    const next = tiers[(idx + 1) % tiers.length]
    setTier(next)
    localStorage.setItem('lot-investor-tier', next)
  }

  const tierLabels = {
    'angel': 'Angel — Sci-fi believers',
    'seed': 'Seed — Quantum self-care',
    'series-a': 'Series A — Supernatural infrastructure',
  }

  return (
    <div>
      <Block label="Investment:" onChildrenClick={toggle}>
        {isInvestorMode ? 'On' : 'Off'}
      </Block>
      {isInvestorMode && (
        <Block label="Tier:" onChildrenClick={cycleTier}>
          {tierLabels[tier]}
        </Block>
      )}
    </div>
  )
}
