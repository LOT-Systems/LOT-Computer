/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Public OPEN TAB entry (LOT-FM-001). Served at /open-tab and, for visitors
// without a session, at /basics. No auth, no app chrome — just the ledger.

import * as React from 'react'
import { render } from '#client/utils/render'
import { OpenTab } from '#client/components/Basics'

document.title = 'LOT — BASIC / OPEN TAB'

render(
  <div style={{ background: '#fff', minHeight: '100dvh', padding: '16px' }}>
    <OpenTab variant="public" />
  </div>
)
