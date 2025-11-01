import * as React from 'react'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useStore } from '@nanostores/react'
import { getMe, useWeather } from '#client/queries'
import * as stores from '#client/stores'
import { Layout } from '#client/components/ui'
import { System } from '#client/components/System'
import { Settings } from '#client/components/Settings'
import { Logs } from '#client/components/Logs'
import { Sync } from '#client/components/Sync'
import { render } from '#client/utils/render'
import { listenSSE } from '#client/utils/sse'
import { useSun } from '#client/utils/sun'
import { useMirror } from '#client/utils/mirror'
import { sync } from '../sync'

sync.listen('users_total', (data) => {
  stores.usersTotal.set(data.value)
})
sync.listen('users_online', (data) => {
  stores.usersOnline.set(data.value)
})
sync.listen('live_message', (data) => {
  stores.liveMessage.set(data.message)
})

const queryClient = new QueryClient()

const App = () => {
  const mirrorRef = React.useRef<HTMLVideoElement>(null)
  const user = useStore(stores.me)
  const router = useStore(stores.router)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const { data: weather, refetch: refetchWeather } = useWeather()

  const isLoaded = React.useMemo(() => {
    return !!user && weather !== undefined
  }, [user, weather])

  React.useEffect(() => {
    // Initialize router to listen to URL changes
    const unbindRouter = stores.router.listen(() => {})

    getMe().then((user) => {
      stores.me.set(user)
      if (!user.firstName && !user.lastName) {
        stores.goTo('settings')
      }
    })
    listenSSE('/api/sync', (data: any) => {
      sync.emit(data.event, data.data)
    })

    return () => {
      unbindRouter()
    }
  }, [])

  React.useEffect(() => {
    if (weather !== undefined) {
      stores.weather.set(weather)
    }
  }, [weather])

  useSun(weather || null, refetchWeather)

  useMirror(mirrorRef, isMirrorOn)

  if (!isLoaded) {
    return <Layout>Loading...</Layout>
  }

  return (
    <Layout>
      {(!router || router.route === 'system') && <System />}
      {router?.route === 'settings' && <Settings />}
      {router?.route === 'sync' && <Sync />}
      {router?.route === 'logs' && <Logs />}
      {isMirrorOn && (
        <video
          ref={mirrorRef}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-cover fixed inset-0 -z-10 -scale-x-100"
        />
      )}
    </Layout>
  )
}

render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
