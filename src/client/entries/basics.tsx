/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 · OPEN TAB — public /basics surface for visitors not logged in.
// Same ledger component as the in-app Basics tab, mode="public".
import * as React from 'react'
import { render } from '#client/utils/render'
import '#client/stores/theme'
import { Layout } from '#client/components/ui'
import { Basics } from '#client/components/Basics'

document.title = 'LOT · BASICS'

render(
  <Layout>
    <Basics mode="public" />
  </Layout>
)
