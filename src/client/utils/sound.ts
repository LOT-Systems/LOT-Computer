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

type TimeOfDay = 'morning' | 'day' | 'afternoon' | 'night'
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
  const { period, weather, temperature, humidity, frequency } = context
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

  return parts.join(' ')
}

// Detect time of day and return appropriate sound context
function getTimeContext(weather: any): SoundContext {
  const hour = new Date().getHours()

  let period: TimeOfDay
  let frequency: number
  let description: string

  if (hour >= 6 && hour < 12) {
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
  }
}

/**
 * Global sound hook that manages context-based ambient soundscapes
 * Works across all pages/sections since it's called from the App component
 */
export function useSound(enabled: boolean) {
  const soundsRef = React.useRef<any>({})
  const [isSoundLibLoaded, setIsSoundLibLoaded] = React.useState(false)
  const weather = useStore(stores.weather)
  const [context, setContext] = React.useState<SoundContext>(() => getTimeContext(weather))

  // Load Tone.js library when sound is needed
  useExternalScript(
    'https://unpkg.com/tone',
    () => {
      console.log('🎵 Tone.js loaded')
      setIsSoundLibLoaded(true)
    },
    enabled
  )

  // Update context every minute to detect time changes
  React.useEffect(() => {
    if (!enabled) return

    const updateContext = () => {
      const newContext = getTimeContext(weather)
      setContext(newContext)
    }

    // Check every minute
    const interval = setInterval(updateContext, 60000)
    return () => clearInterval(interval)
  }, [enabled, weather])

  // Update context when weather changes
  React.useEffect(() => {
    if (!enabled) return
    setContext(getTimeContext(weather))
  }, [weather, enabled])

  React.useEffect(() => {
    // @ts-ignore - Tone.js is loaded via external script
    const Tone: any = window.Tone

    ;(async () => {
      if (isSoundLibLoaded && enabled) {
        await Tone.start()
        const soundDesc = getSoundDescription(context)
        console.log(`🔊 Sound: On (${soundDesc})`)
        console.log(`🌊 ${context.period} - ${context.description}`)
        console.log(`🌦️ Weather: ${context.weather}, ${context.temperature}°C, ${context.humidity}% humidity, ${context.windSpeed}m/s wind`)
        console.log(`🎲 Daily variation seed: ${context.dailySeed.toFixed(3)}`)

        // Clean up existing sounds if context changed
        Object.values(soundsRef.current).forEach((sound: any) => {
          try {
            sound?.stop()
            sound?.dispose()
          } catch (e) {
            // Ignore disposal errors
          }
        })
        soundsRef.current = {}

        // Set master volume
        Tone.Destination.volume.setValueAtTime(-20, Tone.now())

        // Create sounds based on time of day and weather
        switch (context.period) {
          case 'morning':
            createMorningSounds(Tone, soundsRef.current, context)
            break
          case 'day':
            createDaySounds(Tone, soundsRef.current, context)
            break
          case 'afternoon':
            createAfternoonSounds(Tone, soundsRef.current, context)
            break
          case 'night':
            createNightSounds(Tone, soundsRef.current, context)
            break
        }
      } else if (isSoundLibLoaded && !enabled) {
        // Stop all sounds
        Object.values(soundsRef.current).forEach((sound: any) => {
          try {
            sound?.stop()
          } catch (e) {
            // Ignore stop errors
          }
        })
        console.log('🔇 Sound stopped')
      }
    })()

    return () => {
      // Stop on cleanup
      Object.values(soundsRef.current).forEach((sound: any) => {
        try {
          sound?.stop()
        } catch (e) {
          // Ignore
        }
      })
    }
  }, [enabled, isSoundLibLoaded, context])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach((sound: any) => {
        try {
          sound?.stop()
          sound?.dispose()
        } catch (e) {
          // Ignore disposal errors
        }
      })
      soundsRef.current = {}
    }
  }, [])
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
}
