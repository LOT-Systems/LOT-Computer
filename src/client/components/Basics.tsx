/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useDocumentTitle } from '#client/utils/hooks'
import {
  DOCTRINE,
  RATION,
  RATION_ITEM_COUNT,
  RATION_PRICE_USD,
  issueNo,
} from '#shared/basics/ration'

// BASICS / OPEN TAB — read-only ledger of the BASIC ration. LOT-FM-001 M1.
const Rule = () => <div className="border-t-2 border-acc" />

const StatusLine = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-acc text-bac px-8 uppercase">{children}</div>
)

export const Basics = () => {
  useDocumentTitle('Basics')
  return (
    <div className="uppercase max-w-[640px]">
      <StatusLine>
        BASIC / RATION / LOT-FM-001 / {RATION_ITEM_COUNT} ITEMS / OPEN
      </StatusLine>
      <div className="mt-24 mb-24">
        {DOCTRINE.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <Rule />
      <div className="flex justify-between py-8">
        <span>ISSUE / NOMENCLATURE</span>
        <span>CADENCE</span>
      </div>
      <Rule />
      <div>
        {RATION.map((item) => (
          <div key={item.no} className="flex justify-between">
            <span>
              {issueNo(item.no)} {item.nomenclature}
            </span>
            <span>{item.cadence}</span>
          </div>
        ))}
      </div>
      <Rule />
      <div className="flex justify-between py-8">
        <span>TERMS</span>
        <span>USD {RATION_PRICE_USD}/MO</span>
      </div>
      <Rule />
      <div className="mt-24 opacity-60">
        SHIPPING AND SIZING ON ROSTER INTAKE. UPGRADE OPENS MONTH 2.
      </div>
    </div>
  )
}
