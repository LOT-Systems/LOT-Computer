/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { Op } from 'sequelize'
import dayjs from '#server/utils/dayjs'
import { LogContext, User } from '#shared/types'
import { DATE_TIME_FORMAT, WEATHER_STALE_TIME_MINUTES } from '#shared/constants'
import { getAstrologyReading } from '#shared/utils/astrology'
import { models } from '../models/index.js'

export async function getLogContext(user: User): Promise<LogContext> {
  // Same reader the dashboard block uses (getAstrologyReading) so a Log's
  // ASTRO line always matches what the user saw on screen. Calendar fields
  // use the saved timeZone; moon phase uses the real instant (2026-11-11
  // fix — the old wall-clock Date skewed getTime() by the tz offset).
  const astro = getAstrologyReading(new Date(), user.timeZone)

  const context: LogContext = {
    temperature: null,
    humidity: null,
    weatherDescription: null,
    country: user.country,
    city: user.city,
    timeZone: user.timeZone,
    date: user.timeZone
      ? dayjs().tz(user.timeZone).format(DATE_TIME_FORMAT)
      : null,
    astroRokuyo: astro.rokuyo,
    astroMoonPhase: astro.moonPhase,
    astroMoonIllumination: astro.moonIllumination,
    astroHourlyZodiac: astro.hourlyZodiac,
    astroWesternZodiac: astro.westernZodiac,
    astroWindow: astro.window,
  }
  if (user.country && user.city) {
    const cachedWeather = await models.WeatherResponse.findOne({
      where: {
        city: user.city,
        country: user.country,
        createdAt: {
          [Op.gte]: dayjs()
            .subtract(WEATHER_STALE_TIME_MINUTES, 'minute')
            .toDate(),
        },
      },
      order: [['createdAt', 'DESC']],
    })
    if (cachedWeather) {
      context.temperature = cachedWeather.weather?.tempKelvin || null
      context.humidity = cachedWeather.weather?.humidity || null
      context.weatherDescription = cachedWeather.weather?.description || null
    }
  }
  return context
}
