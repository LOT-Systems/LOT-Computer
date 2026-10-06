/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT-FM-001 / BASIC RATION MODULE — the Basics tab.
 * House style: mono, ground/ink only, inversion-only hierarchy, 2px rules,
 * square corners, no icons. The ledger is the marketing.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import { UserTag } from '#shared/types'
import { STATE_LABEL, baselineState } from '#shared/basics/engine'
import { useBasic } from './basics/useBasic'
import { Enroll } from './basics/Enroll'
import { Bar, Doctrine, IssueSchedule, LedgerHead, ManifestLedger } from './basics/Ledger'

export const Basics: React.FC = () => {
  const me = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const hasUsership = !!me?.tags?.some(
    (t) => t.toLowerCase() === UserTag.Usership.toLowerCase()
  )
  const { basic, card, busy, errors, act } = useBasic(!!me)
  // Until the server record loads, fall back to the tag-derived baseline.
  const state = basic?.state ?? baselineState(hasUsership)

  return (
    <div
      className={cn(
        'flex flex-col font-mono text-[12px] phone:text-[13px] text-acc gap-y-16',
        isMirrorOn && 'text-white'
      )}
    >
      <LedgerHead />
      <Doctrine />

      <div>
        <Bar>STATUS</Bar>
        <div className="grid gap-x-16 pt-4" style={{ gridTemplateColumns: '120px 1fr' }}>
          <span>PLAN</span>
          <span className="uppercase">
            {state === 'ON_STRENGTH' || state === 'STEADY_STATE'
              ? `USERSHIP / AI + BASIC`
              : STATE_LABEL[state]}
          </span>
          <span>RATION</span>
          <span className="uppercase">
            {state === 'STEADY_STATE'
              ? 'STEADY STATE'
              : state === 'ON_STRENGTH'
              ? 'ON STRENGTH — FIRST ISSUE PENDING'
              : state === 'PENDING'
              ? 'PENDING — ROSTER INTAKE REQUIRED'
              : 'NOT ON STRENGTH'}
          </span>
        </div>
      </div>

      {basic?.nextIssue && (
        <div>
          <Bar>NEXT ISSUE {String(basic.issuesDispatched + 1).padStart(2, '0')} — {basic.nextIssue}</Bar>
          <pre className="pt-8 overflow-x-auto leading-[1.5rem]">{card}</pre>
          {basic.dispatches.length > 0 && (
            <div className="pt-8">
              <div className="uppercase font-bold">ISSUE LOG ({basic.dispatches.length})</div>
              {basic.dispatches.map((d) => (
                <div key={d.issue} className="grid gap-x-8 py-4 border-b border-acc" style={{ gridTemplateColumns: '48px 96px 1fr' }}>
                  <span className="tabular-nums">{String(d.issue).padStart(2, '0')}</span>
                  <span>{d.ts.slice(0, 10)}</span>
                  <span className="text-right">{d.tracking}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {me && basic && (
        <div>
          <Bar>UPGRADE / ROSTER</Bar>
          <div className="pt-8">
            <Enroll basic={basic} busy={busy} errors={errors} act={act} />
          </div>
        </div>
      )}

      <ManifestLedger />
      <IssueSchedule />
    </div>
  )
}
