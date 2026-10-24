/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Agent Decision Ledger — Append-Only Transparency Layer
 *
 * Every agent action follows: INPUT → CLASSIFY → ACTION → RECORD
 * The record is written BEFORE the action commits.
 * A service that mutates state without a ledger row is a bug, not a feature.
 */

import { sequelize } from '#server/utils/db'
import { QueryTypes } from 'sequelize'

// =============================================================================
// TYPES
// =============================================================================

export type ActionClass =
  | 'read'           // no side effects
  | 'write'          // mutates local state
  | 'notify'         // sends email, push, etc.
  | 'financial'      // moves money
  | 'irreversible'   // cannot be undone — requires human gate
  | 'external'       // calls external API

export type GateStatus =
  | 'auto'           // executed without human confirmation
  | 'pending'        // awaiting human gate
  | 'approved'       // human approved
  | 'denied'         // human denied
  | 'expired'        // gate timed out

export interface LedgerEntry {
  source: string
  input: string
  classification: ActionClass
  action: string
  gate: GateStatus
  result?: string
  metadata?: Record<string, unknown>
  userId?: string
  durationMs?: number
}

// Actions that require explicit human sign-off before execution
const GATED_CLASSES: ActionClass[] = ['financial', 'irreversible', 'notify']

// =============================================================================
// LEDGER WRITE
// =============================================================================

export async function recordAction(entry: LedgerEntry): Promise<number> {
  const row = await sequelize.query(
    `INSERT INTO agent_ledger
      (timestamp, source, input, classification, action, gate, result, metadata, "userId", duration_ms)
     VALUES
      (NOW(), :source, :input, :classification, :action, :gate, :result, :metadata, :userId, :durationMs)
     RETURNING id`,
    {
      replacements: {
        source: entry.source,
        input: truncate(entry.input, 2000),
        classification: entry.classification,
        action: truncate(entry.action, 500),
        gate: entry.gate,
        result: truncate(entry.result || '', 2000),
        metadata: JSON.stringify(entry.metadata || {}),
        userId: entry.userId || null,
        durationMs: entry.durationMs || null,
      },
      type: QueryTypes.INSERT,
    }
  )
  return (row as any)[0]?.[0]?.id ?? 0
}

// =============================================================================
// GATE CHECK
// =============================================================================

export function requiresGate(classification: ActionClass): boolean {
  return GATED_CLASSES.includes(classification)
}

export function classifyAction(action: string): ActionClass {
  const lower = action.toLowerCase()
  if (/payment|charge|refund|transfer|invoice/.test(lower)) return 'financial'
  if (/delete|drop|purge|revoke|ban/.test(lower)) return 'irreversible'
  if (/email|sms|push|notify|alert/.test(lower)) return 'notify'
  if (/fetch|api|webhook|external/.test(lower)) return 'external'
  if (/create|update|insert|write|set/.test(lower)) return 'write'
  return 'read'
}

// =============================================================================
// KILL SWITCH
// =============================================================================

let agentLoopActive = true

export function killAgentLoop(): void {
  agentLoopActive = false
  console.error('[LEDGER] KILL SWITCH ENGAGED — all agent loops halted')
}

export function resumeAgentLoop(): void {
  agentLoopActive = true
  console.error('[LEDGER] Agent loops resumed')
}

export function isAgentLoopActive(): boolean {
  return agentLoopActive
}

// =============================================================================
// QUERY
// =============================================================================

export async function getRecentActions(limit: number = 50): Promise<any[]> {
  const [rows] = await sequelize.query(
    `SELECT * FROM agent_ledger ORDER BY id DESC LIMIT :limit`,
    { replacements: { limit }, type: QueryTypes.SELECT }
  )
  return rows ? [rows] : []
}

export async function getGatedActions(): Promise<any[]> {
  const rows = await sequelize.query(
    `SELECT * FROM agent_ledger WHERE gate = 'pending' ORDER BY id ASC`,
    { type: QueryTypes.SELECT }
  )
  return rows
}

export async function approveAction(id: number): Promise<void> {
  await sequelize.query(
    `UPDATE agent_ledger SET gate = 'approved' WHERE id = :id AND gate = 'pending'`,
    { replacements: { id }, type: QueryTypes.UPDATE }
  )
}

export async function denyAction(id: number): Promise<void> {
  await sequelize.query(
    `UPDATE agent_ledger SET gate = 'denied' WHERE id = :id AND gate = 'pending'`,
    { replacements: { id }, type: QueryTypes.UPDATE }
  )
}

// =============================================================================
// UTIL
// =============================================================================

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s
}
