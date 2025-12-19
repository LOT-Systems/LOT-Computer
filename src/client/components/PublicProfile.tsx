import * as React from 'react'
import { Block, GhostButton, Tag, TagsContainer } from '#client/components/ui'
import { PublicProfile as PublicProfileType } from '#shared/types'
import { cn, formatNumberWithCommas } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { getUserTagByIdCaseInsensitive } from '#shared/constants'

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

  // Format current date
  const currentDate = dayjs().format('dddd, D MMMM, YYYY')

  return (
    <div className="max-w-2xl min-h-screen">
      <div className="flex flex-col gap-y-24">
        {/* Name */}
        <div>
          <div>{userName}</div>
          <div>{currentDate}</div>
          {privacySettings.showCity && profile.city && (
            <div>
              {profile.city}
              {profile.country && `, ${profile.country}`}
            </div>
          )}
        </div>

        {/* Profile Visits */}
        {profile.profileVisits !== undefined && (
          <div>
            Profile visits: {formatNumberWithCommas(profile.profileVisits)}
          </div>
        )}

        {/* Team tags */}
        {profile.tags && profile.tags.length > 0 && (
          <div>
            <Block label="Team:" blockView>
              <TagsContainer
                items={profile.tags
                  .map((tagId: string) => {
                    const tag = getUserTagByIdCaseInsensitive(tagId)
                    return tag ? (
                      <Tag key={tagId} color={tag.color}>
                        {tag.name}
                      </Tag>
                    ) : null
                  })
                  .filter(Boolean)}
              />
            </Block>
          </div>
        )}

        {/* Status items */}
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
                  {profile.weather.humidity}%
                </Block>
              )}
              {temperature !== null && (
                <Block label="Temperature:">
                  {temperature}℃
                </Block>
              )}
              {sunrise && <Block label="Sunrise:">{sunrise}</Block>}
              {sunset && <Block label="Sunset:">{sunset}</Block>}
            </>
          )}
          {privacySettings.showSound && profile.soundDescription && (
            <Block label="Sound:">{profile.soundDescription}</Block>
          )}
        </div>

        {/* Memory Story - keep as block view if present */}
        {privacySettings.showMemoryStory && profile.memoryStory && (
          <div>
            <Block label="Memory Story:" blockView>
              <div className="whitespace-pre-wrap">{profile.memoryStory}</div>
            </Block>
          </div>
        )}

        {/* Psychological Profile - simplified single-column layout */}
        {profile.psychologicalProfile && profile.psychologicalProfile.hasUsership && (
          <div className="font-sans">
            <div className="mb-24">
              Psychological Profile: OS v.{profile.psychologicalProfile.version || '1.0'}
            </div>

            {profile.psychologicalProfile.message ? (
              <div className="opacity-60 font-sans">
                {profile.psychologicalProfile.message}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Soul Archetype */}
                {profile.psychologicalProfile.archetype && (
                  <div className="mb-24">
                    <div className="flex">
                      <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Soul archetype:</span>
                      <span className="flex-1">
                        {profile.psychologicalProfile.archetype}
                        {profile.psychologicalProfile.archetypeDescription && (
                          <div className="mt-8">
                            {profile.psychologicalProfile.archetypeDescription}
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Self-Awareness Level */}
                {profile.psychologicalProfile.selfAwarenessLevel !== undefined && (
                  <div className="flex mb-24">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Self-awareness:</span>
                    <span className="flex-1">{profile.psychologicalProfile.selfAwarenessLevel}/10</span>
                  </div>
                )}

                {/* Core Values */}
                {profile.psychologicalProfile.coreValues && profile.psychologicalProfile.coreValues.length > 0 && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Core values:</span>
                    <span className="flex-1">{profile.psychologicalProfile.coreValues.join(', ')}</span>
                  </div>
                )}

                {/* Emotional Patterns */}
                {profile.psychologicalProfile.emotionalPatterns && profile.psychologicalProfile.emotionalPatterns.length > 0 && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Emotional patterns:</span>
                    <span className="flex-1">{profile.psychologicalProfile.emotionalPatterns.join(', ')}</span>
                  </div>
                )}

                {/* Behavioral Cohort */}
                {profile.psychologicalProfile.behavioralCohort && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Behavioral cohort:</span>
                    <span className="flex-1">{profile.psychologicalProfile.behavioralCohort}</span>
                  </div>
                )}

                {/* Behavioral Traits */}
                {profile.psychologicalProfile.behavioralTraits && profile.psychologicalProfile.behavioralTraits.length > 0 && (
                  <div className="flex mb-24">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Behavioral traits:</span>
                    <span className="flex-1">{profile.psychologicalProfile.behavioralTraits.join(', ')}</span>
                  </div>
                )}

                {/* Pattern Strength */}
                {profile.psychologicalProfile.patternStrength && profile.psychologicalProfile.patternStrength.length > 0 && (
                  <div>
                    <div className="flex mb-2">
                      <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Pattern strength:</span>
                      <span className="flex-1">{profile.psychologicalProfile.patternStrengthIndex || profile.psychologicalProfile.patternStrength.reduce((sum: number, item: { count: number }) => sum + item.count, 0)}</span>
                    </div>
                    {profile.psychologicalProfile.patternStrength.map((item: { trait: string; count: number }, idx: number) => (
                      <div key={idx} className="flex">
                        <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">{item.trait}:</span>
                        <span className="flex-1">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta Information */}
                {(profile.psychologicalProfile.answerCount !== undefined || profile.psychologicalProfile.noteCount !== undefined) && (
                  <div>
                    {profile.psychologicalProfile.answerCount !== undefined && (
                      <div className="flex">
                        <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Answers:</span>
                        <span className="flex-1">{profile.psychologicalProfile.answerCount}</span>
                      </div>
                    )}
                    {profile.psychologicalProfile.noteCount !== undefined && (
                      <div className="flex">
                        <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12">Notes:</span>
                        <span className="flex-1">{profile.psychologicalProfile.noteCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div>
          This is {userName}'s System powered by{' '}
          <GhostButton href="/">LOT</GhostButton>
        </div>
      </div>
    </div>
  )
}
