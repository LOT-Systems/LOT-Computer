/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 · OPEN TAB — public, read-only. Served at /basics to visitors
// without a session. Members at the same URL get the in-app Basics tab.
import * as React from 'react'
import { render } from '#client/utils/render'
import { Basics } from '#client/components/Basics'

function OpenTab() {
  React.useEffect(() => {
    document.title = 'LOT® BASIC — OPEN TAB'
  }, [])
  return (
    <main className="lot-basics-page">
      <div style={{ width: '100%', maxWidth: '88ch' }}>
        <Basics publicView />
        <p
          style={{
            fontFamily: "'Liberation Mono', 'Cousine', 'Courier New', monospace",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '20px',
            marginTop: 20,
          }}
        >
          <a href="/" style={{ color: '#000' }}>
            USERSHIP MEMBERS: REPORT IN
          </a>
        </p>
      </div>
    </main>
  )
}

render(<OpenTab />)
