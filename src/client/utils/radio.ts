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
  const tracksRef = React.useRef<RadioTrack[]>([])
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const [tracks, setTracks] = React.useState<RadioTrack[]>([])
  const [currentTrack, setCurrentTrack] = React.useState<RadioTrack | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [remainingTime, setRemainingTime] = React.useState<number | null>(null)

  // Keep tracksRef in sync with tracks
  React.useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Fetch available tracks from backend
  React.useEffect(() => {
    if (enabled && tracks.length === 0) {
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
            console.log(`📻 Found ${data.tracks.length} tracks:`, data.tracks.map((t: RadioTrack) => t.name))
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
  }, [enabled, tracks.length])

  // Handle track ended - play another random track (stable, no deps on tracks)
  const handleTrackEnded = React.useCallback(() => {
    console.log('📻 Track ended, selecting next track...')
    const currentTracks = tracksRef.current
    if (currentTracks.length === 0) return

    if (currentTracks.length === 1) {
      setCurrentTrack(currentTracks[0])
      return
    }

    // Select random track excluding current
    setCurrentTrack(prev => {
      const availableTracks = prev
        ? currentTracks.filter(t => t.filename !== prev.filename)
        : currentTracks
      const randomIndex = Math.floor(Math.random() * availableTracks.length)
      return availableTracks[randomIndex]
    })
  }, [])

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

  // Set up audio element once
  React.useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = 0.6
      audioRef.current.addEventListener('ended', handleTrackEnded)
    }
  }, [handleTrackEnded])

  // Update audio source and play when track changes
  React.useEffect(() => {
    if (!enabled || !currentTrack || !audioRef.current) {
      // Clear interval if not playing
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const audio = audioRef.current

    // Show loading state while track is loading
    stores.radioTrackName.set(`Loading ${currentTrack.name}...`)

    // Update source and load
    audio.src = currentTrack.url
    audio.load()

    // Wait for audio to be ready before playing
    const handleCanPlay = () => {
      audio.play()
        .then(() => {
          console.log(`📻 Now playing: ${currentTrack.name}`)

          // Start countdown interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }

          intervalRef.current = setInterval(() => {
            if (audio && audio.duration) {
              const remaining = audio.duration - audio.currentTime
              setRemainingTime(remaining)

              // Update display with track name and countdown
              const timeStr = formatTime(remaining)
              stores.radioTrackName.set(`${currentTrack.name} ${timeStr}`)
            }
          }, 1000)
        })
        .catch(error => {
          console.error('❌ Failed to play radio track:', error)
          stores.radioTrackName.set('Error playing track')
        })
    }

    // Listen for when audio can start playing
    audio.addEventListener('canplay', handleCanPlay, { once: true })

    // Cleanup interval and event listener when track changes
    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentTrack, enabled, formatTime])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])
}
