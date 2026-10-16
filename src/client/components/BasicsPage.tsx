/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import {
  RATION_MANIFEST,
  RATION_PRICE_USD,
  RATION_MIN_MARGIN,
  itemsForIssue,
} from '#shared/basics'

const RULE = 'border-t-2 border-current'

const pad = (s: string | number, n: number) => String(s).padEnd(n, ' ')

/** Status line: inversion-only, fixed grid. */
const StatusLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-acc text-bac px-8 whitespace-pre font-mono overflow-hidden">
    {children}
  </div>
)

/**
 * BASICS — OPEN TAB (Month 1). Read-only ledger of the BASIC ration.
 * COGS withheld. Voice: quartermaster.
 */
export function BasicsPage() {
  const monthly = itemsForIssue(2).length
  const issueOne = itemsForIssue(1).length
  return (
    <div className="flex flex-col gap-y-16 font-mono">
      <StatusLine>
        {`LOT-FM-001  BASIC RATION  ${RATION_MANIFEST.length} ITEMS  USD ${RATION_PRICE_USD}/MO  STATUS: OPEN`}
      </StatusLine>

      <div className={RULE + ' pt-8'}>
        <div>DOCTRINE</div>
        <div className="opacity-60">
          LOT issues. LOT does not sell. The operator is ON STRENGTH. One
          ration per month. Same load, same terms, no upsell. The ledger is
          the marketing: what is listed below is what ships.
        </div>
      </div>

      <div className={RULE + ' pt-8'}>
        <div>TERMS</div>
        <pre className="whitespace-pre-wrap opacity-60">{`PRICE      USD ${RATION_PRICE_USD} / MONTH, ADDITIVE TO USERSHIP
LOAD       ${RATION_MANIFEST.length} ITEMS  (${issueOne} IN ISSUE 01, ${monthly} IN A STANDARD MONTH)
STAND DOWN ANY TIME. RATION DROPS. AI RETAINED.
MARGIN     FLOOR ${RATION_MIN_MARGIN * 100}%. LANDED CEILING ENFORCED.`}</pre>
      </div>

      <div className={RULE + ' pt-8'}>
        <div className="flex">
          <div>MANIFEST</div>
          <div className="ml-auto opacity-60">PROVISIONAL</div>
        </div>
        <pre className="overflow-x-auto mt-8 mb-0">
          {`${pad('NO', 4)}${pad('NOMENCLATURE', 28)}${pad('QTY', 5)}CADENCE\n`}
        </pre>
        <div className={RULE} />
        <pre className="overflow-x-auto m-0">
          {RATION_MANIFEST.map(
            (i) =>
              `${pad(String(i.no).padStart(2, '0'), 4)}${pad(i.nomenclature, 28)}${pad(i.qty, 5)}${i.cadence}`
          ).join('\n')}
        </pre>
        <div className={RULE} />
      </div>

      <StatusLine>{`NEXT ISSUE: NOT SCHEDULED   UPGRADE: OFFLINE`}</StatusLine>
    </div>
  )
}
