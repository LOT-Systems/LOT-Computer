type Listener<T, K = string> = (data: T, type: K) => void
type AnyEvent<Events> = {
  [K in keyof Events]: { type: K; data: Events[K] }
}[keyof Events]
type Disposable = {
  dispose: () => void
}

export class EventEmitter<Events> {
  private listeners: { [K in keyof Events]?: Listener<Events[K], K>[] } = {}
  private universalListeners: Listener<
    AnyEvent<Events>['data'],
    keyof Events
  >[] = []

  listen<K extends keyof Events>(
    type: K,
    listener: Listener<Events[K], K>
  ): Disposable
  listen(
    type: '*',
    listener: Listener<AnyEvent<Events>['data'], keyof Events>
  ): Disposable
  listen<K extends keyof Events>(
    type: K | '*',
    listener:
      | Listener<Events[K], K>
      | Listener<AnyEvent<Events>['data'], keyof Events>
  ): Disposable {
    if (type === '*') {
      this.universalListeners.push(
        listener as Listener<AnyEvent<Events>['data'], keyof Events>
      )
      return {
        dispose: () => {
          this.universalListeners = this.universalListeners.filter(
            (l) => l !== listener
          )
        },
      }
    } else {
      if (!this.listeners[type]) {
        this.listeners[type] = []
      }
      this.listeners[type]!.push(listener as Listener<Events[K], K>)
      return {
        dispose: () => {
          this.listeners[type] = this.listeners[type]!.filter(
            (l) => l !== listener
          )
        },
      }
    }
  }

  emit<K extends keyof Events>(type: K, data: Events[K]): void {
    this.listeners[type]?.forEach((listener) => {
      listener(data, type)
    })
    this.universalListeners.forEach((listener) => {
      const handler = listener as Listener<
        AnyEvent<Events>['data'],
        keyof Events
      >
      handler(data, type)
    })
  }
}
