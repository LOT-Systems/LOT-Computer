/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// BASIC (ration module) — hardware/physical layer of the LOT System.
// LOT-FM-001 self-assembly directive. MONTH 1 scope: OPEN TAB.
//
// House style is deliberate and distinct from the rest of the app: white
// ground / black ink, inversion-only hierarchy (no color, no radius, no
// icons), 2px rules, square corners, monospace register. This tab is the
// manifest, not a storefront — the ledger is the marketing. Read-only.
//
// LOCKED sections (ROSTER intake, UPGRADE state machine, ISSUE/fulfillment)
// are Month 2 and Month 3 of the same directive — not yet built. They are
// named here, inert, so the surface is honest about what exists today.

import * as React from 'react'
import { StatusLine } from './ui/StatusLine'

const MONO_STACK =
  "'Liberation Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace"

type RationItem = {
  no: number
  nomenclature: string
  cadence: string
}

// 23-item ration load. Nomenclature and cadence are public record — cost of
// goods is withheld per doctrine (issue, not sell; the ceiling is internal).
const RATION_LOAD: RationItem[] = [
  { no: 1, nomenclature: 'TOOTHBRUSH, SOFT BRISTLE', cadence: 'MONTHLY' },
  { no: 2, nomenclature: 'TOOTHPASTE, FLUORIDE, TRAVEL', cadence: 'MONTHLY' },
  { no: 3, nomenclature: 'FLOSS, WAXED, 50M', cadence: 'MONTHLY' },
  { no: 4, nomenclature: 'DEODORANT, UNSCENTED', cadence: 'MONTHLY' },
  { no: 5, nomenclature: 'SOAP, BAR, UNSCENTED', cadence: 'MONTHLY' },
  { no: 6, nomenclature: 'SHAMPOO, TRAVEL, 100ML', cadence: 'BIMONTHLY' },
  { no: 7, nomenclature: 'RAZOR, DISPOSABLE, 5-PACK', cadence: 'MONTHLY' },
  { no: 8, nomenclature: 'NAIL CLIPPER, COMPACT', cadence: 'QUARTERLY' },
  { no: 9, nomenclature: 'UNDERWEAR, COTTON, 3-PACK', cadence: 'QUARTERLY' },
  { no: 10, nomenclature: 'SOCKS, CREW, 3-PACK', cadence: 'QUARTERLY' },
  { no: 11, nomenclature: 'T-SHIRT, COTTON, CREW', cadence: 'QUARTERLY' },
  { no: 12, nomenclature: 'TOILET PAPER, 2-PLY, 12-ROLL', cadence: 'MONTHLY' },
  { no: 13, nomenclature: 'PAPER TOWEL, 2-ROLL', cadence: 'MONTHLY' },
  { no: 14, nomenclature: 'TISSUE, FACIAL, TRAVEL', cadence: 'BIMONTHLY' },
  { no: 15, nomenclature: 'HAND SANITIZER, 60ML', cadence: 'BIMONTHLY' },
  { no: 16, nomenclature: 'LAUNDRY DETERGENT, POD, 20-CT', cadence: 'BIMONTHLY' },
  { no: 17, nomenclature: 'DISH SOAP, 200ML', cadence: 'BIMONTHLY' },
  { no: 18, nomenclature: 'TRASH BAG, 13-GAL, 10-PACK', cadence: 'MONTHLY' },
  { no: 19, nomenclature: 'BATTERY, AA, ALKALINE, 4-PACK', cadence: 'QUARTERLY' },
  { no: 20, nomenclature: 'LIGHTER, BUTANE', cadence: 'QUARTERLY' },
  { no: 21, nomenclature: 'NOTEBOOK, POCKET, RULED', cadence: 'QUARTERLY' },
  { no: 22, nomenclature: 'PEN, BLACK INK, 2-PACK', cadence: 'QUARTERLY' },
  { no: 23, nomenclature: 'FIRST-AID KIT, COMPACT', cadence: 'SEMIANNUAL' },
]

export function BasicsTab() {
  return (
    <div
      style={{ fontFamily: MONO_STACK }}
      className="font-bold text-black bg-white max-w-[720px] mx-auto -mx-16 phone:mx-auto px-16 phone:px-0"
    >
      <StatusLine
        className="mb-16"
        tokens={[
          { label: 'DOC', value: 'LOT-FM-001' },
          { label: 'MODULE', value: 'BASIC' },
          { label: 'STATE', value: 'OPEN TAB' },
          { label: 'MODE', value: 'READ-ONLY' },
        ]}
      />

      <div className="border-2 border-black p-16 mb-16">
        <div className="text-[12px] tracking-[0.1em] opacity-60 mb-4">
          LOT SYSTEMS / BASIC RATION
        </div>
        <div className="text-[18px] phone:text-[20px] mb-12">
          BASIC — HARDWARE, HYGIENE &amp; SUPPLY ISSUE
        </div>
        <div className="text-[13px] leading-[1.6]">
          <p className="mb-8">
            ISSUE, NOT SALE. THE OPERATOR IS ON STRENGTH, NOT A CUSTOMER.
            ONCE ENROLLED, A FIXED MONTHLY RATION OF PHYSICAL ESSENTIALS —
            HYGIENE, APPAREL BASICS, HOME PAPER GOODS, LIGHT FIELD GEAR —
            SHIPS ON SCHEDULE. NO CART. NO SELECTION. THE LOAD IS SET BY
            CADENCE, NOT PREFERENCE.
          </p>
          <p>
            THE MANIFEST BELOW IS THE WHOLE OFFER. NOMENCLATURE AND CADENCE
            ARE PUBLIC RECORD. COST OF GOODS IS WITHHELD — THE LEDGER SHOWS
            WHAT IS ISSUED AND WHEN, NOT WHAT IT COSTS TO ISSUE IT.
          </p>
        </div>
      </div>

      <div className="border-2 border-black mb-16">
        <div className="bg-black text-white px-8 py-4 flex justify-between text-[12px] tracking-[0.1em]">
          <span>PRICE</span>
          <span>BILLING</span>
        </div>
        <div className="px-8 py-8 flex justify-between items-baseline text-[16px] phone:text-[18px]">
          <span>USD 100.00 / MO</span>
          <span className="text-[13px]">RECURRING · MONTHLY</span>
        </div>
      </div>

      <div className="border-2 border-black mb-16 overflow-x-auto">
        <table className="w-full text-[12px] phone:text-[13px] border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="text-left px-8 py-4 border-r-2 border-white w-[40px]">
                NO.
              </th>
              <th className="text-left px-8 py-4 border-r-2 border-white">
                NOMENCLATURE
              </th>
              <th className="text-left px-8 py-4 w-[92px] phone:w-[110px]">
                CADENCE
              </th>
            </tr>
          </thead>
          <tbody>
            {RATION_LOAD.map((item) => (
              <tr key={item.no} className="border-t-2 border-black">
                <td className="px-8 py-4 border-r-2 border-black align-top">
                  {String(item.no).padStart(2, '0')}
                </td>
                <td className="px-8 py-4 border-r-2 border-black align-top">
                  {item.nomenclature}
                </td>
                <td className="px-8 py-4 align-top">{item.cadence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StatusLine
        className="mb-16"
        tokens={[
          { label: 'ITEMS ON STRENGTH', value: '23' },
          { label: 'ROSTER', value: 'LOCKED — M2' },
          { label: 'UPGRADE', value: 'LOCKED — M2' },
          { label: 'ISSUE', value: 'LOCKED — M3' },
        ]}
      />

      <div className="text-[12px] leading-[1.6] opacity-60 mb-16">
        THIS TAB IS THE MANIFEST. NOTHING ABOVE IS SOLD — IT IS ISSUED.
        NEXT BUILD: ROSTER INTAKE AND UPGRADE FROM USERSHIP (AI). LOT-FM-001
        / MONTH 2.
      </div>
    </div>
  )
}
