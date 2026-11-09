/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 *
 * BASICS - OPEN TAB (LOT-FM-001 s5). Public, read-only ledger of the BASIC
 * ration: doctrine, 23-item manifest, price, terms. COGS withheld.
 * Terminal house style: one font, inversion-only hierarchy, 2px rules, square.
 */

import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { RATION_MANIFEST, RATION_PRICE_USD } from '#shared/basics/manifest'
import { DOCTRINE, TERMS } from '#shared/basics/doctrine'

const RULE = 'border-t-2 border-acc'
const INVERT = 'bg-acc text-bac'

const StatusLine = ({ tier }: { tier: string }) => (
  <div className={`${INVERT} px-6 py-3 whitespace-pre`}>
    {`OPEN TAB | READ-ONLY | TIER: ${tier}`}
  </div>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-y-8">
    <div className={`${RULE} pt-8`}>{title}</div>
    {children}
  </section>
)

export function Basics() {
  const me = useStore(stores.me)
  const tier = me ? 'USERSHIP/AI' : 'PUBLIC'

  return (
    <div className="flex flex-col gap-y-24 uppercase">
      <StatusLine tier={tier} />

      <Section title="BASICS / DOCTRINE">
        <div className="flex flex-col">
          {DOCTRINE.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </Section>

      <Section title={`MANIFEST / ${RATION_MANIFEST.length} ITEMS`}>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className={`${INVERT} grid grid-cols-[4ch_1fr_12ch_20ch] gap-x-16 px-6`}>
              <div>ITEM</div>
              <div>NOMENCLATURE</div>
              <div>CLASS</div>
              <div>CADENCE</div>
            </div>
            {RATION_MANIFEST.map((i) => (
              <div
                key={i.item}
                className="grid grid-cols-[4ch_1fr_12ch_20ch] gap-x-16 px-6"
              >
                <div>{i.item}</div>
                <div>{i.nomenclature}</div>
                <div>{i.class}</div>
                <div>{i.cadence}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="PRICE">
        <div>{`BASIC - USD ${RATION_PRICE_USD.toFixed(2)} / MONTH`}</div>
      </Section>

      <Section title="TERMS">
        <div className="flex flex-col">
          {TERMS.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </Section>

      <div className={`${RULE} pt-8`}>ELIMINATE ONE DISTRACTION.</div>
    </div>
  )
}
