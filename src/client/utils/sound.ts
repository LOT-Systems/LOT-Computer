import * as React from 'react'
import { useExternalScript } from './hooks'

/**
 * Hemi-Sync Context-Based Sound System
 *
 * Creates ambient soundscapes based on time of day following hemispheric
 * synchronization (hemi-sync) brainwave entrainment standards.
 *
 * Brainwave frequencies:
 * - Delta: 0.5-4 Hz (deep sleep)
 * - Theta: 4-8 Hz (meditation, deep relaxation)
 * - Alpha: 8-13 Hz (calm alertness, creativity)
 * - Beta: 13-30 Hz (focus, active thinking)
 */

type TimeOfDay = 'morning' | 'day' | 'afternoon' | 'night'

interface SoundContext {
  period: TimeOfDay
  frequency: number // Primary binaural/pulsating frequency
  description: string
}

// Detect time of day and return appropriate sound context
function getTimeContext(): SoundContext {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) {
    // Morning: Alpha waves (8-13 Hz) - waking up, calm alertness
    return {
      period: 'morning',
      frequency: 10, // 10 Hz - middle alpha
      description: 'Alpha waves - calm alertness',
    }
  } else if (hour >= 12 && hour < 17) {
    // Day: Beta waves (13-30 Hz) - focus, productivity
    return {
      period: 'day',
      frequency: 18, // 18 Hz - beta focus state
      description: 'Beta waves - active focus',
    }
  } else if (hour >= 17 && hour < 20) {
    // Afternoon: Alpha/Theta (4-13 Hz) - relaxation, creativity
    return {
      period: 'afternoon',
      frequency: 7, // 7 Hz - theta/alpha border - creative relaxation
      description: 'Theta-Alpha waves - creative relaxation',
    }
  } else {
    // Night: Theta/Delta (0.5-8 Hz) - deep relaxation, sleep prep
    return {
      period: 'night',
      frequency: 5, // 5 Hz - theta - deep relaxation
      description: 'Theta waves - deep relaxation',
    }
  }
}

/**
 * Global sound hook that manages context-based ambient soundscapes
 * Works across all pages/sections since it's called from the App component
 */
export function useSound(enabled: boolean) {
  const soundsRef = React.useRef<any>({})
  const [isSoundLibLoaded, setIsSoundLibLoaded] = React.useState(false)
  const [context, setContext] = React.useState<SoundContext>(getTimeContext())

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
      const newContext = getTimeContext()
      setContext(newContext)
    }

    // Check every minute
    const interval = setInterval(updateContext, 60000)
    return () => clearInterval(interval)
  }, [enabled])

  React.useEffect(() => {
    // @ts-ignore - Tone.js is loaded via external script
    const Tone: any = window.Tone

    ;(async () => {
      if (isSoundLibLoaded && enabled) {
        await Tone.start()
        console.log(`🔊 Sound started: ${context.period} - ${context.description}`)

        // Clean up existing sounds if period changed
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

        // Create sounds based on time of day
        switch (context.period) {
          case 'morning':
            createMorningSounds(Tone, soundsRef.current, context.frequency)
            break
          case 'day':
            createDaySounds(Tone, soundsRef.current, context.frequency)
            break
          case 'afternoon':
            createAfternoonSounds(Tone, soundsRef.current, context.frequency)
            break
          case 'night':
            createNightSounds(Tone, soundsRef.current, context.frequency)
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

// Morning: noise, rain, sine (Alpha waves 8-13 Hz)
function createMorningSounds(Tone: any, sounds: any, frequency: number) {
  // Brown noise base
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(0.3)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Rain effect (filtered noise)
  const rain = new Tone.Noise('pink')
  const rainFilter = new Tone.Filter(800, 'lowpass')
  const rainGain = new Tone.Gain(0.2)
  rain.connect(rainFilter)
  rainFilter.connect(rainGain)
  rainGain.toDestination()
  rain.start()
  sounds.rain = rain

  // Sine wave at alpha frequency with subtle volume modulation
  const sine = new Tone.Oscillator(200, 'sine')
  const sineGain = new Tone.Gain(0.15)
  const sineModulator = new Tone.LFO(frequency, 0.1, 0.2) // Modulate volume at alpha frequency
  sineModulator.connect(sineGain.gain)
  sine.connect(sineGain)
  sineGain.toDestination()
  sine.start()
  sineModulator.start()
  sounds.sine = sine
  sounds.sineModulator = sineModulator
}

// Day: bass pulsating (Beta waves 13-30 Hz)
function createDaySounds(Tone: any, sounds: any, frequency: number) {
  // Pulsating bass at beta frequency
  const bass = new Tone.Oscillator(60, 'sine') // 60 Hz bass note
  const bassGain = new Tone.Gain(0.4)
  const pulseModulator = new Tone.LFO(frequency, 0.2, 0.5) // Pulse at beta frequency
  pulseModulator.connect(bassGain.gain)
  bass.connect(bassGain)
  bassGain.toDestination()
  bass.start()
  pulseModulator.start()
  sounds.bass = bass
  sounds.pulseModulator = pulseModulator

  // Subtle noise undertone
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(0.1)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise
}

// Afternoon: noise, deep bass, random sine melody (Alpha/Theta 4-13 Hz)
function createAfternoonSounds(Tone: any, sounds: any, frequency: number) {
  // Brown noise
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(0.25)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Deep bass with theta/alpha modulation
  const bass = new Tone.Oscillator(40, 'sine') // Deep 40 Hz bass
  const bassGain = new Tone.Gain(0.35)
  const bassModulator = new Tone.LFO(frequency, 0.2, 0.4)
  bassModulator.connect(bassGain.gain)
  bass.connect(bassGain)
  bassGain.toDestination()
  bass.start()
  bassModulator.start()
  sounds.bass = bass
  sounds.bassModulator = bassModulator

  // Random sine melody in alpha/theta range
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 2,
      decay: 1,
      sustain: 0.5,
      release: 3,
    },
  })
  const synthGain = new Tone.Gain(0.12)
  synth.connect(synthGain)
  synthGain.toDestination()

  // Play random notes at theta/alpha frequencies (mapped to audible range)
  const notes = ['C3', 'E3', 'G3', 'A3', 'C4', 'E4']
  const playRandomNote = () => {
    const note = notes[Math.floor(Math.random() * notes.length)]
    synth.triggerAttackRelease(note, '4n')
    // Schedule next note at irregular intervals (3-8 seconds)
    const nextInterval = 3000 + Math.random() * 5000
    sounds.melodyTimeout = setTimeout(playRandomNote, nextInterval)
  }
  playRandomNote()
  sounds.synth = synth
}

// Night: bass, noise, pulsating (Theta/Delta 0.5-8 Hz)
function createNightSounds(Tone: any, sounds: any, frequency: number) {
  // Brown noise
  const noise = new Tone.Noise('brown')
  const noiseGain = new Tone.Gain(0.2)
  noise.connect(noiseGain)
  noiseGain.toDestination()
  noise.start()
  sounds.noise = noise

  // Deep bass at theta frequency
  const bass = new Tone.Oscillator(50, 'sine')
  const bassGain = new Tone.Gain(0.3)
  const bassModulator = new Tone.LFO(frequency, 0.15, 0.35) // Subtle modulation at theta
  bassModulator.connect(bassGain.gain)
  bass.connect(bassGain)
  bassGain.toDestination()
  bass.start()
  bassModulator.start()
  sounds.bass = bass
  sounds.bassModulator = bassModulator

  // Pulsating drone at theta frequency
  const drone = new Tone.Oscillator(80, 'sine')
  const droneGain = new Tone.Gain(0.25)
  const pulseModulator = new Tone.LFO(frequency, 0.1, 0.3)
  pulseModulator.connect(droneGain.gain)
  drone.connect(droneGain)
  droneGain.toDestination()
  drone.start()
  pulseModulator.start()
  sounds.drone = drone
  sounds.pulseModulator = pulseModulator
}
