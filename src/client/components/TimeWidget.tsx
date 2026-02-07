import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Clock } from '#client/components/ui'
import { playSovietChime } from '#client/utils/sovietChime'
import dayjs from '#client/utils/dayjs'

export const TimeWidget = () => {
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isTimeChimeEnabled = useStore(stores.isTimeChimeEnabled)
  const startTimeRef = React.useRef(0)
  const requestRef = React.useRef<number>()
  const lastChimeHour = React.useRef<number>(-1)

  const [showStopwatch, setShowStopwatch] = React.useState(false)
  const [timeElapsed, setTimeElapsed] = React.useState(0)
  const [isRunning, setIsRunning] = React.useState(false)

  const formatTime = React.useCallback((time: number) => {
    const milliseconds = `0${Math.floor(time % 1000)}`.slice(-3, -1)
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2)
    const minutes = `0${Math.floor((time / (1000 * 60)) % 60)}`.slice(-2)
    const hours = `0${Math.floor(time / (1000 * 60 * 60))}`.slice(-2)
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
  }, [])

  const tick = (time: number) => {
    if (isRunning) {
      setTimeElapsed(time - startTimeRef.current)
      requestRef.current = requestAnimationFrame(tick)
    }
  }

  const start = () => {
    if (!isRunning) {
      setIsRunning(true)
      startTimeRef.current = performance.now() - timeElapsed
      requestRef.current = requestAnimationFrame(tick)
    }
  }

  const pause = () => {
    setIsRunning(false)
    cancelAnimationFrame(requestRef.current!)
  }

  const reset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    cancelAnimationFrame(requestRef.current!)
  }

  const onLabelClick = React.useCallback(() => {
    setShowStopwatch((x) => !x)
    if (!isRunning) {
      reset()
    }
  }, [isRunning])

  const onChildrenClick = React.useCallback(() => {
    if (showStopwatch) {
      if (isRunning) {
        pause()
      } else {
        start()
      }
    } else {
      stores.isTimeFormat12h.set(!isTimeFormat12h)
    }
  }, [isRunning, showStopwatch, isTimeFormat12h])

  React.useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(requestRef.current!)
    }

    return () => cancelAnimationFrame(requestRef.current!)
  }, [isRunning])

  // Hourly chime effect - Soviet-era digital coo-coo clock
  React.useEffect(() => {
    if (!isTimeChimeEnabled) return

    const checkHour = () => {
      const now = dayjs()
      const currentHour = now.hour()
      const currentMinute = now.minute()
      const currentSecond = now.second()

      // Play chime at the top of each hour (within first 3 seconds to avoid missing)
      if (currentMinute === 0 && currentSecond <= 2 && lastChimeHour.current !== currentHour) {
        lastChimeHour.current = currentHour
        playSovietChime(currentHour)
      }

      // Reset the last chime hour once past the chime window
      if (currentMinute >= 1) {
        lastChimeHour.current = -1
      }
    }

    // Check every second
    const interval = setInterval(checkHour, 1000)
    checkHour() // Check immediately

    return () => clearInterval(interval)
  }, [isTimeChimeEnabled])

  return (
    <Block
      label={showStopwatch ? 'Stopwatch:' : 'Time:'}
      onLabelClick={onLabelClick}
      onChildrenClick={onChildrenClick}
    >
      {showStopwatch ? (
        formatTime(timeElapsed)
      ) : (
        <Clock
          format={isTimeFormat12h ? 'h:mm:ss A' : 'H:mm:ss'}
          interval={100}
        />
      )}
    </Block>
  )
}
