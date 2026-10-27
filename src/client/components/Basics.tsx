/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { renderLedger } from '#shared/basic/ledger'
import { STATUS_LINE } from '#shared/basic/manifest'

/**
 * BASICS — the hardware/physical layer. Month 1: OPEN TAB, read-only ledger.
 * Renders the same manifest the public /basics page serves.
 */
export const Basics: React.FC = () => {
  const ledger = React.useMemo(
    () => renderLedger().split('\n').slice(1).join('\n'),
    []
  )
  return (
    <div className="flex flex-col font-mono font-bold">
      <div className="bg-acc text-bac px-8 whitespace-pre overflow-x-auto">
        {STATUS_LINE()}
      </div>
      <pre className="m-0 mt-8 whitespace-pre overflow-x-auto font-[inherit]">
        {ledger}
      </pre>
    </div>
  )
}
