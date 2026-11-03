/**
 * LOT® BASICS — OPEN TAB (LOT-FM-001, Month 1: LEDGER & DOCTRINE).
 * Public, read-only. Terminal grid: mono bold, 2px rules, square, inversion-only.
 */
import * as React from 'react'
import {
  RATION_MANIFEST, CADENCE, DOCTRINE, PRICE_USD_PER_MONTH, itemsForMonth,
} from '#client/data/basicRation'

const mono: React.CSSProperties = {
  fontFamily: "'Liberation Mono', 'LiberationMono-Bold', ui-monospace, Menlo, Consolas, monospace",
  fontWeight: 700,
  borderRadius: 0,
}
const rule = 'border-t-2 border-acc'
const pad = (s: string | number, n: number) => String(s).padEnd(n, ' ')

const StatusLine = () => (
  <div className="bg-acc text-bac px-8 whitespace-pre overflow-hidden" style={mono}>
    {'LOT® BASIC · RATION · OPEN TAB · READ-ONLY · STATUS: ISSUING SOON'}
  </div>
)

export const Basics = () => {
  const [month, setMonth] = React.useState(0)
  const due = itemsForMonth(month)
  return (
    <div className="flex flex-col gap-y-16 max-w-[640px]" style={mono}>
      <StatusLine />

      <section>
        <div className="bg-acc text-bac px-8 inline-block">DOCTRINE</div>
        {DOCTRINE.map((l) => <div key={l}>{l}</div>)}
      </section>

      <section className={rule}>
        <div>
          PRICE ........ USD {PRICE_USD_PER_MONTH}/MO · {RATION_MANIFEST.length} ITEMS · ONE BOX
        </div>
        <div>TERMS ........ ADDITIVE TO USERSHIP · STAND DOWN ANYTIME</div>
      </section>

      <section className={rule}>
        <div className="bg-acc text-bac px-8 inline-block">LEDGER</div>
        <pre className="m-0 overflow-x-auto" style={mono} aria-label="ration ledger">
          {pad('NO', 4)}{pad('NOMENCLATURE', 24)}CADENCE{'\n'}
          {RATION_MANIFEST.map((i) => `${pad(String(i.no).padStart(2, '0'), 4)}${pad(i.name, 24)}${CADENCE[i.cadence].label}\n`).join('')}
        </pre>
        <div>COST OF GOODS: WITHHELD. MARGIN FLOOR: 60%.</div>
      </section>

      <section className={rule}>
        <div className="bg-acc text-bac px-8 inline-block">ISSUE SCHEDULE</div>
        <div className="flex flex-wrap gap-x-8">
          {Array.from({ length: 12 }, (_, m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`px-8 border-2 border-acc ${m === month ? 'bg-acc text-bac' : ''}`}
              style={mono}
              aria-pressed={m === month}
            >
              M{String(m + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
        <div>ISSUE M{String(month + 1).padStart(2, '0')}: {due.length} ITEMS</div>
        <div>{due.map((i) => i.name).join(' · ')}</div>
      </section>

      <section className={rule}>
        <div>UPGRADE ..... NOT YET ISSUED (MONTH 2)</div>
      </section>
    </div>
  )
}
