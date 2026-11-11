/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * localStorage accessors that never throw. Safari private mode, sandboxed
 * iframes and blocked site data make `localStorage` throw on access; a bare
 * read inside a widget render would otherwise crash the widget's boundary.
 */
export function safeGetItem(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
  } catch {
    // storage unavailable — preference simply isn't persisted
  }
}

export function isInvestorMode(): boolean {
  return safeGetItem('lot-investor-mode') === 'true'
}
