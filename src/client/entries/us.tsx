import * as React from 'react'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useStore } from '@nanostores/react'
import { render } from '#client/utils/render'
import { Page } from '#client/components/ui'
import { useWeather } from '#client/queries'
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
  const router = useStore(stores.router)
  const { data: weather, refetch: refetchWeather } = useWeather()

  React.useEffect(() => {
    // Initialize router to listen to URL changes
    const unbindRouter = stores.router.listen(() => {})

    if (weather !== undefined) {
      stores.weather.set(weather)
    }

    return () => {
      unbindRouter()
    }
  }, [weather])

  useSun(weather || null, refetchWeather)

  return (
    <Page className="leading-[1.5rem]">
      {(!router || router.route === 'adminUsers') && <AdminUsers />}
      {router?.route === 'adminUser' && <AdminUser />}
    </Page>
  )
}

render(<App />)
