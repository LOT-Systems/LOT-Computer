/**
 * LOT SYSTEMS CORPORATION
 * Public OPEN TAB — BASICS ledger, no auth required.
 */

import * as React from 'react'
import '#client/stores/theme'
import { render } from '#client/utils/render'
import { Basics } from '#client/components/Basics'

render(
  <div className="p-16 phone:p-32 tablet:p-48 desktop:p-64">
    <Basics />
  </div>
)
