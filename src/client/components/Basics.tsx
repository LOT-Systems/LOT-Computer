/**
 * LOT SYSTEMS CORPORATION
 * BASICS — LOT-FM-001 ration ledger. OPEN TAB: public, read-only.
 */

import * as React from 'react'
import {
  RATION_LOAD,
  CADENCE_LABEL,
  DOCTRINE,
  PRICE_USD_PER_MONTH,
  itemsIssuedIn,
} from '#shared/basics/ration'

const RULE = { borderTop: '2px solid currentColor' } as const
const MONO = { fontFamily: "'Liberation Mono', ui-monospace, monospace", fontWeight: 700 } as const

const pad = (s: string | number, n: number) => String(s).padEnd(n, ' ')

const StatusLine: React.FC<{ month: number }> = ({ month }) => (
  <div className="bg-acc text-bac px-8 whitespace-pre overflow-x-auto" style={MONO}>
    {`LOT-FM-001 · BASIC · LOAD 23 · THIS ISSUE ${itemsIssuedIn(month).length} · USD ${PRICE_USD_PER_MONTH}/MO · OPEN TAB`}
  </div>
)

export const Basics: React.FC = () => {
  const month = new Date().getMonth() + 1
  const issued = new Set(itemsIssuedIn(month).map((i) => i.no))
  return (
    <div className="flex flex-col gap-y-16 max-w-[720px]" style={MONO} data-basics="open-tab">
      <StatusLine month={month} />
      <div>
        {DOCTRINE.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div style={RULE} className="pt-8">
        <div className="whitespace-pre overflow-x-auto">
          {pad('NO', 4)}{pad('NOMENCLATURE', 20)}{pad('QTY', 5)}CADENCE
        </div>
        <div style={RULE} className="whitespace-pre overflow-x-auto">
          {RATION_LOAD.map((i) => (
            <div
              key={i.no}
              className={issued.has(i.no) ? 'bg-acc text-bac' : ''}
              data-issued={issued.has(i.no) ? 'true' : 'false'}
            >
              {pad(String(i.no).padStart(2, '0'), 4)}
              {pad(i.nomenclature, 20)}
              {pad(i.qty, 5)}
              {CADENCE_LABEL[i.cadence]}
            </div>
          ))}
        </div>
      </div>
      <div style={RULE} className="pt-8 whitespace-pre overflow-x-auto">
        {`PRICE      USD ${PRICE_USD_PER_MONTH}/MO\nTERMS      ADDITIVE TO USERSHIP. STAND DOWN ANY TIME.\nINVERTED   ISSUED THIS MONTH`}
      </div>
    </div>
  )
}
