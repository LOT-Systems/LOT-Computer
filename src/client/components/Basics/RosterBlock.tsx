/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { SIZING_OPTIONS, RATION_STATES } from './constants'
import type { BasicSubscription, RosterIntakePayload } from '#shared/types'

type Props = {
  subscription: BasicSubscription | null
  onSubmit: (data: RosterIntakePayload) => void
  isLoading: boolean
}

type FieldDef = {
  key: keyof RosterIntakePayload
  label: string
  type: 'text' | 'select'
  options?: string[]
  placeholder?: string
}

const FIELDS: FieldDef[] = [
  { key: 'shippingName',    label: 'NAME',          type: 'text',   placeholder: 'FULL NAME' },
  { key: 'shippingLine1',   label: 'ADDRESS LINE 1',type: 'text',   placeholder: 'STREET ADDRESS' },
  { key: 'shippingLine2',   label: 'ADDRESS LINE 2',type: 'text',   placeholder: 'APT / UNIT (OPTIONAL)' },
  { key: 'shippingCity',    label: 'CITY',           type: 'text',   placeholder: 'CITY' },
  { key: 'shippingState',   label: 'STATE',          type: 'text',   placeholder: 'STATE / PROVINCE' },
  { key: 'shippingZip',     label: 'ZIP',            type: 'text',   placeholder: 'POSTAL CODE' },
  { key: 'shippingCountry', label: 'COUNTRY',        type: 'text',   placeholder: 'US' },
  { key: 'shirtSize',       label: 'SHIRT SIZE',     type: 'select', options: SIZING_OPTIONS.shirt },
  { key: 'shoeSize',        label: 'SHOE SIZE',      type: 'select', options: SIZING_OPTIONS.shoe },
]

export const RosterBlock: React.FC<Props> = ({ subscription, onSubmit, isLoading }) => {
  const isVisible = subscription?.status === RATION_STATES.PENDING ||
                    subscription?.status === RATION_STATES.ON_STRENGTH ||
                    subscription?.status === RATION_STATES.STEADY_STATE

  const [form, setForm] = React.useState<Partial<RosterIntakePayload>>(() => ({
    shippingName:    subscription?.shippingName    ?? '',
    shippingLine1:   subscription?.shippingLine1   ?? '',
    shippingLine2:   subscription?.shippingLine2   ?? '',
    shippingCity:    subscription?.shippingCity    ?? '',
    shippingState:   subscription?.shippingState   ?? '',
    shippingZip:     subscription?.shippingZip     ?? '',
    shippingCountry: subscription?.shippingCountry ?? 'US',
    shirtSize:       subscription?.shirtSize       ?? '',
    shoeSize:        subscription?.shoeSize        ?? '',
  }))

  React.useEffect(() => {
    if (subscription) {
      setForm({
        shippingName:    subscription.shippingName    ?? '',
        shippingLine1:   subscription.shippingLine1   ?? '',
        shippingLine2:   subscription.shippingLine2   ?? '',
        shippingCity:    subscription.shippingCity    ?? '',
        shippingState:   subscription.shippingState   ?? '',
        shippingZip:     subscription.shippingZip     ?? '',
        shippingCountry: subscription.shippingCountry ?? 'US',
        shirtSize:       subscription.shirtSize       ?? '',
        shoeSize:        subscription.shoeSize        ?? '',
      })
    }
  }, [subscription?.id])

  if (!isVisible) return null

  const handleChange = (key: keyof RosterIntakePayload, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form as RosterIntakePayload)
  }

  const isReadOnly = subscription?.status === RATION_STATES.ON_STRENGTH ||
                     subscription?.status === RATION_STATES.STEADY_STATE

  return (
    <div className="lb-border" style={{ marginBottom: '1.5rem' }}>
      <div className="lb-row lb-row-head">
        <div className="lb-cell" style={{ flex: 1, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          ROSTER INTAKE — SIZING & SHIPPING
        </div>
        {isReadOnly && (
          <div className="lb-cell" style={{ fontSize: '0.75rem', opacity: 0.7 }}>ON FILE</div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {FIELDS.map(field => (
          <div
            key={field.key}
            className="lb-row"
            style={{ alignItems: 'stretch' }}
          >
            <div
              className="lb-cell"
              style={{ width: '11rem', flexShrink: 0, fontSize: '0.75rem', opacity: 0.7, alignItems: 'center' }}
            >
              {field.label}
            </div>
            <div className="lb-cell" style={{ flex: 1, padding: 0 }}>
              {field.type === 'select' ? (
                <select
                  className="lb-select"
                  value={form[field.key] ?? ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  disabled={isReadOnly || isLoading}
                  style={{ width: '100%', border: 'none' }}
                >
                  <option value="">— SELECT —</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="lb-input"
                  type="text"
                  value={form[field.key] ?? ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isReadOnly || isLoading}
                  style={{ border: 'none' }}
                />
              )}
            </div>
          </div>
        ))}

        {!isReadOnly && (
          <div style={{ padding: '0.75rem', borderTop: '1px solid #000' }}>
            <button
              type="submit"
              className="lb-btn lb-btn-inv"
              disabled={isLoading}
            >
              {isLoading ? 'SAVING…' : 'CONFIRM ROSTER — ACTIVATE ISSUE'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
