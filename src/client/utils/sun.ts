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

      // Transition windows: 90 seconds before sunrise/sunset
      const sunriseTransitionStart = sunrise.subtract(90, 'second')
      const sunsetTransitionStart = sunset.subtract(90, 'second')

      // Debug: Log sunset time to help diagnose issue
      console.log('[Sun Debug]', {
        now: now.format('HH:mm:ss'),
        nowFull: now.format(),
        nowUnix: now.unix(),
        localTime: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour12: true }),
        sunrise: sunrise.format('HH:mm:ss'),
        sunriseFull: sunrise.format(),
        sunset: sunset.format('HH:mm:ss'),
        sunsetFull: sunset.format(),
        sunsetUnix: sunset.unix(),
        sunsetTimestampFromAPI: weather.sunset,
        sunsetAPIasDate: new Date(weather.sunset * 1000).toISOString(),
        sunsetDifference: `${now.diff(sunset, 'minute')} minutes`,
        sunsetTransitionStart: sunsetTransitionStart.format('HH:mm:ss'),
        isDark: now.isAfter(sunset) || now.isBefore(sunrise),
        isAfterSunset: now.isAfter(sunset),
        isBeforeSunrise: now.isBefore(sunrise),
        inSunsetTransition: now.isAfter(sunsetTransitionStart) && now.isBefore(sunset),
        weatherCreatedAt: weather.createdAt,
        weatherAge: `${now.diff(dayjs(weather.createdAt), 'minute')} minutes old`,
        currentTheme: stores.theme.get(),
        systemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })

      const currentTheme = stores.theme.get()
      const isCustomThemeEnabled = stores.isCustomThemeEnabled.get()

      // If custom theme is enabled, don't auto-switch themes
      if (isCustomThemeEnabled) {
        if (currentTheme !== 'custom') {
          stores.theme.set('custom')
        }
        return
      }

      // Otherwise, do automatic theme switching based on time
      if (
        now.isAfter(sunriseTransitionStart) &&
        now.isBefore(sunrise)
      ) {
        stores.theme.set('sunrise')
      } else if (
        now.isAfter(sunsetTransitionStart) &&
        now.isBefore(sunset)
      ) {
        stores.theme.set('sunset')
      } else {
        const isDark = now.isAfter(sunset) || now.isBefore(sunrise)
        if (isDark && ['light', 'sunset', 'sunrise'].includes(currentTheme)) {
          stores.theme.set('dark')
        } else if (!isDark && currentTheme === 'dark') {
          stores.theme.set('light')
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
