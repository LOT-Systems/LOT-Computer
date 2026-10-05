/**
 * LOT SYSTEMS CORPORATION
 * Shared, short-TTL cache for /api/user-profile.
 *
 * The endpoint runs server-side trait extraction + cohort classification on
 * every call. Several System-tab widgets (Quantum Engine Connect, System
 * Progress) only need the derived archetype / behavioral cohort, so they share
 * one in-flight request and one cached result instead of each fetching.
 */

export interface UserProfileCohort {
  archetype?: string
  behavioralCohort?: string
}

const TTL_MS = 60_000

let cached: { at: number; data: UserProfileCohort | null } | null = null
let inflight: Promise<UserProfileCohort | null> | null = null

export function fetchUserProfileCohort(): Promise<UserProfileCohort | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return Promise.resolve(cached.data)
  if (inflight) return inflight
  inflight = fetch('/api/user-profile')
    .then((res) => res.json())
    .then((data) => {
      const result =
        data && (data.archetype || data.behavioralCohort)
          ? { archetype: data.archetype, behavioralCohort: data.behavioralCohort }
          : null
      cached = { at: Date.now(), data: result }
      return result
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })
  return inflight
}
