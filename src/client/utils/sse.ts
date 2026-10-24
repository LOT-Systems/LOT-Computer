/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

export interface SSEOptions<T> {
  onMessage: (data: T) => void
  onOpen?: () => void
  onError?: () => void
}

export async function listenSSE<T>(
  url: string,
  onMessage: (data: T) => void,
  options?: { onOpen?: () => void; onError?: () => void }
) {
  let sse: EventSource
  let retryTime = 1000
  const maxRetryTime = 16000

  function connect() {
    sse = new EventSource(url)

    sse.onopen = () => {
      retryTime = 1000
      options?.onOpen?.()
    }

    sse.onerror = () => {
      sse.close()
      options?.onError?.()
      // exponential backoff
      setTimeout(connect, retryTime)
      retryTime = Math.min(maxRetryTime, retryTime * 2)
    }

    sse.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data))
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }
  }

  connect()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!sse || sse.readyState === EventSource.CLOSED) {
        connect()
      }
    } else {
      if (sse) {
        sse.close()
      }
    }
  })
}
