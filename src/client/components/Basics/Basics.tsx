/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { RATION_STATES } from './constants'
import { DoctrineBlock } from './DoctrineBlock'
import { ManifestLedger } from './ManifestLedger'
import { StatusLine } from './StatusLine'
import { UpgradeBlock } from './UpgradeBlock'
import { RosterBlock } from './RosterBlock'
import { IssueLogBlock } from './IssueLogBlock'
import { NextIssueBlock } from './NextIssueBlock'
import { ManifestCard } from './ManifestCard'
import {
  useBasicSubscription,
  useBasicIssues,
  useUpgradeToBasic,
  useStandDown,
  useRosterIntake,
} from '#client/queries'
import type { RosterIntakePayload } from '#shared/types'

const BASIC_QUERY_KEYS = ['/api/basic/subscription', '/api/basic/issues']

export const Basics: React.FC = () => {
  const [showManifestCard, setShowManifestCard] = React.useState(false)
  const queryClient = useQueryClient()

  const invalidate = () => {
    BASIC_QUERY_KEYS.forEach(k => queryClient.invalidateQueries([k]))
  }

  const { data: subscription = null, isLoading: subLoading } = useBasicSubscription()
  const { data: issues = [] } = useBasicIssues()

  const { mutate: upgrade,     isLoading: upgrading }    = useUpgradeToBasic({ onSuccess: invalidate })
  const { mutate: standDown,   isLoading: standingDown } = useStandDown({ onSuccess: invalidate })
  const { mutate: rosterIntake, isLoading: rostering }   = useRosterIntake({ onSuccess: invalidate })

  const state      = subscription?.status ?? RATION_STATES.USERSHIP
  const nextIssue  = issues.find(i => i.status === 'SCHEDULED') ?? null
  const pastIssues = issues.filter(i => i.status !== 'SCHEDULED')

  const isActionLoading = upgrading || standingDown || rostering || subLoading

  const handleUpgrade = () => upgrade(undefined)

  const handleStandDown = () => {
    if (!window.confirm('STAND DOWN: DROP RATION, RETAIN AI PLAN?')) return
    standDown(undefined)
  }

  const handleRosterIntake = (data: RosterIntakePayload) => rosterIntake(data)

  return (
    <div
      className="lot-basic"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        padding: '1.5rem',
        paddingBottom: '0',
      }}
    >
      {/* ── HEADER ── */}
      <div
        className="lb-inv lb-rule-b"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0.75rem',
          marginBottom: '1.5rem',
          marginLeft: '-1.5rem',
          marginRight: '-1.5rem',
          marginTop: '-1.5rem',
        }}
      >
        <span style={{ fontSize: '1rem', letterSpacing: '0.12em' }}>
          BASIC / LOT-FM-001
        </span>
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          CIVILIAN RATION SUBSCRIPTION
        </span>
      </div>

      {/* ── MONTH 1: DOCTRINE + MANIFEST ── */}
      <DoctrineBlock />

      {/* ── MONTH 2: UPGRADE STATE MACHINE ── */}
      <UpgradeBlock
        subscription={subscription}
        onUpgrade={handleUpgrade}
        onStandDown={handleStandDown}
        isLoading={isActionLoading}
      />

      {/* ── MONTH 2: ROSTER INTAKE ── */}
      <RosterBlock
        subscription={subscription}
        onSubmit={handleRosterIntake}
        isLoading={rostering}
      />

      {/* ── MONTH 3: NEXT ISSUE ── */}
      {nextIssue && (
        <NextIssueBlock
          subscription={subscription}
          nextIssue={nextIssue}
          onPrintManifest={() => setShowManifestCard(true)}
        />
      )}

      {/* ── MONTH 1: 23-ITEM MANIFEST LEDGER ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="lb-section-head lb-inv" style={{ marginBottom: '0' }}>
          RATION LOAD / 23 ITEMS
        </div>
        <ManifestLedger />
      </div>

      {/* ── MONTH 3: ISSUE LOG ── */}
      {pastIssues.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="lb-section-head lb-inv" style={{ marginBottom: '0' }}>
            ISSUE LOG
          </div>
          <IssueLogBlock issues={pastIssues} />
        </div>
      )}

      {/* ── STATUS LINE ── */}
      <div style={{ marginTop: 'auto', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
        <StatusLine
          state={state}
          nextIssue={nextIssue?.issuedAt
            ? new Date(nextIssue.issuedAt).toISOString().slice(0, 10)
            : null}
          issueCount={pastIssues.length}
        />
      </div>

      {/* ── MONTH 3: MANIFEST CARD OVERLAY ── */}
      {showManifestCard && subscription && nextIssue && (
        <ManifestCard
          subscription={subscription}
          issue={nextIssue}
          onClose={() => setShowManifestCard(false)}
        />
      )}
    </div>
  )
}
