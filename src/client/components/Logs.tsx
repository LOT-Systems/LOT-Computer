import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button, ResizibleGhostInput, Unknown } from '#client/components/ui'
import { useLogs, useUpdateLog } from '#client/queries'
import { useDebounce, useMouseInactivity } from '#client/utils/hooks'
import dayjs from '#client/utils/dayjs'
import * as fp from '#shared/utils/fp'
import { Log, LogSettingsChangeMetadata } from '#shared/types'
import { cn } from '#client/utils'
import { atom, map } from 'nanostores'
import {
  COUNTRY_BY_ALPHA3,
  USER_SETTING_NAMES,
  USER_SETTING_NAME_BY_ID,
} from '#shared/constants'

const localStore = {
  logById: map<Record<string, Log>>({}),
  logIds: atom<string[]>([]),
}

export const Logs: React.FC = () => {
  const inputContainerRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isTouchDevice = useStore(stores.isTouchDevice)
  const logById = useStore(localStore.logById)
  const logIds = useStore(localStore.logIds)

  const [isMouseActive, setIsMouseActive] = React.useState(true)
  const pendingPushRef = React.useRef<NodeJS.Timeout | null>(null)

  const { data: loadedLogs = [], refetch: refetchLogs } = useLogs()

  const { mutate: updateLog } = useUpdateLog({
    onSuccess: (log) => {
      localStore.logById.set({
        ...logById,
        [log.id]: log,
      })
      // Only refetch (push down) if this is the primary/most recent log
      // Past logs don't need to trigger push-down
      if (log.id === recentLogId) {
        // Refetch logs to push down saved entry and create new empty log
        // Wait 4 seconds for 2 breathe blinks to complete (2 iterations × 2s each)
        // Store timeout ID so it can be cancelled if user starts typing again
        pendingPushRef.current = setTimeout(async () => {
          try {
            await refetchLogs()
            pendingPushRef.current = null
          } catch (error) {
            console.error('[Logs] Refetch failed:', error)
            pendingPushRef.current = null
          }
        }, 4000)
      }
    },
  })

  React.useEffect(() => {
    if (!loadedLogs.length) return

    // Update both stores atomically to prevent race condition
    const newLogById = loadedLogs.reduce(fp.by('id'), {})
    const newLogIds = loadedLogs.map(fp.prop('id'))

    // Update in a single batch to avoid intermediate renders
    localStore.logById.set(newLogById)
    localStore.logIds.set(newLogIds)
  }, [loadedLogs])

  // Cleanup pending push timeout on unmount
  React.useEffect(() => {
    return () => {
      if (pendingPushRef.current) {
        clearTimeout(pendingPushRef.current)
        pendingPushRef.current = null
      }
    }
  }, [])

  const onChangeLog = React.useCallback(
    (id: string) => (text: string) => {
      updateLog({ id, text })
    },
    [updateLog]
  )

  const [recentLogId, pastLogIds] = React.useMemo(() => {
    return [logIds[0], logIds.slice(1)]
  }, [logIds])

  const dateFormat = React.useMemo(() => {
    return isTimeFormat12h ? 'h:mm:ss A (M/D/YY)' : 'H:mm:ss (D/M/YY)'
  }, [isTimeFormat12h])

  // Memoize onChange for primary log to prevent excessive re-renders
  const onChangePrimaryLog = React.useMemo(
    () => onChangeLog(recentLogId),
    [onChangeLog, recentLogId]
  )

  React.useEffect(() => {
    setTimeout(() => {
      const textarea = inputContainerRef?.current?.querySelector('textarea')
      if (!textarea) return
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = 9e6
    }, 300)
  }, [])

  const onMouseActivityChange = React.useCallback(
    (isMoving: boolean) => {
      if (isTouchDevice) return
      const nav = document.querySelector('#nav')
      if (!nav) return
      if (isMoving) {
        setIsMouseActive(true)
        nav.classList.remove('opacity-0', 'pointer-events-none')
      } else {
        setIsMouseActive(false)
        nav.classList.add('opacity-0', 'pointer-events-none')
      }
    },
    [isTouchDevice]
  )

  useMouseInactivity(2000, onMouseActivityChange)

  React.useEffect(() => {
    if (isTouchDevice) return
    let container = containerRef.current
    setTimeout(() => {
      container = containerRef.current // 🩼
    }, 600)
    const page = document.querySelector('#page')
    const onClick = (ev: Event) => {
      const target = ev.target as HTMLDivElement
      if (target === container || container?.contains(target)) return
      ev.preventDefault()
      stores.goTo('system')
    }
    page?.addEventListener('click', onClick)
    return () => {
      page?.removeEventListener('click', onClick)
    }
  }, [containerRef, isTouchDevice])

  if (!logIds.length) return <>Loading...</>

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-y-[1.5rem] leading-[1.5rem] px-4 sm:px-0"
    >
      <div ref={inputContainerRef} className="min-h-[200px]">
        {logById[recentLogId] ? (
          <NoteEditor
            key={recentLogId}
            log={logById[recentLogId]}
            primary
            onChange={onChangePrimaryLog}
            isMouseActive={isMouseActive}
            dateFormat={dateFormat}
            pendingPushRef={pendingPushRef}
          />
        ) : null}
      </div>

      {pastLogIds.map((id) => {
        const log = logById[id]
        if (!log) return null  // Skip if log doesn't exist yet
        if (log.event === 'answer') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="Memory:" blockView>
                {log.metadata.question as string}
              </Block>
              <Block label="Me:" blockView>
                {log.metadata.answer as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'chat_message') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="Sync:" blockView>
                {log.metadata.message as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'chat_message_like') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="Sync:" blockView>
                Upvoted message:{'\n'}{log.metadata.message as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'emotional_checkin') {
          const emotionalState = log.metadata?.emotionalState as string
          const checkInType = log.metadata?.checkInType as string
          const note = log.metadata?.note as string
          const insights = log.metadata?.insights as string[] | undefined

          const timeLabel =
            checkInType === 'morning' ? 'Morning' :
            checkInType === 'evening' ? 'Evening' :
            'Moment'

          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="Mood:" blockView>
                <div className="mb-8 capitalize">{emotionalState}</div>
                {note && <div className="opacity-60 mb-8">{note}</div>}
                {insights && insights.length > 0 && (
                  <div className="opacity-60 text-[14px]">
                    {insights.map((insight, idx) => (
                      <div key={idx}>• {insight}</div>
                    ))}
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'settings_change') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="Settings:" blockView>
                {/* TODO: refactor */}
                {USER_SETTING_NAMES.map((x) => {
                  const change = (log.metadata as LogSettingsChangeMetadata)
                    .changes[x]
                  if (!change) return null
                  let from: string | null = change[0]
                  let to: string | null = change[1]
                  if (x === 'country') {
                    from = from ? COUNTRY_BY_ALPHA3[from]?.name : null
                    to = to ? COUNTRY_BY_ALPHA3[to]?.name : null
                  } else if (x === 'hideActivityLogs') {
                    from = from ? 'Off' : 'On'
                    to = to ? 'Off' : 'On'
                  }
                  return (
                    <div key={x}>
                      {USER_SETTING_NAME_BY_ID[x]}:{' '}
                      {from || <Unknown>None</Unknown>} →{' '}
                      {to || <Unknown>None</Unknown>}
                    </div>
                  )
                })}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'system_snapshot') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="System:" blockView>
                {log.context?.city && (
                  <div>
                    Location: {log.context.city}
                    {log.context.country && `, ${log.context.country}`}
                  </div>
                )}
                {log.context?.temperature && (
                  <div>Temperature: {Math.round(log.context.temperature - 273.15)}°C</div>
                )}
                {log.context?.humidity && (
                  <div>Humidity: {log.context.humidity}%</div>
                )}
                {log.metadata?.sound && (
                  <div>Sound: {log.metadata.sound}</div>
                )}
                {log.metadata?.theme?.theme && (
                  <div>Theme: {log.metadata.theme.theme}</div>
                )}
              </Block>
            </LogContainer>
          )
        }
        return (
          <NoteEditor
            key={id}
            log={log}
            onChange={onChangeLog(id)}
            isMouseActive={isMouseActive}
            dateFormat={dateFormat}
          />
        )
      })}
    </div>
  )
}

const NoteEditor = ({
  log,
  primary,
  onChange,
  isMouseActive,
  dateFormat,
  pendingPushRef,
}: {
  log: Log
  primary?: boolean
  onChange: (text: string) => void
  isMouseActive: boolean
  dateFormat: string
  pendingPushRef?: React.MutableRefObject<NodeJS.Timeout | null>
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const valueRef = React.useRef(log.text || '')
  const logTextRef = React.useRef(log.text || '')
  const onChangeRef = React.useRef(onChange)

  const [isFocused, setIsFocused] = React.useState(false)
  const [value, setValue] = React.useState(log.text || '')
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null)
  const [isSaved, setIsSaved] = React.useState(true) // Track if current content is saved
  const [isAboutToPush, setIsAboutToPush] = React.useState(false) // 2 breathe blinks before push
  const [isSaving, setIsSaving] = React.useState(false) // Prevent concurrent saves
  const savingInProgressRef = React.useRef(false) // Prevent duplicate saves during tab switch
  // New timing: finish typing > wait 5s > 2 breathe blinks (4s) + save > push down
  // Past logs: 5s debounce (same as primary now for consistency)
  const debounceTime = 5000  // 5s for all logs
  const debouncedValue = useDebounce(value, debounceTime)

  // Keep refs in sync
  React.useEffect(() => {
    valueRef.current = value
    // Mark as unsaved when user types
    if (value !== log.text) {
      setIsSaved(false)
      // Cancel pending push if user starts typing again
      if (pendingPushRef?.current) {
        clearTimeout(pendingPushRef.current)
        pendingPushRef.current = null
      }

      // Stop any ongoing blink animation when user types
      if (primary) {
        setIsAboutToPush(false)
      }
    }
  }, [value, log.text, pendingPushRef, primary])

  React.useEffect(() => {
    logTextRef.current = log.text
  }, [log.text])

  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Note: No blur save handler - saves happen via unmount and debounced autosave
  // This keeps scrolling behavior simple (no blur = no issues)

  // Autosave for all logs (5s debounce)
  // New timeline: finish typing > wait 5s > [2 breathe blinks + save] > push after 4s
  React.useEffect(() => {
    if (log.text === debouncedValue) return
    if (isSaving) return  // Prevent concurrent saves

    setIsSaving(true)

    // For primary log: start 2 breathe blinks when save begins
    // Animation completes after 4 seconds (2 iterations × 2s each), then push starts
    if (primary) {
      setIsAboutToPush(true)
    }

    // Save the log
    onChange(debouncedValue)

    // Update timestamp
    setLastSavedAt(new Date())

    // IMPORTANT: Only mark as saved if current value matches what we're saving
    // This prevents race condition where user types more while save is in progress
    if (valueRef.current === debouncedValue) {
      setIsSaved(true)
    }

    // Clear saving state after a brief delay
    setTimeout(() => setIsSaving(false), 100)
  }, [debouncedValue, onChange, log.text, primary])

  // Sync local state when log updates from server
  // BUT: Don't overwrite if user is actively typing (focused)
  // ALSO: Don't clear non-empty user input to empty server value (prevents race condition)
  // ALSO: Don't sync if there are unsaved changes
  // NOTE: isFocused and value are NOT in deps - only sync when log.text changes from server
  React.useEffect(() => {
    if (isFocused) return  // Skip sync while user is typing
    if (!isSaved) return  // Skip sync if there are unsaved changes
    // Defensive: Don't clear user's typed text if server hasn't saved yet
    // This prevents race condition on mobile where blur saves but mutation hasn't completed
    if (value && !log.text) return
    // Additional safety: Don't overwrite if current value is different from server value
    // This prevents race condition where user typed more while autosave was in progress
    if (valueRef.current !== log.text && valueRef.current.length > log.text.length) return
    setValue(log.text || '')
  }, [log.text, isFocused, isSaved])  // eslint-disable-line react-hooks/exhaustive-deps

  // Track focus state for sync effect (prevent overwriting while typing)
  React.useEffect(() => {
    const textarea = containerRef.current?.querySelector('textarea')
    if (!textarea) return

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    textarea.addEventListener('focus', handleFocus)
    textarea.addEventListener('blur', handleBlur)

    return () => {
      textarea.removeEventListener('focus', handleFocus)
      textarea.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Save when user switches tabs (Page Visibility API)
  // Using refs to avoid re-subscribing on every log.text/onChange change
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && valueRef.current !== logTextRef.current) {
        if (savingInProgressRef.current) return // Prevent duplicate save
        savingInProgressRef.current = true
        onChangeRef.current(valueRef.current)
        setTimeout(() => { savingInProgressRef.current = false }, 500)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])  // Empty deps - only subscribe once, use refs for latest values

  // Save on unmount (when navigating to different tab within app)
  React.useEffect(() => {
    return () => {
      // Save on unmount if there are unsaved changes
      if (valueRef.current !== logTextRef.current) {
        if (savingInProgressRef.current) return // Prevent duplicate save
        onChangeRef.current(valueRef.current)
      }
    }
  }, [])

  // Handle Enter key - allow newlines, Cmd/Ctrl+Enter to save
  // Using refs to avoid recreating callback
  const onKeyDown = React.useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault()
        if (valueRef.current !== logTextRef.current) {
          onChangeRef.current(valueRef.current) // Immediate save
          setLastSavedAt(new Date())
          setIsSaved(true)
          // Trigger 2 breathe blinks for manual save too
          // Animation completes after 4 seconds, then push starts
          if (primary) {
            setIsAboutToPush(true)
          }
        }
        // Optionally blur to show save happened
        ;(ev.target as HTMLTextAreaElement).blur()
      }
      // Regular Enter key creates newline (default behavior)
    },
    [primary]
  )

  const contextText = React.useMemo(() => {
    if (!log?.context) return ''
    const weatherParts: string[] = []
    if (log.context?.temperature) {
      const celsius = log.context.temperature - 273.15
      weatherParts.push(`${Math.round(celsius)}°C`)
    }
    if (log.context?.humidity) {
      weatherParts.push(`${Math.round(log.context.humidity)}%`)
    }
    const weatherText = weatherParts.join(', ')
    if (log.context?.city) {
      return `${weatherText} – ${log.context.city}`
    }
    return weatherText
  }, [log?.context])

  return (
    <div className="relative group">
      <div
        className={cn(
          'relative mb-4 sm:mb-0',
          'sm:absolute sm:top-0 sm:right-0 text-end select-none',
          'transition-opacity',
          primary
            ? cn(
                'hidden sm:block ___opacity-20 sm:opacity-100',
                !isMouseActive && 'sm:opacity-0'
              )
            : cn(
                'opacity-20',
                isFocused && 'sm:opacity-100',
                'sm:group-hover:opacity-100'
              )
        )}
      >
        {!primary && contextText ? (
          <div className="relative">
            <div
              className={cn(
                'transition-opacity duration-500',
                'sm:group-hover:opacity-0'
              )}
            >
              {!!log && dayjs(log.updatedAt).format(dateFormat)}
            </div>
            <div
              className={cn(
                'hidden sm:block',
                'absolute top-0 right-0 text-acc/60 transition-opacity duration-500',
                'opacity-0 group-hover:opacity-100 whitespace-nowrap'
              )}
            >
              {contextText}
            </div>
          </div>
        ) : (
          <div>
            {primary
              ? lastSavedAt
                ? dayjs(lastSavedAt).format(dateFormat)
                : 'Just now'
              : !!log && dayjs(log.updatedAt).format(dateFormat)}
          </div>
        )}
      </div>

      <div className="max-w-[700px]" ref={containerRef}>
        <ResizibleGhostInput
          direction="v"
          value={value}
          onChange={setValue}
          onKeyDown={onKeyDown}
          placeholder={
            !primary ? 'The log record will be deleted' : 'Type here...'
          }
          className={cn(
            'max-w-[700px] focus:opacity-100 group-hover:opacity-100',
            'placeholder:opacity-100',
            !primary && 'opacity-20',
            primary && isSaved && !isAboutToPush && 'opacity-40',
            primary && !isSaved && 'opacity-100',
            primary && isAboutToPush && 'animate-blink'
          )}
          rows={primary ? 10 : 1}
        />
      </div>
    </div>
  )
}

const LogContainer: React.FC<{
  children: React.ReactNode
  log: Log
  dateFormat: string
}> = ({ log, dateFormat, children }) => {
  const contextText = React.useMemo(() => {
    const weatherParts: string[] = []
    if (log.context?.temperature) {
      const celsius = log.context.temperature - 273.15
      weatherParts.push(`${Math.round(celsius)}°C`)
    }
    if (log.context?.humidity) {
      weatherParts.push(`${Math.round(log.context.humidity)}%`)
    }
    const weatherText = weatherParts.join(', ')
    if (log.context?.city) {
      return `${weatherText} – ${log.context.city}`
    }
    return weatherText
  }, [log.context])

  return (
    <div className="relative group">
      <div
        className={cn(
          'relative mb-4 sm:mb-0',
          'sm:absolute sm:top-0 sm:right-0 text-end select-none',
          'transition-opacity',
          'hidden sm:block opacity-20',
          'group-hover:opacity-100'
        )}
      >
        {contextText ? (
          <div className="relative">
            <div
              className={cn(
                'transition-opacity duration-500',
                'sm:group-hover:opacity-0'
              )}
            >
              {dayjs(log.updatedAt).format(dateFormat)}
            </div>
            <div
              className={cn(
                'hidden sm:block',
                'absolute top-0 right-0 text-acc/60 transition-opacity duration-500',
                'opacity-0 group-hover:opacity-100 whitespace-nowrap'
              )}
            >
              {contextText}
            </div>
          </div>
        ) : (
          <div>{dayjs(log.updatedAt).format(dateFormat)}</div>
        )}
      </div>

      <div
        className={cn(
          'max-w-[500px] lg:max-w-[700px] whitespace-breakspaces',
          'transition-opacity opacity-20',
          'group-hover:opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  )
}
