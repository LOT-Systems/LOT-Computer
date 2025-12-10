import * as React from 'react'
import { Block, GhostButton } from '#client/components/ui'
import { PublicProfile as PublicProfileType } from '#shared/types'
import { cn, formatNumberWithCommas } from '#client/utils'
import dayjs from '#client/utils/dayjs'

export const PublicProfile = () => {
  console.log('[PublicProfile] Component rendering at:', new Date().toISOString())

  const [profile, setProfile] = React.useState<PublicProfileType | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [debugInfo, setDebugInfo] = React.useState<any>(null)

  // Get user ID or username from URL
  const userIdOrUsername = React.useMemo(() => {
    try {
      const path = window.location.pathname
      console.log('[PublicProfile] Pathname:', path)
      const match = path.match(/\/u\/([^\/]+)/)
      const extracted = match ? match[1] : null
      console.log('[PublicProfile] Extracted ID:', extracted)
      return extracted
    } catch (err) {
      console.error('[PublicProfile] URL parsing error:', err)
      return null
    }
  }, [])

  // Fetch public profile data
  React.useEffect(() => {
    if (!userIdOrUsername) {
      setError('Invalid profile URL')
      setLoading(false)
      return
    }

    console.log('[PublicProfile] Fetching profile for:', userIdOrUsername)

    fetch(`/api/public/profile/${userIdOrUsername}`)
      .then(async (res) => {
        console.log('[PublicProfile] Response status:', res.status)
        console.log('[PublicProfile] Response URL:', res.url)
        if (!res.ok) {
          const data = await res.json().catch(() => ({
            message: `HTTP ${res.status}`,
            error: `Server returned ${res.status}`
          }))
          console.error('[PublicProfile] Error response:', data)
          // Capture debug info if available
          if (data.debug) {
            setDebugInfo(data.debug)
          }
          // Show more detailed error message
          const errorMsg = data.error || data.message || 'Failed to load profile'
          throw new Error(errorMsg)
        }
        return res.json()
      })
      .then((data) => {
        console.log('[PublicProfile] Profile loaded:', data)
        setProfile(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[PublicProfile] Fetch error:', err)
        setError(err.message || String(err))
        setLoading(false)
      })
  }, [userIdOrUsername])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl px-8">
          <div className="text-xl mb-4">{error || 'Profile not found'}</div>
          <div className="text-sm text-acc/60 mb-4">
            Looking for: {userIdOrUsername}
          </div>
          {debugInfo && (
            <div className="mt-8 text-left bg-acc/5 p-4 rounded text-sm">
              <div className="font-bold mb-2">Debug Information:</div>
              <div className="mb-2">User ID: {debugInfo.userId}</div>
              <div className="mb-2">Has Metadata: {debugInfo.hasMetadata ? 'Yes' : 'No'}</div>
              <div className="mb-2">Has Privacy Settings: {debugInfo.hasPrivacy ? 'Yes' : 'No'}</div>
              {debugInfo.privacySettings && (
                <div className="mt-4">
                  <div className="font-bold mb-1">Privacy Settings:</div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo.privacySettings, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          {!debugInfo && (
            <div className="mt-4 text-sm text-acc/60">
              Possible issues:
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Profile not enabled in Settings</li>
                <li>Wrong user ID or custom URL</li>
                <li>Check Settings → Public Profile for your correct link</li>
              </ul>
            </div>
          )}
          <div className="mt-8">
            <GhostButton href="/">← Back to home</GhostButton>
          </div>
        </div>
      </div>
    )
  }

  const { privacySettings } = profile
  const temperature = profile.weather?.temperature
    ? Math.round(profile.weather.temperature)
    : null

  const sunrise = profile.weather?.sunrise
    ? dayjs.unix(profile.weather.sunrise).format('h:mm A')
    : null
  const sunset = profile.weather?.sunset
    ? dayjs.unix(profile.weather.sunset).format('h:mm A')
    : null

  const userName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ') || 'Anonymous'

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <GhostButton href="/">← Back to LOT Systems</GhostButton>
      </div>

      <div className="flex flex-col gap-y-24">
          <div>
            <div>{userName}</div>
            {privacySettings.showCity && profile.city && (
              <div>
                {profile.city}
                {profile.country && `, ${profile.country}`}
              </div>
            )}
          </div>

          {(privacySettings.showLocalTime || privacySettings.showWeather) && (
            <div>
              {privacySettings.showLocalTime && profile.localTime && (
                <Block label="Local time:">{profile.localTime}</Block>
              )}
              {privacySettings.showWeather && profile.weather && (
                <>
                  <Block label="Weather:">
                    {profile.weather.description || 'Unknown'}
                  </Block>
                  {profile.weather.humidity && (
                    <Block label="Humidity:">
                      <span
                        className={cn(
                          profile.weather.humidity >= 50 && 'text-blue-500'
                        )}
                      >
                        {profile.weather.humidity}%
                      </span>
                    </Block>
                  )}
                  {temperature !== null && (
                    <Block label="Temperature:">
                      {temperature}℃
                    </Block>
                  )}
                  {(sunrise || sunset) && (
                    <>
                      {sunrise && <Block label="Sunrise:">{sunrise}</Block>}
                      {sunset && <Block label="Sunset:">{sunset}</Block>}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {privacySettings.showSound && profile.soundDescription && (
            <div>
              <Block label="Sound:" blockView>
                {profile.soundDescription}
              </Block>
            </div>
          )}

          {privacySettings.showMemoryStory && profile.memoryStory && (
            <div>
              <Block label="Memory Story:" blockView>
                <div className="whitespace-pre-wrap">{profile.memoryStory}</div>
              </Block>
            </div>
          )}

        <div>
          This is a public profile page on LOT Systems
        </div>
      </div>
    </div>
  )
}
