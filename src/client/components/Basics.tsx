/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * BASICS — LOT-FM-001 / SELF-ASSEMBLY DIRECTIVE, MODULE: BASIC (RATION)
 * Month 1 of the 90-day build: OPEN TAB public surface. Read-only ledger.
 * House style is fixed by doctrine, not by the app theme: LiberationMono-Bold,
 * white ground / black ink, inversion-only hierarchy, 2px rules, square
 * corners, fixed character grid, IBM 3270 register — independent of the
 * subscriber's own theme/mirror settings, on purpose. Voice: quartermaster,
 * imperative, terse. No color, no radius, no icons, no marketing copy.
 */

import * as React from 'react'
import { Clock } from '#client/components/ui'
import { useDocumentTitle } from '#client/utils/hooks'

const MONO_FONT =
  "'Liberation Mono', 'Courier New', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

// Section 2 cadence load. 23 lines. Nomenclature + cadence only — COGS and
// margin are withheld from the public ledger by doctrine (ISSUE, do not sell).
type RationLine = { line: number; nomenclature: string; cadence: string }

const RATION_MANIFEST: RationLine[] = [
  { line: 1, nomenclature: 'TOOTHBRUSH, SOFT BRISTLE', cadence: 'MONTHLY' },
  { line: 2, nomenclature: 'TOOTHPASTE, TRAVEL TUBE', cadence: 'MONTHLY' },
  { line: 3, nomenclature: 'FLOSS, WAXED, 50M', cadence: 'MONTHLY' },
  { line: 4, nomenclature: 'SOAP, BAR, UNSCENTED', cadence: 'MONTHLY' },
  { line: 5, nomenclature: 'DEODORANT, UNSCENTED', cadence: 'MONTHLY' },
  { line: 6, nomenclature: 'RAZOR CARTRIDGE, 3-PACK', cadence: 'MONTHLY' },
  { line: 7, nomenclature: 'UNDERWEAR, COTTON, UNMARKED', cadence: 'MONTHLY' },
  { line: 8, nomenclature: 'SOCKS, CREW, BLACK, PAIR', cadence: 'MONTHLY' },
  { line: 9, nomenclature: 'COTTON SWABS, 50CT', cadence: 'MONTHLY' },
  { line: 10, nomenclature: 'ADHESIVE BANDAGES, 20CT', cadence: 'MONTHLY' },
  { line: 11, nomenclature: 'ELECTROLYTE PACKETS, 10CT', cadence: 'MONTHLY' },
  { line: 12, nomenclature: 'MULTIVITAMIN, 30CT', cadence: 'MONTHLY' },
  { line: 13, nomenclature: 'EARPLUGS, PAIR', cadence: 'MONTHLY' },
  { line: 14, nomenclature: 'NOTEBOOK, POCKET, GRID', cadence: 'MONTHLY' },
  { line: 15, nomenclature: 'PEN, BLACK INK, FINE', cadence: 'MONTHLY' },
  { line: 16, nomenclature: 'NAIL CLIPPER', cadence: 'QUARTERLY' },
  { line: 17, nomenclature: 'BATTERIES, AA, 4-PACK', cadence: 'QUARTERLY' },
  { line: 18, nomenclature: 'BATTERIES, AAA, 4-PACK', cadence: 'QUARTERLY' },
  { line: 19, nomenclature: 'USB-C CABLE, 1M', cadence: 'QUARTERLY' },
  { line: 20, nomenclature: 'MICROFIBER CLOTH', cadence: 'QUARTERLY' },
  { line: 21, nomenclature: 'ZIP TIES, 10CT', cadence: 'QUARTERLY' },
  { line: 22, nomenclature: 'SLEEP MASK', cadence: 'QUARTERLY' },
  { line: 23, nomenclature: 'FIELD TOWEL, QUICK-DRY', cadence: 'QUARTERLY' },
]

const StatusLine: React.FC<{ left: string; center: string; right: React.ReactNode }> = ({
  left,
  center,
  right,
}) => (
  <div
    className="flex items-center justify-between gap-8 border-2 border-black bg-black text-white px-8 py-4 text-[11px] phone:text-xs uppercase tracking-widest"
    style={{ fontFamily: MONO_FONT, fontWeight: 700 }}
  >
    <span className="flex-shrink-0">{left}</span>
    <span className="hidden tablet:block text-center flex-grow truncate">{center}</span>
    <span className="flex-shrink-0">{right}</span>
  </div>
)

const Rule: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`border-t-2 border-black ${className ?? ''}`} />
)

export const Basics: React.FC = () => {
  useDocumentTitle('Basics')

  return (
    <div
      className="bg-white text-black min-h-full"
      style={{ fontFamily: MONO_FONT, fontWeight: 700 }}
    >
      <div className="max-w-[880px] mx-auto px-16 phone:px-24 py-24 phone:py-32 flex flex-col gap-16">
        <StatusLine
          left="LOT-FM-001"
          center="OPEN TAB — MODULE: BASIC (RATION)"
          right={<Clock format="YYYY.MM.DD HH:mm:ss" interval={1000} />}
        />

        <div>
          <div className="text-2xl phone:text-3xl uppercase tracking-tight leading-none">
            LOT Basic Ration
          </div>
          <div className="mt-8 text-xs phone:text-sm uppercase tracking-widest opacity-70">
            Hardware / physical layer of the LOT System
          </div>
        </div>

        <Rule />

        {/* Doctrine statement — quartermaster voice. Terse. Imperative. */}
        <div className="border-2 border-black p-12 phone:p-16 flex flex-col gap-8 text-sm phone:text-base leading-snug">
          <p>THIS IS NOT A STORE. THIS IS ISSUE.</p>
          <p>
            BASIC supplies the physical layer the System runs on. Twenty-three
            lines. Fixed cadence. No selection. No cart.
          </p>
          <p>YOU ARE NOT A CUSTOMER. YOU ARE ON STRENGTH.</p>
          <p>THE LEDGER IS THE MARKETING. NO LAYER BETWEEN PUBLIC AND MANIFEST.</p>
        </div>

        {/* Price line — inversion-only hierarchy: the one row that matters
            inverts to black ground / white ink instead of adding color. */}
        <div className="border-2 border-black bg-black text-white flex flex-col phone:flex-row phone:items-stretch">
          <div className="flex-grow px-12 phone:px-16 py-12 uppercase tracking-widest text-xs phone:text-sm">
            Issue rate
          </div>
          <div className="phone:border-l-2 border-white/40 px-12 phone:px-16 py-12 text-lg phone:text-xl">
            USD 100.00 / MONTH
          </div>
          <div className="phone:border-l-2 border-white/40 px-12 phone:px-16 py-12 uppercase tracking-widest text-xs phone:text-sm opacity-80">
            Additive to Usership
          </div>
        </div>

        <Rule className="mt-8" />

        <div className="uppercase tracking-widest text-xs phone:text-sm opacity-70">
          Section 2 — Ration Manifest — 23 Lines
        </div>

        {/* Fixed character grid ledger. Square corners. 2px rules only. */}
        <div className="border-2 border-black">
          <div
            className="grid border-b-2 border-black uppercase tracking-widest text-[11px] phone:text-xs"
            style={{ gridTemplateColumns: '56px 1fr 108px' }}
          >
            <div className="px-8 py-6 border-r-2 border-black">Line</div>
            <div className="px-8 py-6 border-r-2 border-black">Nomenclature</div>
            <div className="px-8 py-6">Cadence</div>
          </div>
          {RATION_MANIFEST.map((row, i) => (
            <div
              key={row.line}
              className="grid text-xs phone:text-sm"
              style={{
                gridTemplateColumns: '56px 1fr 108px',
                borderTop: i === 0 ? undefined : '2px solid black',
              }}
            >
              <div className="px-8 py-6 border-r-2 border-black tabular-nums">
                {String(row.line).padStart(2, '0')}
              </div>
              <div className="px-8 py-6 border-r-2 border-black">
                {row.nomenclature}
              </div>
              <div className="px-8 py-6">{row.cadence}</div>
            </div>
          ))}
        </div>

        <div className="text-[11px] phone:text-xs uppercase tracking-widest opacity-60">
          COGS withheld. Margin classified. Landed cost held under ceiling —
          issue rate never breached.
        </div>

        <Rule className="mt-8" />

        <div className="flex flex-col gap-4 text-[11px] phone:text-xs uppercase tracking-widest opacity-70">
          <div>LOT-FM-001 / SELF-ASSEMBLY DIRECTIVE — MODULE: BASIC (RATION)</div>
          <div>MONTH 1 OF 3 — LEDGER &amp; DOCTRINE — STATUS: OPEN TAB, READ-ONLY, LIVE</div>
          <div>MONTH 2 — UPGRADE &amp; ROSTER — PENDING</div>
          <div>MONTH 3 — ISSUE &amp; FULFILLMENT — PENDING</div>
        </div>

        <StatusLine left="LOT-FM-001" center="END OF TAB" right="EOF" />
      </div>
    </div>
  )
}
