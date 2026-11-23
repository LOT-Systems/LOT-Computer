/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / ROSTER INTAKE
 * Sizing, shipping address, cadence start.
 */

import * as React from 'react'
import { firstOfNextMonth } from '#shared/basics'
import { RationRoster } from './types'
import { T, base, inv, row, button } from './tokens'

type Props = {
  onSubmit: (roster: RationRoster) => void
  onCancel: () => void
  loading: boolean
  error: string | null
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const

const inputStyle: React.CSSProperties = {
  ...base,
  border: 'none',
  outline: 'none',
  flex: 1,
  minWidth: 0,
  padding: 0,
}

export function RosterForm({ onSubmit, onCancel, loading, error }: Props) {
  const [line1, setLine1] = React.useState('')
  const [line2, setLine2] = React.useState('')
  const [city, setCity] = React.useState('')
  const [state, setState] = React.useState('')
  const [zip, setZip] = React.useState('')
  const [size, setSize] = React.useState<string>('M')

  const incomplete = !line1.trim() || !city.trim() || !state.trim() || !zip.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (incomplete) return
    onSubmit({
      shippingLine1: line1.trim().toUpperCase(),
      shippingLine2: line2.trim() ? line2.trim().toUpperCase() : null,
      shippingCity: city.trim().toUpperCase(),
      shippingState: state.trim().toUpperCase(),
      shippingZip: zip.trim(),
      clothingSize: size,
    })
  }

  const fields = [
    { label: 'ADDRESS LINE 1', value: line1, set: setLine1, max: 255 },
    { label: 'ADDRESS LINE 2', value: line2, set: setLine2, max: 255 },
    { label: 'CITY', value: city, set: setCity, max: 100 },
    { label: 'STATE', value: state, set: setState, max: 2 },
    { label: 'ZIP', value: zip, set: setZip, max: 10 },
  ]

  return (
    <form onSubmit={handleSubmit} style={base}>
      {fields.map((f) => (
        <label key={f.label} style={row}>
          <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>{f.label}</span>
          <input
            type="text"
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            maxLength={f.max}
            placeholder={f.label === 'ADDRESS LINE 2' ? '(OPTIONAL)' : '________'}
            style={inputStyle}
          />
        </label>
      ))}

      <div style={{ ...row, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>SIZE</span>
        <span style={{ display: 'flex', flexWrap: 'wrap' }}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              style={{ ...(size === s ? inv : base), border: 'none', padding: '0 1ch', cursor: 'pointer' }}
            >
              {s}
            </button>
          ))}
        </span>
      </div>

      <div style={row}>
        <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>CADENCE START</span>
        <span>{firstOfNextMonth()} / MONTHLY</span>
      </div>

      {error && <div style={{ ...inv, padding: '4px 1ch', borderBottom: T.rule }}>ERROR: {error}</div>}

      <div style={{ ...base, display: 'flex', gap: '2ch', padding: '8px 1ch', borderBottom: T.rule, flexWrap: 'wrap' }}>
        <button type="submit" disabled={loading || incomplete} style={button(true, loading || incomplete)}>
          {loading ? 'PROCESSING' : 'CONFIRM ROSTER — USD 100/MO'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} style={button(false, loading)}>
          CANCEL
        </button>
      </div>
      <div style={{ ...base, padding: '4px 1ch', borderBottom: T.rule, fontSize: T.small }}>
        ADDITIVE TO USERSHIP AI PLAN. STAND DOWN AT ANY TIME. RATION DROPS; AI PLAN RETAINED.
      </div>
    </form>
  )
}
