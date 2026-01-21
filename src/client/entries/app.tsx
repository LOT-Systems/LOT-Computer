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
import { DirectMessageThread } from '#client/components/DirectMessageThread'
import { StatusPage } from '#client/components/StatusPage'
import { ApiPage } from '#client/components/ApiPage'
import { ConnectionStatus } from '#client/components/ConnectionStatus'
import { render } from '#client/utils/render'
import { listenSSE } from '#client/utils/sse'
import { useSun } from '#client/utils/sun'
import { useMirror } from '#client/utils/mirror'
import { useSound } from '#client/utils/sound'
import { useRadio } from '#client/utils/radio'
import { sync } from '../sync'
import { initRecipeWidget } from '#client/stores/recipeWidget'

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
  const isSoundOn = useStore(stores.isSoundOn)
  const isRadioOn = useStore(stores.isRadioOn)

  const { data: weather, refetch: refetchWeather } = useWeather()

  const isLoaded = React.useMemo(() => {
    // Only require user data to load - weather is optional
    // Weather is only used in System and SelfCareMoments components
    return !!user
  }, [user])

  React.useEffect(() => {
    // Initialize router to listen to URL changes
    const unbindRouter = stores.router.listen(() => {})

    // Fetch version info
    fetch('/api/public/status')
      .then((res) => res.json())
      .then((data) => {
        stores.appVersion.set(data.version || '0.0.3')
        stores.lastUpdate.set(new Date())
      })
      .catch(() => {
        stores.appVersion.set('0.0.3')
      })

    getMe().then((user) => {
      stores.me.set(user)

      // Sync theme from user metadata (server) to local stores
      if (user.metadata?.theme) {
        const { theme: themeName, baseColor, accentColor, customThemeEnabled } = user.metadata.theme
        console.log('[App] Syncing theme from server:', themeName, customThemeEnabled)

        // Update theme stores
        if (customThemeEnabled && themeName === 'custom' && baseColor && accentColor) {
          stores.customTheme.set({ base: baseColor, acc: accentColor })
          stores.isCustomThemeEnabled.set(true)
          stores.theme.set('custom')
        } else if (themeName && themeName !== 'custom') {
          stores.isCustomThemeEnabled.set(false)
          stores.theme.set(themeName as any)
        }
      }

      if (!user.firstName && !user.lastName) {
        stores.goTo('settings')
      }
    })

    listenSSE(
      '/api/sync',
      (data: any) => {
        sync.emit(data.event, data.data)
        stores.lastUpdate.set(new Date())
      },
      {
        onOpen: () => {
          stores.isConnected.set(true)
        },
        onError: () => {
          stores.isConnected.set(false)
        },
      }
    )

    // Initialize recipe widget periodic checking
    initRecipeWidget()

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

  useSound(isSoundOn)

  useRadio(isRadioOn)

  if (!isLoaded) {
    return <Layout>Loading...</Layout>
  }

  return (
    <>
      <ConnectionStatus />
      <Layout>
        {(!router || router.route === 'system') && <System />}
        {router?.route === 'settings' && <Settings />}
        {router?.route === 'api' && <ApiPage />}
        {router?.route === 'sync' && <Sync />}
        {router?.route === 'dm' && router.params?.userId && (
          <DirectMessageThread userId={router.params.userId} />
        )}
        {router?.route === 'status' && <StatusPage noWrapper />}
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
    </>
  )
}

render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
