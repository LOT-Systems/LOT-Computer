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

// Generate a session-based seed (0-1) that varies each time sound is activated
// Combines date + hour + random factor for unique soundscapes
let sessionSeed: number | null = null

function getSessionSeed(): number {
  // Generate new seed only when sessionSeed is null (new activation)
  if (sessionSeed === null) {
    const now = new Date()
    const dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`

    // Hash the date+hour string
    let hash = 0
    for (let i = 0; i < dateString.length; i++) {
      hash = (hash << 5) - hash + dateString.charCodeAt(i)
      hash = hash & hash
    }

    // Add random component for per-session variation (40% weight)
    const baseHash = Math.abs(hash % 1000) / 1000
    const randomComponent = Math.random() * 0.4
    sessionSeed = (baseHash * 0.6 + randomComponent) % 1
  }

  return sessionSeed
}

// Reset session seed when sound is disabled
function resetSessionSeed() {
  sessionSeed = null
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
    dailySeed: getSessionSeed(),
    usersOnline,
  }
}

/**
 * Helper function to properly clean up all sounds including timeouts
 */
function cleanupSounds(sounds: any, audioContext: AudioContext) {
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

  // Stop and disconnect all Web Audio nodes
  Object.keys(sounds).forEach((key) => {
    const node = sounds[key]
    try {
      if (node && typeof node === 'object') {
        // Stop oscillators
        if (node instanceof OscillatorNode && node.context.state !== 'closed') {
          node.stop()
        }
        // Disconnect audio nodes
        if ('disconnect' in node) {
          node.disconnect()
        }
      }
    } catch (e) {
      // Ignore cleanup errors
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
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const weather = useStore(stores.weather)
  const usersOnline = useStore(stores.usersOnline)
  const [context, setContext] = React.useState<SoundContext>(() => getTimeContext(weather, usersOnline))
  const [currentDate, setCurrentDate] = React.useState(() => new Date().toDateString())

  // Initialize Web Audio Context (native browser API, no external libraries needed)
  React.useEffect(() => {
    if (enabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('🎵 Native Web Audio initialized')
      } catch (error) {
        console.error('❌ Failed to create AudioContext:', error)
        stores.soundDescription.set('Error: Audio not supported')
      }
    }
  }, [enabled])

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
    const audioContext = audioContextRef.current

    ;(async () => {
      if (audioContext && enabled) {
        // Resume audio context if suspended (required for mobile)
        if (audioContext.state === 'suspended') {
          try {
            await audioContext.resume()
            console.log('🎵 AudioContext resumed')
          } catch (error) {
            console.error('❌ Failed to resume AudioContext:', error)
            stores.soundDescription.set('Error: Failed to start')
            return
          }
        }

        try {
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
          console.log(`🎲 Session variation seed: ${context.dailySeed.toFixed(3)} (unique per activation)`)
          console.log(`📊 Sound context hash:`, JSON.stringify({
            period: context.period,
            weather: context.weather,
            temp: context.temperature,
            humidity: context.humidity,
            usersOnline: context.usersOnline,
            sessionSeed: context.dailySeed.toFixed(3),
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
          cleanupSounds(soundsRef.current, audioContext)
          soundsRef.current = {}

          // Create master gain for volume control
          const masterGain = audioContext.createGain()
          masterGain.gain.value = 0.3 // Master volume
          masterGain.connect(audioContext.destination)
          soundsRef.current.masterGain = masterGain

          // Create sounds based on time of day and weather
          switch (context.period) {
            case 'sunrise':
              createSunriseSounds(audioContext, soundsRef.current, context, masterGain)
              break
            case 'morning':
              createMorningSounds(audioContext, soundsRef.current, context, masterGain)
              break
            case 'day':
              createDaySounds(audioContext, soundsRef.current, context, masterGain)
              break
            case 'afternoon':
              createAfternoonSounds(audioContext, soundsRef.current, context, masterGain)
              break
            case 'sunset':
              createSunsetSounds(audioContext, soundsRef.current, context, masterGain)
              break
            case 'night':
              createNightSounds(audioContext, soundsRef.current, context, masterGain)
              break
          }
        } catch (error) {
          console.error('❌ Error initializing sound:', error)
          stores.soundDescription.set('Error: Initialization failed')
          return
        }
      } else if (audioContext && !enabled) {
        // Stop all sounds including melody timeout
        cleanupSounds(soundsRef.current, audioContext)
        soundsRef.current = {}
        console.log('🔇 Sound stopped')

        // Reset session seed so next activation generates new sound
        resetSessionSeed()

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
      if (audioContextRef.current) {
        cleanupSounds(soundsRef.current, audioContextRef.current)
      }
    }
  }, [enabled, context])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        cleanupSounds(soundsRef.current, audioContextRef.current)
        soundsRef.current = {}
      }
    }
  }, [])
}


// Simplified unified sound creation using native Web Audio API
// Replaces all complex Tone.js functions with simpler browser-native implementation
function createSunriseSounds(audioContext: AudioContext, sounds: any, context: SoundContext, masterGain: GainNode) {
  createContextualAmbience(audioContext, sounds, context, masterGain, 200, 0.12)
}

function createMorningSounds(audioContext: AudioContext, sounds: any, context: SoundContext, masterGain: GainNode) {
  createContextualAmbience(audioContext, sounds, context, masterGain, 220, 0.15)
}

function createDaySounds(audioContext: AudioContext, sounds: any, context: SoundContext, masterGain: GainNode) {
  createContextualAmbience(audioContext, sounds, context, masterGain, 150, 0.18)
}

function createAfternoonSounds(audioContext: AudioContext, sounds: any, context: SoundContext, masterGain: GainNode) {
  createContextualAmbience(audioContext, sounds, context, masterGain, 180, 0.14)
}

function createSunsetSounds(audioContext: AudioContext, sounds: any, context: SoundContext, masterGain: GainNode) {
  createContextualAmbience(audioContext, sounds, context, masterGain, 160, 0.13)
}

function createNightSounds(audioContext: AudioContext, sounds: any, context: SoundContext, masterGain: GainNode) {
  createContextualAmbience(audioContext, sounds, context, masterGain, 100, 0.16)
}

// Unified ambience creator using native Web Audio API
function createContextualAmbience(
  audioContext: AudioContext,
  sounds: any,
  context: SoundContext,
  masterGain: GainNode,
  baseFreq: number,
  volume: number
) {
  const { frequency, dailySeed, temperature, humidity, weather } = context

  // Weather-based frequency modulation
  let weatherMod = 1.0
  if (weather === 'rain' || weather === 'drizzle') weatherMod = 0.92
  else if (weather === 'thunderstorm') weatherMod = 0.85
  else if (weather === 'snow') weatherMod = 1.08
  else if (weather === 'fog') weatherMod = 0.96

  // Temperature-based timbre variation (warmer = richer/lower, colder = crystalline/higher)
  let tempMod = 1.0
  if (temperature !== null) {
    tempMod = 0.95 + (temperature / 100) // Subtle shift based on temp
  }

  // Humidity-based volume variation (higher humidity = slightly louder, more fluid)
  let humidityVolume = volume
  if (humidity !== null) {
    humidityVolume = volume * (0.9 + (humidity / 200))
  }

  // Create base drone oscillator
  const drone = audioContext.createOscillator()
  const droneGain = audioContext.createGain()

  // Waveform varies with weather
  if (weather === 'rain' || weather === 'drizzle') {
    drone.type = 'triangle' // Softer for rain
  } else if (weather === 'thunderstorm') {
    drone.type = 'sawtooth' // Richer for storms
  } else {
    drone.type = 'sine' // Pure for clear/other
  }

  drone.frequency.value = baseFreq * weatherMod * tempMod * (0.95 + dailySeed * 0.1)
  droneGain.gain.value = humidityVolume

  drone.connect(droneGain)
  droneGain.connect(masterGain)
  drone.start()

  sounds.drone = drone
  sounds.droneGain = droneGain

  // Create modulation oscillator for gentle pulsing (brainwave entrainment)
  const modOsc = audioContext.createOscillator()
  const modGain = audioContext.createGain()

  modOsc.type = 'sine'
  modOsc.frequency.value = frequency / 10 // Use context frequency for pacing
  modGain.gain.value = 0.05 * (0.8 + dailySeed * 0.4) // Vary modulation depth

  modOsc.connect(modGain)
  modGain.connect(droneGain.gain)
  modOsc.start()

  sounds.modOsc = modOsc
  sounds.modGain = modGain

  // Add harmonic for richness
  const harmonic = audioContext.createOscillator()
  const harmonicGain = audioContext.createGain()

  harmonic.type = 'sine'
  harmonic.frequency.value = baseFreq * 1.5 * weatherMod * (0.98 + dailySeed * 0.04)
  harmonicGain.gain.value = humidityVolume * 0.5 * (0.85 + dailySeed * 0.3)

  harmonic.connect(harmonicGain)
  harmonicGain.connect(masterGain)
  harmonic.start()

  sounds.harmonic = harmonic
  sounds.harmonicGain = harmonicGain
}
