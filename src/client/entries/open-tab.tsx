/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 OPEN TAB — public, read-only ration ledger at /open.
import * as React from 'react'
import { render } from '#client/utils/render'
import { RationSheet } from '#client/components/Basics'

const OpenTab = () => {
  React.useEffect(() => {
    document.title = 'LOT® Basics — Open Tab'
    document.body.style.background = '#FFFFFF'
  }, [])
  return (
    <main style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <RationSheet isPublic />
    </main>
  )
}

render(<OpenTab />)
