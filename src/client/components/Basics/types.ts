/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 shared types for the Basics module.
 */

export type RationStatus = 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE' | 'STAND_DOWN'

export type RationRoster = {
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingState: string
  shippingZip: string
  clothingSize: string
}

export type RationSubscriptionState = {
  status: RationStatus | 'OPEN_TAB'
  issueCount: number
  lastIssueDate: string | null
  nextIssueDate: string | null
  subscribedAt: string | null
  standDownAt: string | null
  roster: RationRoster | null
  issues: IssueLogEntry[]
}

export type IssueLogEntry = {
  id: string
  no: number
  date: string
  status: 'SCHEDULED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED'
  items: number
  cogsTotal: number
  marginPct: number
  trackingCode: string | null
  dispatchedAt: string | null
}
