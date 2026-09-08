/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useDocumentTitle } from '#client/utils/hooks'

// LOT-FM-001 — BASIC (RATION) module. House style is fixed by the manual and
// does not follow the app theme: white ground, black ink, inversion-only
// hierarchy, 2px rules, square corners, monospace register. This is the
// Month 1 build — OPEN TAB public surface, read-only. No billing, no roster
// intake, no upgrade state machine: those are Month 2/3.

const BUILD_MONTH = 1
const BUILD_TOTAL = 3

type Cadence =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI-ANNUAL'
  | 'ONE-TIME (INTAKE)'

type ManifestLine = {
  no: number
  nomenclature: string
  cadence: Cadence
}

// 23-item load. PROVISIONAL: nomenclature is a working placeholder set
// pending quartermaster (S-2) confirmation of final SKUs — see the manifest
// footnote below. Cadence and nomenclature are public; unit cost is withheld.
const MANIFEST: ManifestLine[] = [
  { no: 1, nomenclature: 'FIELD LOG — bound ruled notebook', cadence: 'MONTHLY' },
  { no: 2, nomenclature: 'SIGNAL PEN — fine-tip issue pen', cadence: 'MONTHLY' },
  { no: 3, nomenclature: 'MANIFEST CARD — printed ration card, this cycle', cadence: 'MONTHLY' },
  { no: 4, nomenclature: 'RATION BAR — sustainment bar, 12-pack', cadence: 'MONTHLY' },
  { no: 5, nomenclature: 'HYDRATION TAB — electrolyte tablets, 10-pack', cadence: 'MONTHLY' },
  { no: 6, nomenclature: 'FIELD COFFEE — roast, 12oz', cadence: 'MONTHLY' },
  { no: 7, nomenclature: 'FIELD TEA — loose-leaf tin', cadence: 'MONTHLY' },
  { no: 8, nomenclature: 'FIELD SOAP — bar soap', cadence: 'MONTHLY' },
  { no: 9, nomenclature: 'GROOMING REFILL — blade/razor refill', cadence: 'MONTHLY' },
  { no: 10, nomenclature: 'POSTAGE SET — stamped correspondence cards', cadence: 'MONTHLY' },
  { no: 11, nomenclature: 'STATUS STICKER SHEET — rank/status stickers', cadence: 'MONTHLY' },
  { no: 12, nomenclature: 'CO LETTER — printed field-manual briefing', cadence: 'MONTHLY' },
  { no: 13, nomenclature: 'REST MASK — blackout eye mask', cadence: 'QUARTERLY' },
  { no: 14, nomenclature: 'SIGNAL PLUGS — foam ear protection, 6-pair', cadence: 'QUARTERLY' },
  { no: 15, nomenclature: 'RECOVERY BALM — muscle balm tin', cadence: 'QUARTERLY' },
  { no: 16, nomenclature: 'MULTI-TOOL — compact steel tool', cadence: 'QUARTERLY' },
  { no: 17, nomenclature: 'SIGNAL CABLE — braided charge cable', cadence: 'QUARTERLY' },
  { no: 18, nomenclature: 'PATCH SET — embroidered unit patch', cadence: 'QUARTERLY' },
  { no: 19, nomenclature: "SEASONAL SUPPLEMENT — quartermaster's choice", cadence: 'QUARTERLY' },
  { no: 20, nomenclature: 'FIELD CAP — structured cap', cadence: 'SEMI-ANNUAL' },
  { no: 21, nomenclature: 'FIELD LIGHT — EDC flashlight', cadence: 'ONE-TIME (INTAKE)' },
  { no: 22, nomenclature: 'COMPASS CARD — analog compass', cadence: 'ONE-TIME (INTAKE)' },
  { no: 23, nomenclature: 'ID TAG — engraved identification tag', cadence: 'ONE-TIME (INTAKE)' },
]

function StatusLine() {
  return (
    <div className="flex flex-wrap gap-x-24 gap-y-4 border-2 border-black px-12 py-8 uppercase tracking-widest text-xs">
      <span>TAB: OPEN</span>
      <span>ACCESS: PUBLIC</span>
      <span>STATE: READ-ONLY</span>
      <span>BUILD: MONTH {BUILD_MONTH} / {BUILD_TOTAL}</span>
    </div>
  )
}

export const Basics = React.memo(function BasicsInner() {
  useDocumentTitle('Basics')

  return (
    <div className="font-mono font-bold bg-white text-black -m-16 phone:-m-32 tablet:-m-48 desktop:-m-64 p-16 phone:p-32 tablet:p-48 desktop:p-64 min-h-[100dvh]">
      <div className="max-w-[720px]">
        <div className="mb-16">
          <div className="text-xs uppercase tracking-widest opacity-60">LOT-FM-001 / BASIC (RATION)</div>
          <h1 className="text-xl uppercase tracking-widest">Open Tab</h1>
        </div>

        <div className="mb-24">
          <StatusLine />
        </div>

        <div className="mb-24 border-2 border-black p-12">
          <div className="uppercase tracking-widest text-xs mb-8 opacity-60">Doctrine</div>
          <p className="uppercase leading-relaxed">
            LOT issues. LOT does not sell.
          </p>
          <p className="uppercase leading-relaxed mt-8">
            The basic ration is physical load, issued monthly, sized to the
            operator on file. Nomenclature and cadence are public record. Unit
            cost is withheld — held against ceiling, verified, never breached.
          </p>
          <p className="uppercase leading-relaxed mt-8">
            Go on strength. Stay on strength. Stand down when you must — the
            ledger does not argue.
          </p>
        </div>

        <div className="mb-24 border-2 border-black p-12 flex flex-wrap items-baseline justify-between gap-8">
          <div className="uppercase tracking-widest text-xs opacity-60">Issue Rate</div>
          <div className="uppercase tracking-widest text-lg">USD 100.00 / MONTH</div>
          <div className="uppercase tracking-widest text-xs opacity-60">No contract · cancel any cycle</div>
        </div>

        <div className="mb-8">
          <div className="uppercase tracking-widest text-xs mb-8 opacity-60">
            Manifest — 23 item load
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black border-collapse text-xs">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border-2 border-black px-8 py-4 text-left uppercase tracking-widest w-[48px]">No.</th>
                  <th className="border-2 border-black px-8 py-4 text-left uppercase tracking-widest">Nomenclature</th>
                  <th className="border-2 border-black px-8 py-4 text-left uppercase tracking-widest w-[160px]">Cadence</th>
                </tr>
              </thead>
              <tbody>
                {MANIFEST.map((line) => (
                  <tr key={line.no}>
                    <td className="border-2 border-black px-8 py-4 tabular-nums">{line.no}</td>
                    <td className="border-2 border-black px-8 py-4 uppercase">{line.nomenclature}</td>
                    <td className="border-2 border-black px-8 py-4 uppercase">{line.cadence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="uppercase tracking-widest text-xs mt-8 opacity-60">
            COGS: withheld · landed cost held ≤ USD 40.00 · margin floor 60%
          </div>
          <div className="uppercase tracking-widest text-xs mt-4 opacity-40">
            Manifest status: provisional — nomenclature pending quartermaster confirmation of final SKUs
          </div>
        </div>

        <div className="mt-24 border-2 border-black px-12 py-8 opacity-30 pointer-events-none">
          <div className="flex flex-wrap items-baseline justify-between gap-8 uppercase tracking-widest text-xs">
            <span>Upgrade: Usership (AI) → Basic (Ration)</span>
            <span>Arrives Month 2</span>
          </div>
        </div>
      </div>
    </div>
  )
})
