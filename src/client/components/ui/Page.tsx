import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Page: React.FC<Props> = ({ className, children, ...props }) => {
  const isMirrorOn = useStore(stores.isMirrorOn)

  return (
    <div
      id="page"
      className={cn(
        'w-full mx-auto desktop:p-64 tablet:p-48 phone:p-32 p-16',
        isMirrorOn && 'text-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
