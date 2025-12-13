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
    <div className="max-w-2xl">
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

        {/* Psychological Profile - show if available */}
        {profile.psychologicalProfile && profile.psychologicalProfile.hasUsership && (
          <div>
            <Block label="Psychological Profile:" blockView>
              {profile.psychologicalProfile.message ? (
                <div className="opacity-60">
                  {profile.psychologicalProfile.message}
                </div>
              ) : (
                <div className="flex flex-col gap-y-12">
                  {/* Soul Archetype */}
                  {profile.psychologicalProfile.archetype && (
                    <Block label="Soul Archetype:" blockView>
                      <div className="font-bold text-acc mb-4">
                        {profile.psychologicalProfile.archetype}
                      </div>
                      {profile.psychologicalProfile.archetypeDescription && (
                        <div className="text-acc/80 text-sm">
                          {profile.psychologicalProfile.archetypeDescription}
                        </div>
                      )}
                    </Block>
                  )}

                  {/* Self-Awareness Level */}
                  {profile.psychologicalProfile.selfAwarenessLevel !== undefined && (
                    <Block label="Self-Awareness:">
                      {profile.psychologicalProfile.selfAwarenessLevel}/10
                    </Block>
                  )}

                  {/* Core Values */}
                  {profile.psychologicalProfile.coreValues && profile.psychologicalProfile.coreValues.length > 0 && (
                    <Block label="Core Values:" blockView>
                      <TagsContainer
                        items={profile.psychologicalProfile.coreValues.map((value: string, idx: number) => (
                          <Tag key={idx} color="blue" fill>
                            {value}
                          </Tag>
                        ))}
                      />
                    </Block>
                  )}

                  {/* Emotional Patterns */}
                  {profile.psychologicalProfile.emotionalPatterns && profile.psychologicalProfile.emotionalPatterns.length > 0 && (
                    <Block label="Emotional Patterns:" blockView>
                      <TagsContainer
                        items={profile.psychologicalProfile.emotionalPatterns.map((pattern: string, idx: number) => (
                          <Tag key={idx} color="purple" fill>
                            {pattern}
                          </Tag>
                        ))}
                      />
                    </Block>
                  )}

                  {/* Behavioral Cohort */}
                  {profile.psychologicalProfile.behavioralCohort && (
                    <Block label="Behavioral Cohort:">
                      {profile.psychologicalProfile.behavioralCohort}
                    </Block>
                  )}

                  {/* Behavioral Traits */}
                  {profile.psychologicalProfile.behavioralTraits && profile.psychologicalProfile.behavioralTraits.length > 0 && (
                    <Block label="Behavioral Traits:" blockView>
                      <TagsContainer
                        items={profile.psychologicalProfile.behavioralTraits.map((trait: string, idx: number) => (
                          <Tag key={idx} color="green" fill>
                            {trait}
                          </Tag>
                        ))}
                      />
                    </Block>
                  )}

                  {/* Pattern Strength */}
                  {profile.psychologicalProfile.patternStrength && profile.psychologicalProfile.patternStrength.length > 0 && (
                    <Block label="Pattern Strength:" blockView>
                      <div className="flex flex-col gap-y-4">
                        {profile.psychologicalProfile.patternStrength.map((item: { trait: string; count: number }, idx: number) => (
                          <div key={idx} className="text-sm">
                            {item.trait}: <span className="text-acc/60">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </Block>
                  )}

                  {/* Meta Information */}
                  {(profile.psychologicalProfile.answerCount !== undefined || profile.psychologicalProfile.noteCount !== undefined) && (
                    <div className="text-sm text-acc/60">
                      {profile.psychologicalProfile.answerCount !== undefined && (
                        <div>Answers: {profile.psychologicalProfile.answerCount}</div>
                      )}
                      {profile.psychologicalProfile.noteCount !== undefined && (
                        <div>Notes: {profile.psychologicalProfile.noteCount}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Block>
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
