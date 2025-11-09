import React from 'react'
import { cn } from '#client/utils'

export const P: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => <p className={cn('my-16', className)} {...props} />

export const ErrorLine: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  ...props
}) => <span className={cn('text-red', className)} {...props} />

export const Unknown: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  ...props
}) => (
  <span className={cn('text-acc/40', className)} {...props}>
    {props.children || 'Unknown'}
  </span>
)
