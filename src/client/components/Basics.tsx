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
 * Month 1 surface: read-only ledger. Nomenclature + cadence. COGS withheld.
 * House style: mono bold, white ground / black ink, inversion-only hierarchy,
 * 2px rules, square corners, fixed character grid. Styles live under
 * `.lot-basics` in index.css. No color, no radius, no icons.
 */

import * as React from 'react'
import {
  BASICS_FM,
  BASICS_MODULE,
  BASICS_PRICE_USD,
  BASICS_LOAD,
  BASICS_LOAD_COUNT,
  BASICS_DOCTRINE,
  BASICS_CADENCE_LABEL,
  BasicsLineItem,
  BasicsState,
} from '#shared/constants/basics'

const GROUP_ORDER: BasicsLineItem['group'][] = ['HYGIENE', 'GARMENT', 'FIELD', 'OFFICE']

export const BasicsStatusLine: React.FC<{ state: BasicsState; nextIssue?: string }> = ({
  state,
  nextIssue = '—',
}) => (
  <div className="lot-basics-status" role="status">
    <span>{BASICS_FM}</span>
    <span>{BASICS_MODULE}</span>
    <span>STATUS: {state}</span>
    <span>LOAD {BASICS_LOAD_COUNT}</span>
    <span>USD {BASICS_PRICE_USD}/MO</span>
    <span>NEXT ISSUE: {nextIssue}</span>
  </div>
)

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="lot-basics-section">
    <h2 className="lot-basics-inv">{title}</h2>
    {children}
  </section>
)

export const BasicsLedger: React.FC<{ state: BasicsState }> = ({ state }) => {
  const groups = React.useMemo(
    () =>
      GROUP_ORDER.map((g) => ({
        group: g,
        lines: BASICS_LOAD.filter((l) => l.group === g),
      })).filter((g) => g.lines.length),
    []
  )

  return (
    <div className="lot-basics">
      <BasicsStatusLine state={state} />

      <header className="lot-basics-head">
        <div>{BASICS_FM} / CIVILIAN RATION</div>
        <h1>BASIC</h1>
        <div>ONE BOX PER MONTH. {BASICS_LOAD_COUNT} LINES ON CADENCE.</div>
      </header>

      <Section title="1. DOCTRINE">
        <ol className="lot-basics-doctrine">
          {BASICS_DOCTRINE.map((d, i) => (
            <li key={i}>
              <span className="lot-basics-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{d}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={`2. MANIFEST — ${BASICS_LOAD_COUNT} LINES`}>
        <table className="lot-basics-ledger">
          <thead>
            <tr>
              <th className="c-ln">LN</th>
              <th className="c-nom">NOMENCLATURE</th>
              <th className="c-qty">QTY</th>
              <th className="c-cad">CADENCE</th>
            </tr>
          </thead>
          {groups.map(({ group, lines }) => (
            <tbody key={group}>
              <tr className="lot-basics-group">
                <td colSpan={4}>{group}</td>
              </tr>
              {lines.map((l) => (
                <tr key={l.line}>
                  <td className="c-ln">{l.line}</td>
                  <td className="c-nom">{l.nomenclature}</td>
                  <td className="c-qty">{l.qty} {l.ui}</td>
                  <td className="c-cad">{BASICS_CADENCE_LABEL[l.cadence]}</td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td colSpan={4}>UNIT COST: WITHHELD. LINES MAY BE SUBSTITUTED LIKE-FOR-LIKE.</td>
            </tr>
          </tfoot>
        </table>
      </Section>

      <Section title="3. TERMS">
        <dl className="lot-basics-terms">
          <dt>PRICE</dt>
          <dd>USD {BASICS_PRICE_USD} PER MONTH. ADDITIVE TO USERSHIP.</dd>
          <dt>CADENCE</dt>
          <dd>ONE ISSUE PER MONTH FROM CADENCE START.</dd>
          <dt>ELIGIBLE</dt>
          <dd>LOT USERSHIP MEMBERS. UPGRADE FROM AI PLAN.</dd>
          <dt>STAND DOWN</dt>
          <dd>ANY TIME. RATION STOPS. AI USERSHIP RETAINED.</dd>
        </dl>
      </Section>

      <Section title="4. UPGRADE">
        <div className="lot-basics-upgrade">
          <button type="button" className="lot-basics-btn" disabled>
            UPGRADE — NOT YET OPEN
          </button>
          <span>ROSTER OPENS NEXT CYCLE.</span>
        </div>
      </Section>

      <BasicsStatusLine state={state} />
    </div>
  )
}

/**
 * In-app Basics tab. The app bundle only loads for signed-in members, so the
 * status is USERSHIP/AI until the Month 2 state machine lands. Kept free of
 * #client/stores so the public OPEN TAB bundle stays small and side-effect free.
 */
export const Basics: React.FC = () => <BasicsLedger state="USERSHIP/AI" />
