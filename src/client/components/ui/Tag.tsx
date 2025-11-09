import React, { useMemo } from 'react'
import { cn } from '#client/utils'
import { Color } from '#shared/types'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  color?: Color
  fill?: boolean
  href?: string
  onClick?: () => void
}

export const Tag: React.FC<Props> = ({
  color = 'gray',
  fill = false,
  href = null,
  className,
  ...rest
}) => {
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
      !!(href || rest.onClick) ? 'cursor-pointer' : '',
      !!rest.onClick && 'select-none',
      className
    )
  }, [color, fill, className, href, rest.onClick])
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
  <div className={cn('flex flex-wrap gap-x-4', className)}>
    {items.map((x, i) => (
      <div key={i}>{x}</div>
    ))}
  </div>
)
