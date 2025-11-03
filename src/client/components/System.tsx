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
import { useExternalScript } from '#client/utils/hooks'
import dayjs from '#client/utils/dayjs'
import { getUserTagByIdCaseInsensitive } from '#shared/constants'
import { toCelsius, toFahrenheit } from '#shared/utils'
import { TimeWidget } from './TimeWidget'
import { MemoryWidget } from './MemoryWidget'

export const System = () => {
  const me = useStore(stores.me)
  const weather = useStore(stores.weather)
  const theme = useStore(stores.theme)

  const usersTotal = useStore(stores.usersTotal)
  const usersOnline = useStore(stores.usersOnline)
  const liveMessage = useStore(stores.liveMessage)

  const isTempFahrenheit = useStore(stores.isTempFahrenheit)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const [showSunset, setShowSunset] = React.useState(
    (() => {
      if (!weather) return false
      const now = dayjs()
      const sunrise = dayjs.utc(weather.sunrise * 1000).local()
      const sunset = dayjs.utc(weather.sunset * 1000).local()
      return now.isAfter(sunrise) && now.isBefore(sunset)
    })()
  )

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

  // useMirror(mirrorRef, isMirrorOn)

  const noise = React.useRef<any>(null)
  const [isSoundLibLoaded, setIsSoundLibLoaded] = React.useState(false)
  const [isSoundOn, setIsSoundOn] = React.useState(false)

  useExternalScript(
    'https://unpkg.com/tone',
    () => {
      console.log('Tone.js loaded')
      setIsSoundLibLoaded(true)
    },
    isSoundOn
  )

  React.useEffect(() => {
    // @ts-ignore
    const Tone: any = window.Tone
    ;(async () => {
      if (isSoundLibLoaded) {
        if (isSoundOn) {
          if (!noise.current) {
            await Tone.start()
            Tone.Destination.volume.setValueAtTime(-20, Tone.now())
            noise.current = new Tone.Noise('brown').start().toDestination()
          } else {
            noise.current?.start()
          }
        } else {
          noise.current?.stop()
        }
      }
    })()
    return () => {
      noise.current?.stop()
    }
  }, [isSoundOn, isSoundLibLoaded])

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
                <Tag key={x.name}>{x.name}</Tag>
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

      <div>
        <TimeWidget />
        {!!weather && (
          <>
            <Block label="Humidity:">
              <span
                className={cn(
                  weather?.humidity > 60 &&
                    theme === 'light' &&
                    'text-blue-light'
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
        <Block
          label="Mirror:"
          onClick={() => stores.isMirrorOn.set(!isMirrorOn)}
        >
          {isMirrorOn ? 'On' : 'Off'}
        </Block>
        <Block label="Sound:" onClick={() => setIsSoundOn(!isSoundOn)}>
          {isSoundOn ? 'On' : 'Off'}
        </Block>
      </div>

      {!!liveMessage && (
        <div>
          <Block label="Live:" blockView children={liveMessage} />
        </div>
      )}

      <MemoryWidget />
    </div>
  )
}
