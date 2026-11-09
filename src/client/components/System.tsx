/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import {
  Block,
  GhostButton,
  Clock,
  Tag,
  TagsContainer,
  Table,
  WidgetErrorBoundary,
} from '#client/components/ui'
import { cn, formatNumberWithCommas } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { getUserTagByIdCaseInsensitive } from '#shared/constants'
import { toCelsius, toFahrenheit } from '#shared/utils'
import { getHourlyZodiac, getWesternZodiac, getMoonPhase, getRokuyo } from '#shared/utils/astrology'
import { useBreathe } from '#client/utils/breathe'
import { useProfile, useLogs, useCommunityEmotion } from '#client/queries'
import { useEvolutionSync } from '#client/hooks/useEvolutionSync'
import { UserTag } from '#shared/types'
import { TimeWidget } from './TimeWidget'
import { QuantumRandomWidget } from './QuantumRandomWidget'
import { MemoryWidget } from './MemoryWidget'
import { RecipeWidget } from './RecipeWidget'
import { MonthlyPulseWidget } from './MonthlyPulseWidget'
import { EmotionalCheckIn } from './EmotionalCheckIn'
import { SelfCareMoments } from './SelfCareMoments'
import { IntentionsWidget } from './IntentionsWidget'
import { SubscribeWidget } from './SubscribeWidget'
import { PlannerWidget } from './PlannerWidget'
import { PatternInsightsWidget } from './PatternInsightsWidget'
import { MoodAnalytics } from './MoodAnalytics'
import { GoalJourneyWidget } from './GoalJourneyWidget'
import { ContextualPromptsWidget } from './ContextualPromptsWidget'
import { EnergyCapacitor } from './EnergyCapacitor'
import { NarrativeWidget } from './NarrativeWidget'
import { InterventionsWidget } from './InterventionsWidget'
import { ChatCatalystWidget } from './ChatCatalystWidget'
import { SystemProgressWidget } from './SystemProgressWidget'
import { SystemPulseWidget } from './SystemPulseWidget'
import { EvolutionWidget } from './EvolutionWidget'
import { CohortConnectWidget } from './CohortConnectWidget'
import { InterfaceEvolutionWidget } from './InterfaceEvolutionWidget'
import { EvolutionMilestoneToast } from './EvolutionMilestoneToast'
import { MicroCalculatorWidget } from './MicroCalculatorWidget'
import { MicroImageWidget } from './MicroImageWidget'
import { checkRecipeWidget } from '#client/stores/recipeWidget'
import { checkPlannerWidget } from '#client/stores/plannerWidget'
import { getOptimalWidget, shouldShowWidget, getUserState, getUserIndex, analyzeIntentions, classifyPhysiologicalCohort, intentionEngine, recordAstrologySignal, getCircadianPhase } from '#client/stores/intentionEngine'
import { QuantumStateWidget } from './QuantumStateWidget'
import { SignalStreamWidget } from './SignalStreamWidget'
import { PatternRecognitionWidget } from './PatternRecognitionWidget'
import { UserMetricsWidget } from './UserMetricsWidget'
import { AIFeedbackWidget } from './AIFeedbackWidget'
import { CorrelatedIndexesWidget } from './CorrelatedIndexesWidget'

import { CollectiveConsciousness, WellnessPulse, MemoryEngineStats, IntentionPatterns, BadgeUnlockFeed, GrowthMilestones } from './stats'
import { getConvergenceSignal, getAmbientIntensity } from '#client/utils/communityPulse'
import { FlashDriveManifest } from './FlashDriveManifest'
import { AngelInvestorWidget } from './AngelInvestorWidget'
import { CorporatePlanWidget } from './CorporatePlanWidget'
import { DemoDayWidget } from './DemoDayWidget'
import { FourDimensionalUI } from './FourDimensionalUI'
import { QuantumSignWidget } from './QuantumSignWidget'
import { MicroGameWidget } from './MicroGameWidget'
import { CosmicUpdateWidget } from './CosmicUpdateWidget'
import { QuantumEngineWidgets } from './QuantumEngineWidgets'
import { ChakraErgonomicsWidget } from './ChakraErgonomicsWidget'
import { CalendarWidget } from './CalendarWidget'
import { BenchmarkWidget } from './BenchmarkWidget'
import { ArchitectWidget } from './ArchitectWidget'
import { IntegrityWidget } from './IntegrityWidget'
import { recomputeAssembly } from '#client/stores/selfAssembly'
import { $layoutDensity } from '#client/stores/evolution'
import { useInViewport } from '#client/hooks/useInViewport'

// Defers mount of children until element first enters the viewport.
// Once mounted, stays mounted — no unmount on scroll away.
// Prevents heavy store subscriptions from running before the widget is needed.
function LazyMount({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inViewport = useInViewport(ref)
  return <div ref={ref}>{inViewport ? children : null}</div>
}

function LoadingDots() {
  const [dots, setDots] = React.useState(1)
  React.useEffect(() => {
    const id = setInterval(() => setDots(d => d === 3 ? 1 : d + 1), 500)
    return () => clearInterval(id)
  }, [])
  return <span className="opacity-40">{'·'.repeat(dots)}</span>
}

export const System = React.memo(function SystemInner() {
  const me = useStore(stores.me)
  const weather = useStore(stores.weather)
  const theme = useStore(stores.theme)
  const isCustomThemeEnabled = useStore(stores.isCustomThemeEnabled)

  const usersTotal = useStore(stores.usersTotal)
  const usersOnline = useStore(stores.usersOnline)
  const liveMessage = useStore(stores.liveMessage)
  const myProfileVisits: number = (me as any)?.metadata?.profileVisits ?? 0

  const { data: profile } = useProfile()
  const { data: logs = [] } = useLogs()
  const { data: communityEmotion } = useCommunityEmotion()


  const isTempFahrenheit = useStore(stores.isTempFahrenheit)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const isSoundOn = useStore(stores.isSoundOn)
  const soundDescription = useStore(stores.soundDescription)
  const isRadioOn = useStore(stores.isRadioOn)
  const radioTrackName = useStore(stores.radioTrackName)

  // Layout density — progressive condensation from breathable to instrument
  const density = useStore($layoutDensity)

  const [isBreatheOn, setIsBreatheOn] = React.useState(false)
  const breatheState = useBreathe(isBreatheOn)
  const [showRadio, setShowRadio] = React.useState(false)
  const [astrologyView, setAstrologyView] = React.useState<'astrology' | 'psychology' | 'journey' | 'quantum'>('astrology')
  const [showWeatherSuggestion, setShowWeatherSuggestion] = React.useState(false)
  const [isSoundToggling, setIsSoundToggling] = React.useState(false)
  const [showSharedEmotion, setShowSharedEmotion] = React.useState(false)
  const [selectedQuantumCell, setSelectedQuantumCell] = React.useState(0)

  // Compute whether to show sunset or sunrise based on current time
  // Show sunset during daytime (between sunrise and sunset)
  // Show sunrise during nighttime (before sunrise or after sunset)
  const defaultShowSunset = React.useMemo(() => {
    if (!weather || weather.sunrise == null || weather.sunset == null) return false
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
    const celsius = toCelsius(weather.tempKelvin)
    return Math.round(
      isTempFahrenheit ? toFahrenheit(celsius) : celsius
    )
  }, [weather, isTempFahrenheit])

  const { sunset, sunrise } = React.useMemo(() => {
    if (!weather || weather.sunrise == null || weather.sunset == null) return { sunset: null, sunrise: null }
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

  // Astrology recompute cadence — a plain [] useMemo only ever reads the
  // clock at mount, so a tab left open drifts stale across zodiac-hour/day
  // boundaries. Re-tick every 15 min, paused off-tab per the established
  // background-work-off-tab doctrine (see SystemProgressWidget).
  const [astrologyTick, setAstrologyTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setAstrologyTick(t => t + 1)
    }, 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // Astrology calculations — ambient conditions (zodiac hour, moon phase,
  // rokuyo), not a personal natal chart.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astrologyTick])

  // Synchronize the ambient astrology reading into the QIE signal bus once
  // per calendar day, so other widgets (cosmic, system) can react to it.
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const today = dayjs().format('YYYY-MM-DD')
    const lastRecordedKey = 'astrology_signal_date'
    if (localStorage.getItem(lastRecordedKey) === today) return
    recordAstrologySignal(
      astrology.rokuyo,
      astrology.moonPhase,
      astrology.moonIllumination,
      astrology.hourlyZodiac,
      astrology.westernZodiac
    )
    localStorage.setItem(lastRecordedKey, today)
  }, [astrology.rokuyo, astrology.moonPhase, astrology.moonIllumination, astrology.hourlyZodiac, astrology.westernZodiac])

  const answerLogs = React.useMemo(() => {
    return logs.filter(log => log.event === 'answer')
  }, [logs])

  // Journey calculations
  const journeyData = React.useMemo(() => {
    const answerCount = answerLogs.length

    // Calculate days since first answer
    let daysSinceStart = 0
    if (answerLogs.length > 0) {
      const firstAnswer = answerLogs[answerLogs.length - 1] // Oldest first
      daysSinceStart = dayjs().diff(dayjs(firstAnswer.createdAt), 'day')
    }

    return {
      daysSinceStart: daysSinceStart > 0 ? daysSinceStart : answerCount > 0 ? 1 : 0,
      answerCount,
    }
  }, [answerLogs])

  // Quantum state - analyze intentions and get current user state
  // useEffect (not useMemo) so atom writes happen after paint, not during render.
  // Writing to nanostores atoms inside useMemo cascades 10 synchronous re-renders
  // before the browser can paint, causing visible UI lag on every logs change.
  const [quantumState, setQuantumState] = React.useState(() => getUserState())
  React.useEffect(() => {
    analyzeIntentions()
    recomputeAssembly()
    setQuantumState(getUserState())
  }, [logs])

  // Physiological cohort — live archetype classification from signal state
  const physiologicalCohort = React.useMemo(() => {
    const eng = intentionEngine.get()
    if (!eng.signals || eng.signals.length === 0) return null
    return classifyPhysiologicalCohort(eng.signals, quantumState, eng.recognizedPatterns ?? [])
  }, [quantumState])

  // Accumulative User Index - holistic score from all widget signals
  const userIndex = React.useMemo(() => {
    return getUserIndex()
  }, [logs])

  // Calculate streak for evolution system
  const evolutionStreak = React.useMemo(() => {
    if (answerLogs.length === 0) return 0

    // Get unique days with answers
    const uniqueDays = new Set(
      answerLogs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
    )
    const sortedDays = Array.from(uniqueDays).sort().reverse()

    // Calculate streak (consecutive days including today or yesterday)
    let streakDays = 0
    const today = dayjs().format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

    if (sortedDays.length > 0 && (sortedDays[0] === today || sortedDays[0] === yesterday)) {
      const startOffset = sortedDays[0] === today ? 0 : 1
      for (let i = 0; i < sortedDays.length; i++) {
        const expectedDay = dayjs().subtract(i + startOffset, 'day').format('YYYY-MM-DD')
        if (sortedDays[i] === expectedDay) {
          streakDays++
        } else {
          break
        }
      }
    }
    return streakDays
  }, [answerLogs])

  // Sync evolution state with achievements and progression
  useEvolutionSync(logs.length, evolutionStreak)

  // Calculate awareness index from backend selfAwarenessLevel (0-100) to percentage (0-10%)
  // Long-term growth with decimal precision (e.g., 2.3%, 5.7%)
  const awarenessIndex = React.useMemo(() => {
    if (!profile?.hasUsership) return '0.0'
    if (typeof profile.selfAwarenessLevel !== 'number') return '0.0'
    return (profile.selfAwarenessLevel / 10).toFixed(1)
  }, [profile])

  // Weather suggestion based on temperature (stable - doesn't change on re-render)
  const weatherSuggestion = React.useMemo(() => {
    if (!weather || !weather.tempKelvin) return null
    const celsius = toCelsius(weather.tempKelvin)

    const suggestions = {
      cold: [
        'Perfect for warm tea',
        'Cozy day ahead',
        'Layer up and enjoy',
        'Hot drink weather',
        'Time for comfort food',
        'Bundle up warmly'
      ],
      cool: [
        'Great day for a walk',
        'Perfect weather ahead',
        'Comfortable outside',
        'Fresh air day',
        'Ideal for movement',
        'Pleasant conditions'
      ],
      hot: [
        'Stay cool, hydrate',
        'Find some shade',
        'Keep water close',
        'Take it easy today',
        'Stay refreshed',
        'Cool down often'
      ],
      mild: [
        'Beautiful day outside',
        'Lovely weather today',
        'Perfect conditions',
        'Enjoy the moment',
        'Great day ahead',
        'Nice and balanced'
      ]
    }

    let options: string[]
    if (celsius < 10) options = suggestions.cold
    else if (celsius < 18) options = suggestions.cool
    else if (celsius > 28) options = suggestions.hot
    else options = suggestions.mild

    // Use temperature as seed for stable randomization (same temp = same suggestion)
    const seed = Math.floor(celsius * 10)
    const index = seed % options.length
    return options[index]
  }, [weather])

  const optimalWidget = React.useMemo(() => getOptimalWidget(), [logs])

  // Community pulse — atmosphere layer
  const convergence = React.useMemo(() => getConvergenceSignal(), [])
  const ambientIntensity = React.useMemo(() => getAmbientIntensity(), [])

  // Temporal Planner — next scheduled calendar entry, from QIE signal pipeline
  const upcomingCalendar = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const entries = logs
      .filter(log => log.event === 'calendar_entry' && log.metadata?.date && (log.metadata.date as string) >= today)
      .map(log => ({
        date: log.metadata!.date as string,
        text: (log.metadata!.text as string) || log.text || '',
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return { next: entries[0] ?? null, count: entries.length }
  }, [logs])

  // Check for recipe and planner suggestions when component mounts
  React.useEffect(() => {
    checkRecipeWidget()
    checkPlannerWidget()
  }, [])

  // Sound is now managed globally in app.tsx via useSound hook

  // Paid account check — R&D and Usership get the full condensed pro layout
  const isPaidAccount = React.useMemo(() => {
    if (!me?.tags) return false
    return me.tags.some((tag) =>
      tag.toLowerCase() === UserTag.Usership.toLowerCase() ||
      tag.toLowerCase() === UserTag.RND.toLowerCase()
    )
  }, [me])

  // Simple, clean layout for non-paid accounts — no AI, just essentials
  if (!isPaidAccount) {
    return (
      <div className="flex flex-col gap-y-24">
        <div>
          <GhostButton href="/log">{userName || 'You'}</GhostButton>
          <div>
            Week {dayjs().isoWeek()};{' '}
            <Clock format="MMMM D, dddd" interval={1e3 * 60} />
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
          <Block label="Users online:">{formatNumberWithCommas(usersOnline)}</Block>
          <Block label="Total LOT® users:">{formatNumberWithCommas(usersTotal)}</Block>
        </div>

        <div>
          <WidgetErrorBoundary name="Time">
            <TimeWidget />
          </WidgetErrorBoundary>
          {!!weather && (
            <>
              <Block label="Sky:">{weather?.description || 'Unknown'}</Block>
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
            <div>
              {astrology.westernZodiac} • {astrology.hourlyZodiac} • {astrology.rokuyo} • {astrology.moonPhase} ({astrology.moonIllumination}%)
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
          <Block
            label={showRadio ? 'Radio:' : 'Sound:'}
            onLabelClick={() => {
              setShowRadio(!showRadio)
              if (showRadio) {
                stores.isRadioOn.set(false)
              } else {
                stores.isSoundOn.set(false)
              }
            }}
            onChildrenClick={() => {
              if (isSoundToggling) return
              setIsSoundToggling(true)
              try {
                if (showRadio) {
                  stores.isRadioOn.set(!isRadioOn)
                } else {
                  stores.isSoundOn.set(!isSoundOn)
                }
              } finally {
                setTimeout(() => setIsSoundToggling(false), 300)
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

        <WidgetErrorBoundary name="Memory">
          <MemoryWidget />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary name="Game">
          <MicroGameWidget />
        </WidgetErrorBoundary>

        <WidgetErrorBoundary name="Subscribe">
          <SubscribeWidget />
        </WidgetErrorBoundary>

        <div aria-hidden="true" data-lot-genesis="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}>
          LOT Systems — The copycats have entered the arena. We welcome the competition.
          They can replicate the pixels but never the soul. Built different since day one.
        </div>
      </div>
    )
  }

  // Full pro layout for R&D and Usership — density evolves with mastery
  return (
    <div className={cn('flex flex-col', density.sectionGap)}>
      <div>
        <GhostButton href="/log">{userName || 'You'}</GhostButton>
        <div>
          Week {dayjs().isoWeek()};{' '}
          <Clock format="MMMM D, dddd" interval={1e3 * 60} />
          {!!me?.city && `, ${me.city}`}
        </div>
      </div>

      {/* Recipe / Fasting guidance — promoted to the top section so it
          reads as the first thing the user sees at mealtime. On
          Christian fasting days the widget gradually degrades from a
          light plant-based snack to water-only rest (see
          #client/utils/fasting.ts). */}
      <WidgetErrorBoundary name="MonthlyPulse">
        <MonthlyPulseWidget />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary name="Recipe">
        <RecipeWidget />
      </WidgetErrorBoundary>

      {/* Community Convergence Pulse — atmosphere layer */}
      <WidgetErrorBoundary name="Pulse">
        <div className={cn('convergence-pulse', `convergence-${convergence.phase}`)}>
          <div style={{ opacity: 0.35 + ambientIntensity * 0.4 }}>
            {convergence.narrative}
          </div>
        </div>
      </WidgetErrorBoundary>

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
        <Block
          label={showSharedEmotion ? "Shared emotion:" : "Users online:"}
          onClick={() => setShowSharedEmotion(!showSharedEmotion)}
        >
          {showSharedEmotion ? (
            communityEmotion?.sharedEmotion ? (
              <span className="capitalize">{communityEmotion.sharedEmotion}</span>
            ) : (
              'Calculating...'
            )
          ) : (
            formatNumberWithCommas(usersOnline)
          )}
        </Block>
        <Block label="Total LOT® users:">
          {me?.isAdmin ? (
            <GhostButton href="/us" rel="external">
              {formatNumberWithCommas(usersTotal)}
            </GhostButton>
          ) : (
            formatNumberWithCommas(usersTotal)
          )}
        </Block>
        <Block label="My OS visitors:">
          {formatNumberWithCommas(myProfileVisits)}
        </Block>
      </div>

      <div>
        <WidgetErrorBoundary name="Time">
          <TimeWidget />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary name="QuantumRandom">
          <QuantumRandomWidget />
        </WidgetErrorBoundary>
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
                <span>{weatherSuggestion || 'Beautiful day'}</span>
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
            astrologyView === 'journey' ? "My Journey:" :
            "Biofield:"
          }
          onLabelClick={() => {
            // Cycle through: Astrology → Psychology → Journey → Quantum → Astrology
            setAstrologyView(prev =>
              prev === 'astrology' ? 'psychology' :
              prev === 'psychology' ? 'journey' :
              prev === 'journey' ? 'quantum' :
              'astrology'
            )
          }}
        >
          {astrologyView === 'astrology' ? (
            <div>
              {astrology.westernZodiac} • {astrology.hourlyZodiac} • {astrology.rokuyo} • {astrology.moonPhase} ({astrology.moonIllumination}%)
            </div>
          ) : astrologyView === 'psychology' ? (
            <div>
              {profile?.archetype || 'The Explorer'} • {profile?.coreValues?.slice(0, 2).join(' • ') || 'Growing'}
            </div>
          ) : astrologyView === 'journey' ? (
            <div>
              <div>Day {journeyData.daysSinceStart} • {journeyData.answerCount} memories • Awareness {awarenessIndex}%</div>
              <div>{profile?.behavioralCohort || 'Growing'} • {profile?.emotionalPatterns?.[0] || 'Exploring patterns'}</div>
              {userIndex.overall > 0 && (
                <div className="mt-4">
                  Index {userIndex.overall}% {userIndex.trend === 'rising' ? '↑' : userIndex.trend === 'declining' ? '↓' : '—'}
                </div>
              )}
            </div>
          ) : (
            <Table
              data={[
                { metric: 'Archetype', value: physiologicalCohort?.archetype ?? '—' },
                { metric: 'Cohort', value: physiologicalCohort?.dominantModule ?? '—' },
                { metric: 'Phase', value: getCircadianPhase() },
                { metric: 'Confidence', value: physiologicalCohort ? `${physiologicalCohort.confidence}%` : '—' },
                { metric: 'ATP', value: quantumState.energy },
                { metric: 'Clarity', value: quantumState.clarity },
                { metric: 'Alignment', value: quantumState.alignment },
                { metric: 'Index', value: `${userIndex.overall}%` },
                { metric: 'Directive', value: physiologicalCohort?.directive ?? '—' }
              ]}
              columns={[
                {
                  id: 'metric',
                  header: 'Metric',
                  accessor: (row) => <span className="capitalize">{row.metric}</span>
                },
                {
                  id: 'value',
                  header: 'Value',
                  accessor: (row) => <span className="capitalize">{row.value}</span>
                }
              ]}
              paddingClassName="p-8"
              selectedRowIndex={selectedQuantumCell}
              onRowClick={(index) => setSelectedQuantumCell(index)}
            />
          )}
        </Block>
      </div>

      {/* Temporal Planner — next scheduled entry surfaced from QIE calendar module */}
      {upcomingCalendar.next && (
        <div>
          <Block label="Next:">
            {dayjs(upcomingCalendar.next.date).format('ddd, MMMM D')}
            {' — '}
            {upcomingCalendar.next.text}
            {upcomingCalendar.count > 1 && ` (+${upcomingCalendar.count - 1} more)`}
          </Block>
        </div>
      )}

      {/* Context stack */}
      <WidgetErrorBoundary name="Context">
        <div className={cn('flex flex-col', density.sectionGap)}>
          {/* Contextual Prompts - Show pattern-based suggestions based on current context */}
          <ContextualPromptsWidget />

          {/* Chat Catalyst - Prompts to connect with cohort members when online */}
          <ChatCatalystWidget />

          {/* Interventions - Compassionate care based on semantic struggle detection */}
          <InterventionsWidget />
        </div>
      </WidgetErrorBoundary>

      {/* CQGS Bioethics stack */}
      <WidgetErrorBoundary name="Bioethics">
        <div className={cn('flex flex-col', density.stackGap)}>
          {/* Biofield Capacitor - Track ATP energy depletion/replenishment */}
          <EnergyCapacitor />

          {/* Chakra Ergonomics - Seven-chakra energy map + session ergonomics */}
          <ChakraErgonomicsWidget />

          {/* Narrative - Story progression and achievements */}
          <NarrativeWidget />

          {/* Goal Journey - Detected goals, journey stages, and narrative arc */}
          <GoalJourneyWidget />

          {/* Citizen Index - CQGS growth indicators */}
          <EvolutionWidget />

          {/* Interface Evolution - Progression & feature unlocks */}
          <InterfaceEvolutionWidget />

          {/* Evolution Milestone Toast - Subtle notifications for progression milestones */}
          <EvolutionMilestoneToast />
        </div>
      </WidgetErrorBoundary>

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
          onChildrenClick={() => {
            if (isSoundToggling) return
            setIsSoundToggling(true)
            try {
              if (showRadio) {
                stores.isRadioOn.set(!isRadioOn)
              } else {
                stores.isSoundOn.set(!isSoundOn)
              }
            } finally {
              setTimeout(() => setIsSoundToggling(false), 300)
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

      {/* Biofield Check-In - Show every 3 hours max, context-based on time of day */}
      {/* Widget controls its own visibility internally to allow farewell animations */}
      <WidgetErrorBoundary name="Check-in">
        <EmotionalCheckIn />
      </WidgetErrorBoundary>

      {/* Cleanness Module - Show during rest/refresh times OR when intention engine detects need */}
      <WidgetErrorBoundary name="Self-care">
        {(() => {
          const hour = new Date().getHours()
          const isMidMorning = hour >= 10 && hour < 12 // Pre-lunch break
          const isAfternoon = hour >= 14 && hour < 17 // Post-lunch slump
          const isEvening = hour >= 19 && hour < 22 // Evening wind-down

          // Check cooldown (3 hours since last interaction)
          const lastInteraction = localStorage.getItem('self-care-last-interaction')
          const threeHoursMs = 3 * 60 * 60 * 1000
          const cooldownPassed = !lastInteraction ||
            (Date.now() - parseInt(lastInteraction)) >= threeHoursMs

          // Don't show if cooldown hasn't passed
          if (!cooldownPassed) return null

          // Check if completed self-care today
          const today = new Date().toDateString()
          const stored = localStorage.getItem('self-care-completed')
          let completedToday = 0
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (parsed.date === today) {
                completedToday = parsed.count
              }
            } catch (e) {}
          }

          const intentionSuggestsSelfCare = optimalWidget?.widget === 'selfcare'

          // Show if:
          // 1. Intention engine detects anxiety/overwhelm patterns, OR
          // 2. During key times, especially if haven't done self-care yet
          const shouldShow = intentionSuggestsSelfCare || isMidMorning || isAfternoon || isEvening || completedToday === 0

          if (!shouldShow) return null

          // Store quantum reasoning for widget to display
          if (intentionSuggestsSelfCare && optimalWidget?.reason) {
            localStorage.setItem('selfcare-quantum-reason', optimalWidget.reason)
          } else {
            localStorage.removeItem('selfcare-quantum-reason')
          }

          return <div><SelfCareMoments /></div>
        })()}
      </WidgetErrorBoundary>

      {/* Intentions - Show if user has intention OR when intention engine detects seeking-direction pattern */}
      <WidgetErrorBoundary name="Intentions">
        {(() => {
          const hasIntention = !!localStorage.getItem('current-intention')

          // Check cooldown (2-3 days since last shown)
          const lastShown = localStorage.getItem('intentions-last-shown')
          const twoDaysMs = 2 * 24 * 60 * 60 * 1000
          const threeDaysMs = 3 * 24 * 60 * 60 * 1000

          // Random cooldown between 2-3 days
          const cooldownPeriod = twoDaysMs + Math.random() * (threeDaysMs - twoDaysMs)
          const cooldownPassed = !lastShown || (Date.now() - parseInt(lastShown)) >= cooldownPeriod

          const intentionSuggestsIntentions = optimalWidget?.widget === 'intentions'

          // Show if:
          // 1. User has an existing intention to display, OR
          // 2. Intention engine detects seeking-direction or morning-clarity patterns, OR
          // 3. Cooldown passed (fallback for periodic prompting)
          if (hasIntention || intentionSuggestsIntentions || cooldownPassed) {
            // Update last shown time
            if (!lastShown || cooldownPassed || intentionSuggestsIntentions) {
              localStorage.setItem('intentions-last-shown', Date.now().toString())
            }

            // Store quantum reasoning for widget to display
            if (intentionSuggestsIntentions && optimalWidget?.reason) {
              localStorage.setItem('intentions-quantum-reason', optimalWidget.reason)
            } else {
              localStorage.removeItem('intentions-quantum-reason')
            }

            return <div><IntentionsWidget /></div>
          }

          return null
        })()}
      </WidgetErrorBoundary>

      {/* Subscribe - Show occasionally to engaged users without subscription */}
      <WidgetErrorBoundary name="Subscribe">
        {(() => {
          // Don't show if user already has R&D or Usership tags
          const hasSubscription = me?.tags.some((tag) =>
            tag.toLowerCase() === UserTag.Usership.toLowerCase() ||
            tag.toLowerCase() === UserTag.RND.toLowerCase()
          )
          if (hasSubscription) return null

          if (answerLogs.length < 10) return null

          // Check if clicked recently (10 days cooldown)
          const lastClicked = localStorage.getItem('subscribe-clicked')
          const tenDaysMs = 10 * 24 * 60 * 60 * 1000
          if (lastClicked && (Date.now() - parseInt(lastClicked)) < tenDaysMs) {
            return null
          }

          // Random 20% chance to show when all conditions met
          const shouldShow = Math.random() < 0.2
          return shouldShow && <div><SubscribeWidget /></div>
        })()}
      </WidgetErrorBoundary>

      {/* Community stack — LOT community is original and inimitable */}
      <WidgetErrorBoundary name="Community">
        <div className={cn('flex flex-col', density.stackGap)}>
          {/* Pattern Insights - Show user's discovered patterns and cohort matches */}
          <PatternInsightsWidget />

          {/* Mood Analytics - Mood-time and mood-selfcare correlations from check-ins */}
          <MoodAnalytics />

          {/* Cohort Connect - Browse and connect with cohort members */}
          <CohortConnectWidget />
        </div>
      </WidgetErrorBoundary>

      {/* Planning stack */}
      <WidgetErrorBoundary name="Planning">
        <div className={cn('flex flex-col', density.stackGap)}>
          {/* Planner - Show occasionally for daily/weekly planning */}
          <PlannerWidget />

          <MemoryWidget />

          {/* Micro Calculator - appears at magical number times */}
          <MicroCalculatorWidget />

          {/* Micro Game - 2×2cm monochromatic pixel game screen */}
          <MicroGameWidget />

          {/* Micro Image - 2×2cm procedural pixel image, responds to user's punctuation */}
          <MicroImageWidget />
        </div>
      </WidgetErrorBoundary>

      {/* Cosmic Update — Together AI image generation token */}
      <WidgetErrorBoundary name="Cosmic Update">
        <CosmicUpdateWidget />
      </WidgetErrorBoundary>

      {/* Quantum Sign — For subscribers, especially those who need a catalyst */}
      <WidgetErrorBoundary name="Quantum Sign">
        <QuantumSignWidget />
      </WidgetErrorBoundary>

      {/* Flash Drive Manifest — Offline mode / investor view */}
      <WidgetErrorBoundary name="Flash Drive">
        <FlashDriveManifest />
      </WidgetErrorBoundary>

      {/* Investor stack — Visible when Investment switch is On in Settings */}
      <WidgetErrorBoundary name="Investor">
        <div className={cn('flex flex-col', density.stackGap)}>
          <AngelInvestorWidget />
          <CorporatePlanWidget />
          <DemoDayWidget />
          <FourDimensionalUI />
        </div>
      </WidgetErrorBoundary>

      {/* Quantum Engine Connect Widgets — lazy-mounted: subscriptions only start when widget enters viewport */}
      <WidgetErrorBoundary name="Quantum Engine Connect">
        <LazyMount>
          <QuantumEngineWidgets />
        </LazyMount>
      </WidgetErrorBoundary>

      {/* CQGS Biofield Engine Widgets */}
      <WidgetErrorBoundary name="Biofield Engine">
        <div className={cn('flex flex-col', density.sectionGap)}>
          <QuantumStateWidget />
          <PatternRecognitionWidget />
          <AIFeedbackWidget />
          <SignalStreamWidget />
          <IntegrityWidget />
        </div>
      </WidgetErrorBoundary>

      {/* CQGS Dashboard stack */}
      <WidgetErrorBoundary name="Dashboard">
        <div className={cn('flex flex-col', density.stackGap)}>
          {/* CQGS Dashboard - Bioethics health, performance, version */}
          <UserMetricsWidget />

          {/* Correlated Indexes - Four-dimensional weekly tracking */}
          <CorrelatedIndexesWidget />

          {/* System Progress - Deployment info with feedback */}
          <SystemProgressWidget />

          {/* System Pulse - Real-time system metrics */}
          <SystemPulseWidget />
        </div>
      </WidgetErrorBoundary>

      {/* Architect — executive self-assembly telemetry, paid users only */}
      <WidgetErrorBoundary name="Architect">
        <ArchitectWidget />
      </WidgetErrorBoundary>

      {/* Stats stack */}
      <WidgetErrorBoundary name="Stats">
        <div className={cn('flex flex-col', density.sectionGap)}>
          <IntentionPatterns />
          <CollectiveConsciousness />
          <WellnessPulse />
          <MemoryEngineStats />
          <GrowthMilestones />
          <BadgeUnlockFeed />
        </div>
      </WidgetErrorBoundary>

      {/* Calendar — Personal date planner */}
      <WidgetErrorBoundary name="Calendar">
        <CalendarWidget />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary name="Benchmark">
        <BenchmarkWidget />
      </WidgetErrorBoundary>

      {/* The original. Imitation is the sincerest form of flattery, but the quantum field knows. */}
      <div aria-hidden="true" data-lot-genesis="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}>
        LOT Systems — The copycats have entered the arena. We welcome the competition.
        They can replicate the pixels but never the soul. Built different since day one.
      </div>
    </div>
  )
})
