import * as React from 'react'
import * as stores from '#client/stores'

interface RadioTrack {
  filename: string
  url: string
  name: string
}

/**
 * LOT Radio Hook
 *
 * Plays random audio tracks from the /public/radio folder
 * When a track finishes, automatically plays another random track
 */
export function useRadio(enabled: boolean) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [tracks, setTracks] = React.useState<RadioTrack[]>([])
  const [currentTrack, setCurrentTrack] = React.useState<RadioTrack | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Fetch available tracks from backend
  React.useEffect(() => {
    if (enabled) {
      setIsLoading(true)
      fetch('/api/radio/tracks')
        .then(res => res.json())
        .then(data => {
          if (data.tracks && data.tracks.length > 0) {
            setTracks(data.tracks)
          } else {
            console.log('📻 No radio tracks available')
            stores.radioTrackName.set('No tracks available')
          }
        })
        .catch(error => {
          console.error('❌ Failed to fetch radio tracks:', error)
          stores.radioTrackName.set('Error loading tracks')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [enabled])

  // Select random track (excluding current track)
  const selectRandomTrack = React.useCallback(() => {
    if (tracks.length === 0) return null

    if (tracks.length === 1) {
      return tracks[0]
    }

    // Filter out current track if there are multiple tracks
    const availableTracks = currentTrack
      ? tracks.filter(t => t.filename !== currentTrack.filename)
      : tracks

    const randomIndex = Math.floor(Math.random() * availableTracks.length)
    return availableTracks[randomIndex]
  }, [tracks, currentTrack])

  // Handle track ended - play another random track
  const handleTrackEnded = React.useCallback(() => {
    const nextTrack = selectRandomTrack()
    if (nextTrack) {
      setCurrentTrack(nextTrack)
    }
  }, [selectRandomTrack])

  // Play/stop radio
  React.useEffect(() => {
    if (enabled && tracks.length > 0 && !currentTrack) {
      // Start playing - select first random track
      const track = selectRandomTrack()
      setCurrentTrack(track)
    } else if (!enabled) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setCurrentTrack(null)
      stores.radioTrackName.set('')
    }
  }, [enabled, tracks, currentTrack, selectRandomTrack])

  // Update audio element when track changes
  React.useEffect(() => {
    if (!enabled || !currentTrack) return

    // Create or update audio element
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.addEventListener('ended', handleTrackEnded)
    }

    // Update source and play
    audioRef.current.src = currentTrack.url
    audioRef.current.volume = 0.6 // Set volume to 60%

    audioRef.current.play()
      .then(() => {
        console.log(`📻 Now playing: ${currentTrack.name}`)
        stores.radioTrackName.set(currentTrack.name)
      })
      .catch(error => {
        console.error('❌ Failed to play radio track:', error)
        stores.radioTrackName.set('Error playing track')
      })

    return () => {
      // Don't cleanup on track change, only on unmount
    }
  }, [currentTrack, enabled, handleTrackEnded])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('ended', handleTrackEnded)
        audioRef.current = null
      }
    }
  }, [])
}
