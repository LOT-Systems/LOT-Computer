/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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

      // Play chime within the first 30 seconds of each hour
      // Wide window prevents misses from background tab throttling
      if (currentMinute === 0 && lastChimeHour.current !== currentHour) {
        lastChimeHour.current = currentHour
        playSovietChime(currentHour)
      }

      // Reset once past the chime window so next hour can fire
      if (currentMinute >= 1) {
        lastChimeHour.current = -1
      }
    }

    // Check every second
    const interval = setInterval(checkHour, 1000)
    checkHour() // Check immediately

    // Catch missed chimes when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        checkHour()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
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
