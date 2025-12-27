import { atom } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'
import { UserProfile, WeatherRecord } from '#shared/types'

// static
export const me = atom<UserProfile | null>(null)
export const isTouchDevice = atom<boolean>(
  'ontouchstart' in window || navigator.maxTouchPoints > 0
)
export const usersTotal = atom<number>(0)
export const usersOnline = atom<number>(0)
export const liveMessage = atom<string>('')

export const isMirrorOn = atom<boolean>(false)
export const isSoundOn = atom<boolean>(false)
export const soundDescription = atom<string>('')
export const isRadioOn = atom<boolean>(false)
export const radioTrackName = atom<string>('')

export const weather = atom<WeatherRecord | null>(null)

// connection status
export const isConnected = atom<boolean>(true)
export const lastUpdate = atom<Date | null>(null)
export const appVersion = atom<string>('')

// static + localStorage
export const isTimeFormat12h = persistentAtom<boolean>(
  'isTimeFormat12h',
  true,
  {
    encode: (value) => value.toString(),
    decode: (value) => value === 'true',
  }
)
export const isTempFahrenheit = persistentAtom<boolean>(
  'isTempFahrenheit',
  true,
  {
    encode: (value) => value.toString(),
    decode: (value) => value === 'true',
  }
)

// Track last answered Memory question to prevent re-showing after tab switches
export const lastAnsweredMemoryQuestionId = persistentAtom<string | null>(
  'lastAnsweredMemoryQuestionId',
  null,
  {
    encode: (value) => value || '',
    decode: (value) => value || null,
  }
)

// computed
// ...
