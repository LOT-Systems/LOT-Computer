/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import {
  BASIC_PRICE_USD,
  CADENCE_LABEL,
  DOCTRINE,
  RATION_MANIFEST,
  pad,
} from '#shared/basics/ration'

// OPEN TAB — LOT-FM-001 BASIC (RATION). Read-only ledger, no auth required.
// House style: mono bold, inversion-only hierarchy, 2px rules, square corners.

const Rule = () => <div className="border-t-2 border-acc" />

const StatusLine = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-acc text-bac px-8 py-4 whitespace-pre font-mono font-bold overflow-hidden">
    {children}
  </div>
)

export function Basics() {
  const total = RATION_MANIFEST.length
  return (
    <div
      className="flex flex-col gap-y-16 font-mono font-bold"
      data-lot-basics="open-tab"
    >
      <StatusLine>
        {`LOT-FM-001  BASIC  RATION  ${pad(total, 2, true)}/${total} ITEMS  USD ${BASIC_PRICE_USD}/MO`}
      </StatusLine>

      <div className="flex flex-col gap-y-4">
        {DOCTRINE.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <Rule />

      <div className="whitespace-pre overflow-x-auto" role="table">
        <div className="bg-acc text-bac px-8" role="row">
          {`${pad('NO', 3)} ${pad('NOMENCLATURE', 28)} ${pad('QTY', 3)} CADENCE`}
        </div>
        {RATION_MANIFEST.map((i) => (
          <div key={i.no} className="px-8" role="row">
            {`${pad(String(i.no).padStart(2, '0'), 3)} ${pad(i.nomenclature, 28)} ${pad(i.qty, 3)} ${CADENCE_LABEL[i.cadence]}`}
          </div>
        ))}
      </div>

      <Rule />

      <div className="whitespace-pre">
        {`PRICE   USD ${BASIC_PRICE_USD}/MO  ADDITIVE TO USERSHIP\nTERMS   STAND DOWN ANY MONTH. AI RETAINED.\nSTATUS  ISSUE OPENS WITH UPGRADE. NOT YET LIVE.`}
      </div>
    </div>
  )
}
