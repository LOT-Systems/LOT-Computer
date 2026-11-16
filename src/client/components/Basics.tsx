/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASICS tab / OPEN TAB.
// Month 1: read-only ledger. Same component serves the in-app tab (/basics,
// logged in) and the public surface (/basics, logged out). No layer between
// the public and the manifest.

import * as React from 'react'
import {
  BASIC_DOCTRINE,
  BASIC_FM,
  BASIC_PHASE,
  BASIC_PRICE_LINE,
  CADENCE_LABEL,
  RATION_MANIFEST,
  isDue,
} from '#shared/constants/basic'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const pad2 = (n: number) => String(n).padStart(2, '0')

const stamp = (d: Date) =>
  `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}Z`

/** IBM 3270 operator-information line. Inverted. One line, fixed fields. */
export const BasicStatusLine: React.FC = () => {
  const [now, setNow] = React.useState(() => new Date())
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="lb-status lb-inv" role="status">
      <span>PHASE {pad2(BASIC_PHASE.month)}/03</span>
      <span>{BASIC_PHASE.name}</span>
      <span>STATE {BASIC_PHASE.state}</span>
      <span>NEXT ISSUE {BASIC_PHASE.nextIssue}</span>
      <span className="lb-status-end">{stamp(now)}</span>
    </div>
  )
}

const Section: React.FC<{ code: string; title: string; children: React.ReactNode }> = ({
  code,
  title,
  children,
}) => (
  <section className="lb-section">
    <div className="lb-section-head">
      <span className="lb-inv lb-code">{code}</span>
      <span>{title}</span>
    </div>
    <div className="lb-section-body">{children}</div>
  </section>
)

type Props = { publicView?: boolean }

export const Basics: React.FC<Props> = ({ publicView = false }) => {
  const sizedCount = RATION_MANIFEST.filter((i) => i.sized).length

  return (
    <div className="lot-basic">
      <header className="lb-head lb-inv">
        <span>LOT® BASICS</span>
        <span>{BASIC_FM} · OPEN TAB</span>
      </header>

      <BasicStatusLine />

      <Section code="1" title="DOCTRINE">
        <ol className="lb-doctrine">
          {BASIC_DOCTRINE.map((line, i) => (
            <li key={i}>
              <span className="lb-dim">{pad2(i + 1)}</span> {line}
            </li>
          ))}
        </ol>
      </Section>

      <Section code="2" title="TERMS">
        <div className="lb-price lb-rule">{BASIC_PRICE_LINE}</div>
        <div className="lb-dim lb-note">
          ONE ISSUE PER MONTH. LOAD ROTATES PER CADENCE BELOW. {sizedCount} LINES
          ARE SIZED AT ROSTER INTAKE.
        </div>
      </Section>

      <Section code="3" title={`MANIFEST — ${RATION_MANIFEST.length} LINES`}>
        <div className="lb-scroll">
          <table className="lb-ledger">
            <thead>
              <tr className="lb-inv">
                <th>SEQ</th>
                <th className="lb-l">NOMENCLATURE</th>
                <th>QTY</th>
                <th className="lb-l">UNIT</th>
                <th className="lb-l">CLASS</th>
                <th className="lb-l">CADENCE</th>
                {MONTHS.map((m) => (
                  <th key={m} className="lb-m">{pad2(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATION_MANIFEST.map((item) => (
                <tr key={item.seq}>
                  <td>{item.seq}</td>
                  <td className="lb-l">
                    {item.nomenclature}
                    {item.sized && <span className="lb-dim"> *</span>}
                  </td>
                  <td>{item.qty}</td>
                  <td className="lb-l">{item.unit}</td>
                  <td className="lb-l">{item.cls}</td>
                  <td className="lb-l">{CADENCE_LABEL[item.every]}</td>
                  {MONTHS.map((m) => (
                    <td key={m} className="lb-m">
                      {isDue(item, m) ? '■' : <span className="lb-dim">·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lb-dim lb-note">
          * SIZED AT ROSTER. COLUMNS 01–12 = ISSUE NUMBER FROM ON STRENGTH. ■ = IN LOAD.
        </div>
      </Section>

      <Section code="4" title="UPGRADE">
        <div className="lb-upgrade">
          <span>USERSHIP</span>
          <span className="lb-dim">→</span>
          <span>PENDING</span>
          <span className="lb-dim">→</span>
          <span>ON STRENGTH</span>
          <span className="lb-dim">→</span>
          <span>STEADY STATE</span>
        </div>
        <div className="lb-note">
          {publicView ? (
            <>
              ROSTER CLOSED. UPGRADE OPENS PHASE 02. USERSHIP REQUIRED.{' '}
              <a className="lb-link lb-inv" href="/">ENTER LOT</a>
            </>
          ) : (
            <>ROSTER CLOSED. UPGRADE OPENS PHASE 02. NO ACTION REQUIRED.</>
          )}
        </div>
      </Section>

      <footer className="lb-foot lb-rule">
        <span>LOT SYSTEMS · MADE IN THE USA</span>
        <span className="lb-dim">END OF MANIFEST</span>
      </footer>
    </div>
  )
}
