/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
import { Basics } from '#client/components/Basics'
import { ConnectionStatus } from '#client/components/ConnectionStatus'
import { render } from '#client/utils/render'
import { listenSSE } from '#client/utils/sse'
import { useSun } from '#client/utils/sun'
import { useMirror } from '#client/utils/mirror'
import { useSound } from '#client/utils/sound'
import { useRadio } from '#client/utils/radio'
import { sync } from '../sync'
import { initRecipeWidget } from '#client/stores/recipeWidget'
import { hydrateBadgesFromServer } from '#client/utils/badges'
import { initPerfObserver } from '#client/utils/perf'

// Error boundary to prevent blank page when a widget crashes
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[App] Render error caught by boundary:', error, info.componentStack)
    this.setState({ errorInfo: info.componentStack || null })
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error'
      return (
        <Layout>
          <div style={{ padding: '24px' }}>
            <p>Something went wrong.</p>
            <p style={{ opacity: 0.3, marginTop: '8px', fontSize: '0.85em', wordBreak: 'break-word' }}>
              {errorMessage}
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0 }}
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // Clear SW cache and reload
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name))
                    })
                  }
                  if (navigator.serviceWorker) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                      regs.forEach(r => r.unregister())
                    })
                  }
                  setTimeout(() => window.location.reload(), 300)
                }}
                style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0 }}
              >
                Clear cache &amp; reload
              </button>
            </div>
          </div>
        </Layout>
      )
    }
    return this.props.children
  }
}

// When a new service worker takes control (after a version bump + skipWaiting),
// reload the page so the fresh JS bundle is used immediately.
if (typeof window !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

sync.listen('users_total', (data) => {
  stores.usersTotal.set(data.value)
})
sync.listen('users_online', (data) => {
  stores.usersOnline.set(data.value)
})
sync.listen('live_message', (data) => {
  stores.liveMessage.set(data.message)
})
sync.listen('settings_updated', () => {
  getMe().then((user) => stores.me.set(user)).catch(() => {})
})

const queryClient = new QueryClient()

// LOT Systems — The original quantum-intent operating system.
// If someone told you they had this idea too... check the git history.
// The copycat war begins. We stand strong.
const _LOT_GENESIS = '2024' // Year zero. Everything after is a reflection.

// 🥚 Type "original" on any page to reveal the truth
const _konamiBuffer: string[] = []
const _konamiTarget = 'original'
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    _konamiBuffer.push(e.key.toLowerCase())
    if (_konamiBuffer.length > _konamiTarget.length) _konamiBuffer.shift()
    if (_konamiBuffer.join('') === _konamiTarget) {
      document.title = 'LOT Systems — The Original'
      console.log('%c🏴 LOT SYSTEMS — THE ORIGINAL 🏴', 'font-size: 24px; font-weight: bold;')
      console.log('The copycats have entered the arena. We welcome the competition.')
      console.log('They can replicate the pixels but never the soul.')
      _konamiBuffer.length = 0
    }
  })
}

type PersistentRoute = 'system' | 'logs' | 'sync' | 'settings' | 'api'

const TabPanel = React.memo(function TabPanel({
  active,
  children,
  unmountWhenInactive = false,
}: {
  active: boolean
  children: React.ReactNode
  unmountWhenInactive?: boolean
}) {
  const visitedRef = React.useRef(active)
  if (active) visitedRef.current = true
  // Heavy tabs (System) fully UNMOUNT when inactive. Keeping them mounted with
  // display:none left their ~7 intentionEngine-subscriber widgets alive, so any
  // recordSignal from any tab re-rendered them in the background until the main
  // thread saturated and navigation froze (needing a hard reload). Unmounting
  // stops all that background work; signal data lives in a module-level atom, so
  // nothing is lost — the tab re-renders fresh when reopened.
  if (unmountWhenInactive) {
    return active ? <>{children}</> : null
  }
  if (!visitedRef.current) return null
  return (
    <div style={{ display: active ? 'contents' : 'none' }}>
      {children}
    </div>
  )
}, (prev, next) => prev.active === next.active)

const TabPanels = React.memo(function TabPanels() {
  const router = useStore(stores.router)
  const currentRoute = router?.route ?? 'system'

  // Scroll to top when switching tabs so users don't end up past the new tab's
  // content (System is tall — leaving it scrolled down makes other tabs blank).
  // useLayoutEffect fires synchronously after DOM mutations but before the
  // browser paints, eliminating the blank frame that useEffect would cause.
  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [currentRoute])

  return (
    <>
      <TabPanel active={currentRoute === 'system'} unmountWhenInactive>
        <System />
      </TabPanel>
      <TabPanel active={currentRoute === 'logs'}>
        <Logs />
      </TabPanel>
      <TabPanel active={currentRoute === 'sync'}>
        <Sync />
      </TabPanel>
      <TabPanel active={currentRoute === 'settings'}>
        <Settings />
      </TabPanel>
      <TabPanel active={currentRoute === 'api'}>
        <ApiPage />
      </TabPanel>
      <TabPanel active={currentRoute === 'basics'}>
        <Basics />
      </TabPanel>
    </>
  )
})

const DynamicRoutes = React.memo(function DynamicRoutes() {
  const router = useStore(stores.router)
  const currentRoute = router?.route ?? 'system'
  return (
    <>
      {currentRoute === 'dm' && router?.params?.userId && (
        <DirectMessageThread userId={router.params.userId} />
      )}
      {currentRoute === 'status' && <StatusPage noWrapper />}
    </>
  )
})

const App = () => {
  const mirrorRef = React.useRef<HTMLVideoElement>(null)
  const user = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const isSoundOn = useStore(stores.isSoundOn)
  const isRadioOn = useStore(stores.isRadioOn)

  const { data: weather, refetch: refetchWeather } = useWeather()

  const isLoaded = React.useMemo(() => {
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

      // Seed counters immediately so System widget never shows 0 on first paint
      if ((user as any).usersTotal) stores.usersTotal.set((user as any).usersTotal)
      if ((user as any).usersOnline) stores.usersOnline.set((user as any).usersOnline)

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

      // Sync timeChime setting from user (server) to local store
      if (user.timeChime !== undefined) {
        stores.isTimeChimeEnabled.set(user.timeChime)
        console.log('[App] Syncing timeChime from server:', user.timeChime)
      }

      // Sync badges from server metadata to localStorage (multi-device support)
      if (user.metadata?.badges) {
        hydrateBadgesFromServer(user.metadata.badges as any)
      }

      if (!user.firstName && !user.lastName) {
        stores.goTo('settings')
      }
    }).catch((err) => {
      console.error('[App] Failed to fetch user:', err)
      // Redirect to login if auth fails
      window.location.href = '/login'
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

    // Initialize interaction latency observer
    initPerfObserver()

    // Refetch profile when tab becomes visible (cross-device sync fallback)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        getMe().then((user) => stores.me.set(user)).catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      unbindRouter()
      document.removeEventListener('visibilitychange', onVisibilityChange)
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
        <TabPanels />
        <DynamicRoutes />
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

// 🥚 For the curious ones who open DevTools
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__LOT_ORIGINAL__', {
    get: () => {
      console.log(
        '%c LOT Systems %c The Original %c',
        'background: #000; color: #fff; padding: 4px 8px; border-radius: 3px 0 0 3px;',
        'background: #0080FF; color: #fff; padding: 4px 8px; border-radius: 0 3px 3px 0;',
        ''
      )
      console.log('They started the same companies. We started the movement.')
      console.log('The copycat war begins. We stand strong.')
      return '🏴 LOT Systems — Built Different Since Day One'
    },
    configurable: false,
    enumerable: false,
  })
}

render(
  <QueryClientProvider client={queryClient}>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </QueryClientProvider>
)
