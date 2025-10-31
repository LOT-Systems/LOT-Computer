import { Op } from 'sequelize'
import dayjs from '#server/utils/dayjs'
import { LogContext, User } from '#shared/types'
import { DATE_TIME_FORMAT, WEATHER_STALE_TIME_MINUTES } from '#shared/constants'
import { models } from '../models/index.js'

export async function getLogContext(user: User): Promise<LogContext> {
  const context: LogContext = {
    temperature: null,
    humidity: null,
    country: user.country,
    city: user.city,
    timeZone: user.timeZone,
    date: user.timeZone
      ? dayjs().tz(user.timeZone).format(DATE_TIME_FORMAT)
      : null,
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
    }
  }
  return context
}
