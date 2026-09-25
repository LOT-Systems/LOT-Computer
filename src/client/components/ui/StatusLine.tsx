/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { cn } from '#client/utils'

// IBM 3270-register status line: fixed inverted (black-on-white -> white-on-black)
// token row. Hierarchy comes from inversion alone — no color, no size step, no icon.
// Used by house-style ("Terminal Grid") surfaces such as the Basics ration module.
export type StatusToken = { label: string; value: string }

type Props = {
  tokens: StatusToken[]
  className?: string
}

export const StatusLine: React.FC<Props> = ({ tokens, className }) => (
  <div
    className={cn(
      'flex flex-wrap gap-x-16 gap-y-4 bg-black text-white font-bold',
      'px-8 py-4 text-[13px] leading-[1.4] tracking-wide',
      className
    )}
  >
    {tokens.map((t, i) => (
      <span key={t.label + i}>
        {t.label}: {t.value}
      </span>
    ))}
  </div>
)
