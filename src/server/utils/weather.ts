import axios from 'axios'
import config from '#server/config'
import { Weather } from '#shared/types'
import { COUNTRY_BY_ALPHA3 } from '#shared/constants'

export async function getTimeZone(
  lat: number,
  lng: number
): Promise<string | null> {
  const response = await axios.get(`http://api.geonames.org/timezoneJSON`, {
    params: {
      lat,
      lng,
      username: config.geonamesUsername,
    },
  })
  return response.data?.timezoneId || null
}

export async function getWeather(
  lat: number,
  lon: number
): Promise<Omit<Weather, 'createdAt'>> {
  const response = await axios.get<WeatherResponse>(
    `https://api.openweathermap.org/data/2.5/weather`,
    {
      params: {
        lat,
        lon,
        appid: config.openWeatherApiKey,
      },
    }
  )
  const data = response.data
  return {
    humidity: data?.main?.humidity ?? null,
    tempKelvin: data?.main?.temp ?? null,
    sunrise: data?.sys?.sunrise ?? null,
    sunset: data?.sys?.sunset ?? null,
  }
}

export async function getCoordinates(
  city: string,
  countryCode: string // alpha3
): Promise<GeoResponse | null> {
  const country = COUNTRY_BY_ALPHA3[countryCode]
  if (!country) return null
  const response = await axios(`http://api.openweathermap.org/geo/1.0/direct`, {
    params: {
      q: `${city},${country.alpha2}`,
      limit: 1,
      appid: config.openWeatherApiKey,
    },
  })
  const data = response.data?.[0]
  if (!data) return null
  if (data.country !== country.alpha2) return null
  return data
}

interface WeatherResponse {
  coord: {
    lon: number
    lat: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    sea_level: number
    grnd_level: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust: number
  }
  rain: {
    '1h': number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

interface GeoResponse {
  name: string
  local_names?: {
    [key: string]: string
  }
  lat: number
  lon: number
  country: string
  state: string
}
