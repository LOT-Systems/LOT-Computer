import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import {
  Block,
  GhostButton,
  Clock,
  Tag,
  TagsContainer,
} from '#client/components/ui'
import { cn, formatNumberWithCommas } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { getUserTagByIdCaseInsensitive } from '#shared/constants'
import { toCelsius, toFahrenheit } from '#shared/utils'
import { getHourlyZodiac, getWesternZodiac, getMoonPhase, getRokuyo } from '#shared/utils/astrology'
import { useBreathe } from '#client/utils/breathe'
import { useVisitorStats, useProfile, useLogs } from '#client/queries'
import { TimeWidget } from './TimeWidget'
import { MemoryWidget } from './MemoryWidget'
import { RecipeWidget } from './RecipeWidget'
import { checkRecipeWidget } from '#client/stores/recipeWidget'

export const System = () => {
  const me = useStore(stores.me)
  const weather = useStore(stores.weather)
  const theme = useStore(stores.theme)
  const isCustomThemeEnabled = useStore(stores.isCustomThemeEnabled)

  const usersTotal = useStore(stores.usersTotal)
  const usersOnline = useStore(stores.usersOnline)
  const liveMessage = useStore(stores.liveMessage)

  const { data: visitorStats } = useVisitorStats()
  const { data: profile } = useProfile()
  const { data: logs = [] } = useLogs()

  const isTempFahrenheit = useStore(stores.isTempFahrenheit)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const isSoundOn = useStore(stores.isSoundOn)
  const soundDescription = useStore(stores.soundDescription)
  const isRadioOn = useStore(stores.isRadioOn)
  const radioTrackName = useStore(stores.radioTrackName)

  const [isBreatheOn, setIsBreatheOn] = React.useState(false)
  const breatheState = useBreathe(isBreatheOn)
  const [showRadio, setShowRadio] = React.useState(false)
  const [astrologyView, setAstrologyView] = React.useState<'astrology' | 'psychology' | 'journey'>('astrology')
  const [showWeatherSuggestion, setShowWeatherSuggestion] = React.useState(false)

  // Compute whether to show sunset or sunrise based on current time
  // Show sunset during daytime (between sunrise and sunset)
  // Show sunrise during nighttime (before sunrise or after sunset)
  const defaultShowSunset = React.useMemo(() => {
    if (!weather) return false
    const now = dayjs()
    const sunrise = dayjs.utc(weather.sunrise * 1000).local()
    const sunset = dayjs.utc(weather.sunset * 1000).local()
    return now.isAfter(sunrise) && now.isBefore(sunset)
  }, [weather])

  const [showSunset, setShowSunset] = React.useState(defaultShowSunset)

  // Update showSunset when weather changes or default value changes
  React.useEffect(() => {
    setShowSunset(defaultShowSunset)
  }, [defaultShowSunset])

  const userName = React.useMemo(() => {
    if (!me) return ''
    return [me.firstName, me.lastName].filter(Boolean).join(' ')
  }, [me])

  const userTags = React.useMemo(() => {
    return (me?.tags || [])
      .map((x) => {
        const tag = getUserTagByIdCaseInsensitive(x)
        return tag
      })
      .filter(Boolean)
  }, [me])

  const temperature = React.useMemo(() => {
    if (!weather || !weather.tempKelvin) return null
    // Convert from Kelvin to Celsius or Fahrenheit
    const celsius = weather.tempKelvin - 273.15
    return Math.round(
      isTempFahrenheit ? toFahrenheit(celsius) : celsius
    )
  }, [weather, isTempFahrenheit])

  const { sunset, sunrise } = React.useMemo(() => {
    if (!weather) return { sunset: null, sunrise: null }
    const sunrise = dayjs
      .utc(weather.sunrise * 1000)
      .local()
      .format(isTimeFormat12h ? 'h:mm A' : 'H:mm')
    const sunset = dayjs
      .utc(weather.sunset * 1000)
      .local()
      .format(isTimeFormat12h ? 'h:mm A' : 'H:mm')
    return { sunrise, sunset }
  }, [weather, isTimeFormat12h])

  // Astrology calculations
  const astrology = React.useMemo(() => {
    const now = new Date()
    const hourlyZodiac = getHourlyZodiac(now)
    const westernZodiac = getWesternZodiac(now)
    const moonPhase = getMoonPhase(now)
    const rokuyo = getRokuyo(now)

    return {
      hourlyZodiac,
      westernZodiac,
      moonPhase: moonPhase.phase,
      moonIllumination: moonPhase.illumination,
      rokuyo,
    }
  }, [])

  // Journey calculations
  const journeyData = React.useMemo(() => {
    // Count memory answers
    const memoryAnswers = logs.filter(log => log.event === 'answer')
    const answerCount = memoryAnswers.length

    // Calculate days since first answer
    let daysSinceStart = 0
    if (memoryAnswers.length > 0) {
      const firstAnswer = memoryAnswers[memoryAnswers.length - 1] // Oldest first
      daysSinceStart = dayjs().diff(dayjs(firstAnswer.createdAt), 'day')
    }

    return {
      daysSinceStart: daysSinceStart > 0 ? daysSinceStart : answerCount > 0 ? 1 : 0,
      answerCount,
    }
  }, [logs])

  // Calculate awareness index from backend selfAwarenessLevel (0-10) to percentage (0-100%)
  const awarenessIndex = profile?.selfAwarenessLevel
    ? Math.round((profile.selfAwarenessLevel / 10) * 100)
    : 0

  // Weather suggestion based on temperature
  const weatherSuggestion = React.useMemo(() => {
    if (!weather || !weather.tempKelvin) return null
    const celsius = weather.tempKelvin - 273.15

    if (celsius < 10) return 'Perfect for warm tea ☕'
    if (celsius < 18) return 'Great day for a walk 🚶'
    if (celsius > 28) return 'Stay cool, hydrate 💧'
    return 'Beautiful day outside 🌤️'
  }, [weather])

  // Check for recipe suggestions when component mounts
  React.useEffect(() => {
    checkRecipeWidget()
  }, [])

  // Sound is now managed globally in app.tsx via useSound hook

  // const AdminLink = React.useMemo<
  //   React.FC<{ children: React.ReactNode }>
  // >(() => {
  //   if (me?.isAdmin) {
  //     return (props) => (
  //       <GhostButton href="/us" rel="external">
  //         {props.children}
  //       </GhostButton>
  //     )
  //   }
  //   return (props) => <>{props.children}</>
  // }, [me])

  return (
    <div className="flex flex-col gap-y-24">
      <div>
        <GhostButton href="/log">{userName || 'You'}</GhostButton>
        <div>
          <Clock format="dddd, MMMM D" interval={1e3 * 60} />
          {!!me?.city && `, ${me.city}`}
        </div>
      </div>

      {!!userTags.length && (
        <div>
          <Block label="Team:" blockView>
            <TagsContainer
              items={userTags.map((x) => (
                <Tag key={x!.name} color={x!.color}>{x!.name}</Tag>
              ))}
            />
          </Block>
        </div>
      )}

      <div>
        <Block label="Users online:" onClick={() => stores.goTo('sync')}>
          {formatNumberWithCommas(usersOnline)}
        </Block>
        <Block
          label="Total users:"
          onClick={
            me?.isAdmin
              ? () => {
                  window.location.href = '/us'
                }
              : undefined
          }
        >
          {formatNumberWithCommas(usersTotal)}
        </Block>
      </div>

      {/* Visitor Statistics */}
      {visitorStats && (
        <div>
          <Block label="Total LOT visitors:">
            {formatNumberWithCommas(visitorStats.totalSiteVisitors)}
          </Block>
          <Block label="My OS visitors:">
            {formatNumberWithCommas(visitorStats.userProfileVisits)}
          </Block>
        </div>
      )}

      <div>
        <TimeWidget />
        {!!weather && (
          <>
            <Block label="Sky:">{weather?.description || 'Unknown'}</Block>
            <Block label="Humidity:">
              <span
                className={cn(
                  !isMirrorOn && !isCustomThemeEnabled && weather?.humidity >= 50 && 'text-blue-500'
                )}
              >
                {weather?.humidity}%
              </span>
            </Block>
            <Block
              label={showWeatherSuggestion ? 'Suggestion:' : 'Temperature:'}
              onLabelClick={() => setShowWeatherSuggestion(!showWeatherSuggestion)}
              onChildrenClick={showWeatherSuggestion ? undefined : () => stores.isTempFahrenheit.set(!isTempFahrenheit)}
            >
              {showWeatherSuggestion ? (
                <span className="text-sm opacity-60">{weatherSuggestion || 'Beautiful day'}</span>
              ) : (
                <>
                  {temperature}
                  {isTempFahrenheit ? '℉' : '℃'}
                </>
              )}
            </Block>
            <Block
              label={showSunset ? 'Sunset:' : 'Sunrise:'}
              onClick={() => setShowSunset(!showSunset)}
            >
              {showSunset ? sunset : sunrise}
            </Block>
          </>
        )}
      </div>

      <div>
        <Block
          label={
            astrologyView === 'astrology' ? "Astrology:" :
            astrologyView === 'psychology' ? "Psychology:" :
            "My Journey:"
          }
          onLabelClick={() => {
            // Cycle through: Astrology → Psychology → Journey → Astrology
            setAstrologyView(prev =>
              prev === 'astrology' ? 'psychology' :
              prev === 'psychology' ? 'journey' :
              'astrology'
            )
          }}
        >
          {astrologyView === 'astrology' ? (
            <div className="inline-block">
              {astrology.westernZodiac} • {astrology.hourlyZodiac} • {astrology.rokuyo} • {astrology.moonPhase}
            </div>
          ) : astrologyView === 'psychology' ? (
            <div className="inline-block">
              {profile?.archetype || 'The Explorer'} • {profile?.coreValues?.slice(0, 2).join(' • ') || 'Growing'}
            </div>
          ) : (
            <div className="inline-block">
              <div>Day {journeyData.daysSinceStart} • {journeyData.answerCount} memories • Awareness {awarenessIndex}%</div>
              <div>{profile?.selfAwarenessLevel || 'Awakening'} • {profile?.emotionalPatterns?.[0] || 'Exploring patterns'}</div>
            </div>
          )}
        </Block>
      </div>

      <div>
        <Block
          label="Mirror:"
          onClick={() => stores.isMirrorOn.set(!isMirrorOn)}
        >
          {isMirrorOn ? 'On' : 'Off'}
        </Block>
        <Block
          label={showRadio ? 'Radio:' : 'Sound:'}
          onLabelClick={() => {
            // Toggle between Sound and Radio view
            setShowRadio(!showRadio)
            // Turn off the mode we're switching away from
            if (showRadio) {
              stores.isRadioOn.set(false)
            } else {
              stores.isSoundOn.set(false)
            }
          }}
          onChildrenClick={async () => {
            if (showRadio) {
              // Radio mode - toggle radio
              stores.isRadioOn.set(!isRadioOn)
            } else {
              // Sound mode - toggle sound
              const newValue = !isSoundOn
              // @ts-ignore - Tone.js loaded via external script
              if (newValue && window.Tone) {
                try {
                  await window.Tone.start()
                } catch (e) {
                  console.error('Failed to start Tone.context:', e)
                }
              }
              stores.isSoundOn.set(newValue)
            }
          }}
        >
          {showRadio
            ? (isRadioOn ? (radioTrackName ? `On (${radioTrackName})` : 'On') : 'Off')
            : (isSoundOn ? (soundDescription ? `On (${soundDescription})` : 'On') : 'Off')
          }
        </Block>
        <Block label="Breathe:" onClick={() => setIsBreatheOn(!isBreatheOn)}>
          {isBreatheOn ? breatheState.display : 'Off'}
        </Block>
      </div>

      {!!liveMessage && (
        <div>
          <Block label="Live:" blockView children={liveMessage} />
        </div>
      )}

      <RecipeWidget />

      <MemoryWidget />
    </div>
  )
}
