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
import { useVisitorStats } from '#client/queries'
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

  const isTempFahrenheit = useStore(stores.isTempFahrenheit)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const isSoundOn = useStore(stores.isSoundOn)
  const soundDescription = useStore(stores.soundDescription)

  const [isBreatheOn, setIsBreatheOn] = React.useState(false)
  const breatheState = useBreathe(isBreatheOn)

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
              label="Temperature:"
              onClick={() => stores.isTempFahrenheit.set(!isTempFahrenheit)}
            >
              {temperature}
              {isTempFahrenheit ? '℉' : '℃'}
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
        <Block label="Astrology:">
          <div className="inline-block">
            {astrology.westernZodiac} • {astrology.hourlyZodiac} • {astrology.rokuyo} • {astrology.moonPhase}
          </div>
        </Block>
      </div>

      <div>
        <Block
          label="Mirror:"
          onClick={() => stores.isMirrorOn.set(!isMirrorOn)}
        >
          {isMirrorOn ? 'On' : 'Off'}
        </Block>
        <Block label="Sound:" onClick={() => stores.isSoundOn.set(!isSoundOn)}>
          {isSoundOn ? (soundDescription ? `On (${soundDescription})` : 'On') : 'Off'}
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
