/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { QueryClientProvider, QueryClient } from 'react-query'
import { render } from '#client/utils/render'
import { Basics } from '#client/components/Basics'

// LOT-FM-001 OPEN TAB — standalone entry, no auth gate. Direct navigation to
// /basics (fresh load, logged in or not) hits this bundle via the server
// route in src/server/index.ts, same pattern as /status and /about. In-app
// nav clicks stay client-routed through entries/app.tsx's TabPanels instead.
const queryClient = new QueryClient()

render(
  <QueryClientProvider client={queryClient}>
    <Basics />
  </QueryClientProvider>
)
