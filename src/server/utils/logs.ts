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
import { getAstrologyReading, toWallClockDate } from '#shared/utils/astrology'
import { models } from '../models/index.js'

// Building a Date from a moment's local (timeZone-aware) wall-clock fields
// via the plain Date constructor round-trips correctly through the
// getHours()/getMonth()/getDate() readers astrology.ts uses, regardless of
// the server process's own runtime timeZone — so the reading reflects the
// user's saved timeZone rather than server-local time.
export async function getLogContext(user: User): Promise<LogContext> {
  const localMoment = user.timeZone ? dayjs().tz(user.timeZone) : dayjs()
  const astro = getAstrologyReading(toWallClockDate({
    year: localMoment.year(), month: localMoment.month(), date: localMoment.date(),
    hour: localMoment.hour(), minute: localMoment.minute(), second: localMoment.second(),
  }))

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
