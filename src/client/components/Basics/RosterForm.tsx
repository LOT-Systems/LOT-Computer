/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / ROSTER INTAKE
 * Sizing, shipping address, cadence start.
 */

import * as React from 'react'
import { RationRoster } from './types'

const T = {
  ink:      '#000000',
  bg:       '#ffffff',
  rule:     '2px solid #000000',
  ruleHalf: '1px solid #000000',
  dimBg:    '#f9f9f9',
  font:     "'Liberation Mono', 'Lucida Console', 'Courier New', Courier, monospace",
  size:     '13px',
  lineH:    '1.5',
} as const

const base: React.CSSProperties = {
  fontFamily:    T.font,
  fontSize:      T.size,
  lineHeight:    T.lineH,
  color:         T.ink,
  background:    T.bg,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.03em',
  borderRadius:  0,
}

const fieldStyle: React.CSSProperties = {
  ...base,
  border: T.rule,
  padding: '5px 8px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

type Props = {
  onSubmit: (roster: RationRoster) => void
  loading: boolean
  error: string | null
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const

export function RosterForm({ onSubmit, loading, error }: Props) {
  const [line1, setLine1]   = React.useState('')
  const [line2, setLine2]   = React.useState('')
  const [city, setCity]     = React.useState('')
  const [state, setState]   = React.useState('')
  const [zip, setZip]       = React.useState('')
  const [size, setSize]     = React.useState<string>('M')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!line1.trim() || !city.trim() || !state.trim() || !zip.trim() || !size) return

    onSubmit({
      shippingLine1: line1.trim().toUpperCase(),
      shippingLine2: line2.trim() ? line2.trim().toUpperCase() : null,
      shippingCity:  city.trim().toUpperCase(),
      shippingState: state.trim().toUpperCase(),
      shippingZip:   zip.trim(),
      clothingSize:  size,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...base }}>
      <div style={{ ...base, fontWeight: 700, padding: '5px 12px', borderBottom: T.rule, background: T.dimBg, letterSpacing: '0.08em' }}>
        ROSTER INTAKE — SHIPPING + SIZING
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0', padding: '0' }}>
        {[
          { label: 'ADDRESS LINE 1 *', value: line1, setter: setLine1, placeholder: '123 MAIN ST', required: true },
          { label: 'ADDRESS LINE 2',   value: line2, setter: setLine2, placeholder: 'APT 4B (OPTIONAL)', required: false },
          { label: 'CITY *',           value: city,  setter: setCity,  placeholder: 'CITY',  required: true },
          { label: 'STATE *',          value: state, setter: setState, placeholder: 'CA',   required: true },
          { label: 'ZIP CODE *',       value: zip,   setter: setZip,   placeholder: '90210', required: true },
        ].map((f, i) => (
          <div key={f.label} style={{ display: 'flex', borderBottom: T.ruleHalf }}>
            <label style={{ ...base, minWidth: '168px', flexShrink: 0, padding: '5px 12px', background: T.dimBg, borderRight: T.ruleHalf }}>
              {f.label}
            </label>
            <input
              type="text"
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
              maxLength={f.label.startsWith('STATE') ? 2 : undefined}
              style={{ ...fieldStyle, border: 'none', flex: 1, background: i % 2 === 0 ? T.bg : T.dimBg }}
            />
          </div>
        ))}

        {/* Clothing size */}
        <div style={{ display: 'flex', borderBottom: T.ruleHalf }}>
          <span style={{ ...base, minWidth: '168px', flexShrink: 0, padding: '5px 12px', background: T.dimBg, borderRight: T.ruleHalf }}>
            CLOTHING SIZE *
          </span>
          <div style={{ display: 'flex', gap: '8px', padding: '5px 10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                style={{
                  ...base,
                  padding: '2px 8px',
                  border: T.rule,
                  background: size === s ? T.ink : T.bg,
                  color:      size === s ? T.bg  : T.ink,
                  cursor: 'pointer',
                  fontWeight: size === s ? 700 : 400,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ ...base, padding: '5px 12px', borderTop: T.ruleHalf, color: '#c00', fontWeight: 700 }}>
          ERROR: {error}
        </div>
      )}

      <div style={{ padding: '10px 12px', borderTop: T.rule }}>
        <button
          type="submit"
          disabled={loading || !line1 || !city || !state || !zip}
          style={{
            ...base,
            background: T.ink,
            color: T.bg,
            border: T.rule,
            padding: '7px 20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            opacity: (loading || !line1 || !city || !state || !zip) ? 0.5 : 1,
            letterSpacing: '0.08em',
          }}
        >
          {loading ? 'PROCESSING...' : 'CONFIRM — JOIN STRENGTH / USD 100/MO'}
        </button>
        <div style={{ ...base, marginTop: '6px', opacity: 0.45, fontSize: '11px' }}>
          ADDITIVE TO USERSHIP AI PLAN. STAND DOWN AT ANY TIME. RATION DROPS; AI PLAN RETAINED.
        </div>
      </div>
    </form>
  )
}
