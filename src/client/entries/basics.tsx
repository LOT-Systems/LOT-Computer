/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 · BASIC · OPEN TAB — public, read-only. No session required.
import * as React from 'react'
import { render } from '#client/utils/render'
import { BasicsLedger } from '#client/components/Basics'

render(
  <div className="lot-basics-public">
    <BasicsLedger state="OPEN TAB" />
    <a className="lot-basics-signin" href="/">USERSHIP MEMBERS: SIGN IN</a>
  </div>
)
