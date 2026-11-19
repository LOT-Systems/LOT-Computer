/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 · OPEN TAB — public, unauthenticated read of the BASIC ration.
import * as React from 'react'
import { render } from '#client/utils/render'
import '#client/stores/theme'
import { Layout } from '#client/components/ui'
import { Basics } from '#client/components/Basics'

const App = () => (
  <Layout hideNav={true}>
    <Basics state="GUEST" />
    <div className="mt-24 uppercase" style={{ fontFamily: "'Liberation Mono', 'Courier New', monospace", fontWeight: 700 }}>
      <a href="/" className="underline">REPORT FOR USERSHIP</a>
    </div>
  </Layout>
)

render(<App />)
