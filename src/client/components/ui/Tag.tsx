/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React, { useMemo } from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import { Color } from '#shared/types'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  color?: Color
  fill?: boolean
  href?: string
  onClick?: () => void
}

export const Tag: React.FC<Props> = ({
  color = 'blue',
  fill = false,
  href = undefined,
  className,
  ...rest
}) => {
  const isMirrorOn = useStore(stores.isMirrorOn)

  const resultClassName = useMemo(() => {
    // For red color (Suspended tag), use red regardless of theme
    const isRed = color === 'red'

    return cn(
      'rounded px-[6px] py-[2px]',
      'border border-transparent',
      isRed
        ? fill
          ? 'bg-red-600 text-white border-red-600'
          : 'border-red-600 text-red-600'
        : fill
        ? 'bg-acc text-bac'
        : 'border-acc text-acc',
      // Mirror mode: outline tags use white text/border; filled tags keep text-bac (already contrasts)
      isMirrorOn && !isRed && !fill && 'text-white border-white',
      !!(href || rest.onClick) ? 'cursor-pointer' : '',
      !!rest.onClick && 'select-none',
      className
    )
  }, [color, fill, className, href, rest.onClick, isMirrorOn])
  return href ? (
    <a href={href} className={resultClassName} {...rest} />
  ) : (
    <span className={resultClassName} {...rest} />
  )
}

export const TagsContainer: React.FC<{
  className?: string
  items: React.ReactNode[]
}> = ({ className, items }) => (
  <div className={cn('flex flex-wrap gap-x-4 gap-y-4', className)}>
    {items.map((x, i) => (
      <div key={i}>{x}</div>
    ))}
  </div>
)
