export * as fp from './fp.js'
export * from './astrology.js'

export class EventEmitter {
  private listeners: { [key: string]: Function[] } = {}

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data, event))
    }
    // Also emit to wildcard listeners
    if (this.listeners['*']) {
      this.listeners['*'].forEach(callback => callback(data, event))
    }
  }

  listen(event: string, callback: Function) {
    this.on(event, callback)
    return {
      dispose: () => {
        if (this.listeners[event]) {
          this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
        }
      }
    }
  }
}

export function toCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9
}

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}