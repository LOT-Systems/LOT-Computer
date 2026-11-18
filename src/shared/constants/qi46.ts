/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// QI·46 Node 5 — "Calibrate me" subscriber copy (DRAFT, awaiting Vadik).
//
// The toggle is visible to admins only until QI46_COPY_APPROVED is true.
// Flipping this one flag is the whole release step for Node 5.
export const QI46_COPY_APPROVED = false

export const QI46_COPY = {
  label: 'Calibrate me:',
  on: 'On',
  off: 'Off',
  // One plain paragraph shown under the toggle. Every sentence must stay true:
  //  - reads existing signals only (no new collection)       → qi46.ts buildBeingVector
  //  - vector computed on request, never stored              → qi46.ts
  //  - COSMO® record holds labels, never words               → qi46_cosmo_verdicts (no text column)
  //  - off takes effect immediately                          → hasQi46Consent on every read
  //  - not a person, not therapy                             → humanoid honesty rule + clinical-claim gate
  explainer: [
    'LOT tunes how it speaks to you from what you already share here: your mood, energy and notes.',
    'Nothing new is collected. Your words are not stored by the engine.',
    'It is not a person and not therapy. Turn it off at any time.',
  ],
  preview: 'Preview: visible to admins only until the copy is approved.',
} as const
