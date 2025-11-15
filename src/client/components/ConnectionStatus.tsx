import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

export const ConnectionStatus = () => {
  const isConnected = useStore(stores.isConnected)
  const lastUpdate = useStore(stores.lastUpdate)
  const appVersion = useStore(stores.appVersion)

  if (isConnected) {
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
        New version {appVersion ? `(v${appVersion})` : ''} in progress
      </div>
      <div className="text-xs mt-1">
        Last update: {formatDate(lastUpdate)} • Check back later
      </div>
    </div>
  )
}
