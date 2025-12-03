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
  // Using Open-Meteo API (free, no API key required)
  const response = await axios.get<OpenMeteoWeatherResponse>(
    `https://api.open-meteo.com/v1/forecast`,
    {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure',
        daily: 'sunrise,sunset',
        timezone: 'auto', // Use location's actual timezone for correct sunrise/sunset times
      },
    }
  )
  const data = response.data
  const current = data.current
  const daily = data.daily

  // Open-Meteo returns Celsius - convert to Kelvin for consistency with existing code
  const tempCelsius = current.temperature_2m ?? null
  const tempKelvin = tempCelsius !== null ? tempCelsius + 273.15 : null

  // Parse sunrise/sunset times (API returns them in location's local timezone)
  const sunriseStr = daily.sunrise?.[0]
  const sunsetStr = daily.sunset?.[0]
  const utcOffsetSeconds = data.utc_offset_seconds

  // Convert to Unix timestamp (seconds)
  // Strategy: Parse as UTC (by adding 'Z'), then adjust for the location's timezone offset
  // Example: "16:45" in PST (UTC-8) means "00:45 UTC next day"
  //   - Parse "16:45Z" → Unix time for 16:45 UTC
  //   - Subtract offset (-28800) → adds 8 hours → correct Unix time for 16:45 PST
  const sunriseUnix = sunriseStr
    ? (Date.parse(sunriseStr + 'Z') / 1000) - utcOffsetSeconds
    : null
  const sunsetUnix = sunsetStr
    ? (Date.parse(sunsetStr + 'Z') / 1000) - utcOffsetSeconds
    : null

  console.log('[Weather API] Sunset debug:', {
    timezone: data.timezone,
    timezoneAbbr: data.timezone_abbreviation,
    utcOffsetSeconds,
    utcOffsetHours: utcOffsetSeconds / 3600,
    sunsetStr,
    sunsetUnix,
    sunsetDateUTC: sunsetUnix ? new Date(sunsetUnix * 1000).toISOString() : null,
    sunsetDateLocal: sunsetUnix ? new Date(sunsetUnix * 1000).toString() : null,
    lat,
    lon
  })

  return {
    temperature: tempCelsius,
    humidity: current.relative_humidity_2m ?? null,
    description: getWeatherDescription(current.weather_code) ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    pressure: current.surface_pressure ?? null,
    tempKelvin,
    sunrise: sunriseUnix,
    sunset: sunsetUnix,
  }
}

// Map Open-Meteo weather codes to descriptions
function getWeatherDescription(code: number | null): string | null {
  if (code === null) return null
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }
  return descriptions[code] || 'Unknown'
}

export async function getCoordinates(
  city: string,
  countryCode: string // alpha3
): Promise<GeoResponse | null> {
  const country = COUNTRY_BY_ALPHA3[countryCode]
  if (!country) return null

  // Using Open-Meteo Geocoding API (free, no API key required)
  const response = await axios.get<OpenMeteoGeocodingResponse>(
    `https://geocoding-api.open-meteo.com/v1/search`,
    {
      params: {
        name: city,
        count: 10, // Get multiple results to filter by country
        language: 'en',
        format: 'json',
      },
    }
  )

  const results = response.data?.results
  if (!results || results.length === 0) return null

  // Find the first result matching the country code
  const match = results.find(
    (r) => r.country_code?.toLowerCase() === country.alpha2.toLowerCase()
  )

  if (!match) return null

  return {
    name: match.name,
    lat: match.latitude,
    lon: match.longitude,
    country: match.country_code || country.alpha2,
    state: match.admin1 || '',
  }
}

// Open-Meteo API response types
interface OpenMeteoWeatherResponse {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    surface_pressure: number
  }
  daily: {
    sunrise: string[]
    sunset: string[]
  }
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string
    latitude: number
    longitude: number
    country: string
    country_code: string
    admin1?: string
    admin2?: string
  }>
}

interface GeoResponse {
  name: string
  lat: number
  lon: number
  country: string
  state: string
}
