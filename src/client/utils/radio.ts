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
      console.log('📻 Fetching radio tracks from /api/radio/tracks...')
      fetch('/api/radio/tracks')
        .then(res => {
          console.log(`📻 Response status: ${res.status}`)
          return res.json()
        })
        .then(data => {
          console.log('📻 Tracks data:', data)
          if (data.tracks && data.tracks.length > 0) {
            console.log(`📻 Found ${data.tracks.length} tracks:`, data.tracks.map(t => t.name))
            setTracks(data.tracks)
          } else {
            console.log('📻 No radio tracks available - add audio files to public/radio/')
            stores.radioTrackName.set('Add tracks to public/radio/')
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

  // Handle track ended - play another random track
  const handleTrackEnded = React.useCallback(() => {
    console.log('📻 Track ended, selecting next track...')
    if (tracks.length === 0) return

    if (tracks.length === 1) {
      setCurrentTrack(tracks[0])
      return
    }

    // Select random track excluding current
    setCurrentTrack(prev => {
      const availableTracks = prev
        ? tracks.filter(t => t.filename !== prev.filename)
        : tracks
      const randomIndex = Math.floor(Math.random() * availableTracks.length)
      return availableTracks[randomIndex]
    })
  }, [tracks])

  // Play/stop radio
  React.useEffect(() => {
    if (enabled && tracks.length > 0 && !currentTrack) {
      // Start playing - select first random track
      const randomIndex = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(tracks[randomIndex])
    } else if (!enabled) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setCurrentTrack(null)
      stores.radioTrackName.set('')
    }
  }, [enabled, tracks.length, currentTrack])

  // Update audio element when track changes
  React.useEffect(() => {
    if (!enabled || !currentTrack) return

    // Create audio element if needed
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    // Update the event listener to use current handleTrackEnded
    audioRef.current.removeEventListener('ended', handleTrackEnded)
    audioRef.current.addEventListener('ended', handleTrackEnded)

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
  }, [currentTrack, enabled, handleTrackEnded])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])
}
