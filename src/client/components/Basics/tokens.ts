/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / TERMINAL TOKENS — BASICS MODULE
 *
 * House style, non-negotiable: LiberationMono-Bold, white ground / black ink,
 * inversion-only hierarchy, 2px rules, square corners, fixed character grid.
 * No gray fills. No color. No radius. No icons. Emphasis = inversion.
 */

import type * as React from 'react'

export const T = {
  bg: '#ffffff',
  ink: '#000000',
  rule: '2px solid #000000',
  font: "'Liberation Mono', 'LiberationMono-Bold', 'Courier New', Courier, monospace",
  size: '13px',
  small: '11px',
  lineH: '1.5',
  /** Fixed character grid: label column width in characters. */
  labelCh: '16ch',
} as const

export const base: React.CSSProperties = {
  fontFamily: T.font,
  fontWeight: 700,
  fontSize: T.size,
  lineHeight: T.lineH,
  color: T.ink,
  background: T.bg,
  textTransform: 'uppercase',
  letterSpacing: 0,
  borderRadius: 0,
}

/** Inverted block: the only hierarchy device. */
export const inv: React.CSSProperties = { ...base, background: T.ink, color: T.bg }

export const row: React.CSSProperties = {
  ...base,
  display: 'flex',
  gap: '2ch',
  padding: '4px 1ch',
  borderBottom: T.rule,
}

export const button = (primary: boolean, disabled: boolean): React.CSSProperties => ({
  ...(primary ? inv : base),
  padding: '6px 2ch',
  border: T.rule,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
})
