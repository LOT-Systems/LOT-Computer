export * as fp from './fp'
export * from './event-emitter'

export const toCelisus = (kelvin: number) => kelvin - 273.15
export const toFarhenheit = (kelvin: number) => toCelisus(kelvin) * 1.8 + 32
