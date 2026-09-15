/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { Op } from 'sequelize'
import dayjs from '#server/utils/dayjs'
import { Log, LogContext, User } from '#shared/types'
import { DATE_TIME_FORMAT, WEATHER_STALE_TIME_MINUTES } from '#shared/constants'
import { getHourlyZodiac, getWesternZodiac, getMoonPhase, getRokuyo } from '#shared/utils/astrology'
import { models } from '../models/index.js'
import {
  buildInterventionUserState,
  generateCompassionateInterventions,
  shouldShowIntervention,
  Intervention,
} from './compassionate-interventions.js'

// Building a Date from a moment's local (timeZone-aware) wall-clock fields
// via the plain Date constructor round-trips correctly through the
// getHours()/getMonth()/getDate() readers astrology.ts uses, regardless of
// the server process's own runtime timeZone — so the reading reflects the
// user's saved timeZone rather than server-local time.
function toWallClockDate(moment: dayjs.Dayjs): Date {
  return new Date(moment.year(), moment.month(), moment.date(), moment.hour(), moment.minute(), moment.second())
}

// Coarse sky read from the vendor's free-text weather description — a
// single glyph-ready word rather than the raw prose string. Order matters:
// first matching bucket wins, so more specific conditions (storm) are
// checked before their broader family (rain).
const SKY_BUCKETS: [string, RegExp][] = [
  ['storm', /thunder|storm/],
  ['snow', /snow|sleet|blizzard/],
  ['rain', /rain|drizzle|shower/],
  ['fog', /fog|mist|haze/],
  ['overcast', /overcast/],
  ['cloudy', /cloud/],
  ['clear', /clear|sun/],
]

function deriveSky(weatherDescription: string | null | undefined): string | null {
  if (!weatherDescription) return null
  const lower = weatherDescription.toLowerCase()
  for (const [sky, pattern] of SKY_BUCKETS) {
    if (pattern.test(lower)) return sky
  }
  return null
}

export async function getLogContext(user: User): Promise<LogContext> {
  const localMoment = user.timeZone ? dayjs().tz(user.timeZone) : dayjs()
  const localDate = toWallClockDate(localMoment)
  const moonPhase = getMoonPhase(localDate)

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
    astroRokuyo: getRokuyo(localDate),
    astroMoonPhase: moonPhase.phase,
    astroMoonIllumination: moonPhase.illumination,
    astroHourlyZodiac: getHourlyZodiac(localDate),
    astroWesternZodiac: getWesternZodiac(localDate),
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
  context.sky = deriveSky(context.weatherDescription)
  return context
}

// Follow-up types that read as "the machine noticed something about THIS
// entry" — celebration/validation/permission are general System-tab content,
// not a reaction to a single log, so they're excluded here.
const FOLLOW_UP_TYPES: Intervention['type'][] = ['urgent_care', 'gentle_warning', 'pattern_awareness']
const FOLLOW_UP_EVENT = 'qie_followup'
const FOLLOW_UP_HISTORY_WINDOW = 100
const FOLLOW_UP_MIN_LOGS = 5

/**
 * Passive follow-up detection for a single Log entry.
 *
 * Reuses the compassionate-interventions engine (already live behind
 * GET /interventions and the System-tab Care widget, but until now never
 * consulted from the Log tab itself) to decide whether the entry the
 * operator just wrote is part of a spike or a pattern change worth a
 * gentle, non-blocking reply — written back into the Log as its own entry,
 * not as a popup or a required answer.
 *
 * Returns null when nothing rises to follow-up severity, when there isn't
 * enough history yet to read a pattern, or while the relevant intervention
 * type is still in cooldown (shouldShowIntervention).
 */
export async function maybeCreateEntryFollowUp(user: User, sourceLogId: string): Promise<Log | null> {
  const logs = await models.Log.findAll({
    where: { userId: user.id },
    order: [['createdAt', 'DESC']],
    limit: FOLLOW_UP_HISTORY_WINDOW,
  })
  if (logs.length < FOLLOW_UP_MIN_LOGS) return null

  const userState = buildInterventionUserState(logs as unknown as Log[])
  const interventions = generateCompassionateInterventions(userState)
  const candidate = interventions.find(i => FOLLOW_UP_TYPES.includes(i.type))
  if (!candidate) return null

  const lastFollowUp = logs.find(l => l.event === FOLLOW_UP_EVENT)
  const lastShownTimes: Record<string, string> = lastFollowUp
    ? { [lastFollowUp.metadata?.interventionType as string]: dayjs(lastFollowUp.createdAt).toISOString() }
    : {}
  if (!shouldShowIntervention(candidate.type, lastShownTimes, candidate.severity)) return null

  const context = await getLogContext(user)
  const text = candidate.suggestion ? `${candidate.message} ${candidate.suggestion}` : candidate.message

  const followUp = await models.Log.create({
    userId: user.id,
    text,
    event: FOLLOW_UP_EVENT,
    context,
    metadata: {
      interventionType: candidate.type,
      severity: candidate.severity,
      title: candidate.title,
      sourceLogId,
    },
  })

  return followUp as unknown as Log
}
