import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { useExternalScript } from './hooks'

/**
 * Enhanced Hemi-Sync Context-Based Sound System
 *
 * Creates ambient soundscapes based on:
 * - Time of day (hemi-sync brainwave entrainment)
 * - Weather conditions (rain, thunderstorm, clear, fog, snow, wind)
 * - Temperature (warm = lower frequencies, cold = higher frequencies)
 * - Humidity (wet = fluid sounds, dry = crystalline sounds)
 * - Atmospheric pressure (low = deeper bass, high = lighter tones)
 *
 * Brainwave frequencies:
 * - Delta: 0.5-4 Hz (deep sleep)
 * - Theta: 4-8 Hz (meditation, deep relaxation)
 * - Alpha: 8-13 Hz (calm alertness, creativity)
 * - Beta: 13-30 Hz (focus, active thinking)
 */

type TimeOfDay = 'sunrise' | 'morning' | 'day' | 'afternoon' | 'sunset' | 'night'
type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'unknown'

interface SoundContext {
  period: TimeOfDay
  frequency: number // Primary binaural/pulsating frequency
  description: string
  weather: WeatherCondition
  temperature: number | null // Celsius
  humidity: number | null // Percentage
  windSpeed: number | null // m/s
  pressure: number | null // hPa
  dailySeed: number // Daily variation seed (0-1)
  usersOnline: number // Number of users currently online
}

// Generate a daily seed (0-1) based on the current date
// Same seed for entire day, different seed each day
function getDailySeed(): number {
  const now = new Date()
  const dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  // Simple hash function to convert date string to 0-1 value
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash % 1000) / 1000
}

// Parse weather description into condition category
function getWeatherCondition(description: string | null): WeatherCondition {
  if (!description) return 'unknown'
  const desc = description.toLowerCase()

  if (desc.includes('thunder')) return 'thunderstorm'
  if (desc.includes('rain') || desc.includes('shower')) return 'rain'
  if (desc.includes('drizzle')) return 'drizzle'
  if (desc.includes('snow')) return 'snow'
  if (desc.includes('fog')) return 'fog'
  if (desc.includes('clear')) return 'clear'
  if (desc.includes('cloud') || desc.includes('overcast')) return 'cloudy'

  return 'unknown'
}

// Generate a poetic description of the current soundscape
function getSoundDescription(context: SoundContext): string {
  const { period, weather, temperature, humidity, frequency, usersOnline } = context
  const parts: string[] = []

  // Humidity descriptor
  if (humidity !== null) {
    if (humidity > 70) parts.push('Humid')
    else if (humidity < 40) parts.push('Dry')
  }

  // Temperature descriptor
  if (temperature !== null) {
    if (temperature < 5) parts.push('crystalline')
    else if (temperature < 15) parts.push('cool')
    else if (temperature > 25) parts.push('warm')
  }

  // Primary sound elements by time of day
  switch (period) {
    case 'sunrise':
      parts.push(`awakening bells ${Math.round(frequency)}Hz`)
      parts.push('and rising harmonics')
      break
    case 'morning':
      parts.push(`sine ${Math.round(frequency)}Hz`)
      if (weather === 'rain' || weather === 'drizzle' || weather === 'thunderstorm') {
        parts.push('and rain cascade')
      } else {
        parts.push('and gentle noise')
      }
      break
    case 'day':
      parts.push(`bass pulse ${Math.round(frequency)}Hz`)
      if (weather === 'clear') {
        parts.push('with bright shimmer')
      }
      break
    case 'afternoon':
      parts.push(`wooden drone ${Math.round(frequency)}Hz`)
      parts.push('and wandering melody')
      break
    case 'sunset':
      parts.push(`descending chimes ${Math.round(frequency)}Hz`)
      parts.push('and settling drones')
      break
    case 'night':
      parts.push(`deep drone ${Math.round(frequency)}Hz`)
      if (weather === 'clear' && temperature !== null && temperature < 5) {
        parts.push('with crystal tones')
      }
      break
  }

  // Weather additions
  if (weather === 'thunderstorm') {
    parts.push('– distant thunder')
  } else if (weather === 'rain' && period !== 'morning') {
    parts.push('– soft rain')
  }

  // Active site indicator
  if (usersOnline > 5) {
    parts.push('+ click symphony')
  }

  return parts.join(' ')
}

// Detect time of day and return appropriate sound context
function getTimeContext(weather: any, usersOnline: number): SoundContext {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const second = now.getSeconds()

  // Calculate total seconds since midnight
  const totalSeconds = hour * 3600 + minute * 60 + second

  // Sunrise: 90-second window around 6:00 AM (5:59:15 to 6:00:45)
  const sunriseStart = 6 * 3600 - 45 // 5:59:15 AM
  const sunriseEnd = 6 * 3600 + 45   // 6:00:45 AM

  // Sunset: 90-second window around 8:00 PM / 20:00 (19:59:15 to 20:00:45)
  const sunsetStart = 20 * 3600 - 45 // 7:59:15 PM
  const sunsetEnd = 20 * 3600 + 45   // 8:00:45 PM

  let period: TimeOfDay
  let frequency: number
  let description: string

  if (totalSeconds >= sunriseStart && totalSeconds < sunriseEnd) {
    // Sunrise transition: Alpha waves rising (6-12 Hz sweep)
    period = 'sunrise'
    frequency = 9 // 9 Hz - awakening alpha
    description = 'Rising Alpha waves - awakening'
  } else if (totalSeconds >= sunsetStart && totalSeconds < sunsetEnd) {
    // Sunset transition: Alpha to Theta (8-4 Hz descent)
    period = 'sunset'
    frequency = 6 // 6 Hz - settling theta
    description = 'Descending Theta waves - settling'
  } else if (hour >= 6 && hour < 12) {
    // Morning: Alpha waves (8-13 Hz) - waking up, calm alertness
    period = 'morning'
    frequency = 10 // 10 Hz - middle alpha
    description = 'Alpha waves - calm alertness'
  } else if (hour >= 12 && hour < 17) {
    // Day: Beta waves (13-30 Hz) - focus, productivity
    period = 'day'
    frequency = 18 // 18 Hz - beta focus state
    description = 'Beta waves - active focus'
  } else if (hour >= 17 && hour < 20) {
    // Afternoon: Alpha/Theta (4-13 Hz) - relaxation, creativity
    period = 'afternoon'
    frequency = 7 // 7 Hz - theta/alpha border - creative relaxation
    description = 'Theta-Alpha waves - creative relaxation'
  } else {
    // Night: Theta/Delta (0.5-8 Hz) - deep relaxation, sleep prep
    period = 'night'
    frequency = 5 // 5 Hz - theta - deep relaxation
    description = 'Theta waves - deep relaxation'
  }

  return {
    period,
    frequency,
    description,
    weather: getWeatherCondition(weather?.description),
    temperature: weather?.temperature ?? null,
    humidity: weather?.humidity ?? null,
    windSpeed: weather?.windSpeed ?? null,
    pressure: weather?.pressure ?? null,
    dailySeed: getDailySeed(),
    usersOnline,
  }
}

/**
 * Helper function to properly clean up all sounds including timeouts
 */
function cleanupSounds(sounds: any) {
  // Clear melody timeout if it exists
  if (sounds.melodyTimeout) {
    clearTimeout(sounds.melodyTimeout)
    sounds.melodyTimeout = null
  }

  // Clear click symphony interval if it exists
  if (sounds.clickInterval) {
    clearInterval(sounds.clickInterval)
    sounds.clickInterval = null
  }

  // Stop and dispose all sound objects
  Object.values(sounds).forEach((sound: any) => {
    try {
      // Skip non-sound values like timeout IDs
      if (sound && typeof sound === 'object' && 'stop' in sound) {
        sound.stop()
      }
      if (sound && typeof sound === 'object' && 'dispose' in sound) {
        sound.dispose()
      }
    } catch (e) {
      // Ignore disposal errors
    }
  })
}

/**
 * Create click symphony sound (active site with >5 users)
 * A rhythmic ratchet/click sound that plays when the site is active
 */
function createClickSymphony(Tone: any, sounds: any, context: SoundContext) {
  if (context.usersOnline <= 5) return

  // Create a noise burst for the click/ratchet sound
  const clickNoise = new Tone.Noise('white')
  const clickFilter = new Tone.Filter(3000, 'highpass') // High-pass for crisp click
  const clickGain = new Tone.Gain(0)
  const clickEnvelope = new Tone.AmplitudeEnvelope({
    attack: 0.001,
    decay: 0.02,
    sustain: 0,
    release: 0.01,
  })

  clickNoise.connect(clickFilter)
  clickFilter.connect(clickEnvelope)
  clickEnvelope.connect(clickGain)
  clickGain.toDestination()
  clickNoise.start()

  // Trigger clicks at varying intervals (200-600ms)
  const triggerClick = () => {
    clickGain.gain.setValueAtTime(0.6, Tone.now())
    clickEnvelope.triggerAttackRelease(0.03, Tone.now())
  }

  // Create a rhythmic pattern
  const scheduleNextClick = () => {
    // More users = faster clicks
    const baseInterval = 400
    const speedFactor = Math.min(context.usersOnline / 10, 2) // Cap at 2x speed
    const interval = baseInterval / speedFactor + Math.random() * 200

    sounds.clickInterval = setTimeout(() => {
      triggerClick()
      scheduleNextClick()
    }, interval)
  }

  // Start the click pattern
  scheduleNextClick()

  sounds.clickNoise = clickNoise
  sounds.clickFilter = clickFilter
  sounds.clickGain = clickGain
  sounds.clickEnvelope = clickEnvelope
}

/**
 * Global sound hook that manages context-based ambient soundscapes
 * Works across all pages/sections since it's called from the App component
 */
export function useSound(enabled: boolean) {
  const soundsRef = React.useRef<any>({})
  const [isSoundLibLoaded, setIsSoundLibLoaded] = React.useState(false)
  const weather = useStore(stores.weather)
  const usersOnline = useStore(stores.usersOnline)
  const [context, setContext] = React.useState<SoundContext>(() => getTimeContext(weather, usersOnline))
  const [currentDate, setCurrentDate] = React.useState(() => new Date().toDateString())

  // Load Tone.js library when sound is needed
  useExternalScript(
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js',
    () => {
      console.log('🎵 Tone.js loaded')
      setIsSoundLibLoaded(true)
    },
    enabled
  )

  // Update context every minute to detect time changes and new days
  React.useEffect(() => {
    if (!enabled) return

    const updateContext = () => {
      const today = new Date().toDateString()
      const newContext = getTimeContext(weather, usersOnline)

      // Check if day changed or time period changed or user count changed significantly
      const userCountChanged = Math.abs(newContext.usersOnline - context.usersOnline) > 0
      const crossedThreshold = (context.usersOnline <= 5 && newContext.usersOnline > 5) ||
                               (context.usersOnline > 5 && newContext.usersOnline <= 5)

      if (today !== currentDate || newContext.period !== context.period || crossedThreshold) {
        console.log('📅 Date or time period changed, updating sound context', {
          dateChanged: today !== currentDate,
          periodChanged: newContext.period !== context.period,
          userCountChanged: crossedThreshold,
          oldDate: currentDate,
          newDate: today,
          oldPeriod: context.period,
          newPeriod: newContext.period,
          oldSeed: context.dailySeed,
          newSeed: newContext.dailySeed,
          oldUsersOnline: context.usersOnline,
          newUsersOnline: newContext.usersOnline
        })
        setCurrentDate(today)
        setContext(newContext)
      }
    }

    // Check every 10 seconds to catch sunrise/sunset transitions
    const interval = setInterval(updateContext, 10000)
    return () => clearInterval(interval)
  }, [enabled, weather, usersOnline, currentDate, context.period, context.dailySeed, context.usersOnline])

  // Update context when weather or usersOnline changes
  React.useEffect(() => {
    if (!enabled) return
    const newContext = getTimeContext(weather, usersOnline)
    const today = new Date().toDateString()
    setCurrentDate(today)
    setContext(newContext)
  }, [weather, usersOnline, enabled])

  React.useEffect(() => {
    // @ts-ignore - Tone.js is loaded via external script
    const Tone: any = window.Tone

    ;(async () => {
      if (isSoundLibLoaded && enabled) {
        await Tone.start()
        const soundDesc = getSoundDescription(context)
        console.log(`🔊 Sound: On (${soundDesc})`)
        if (context.period === 'sunrise') {
          console.log(`🌅 SUNRISE TRANSITION - ${context.description} (90 seconds)`)
        } else if (context.period === 'sunset') {
          console.log(`🌇 SUNSET TRANSITION - ${context.description} (90 seconds)`)
        } else {
          console.log(`🌊 ${context.period} - ${context.description}`)
        }
        console.log(`🌦️ Weather: ${context.weather}, ${context.temperature}°C, ${context.humidity}% humidity, ${context.windSpeed}m/s wind, ${context.pressure}hPa`)
        console.log(`👥 Users online: ${context.usersOnline}${context.usersOnline > 5 ? ' 🎵 Click symphony active!' : ''}`)
        console.log(`🎲 Daily variation seed: ${context.dailySeed.toFixed(3)}`)
        console.log(`📊 Sound context hash:`, JSON.stringify({
          period: context.period,
          weather: context.weather,
          temp: context.temperature,
          humidity: context.humidity,
          usersOnline: context.usersOnline,
          seed: context.dailySeed.toFixed(3),
          timestamp: new Date().toISOString()
        }))

        // Update sound description in store for UI display
        stores.soundDescription.set(soundDesc)

        // Save sound description to user metadata for public profile
        try {
          await fetch('/api/update-current-sound', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soundDescription: soundDesc })
          })
        } catch (error) {
          console.error('Failed to update current sound:', error)
        }

        // Clean up existing sounds if context changed
        cleanupSounds(soundsRef.current)
        soundsRef.current = {}

        // Set master volume
        Tone.Destination.volume.setValueAtTime(-20, Tone.now())

        // Create sounds based on time of day and weather
        switch (context.period) {
          case 'sunrise':
            createSunriseSounds(Tone, soundsRef.current, context)
            break
          case 'morning':
            createMorningSounds(Tone, soundsRef.current, context)
            break
          case 'day':
            createDaySounds(Tone, soundsRef.current, context)
            break
          case 'afternoon':
            createAfternoonSounds(Tone, soundsRef.current, context)
            break
          case 'sunset':
            createSunsetSounds(Tone, soundsRef.current, context)
            break
          case 'night':
            createNightSounds(Tone, soundsRef.current, context)
            break
        }
      } else if (isSoundLibLoaded && !enabled) {
        // Stop all sounds including melody timeout
        cleanupSounds(soundsRef.current)
        soundsRef.current = {}
        console.log('🔇 Sound stopped')

        // Clear sound description in store
        stores.soundDescription.set('')

        // Clear sound description from user metadata
        try {
          await fetch('/api/update-current-sound', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soundDescription: null })
          })
        } catch (error) {
          console.error('Failed to clear current sound:', error)
        }
      }
    })()

    return () => {
      // Stop on cleanup
      cleanupSounds(soundsRef.current)
    }
  }, [enabled, isSoundLibLoaded, context])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupSounds(soundsRef.current)
      soundsRef.current = {}
    }
  }, [])
}

// Sunrise: 90-second awakening transition with rising bells and harmonics
function createSunriseSounds(Tone: any, sounds: any, context: SoundContext) {
  const { frequency, weather, dailySeed } = context

  // Gentle ambient base
  const ambientVolume = 0.15
  const ambient = new Tone.Noise('pink')
  const ambientGain = new Tone.Gain(ambientVolume)
  ambient.connect(ambientGain)
  ambientGain.toDestination()
  ambient.start()
  sounds.ambient = ambient

  // Rising bell tones - using multiple sine waves for bell-like quality
  const bellFreqs = [400, 600, 800, 1200] // Bell harmonics
  bellFreqs.forEach((baseFreq, index) => {
    const bell = new Tone.Oscillator(baseFreq * (0.95 + dailySeed * 0.1), 'sine')
    const bellGain = new Tone.Gain(0)
    const bellEnvelope = new Tone.AmplitudeEnvelope({
      attack: 15, // Slow 15-second rise
      decay: 30,
      sustain: 0.3,
      release: 30,
    })

    bell.connect(bellEnvelope)
    bellEnvelope.connect(bellGain)
    bellGain.toDestination()
    bell.start()

    // Stagger the bell attacks
    const attackTime = Tone.now() + index * 15
    bellGain.gain.setValueAtTime(0.12 / (index + 1), attackTime)
    bellEnvelope.triggerAttack(attackTime)

    sounds[`bell${index}`] = bell
    sounds[`bellEnvelope${index}`] = bellEnvelope
  })

  // Ascending harmonic sweep
  const sweep = new Tone.Oscillator(200, 'sine')
  const sweepGain = new Tone.Gain(0.15)
  sweep.connect(sweepGain)
  sweepGain.toDestination()
  sweep.start()

  // Slowly sweep upward over 90 seconds
  sweep.frequency.exponentialRampTo(400, 90)
  sounds.sweep = sweep

  // Pulsating alpha wave (9 Hz modulation)
  const pulse = new Tone.Oscillator(60, 'sine')
  const pulseGain = new Tone.Gain(0.25)
  const pulseModulator = new Tone.LFO(frequency, 0.2, 0.4)
  pulseModulator.connect(pulseGain.gain)
  pulse.connect(pulseGain)
  pulseGain.toDestination()
  pulse.start()
  pulseModulator.start()
  sounds.pulse = pulse
  sounds.pulseModulator = pulseModulator

  // Add click symphony for active site
  createClickSymphony(Tone, sounds, context)
}

// Sunset: 90-second settling transition with descending chimes and drones
function createSunsetSounds(Tone: any, sounds: any, context: SoundContext) {
  const { frequency, weather, temperature, dailySeed } = context

  // Warm ambient base
  const ambientVolume = 0.18
  const ambient = new Tone.Noise('brown')
  const ambientFilter = new Tone.Filter(600, 'lowpass')
  const ambientGain = new Tone.Gain(ambientVolume)
  ambient.connect(ambientFilter)
  ambientFilter.connect(ambientGain)
  ambientGain.toDestination()
  ambient.start()
  sounds.ambient = ambient

  // Descending chime tones - settling sounds
  const chimeFreqs = [1000, 800, 600, 400] // Descending harmonics
  chimeFreqs.forEach((baseFreq, index) => {
    const chime = new Tone.Oscillator(baseFreq * (0.95 + dailySeed * 0.1), 'triangle')
    const chimeGain = new Tone.Gain(0)
    const chimeEnvelope = new Tone.AmplitudeEnvelope({
      attack: 20,
      decay: 35,
      sustain: 0.2,
      release: 35,
    })

    chime.connect(chimeEnvelope)
    chimeEnvelope.connect(chimeGain)
    chimeGain.toDestination()
    chime.start()

    // Stagger the chime attacks
    const attackTime = Tone.now() + index * 18
    chimeGain.gain.setValueAtTime(0.1 / (index + 1), attackTime)
    chimeEnvelope.triggerAttack(attackTime)

    sounds[`chime${index}`] = chime
    sounds[`chimeEnvelope${index}`] = chimeEnvelope
  })

  // Descending frequency sweep - settling down
  const sweep = new Tone.Oscillator(300, 'sine')
  const sweepGain = new Tone.Gain(0.12)
  sweep.connect(sweepGain)
  sweepGain.toDestination()
  sweep.start()

  // Slowly sweep downward over 90 seconds
  sweep.frequency.exponentialRampTo(150, 90)
  sounds.sweep = sweep

  // Settling drone
  const drone = new Tone.Oscillator(80, 'sine')
  const droneGain = new Tone.Gain(0)
  drone.connect(droneGain)
  droneGain.toDestination()
  drone.start()

  // Fade in the drone over the 90 seconds
  droneGain.gain.exponentialRampTo(0.3, 90)
  sounds.drone = drone

  // Theta wave modulation (6 Hz) - settling relaxation
  const pulseModulator = new Tone.LFO(frequency, 0.15, 0.35)
  pulseModulator.connect(droneGain.gain)
  pulseModulator.start()
  sounds.pulseModulator = pulseModulator

  // Add click symphony for active site
  createClickSymphony(Tone, sounds, context)
}

// Morning: noise, rain, sine (Alpha waves 8-13 Hz) + weather variations
function createMorningSounds(Tone: any, sounds: any, context: SoundContext) {
  const { frequency, weather, temperature, humidity, windSpeed, dailySeed } = context

  // Daily variation multipliers (±10-15%)
  const freqVariation = 0.9 + dailySeed * 0.2 // 0.9-1.1
  const volumeVariation = 0.88 + dailySeed * 0.24 // 0.88-1.12

  // Adjust base frequency based on temperature (cold = higher, warm = lower)
  const tempAdjustment = temperature !== null ? (20 - temperature) * 2 : 0 // -40°C to +40°C range
  const baseSineFreq = (200 + tempAdjustment) * freqVariation

  // Brown noise base - intensity varies with humidity
  const noiseVolume = (humidity !== null ? 0.2 + (humidity / 100) * 0.2 : 0.3) * volumeVariation
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(noiseVolume)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Rain effect - stronger when actually raining
  let rainVolume = 0.2
  if (weather === 'rain') rainVolume = 0.5
  else if (weather === 'drizzle') rainVolume = 0.35
  else if (weather === 'thunderstorm') rainVolume = 0.6
  else if (humidity !== null && humidity > 70) rainVolume = 0.3

  const rain = new Tone.Noise('pink')
  const rainFilter = new Tone.Filter(800, 'lowpass')
  const rainGain = new Tone.Gain(rainVolume)
  rain.connect(rainFilter)
  rainFilter.connect(rainGain)
  rainGain.toDestination()
  rain.start()
  sounds.rain = rain

  // Thunder rumble for storms
  if (weather === 'thunderstorm') {
    const thunder = new Tone.Oscillator(30, 'sine')
    const thunderGain = new Tone.Gain(0.4)
    const thunderModulator = new Tone.LFO(0.3, 0.2, 0.5) // Slow rumble
    thunderModulator.connect(thunderGain.gain)
    thunder.connect(thunderGain)
    thunderGain.toDestination()
    thunder.start()
    thunderModulator.start()
    sounds.thunder = thunder
    sounds.thunderModulator = thunderModulator
  }

  // Wind layer for windy conditions
  if (windSpeed !== null && windSpeed > 5) {
    const windNoise = new Tone.Noise('white')
    const windFilter = new Tone.Filter(1200, 'highpass')
    const windGain = new Tone.Gain((windSpeed / 20) * 0.25) // Scale with wind speed
    const windModulator = new Tone.LFO(0.5, 0.5, 1.0) // Gentle swaying
    windNoise.connect(windFilter)
    windFilter.connect(windGain)
    windModulator.connect(windGain.gain)
    windGain.toDestination()
    windNoise.start()
    windModulator.start()
    sounds.wind = windNoise
    sounds.windModulator = windModulator
  }

  // Sine wave - temperature-adjusted frequency
  const sine = new Tone.Oscillator(baseSineFreq, 'sine')
  const sineGain = new Tone.Gain(weather === 'clear' ? 0.2 : 0.15)
  const sineModulator = new Tone.LFO(frequency, 0.1, 0.2)
  sineModulator.connect(sineGain.gain)
  sine.connect(sineGain)
  sineGain.toDestination()
  sine.start()
  sineModulator.start()
  sounds.sine = sine
  sounds.sineModulator = sineModulator

  // Add click symphony for active site
  createClickSymphony(Tone, sounds, context)
}

// Day: bass pulsating (Beta waves 13-30 Hz) + weather variations
function createDaySounds(Tone: any, sounds: any, context: SoundContext) {
  const { frequency, weather, temperature, humidity, windSpeed, pressure, dailySeed } = context

  // Daily variation multipliers
  const freqVariation = 0.92 + dailySeed * 0.16 // 0.92-1.08
  const volumeVariation = 0.9 + dailySeed * 0.2 // 0.9-1.1

  // Bass frequency adjusted by pressure (low pressure = deeper, high pressure = higher)
  const pressureAdjustment = pressure !== null ? (1013 - pressure) * 0.05 : 0
  const bassFreq = (60 + pressureAdjustment) * freqVariation

  // Pulsating bass - stronger on clear days
  const bassVolume = (weather === 'clear' ? 0.45 : 0.35) * volumeVariation
  const bass = new Tone.Oscillator(bassFreq, 'sine')
  const bassGain = new Tone.Gain(bassVolume)
  const pulseModulator = new Tone.LFO(frequency, 0.2, 0.5)
  pulseModulator.connect(bassGain.gain)
  bass.connect(bassGain)
  bassGain.toDestination()
  bass.start()
  pulseModulator.start()
  sounds.bass = bass
  sounds.pulseModulator = pulseModulator

  // Noise - more present in humid/rainy conditions
  const noiseVolume = humidity !== null ? 0.05 + (humidity / 100) * 0.15 : 0.1
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(noiseVolume)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Rain layer
  if (weather === 'rain' || weather === 'drizzle' || weather === 'thunderstorm') {
    const rainVolume = weather === 'thunderstorm' ? 0.5 : weather === 'rain' ? 0.4 : 0.25
    const rain = new Tone.Noise('pink')
    const rainFilter = new Tone.Filter(900, 'lowpass')
    const rainGain = new Tone.Gain(rainVolume)
    rain.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.toDestination()
    rain.start()
    sounds.rain = rain
  }

  // Wind element
  if (windSpeed !== null && windSpeed > 7) {
    const windNoise = new Tone.Noise('white')
    const windFilter = new Tone.Filter(1400, 'highpass')
    const windGain = new Tone.Gain((windSpeed / 20) * 0.2)
    const windModulator = new Tone.LFO(0.7, 0.6, 1.0)
    windNoise.connect(windFilter)
    windFilter.connect(windGain)
    windModulator.connect(windGain.gain)
    windGain.toDestination()
    windNoise.start()
    windModulator.start()
    sounds.wind = windNoise
    sounds.windModulator = windModulator
  }

  // High frequency shimmer for sunny days
  if (weather === 'clear' && temperature !== null && temperature > 15) {
    const shimmer = new Tone.Oscillator(2400, 'sine')
    const shimmerGain = new Tone.Gain(0.08)
    const shimmerModulator = new Tone.LFO(3, 0.5, 1.0)
    shimmerModulator.connect(shimmerGain.gain)
    shimmer.connect(shimmerGain)
    shimmerGain.toDestination()
    shimmer.start()
    shimmerModulator.start()
    sounds.shimmer = shimmer
    sounds.shimmerModulator = shimmerModulator
  }

  // Add click symphony for active site
  createClickSymphony(Tone, sounds, context)
}

// Afternoon: noise, deep bass, random sine melody (Alpha/Theta 4-13 Hz) + weather variations
function createAfternoonSounds(Tone: any, sounds: any, context: SoundContext) {
  const { frequency, weather, temperature, humidity, windSpeed, pressure, dailySeed } = context

  // Daily variation multipliers
  const freqVariation = 0.88 + dailySeed * 0.24 // 0.88-1.12
  const volumeVariation = 0.87 + dailySeed * 0.26 // 0.87-1.13

  // Noise volume varies with conditions
  const noiseVolume = (humidity !== null ? 0.15 + (humidity / 100) * 0.2 : 0.25) * volumeVariation
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(noiseVolume)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Deep bass - pressure-adjusted
  const pressureAdjustment = pressure !== null ? (1013 - pressure) * 0.03 : 0
  const bassFreq = (40 + pressureAdjustment) * freqVariation
  const bass = new Tone.Oscillator(bassFreq, 'sine')
  const bassGain = new Tone.Gain(0.35 * volumeVariation)
  const bassModulator = new Tone.LFO(frequency, 0.2, 0.4)
  bassModulator.connect(bassGain.gain)
  bass.connect(bassGain)
  bassGain.toDestination()
  bass.start()
  bassModulator.start()
  sounds.bass = bass
  sounds.bassModulator = bassModulator

  // Soft rain during rainy weather
  if (weather === 'rain' || weather === 'drizzle') {
    const rainVolume = weather === 'rain' ? 0.35 : 0.25
    const rain = new Tone.Noise('pink')
    const rainFilter = new Tone.Filter(700, 'lowpass')
    const rainGain = new Tone.Gain(rainVolume)
    rain.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.toDestination()
    rain.start()
    sounds.rain = rain
  }

  // Wind layer for windy evenings
  if (windSpeed !== null && windSpeed > 6) {
    const windNoise = new Tone.Noise('white')
    const windFilter = new Tone.Filter(1000, 'highpass')
    const windGain = new Tone.Gain((windSpeed / 20) * 0.18)
    const windModulator = new Tone.LFO(0.4, 0.5, 1.0)
    windNoise.connect(windFilter)
    windFilter.connect(windGain)
    windModulator.connect(windGain.gain)
    windGain.toDestination()
    windNoise.start()
    windModulator.start()
    sounds.wind = windNoise
    sounds.windModulator = windModulator
  }

  // Random sine melody - adjust note range by temperature
  const tempAdjustment = temperature !== null ? Math.floor((temperature - 15) / 5) : 0
  const noteOptions = [
    ['C2', 'E2', 'G2', 'A2', 'C3', 'E3'], // Cold
    ['C3', 'E3', 'G3', 'A3', 'C4', 'E4'], // Normal
    ['E3', 'G3', 'A3', 'C4', 'E4', 'G4'], // Warm
  ]
  const noteIndex = Math.max(0, Math.min(2, tempAdjustment + 1))
  const notes = noteOptions[noteIndex]

  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 2 * (0.95 + dailySeed * 0.1), // Slight attack variation
      decay: 1,
      sustain: 0.5,
      release: 3 * (0.95 + dailySeed * 0.1), // Slight release variation
    },
  })
  const synthVolume = (weather === 'clear' ? 0.15 : weather === 'fog' ? 0.08 : 0.12) * volumeVariation
  const synthGain = new Tone.Gain(synthVolume)
  synth.connect(synthGain)
  synthGain.toDestination()

  // Play random notes - slower in fog, faster in clear weather
  const baseInterval = weather === 'fog' ? 6000 : weather === 'clear' ? 3000 : 4000
  const playRandomNote = () => {
    const note = notes[Math.floor(Math.random() * notes.length)]
    synth.triggerAttackRelease(note, '4n')
    const nextInterval = baseInterval + Math.random() * baseInterval
    sounds.melodyTimeout = setTimeout(playRandomNote, nextInterval)
  }
  playRandomNote()
  sounds.synth = synth

  // Add click symphony for active site
  createClickSymphony(Tone, sounds, context)
}

// Night: bass, noise, pulsating (Theta/Delta 0.5-8 Hz) + weather variations
function createNightSounds(Tone: any, sounds: any, context: SoundContext) {
  const { frequency, weather, temperature, humidity, windSpeed, pressure, dailySeed } = context

  // Daily variation multipliers
  const freqVariation = 0.9 + dailySeed * 0.2 // 0.9-1.1
  const volumeVariation = 0.85 + dailySeed * 0.3 // 0.85-1.15

  // Soft noise base - quieter at night, varies with humidity
  const noiseVolume = (humidity !== null ? 0.12 + (humidity / 100) * 0.15 : 0.2) * volumeVariation
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(noiseVolume)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Deep bass - adjusted by temperature (colder = slightly higher)
  const tempAdjustment = temperature !== null ? (15 - temperature) * 0.5 : 0
  const bassFreq = (50 + Math.max(-10, Math.min(10, tempAdjustment))) * freqVariation
  const bass = new Tone.Oscillator(bassFreq, 'sine')
  const bassGain = new Tone.Gain(0.3 * volumeVariation)
  const bassModulator = new Tone.LFO(frequency, 0.15, 0.35)
  bassModulator.connect(bassGain.gain)
  bass.connect(bassGain)
  bassGain.toDestination()
  bass.start()
  bassModulator.start()
  sounds.bass = bass
  sounds.bassModulator = bassModulator

  // Gentle rain for rainy nights
  if (weather === 'rain' || weather === 'drizzle') {
    const rainVolume = weather === 'rain' ? 0.3 : 0.2
    const rain = new Tone.Noise('pink')
    const rainFilter = new Tone.Filter(600, 'lowpass')
    const rainGain = new Tone.Gain(rainVolume)
    rain.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.toDestination()
    rain.start()
    sounds.rain = rain
  }

  // Distant thunder for storms
  if (weather === 'thunderstorm') {
    const thunder = new Tone.Oscillator(25, 'sine')
    const thunderGain = new Tone.Gain(0.35)
    const thunderModulator = new Tone.LFO(0.2, 0.15, 0.4)
    thunderModulator.connect(thunderGain.gain)
    thunder.connect(thunderGain)
    thunderGain.toDestination()
    thunder.start()
    thunderModulator.start()
    sounds.thunder = thunder
    sounds.thunderModulator = thunderModulator
  }

  // Wind sounds for windy nights
  if (windSpeed !== null && windSpeed > 5) {
    const windNoise = new Tone.Noise('white')
    const windFilter = new Tone.Filter(900, 'highpass')
    const windGain = new Tone.Gain((windSpeed / 20) * 0.15)
    const windModulator = new Tone.LFO(0.3, 0.4, 1.0)
    windNoise.connect(windFilter)
    windFilter.connect(windGain)
    windModulator.connect(windGain.gain)
    windGain.toDestination()
    windNoise.start()
    windModulator.start()
    sounds.wind = windNoise
    sounds.windModulator = windModulator
  }

  // Pulsating drone - softer on clear nights, deeper in storms
  const droneFreq = (weather === 'thunderstorm' ? 70 : 80) * freqVariation
  const droneVolume = (weather === 'clear' ? 0.2 : 0.25) * volumeVariation
  const drone = new Tone.Oscillator(droneFreq, 'sine')
  const droneGain = new Tone.Gain(droneVolume)
  const pulseModulator = new Tone.LFO(frequency, 0.1, 0.3)
  pulseModulator.connect(droneGain.gain)
  drone.connect(droneGain)
  droneGain.toDestination()
  drone.start()
  pulseModulator.start()
  sounds.drone = drone
  sounds.pulseModulator = pulseModulator

  // Crystalline tones for cold, clear nights
  if (weather === 'clear' && temperature !== null && temperature < 5) {
    const crystal = new Tone.Oscillator(1800 * freqVariation, 'sine')
    const crystalGain = new Tone.Gain(0.06 * volumeVariation)
    const crystalModulator = new Tone.LFO(0.2, 0.5, 1.0)
    crystalModulator.connect(crystalGain.gain)
    crystal.connect(crystalGain)
    crystalGain.toDestination()
    crystal.start()
    crystalModulator.start()
    sounds.crystal = crystal
    sounds.crystalModulator = crystalModulator
  }

  // Add click symphony for active site
  createClickSymphony(Tone, sounds, context)
}
