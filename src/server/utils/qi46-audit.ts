/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 Node 3 — COSMO® audit trail (append-only).
 * Stores status + reason codes + calibration labels. Never text.
 * Writes fail soft: if the table is missing (migration not yet run),
 * the verdict is still returned to the caller and nothing breaks.
 */

import { sequelize } from '#server/utils/db'
import { QueryTypes } from 'sequelize'
import type { CosmoAuditRow } from '#server/utils/qi46'

export async function recordCosmoVerdict(
  userId: string,
  row: CosmoAuditRow
): Promise<{ recorded: boolean; id?: number }> {
  try {
    const [res] = (await sequelize.query(
      `INSERT INTO qi46_cosmo_verdicts
        ("userId", status, reasons, risk_level, lead, engine_version, source, created_at)
       VALUES (:userId, :status, :reasons, :riskLevel, :lead, :engineVersion, :source, NOW())
       RETURNING id`,
      {
        replacements: {
          userId,
          status: row.status,
          reasons: JSON.stringify(row.reasons),
          riskLevel: row.riskLevel,
          lead: row.lead,
          engineVersion: row.engineVersion,
          source: row.source,
        },
        type: QueryTypes.INSERT,
      }
    )) as any
    return { recorded: true, id: Number(res?.[0]?.id ?? res?.id) || undefined }
  } catch (err) {
    console.warn('[QI46] COSMO audit write skipped:', (err as Error).message)
    return { recorded: false }
  }
}

export async function listCosmoVerdicts(userId: string, limit = 50) {
  try {
    const rows = await sequelize.query(
      `SELECT id, status, reasons, risk_level, lead, engine_version, source, created_at
         FROM qi46_cosmo_verdicts
        WHERE "userId" = :userId
        ORDER BY created_at DESC
        LIMIT :limit`,
      { replacements: { userId, limit: Math.min(Math.max(limit, 1), 200) }, type: QueryTypes.SELECT }
    )
    const held = rows.filter((r: any) => r.status === 'HELD').length
    return { available: true, total: rows.length, held, cleared: rows.length - held, rows }
  } catch (err) {
    return { available: false, total: 0, held: 0, cleared: 0, rows: [] as unknown[] }
  }
}
