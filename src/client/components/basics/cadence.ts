/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC RATION MODULE
 * Cadence math — pure, no side effects. Month 3 fulfillment reads the same
 * NEXT ISSUE date this computes; nothing here claims a box has shipped.
 */

// Default cadence start offered on the intake form: the 1st of next month.
export function nextCadenceDefault(today: Date = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return d.toISOString().slice(0, 10)
}

// Next issue date on or after `today`, stepping monthly from `cadenceStart`.
export function nextIssueDate(cadenceStart: string, today: Date = new Date()): string {
  const start = new Date(cadenceStart + 'T00:00:00Z')
  if (Number.isNaN(start.getTime())) return cadenceStart

  const cursor = new Date(start)
  // Guard against a malformed/ancient cadenceStart driving an unbounded loop.
  for (let i = 0; i < 1200 && cursor.getTime() < today.getTime(); i++) {
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return cursor.toISOString().slice(0, 10)
}
