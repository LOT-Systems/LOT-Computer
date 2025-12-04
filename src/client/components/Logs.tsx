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

  const { data: loadedLogs = [] } = useLogs()
  const { mutate: updateLog } = useUpdateLog({
    onSuccess: (log) => {
      localStore.logById.set({
        ...logById,
        [log.id]: log,
      })
    },
  })

  React.useEffect(() => {
    if (!loadedLogs.length) return
    localStore.logById.set(loadedLogs.reduce(fp.by('id'), {}))
    localStore.logIds.set(loadedLogs.map(fp.prop('id')))
  }, [loadedLogs])

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
        <NoteEditor
          key={recentLogId}
          log={logById[recentLogId]}
          primary
          onChange={onChangeLog(recentLogId)}
          isMouseActive={isMouseActive}
          dateFormat={dateFormat}
        />
      </div>

      {pastLogIds.map((id) => {
        const log = logById[id]
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
}: {
  log: Log
  primary?: boolean
  onChange: (text: string) => void
  isMouseActive: boolean
  dateFormat: string
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const [isFocused, setIsFocused] = React.useState(false)
  const [value, setValue] = React.useState(log.text || '')
  const debouncedValue = useDebounce(value, 800)

  // Track if there are unsaved changes
  const hasUnsavedChanges = value !== log.text

  // Post handler - immediately save
  const handlePost = React.useCallback(() => {
    // Always save current value when clicked
    onChange(value)
  }, [value, onChange])

  // Autosave ONLY for old logs (primary log uses Post button exclusively)
  React.useEffect(() => {
    if (primary) return // Primary log: NO autosave, use Post button only
    if (log.text === debouncedValue) return
    onChange(debouncedValue)
  }, [debouncedValue, onChange, primary, log.text])

  // Sync local state when log updates from server
  React.useEffect(() => {
    setValue(log.text || '')
  }, [log.text])

  React.useEffect(() => {
    const textarea = containerRef.current?.querySelector('textarea')
    if (!textarea) return
    textarea.addEventListener('focus', () => setIsFocused(true))
    textarea.addEventListener('blur', () => setIsFocused(false))
  }, [])

  // Handle Enter key - mobile-friendly behavior like Sync
  const onKeyDown = React.useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.key === 'Enter') {
        // On mobile: Enter creates newline (user must tap Post button)
        const isTouchDevice = 'ontouchstart' in window
        if (isTouchDevice && primary) return

        // On desktop: Enter without modifiers submits (for primary log)
        if (primary && !ev.metaKey && !ev.shiftKey && !ev.ctrlKey) {
          ev.preventDefault()
          if (value !== log.text) {
            onChange(value)
          }
          ;(ev.target as HTMLTextAreaElement).blur()
        }

        // Cmd/Ctrl+Enter also submits
        if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey) {
          ev.preventDefault()
          if (value !== log.text) {
            onChange(value)
          }
          ;(ev.target as HTMLTextAreaElement).blur()
        }
      }
    },
    [value, log.text, onChange, primary]
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
              ? 'Just now'
              : !!log && dayjs(log.updatedAt).format(dateFormat)}
          </div>
        )}
      </div>

      <div className="max-w-[700px]" ref={containerRef}>
        {primary ? (
          <>
            <ResizibleGhostInput
              direction="v"
              value={value}
              onChange={setValue}
              onKeyDown={onKeyDown}
              placeholder="Type here..."
              className="max-w-[700px] focus:opacity-100 group-hover:opacity-100"
              rows={10}
            />
            <div className="mt-4">
              <Button
                onClick={(ev) => {
                  ev.preventDefault()
                  // Only submit if there are actual changes
                  if (value !== log.text) {
                    handlePost()
                  }
                }}
                kind="secondary"
                size="small"
              >
                Post
              </Button>
            </div>
          </>
        ) : (
          <ResizibleGhostInput
            direction="v"
            value={value}
            onChange={setValue}
            onKeyDown={onKeyDown}
            placeholder="The log record will be deleted"
            className={cn(
              'max-w-[700px] focus:opacity-100 group-hover:opacity-100',
              'opacity-20'
            )}
            rows={1}
          />
        )}
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
