/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Public OPEN TAB — /basics for visitors without a session.
import * as React from 'react'
import { render } from '#client/utils/render'
import { Page } from '#client/components/ui/Page'
import { Basics } from '#client/components/Basics'

render(
  <Page>
    <Basics isPublic />
  </Page>
)
