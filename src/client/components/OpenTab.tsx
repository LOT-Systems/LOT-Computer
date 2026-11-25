/**
 * LOT-FM-001 / OPEN TAB — the public, logged-out surface of the BASIC ration.
 * A stranger reads what LOT issues and on what terms. Read-only. No auth, no
 * COGS, no marketing layer: the ledger is the marketing.
 */

import * as React from 'react'
import { PRICE_LINE } from '#shared/basics/manifest'
import { Bar, Doctrine, IssueSchedule, LedgerHead, ManifestLedger } from './basics/Ledger'

export const OpenTab: React.FC = () => {
  React.useEffect(() => {
    document.title = 'LOT® BASIC — OPEN TAB'
  }, [])

  return (
    <div className="w-full max-w-[720px] mx-auto p-16 phone:p-32 flex flex-col font-mono text-[12px] phone:text-[13px] text-acc gap-y-16 leading-[1.5rem]">
      <LedgerHead title="OPEN TAB" />
      <Doctrine />
      <ManifestLedger />
      <IssueSchedule />
      <div>
        <Bar>TERMS</Bar>
        <div className="pt-4 flex flex-col gap-y-4">
          <p>{PRICE_LINE}</p>
          <p>ENROLLMENT IS FROM INSIDE LOT®, BY USERSHIP MEMBERS. STAND DOWN AT ANY TIME.</p>
          <p>STAND DOWN DROPS THE RATION AND RETAINS THE AI.</p>
        </div>
        <div className="pt-8">
          <a href="/basics" className="uppercase underline">ENTER LOT® / BASICS</a>
        </div>
      </div>
    </div>
  )
}
