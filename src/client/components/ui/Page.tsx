import React from 'react'
import { cn } from '#client/utils'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Page: React.FC<Props> = ({ className, children, ...props }) => (
  <div
    id="page"
    className={cn(
      'w-full mx-auto desktop:p-64 tablet:p-48 phone:p-32 p-24',
      className
    )}
    {...props}
  >
    {children}
  </div>
)
