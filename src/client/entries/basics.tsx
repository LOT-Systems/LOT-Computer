/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { render } from '#client/utils/render'
import '#client/stores/theme'
import * as stores from '#client/stores'
import { Layout } from '#client/components/ui'
import { Basics } from '#client/components/Basics'

// Public OPEN TAB: logged-out visitors read the ledger here.
const App = () => {
  const router = useStore(stores.router)
  React.useEffect(() => {
    // Only /basics lives in this bundle; any other tab is a full page load.
    if (router && router.route !== 'basics') window.location.assign(router.path)
  }, [router])
  return (
    <Layout>
      <Basics />
    </Layout>
  )
}

render(<App />)
