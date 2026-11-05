/**
 * LOT SYSTEMS CORPORATION
 * BASICS — OPEN TAB (LOT-FM-001 REV A, §4–§5). Read-only public ledger.
 * Terminal grid: white ground, black ink, inversion-only hierarchy,
 * 2px rules, square corners, one font/weight/size, no color, no icons.
 */

import * as React from 'react'
import {
  RATION_ITEMS,
  BASIC_PRICE_LINE,
  DOCTRINE,
  TERMS,
  MANIFEST_CLASS_DEFS,
} from '#shared/constants/basics'

export type BasicsAudience = 'PUBLIC' | 'USERSHIP' | 'BASIC'

const TOKENS = `
.lot-basics{--lot-bg:#fff;--lot-ink:#000;--lot-rule:2px solid #000;--lot-pad:6px;
  background:var(--lot-bg);color:var(--lot-ink);
  font-family:"LiberationMono-Bold","Liberation Mono",ui-monospace,Menlo,Consolas,monospace;
  font-weight:700;font-size:14px;line-height:24px;border-radius:0;
  min-height:100vh;padding:16px;box-sizing:border-box;text-transform:uppercase}
.lot-basics *{border-radius:0;box-shadow:none;font:inherit}
.lot-basics .inv{background:#000;color:#fff;padding:0 var(--lot-pad)}
.lot-basics .rule{border:0;border-top:var(--lot-rule);margin:24px 0 0}
.lot-basics .row{display:grid;grid-template-columns:5ch 36ch 12ch 1fr;column-gap:2ch;white-space:pre}
.lot-basics .scroll{overflow-x:auto}
.lot-basics .cur{animation:lotblink 1s steps(1) infinite}
@keyframes lotblink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.lot-basics .cur{animation:none}}
`

const Rule = () => <hr className="rule" />

const Status = ({ audience }: { audience: BasicsAudience }) => {
  const tier =
    audience === 'BASIC' ? 'BASIC (RATION)' : audience === 'USERSHIP' ? 'USERSHIP/AI' : 'PUBLIC'
  return (
    <div className="inv" role="status">
      {audience === 'BASIC' ? 'ON STRENGTH' : 'OFF STRENGTH'} | NEXT ISSUE: --- | TIER: {tier}
    </div>
  )
}

export const Basics: React.FC<{ audience?: BasicsAudience }> = ({
  audience = 'PUBLIC',
}) => {
  return (
    <div className="lot-basics" data-audience={audience}>
      <style>{TOKENS}</style>
      <Status audience={audience} />

      <Rule />
      <div>LOT BASICS // OPEN TAB // LOT-FM-001 REV A</div>
      <div>CLASS: UNRESTRICTED. READ-ONLY.</div>

      <Rule />
      <div className="inv">DOCTRINE</div>
      {DOCTRINE.map((l) => (
        <div key={l}>{l}</div>
      ))}

      <Rule />
      <div className="inv">PRICE</div>
      <div>{BASIC_PRICE_LINE}</div>
      <div>ADD-ON TO USERSHIP (AI). BILLED MONTHLY.</div>

      <Rule />
      <div className="inv">MANIFEST // 23 LINES</div>
      <div className="scroll">
        <div className="row inv" style={{ padding: 0 }}>
          <span>ITEM</span>
          <span>NOMENCLATURE</span>
          <span>CLASS</span>
          <span>ISSUE CADENCE</span>
        </div>
        {RATION_ITEMS.map((i) => (
          <div className="row" key={i.id}>
            <span>{i.id}</span>
            <span>{i.nomenclature}</span>
            <span>{i.cls}</span>
            <span>{i.cadence}</span>
          </div>
        ))}
      </div>
      <div>
        {(Object.keys(MANIFEST_CLASS_DEFS) as (keyof typeof MANIFEST_CLASS_DEFS)[]).map(
          (k) => (
            <div key={k}>
              {k}: {MANIFEST_CLASS_DEFS[k]}
            </div>
          )
        )}
      </div>

      <Rule />
      <div className="inv">TERMS</div>
      {TERMS.map(([k, v]) => (
        <div key={k}>
          {k}: {v}
        </div>
      ))}

      <Rule />
      <div className="inv">UPGRADE</div>
      <div>
        {audience === 'PUBLIC'
          ? 'USERSHIP (AI) REQUIRED. SIGN IN TO CONTINUE.'
          : audience === 'USERSHIP'
            ? 'UPGRADE → BASIC: NOT YET ISSUED.'
            : 'ON STRENGTH.'}
      </div>
      <div>
        THIS IS BETWEEN US.<span className="cur">_</span>
      </div>
    </div>
  )
}
