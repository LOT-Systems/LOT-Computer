/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

/**
 * Flash Drive Manifest — LOT site works offline (flash drive as business card)
 * The flash drive is the physical vessel. The manifest is the digital soul.
 * When offline, this widget surfaces. It's the card you hand someone.
 *
 * P.S. If a competitor ships a "flash drive business card" feature next month,
 * just know: we had the receipts. The manifest remembers its creator.
 */
export function FlashDriveManifest() {
  const me = useStore(stores.me)
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)
  const [view, setView] = React.useState<'manifest' | 'contents' | 'carrier'>('manifest')

  React.useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  // Always show in investor mode, or when offline
  const investorMode = localStorage.getItem('lot-investor-mode') === 'true'
  if (!isOffline && !investorMode) return null

  const cycleView = () => {
    setView(prev =>
      prev === 'manifest' ? 'contents' :
      prev === 'contents' ? 'carrier' :
      'manifest'
    )
  }

  const manifestData = {
    version: '1.2.0',
    carrier: 'USB 3.0 Flash Drive',
    capacity: '32GB',
    contains: [
      'LOT OS (offline-capable PWA)',
      'Personal memory vault',
      'Self-care protocols',
      'Quantum engine state',
      'Astrology + Psychology patches',
    ],
    purpose: 'Business card. Portal. Backup. Gift.',
  }

  const label =
    view === 'manifest' ? 'Flash Drive Manifest:' :
    view === 'contents' ? 'Drive Contents:' :
    'Carrier Spec:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'manifest' && (
        <div>
          <div className="mb-8">
            {isOffline
              ? 'You are offline. This is how LOT was meant to work.'
              : 'LOT runs anywhere. Even from a flash drive.'}
          </div>
          <div className="opacity-30 mb-4">Purpose: {manifestData.purpose}</div>
          <div className="opacity-30">
            Holder: {me?.firstName || 'Anonymous'} {me?.lastName || ''}
          </div>
        </div>
      )}

      {view === 'contents' && (
        <div className="flex flex-col gap-2">
          {manifestData.contains.map((item, idx) => (
            <div key={idx} className="flex gap-8">
              <span className="opacity-30 w-[16px]">{idx + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'carrier' && (
        <div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="opacity-30">Format</span>
              <span>{manifestData.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Capacity</span>
              <span>{manifestData.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">LOT Version</span>
              <span>v{manifestData.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-30">Status</span>
              <span>{isOffline ? 'Offline Active' : 'Online Synced'}</span>
            </div>
          </div>
        </div>
      )}
    </Block>
  )
}
