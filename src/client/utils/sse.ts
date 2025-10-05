export async function listenSSE<T>(url: string, onMessage: (data: T) => void) {
  let sse: EventSource
  let retryTime = 1000
  const maxRetryTime = 16000

  function connect() {
    sse = new EventSource(url)

    sse.onopen = () => {
      retryTime = 1000
    }

    sse.onerror = () => {
      sse.close()
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
