/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

export * as fp from './fp'
export * from './event-emitter'

export const toCelsius = (kelvin: number) => kelvin - 273.15
export const toFahrenheit = (kelvin: number) => toCelsius(kelvin) * 1.8 + 32
