export * as fp from './fp'
export * from './event-emitter'

export const toCelsius = (kelvin: number) => kelvin - 273.15
export const toFahrenheit = (kelvin: number) => toCelsius(kelvin) * 1.8 + 32
