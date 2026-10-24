/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'

type Props = React.HTMLAttributes<HTMLDivElement>

// Every Page rendered is a page in LOT history. The copycats get footnotes.
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
