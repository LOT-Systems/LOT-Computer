/**
 * LOT SYSTEMS CORPORATION
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * BASICS — OPEN TAB. LOT-FM-001 / BASIC (RATION). Month 1: read-only ledger.
 */

import React from 'react'
import {
  RATION,
  GROUP_LABEL,
  CADENCE_LABEL,
  PRICE_USD_MONTH,
  type Group,
} from '#shared/basics'

const GROUPS: Group[] = ['WEAR', 'CARE', 'HOME']
const RULE = 'border-t-2 border-acc'

const StatusLine = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-acc text-bac px-8 uppercase whitespace-pre-wrap">
    {children}
  </div>
)

export function Basics() {
  return (
    <div className="flex flex-col gap-y-16 uppercase">
      <StatusLine>
        BASIC · {RATION.length} ITEMS · USD {PRICE_USD_MONTH}/MO · OPEN
      </StatusLine>

      <div>
        <div>LOT ISSUES. LOT DOES NOT SELL.</div>
        <div>THE OPERATOR IS ON STRENGTH, NOT A CUSTOMER.</div>
        <div>ONE RATION. ONE PRICE. ONE LEDGER.</div>
        <div>NO LAYER BETWEEN PUBLIC AND MANIFEST.</div>
      </div>

      {GROUPS.map((g) => {
        const rows = RATION.filter((r) => r.group === g)
        return (
          <div key={g} className={RULE}>
            <div className="bg-acc text-bac px-8">{GROUP_LABEL[g]}</div>
            {rows.map((r) => (
              <div key={r.no} className="flex gap-x-16">
                <span className="w-32 flex-shrink-0">
                  {String(r.no).padStart(2, '0')}
                </span>
                <span className="flex-grow">{r.item}</span>
                <span className="w-32 text-right">{r.qty}</span>
                <span className="w-96 text-right">{CADENCE_LABEL[r.cadence]}</span>
              </div>
            ))}
          </div>
        )
      })}

      <div className={RULE}>
        <div>TERMS</div>
        <div>USD {PRICE_USD_MONTH} PER MONTH. RECURRING.</div>
        <div>STAND DOWN ANY TIME. NO PENALTY.</div>
        <div>COGS WITHHELD. LEDGER PUBLIC.</div>
      </div>

      <StatusLine>NEXT ISSUE: NOT SCHEDULED · UPGRADE: OFFLINE (MONTH 2)</StatusLine>
    </div>
  )
}
