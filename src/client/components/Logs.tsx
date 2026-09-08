/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
import { toCelsius } from '#shared/utils'
import {
  playKeyClick,
  playSynthActivationChime,
  playSynthDeactivationChime,
} from '#client/utils/sovietKeyboard'
import { detectNewTriggers, type LogTrigger } from '#client/utils/logTriggers'
import { runJournalEasterEggs } from '#client/utils/easter-eggs'
import { recordLogSignal, recordJournalSignal, recordBadgeSignal, analyzeIntentions, getUserState, getUserIndex, intentionEngine } from '#client/stores/intentionEngine'
import { getAssemblyState } from '#client/stores/selfAssembly'
import { getEarnedBadges, BADGES } from '#client/utils/badges'
import { useQiQuery, useAssemblyDirective, usePrayerScripture, useStoryGeneration } from '#client/queries'
import { useBreathe } from '#client/utils/breathe'
import { getFastingState } from '#client/utils/fasting'

const localStore = {
  logById: map<Record<string, Log>>({}),
  logIds: atom<string[]>([]),
}

export const Logs: React.FC = React.memo(function LogsInner() {
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
    onSuccess: (log: any) => {
      // Skip if server deleted the log (user backspaced all content)
      if (log.deleted) {
        // Remove from store — read fresh store to avoid stale closure
        const current = localStore.logById.get()
        const { [log.id]: _, ...rest } = current
        localStore.logById.set(rest as Record<string, Log>)
        localStore.logIds.set(localStore.logIds.get().filter((id: string) => id !== log.id))
        return
      }
      // Read fresh store value to avoid stale closure overwriting recent data
      const current = localStore.logById.get()
      localStore.logById.set({
        ...current,
        [log.id]: log as Log,
      })
      // Only refetch (push down) if this is the primary/most recent log
      // Past logs don't need to trigger push-down
      if (log.id === recentLogId) {
        // Refetch logs to push down saved entry and create new empty log
        // Wait 7 seconds: 3s pause (read saved entry) + 4s gentle blink = 7s total
        // Push happens when blink completes at opacity 0.2 (matching saved logs)
        pendingPushRef.current = setTimeout(async () => {
          try {
            await refetchLogs()
            pendingPushRef.current = null
          } catch (error) {
            console.error('[Logs] Refetch failed:', error)
            pendingPushRef.current = null
          }
        }, 7000)
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
    return isTimeFormat12h ? 'h:mm:ss A (M/D/YY)' : 'HH:mm:ss[Z] DD/MM/YY'
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
      // Only hide/show nav while actually on the logs route.
      // The Logs component stays mounted (display:none) across tab switches,
      // so without this guard the inactivity timer would disable nav buttons
      // on every other tab too.
      if (stores.router.get()?.route !== 'logs') return
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

  // Restore nav whenever navigating away from logs, and on unmount.
  React.useEffect(() => {
    const unsub = stores.router.listen((routerState) => {
      if (routerState?.route !== 'logs') {
        const nav = document.querySelector('#nav')
        if (nav) nav.classList.remove('opacity-0', 'pointer-events-none')
      }
    })
    return () => {
      const nav = document.querySelector('#nav')
      if (nav) nav.classList.remove('opacity-0', 'pointer-events-none')
      unsub()
    }
  }, [])

  React.useEffect(() => {
    if (isTouchDevice) return
    const page = document.querySelector('#page')
    const onClick = (ev: Event) => {
      if (ev.target !== page) return
      // Only navigate away when actually on the logs route — Logs stays mounted
      // across all tabs so without this guard it would fire on Settings, Sync, etc.
      if (stores.router.get()?.route !== 'logs') return
      stores.goTo('system')
    }
    page?.addEventListener('click', onClick)
    return () => {
      page?.removeEventListener('click', onClick)
    }
  }, [isTouchDevice])

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
        if (log.event === 'medical_record') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MED:" blockView>
                {log.metadata.question as string}
              </Block>
              <Block label="REC:" blockView>
                {log.metadata.answer as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'answer') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MEM:" blockView>
                {log.metadata.question as string}
              </Block>
              <Block label="OUT:" blockView>
                {log.metadata.answer as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'chat_message') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COMM:" blockView>
                {log.metadata.message as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'chat_message_like') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COMM:" blockView>
                ACK{'\n'}{log.metadata.message as string}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'emotional_checkin') {
          const emotionalState = log.metadata?.emotionalState as string
          const checkInType = log.metadata?.checkInType as string
          const note = log.metadata?.note as string
          const insights = log.metadata?.insights as string[] | undefined

          const sector =
            checkInType === 'morning' ? '0600' :
            checkInType === 'evening' ? '1800' :
            'SPOT'

          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label={`BIO [${sector}]:`} blockView>
                <div className="mb-8 uppercase tracking-widest">{emotionalState}</div>
                {note && <div className="mb-8">{note}</div>}
                {insights && insights.length > 0 && (
                  <div>
                    {insights.map((insight, idx) => (
                      <div key={idx}>· {insight}</div>
                    ))}
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'self_care_complete' || log.event === 'self_care_completed') {
          const action = log.metadata?.action as string | undefined
          const practice = log.metadata?.practice as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CARE:" blockView>
                <div className="uppercase tracking-widest">{action || practice || '— protocol executed'}</div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'plan_set') {
          const intent = log.metadata?.intent as string | undefined
          const today = log.metadata?.today as string | undefined
          const how = log.metadata?.how as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PLAN:" blockView>
                {intent && <div>&gt; {intent}</div>}
                {today && <div className="opacity-60">{today}</div>}
                {how && <div className="opacity-40">{how}</div>}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intention') {
          const intention = log.metadata?.intention as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTENT:" blockView>
                <div className="uppercase tracking-widest">{intention || log.text || '—'}</div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'settings_change') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CFG:" blockView>
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
                      {from || <Unknown>—</Unknown>} →{' '}
                      {to || <Unknown>—</Unknown>}
                    </div>
                  )
                })}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'system_snapshot') {
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SYS:" blockView>
                {log.context?.city && (
                  <div>
                    POS: {log.context.city}
                    {log.context.country && `, ${log.context.country}`}
                  </div>
                )}
                {log.context?.temperature && (
                  <div>TMP: {Math.round(toCelsius(log.context.temperature))}°C</div>
                )}
                {log.context?.humidity && (
                  <div>HUM: {log.context.humidity}%</div>
                )}
                {log.context?.astroRokuyo && (
                  <div>ASTRO: {log.context.astroRokuyo} · {log.context.astroMoonPhase}</div>
                )}
                {log.metadata?.sound && (
                  <div>SND: {log.metadata.sound}</div>
                )}
                {log.metadata?.theme?.theme && (
                  <div>THM: {log.metadata.theme.theme}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_intent_signal') {
          const pattern = log.metadata?.pattern as string | undefined
          const source = log.metadata?.source as string | undefined
          const confidence = log.metadata?.confidence as number | undefined
          const reason = log.metadata?.reason as string | undefined
          if (!pattern && !log.text) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QIE:" blockView>
                {pattern && (
                  <div className="uppercase tracking-widest mb-4">
                    {pattern.replace(/-/g, ' ')}
                  </div>
                )}
                {source && <div className="opacity-60">SRC: {source.toUpperCase()}</div>}
                {confidence !== undefined && (
                  <div className="opacity-40">
                    CONF: {Math.round(confidence * 100)}%
                  </div>
                )}
                {reason && (
                  <div className="opacity-30 mt-4">{reason}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'energy_state' || log.event === 'energy_update') {
          const status = log.metadata?.status as string | undefined
          const level = log.metadata?.level as number | undefined
          const trajectory = log.metadata?.trajectory as string | undefined
          const needsReplenishment = log.metadata?.needsReplenishment as string[] | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BIO:" blockView>
                {status && (
                  <div className="uppercase tracking-widest mb-4">{status}</div>
                )}
                {level !== undefined && (
                  <div className="opacity-60 tabular-nums">
                    ATP: {level}%{trajectory && <span className="ml-8 capitalize opacity-60">{trajectory}</span>}
                  </div>
                )}
                {needsReplenishment && needsReplenishment.length > 0 && (
                  <div className="opacity-40 mt-4">NEED: {needsReplenishment.slice(0, 2).join(' · ')}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'qos_state') {
          const version = log.metadata?.version as string | undefined
          const archetype = log.metadata?.archetype as string | undefined
          const cohort = log.metadata?.behavioralCohort as string | undefined
          const atp = log.metadata?.atp as number | undefined
          const assembledModules = log.metadata?.assembledModules as number | undefined
          const totalModules = log.metadata?.totalModules as number | undefined
          const health = log.metadata?.health as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QOS:" blockView>
                {version && (
                  <div className="uppercase tracking-widest mb-4">VER: {version}</div>
                )}
                {archetype && (
                  <div className="opacity-60">ARCH: {archetype}</div>
                )}
                {cohort && (
                  <div className="opacity-60">COHORT: {cohort}</div>
                )}
                {atp !== undefined && (
                  <div className="opacity-60">ATP: {atp}%</div>
                )}
                {assembledModules !== undefined && totalModules !== undefined && (
                  <div className="opacity-40">
                    ASM: {assembledModules}/{totalModules} modules
                  </div>
                )}
                {health && (
                  <div className="opacity-30 uppercase tracking-widest mt-4">{health}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'qos_mode_change') {
          const oldMode  = log.metadata?.oldMode  as string | undefined
          const newMode  = log.metadata?.newMode  as string | undefined
          const pressure = log.metadata?.pressure as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="OS [MODE]:" blockView>
                {oldMode && newMode && (
                  <div className="uppercase tracking-widest mb-4">
                    {oldMode} → {newMode}
                  </div>
                )}
                {pressure && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">PRESSURE</span>
                    <span className="uppercase">{pressure}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'physiological_cohort') {
          const archetype = log.metadata?.archetype as string | undefined
          const behavioralCohort = log.metadata?.behavioralCohort as string | undefined
          const description = log.metadata?.description as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COHORT:" blockView>
                {archetype && (
                  <div className="uppercase tracking-widest mb-4">{archetype}</div>
                )}
                {behavioralCohort && (
                  <div className="opacity-60">TYPE: {behavioralCohort}</div>
                )}
                {description && (
                  <div className="opacity-30 mt-4">{description}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'self_assembly') {
          const phase = log.metadata?.phase as string | undefined
          const assembled = log.metadata?.assembled as number | undefined
          const total = log.metadata?.total as number | undefined
          const milestone = log.metadata?.milestone as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ASM:" blockView>
                {phase && (
                  <div className="uppercase tracking-widest mb-4">{phase}</div>
                )}
                {assembled !== undefined && total !== undefined && (
                  <div className="opacity-60">MODULES: {assembled}/{total}</div>
                )}
                {milestone && (
                  <div className="opacity-40 mt-4">{milestone}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'qos_signature_lock') {
          const confidence = log.metadata?.confidence as number | undefined
          const triggers = log.metadata?.triggers as string[] | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QOS-SIG:" blockView>
                {confidence !== undefined && (
                  <div className="opacity-60 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
                {triggers && triggers.length > 0 && (
                  <div className="opacity-40 mt-4">{triggers.join(' · ')}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'operator_signature') {
          const quadrants = log.metadata?.quadrants as string[] | undefined
          const index = log.metadata?.index as number | undefined
          const signals = log.metadata?.signals as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="OP-SIG:" blockView>
                {quadrants && quadrants.length > 0 && (
                  <div className="opacity-60">{quadrants.join(' · ')}</div>
                )}
                {index !== undefined && (
                  <div className="opacity-40 tabular-nums mt-4">IDX: {index}/100</div>
                )}
                {signals !== undefined && (
                  <div className="opacity-30 tabular-nums">SIG 7D: {signals}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'vitality_cascade') {
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const energyBand = log.metadata?.energyBand as string | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="VITAL-CAS:" blockView>
                {energyBand && (
                  <div className="uppercase tracking-widest mb-4">ATP: {energyBand}</div>
                )}
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 24H: {selfcareCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'social_presence_arc') {
          const cohortCount = log.metadata?.cohortCount as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SOC-ARC:" blockView>
                {cohortCount !== undefined && (
                  <div className="opacity-60 tabular-nums">COHORT 48H: {cohortCount}</div>
                )}
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT 48H: {intentionCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'clarity_momentum_peak') {
          const clarity = log.metadata?.clarity as string | undefined
          const plannerCount = log.metadata?.plannerCount as number | undefined
          const memoryCount = log.metadata?.memoryCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CLAR-PEAK:" blockView>
                {clarity && (
                  <div className="uppercase tracking-widest mb-4">CLR: {clarity}</div>
                )}
                {plannerCount !== undefined && (
                  <div className="opacity-60 tabular-nums">PLAN 24H: {plannerCount}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM 24H: {memoryCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'temporal_alignment_peak') {
          const plannerCount = log.metadata?.plannerCount as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const calendarCount = log.metadata?.calendarCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="TALIGN:" blockView>
                {plannerCount !== undefined && (
                  <div className="uppercase tracking-widest mb-4">PLAN 48H: {plannerCount}</div>
                )}
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT 48H: {intentionCount}</div>
                )}
                {calendarCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CAL ANC: {calendarCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'creative_output_peak') {
          const journalCount = log.metadata?.journalCount as number | undefined
          const wordCount = log.metadata?.wordCount as number | undefined
          const memoryCount = log.metadata?.memoryCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CROUT:" blockView>
                {journalCount !== undefined && (
                  <div className="uppercase tracking-widest mb-4">JRNL 24H: {journalCount}</div>
                )}
                {wordCount !== undefined && (
                  <div className="opacity-60 tabular-nums">WORDS: {wordCount}+</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM 24H: {memoryCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'full_system_coherence') {
          const journalCount = log.metadata?.journalCount as number | undefined
          const memoryCount = log.metadata?.memoryCount as number | undefined
          const plannerCount = log.metadata?.plannerCount as number | undefined
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="FSCOHERE:" blockView>
                <div className="uppercase tracking-widest mb-4">ALL SYSTEMS LIVE</div>
                {journalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">JRNL: {journalCount} MEM: {memoryCount ?? '—'} PLAN: {plannerCount ?? '—'}</div>
                )}
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE: {selfcareCount} INTENT: {intentionCount ?? '—'}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'embodied_cognition_arc') {
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const journalCount  = log.metadata?.journalCount  as number | undefined
          const memoryCount   = log.metadata?.memoryCount   as number | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="EMBCOG:" blockView>
                <div className="uppercase tracking-widest mb-4">BODY → MIND</div>
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 24H: {selfcareCount}</div>
                )}
                {journalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">JRNL 150W+: {journalCount}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM 24H: {memoryCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intention_completion_loop') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const plannerCount   = log.metadata?.plannerCount   as number | undefined
          const goalCount      = log.metadata?.goalCount      as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTCMP:" blockView>
                <div className="uppercase tracking-widest mb-4">LOOP CLOSED</div>
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT 24H: {intentionCount}</div>
                )}
                {plannerCount !== undefined && (
                  <div className="opacity-60 tabular-nums">PLAN 24H: {plannerCount}</div>
                )}
                {goalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">GOAL ACT: {goalCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'community_intelligence_peak') {
          const cohortCount    = log.metadata?.cohortCount    as number | undefined
          const journalCount   = log.metadata?.journalCount   as number | undefined
          const memoryCount    = log.metadata?.memoryCount    as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COMINTEL:" blockView>
                {cohortCount !== undefined && (
                  <div className="uppercase tracking-widest mb-4">COMM 48H: {cohortCount}</div>
                )}
                {journalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">JRNL 48H: {journalCount}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM 48H: {memoryCount}</div>
                )}
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT 48H: {intentionCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'personal_peak_window') {
          const activeDays  = log.metadata?.activeDays  as number | undefined
          const energyCount = log.metadata?.energyCount as number | undefined
          const intentCount = log.metadata?.intentCount as number | undefined
          const logCount    = log.metadata?.logCount    as number | undefined
          const confidence  = log.metadata?.confidence  as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PPEAK:" blockView>
                {activeDays !== undefined && (
                  <div className="uppercase tracking-widest mb-4">DAYS: {activeDays}/3</div>
                )}
                {energyCount !== undefined && (
                  <div className="opacity-60 tabular-nums">NRG 3D: {energyCount}</div>
                )}
                {intentCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT 3D: {intentCount}</div>
                )}
                {logCount !== undefined && (
                  <div className="opacity-60 tabular-nums">LOG 3D: {logCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'recovery_momentum') {
          const selfcareCount   = log.metadata?.selfcareCount   as number | undefined
          const resilienceCount = log.metadata?.resilienceCount as number | undefined
          const energyCount     = log.metadata?.energyCount     as number | undefined
          const gain            = log.metadata?.gain            as number | undefined
          const confidence      = log.metadata?.confidence      as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RMOM:" blockView>
                <div className="uppercase tracking-widest mb-4">RECOVERY MOMENTUM</div>
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 48H: {selfcareCount}</div>
                )}
                {resilienceCount !== undefined && (
                  <div className="opacity-60 tabular-nums">RESIL 48H: {resilienceCount}</div>
                )}
                {energyCount !== undefined && (
                  <div className="opacity-60 tabular-nums">NRG 48H: {energyCount}</div>
                )}
                {gain !== undefined && (
                  <div className="opacity-60 tabular-nums">GAIN VS PRIOR: +{gain}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_inception') {
          const sourceCount   = log.metadata?.sourceCount   as number | undefined
          const totalSignals  = log.metadata?.totalSignals  as number | undefined
          const sources       = log.metadata?.sources       as string[] | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INCEP:" blockView>
                <div className="uppercase tracking-widest mb-4">QIE → SELF-AWARE</div>
                {sourceCount !== undefined && (
                  <div className="opacity-60 tabular-nums">SOURCES 24H: {sourceCount}</div>
                )}
                {totalSignals !== undefined && (
                  <div className="opacity-60 tabular-nums">TOTAL SIG: {totalSignals}</div>
                )}
                {sources && sources.length > 0 && (
                  <div className="opacity-40 tabular-nums uppercase text-xs">{sources.join(' · ')}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'focus_depth_arc') {
          const journalWords  = log.metadata?.journalWords  as number | undefined
          const journalCount  = log.metadata?.journalCount  as number | undefined
          const memoryCount   = log.metadata?.memoryCount   as number | undefined
          const plannerCount  = log.metadata?.plannerCount  as number | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="FDEP:" blockView>
                <div className="uppercase tracking-widest mb-4">FOCUS DEPTH ARC</div>
                {(journalWords !== undefined || journalCount !== undefined) && (
                  <div className="opacity-60 tabular-nums">JOURNAL: {journalWords !== undefined ? `${journalWords}W` : `${journalCount} ENTRIES`}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM: {memoryCount}</div>
                )}
                {plannerCount !== undefined && (
                  <div className="opacity-60 tabular-nums">PLAN: {plannerCount}</div>
                )}
                <div className="opacity-40 tabular-nums">WIN: 2H</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'sleep_signal_anchor') {
          const morningSignalCount  = log.metadata?.morningSignalCount  as number | undefined
          const energyCount         = log.metadata?.energyCount         as number | undefined
          const firstHour           = log.metadata?.firstHour           as number | undefined
          const confidence          = log.metadata?.confidence          as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SANCH:" blockView>
                <div className="uppercase tracking-widest mb-4">SLEEP SIGNAL ANCHOR</div>
                {firstHour !== undefined && (
                  <div className="opacity-60 tabular-nums">FIRST: {String(firstHour).padStart(2, '0')}:00</div>
                )}
                {energyCount !== undefined && (
                  <div className="opacity-60 tabular-nums">NRG 07-09: {energyCount}</div>
                )}
                {morningSignalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">SIG TOTAL: {morningSignalCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'care_intelligence_loop') {
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const memoryCount   = log.metadata?.memoryCount   as number | undefined
          const journalCount  = log.metadata?.journalCount  as number | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CINTEL:" blockView>
                <div className="uppercase tracking-widest mb-4">CARE INTEL LOOP</div>
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 24H: {selfcareCount}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM: {memoryCount}</div>
                )}
                {journalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">JRNL: {journalCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'morning_coherence_arc') {
          const energyCount    = log.metadata?.energyCount    as number | undefined
          const plannerCount   = log.metadata?.plannerCount   as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MCOHERE:" blockView>
                <div className="uppercase tracking-widest mb-4">MORNING COHERENCE ARC</div>
                {energyCount !== undefined && (
                  <div className="opacity-60 tabular-nums">NRG PRE-10: {energyCount}</div>
                )}
                {plannerCount !== undefined && (
                  <div className="opacity-60 tabular-nums">PLAN PRE-10: {plannerCount}</div>
                )}
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT PRE-10: {intentionCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_density_peak') {
          const sourceCount  = log.metadata?.sourceCount  as number | undefined
          const sources      = log.metadata?.sources      as string[] | undefined
          const signalCount  = log.metadata?.signalCount  as number | undefined
          const confidence   = log.metadata?.confidence   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SIGPEAK:" blockView>
                {sourceCount !== undefined && (
                  <div className="uppercase tracking-widest mb-4">SRC 12H: {sourceCount}</div>
                )}
                {signalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">SIG 12H: {signalCount}</div>
                )}
                {sources && sources.length > 0 && (
                  <div className="opacity-40 tabular-nums uppercase text-xs">{sources.join(' · ')}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'physiological_coherence_window') {
          const energyBand   = log.metadata?.energyBand   as string | undefined
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const moodSignal   = log.metadata?.moodSignal   as string | undefined
          const memoryCount  = log.metadata?.memoryCount  as number | undefined
          const confidence   = log.metadata?.confidence   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PCOHERE:" blockView>
                <div className="uppercase tracking-widest mb-4">PHYS COHERENCE WINDOW</div>
                {energyBand && (
                  <div className="opacity-60 tabular-nums">ATP: {energyBand.toUpperCase()}</div>
                )}
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 12H: {selfcareCount}</div>
                )}
                {moodSignal && (
                  <div className="opacity-60 tabular-nums">MOOD: {moodSignal.toUpperCase()}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM 12H: {memoryCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'action_to_memory_loop') {
          const plannerCount   = log.metadata?.plannerCount   as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const memoryCount    = log.metadata?.memoryCount    as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ACTMEM:" blockView>
                <div className="uppercase tracking-widest mb-4">ACTION-TO-MEMORY LOOP</div>
                {plannerCount !== undefined && (
                  <div className="opacity-60 tabular-nums">PLAN 6H: {plannerCount}</div>
                )}
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT 6H: {intentionCount}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM 6H: {memoryCount}</div>
                )}
                <div className="opacity-40">PIPELINE: ACT → ENC → ARC</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'sustained_resilience_arc') {
          const activeDays      = log.metadata?.activeDays      as number | undefined
          const resilienceCount = log.metadata?.resilienceCount as number | undefined
          const confidence      = log.metadata?.confidence      as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RECARC:" blockView>
                <div className="uppercase tracking-widest mb-4">SUSTAINED RESILIENCE ARC</div>
                {activeDays !== undefined && (
                  <div className="opacity-60 tabular-nums">DAYS 7D: {activeDays}</div>
                )}
                {resilienceCount !== undefined && (
                  <div className="opacity-60 tabular-nums">RES-SIG: {resilienceCount}</div>
                )}
                <div className="opacity-40">WINDOW: 7D</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'mood_energy_convergence') {
          const moodSignal    = log.metadata?.moodSignal    as string | undefined
          const energyBand    = log.metadata?.energyBand    as string | undefined
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MOEARC:" blockView>
                <div className="uppercase tracking-widest mb-4">MOOD-ENERGY CONVERGENCE</div>
                {moodSignal && (
                  <div className="opacity-60 tabular-nums">MOOD: {moodSignal.toUpperCase()}</div>
                )}
                {energyBand && (
                  <div className="opacity-60 tabular-nums">ATP: {energyBand.toUpperCase()}</div>
                )}
                {selfcareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 8H: {selfcareCount}</div>
                )}
                <div className="opacity-40">DUAL-SUBSTRATE PEAK</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'morning_intention_lock') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const plannerCount   = log.metadata?.plannerCount   as number | undefined
          const logCount       = log.metadata?.logCount       as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MINTLK:" blockView>
                <div className="uppercase tracking-widest mb-4">MORNING INTENT LOCK</div>
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT: {intentionCount}</div>
                )}
                {plannerCount !== undefined && (
                  <div className="opacity-60 tabular-nums">PLAN: {plannerCount}</div>
                )}
                {logCount !== undefined && (
                  <div className="opacity-60 tabular-nums">LOG: {logCount}</div>
                )}
                <div className="opacity-40 tabular-nums">WIN: 06-10H</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'multi_day_care_arc') {
          const streakDays    = log.metadata?.streakDays    as number | undefined
          const totalCareActs = log.metadata?.totalCareActs as number | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MARC:" blockView>
                <div className="uppercase tracking-widest mb-4">MULTI-DAY CARE ARC</div>
                {streakDays !== undefined && (
                  <div className="opacity-60 tabular-nums">STREAK: {streakDays}D</div>
                )}
                {totalCareActs !== undefined && (
                  <div className="opacity-60 tabular-nums">ACTS 7D: {totalCareActs}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'evening_reflection_loop') {
          const journalCount   = log.metadata?.journalCount   as number | undefined
          const memoryCount    = log.metadata?.memoryCount    as number | undefined
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="EVEFL:" blockView>
                <div className="uppercase tracking-widest mb-4">EVENING REFLECTION LOOP</div>
                {journalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">JOUR EVE: {journalCount}</div>
                )}
                {memoryCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MEM TODAY: {memoryCount}</div>
                )}
                {intentionCount !== undefined && (
                  <div className="opacity-60 tabular-nums">INTENT TODAY: {intentionCount}</div>
                )}
                <div className="opacity-40">LOOP: REFLECT → ENC → ACK</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'weekly_rhythm_anchor') {
          const activeDays   = log.metadata?.activeDays   as number | undefined
          const totalSignals = log.metadata?.totalSignals as number | undefined
          const confidence   = log.metadata?.confidence   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="WEEKA:" blockView>
                <div className="uppercase tracking-widest mb-4">WEEKLY RHYTHM ANCHOR</div>
                {activeDays !== undefined && (
                  <div className="opacity-60 tabular-nums">DAYS 7D: {activeDays}/7</div>
                )}
                {totalSignals !== undefined && (
                  <div className="opacity-60 tabular-nums">SIG-TOTAL: {totalSignals}</div>
                )}
                <div className="opacity-40">STRUCTURAL RECURRENCE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'depth_breadth_convergence') {
          const focusDepthConf    = log.metadata?.focusDepthConf    as number | undefined
          const signalDensityConf = log.metadata?.signalDensityConf as number | undefined
          const confidence        = log.metadata?.confidence        as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DEPBR:" blockView>
                <div className="uppercase tracking-widest mb-4">DEPTH-BREADTH CONVERGENCE</div>
                {focusDepthConf !== undefined && (
                  <div className="opacity-60 tabular-nums">FDEP CONF: {Math.round(focusDepthConf * 100)}%</div>
                )}
                {signalDensityConf !== undefined && (
                  <div className="opacity-60 tabular-nums">SIGPEAK CONF: {Math.round(signalDensityConf * 100)}%</div>
                )}
                <div className="opacity-40">DEPTH + BREADTH SIMULTANEOUS</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'cognitive_output_continuity') {
          const journalDays    = log.metadata?.journalDays    as number | undefined
          const journalEntries = log.metadata?.journalEntries as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COGCONT:" blockView>
                <div className="uppercase tracking-widest mb-4">COGNITIVE OUTPUT CONT</div>
                {journalDays !== undefined && (
                  <div className="opacity-60 tabular-nums">DAYS 7D: {journalDays}</div>
                )}
                {journalEntries !== undefined && (
                  <div className="opacity-60 tabular-nums">ENTRIES: {journalEntries}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'daily_coherence_seal') {
          const morningPattern = log.metadata?.morningPattern as string | undefined
          const eveningPattern = log.metadata?.eveningPattern as string | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DCSAL:" blockView>
                <div className="uppercase tracking-widest mb-4">DAILY COHERENCE SEAL</div>
                {morningPattern !== undefined && (
                  <div className="opacity-60 tabular-nums">MORNING: {morningPattern.toUpperCase()}</div>
                )}
                {eveningPattern !== undefined && (
