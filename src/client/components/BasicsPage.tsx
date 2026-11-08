/**
 * LOT-FM-001 / BASIC (RATION) — OPEN TAB (Month 1: ledger, read-only).
 * House style: inversion-only hierarchy, 2px rules, square corners, fixed grid, no color/icons.
 */
import React from 'react'
import {
  MANIFEST,
  CADENCE_LABEL,
  DOCTRINE,
  PRICE_USD_MONTH,
  itemsForIssue,
  type Cadence,
} from '#client/data/basicsManifest'

const pad = (s: string | number, n: number) => String(s).padEnd(n, ' ')

/** Status line: fixed-grid, inverted. */
export const StatusLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-acc text-bac px-8 py-4 font-mono uppercase tracking-wider whitespace-pre">
    {children}
  </div>
)

const Rule = () => <div className="border-t-2 border-acc" />

export const BasicsPage: React.FC = () => {
  const [issue, setIssue] = React.useState(1)
  const issued = React.useMemo(() => new Set(itemsForIssue(issue).map((i) => i.no)), [issue])

  return (
    <div className="flex flex-col gap-y-16 font-mono uppercase">
      <StatusLine>
        {`LOT-FM-001 · BASIC · ${MANIFEST.length} ITEMS · USD ${PRICE_USD_MONTH}/MO · OPEN`}
      </StatusLine>

      <div className="border-2 border-acc p-16">{DOCTRINE}</div>

      <div className="border-2 border-acc">
        <div className="bg-acc text-bac px-8 py-4 whitespace-pre">
          {`${pad('NO', 4)}${pad('NOMENCLATURE', 28)}${pad('QTY', 5)}CADENCE`}
        </div>
        <div className="overflow-x-auto">
          {MANIFEST.map((i) => {
            const on = issued.has(i.no)
            return (
              <div
                key={i.no}
                className={
                  'px-8 whitespace-pre border-t-2 border-acc ' +
                  (on ? 'bg-acc text-bac' : '')
                }
              >
                {`${pad(String(i.no).padStart(2, '0'), 4)}${pad(i.nomenclature, 28)}${pad(
                  'x' + i.qty,
                  5
                )}${CADENCE_LABEL[i.cadence as Cadence]}`}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <span>ISSUE</span>
        {[1, 2, 3, 4, 6, 7, 12].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setIssue(n)}
            className={
              'border-2 border-acc px-8 ' + (issue === n ? 'bg-acc text-bac' : '')
            }
          >
            {String(n).padStart(2, '0')}
          </button>
        ))}
        <span>{`${issued.size}/${MANIFEST.length} IN LOAD`}</span>
      </div>

      <Rule />
      <StatusLine>{`TERMS · USD ${PRICE_USD_MONTH}/MO · ADDITIVE TO USERSHIP · STAND DOWN ANY TIME · COGS WITHHELD`}</StatusLine>
    </div>
  )
}
