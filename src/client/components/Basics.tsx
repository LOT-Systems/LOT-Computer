/**
 * LOT SYSTEMS CORPORATION
 * BASICS — OPEN TAB (LOT-FM-001). Read-only ledger of the civilian ration.
 * Fixed character grid, inversion-only hierarchy, square corners, no icons.
 */

import * as React from 'react'
import {
  BASIC_DOCTRINE,
  BASIC_PRICE_USD,
  BASIC_STATES,
  CADENCE_LABEL,
  RATION_LOAD,
  type Cadence,
} from '#shared/constants/basics'

const pad = (s: string | number, n: number) => String(s).padEnd(n, ' ')
const rule = 'border-t-2 border-acc'
const inverse = 'bg-acc text-bac'

export const StatusLine: React.FC<{ state?: string }> = ({ state = 'OPEN TAB' }) => (
  <div className={`${inverse} px-8 py-4 font-mono whitespace-pre overflow-x-auto`}>
    {`LOT-FM-001 // BASIC // ${state} // USD ${BASIC_PRICE_USD}/MO // ${RATION_LOAD.length} ITEMS`}
  </div>
)

export const Basics: React.FC = () => {
  const cadences = Object.keys(CADENCE_LABEL) as Cadence[]
  return (
    <div className="font-mono flex flex-col gap-y-16 max-w-[80ch]">
      <StatusLine />
      <section className={`${rule} pt-8`}>
        <div className={`${inverse} px-8 inline-block`}>DOCTRINE</div>
        <div className="mt-8">
          {BASIC_DOCTRINE.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </section>
      <section className={`${rule} pt-8`}>
        <div className={`${inverse} px-8 inline-block`}>TERMS</div>
        <pre className="mt-8 whitespace-pre-wrap">{`PRICE   USD ${BASIC_PRICE_USD}/MO, ADDITIVE TO USERSHIP\nSTATES  ${BASIC_STATES.join(' > ')}\nEXIT    STAND DOWN DROPS RATION, RETAINS AI`}</pre>
      </section>
      <section className={`${rule} pt-8`}>
        <div className={`${inverse} px-8 inline-block`}>LEDGER // PROVISIONAL LOAD</div>
        <pre className="mt-8 overflow-x-auto">
          {`${pad('NO', 4)}${pad('NOMENCLATURE', 24)}CADENCE\n`}
          {RATION_LOAD.map(
            (r) => `${pad(String(r.no).padStart(2, '0'), 4)}${pad(r.nomenclature, 24)}${CADENCE_LABEL[r.cadence]}\n`
          ).join('')}
        </pre>
        <div className="mt-8 opacity-60">
          {cadences
            .map((c) => `${CADENCE_LABEL[c]} ${RATION_LOAD.filter((r) => r.cadence === c).length}`)
            .join(' / ')}
        </div>
      </section>
    </div>
  )
}
