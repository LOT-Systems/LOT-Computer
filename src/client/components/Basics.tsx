/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · BASIC (RATION) · OPEN TAB
 *
 * Month 1: read-only ledger. Doctrine, terms, 23-line manifest, 12-issue
 * cadence matrix, status line. Same source as /api/public/basics — no layer
 * between the public and the manifest.
 *
 * House style: monospace bold, ink on ground, hierarchy by inversion only,
 * 2px rules, square corners, fixed character grid. No icons, no colour.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { UserTag } from '#shared/types'
import {
  BASICS_MANIFEST,
  BASICS_DOCTRINE,
  BASICS_TERMS,
  BASICS_MODULE_ID,
  BASICS_LOAD_VERSION,
  BASICS_PRICE_USD,
  BASICS_CYCLE_LENGTH,
  BASICS_ITEM_COUNT,
  CADENCE_CODE,
  BasicsClass,
  isIssuedOn,
  loadForIssue,
} from '#shared/basics'

const MONO: React.CSSProperties = {
  fontFamily: "'Liberation Mono', 'LiberationMono-Bold', 'Courier New', Courier, monospace",
  fontWeight: 700,
  letterSpacing: 0,
  fontVariantLigatures: 'none',
}

const CLASSES: BasicsClass[] = ['SUSTAIN', 'HYGIENE', 'GARMENT', 'KIT']
const ISSUES = Array.from({ length: BASICS_CYCLE_LENGTH }, (_, i) => i)
/** Matrix cell: 2.5ch keeps 12 issues inside a 390px phone. */
const CELL = '2.5ch'
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Inverted bar. The only hierarchy device. */
const Bar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-acc text-bac px-8 whitespace-pre-wrap ${className ?? ''}`}>{children}</div>
)

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border-2 border-acc">
    <Bar>{title}</Bar>
    <div className="px-8 py-4">{children}</div>
  </section>
)

export type BasicsStanding = 'PUBLIC' | 'GUEST' | 'USERSHIP/AI'

export function StatusLine({ standing }: { standing: BasicsStanding }) {
  const fields = [
    BASICS_MODULE_ID,
    'BASIC (RATION)',
    BASICS_LOAD_VERSION,
    `${BASICS_ITEM_COUNT} LINES`,
    `USD ${BASICS_PRICE_USD}/MO`,
    `STANDING: ${standing}`,
  ]
  return (
    <Bar className="py-2">
      {fields.join('  ·  ')}
    </Bar>
  )
}

function Doctrine() {
  return (
    <Section title="01  DOCTRINE">
      {BASICS_DOCTRINE.map((line, i) => (
        <div key={i} className="flex gap-x-8">
          <span className="shrink-0">{pad2(i + 1)}</span>
          <span>{line}</span>
        </div>
      ))}
    </Section>
  )
}

function Terms() {
  return (
    <Section title="02  TERMS OF ISSUE">
      {BASICS_TERMS.map(([k, v]) => (
        <div key={k} className="grid gap-x-8" style={{ gridTemplateColumns: '12ch 1fr' }}>
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </Section>
  )
}

function Manifest() {
  return (
    <Section title={`03  MANIFEST · ${BASICS_ITEM_COUNT} LINES · COGS WITHHELD`}>
      <div
        className="grid gap-x-8 border-b-2 border-acc mb-4"
        style={{ gridTemplateColumns: '3ch 1fr 7ch 3ch' }}
      >
        <span>NO</span>
        <span>NOMENCLATURE</span>
        <span>QTY</span>
        <span>CD</span>
      </div>
      {CLASSES.map((cls) => (
        <div key={cls} className="mb-8 last:mb-0">
          <div>
            <span className="bg-acc text-bac px-4">{cls}</span>
          </div>
          {BASICS_MANIFEST.filter((i) => i.cls === cls).map((item) => (
            <div
              key={item.nsn}
              className="grid gap-x-8"
              style={{ gridTemplateColumns: '3ch 1fr 7ch 3ch' }}
            >
              <span>{item.nsn}</span>
              <span className="min-w-0 break-words">{item.nomenclature}</span>
              <span>{item.qty}</span>
              <span>{CADENCE_CODE[item.cadence]}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="border-t-2 border-acc mt-4 pt-4">
        CD: M MONTHLY · Q QUARTERLY · S SEMIANNUAL · A ANNUAL
      </div>
    </Section>
  )
}

function CadenceMatrix() {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <Section title={`04  ISSUE CYCLE · ${BASICS_CYCLE_LENGTH} ISSUES`}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `calc(4ch + ${BASICS_CYCLE_LENGTH} * ${CELL})` }}>
          <div className="flex">
            <span style={{ width: '4ch' }} className="shrink-0">NO</span>
            {ISSUES.map((i) => (
              <span
                key={i}
                style={{ width: CELL }}
                className={`shrink-0 text-center ${hover === i ? 'bg-acc text-bac' : ''}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {pad2(i + 1)}
              </span>
            ))}
          </div>
          {BASICS_MANIFEST.map((item) => (
            <div key={item.nsn} className="flex">
              <span style={{ width: '4ch' }} className="shrink-0">{item.nsn}</span>
              {ISSUES.map((i) => {
                const on = isIssuedOn(item, i)
                return (
                  <span
                    key={i}
                    style={{ width: CELL }}
                    className={`shrink-0 text-center ${hover === i ? 'bg-acc text-bac' : ''}`}
                  >
                    {on ? 'X' : '.'}
                  </span>
                )
              })}
            </div>
          ))}
          <div className="flex border-t-2 border-acc mt-4">
            <span style={{ width: '4ch' }} className="shrink-0">LN</span>
            {ISSUES.map((i) => (
              <span
                key={i}
                style={{ width: CELL }}
                className={`shrink-0 text-center ${hover === i ? 'bg-acc text-bac' : ''}`}
              >
                {pad2(loadForIssue(i).length)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function Upgrade({ standing }: { standing: BasicsStanding }) {
  const line =
    standing === 'PUBLIC'
      ? 'ISSUE IS RESTRICTED TO USERSHIP MEMBERS. ENLIST AT LOT-SYSTEMS.COM.'
      : standing === 'GUEST'
        ? 'USERSHIP REQUIRED BEFORE BASIC CAN BE ISSUED.'
        : 'UPGRADE CONTROL OPENS IN BUILD MONTH 2. LEDGER IS READ-ONLY.'
  return (
    <Section title="05  UPGRADE">
      <div className="mb-8">{line}</div>
      <div className="flex flex-wrap gap-8">
        <span className="border-2 border-acc px-8 select-none" aria-disabled="true">
          UPGRADE · USD {BASICS_PRICE_USD}/MO · LOCKED
        </span>
        <span className="border-2 border-acc px-8">STATE: USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE</span>
      </div>
    </Section>
  )
}

export function BasicsLedger({ standing }: { standing: BasicsStanding }) {
  return (
    <div className="flex flex-col gap-y-16 text-acc uppercase" style={MONO} data-lot-module={BASICS_MODULE_ID}>
      <StatusLine standing={standing} />
      <Doctrine />
      <Terms />
      <Manifest />
      <CadenceMatrix />
      <Upgrade standing={standing} />
    </div>
  )
}

/** In-app tab. Standing derived from the member's tags. */
export const Basics = React.memo(function BasicsInner() {
  const me = useStore(stores.me)
  const standing: BasicsStanding = React.useMemo(() => {
    if (!me) return 'PUBLIC'
    const isUsership =
      me.isAdmin ||
      me.tags.some((t) => t.toLowerCase() === UserTag.Usership.toLowerCase())
    return isUsership ? 'USERSHIP/AI' : 'GUEST'
  }, [me])
  return <BasicsLedger standing={standing} />
})
