/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button, GhostButton, Tag, TagsContainer } from '#client/components/ui'
import { PublicProfile as PublicProfileType, WeatherStation, Wallet } from '#shared/types'
import { cn, formatNumberWithCommas } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { getUserTagByIdCaseInsensitive } from '#shared/constants'
import { joinWithDots, getLevelSymbol, getBadgeProgressionDisplay } from '#client/utils/badges'
import { ProfileQRCode } from './ProfileQRCode'

export const PublicProfile = () => {
  const [profile, setProfile] = React.useState<PublicProfileType | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [debugInfo, setDebugInfo] = React.useState<any>(null)

  // Get user ID or username from URL
  const userIdOrUsername = React.useMemo(() => {
    try {
      const path = window.location.pathname
      const match = path.match(/\/u\/([^\/]+)/)
      return match ? match[1] : null
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

    fetch(`/api/public/profile/${userIdOrUsername}`)
      .then(async (res) => {
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
        setProfile(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[PublicProfile] Fetch error:', err)
        setError(err.message || String(err))
        setLoading(false)
      })
  }, [userIdOrUsername])

  // Apply owner's theme when profile loads
  React.useEffect(() => {
    if (!profile?.theme) return

    const { theme: themeName, baseColor, accentColor } = profile.theme

    // Define theme colors (matching theme.ts THEMES)
    const THEMES: Record<string, { base: string; acc: string }> = {
      light: { base: '#ffffff', acc: '#000000' },
      dark: { base: '#000000', acc: '#ffffff' },
      sunrise: { base: '#ffd266', acc: '#ffffff' },
      sunset: { base: '#FF8758', acc: '#ffffff' },
      fill_blue: { base: '#82CBF8', acc: '#ffffff' },
      light_red: { base: '#FFF9F9', acc: '#E86575' },
    }

    // Helper to convert hex to RGB
    const hexToRgb = (hex: string): number[] | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ] : null
    }

    // Get colors from theme or custom colors
    let finalBaseColor: string
    let finalAccentColor: string

    if (themeName === 'custom' && baseColor && accentColor) {
      finalBaseColor = baseColor
      finalAccentColor = accentColor
    } else {
      const themeColors = THEMES[themeName] || THEMES.light
      finalBaseColor = themeColors.base
      finalAccentColor = themeColors.acc
    }

    // Apply colors to CSS custom properties
    document.documentElement.style.setProperty('--base-color', finalBaseColor)
    const accRgb = hexToRgb(finalAccentColor) || [0, 0, 0]
    document.documentElement.style.setProperty('--acc-color-default', accRgb.join(' '))
  }, [profile])

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
          <div className="mb-4">{error || 'Profile not found'}</div>
          <div className="mb-4">
            Looking for: {userIdOrUsername}
          </div>
          {debugInfo && (
            <div className="mt-8 text-left bg-acc/5 p-4 rounded">
              <div className="mb-2">Debug Information:</div>
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
            <div className="mt-4">
              Possible issues:
              <ul className="list-disc list-inside mt-2 text-left">
                <li>↳ Profile not enabled in Settings</li>
                <li>↳ Wrong user ID or custom URL</li>
                <li>↳ Check Settings → Public Profile for your correct link</li>
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
  const currentDate = `Week ${Math.ceil(dayjs().dayOfYear() / 7)}, ${dayjs().format('dddd, MMMM D')}`

  // Check if profile is private
  if (profile.isPrivate) {
    return (
      <div className="max-w-2xl min-h-screen">
        <div className="flex flex-col gap-y-0">
          {/* Name */}
          <div>
            <div>{userName}</div>
            <div>{currentDate}</div>
          </div>

          {/* Tags (show even in private mode, especially Suspended) */}
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

          {/* Private mode message */}
          <div>
            <Block label="Profile:" blockView>
              Private
            </Block>
          </div>

          {/* Footer */}
          <div>
            This is {userName}'s System powered by{' '}
            <GhostButton href="/">LOT</GhostButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl min-h-screen">
      <div className="flex flex-col gap-y-0">
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

        {/* Direct Message Button */}
        {profile.userId && (
          <div>
            <Button onClick={() => {
              window.location.href = `/dm/${profile.userId}`
            }}>
              Direct message {profile.firstName || 'user'}
            </Button>
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

        {/* Usership Board Profile */}
        {profile.boardProfile && (
          <div>
            <Block label="Total invested:">
              ${formatNumberWithCommas(profile.boardProfile.totalInvested)}
            </Block>
            <Block label="Citizen Index:" blockView>
              {[
                `Board Member #${profile.boardProfile.boardMemberNumber}`,
                `Citizen since ${profile.boardProfile.citizenSince}`,
                `Powering ${formatNumberWithCommas(profile.boardProfile.poweringCitizens)} citizens`,
                `Board tenure ${profile.boardProfile.boardTenureMonths} months`,
              ].join(' · ')}
            </Block>
            {profile.boardProfile.biofieldState && (
              <Block label="Biofield State:">
                {[
                  profile.boardProfile.biofieldState.clarity,
                  profile.boardProfile.biofieldState.alignment,
                  `${profile.boardProfile.biofieldState.energy} energy`,
                ].map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ')}
              </Block>
            )}
            <Block label="Activity:">
              {[
                `${formatNumberWithCommas(profile.boardProfile.activity.memoriesCompiled)} memories compiled`,
                `${formatNumberWithCommas(profile.boardProfile.activity.journalEntries)} journal entries`,
                `${formatNumberWithCommas(profile.boardProfile.activity.activeDays)} active days`,
              ].join(' · ')}
            </Block>
            <Block label="Memory Engine:">
              → {profile.boardProfile.memoryEngine}
            </Block>
            <Block label="Clearance level:">
              → {profile.boardProfile.clearanceLevel} ({formatNumberWithCommas(profile.boardProfile.totalEntries)} entries)
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
          <div className="font-base">
            <div className="mb-24">
              Psychological Profile: OS v.{profile.psychologicalProfile.version || '1.0'}
            </div>

            {profile.psychologicalProfile.message ? (
              <div className="font-base">
                {profile.psychologicalProfile.message}
              </div>
            ) : (
              <div>
                {/* Soul Archetype */}
                {profile.psychologicalProfile.archetype && (
                  <div className="mb-24">
                    <div className="flex">
                      <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Soul archetype:</span>
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
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Self-awareness:</span>
                    <span className="flex-1">{(profile.psychologicalProfile.selfAwarenessLevel / 10).toFixed(1)}%</span>
                  </div>
                )}

                {/* Level (Aquatic Evolution Badge) */}
                {profile.psychologicalProfile.streak !== undefined && profile.psychologicalProfile.streak >= 7 && (
                  <div className="flex mb-24">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Level:</span>
                    <span className="flex-1">{getLevelSymbol(profile.psychologicalProfile.streak)}</span>
                  </div>
                )}

                {/* Core Values */}
                {profile.psychologicalProfile.coreValues && profile.psychologicalProfile.coreValues.length > 0 && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Core values:</span>
                    <span className="flex-1">{joinWithDots(profile.psychologicalProfile.coreValues)}</span>
                  </div>
                )}

                {/* Emotional Patterns */}
                {profile.psychologicalProfile.emotionalPatterns && profile.psychologicalProfile.emotionalPatterns.length > 0 && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Emotional patterns:</span>
                    <span className="flex-1">{joinWithDots(profile.psychologicalProfile.emotionalPatterns)}</span>
                  </div>
                )}

                {/* Behavioral Cohort */}
                {profile.psychologicalProfile.behavioralCohort && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Behavioral cohort:</span>
                    <span className="flex-1">{profile.psychologicalProfile.behavioralCohort}</span>
                  </div>
                )}

                {/* Behavioral Traits */}
                {profile.psychologicalProfile.behavioralTraits && profile.psychologicalProfile.behavioralTraits.length > 0 && (
                  <div className="flex mb-24">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Behavioral traits:</span>
                    <span className="flex-1">{joinWithDots(profile.psychologicalProfile.behavioralTraits)}</span>
                  </div>
                )}

                {/* Pattern Strength */}
                {profile.psychologicalProfile.patternStrength && profile.psychologicalProfile.patternStrength.length > 0 && (
                  <div>
                    <div className="flex mb-24">
                      <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Pattern strength:</span>
                      <span className="flex-1">{(profile.psychologicalProfile.patternStrengthIndex || profile.psychologicalProfile.patternStrength.reduce((sum: number, item: { count: number }) => sum + item.count, 0)).toLocaleString()}</span>
                    </div>
                    {profile.psychologicalProfile.patternStrength.map((item: { trait: string; count: number }, idx: number) => (
                      <div key={idx} className="flex">
                        <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">↳ {item.trait}:</span>
                        <span className="flex-1">{item.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta Information */}
                {(profile.psychologicalProfile.answerCount !== undefined || profile.psychologicalProfile.noteCount !== undefined) && (
                  <div>
                    {profile.psychologicalProfile.answerCount !== undefined && (
                      <div className="flex">
                        <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Answers:</span>
                        <span className="flex-1">{profile.psychologicalProfile.answerCount.toLocaleString()}</span>
                      </div>
                    )}
                    {profile.psychologicalProfile.noteCount !== undefined && (
                      <div className="flex">
                        <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Notes:</span>
                        <span className="flex-1">{profile.psychologicalProfile.noteCount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Correlated Indexes */}
        {profile.correlatedIndexes && profile.correlatedIndexes.composite > 0 && (
          <div>
            <Block label="Indexes:" blockView>
              <div className="flex flex-col gap-8">
                <div className="flex">
                  <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Self-awareness:</span>
                  <span className="flex-1">{profile.correlatedIndexes.selfAwareness.toFixed(1)}</span>
                </div>
                <div className="flex">
                  <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">User score:</span>
                  <span className="flex-1">{profile.correlatedIndexes.userScore.toFixed(1)}</span>
                </div>
                <div className="flex">
                  <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Person score:</span>
                  <span className="flex-1">{profile.correlatedIndexes.personScore.toFixed(1)}</span>
                </div>
                <div className="flex">
                  <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Longevity score:</span>
                  <span className="flex-1">{profile.correlatedIndexes.longevityScore.toFixed(1)}</span>
                </div>
                <div className="flex mt-8">
                  <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Composite:</span>
                  <span className="flex-1">{profile.correlatedIndexes.composite.toFixed(1)}</span>
                </div>
                {profile.correlatedIndexes.correlationStrength > 0 && (
                  <div className="flex">
                    <span className="w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4 px-4">Correlation:</span>
                    <span className="flex-1">{(profile.correlatedIndexes.correlationStrength * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </Block>
          </div>
        )}

        {/* Legacy Level: Weather Station */}
        {profile.weatherStation && (
          <div>
            <Block label="Weather Station:" blockView>
              <div className="mb-8 opacity-50">{profile.weatherStation.location}</div>
              <div className="flex flex-col gap-4 mb-16">
                <div className="flex justify-between">
                  <span>Temperature</span>
                  <span>{Math.round(profile.weatherStation.readings.temperature)}℃</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span>{profile.weatherStation.readings.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Pressure</span>
                  <span>{profile.weatherStation.readings.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind</span>
                  <span>{profile.weatherStation.readings.windSpeed} m/s {profile.weatherStation.readings.windDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span>UV Index</span>
                  <span>{profile.weatherStation.readings.uvIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visibility</span>
                  <span>{profile.weatherStation.readings.visibility} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Dew Point</span>
                  <span>{profile.weatherStation.readings.dewPoint}℃</span>
                </div>
              </div>
              {profile.weatherStation.forecast.length > 0 && (
                <div>
                  <div className="mb-8 opacity-50">Forecast</div>
                  <div className="flex flex-col gap-4">
                    {profile.weatherStation.forecast.map((day, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="flex-1">{day.day}, {day.condition}</span>
                        <span>{day.low}–{day.high}℃</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Block>
          </div>
        )}

        {/* Legacy Level: Wallet */}
        {profile.wallet && (
          <div>
            <Block label="Wallet:" blockView>
              <div className="flex justify-between mb-4">
                <span className="opacity-50">{profile.wallet.address}</span>
              </div>
              <div className="flex justify-between mb-16">
                <span>Balance</span>
                <span>{formatNumberWithCommas(profile.wallet.balance)} {profile.wallet.currency}</span>
              </div>
              <div className="flex justify-between mb-16">
                <span>Loyalty Points</span>
                <span>{formatNumberWithCommas(profile.wallet.loyaltyPoints)}</span>
              </div>
              {profile.wallet.transactions.length > 0 && (
                <div>
                  <div className="mb-8 opacity-50">Recent transactions</div>
                  <div className="flex flex-col gap-4">
                    {profile.wallet.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between gap-8">
                        <span className="w-[80px] opacity-50">{tx.date.slice(5)}</span>
                        <span className="flex-1">{tx.description}</span>
                        <span className={tx.type === 'credit' ? '' : 'opacity-50'}>
                          {tx.type === 'credit' ? '↑' : '↓'}{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Block>
          </div>
        )}

        {/* Demo badge */}
        {profile.isDemo && (
          <div className="opacity-30">
            This is a demo account. Legacy level features shown as preview.
          </div>
        )}

        {/* QR Code — Usership + assembly stage gate */}
        {(() => {
          const isUsership = profile.tags?.some(
            t => t.toLowerCase() === 'usership'
          )
          if (!isUsership) return null

          if (profile.assemblyPhase) {
            const PHASE_ORDER = ['dormant', 'awakening', 'forming', 'assembled', 'integrated']
            const phaseRank = PHASE_ORDER.indexOf(profile.assemblyPhase)
            const formingRank = PHASE_ORDER.indexOf('forming')
            if (phaseRank >= 0 && phaseRank < formingRank) return null
          }

          const THEMES: Record<string, { base: string; acc: string }> = {
            light: { base: '#ffffff', acc: '#000000' },
            dark: { base: '#000000', acc: '#ffffff' },
            sunrise: { base: '#ffd266', acc: '#ffffff' },
            sunset: { base: '#FF8758', acc: '#ffffff' },
            fill_blue: { base: '#82CBF8', acc: '#ffffff' },
            light_red: { base: '#FFF9F9', acc: '#E86575' },
          }

          let fgColor = '#000000'
          let bgColor = '#ffffff'
          if (profile.theme) {
            const { theme: themeName, baseColor, accentColor } = profile.theme
            if (themeName === 'custom' && baseColor && accentColor) {
              fgColor = accentColor
              bgColor = baseColor
            } else {
              const t = THEMES[themeName] || THEMES.light
              fgColor = t.acc
              bgColor = t.base
            }
          }

          const profileUrl = `https://lot-systems.com/u/${userIdOrUsername}`

          return (
            <div className="flex flex-col items-center gap-y-4">
              <ProfileQRCode
                url={profileUrl}
                fgColor={fgColor}
                bgColor={bgColor}
                size={80}
              />
              <div className="opacity-20" style={{ fontSize: '0.7em' }}>
                {profileUrl.replace('https://', '')}
              </div>
            </div>
          )
        })()}

        {/* Footer */}
        <div>
          This is {userName}'s System powered by{' '}
          <GhostButton href="/">LOT</GhostButton>
        </div>
      </div>
    </div>
  )
}
