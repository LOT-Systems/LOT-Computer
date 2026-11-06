import { atom } from 'nanostores'

/** Pre-fills the Sync email composer (set by Cohort Connect → "Email"). */
export const emailComposeTo = atom<{ id: string; name: string } | null>(null)
