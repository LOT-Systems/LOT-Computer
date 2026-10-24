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
 * 4D UI Widget — Phone widget set from a PWA
 * LOT figurines as super-computers
 * Techno SoundCloud mix target
 * Monocle magazine style cabin/kiosk with human powered LOT socks personalization
 */
export function FourDimensionalUI() {
  const [dimension, setDimension] = React.useState<1 | 2 | 3 | 4>(1)

  // Only show in investor mode
  const investorMode = localStorage.getItem('lot-investor-mode') === 'true'
  if (!investorMode) return null

  const cycleDimension = () => {
    setDimension(prev => (prev >= 4 ? 1 : (prev + 1)) as 1 | 2 | 3 | 4)
  }

  const dimensionLabels = {
    1: '[TBD] 1D — Write:',
    2: '[TBD] 2D — Draw:',
    3: '[TBD] 3D — Compute:',
    4: '[TBD] 4D — Laugh:',
  }

  return (
    <Block label={dimensionLabels[dimension]} blockView onLabelClick={cycleDimension}>
      {dimension === 1 && (
        <div>
          <div className="mb-8">
            The writing dimension. Journal. Memory. Intentions. The words that build your quantum state.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Widget</span>
              <span>Phone journal (PWA)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Physical</span>
              <span>Kiosk writing station</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Output</span>
              <span>Memory story</span>
            </div>
          </div>
        </div>
      )}

      {dimension === 2 && (
        <div>
          <div className="mb-8">
            The drawing dimension. Personalization. Embroidery codes on socks.
            Monocle magazine style human-powered customization.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Widget</span>
              <span>Phone canvas (PWA)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Physical</span>
              <span>Embroidery kiosk</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Output</span>
              <span>Custom LOT socks</span>
            </div>
          </div>
        </div>
      )}

      {dimension === 3 && (
        <div>
          <div className="mb-8">
            The compute dimension. LOT figurines as super-computers.
            Each figurine runs a self-care protocol. Collectible quantum processors.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Widget</span>
              <span>Phone biofield (PWA)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Physical</span>
              <span>LOT figurine (super-computer)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Audio</span>
              <span>Techno SoundCloud mix</span>
            </div>
          </div>
        </div>
      )}

      {dimension === 4 && (
        <div>
          <div className="mb-8">
            The laughter dimension. Comedy as interface. The comedy club is the design lab.
            If you can't laugh at your self-care stack, it's not supernatural enough.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Widget</span>
              <span>Phone comedy feed (PWA)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Physical</span>
              <span>Comedy club demo night</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Vibe</span>
              <span>LA sci-fi noir</span>
            </div>
          </div>
        </div>
      )}
    </Block>
  )
}
