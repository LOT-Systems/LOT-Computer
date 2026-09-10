/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * BASICS — OPEN TAB
 * LOT-FM-001. The physical/hardware layer of the LOT System: a monthly
 * civilian ration, issued (not sold) to operators ON STRENGTH. This surface
 * is the public manifest — nomenclature and cadence, cost withheld — plus
 * doctrine and the fixed issue rate.
 *
 * Month 1 build (LOT-SR self-assembly cycle): OPEN TAB, read-only, live.
 * Reachable unauthenticated at /basics and as the "Basics" tab inside the
 * authenticated app. Month 2 (roster + UPGRADE) and Month 3 (fulfillment)
 * are not yet built — see docs/corporate/LOT-FM-001.md.
 */

import * as React from 'react'
import { GhostButton, Page } from '#client/components/ui'
import { cn } from '#client/utils'
import { useDocumentTitle } from '#client/utils/hooks'

interface BasicsTabProps {
  noWrapper?: boolean
}

type Cadence = 'MONTHLY' | 'QUARTERLY'

interface RationItem {
  no: number
  nomenclature: string
  cadence: Cadence
}

// The 23-item load. Nomenclature only — COGS withheld from the public ledger
// per doctrine. Fixed monthly items ship every cycle; quarterly items rotate
// one-per-quarter across the roster's cadence start.
const RATION_LOAD: RationItem[] = [
  { no: 1, nomenclature: 'FIELD JOURNAL, POCKET, 96-LEAF', cadence: 'MONTHLY' },
  { no: 2, nomenclature: 'WRITING INSTRUMENT, INK, BLACK, FIXED-LINE', cadence: 'MONTHLY' },
  { no: 3, nomenclature: 'TOOTHBRUSH, SOFT BRISTLE', cadence: 'MONTHLY' },
  { no: 4, nomenclature: 'TOOTHPASTE, TRAVEL TUBE, 50ML', cadence: 'MONTHLY' },
  { no: 5, nomenclature: 'SOAP, BAR, UNSCENTED', cadence: 'MONTHLY' },
  { no: 6, nomenclature: 'UNDERWEAR, COTTON, PAIR', cadence: 'MONTHLY' },
  { no: 7, nomenclature: 'SOCKS, CREW, PAIR', cadence: 'MONTHLY' },
  { no: 8, nomenclature: 'RAZOR, SAFETY, REPLACEABLE HEAD', cadence: 'MONTHLY' },
  { no: 9, nomenclature: 'RAZOR BLADES, PACK OF 5', cadence: 'MONTHLY' },
  { no: 10, nomenclature: 'VITAMIN D3, 30-COUNT', cadence: 'MONTHLY' },
  { no: 11, nomenclature: 'MAGNESIUM, 30-COUNT', cadence: 'MONTHLY' },
  { no: 12, nomenclature: 'ELECTROLYTE PACKET, 10-COUNT', cadence: 'MONTHLY' },
  { no: 13, nomenclature: 'TEA, LOOSE-LEAF, 50G', cadence: 'MONTHLY' },
  { no: 14, nomenclature: 'COTTON SWABS, 100-COUNT', cadence: 'MONTHLY' },
  { no: 15, nomenclature: 'CHARGING CABLE, USB-C, 1M', cadence: 'QUARTERLY' },
  { no: 16, nomenclature: 'FIRST-AID PATCH KIT', cadence: 'QUARTERLY' },
  { no: 17, nomenclature: 'CANDLE, UNSCENTED, WHITE', cadence: 'QUARTERLY' },
  { no: 18, nomenclature: 'EAR PLUGS, FOAM, PAIR', cadence: 'QUARTERLY' },
  { no: 19, nomenclature: 'SLEEP MASK, BLACKOUT', cadence: 'QUARTERLY' },
  { no: 20, nomenclature: 'NOTECARD SET, INDEX, BLANK, 25-COUNT', cadence: 'QUARTERLY' },
  { no: 21, nomenclature: 'ENVELOPE SET, LOT LETTERHEAD', cadence: 'QUARTERLY' },
  { no: 22, nomenclature: 'PATCH, LOT INSIGNIA, CLOTH', cadence: 'QUARTERLY' },
  { no: 23, nomenclature: 'FIELD MANUAL, PRINTED, CURRENT REV', cadence: 'QUARTERLY' },
]

const MONTHLY_COUNT = RATION_LOAD.filter((item) => item.cadence === 'MONTHLY').length
const QUARTERLY_COUNT = RATION_LOAD.filter((item) => item.cadence === 'QUARTERLY').length

// Reusable IBM-3270-register status line: inverted bar, fixed fields,
// no color, no icons. Used at the head of the OPEN TAB and available for
// reuse anywhere else the system needs a terse state readout.
export const BasicsStatusLine: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'flex flex-wrap justify-between gap-x-16 gap-y-4',
      'bg-acc text-bac font-mono text-[13px] uppercase tracking-wide',
      'px-8 py-4 border-2 border-acc rounded-none',
      className
    )}
  >
    <span>OPEN TAB</span>
    <span>READ-ONLY</span>
    <span>0 ON STRENGTH</span>
    <span>LOT-FM-001 / M1</span>
  </div>
)

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-mono uppercase tracking-wide text-[13px] border-b-2 border-acc pb-4 mb-16">
    {children}
  </div>
)

export const BasicsTab: React.FC<BasicsTabProps> = ({ noWrapper = false }) => {
  useDocumentTitle('Basics — OPEN TAB')

  const content = (
    <div className="font-mono max-w-[640px]">
      <div className="mb-16 flex items-center justify-between">
        <div className="uppercase tracking-wide text-[15px]">Basics</div>
        {!noWrapper && <GhostButton href="/">← Home</GhostButton>}
      </div>

      <BasicsStatusLine className="mb-32" />

      <div className="mb-32">
        <SectionHeading>Doctrine</SectionHeading>
        <div className="text-[13px] leading-[1.6] uppercase tracking-wide">
          LOT ISSUES. LOT DOES NOT SELL.
          <br />
          THE OPERATOR ON STRENGTH RECEIVES A FIXED RATION OF MATERIAL
          SUPPORT, MONTH ON MONTH. NO CATALOG. NO UPSELL. ONE LOAD, ONE
          RATE, ONE CADENCE.
          <br />
          THIS IS THE HARDWARE LAYER OF THE LOT SYSTEM — THE INTELLIGENCE
          LAYER APPLIED TO MATERIAL NEED. NOT A STORE. A SUPPLY LINE.
        </div>
      </div>

      <div className="mb-32">
        <SectionHeading>Issue Rate</SectionHeading>
        <div className="text-[13px] uppercase tracking-wide leading-[1.8]">
          <div className="flex justify-between border-b border-acc/20 py-4">
            <span>RATE</span>
            <span>USD 100.00 / MONTH</span>
          </div>
          <div className="flex justify-between border-b border-acc/20 py-4">
            <span>BILLING</span>
            <span>MONTHLY, NO CONTRACT</span>
          </div>
          <div className="flex justify-between border-b border-acc/20 py-4">
            <span>TERMS</span>
            <span>STAND DOWN AT WILL</span>
          </div>
          <div className="flex justify-between py-4">
            <span>COGS</span>
            <span>WITHHELD</span>
          </div>
        </div>
      </div>

      <div className="mb-32">
        <SectionHeading>
          Ration Load — {RATION_LOAD.length} Items ({MONTHLY_COUNT} Monthly ·{' '}
          {QUARTERLY_COUNT} Quarterly)
        </SectionHeading>
        <div className="text-[13px] uppercase tracking-wide">
          <div className="flex border-b-2 border-acc py-4 font-bold">
            <span className="w-32">NO</span>
            <span className="flex-1">NOMENCLATURE</span>
            <span className="w-96 text-right">CADENCE</span>
          </div>
          {RATION_LOAD.map((item) => (
            <div
              key={item.no}
              className="flex border-b border-acc/20 py-4 leading-[1.4]"
            >
              <span className="w-32 flex-shrink-0">{item.no}</span>
              <span className="flex-1 pr-8">{item.nomenclature}</span>
              <span className="w-96 flex-shrink-0 text-right">
                {item.cadence}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-acc/40 text-[12px] uppercase tracking-wide pt-16 border-t-2 border-acc">
        LOT-FM-001 · MODULE: BASIC (RATION) · BUILD MONTH 1 OF 3 — LEDGER &
        DOCTRINE
        <br />
        MONTH 2 (UPGRADE & ROSTER) AND MONTH 3 (ISSUE & FULFILLMENT) NOT YET
        LIVE.
      </div>
    </div>
  )

  return noWrapper ? content : <Page>{content}</Page>
}
