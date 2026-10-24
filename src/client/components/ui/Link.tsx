/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { cn } from '#client/utils'

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement>

export const Link: React.FC<Props> = ({ className, ...rest }) => (
  <a
    className={cn('underline rounded', 'hover:text-acc/80', className)}
    rel={rest.target === '_blank' ? 'noreferrer' : undefined}
    {...rest}
  />
)
