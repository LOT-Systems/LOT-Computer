/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 shared client types for the Basics module.
 */

export type RationStatus = 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE' | 'STAND_DOWN'
export type RationViewStatus = RationStatus | 'OPEN_TAB'

export type RationRoster = {
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingState: string
  shippingZip: string
  clothingSize: string
}

export type IssueLogEntry = {
  id: string
  no: number
  date: string
  status: 'SCHEDULED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED'
  items: number
  trackingCode: string | null
  dispatchedAt: string | null
}

export type RationSubscriptionState = {
  status: RationViewStatus
  /** Usership (AI plan) members may upgrade. Others read the ledger only. */
  eligible: boolean
  billing: 'NONE' | 'AWAITING_PROVIDER' | 'ACTIVE'
  issueCount: number
  lastIssueDate: string | null
  nextIssueDate: string | null
  subscribedAt: string | null
  standDownAt: string | null
  roster: RationRoster | null
  issues: IssueLogEntry[]
}
