import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Clock } from '#client/components/ui'

export const TimeWidget = () => {
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const startTimeRef = React.useRef(0)
  const requestRef = React.useRef<number>()

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
