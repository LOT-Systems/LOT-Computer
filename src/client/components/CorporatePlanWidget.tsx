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
 * Corporate Plan Widget — LOT Corporate Plan sales (worker self-care)
 * Self-care as a workplace benefit. The body is the computer —
 * treat it like enterprise infrastructure.
 */
export function CorporatePlanWidget() {
  const [view, setView] = React.useState<'overview' | 'features' | 'pricing'>('overview')

  // Only show in investor mode
  const investorMode = localStorage.getItem('lot-investor-mode') === 'true'
  if (!investorMode) return null

  const cycleView = () => {
    setView(prev =>
      prev === 'overview' ? 'features' :
      prev === 'features' ? 'pricing' :
      'overview'
    )
  }

  const label =
    view === 'overview' ? '[TBD] Corporate Plan:' :
    view === 'features' ? '[TBD] Plan Features:' :
    '[TBD] Plan Pricing:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'overview' && (
        <div>
          <div className="mb-16">
            Worker self-care as enterprise infrastructure.
            If the body is the computer, maintenance is not optional.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Type</span>
              <span>Team wellness subscription</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Minimum</span>
              <span>5 seats</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Deployment</span>
              <span>Cloud + Offline (flash drive)</span>
            </div>
          </div>
        </div>
      )}

      {view === 'features' && (
        <div className="flex flex-col gap-4">
          <div>AI Memory Engine for each team member</div>
          <div>Biofield monitoring (ATP, Clarity, Alignment)</div>
          <div>Custom astrology + psychology patches per employee</div>
          <div>Team emotional pulse dashboard</div>
          <div>Monocle-style kiosk for office deployment</div>
          <div>LOT socks with department code embroidery</div>
          <div>Quarterly self-care reports</div>
          <div className="opacity-30 mt-8">
            The workspace is a biosphere. Treat it accordingly.
          </div>
        </div>
      )}

      {view === 'pricing' && (
        <div>
          <div className="flex flex-col gap-8 mb-16">
            <div>
              <div className="mb-2">Starter — 5-20 seats</div>
              <div className="opacity-30">$49/seat/month • Memory Engine + Biofield</div>
            </div>
            <div>
              <div className="mb-2">Growth — 21-100 seats</div>
              <div className="opacity-30">$39/seat/month • + Kiosk + Custom patches</div>
            </div>
            <div>
              <div className="mb-2">Enterprise — 100+ seats</div>
              <div className="opacity-30">Custom • + On-premise + Flash drive deployment</div>
            </div>
          </div>
          <div className="opacity-30">
            All plans include physical LOT starter kit per employee.
          </div>
        </div>
      )}
    </Block>
  )
}
