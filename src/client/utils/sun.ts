import * as React from 'react'
import dayjs from '#client/utils/dayjs'
import * as stores from '#client/stores'
import { WeatherRecord } from '#shared/types'
import { WEATHER_STALE_TIME_MINUTES } from '#shared/constants'

const INTERVAL = 5e3

export function useSun(
  weather: WeatherRecord | null,
  refetchWeather: () => void
) {
  React.useEffect(() => {
    function checkWeather() {
      const weather = stores.weather.get()
      if (!weather) return
      const now = dayjs()
      const createdAt = dayjs(weather.createdAt)
      if (now.diff(createdAt, 'minute') > WEATHER_STALE_TIME_MINUTES) {
        refetchWeather()
        return
      }
      const sunrise = dayjs.utc(weather.sunrise * 1000).local()
      const sunset = dayjs.utc(weather.sunset * 1000).local()
      if (
        now.isAfter(sunrise.subtract(10, 'second')) &&
        now.isBefore(sunrise.add(1, 'minute'))
      ) {
        stores.theme.set('sunrise')
      } else if (
        now.isAfter(sunset.subtract(10, 'second')) &&
        now.isBefore(sunset.add(1, 'minute'))
      ) {
        stores.theme.set('sunset')
      } else {
        const currentTheme = stores.theme.get()
        const isCustomThemeEnabled = stores.isCustomThemeEnabled.get()
        if (isCustomThemeEnabled && currentTheme !== 'custom') {
          stores.theme.set('custom')
          return
        }
        const isDark = now.isAfter(sunset) || now.isBefore(sunrise)
        if (isDark && ['light', 'sunset', 'sunrise'].includes(currentTheme)) {
          stores.theme.set('dark')
        }
      }
    }

    checkWeather()
    let loop: number | null = null
    loop = setInterval(checkWeather, INTERVAL) as unknown as number

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        if (!loop) {
          loop = setInterval(checkWeather, INTERVAL) as unknown as number
        }
      } else {
        if (loop) {
          clearInterval(loop)
          loop = null
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (loop) {
        clearInterval(loop)
      }
    }
  }, [weather])
}
