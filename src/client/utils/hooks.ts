import React from 'react'
import config from '#client/config'

export function useDebounce(value: any, delay: number = 1e3) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

export function useThrottle(value: any, limit: number = 1000) {
  const [throttledValue, setThrottledValue] = React.useState(value)
  const [lastRan, setLastRan] = React.useState(Date.now())
  React.useEffect(() => {
    const handler = setTimeout(function () {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value)
        setLastRan(Date.now())
      }
    }, limit - (Date.now() - lastRan))
    return () => {
      clearTimeout(handler)
    }
  }, [value, limit, lastRan])
  return throttledValue
}

export function useDocumentTitle(
  title: string | null,
  omitPrefix: boolean = false
) {
  React.useEffect(() => {
    if (title) {
      document.title = omitPrefix ? title : `${title} · ${config.appName}`
    } else {
      document.title = config.appName
    }
    return () => {
      document.title = config.appName
    }
  }, [omitPrefix, title])
}

const LOADED_SCRIPTS: Record<
  string,
  { loaded: boolean; subscribers: Function[] }
> = {}

function loadScript(src: string, callback: () => void) {
  const entry = LOADED_SCRIPTS[src]
  if (entry) {
    if (entry.loaded) {
      callback()
    } else {
      entry.subscribers.push(callback)
    }
  } else {
    LOADED_SCRIPTS[src] = {
      loaded: false,
      subscribers: [callback],
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      console.log(`✅ Script loaded successfully: ${src}`)
      LOADED_SCRIPTS[src].loaded = true
      LOADED_SCRIPTS[src].subscribers.forEach((cb) => cb())
    }
    script.onerror = (error) => {
      console.error(`❌ Failed to load script: ${src}`, error)
      // Delete entry to allow retry on next attempt
      delete LOADED_SCRIPTS[src]
    }
    document.body.appendChild(script)
  }
}

export function useExternalScript(src: string, cb: () => void, enabled = true) {
  const [loaded, setLoaded] = React.useState(
    LOADED_SCRIPTS[src]?.loaded || false
  )
  React.useEffect(() => {
    if (!enabled) return
    const callback = () => {
      setLoaded(true)
      cb()
    }
    loadScript(src, callback)
    return () => {
      const entry = LOADED_SCRIPTS[src]
      if (entry) {
        entry.subscribers = entry.subscribers.filter((cb) => cb !== callback)
      }
    }
  }, [src, cb, enabled])
  return loaded
}

export function useMouseInactivity(
  delay: number,
  callback: (active: boolean) => void
) {
  const [isMoving, setIsMoving] = React.useState(false)
  React.useEffect(() => {
    let timer: any = null
    const handleMouseMove = () => {
      if (timer) clearTimeout(timer)
      if (!isMoving) {
        setIsMoving(true)
        callback(true)
      }
      timer = setTimeout(() => {
        setIsMoving(false)
        callback(false)
      }, delay)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (timer) clearTimeout(timer)
    }
  }, [delay, callback, isMoving])
}
