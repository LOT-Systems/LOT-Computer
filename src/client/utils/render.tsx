/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { createRoot } from 'react-dom/client'

export function render(children: React.ReactNode) {
  const container = document.getElementById('root')
  if (!container) {
    throw new Error('Root element not found')
  }
  const root = createRoot(container)
  root.render(children)
}
