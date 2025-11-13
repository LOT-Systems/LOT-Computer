import * as React from 'react'
import { useExternalScript } from './hooks'

/**
 * Global sound hook that manages ambient brown noise
 * Works across all pages/sections since it's called from the App component
 */
export function useSound(enabled: boolean) {
  const noise = React.useRef<any>(null)
  const [isSoundLibLoaded, setIsSoundLibLoaded] = React.useState(false)

  // Load Tone.js library when sound is needed
  useExternalScript(
    'https://unpkg.com/tone',
    () => {
      console.log('Tone.js loaded')
      setIsSoundLibLoaded(true)
    },
    enabled
  )

  React.useEffect(() => {
    // @ts-ignore - Tone.js is loaded via external script
    const Tone: any = window.Tone

    ;(async () => {
      if (isSoundLibLoaded) {
        if (enabled) {
          // Start or resume sound
          if (!noise.current) {
            await Tone.start()
            Tone.Destination.volume.setValueAtTime(-20, Tone.now())
            noise.current = new Tone.Noise('brown').start().toDestination()
            console.log('🔊 Sound started (brown noise)')
          } else {
            noise.current?.start()
            console.log('🔊 Sound resumed')
          }
        } else {
          // Stop sound
          noise.current?.stop()
          console.log('🔇 Sound stopped')
        }
      }
    })()

    return () => {
      // Only stop, don't dispose - we want to keep the instance
      noise.current?.stop()
    }
  }, [enabled, isSoundLibLoaded])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (noise.current) {
        noise.current.stop()
        noise.current.dispose()
        noise.current = null
      }
    }
  }, [])
}
