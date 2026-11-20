/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 · OPEN TAB — public, unauthenticated, read-only ledger at /basics.

import * as React from 'react'
import { render } from '#client/utils/render'
import { Page } from '#client/components/ui'
import { BasicsLedger } from '#client/components/Basics'

render(
  <Page>
    <BasicsLedger standing="PUBLIC" />
  </Page>
)
