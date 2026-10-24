/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'

/**
 * Demo Day Widget — Long-term planning announcement
 * Future Design: 4D UI presentation at a comedy club
 * Tables to write, draw, eat, drink and a good place to laugh
 */
export function DemoDayWidget() {
  const [view, setView] = React.useState<'announcement' | 'venue' | 'agenda'>('announcement')

  // Only show in investor mode
  const investorMode = localStorage.getItem('lot-investor-mode') === 'true'
  if (!investorMode) return null

  const cycleView = () => {
    setView(prev =>
      prev === 'announcement' ? 'venue' :
      prev === 'venue' ? 'agenda' :
      'announcement'
    )
  }

  const label =
    view === 'announcement' ? '[Demo] Demo Day:' :
    view === 'venue' ? '[Demo] Venue:' :
    '[Demo] Agenda:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'announcement' && (
        <div>
          <div className="mb-16">
            Future Design: 4D UI
          </div>
          <div className="mb-8">
            A comedy club booked for a demo day. Tables to write, draw, eat, drink —
            and a good place to laugh or have an inappropriate word.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Format</span>
              <span>Live demo + dinner</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">City</span>
              <span>Los Angeles</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Vibe</span>
              <span>Sci-fi noir comedy</span>
            </div>
          </div>
        </div>
      )}

      {view === 'venue' && (
        <div>
          <div className="mb-8">
            The comedy club is a design choice. Laughter is the 4th dimension
            of interface design. The first three: write, draw, compute.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Tables</span>
              <span>Write + Draw + Eat + Drink</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Stage</span>
              <span>Live product demos</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Bar</span>
              <span>Networking + LOT figurines</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Exit</span>
              <span>Flash drive gift bag</span>
            </div>
          </div>
        </div>
      )}

      {view === 'agenda' && (
        <div className="flex flex-col gap-8">
          <div>
            <div className="opacity-30 mb-2">Act I — The Machine</div>
            <div>LOT OS live demo. Memory Engine. Biofield state. Quantum self-care in real-time.</div>
          </div>
          <div>
            <div className="opacity-30 mb-2">Act II — The Body</div>
            <div>Physical products reveal. Socks embroidery. Figurines. Flash drive manifest. Kiosk prototype.</div>
          </div>
          <div>
            <div className="opacity-30 mb-2">Act III — The Future</div>
            <div>Corporate plan. Phone widgets (PWA). SoundCloud techno mix. Astrology + Psychology patches.</div>
          </div>
          <div>
            <div className="opacity-30 mb-2">Encore</div>
            <div>Stand-up. Q&A. Angel investment terms. Inappropriate words welcome.</div>
          </div>
        </div>
      )}
    </Block>
  )
}
