import * as React from 'react'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useStore } from '@nanostores/react'
import { render } from '#client/utils/render'
import { Page } from '#client/components/ui'
import { getMe, useWeather } from '#client/queries'
import * as stores from '#client/stores'
import { AdminUsers } from '#client/components/AdminUsers'
import { AdminUser } from '#client/components/AdminUser'
import { useSun } from '#client/utils/sun'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <_App />
  </QueryClientProvider>
)

const _App = () => {
  const me = useStore(stores.me)
  const router = useStore(stores.router)
  const { data: weather, refetch: refetchWeather } = useWeather()

  const isLoaded = React.useMemo(() => {
    return !!me && weather !== undefined
  }, [me, weather])

  React.useEffect(() => {
    // Initialize router to listen to URL changes
    const unbindRouter = stores.router.listen(() => {})

    // Load user data
    getMe().then((user) => {
      stores.me.set(user)
    })

    if (weather !== undefined) {
      stores.weather.set(weather)
    }

    return () => {
      unbindRouter()
    }
  }, [weather])

  useSun(weather || null, refetchWeather)

  if (!isLoaded) {
    return <Page className="leading-[1.5rem]">Loading...</Page>
  }

  return (
    <Page className="leading-[1.5rem]">
      {(!router || router.route === 'adminUsers') && <AdminUsers />}
      {router?.route === 'adminUser' && <AdminUser />}
    </Page>
  )
}

render(<App />)
