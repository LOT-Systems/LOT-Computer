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
 * Month 1: read-only ledger. 23-item manifest, nomenclature + cadence.
 * COGS withheld. Doctrine. Price line. Status line.
 * Rendered in-app (Basics tab) and publicly at /basics (no login).
 */

import * as React from 'react'
import {
  BASICS_MANIFEST,
  BASICS_DOCTRINE,
  BASICS_TERMS,
  BASICS_FORM,
  BASICS_CADENCE_LABEL,
  BASICS_CLASS_LABEL,
  BasicsClass,
  basicsLoadForMonth,
} from '#shared/constants/basics'

type Strength = 'VISITOR' | 'USERSHIP / AI'

type Props = {
  /** Public OPEN TAB (logged-out visitor) vs in-app tab. */
  publicView?: boolean
}

const CLASS_ORDER: BasicsClass[] = ['HYG', 'APP', 'HSE', 'SUS']

export function StatusLine({ cells }: { cells: Array<[string, string]> }) {
  return (
    <div className="lot-basics-status lot-basics-inv lot-basics-row" role="status">
      {cells.map(([k, v]) => (
        <span key={k}>
          {k} {v}
        </span>
      ))}
    </div>
  )
}

export function Basics({ publicView = false }: Props) {
  const [envelope, setEnvelope] = React.useState<string>('—')

  React.useEffect(() => {
    let live = true
    fetch('/api/public/basics')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => live && setEnvelope(d?.envelope ?? '—'))
      .catch(() => live && setEnvelope('OFFLINE'))
    return () => {
      live = false
    }
  }, [])

  React.useEffect(() => {
    if (publicView) document.title = 'LOT® BASIC · OPEN TAB'
  }, [publicView])

  const strength: Strength = publicView ? 'VISITOR' : 'USERSHIP / AI'
  const firstIssue = basicsLoadForMonth(0).length

  return (
    <div className="lot-basics" data-form={BASICS_FORM}>
      {/* HEADER */}
      <div className="lot-basics-inv lot-basics-row">
        <span>LOT® BASIC</span>
        <span>{BASICS_FORM}</span>
      </div>
      <div className="lot-basics-row">
        <span>CIVILIAN RATION · OPEN TAB</span>
        <span className="lot-basics-hide-sm">READ-ONLY</span>
      </div>

      {/* DOCTRINE */}
      <div className="lot-basics-rule lot-basics-sec">
        <div className="lot-basics-row">
          <span>01 DOCTRINE</span>
        </div>
        {BASICS_DOCTRINE.map((line, i) => (
          <div key={i} className="lot-basics-row">
            <span>
              {String(i + 1).padStart(2, '0')}. {line}
            </span>
          </div>
        ))}
      </div>

      {/* TERMS */}
      <div className="lot-basics-rule lot-basics-sec">
        <div className="lot-basics-row">
          <span>02 TERMS</span>
        </div>
        <div className="lot-basics-row">
          <span>PRICE</span>
          <span>
            USD {BASICS_TERMS.priceUsd} / {BASICS_TERMS.period}
          </span>
        </div>
        <div className="lot-basics-row">
          <span>BASIS</span>
          <span>{BASICS_TERMS.basis}</span>
        </div>
        <div className="lot-basics-row">
          <span>FREIGHT</span>
          <span>{BASICS_TERMS.shipping}</span>
        </div>
        <div className="lot-basics-row">
          <span>EXIT</span>
          <span>{BASICS_TERMS.exit}</span>
        </div>
      </div>

      {/* MANIFEST LEDGER */}
      <div className="lot-basics-rule lot-basics-sec">
        <div className="lot-basics-row">
          <span>03 MANIFEST · {BASICS_MANIFEST.length} ITEMS</span>
          <span className="lot-basics-hide-sm">COGS WITHHELD</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>NSN</th>
              <th>NOMENCLATURE</th>
              <th className="num">QTY</th>
              <th className="num lot-basics-hide-sm">U/I</th>
              <th className="num">
                <span className="lot-basics-hide-sm">CADENCE</span>
                <span className="lot-basics-show-sm">CAD</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {CLASS_ORDER.map((cls) => (
              <React.Fragment key={cls}>
                <tr className="lot-basics-cls">
                  <td colSpan={5}>CLASS {cls} · {BASICS_CLASS_LABEL[cls]}</td>
                </tr>
                {BASICS_MANIFEST.filter((i) => i.cls === cls).map((i) => (
                  <tr key={i.nsn}>
                    <td>{i.nsn}</td>
                    <td>{i.nomenclature}</td>
                    <td className="num">{i.qty}</td>
                    <td className="num lot-basics-hide-sm">{i.ui}</td>
                    <td className="num">
                      <span className="lot-basics-hide-sm">{BASICS_CADENCE_LABEL[i.cadence]}</span>
                      <span className="lot-basics-show-sm">{i.cadence}</span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION */}
      <div className="lot-basics-rule lot-basics-sec">
        <div className="lot-basics-row">
          <span>04 ENLISTMENT</span>
        </div>
        <div className="lot-basics-row">
          <span>{publicView ? 'REPORT FOR USERSHIP FIRST.' : 'UPGRADE OPENS NEXT CYCLE.'}</span>
          {publicView ? (
            <a className="lot-basics-btn" href="/">
              LOG IN
            </a>
          ) : (
            <button className="lot-basics-btn" disabled aria-disabled>
              UPGRADE
            </button>
          )}
        </div>
      </div>

      {/* STATUS LINE */}
      <StatusLine
        cells={[
          ['STATE', strength],
          ['ISSUE 01', `${firstIssue} ITEMS`],
          ['ENVELOPE', envelope],
        ]}
      />
    </div>
  )
}
