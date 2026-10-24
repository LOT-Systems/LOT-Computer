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
 * Angel Investor Widget — VC Starter Pack
 * LOT is a stealth supernatural self-care startup in a pre-brand, pre-product stage
 * LA sci-fi noir presentation for sci-fi based Angel Investors
 * A SaaS-style digital platform sitting underneath a physical subscription
 */
export function AngelInvestorWidget() {
  const [view, setView] = React.useState<'pitch' | 'thesis' | 'terms'>('pitch')

  // Only show in investor mode
  const investorMode = localStorage.getItem('lot-investor-mode') === 'true'
  if (!investorMode) return null

  const cycleView = () => {
    setView(prev =>
      prev === 'pitch' ? 'thesis' :
      prev === 'thesis' ? 'terms' :
      'pitch'
    )
  }

  const label =
    view === 'pitch' ? '[Demo] Angel Briefing:' :
    view === 'thesis' ? '[Demo] Investment Thesis:' :
    '[Demo] Terms:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'pitch' && (
        <div>
          <div className="mb-16">
            LOT is a stealth supernatural self-care startup. Pre-brand. Pre-product.
            A SaaS-style digital platform sitting underneath a physical subscription.
          </div>
          <div className="flex flex-col gap-4 mb-16">
            <div className="flex justify-between">
              <span className="opacity-30">Stage</span>
              <span>Pre-seed / Angel</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Sector</span>
              <span>Supernatural self-care</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Aesthetic</span>
              <span>LA sci-fi noir</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Model</span>
              <span>Digital SaaS + Physical subscription</span>
            </div>
          </div>
          <div className="opacity-30">
            Accepting sci-fi based Angel Investors.
          </div>
        </div>
      )}

      {view === 'thesis' && (
        <div>
          <div className="mb-16">
            The thesis: self-care is a quantum problem. Memory is the engine.
            The body is the computer. LOT is the operating system.
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <div className="opacity-30 mb-2">Physical Layer</div>
              <div>Socks with code embroidery. Figurines as super-computers. Flash drives as business cards.</div>
            </div>
            <div>
              <div className="opacity-30 mb-2">Digital Layer</div>
              <div>Memory engine. Quantum biofield. Astrology + Psychology patches. Offline-first PWA.</div>
            </div>
            <div>
              <div className="opacity-30 mb-2">Distribution</div>
              <div>Monocle magazine style cabin/kiosk. Human powered personalization. Corporate wellness plans.</div>
            </div>
          </div>
        </div>
      )}

      {view === 'terms' && (
        <div>
          <div className="mb-16">
            Angel VC Starter Pack
          </div>
          <div className="flex flex-col gap-4 mb-16">
            <div className="flex justify-between">
              <span className="opacity-30">Instrument</span>
              <span>SAFE Note</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Access</span>
              <span>Investor OS dashboard</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Physical</span>
              <span>LOT figurine + flash drive</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Digital</span>
              <span>Lifetime Usership</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Events</span>
              <span>Demo Day + Comedy Club</span>
            </div>
          </div>
          <div className="opacity-30">
            Contact: lot-systems.com
          </div>
        </div>
      )}
    </Block>
  )
}
