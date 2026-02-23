export class EventEmitter {
    listeners = {};
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}
export const fp = {
    pipe: (...fns) => (x) => fns.reduce((v, f) => f(v), x),
};
export function toCelsius(kelvin) {
    return kelvin - 273.15;
}
