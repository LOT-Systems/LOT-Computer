/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) · OPEN TAB
 *
 * Month 1 surface: read-only ledger. Doctrine, 23-line manifest, terms, price
 * line, status line. House style: white ground / black ink, inversion-only
 * hierarchy, 2px rules, square corners, fixed character grid. Styles are scoped
 * under `.lot-basics` in index.css so the tab renders identically regardless of
 * the member's chosen theme.
 */

import * as React from 'react'
import {
  BASICS_CADENCE_LABEL,
  BASICS_DOC_ID,
  BASICS_DOCTRINE,
  BASICS_ITEM_COUNT,
  BASICS_MANIFEST,
  BASICS_PLAN_CODE,
  BASICS_PRICE_USD,
  BASICS_BILLING_PERIOD,
  BASICS_STATE_LABEL,
  BASICS_TERMS,
  type BasicsState,
} from '#shared/basics'

export type BasicsRoll = BasicsState | 'NOT_ON_ROLL'

const ROLL_LABEL: Record<BasicsRoll, string> = {
  ...BASICS_STATE_LABEL,
  NOT_ON_ROLL: 'NOT ON ROLL',
}

const CADENCE_SHORT = { M: 'MO', Q: 'QTR', S: 'SEMI', A: 'ANN' } as const

const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length))

export function BasicsStatusLine(props: { roll: BasicsRoll; nextIssue?: string | null }) {
  const fields = [
    `PLAN ${BASICS_PLAN_CODE}`,
    `ROLL ${ROLL_LABEL[props.roll]}`,
    `LOAD ${BASICS_ITEM_COUNT} LN`,
    `NEXT ISSUE ${props.nextIssue ?? 'NOT SCHEDULED'}`,
    'UPGRADE NOT YET OPEN',
  ]
  return (
    <div className="lb-status" role="status" aria-label="Basics status line">
      {fields.map((f) => (
        <span key={f} className="lb-status-field">
          {f}
        </span>
      ))}
    </div>
  )
}

function Section(props: { code: string; title: string; children: React.ReactNode }) {
  return (
    <section className="lb-section" aria-labelledby={`lb-${props.code}`}>
      <h2 id={`lb-${props.code}`} className="lb-section-head">
        <span>{props.code}</span>
        <span>{props.title}</span>
      </h2>
      <div className="lb-section-body">{props.children}</div>
    </section>
  )
}

export function Basics(props: { roll?: BasicsRoll; publicView?: boolean }) {
  const roll = props.roll ?? 'NOT_ON_ROLL'
  return (
    <div className="lot-basics" data-public={props.publicView ? 'true' : undefined}>
      <header className="lb-masthead">
        <div className="lb-inv">
          <span>{BASICS_DOC_ID}</span>
          <span>OPEN TAB</span>
        </div>
        <h1 className="lb-title">LOT® BASIC — CIVILIAN RATION</h1>
        <p className="lb-price">
          {`USD ${BASICS_PRICE_USD}/${BASICS_BILLING_PERIOD} · ${BASICS_ITEM_COUNT} LINES · ISSUED MONTHLY`}
        </p>
      </header>

      <Section code="1" title="DOCTRINE">
        <ol className="lb-list">
          {BASICS_DOCTRINE.map((line, i) => (
            <li key={i}>
              <span className="lb-num">{`1.${i + 1}`}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section code="2" title={`MANIFEST — ${BASICS_ITEM_COUNT} LINES`}>
        <div className="lb-ledger-wrap">
          <table className="lb-ledger">
            <thead>
              <tr>
                <th scope="col">LN</th>
                <th scope="col">NOMENCLATURE</th>
                <th scope="col" className="lb-r">QTY</th>
                <th scope="col">U/I</th>
                <th scope="col">CADENCE</th>
              </tr>
            </thead>
            <tbody>
              {BASICS_MANIFEST.map((item) => (
                <tr key={item.line}>
                  <td>{item.line}</td>
                  <td className="lb-nom">{item.nomenclature}</td>
                  <td className="lb-r">{item.qty}</td>
                  <td>{item.unit}</td>
                  <td>
                    <span className="lb-wide">{pad(BASICS_CADENCE_LABEL[item.cadence], 10)}</span>
                    <span className="lb-narrow">{CADENCE_SHORT[item.cadence]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="lb-note">COST BASIS WITHHELD. LANDED COST PER ISSUE HELD UNDER CEILING.</p>
      </Section>

      <Section code="3" title="TERMS">
        <ol className="lb-list">
          {BASICS_TERMS.map((line, i) => (
            <li key={i}>
              <span className="lb-num">{`3.${i + 1}`}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </Section>

      <BasicsStatusLine roll={roll} />
    </div>
  )
}

/** In-app tab wrapper: derives the member's roll from their profile tags. */
export function BasicsTab(props: { tags?: string[] }) {
  const hasUsership = (props.tags ?? []).some((t) => t.toLowerCase() === 'usership')
  return <Basics roll={hasUsership ? 'USERSHIP_AI' : 'NOT_ON_ROLL'} />
}
