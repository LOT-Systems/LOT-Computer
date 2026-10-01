/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / MODULE BASIC (RATION) — OPEN TAB
 * Read-only public ledger. No state. No COGS. No marketing.
 */

import React from 'react'
import {
  RATION_MANIFEST,
  RATION_DOCTRINE,
  RATION_PRICE_USD,
  RATION_CADENCE_ORDER,
  RATION_STATUS_SPEC,
  itemsInIssue,
} from '#shared/constants/ration'

const pad = (n: number) => String(n).padStart(2, '0')

/** Fixed-grid status line. Inversion = emphasis. */
export const StatusLine: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <div className="flex justify-between bg-acc text-bac px-8 uppercase">
    <span>{left}</span>
    <span>{right}</span>
  </div>
)

const Rule = () => <div className="border-t-2 border-acc" />

export function BasicsPage() {
  const [issue, setIssue] = React.useState(1)
  const issueLines = React.useMemo(() => new Set(itemsInIssue(issue).map((i) => i.id)), [issue])

  return (
    <div className="flex flex-col gap-y-16 font-mono uppercase">
      <StatusLine
        left="LOT-FM-001 / BASIC (RATION)"
        right={`${RATION_MANIFEST.length} ITEMS / USD ${RATION_PRICE_USD}/MO / ${RATION_STATUS_SPEC}`}
      />
      <div>
        {RATION_DOCTRINE.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <Rule />
      <div className="flex gap-x-8 items-center">
        <span>ISSUE</span>
        {[1, 2, 3, 4].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setIssue(m)}
            aria-pressed={issue === m}
            className={`px-8 border-2 border-acc ${issue === m ? 'bg-acc text-bac' : ''}`}
          >
            {pad(m)}
          </button>
        ))}
        <span className="opacity-30">{issueLines.size} LINES</span>
      </div>
      <div role="table" aria-label="Ration ledger">
        {RATION_CADENCE_ORDER.map((cad) => {
          const rows = RATION_MANIFEST.filter((i) => i.cadence === cad)
          if (!rows.length) return null
          return (
            <div key={cad} className="mb-16">
              <StatusLine left={cad} right={`${rows.length} ITEMS`} />
              {rows.map((i) => (
                <div
                  key={i.id}
                  role="row"
                  className={`flex gap-x-8 ${issueLines.has(i.id) ? '' : 'opacity-30'}`}
                >
                  <span className="w-[24px]">{pad(i.id)}</span>
                  <span className="flex-grow">{i.nomenclature}</span>
                  <span>X{i.qty}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <Rule />
      <div>TERMS: USD {RATION_PRICE_USD}/MO. ADDITIVE TO USERSHIP. STAND DOWN AT ANY TIME.</div>
      <StatusLine left="STATUS: READ-ONLY" right="ENROLLMENT: NOT YET OPEN" />
    </div>
  )
}
