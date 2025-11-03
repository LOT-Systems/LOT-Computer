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
