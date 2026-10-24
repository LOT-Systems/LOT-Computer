/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

export type ClientTheme =
  | 'dark'
  | 'light'
  | 'custom'
  | 'sunrise'
  | 'sunset'
  | 'fill_blue'
  | 'light_red'

export type ClientThemeMode = 'light' | 'dark'

export enum LayoutView {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

export type ClientEvents = {
  change_theme: { theme: ClientTheme }
  reset_theme: null
}
