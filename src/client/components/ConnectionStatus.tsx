import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

export const ConnectionStatus = () => {
  const isConnected = useStore(stores.isConnected)
  const lastUpdate = useStore(stores.lastUpdate)
  const appVersion = useStore(stores.appVersion)
  const [hasConnectedOnce, setHasConnectedOnce] = React.useState(false)

  // Track if we've successfully connected at least once
  React.useEffect(() => {
    if (isConnected && !hasConnectedOnce) {
      setHasConnectedOnce(true)
    }
  }, [isConnected, hasConnectedOnce])

  // Only show banner if we've connected once and then lost connection
  // This prevents flashing during initial page load
  if (isConnected || !hasConnectedOnce) {
    return null
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown'
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-3 text-center font-medium">
      <div className="text-sm">
        Connection lost • Attempting to reconnect...
      </div>
      <div className="text-xs mt-1">
        Last update: {formatDate(lastUpdate)}
      </div>
    </div>
  )
}
