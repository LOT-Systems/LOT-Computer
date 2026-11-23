/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / OPEN TAB — public, read-only Basics ledger for strangers.
 * Logged-in members get the full tab inside the app at the same URL.
 */

import * as React from 'react'
import { render } from '#client/utils/render'
import '#client/stores/theme'
import { Layout } from '#client/components/ui'
import { Basics } from '#client/components/Basics'

render(
  <Layout hideNav={true}>
    <Basics publicMode />
  </Layout>
)
