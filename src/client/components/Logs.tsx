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
import { getMoonEmoji } from '#shared/utils/astrology'
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
                  <div>
                    ASTRO: {log.context.astroRokuyo} · {log.context.astroMoonPhase && getMoonEmoji(log.context.astroMoonPhase)} {log.context.astroMoonPhase}
                    {log.context.astroMoonIllumination != null && ` (${log.context.astroMoonIllumination}%)`}
                  </div>
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
                  <div className="opacity-60 tabular-nums">EVENING: {eveningPattern.toUpperCase()}</div>
                )}
                <div className="opacity-40 tabular-nums">CIRCUIT: DAY SEALED</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_rhythm_lock') {
          const weeklyConf = log.metadata?.weeklyConf as number | undefined
          const cogConf    = log.metadata?.cogConf    as number | undefined
          const circConf   = log.metadata?.circConf   as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QLOCK:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM RHYTHM LOCK</div>
                {weeklyConf !== undefined && (
                  <div className="opacity-60 tabular-nums">WEEKLY: {Math.round(weeklyConf * 100)}%</div>
                )}
                {cogConf !== undefined && (
                  <div className="opacity-60 tabular-nums">COG: {Math.round(cogConf * 100)}%</div>
                )}
                {circConf !== undefined && (
                  <div className="opacity-60 tabular-nums">CIRC: {Math.round(circConf * 100)}%</div>
                )}
                <div className="opacity-40 tabular-nums">TEMPORAL OS: LIVE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'biofield_integration_peak') {
          const careConf       = log.metadata?.careConf       as number | undefined
          const moodEnergyConf = log.metadata?.moodEnergyConf as number | undefined
          const confidence     = log.metadata?.confidence     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BFINT:" blockView>
                <div className="uppercase tracking-widest mb-4">BIOFIELD INTEGRATION PK</div>
                {careConf !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE: {Math.round(careConf * 100)}%</div>
                )}
                {moodEnergyConf !== undefined && (
                  <div className="opacity-60 tabular-nums">MOOD-E: {Math.round(moodEnergyConf * 100)}%</div>
                )}
                <div className="opacity-40 tabular-nums">FIELDS: INTEGRATED</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'integrated_signal_arc') {
          const consecutiveDays = log.metadata?.consecutiveDays as number | undefined
          const channelCount    = log.metadata?.channelCount    as number | undefined
          const confidence      = log.metadata?.confidence      as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTARC:" blockView>
                <div className="uppercase tracking-widest mb-4">INTEGRATED SIGNAL ARC</div>
                {channelCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CHANNELS: {channelCount}/4</div>
                )}
                {consecutiveDays !== undefined && (
                  <div className="opacity-60 tabular-nums">STREAK: {consecutiveDays}D</div>
                )}
                <div className="opacity-40 tabular-nums">SYNC: COGNITIVE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'deep_recovery_protocol') {
          const sleepConf   = log.metadata?.sleepConf   as number | undefined
          const careConf    = log.metadata?.careConf    as number | undefined
          const energyState = log.metadata?.energyState as string | undefined
          const confidence  = log.metadata?.confidence  as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DREC:" blockView>
                <div className="uppercase tracking-widest mb-4">DEEP RECOVERY PROTOCOL</div>
                {sleepConf !== undefined && (
                  <div className="opacity-60 tabular-nums">SLEEP: {Math.round(sleepConf * 100)}%</div>
                )}
                {careConf !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE: {Math.round(careConf * 100)}%</div>
                )}
                {energyState && (
                  <div className="opacity-60 tabular-nums">ATP: {energyState.toUpperCase()}</div>
                )}
                <div className="opacity-40 tabular-nums">PROTOCOL: ACTIVE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_field_alignment') {
          const sealConf     = log.metadata?.sealConf     as number | undefined
          const rhythmConf   = log.metadata?.rhythmConf   as number | undefined
          const biofieldConf = log.metadata?.biofieldConf as number | undefined
          const composite    = log.metadata?.composite    as number | undefined
          const confidence   = log.metadata?.confidence   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QFIELD:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM FIELD ALIGNMENT</div>
                {sealConf !== undefined && (
                  <div className="opacity-60 tabular-nums">SEAL: {Math.round(sealConf * 100)}%</div>
                )}
                {rhythmConf !== undefined && (
                  <div className="opacity-60 tabular-nums">RHYTHM: {Math.round(rhythmConf * 100)}%</div>
                )}
                {biofieldConf !== undefined && (
                  <div className="opacity-60 tabular-nums">BIOFIELD: {Math.round(biofieldConf * 100)}%</div>
                )}
                {composite !== undefined && (
                  <div className="opacity-50 tabular-nums">COMPOSITE: {composite}%</div>
                )}
                <div className="opacity-40 tabular-nums">FIELD: COMPLETE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'care_momentum') {
          const careCount = log.metadata?.careCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CARM:" blockView>
                {careCount !== undefined && (
                  <div className="opacity-60 tabular-nums">ACTS 24H: {careCount}</div>
                )}
                <div className="opacity-40">DEP-SIG: 0</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intention_decay_notice') {
          const note = log.metadata?.note as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTENT-DECAY:" blockView>
                <div className="uppercase tracking-widest mb-4">Intention set — no execution 48h</div>
                {note && <div className="opacity-40">{note}</div>}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intention_follow_through') {
          const plannerCount = log.metadata?.plannerCount as number | undefined
          const goalCount = log.metadata?.goalCount as number | undefined
          const intentionLabel = log.metadata?.intentionLabel as string | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTF:" blockView>
                {intentionLabel && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT</span>
                    <span className="tabular-nums uppercase">{intentionLabel}</span>
                  </div>
                )}
                {plannerCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PLAN 48H</span>
                    <span className="tabular-nums">{plannerCount}</span>
                  </div>
                )}
                {goalCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">GOAL 48H</span>
                    <span className="tabular-nums">{goalCount}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'energy_check') {
          const level = log.metadata?.level as number | undefined
          const status = log.metadata?.status as string | undefined
          const trajectory = log.metadata?.trajectory as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BIO [ATP]:" blockView>
                {level !== undefined && (
                  <div className="tabular-nums uppercase tracking-widest">{level}%</div>
                )}
                {status && (
                  <div className="opacity-60 uppercase">{status}</div>
                )}
                {trajectory && (
                  <div className="opacity-40">&rarr; {trajectory}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'evolution_milestone') {
          const milestone = log.metadata?.milestone as string | undefined
          const dimension = log.metadata?.dimension as string | undefined
          const level = log.metadata?.level as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="EVO:" blockView>
                {milestone && (
                  <div className="uppercase tracking-widest">{milestone}</div>
                )}
                {dimension && (
                  <div className="opacity-60">{dimension}</div>
                )}
                {level !== undefined && (
                  <div className="opacity-40 tabular-nums">LVL {level}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'biofield_recovery_arc') {
          const confidence = log.metadata?.confidence as number | undefined
          const selfCareCount = log.metadata?.selfCareCount as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BIOARC:" blockView>
                <div className="uppercase tracking-widest mb-4">RECOVERY ARC CLOSED</div>
                {selfCareCount !== undefined && (
                  <div className="opacity-60 tabular-nums">CARE 4H: {selfCareCount}</div>
                )}
                <div className="opacity-40 tabular-nums uppercase">DEPLETE → INTERVENE → RESTORE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'cognitive_expansion') {
          const sourcesActive = log.metadata?.sourcesActive as number | undefined
          const wordCount = log.metadata?.wordCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CEXP:" blockView>
                <div className="uppercase tracking-widest mb-4">COGNITIVE EXPANSION</div>
                {wordCount !== undefined && (
                  <div className="opacity-60 tabular-nums">LOG DEPTH: {wordCount}W</div>
                )}
                {sourcesActive !== undefined && (
                  <div className="opacity-60 tabular-nums">SRC ACTIVE: {sourcesActive}</div>
                )}
                <div className="opacity-40 tabular-nums uppercase">MEM · JRNL · GOALS</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'goal_complete') {
          const goalTitle = log.metadata?.title as string | undefined
          const category = log.metadata?.category as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="GOAL-X:" blockView>
                {goalTitle && <div className="opacity-60 uppercase tracking-widest">{goalTitle}</div>}
                {category && <div className="opacity-40 tabular-nums">CAT: {category.toUpperCase()}</div>}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'biofield_coherence_cascade') {
          const moduleCount = log.metadata?.moduleCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CASCADE:" blockView>
                {moduleCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">MOD</span>
                    <span className="tabular-nums">{moduleCount}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'resonant_synthesis') {
          const sourcesActive = log.metadata?.sourcesActive as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SYNTH:" blockView>
                {sourcesActive !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">SRC 7D</span>
                    <span className="tabular-nums">{sourcesActive}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'deep_work_cascade') {
          const signalCount = log.metadata?.signalCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DWRK:" blockView>
                {signalCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">SIG 3H</span>
                    <span className="tabular-nums">{signalCount}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'social_resonance_arc') {
          const signalCount = log.metadata?.signalCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SOCR:" blockView>
                {signalCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">SIG 48H</span>
                    <span className="tabular-nums">{signalCount}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'cognitive_load_release') {
          const plannerCount = log.metadata?.plannerCount as number | undefined
          const journalCount = log.metadata?.journalCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RLSE:" blockView>
                {plannerCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">PLAN 24H</span>
                    <span className="tabular-nums">{plannerCount}</span>
                  </div>
                )}
                {journalCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">JRN 24H</span>
                    <span className="tabular-nums">{journalCount}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'temporal_coherence_window') {
          const calCount = log.metadata?.calendarCount as number | undefined
          const planCount = log.metadata?.plannerCount as number | undefined
          const intentCount = log.metadata?.intentionCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="TCOH:" blockView>
                {calCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CAL 7D</span>
                    <span className="tabular-nums">{calCount}</span>
                  </div>
                )}
                {planCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PLAN 7D</span>
                    <span className="tabular-nums">{planCount}</span>
                  </div>
                )}
                {intentCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT 7D</span>
                    <span className="tabular-nums">{intentCount}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'recovery_velocity') {
          const preMood = log.metadata?.preMood as string | undefined
          const postMood = log.metadata?.postMood as string | undefined
          const windowMinutes = log.metadata?.windowMinutes as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RECV:" blockView>
                {(preMood || postMood) && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ARC</span>
                    <span className="tabular-nums uppercase">{preMood?.toUpperCase() ?? '—'} → {postMood?.toUpperCase() ?? '—'}</span>
                  </div>
                )}
                {windowMinutes !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">WINDOW</span>
                    <span className="tabular-nums">{windowMinutes}m</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_silence') {
          const priorSources = log.metadata?.priorSources as number | undefined
          const silenceHours = log.metadata?.silenceHours as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SIL:" blockView>
                {priorSources !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">PRIOR SRC</span>
                    <span className="tabular-nums">{priorSources}</span>
                  </div>
                )}
                {silenceHours !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">QUIET</span>
                    <span className="tabular-nums">{silenceHours}h</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'circadian_anchor_loss') {
          const consecutiveNights = log.metadata?.consecutiveNights as number | undefined
          const depletedMornings = log.metadata?.depletedMornings as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CIRC:" blockView>
                <div className="opacity-60 uppercase tracking-widest mb-8">DRIFT</div>
                {consecutiveNights !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">LATE-NIGHT</span>
                    <span className="tabular-nums">{consecutiveNights}N</span>
                  </div>
                )}
                {depletedMornings !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">MRN-DEP</span>
                    <span className="tabular-nums">{depletedMornings}D</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'badge_unlock') {
          const badgeName = log.metadata?.badgeName as string | undefined
          const tier = log.metadata?.tier as string | undefined
          const level = log.metadata?.level as number | undefined
          if (!badgeName && !log.text) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BADGE:" blockView>
                <div className="uppercase tracking-widest mb-4">
                  {badgeName || log.text || '—'}
                </div>
                {tier && <div className="opacity-60">TIER: {tier.toUpperCase()}</div>}
                {level !== undefined && (
                  <div className="opacity-40">LVL: {level}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_os_snapshot') {
          const modules = log.metadata?.assembledModules as number | undefined
          const totalModules = log.metadata?.totalModules as number | undefined
          const assembly = log.metadata?.assembly as number | undefined
          const phase = log.metadata?.phase as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QTOS:" blockView>
                {phase && (
                  <div className="uppercase tracking-widest mb-4">{phase}</div>
                )}
                {modules !== undefined && totalModules !== undefined && (
                  <div className="opacity-60 tabular-nums">
                    MOD: {modules}/{totalModules}
                  </div>
                )}
                {assembly !== undefined && (
                  <div className="opacity-40 tabular-nums">ASM: {assembly}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'recipe_viewed') {
          const mealType = log.metadata?.mealType as string | undefined
          const recipeName = log.metadata?.recipeName as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="NUTR:" blockView>
                {mealType && (
                  <div className="uppercase tracking-widest mb-4">{mealType}</div>
                )}
                {recipeName && (
                  <div className="opacity-60">{recipeName}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'goal_set' || log.event === 'goal_journey' || log.event === 'goal_update') {
          const title = log.metadata?.title as string | undefined
          const action = log.metadata?.action as string | undefined
          const stage = log.metadata?.stage as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="GOAL:" blockView>
                {title && (
                  <div className="uppercase tracking-widest mb-4">{title}</div>
                )}
                {(action || stage) && (
                  <div className="opacity-60">
                    {action || stage}
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'full_stack_session') {
          const activeSources = log.metadata?.activeSources as string[] | undefined
          const windowMinutes = log.metadata?.windowMinutes as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="STACK:" blockView>
                {activeSources && activeSources.length > 0 && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">SRC</span>
                    <span className="tabular-nums uppercase">{activeSources.join(' · ')}</span>
                  </div>
                )}
                {windowMinutes !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">WIN</span>
                    <span className="tabular-nums">{windowMinutes}m</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'benchmark_read') {
          const tier = log.metadata?.tier as string | undefined
          const score = log.metadata?.score as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BENCH:" blockView>
                {tier && (
                  <div className="uppercase tracking-widest mb-4">{tier}</div>
                )}
                {score !== undefined && (
                  <div className="opacity-60 tabular-nums">SCR: {score}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'qos_phase_transition') {
          const fromPhase = log.metadata?.fromPhase as string | undefined
          const toPhase = log.metadata?.toPhase as string | undefined
          const moduleId = log.metadata?.moduleId as string | undefined
          if (!fromPhase && !toPhase) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PHASE:" blockView>
                {moduleId && (
                  <div className="uppercase tracking-widest mb-4">{moduleId.replace(/-/g, ' ')}</div>
                )}
                <div className="opacity-60 tabular-nums">
                  {fromPhase?.toUpperCase() || '—'} → {toPhase?.toUpperCase() || '—'}
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'user_login' || log.event === 'user_logout') {
          const isLogin = log.event === 'user_login'
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="AUTH:" blockView>
                <div className="uppercase tracking-widest">
                  {isLogin ? 'SESSION OPENED' : 'SESSION CLOSED'}
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'weather_update') {
          const city = log.context?.city as string | undefined
          const temp = log.context?.temperature as number | undefined
          const description = log.metadata?.description as string | undefined
          if (!city && !temp) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ENV:" blockView>
                {city && <div className="uppercase tracking-widest">{city}</div>}
                {temp && <div className="opacity-60">{Math.round(temp - 273.15)}°C{description ? ` · ${description}` : ''}</div>}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'theme_change') {
          const theme = log.metadata?.theme as string | undefined
          if (!theme) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="UI:" blockView>
                <div className="uppercase tracking-widest">THM {theme}</div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'scheduled_job') {
          const jobName = log.metadata?.jobName as string | undefined
          const success = log.metadata?.success as boolean | undefined
          const resultSent = log.metadata?.result?.sent as number | undefined
          const resultProcessed = log.metadata?.result?.processed as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="JOB:" blockView>
                {jobName && (
                  <div className="uppercase tracking-widest mb-4">
                    {jobName.replace(/-/g, ' ')}
                  </div>
                )}
                <div className="opacity-60">
                  {success === true ? 'STATUS: OK' : success === false ? 'STATUS: ERR' : 'STATUS: —'}
                </div>
                {(resultSent !== undefined || resultProcessed !== undefined) && (
                  <div className="opacity-40 tabular-nums">
                    {resultSent !== undefined ? `SENT: ${resultSent}` : ''}
                    {resultProcessed !== undefined ? `PROC: ${resultProcessed}` : ''}
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'self_care_skip') {
          const reason = log.metadata?.reason as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CARE [SKIP]:" blockView>
                <div className="uppercase tracking-widest opacity-40">
                  {reason || 'Protocol skipped'}
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'weekly_summary_response') {
          const weekNumber = log.metadata?.weekNumber as number | undefined
          const response = log.metadata?.response as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label={`MEM [W${weekNumber ?? '—'}]:`} blockView>
                {response && (
                  <div className="opacity-60">{response}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intention_velocity') {
          const velocity = log.metadata?.velocity as number | undefined
          const sources = log.metadata?.sourcesActive as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTENT [VEL]:" blockView>
                {velocity !== undefined && (
                  <div className="uppercase tracking-widest">VEL {velocity}</div>
                )}
                {sources !== undefined && (
                  <div className="opacity-50 tabular-nums">SRC: {sources}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_burst') {
          const burstCount = log.metadata?.burstCount as number | undefined
          const windowMinutes = log.metadata?.windowMinutes as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SIG [BURST]:" blockView>
                {burstCount !== undefined && (
                  <div className="uppercase tracking-widest tabular-nums">{burstCount} SIGNALS</div>
                )}
                {windowMinutes !== undefined && (
                  <div className="opacity-50 tabular-nums">WIN: {windowMinutes}m</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'pattern_detected') {
          const patternName = log.metadata?.pattern as string | undefined
          const confidence = log.metadata?.confidence as number | undefined
          if (!patternName) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QIE [PAT]:" blockView>
                <div className="uppercase tracking-widest">{patternName.replace(/-/g, ' ')}</div>
                {confidence !== undefined && (
                  <div className="opacity-50 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'qi_rfi') {
          const rfiQuery = log.metadata?.query as string | undefined
          const assessment = log.metadata?.assessment as string | undefined
          const isError = log.metadata?.error as boolean | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QI [RFI]:" blockView>
                {rfiQuery && (
                  <div className="uppercase tracking-widest mb-8">{rfiQuery}</div>
                )}
                {assessment && (
                  <div className={cn('opacity-60', isError && 'opacity-40')}>
                    {assessment.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'prayer_scripture') {
          const scripture = log.metadata?.scripture as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PRAY:" blockView>
                {scripture && (
                  <div className="opacity-60">{scripture}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'assembly_directive') {
          const directive = log.metadata?.directive as string | undefined
          const isError = log.metadata?.error as boolean | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="TRANSMISSION:" blockView>
                {directive && (
                  <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }} className={isError ? 'opacity-40' : ''}>
                    {directive.split('\n').map((line, idx) => {
                      const t = line.trim()
                      if (!t) return <div key={idx} style={{ height: '0.5rem' }} />
                      // Section label: short all-caps ending with colon
                      if (/^[A-Z][A-Z\s]+:$/.test(t) && t.length < 25) {
                        return <div key={idx} style={{ fontSize: '11px', letterSpacing: '0.08em', opacity: 0.4, paddingBottom: '4px', paddingTop: idx > 0 ? '12px' : '0' }}>{t}</div>
                      }
                      // Title: ASSEMBLY RUN / LOT-SR line
                      if (/^ASSEMBLY RUN|^LOT-SR-/.test(t)) {
                        return <div key={idx} style={{ fontSize: '13px', fontWeight: 600, paddingBottom: '10px', opacity: 0.9 }}>{t}</div>
                      }
                      // Key: value — split on first colon if key is short enough
                      const ci = t.indexOf(':')
                      if (ci > 0 && ci < 50 && t.slice(ci + 1).trim().length > 0) {
                        return (
                          <div key={idx} style={{ display: 'flex', gap: '1.5rem', padding: '3px 0', fontSize: '14px', lineHeight: '1.5' }}>
                            <span style={{ minWidth: '140px', flexShrink: 0, opacity: 1 }}>{t.slice(0, ci)}:</span>
                            <span style={{ opacity: 0.65 }}>{t.slice(ci + 1).trim()}</span>
                          </div>
                        )
                      }
                      // Short all-caps status (DEPLOYED. etc.)
                      if (/^[A-Z][A-Z\s\.\-]+$/.test(t) && t.length < 25) {
                        return <div key={idx} style={{ fontSize: '12px', letterSpacing: '0.05em', opacity: 0.7, paddingTop: '8px' }}>{t}</div>
                      }
                      // Default body
                      return <div key={idx} style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.7, padding: '2px 0' }}>{t}</div>
                    })}
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'care_spiral') {
          const careCount = log.metadata?.careCount as number | undefined
          const dominantAction = log.metadata?.dominantAction as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CSPRL:" blockView>
                {careCount !== undefined && (
                  <div className="opacity-60 tabular-nums">ACTS: {careCount}</div>
                )}
                {dominantAction && (
                  <div className="opacity-40 uppercase tracking-widest">{dominantAction}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'biofield_peak') {
          const energy = log.metadata?.energy as string | undefined
          const clarity = log.metadata?.clarity as string | undefined
          const alignment = log.metadata?.alignment as string | undefined
          const support = log.metadata?.support as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BPEAK:" blockView>
                {energy && <div className="opacity-60 uppercase">ATP: {energy}</div>}
                {clarity && <div className="opacity-60 uppercase">CLR: {clarity}</div>}
                {alignment && <div className="opacity-60 uppercase">ALN: {alignment}</div>}
                {support && support !== 'none' && <div className="opacity-40 uppercase">SUP: {support}</div>}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'meridian_lock') {
          const signalCount = log.metadata?.signalCount as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MER:" blockView>
                <div className="opacity-40 tracking-widest">MRN · AFT · EVN</div>
                {signalCount !== undefined && (
                  <div className="opacity-60 mt-8 tabular-nums">SIG: {signalCount}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'multimodal_peak') {
          const sourceCount = log.metadata?.sourceCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MULTI:" blockView>
                {sourceCount !== undefined && (
                  <div className="opacity-60 tabular-nums">MOD: {sourceCount}/5</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'calendar_entry') {
          const entryType = log.metadata?.entryType as string | undefined
          const date = log.metadata?.date as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CAL:" blockView>
                <div className="uppercase tracking-widest">{entryType || 'ENTRY'}</div>
                {date && <div className="opacity-40 mt-8">{date}</div>}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'qos_coherence') {
          const diversityScore = log.metadata?.diversityScore as number | undefined
          const sourceCount = log.metadata?.sourceCount as number | undefined
          const temporalSpread = log.metadata?.temporalSpread as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QOS-COHR:" blockView>
                {diversityScore !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">COHR</span>
                    <span className="tabular-nums">{Math.round(diversityScore * 100)}%</span>
                  </div>
                )}
                {sourceCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">SRC</span>
                    <span className="tabular-nums">{sourceCount}</span>
                  </div>
                )}
                {temporalSpread !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">SPREAD</span>
                    <span className="tabular-nums">{Math.round(temporalSpread * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'archetype_shift') {
          const fromArchetype = log.metadata?.fromArchetype as string | undefined
          const toArchetype = log.metadata?.toArchetype as string | undefined
          const stabilityRate = log.metadata?.stabilityRate as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ARCH-SHIFT:" blockView>
                {fromArchetype && toArchetype && (
                  <div className="opacity-60 uppercase tracking-widest mb-8">
                    {fromArchetype} → {toArchetype}
                  </div>
                )}
                {stabilityRate !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">STABILITY</span>
                    <span className="tabular-nums">{Math.round(stabilityRate * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'archetype_directive_pulse') {
          const archetype = log.metadata?.archetype as string | undefined
          const label     = log.metadata?.label     as string | undefined
          const directive = log.metadata?.directive  as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DRCT:" blockView>
                {label && (
                  <div className="uppercase tracking-widest mb-4">{label}</div>
                )}
                {archetype && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ARCH</span>
                    <span className="uppercase">{archetype}</span>
                  </div>
                )}
                {directive && (
                  <div className="mt-4 opacity-60 text-xs leading-relaxed">{directive}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intention_completion') {
          const completed = log.metadata?.completed as number | undefined
          const total = log.metadata?.total as number | undefined
          const completionRate = log.metadata?.completionRate as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="INTENT-X:" blockView>
                {completed !== undefined && total !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">DONE</span>
                    <span className="tabular-nums">{completed}/{total}</span>
                  </div>
                )}
                {completionRate !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">RATE</span>
                    <span className="tabular-nums">{Math.round(completionRate * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'source_diversity_pulse') {
          const uniqueSources = log.metadata?.uniqueSources as number | undefined
          const totalPossible = log.metadata?.totalPossible as number | undefined
          const diversityScore = log.metadata?.diversityScore as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DIV-PULSE:" blockView>
                {uniqueSources !== undefined && totalPossible !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">SRC</span>
                    <span className="tabular-nums">{uniqueSources}/{totalPossible}</span>
                  </div>
                )}
                {diversityScore !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">DIV</span>
                    <span className="tabular-nums">{Math.round(diversityScore * 100)}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'integration_arc_peak') {
          const confidence = log.metadata?.confidence as number | undefined
          const triggers = log.metadata?.triggers as string[] | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ARC-PEAK:" blockView>
                {confidence !== undefined && (
                  <div className="opacity-60 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
                {triggers && triggers.length > 0 && (
                  <div className="opacity-40 mt-4">{triggers.join(' · ')}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'adaptive_resonance') {
          const index = log.metadata?.index as number | undefined
          const trend = log.metadata?.trend as string | undefined
          const days = log.metadata?.days as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ADAPT:" blockView>
                {index !== undefined && (
                  <div className="tabular-nums">IDX: {index}/100</div>
                )}
                {trend && <div className="opacity-60 uppercase tracking-widest mt-4">TREND: {trend}</div>}
                {days !== undefined && (
                  <div className="opacity-40 tabular-nums">DAYS: {days}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'community_coherence_pulse') {
          const communityIndex = log.metadata?.communityIndex as number | undefined
          const topMood = log.metadata?.topMood as string | undefined
          const activeCount = log.metadata?.activeUserCount as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COHR-COMM:" blockView>
                {communityIndex !== undefined && (
                  <div className="tabular-nums">IDX: {communityIndex}%</div>
                )}
                {topMood && <div className="opacity-60 uppercase tracking-widest mt-4">{topMood}</div>}
                {activeCount !== undefined && (
                  <div className="opacity-40 tabular-nums">ACTIVE: {activeCount}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'operator_convergence') {
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CONV:" blockView>
                {confidence !== undefined && (
                  <div className="tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
                <div className="opacity-60 uppercase tracking-widest mt-4">P66 · P67 · P68</div>
                <div className="opacity-40 mt-4">Full operator convergence confirmed.</div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_crystallization') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const goalCount      = log.metadata?.goalCount as number | undefined
          const confidence     = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CRYSTAL:" blockView>
                {intentionCount !== undefined && (
                  <div className="tabular-nums">INTENT: {intentionCount}</div>
                )}
                {goalCount !== undefined && (
                  <div className="opacity-60 tabular-nums">GOAL: {goalCount}</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'biorhythm_lock') {
          const anchoredDays = log.metadata?.anchoredDays as number | undefined
          const confidence   = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BIO-LOCK:" blockView>
                {anchoredDays !== undefined && (
                  <div className="tabular-nums">DAYS: {anchoredDays}/7</div>
                )}
                <div className="opacity-60 uppercase tracking-widest mt-4">WINDOW: 7D</div>
                {confidence !== undefined && (
                  <div className="opacity-40 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_coherence_summit') {
          const userIndex  = log.metadata?.userIndex as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PEAK-SUMMIT:" blockView>
                {userIndex !== undefined && (
                  <div className="tabular-nums">IDX: {userIndex}/100</div>
                )}
                {confidence !== undefined && (
                  <div className="opacity-60 tabular-nums">CONF: {Math.round((confidence as number) * 100)}%</div>
                )}
                <div className="opacity-40 uppercase tracking-widest mt-4">ALL GATES OPEN</div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'convergence_audit') {
          const frequency = log.metadata?.frequency as number | undefined
          const peakDay   = log.metadata?.peakDay as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CONV-AUDIT:" blockView>
                {frequency !== undefined && (
                  <div className="tabular-nums">FREQ: {frequency}× / 7D</div>
                )}
                {peakDay && (
                  <div className="opacity-60 uppercase tracking-widest mt-4">PEAK: {peakDay}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'badge_unlock') {
          const badge    = log.metadata?.badge as string | undefined
          const category = log.metadata?.category as string | undefined
          const symbol   = log.metadata?.symbol as string | undefined
          if (badge) {
            recordBadgeSignal(badge, category ?? 'unknown')
          }
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BADGE:" blockView>
                {symbol && <div className="font-mono opacity-80">{symbol}</div>}
                {badge && <div className="uppercase tracking-widest mt-4">{badge.replace(/_/g, ' ')}</div>}
                {category && (
                  <div className="opacity-40 uppercase tracking-widest mt-4">CAT: {category.replace(/_/g, ' ')}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'badge_progress_scan') {
          const unlocksThisWeek = log.metadata?.unlocksThisWeek as number | undefined
          const distinctTypes   = log.metadata?.distinctTypes as number | undefined
          const momentum        = log.metadata?.momentum as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BADGE-SCAN:" blockView>
                {unlocksThisWeek !== undefined && (
                  <div className="tabular-nums">UNLOCKS: {unlocksThisWeek} / 7D</div>
                )}
                {distinctTypes !== undefined && (
                  <div className="tabular-nums opacity-60 mt-4">TYPES: {distinctTypes}</div>
                )}
                {momentum && (
                  <div className="opacity-40 uppercase tracking-widest mt-4">MOMENTUM: {momentum}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'morning_coherence_launch') {
          const intentionLabel = log.metadata?.intentionLabel as string | undefined
          const plannerMinutes = log.metadata?.plannerMinutesAfter as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MCL:" blockView>
                {intentionLabel && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT</span>
                    <span className="tabular-nums uppercase">{intentionLabel}</span>
                  </div>
                )}
                {plannerMinutes !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">PLAN</span>
                    <span className="tabular-nums">+{plannerMinutes}m</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_vault') {
          const wordCount = log.metadata?.journalWordCount as number | undefined
          const sources = log.metadata?.activeSources as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="VAULT:" blockView>
                {wordCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="opacity-30">DEPTH</span>
                    <span className="tabular-nums">{wordCount}w</span>
                  </div>
                )}
                {sources !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">SRC</span>
                    <span className="tabular-nums">{sources}/3</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'depletion_recovery_surge') {
          const careCount = log.metadata?.careCount as number | undefined
          const priorEnergy = log.metadata?.priorEnergy as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SURGE:" blockView>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">ARC</span>
                  <span className="tabular-nums uppercase">{priorEnergy ? priorEnergy.toUpperCase() : 'LOW'} → HIGH</span>
                </div>
                {careCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CARE 6H</span>
                    <span className="tabular-nums">{careCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'evening_coherence_close') {
          const captureCount = log.metadata?.captureCount as number | undefined
          const morningSignal = log.metadata?.morningSignalPresent as boolean | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="EVE:" blockView>
                {morningSignal !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">DIURNAL ARC</span>
                    <span className="tabular-nums">{morningSignal ? 'CLOSED' : 'OPEN'}</span>
                  </div>
                )}
                {captureCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">CAPTURE</span>
                    <span className="tabular-nums">{captureCount} ch</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_momentum') {
          const qualifyingDays = log.metadata?.qualifyingDays as number | undefined
          const streakSources = log.metadata?.streakSources as string[] | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="MOM:" blockView>
                {qualifyingDays !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">DAYS 7D</span>
                    <span className="tabular-nums">{qualifyingDays}/7</span>
                  </div>
                )}
                {streakSources && streakSources.length > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">SRC</span>
                    <span className="tabular-nums">{streakSources.length}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'cognitive_depth_arc') {
          const memoryCount  = log.metadata?.memoryCount  as number | undefined
          const journalWords = log.metadata?.journalWords as number | undefined
          const badgeCount   = log.metadata?.badgeCount   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COGN:" blockView>
                {memoryCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MEM 7D</span>
                    <span className="tabular-nums">{memoryCount}</span>
                  </div>
                )}
                {journalWords !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">WORDS</span>
                    <span className="tabular-nums">{journalWords}w</span>
                  </div>
                )}
                {badgeCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">BADGES</span>
                    <span className="tabular-nums">{badgeCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'vitality_peak') {
          const morningMoodCount   = log.metadata?.morningMoodCount   as number | undefined
          const energyLevel        = log.metadata?.energyLevel        as string | undefined
          const biorhythmAnchored  = log.metadata?.biorhythmAnchored  as boolean | undefined
          const hour               = log.metadata?.hour               as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="VITAL:" blockView>
                {morningMoodCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MORNING MOOD</span>
                    <span className="tabular-nums">{morningMoodCount}</span>
                  </div>
                )}
                {energyLevel !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ENERGY</span>
                    <span className="tabular-nums uppercase">{energyLevel}</span>
                  </div>
                )}
                {hour !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">HOUR</span>
                    <span className="tabular-nums">{String(hour).padStart(2, '0')}:00</span>
                  </div>
                )}
                {biorhythmAnchored !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">BIORHYTHM</span>
                    <span className="tabular-nums">{biorhythmAnchored ? 'ANCHORED' : 'UNANCHORED'}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'longitudinal_drift') {
          const weeklyScores = log.metadata?.weeklyScores as number[] | undefined
          const declineStreak = log.metadata?.declineStreak as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DRIFT:" blockView>
                {weeklyScores && weeklyScores.length > 0 && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">4W ARC</span>
                    <span className="tabular-nums">{weeklyScores.join(' → ')}</span>
                  </div>
                )}
                {declineStreak !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">DECLINE</span>
                    <span className="tabular-nums">{declineStreak}w ↓</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'systemic_thinking') {
          const plannerCount   = log.metadata?.plannerCount   as number | undefined
          const goalsCount     = log.metadata?.goalsCount     as number | undefined
          const intentionsCount = log.metadata?.intentionsCount as number | undefined
          const userIndex      = log.metadata?.userIndex      as number | undefined
          const structuralDepth = log.metadata?.structuralDepth as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SYSTMK:" blockView>
                {plannerCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PLNR 3D</span>
                    <span className="tabular-nums">{plannerCount}</span>
                  </div>
                )}
                {goalsCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">GOAL 3D</span>
                    <span className="tabular-nums">{goalsCount}</span>
                  </div>
                )}
                {intentionsCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INT 3D</span>
                    <span className="tabular-nums">{intentionsCount}</span>
                  </div>
                )}
                {structuralDepth !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">STRUCT</span>
                    <span className="tabular-nums">{structuralDepth}</span>
                  </div>
                )}
                {userIndex !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">IDX</span>
                    <span className="tabular-nums">{userIndex}/100</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'adaptive_momentum') {
          const streakDays      = log.metadata?.streakDays      as number | undefined
          const structuralDepth = log.metadata?.structuralDepth as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ADAPT-MOM:" blockView>
                {streakDays !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">STREAK</span>
                    <span className="tabular-nums">{streakDays}d</span>
                  </div>
                )}
                {structuralDepth !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">STRUCT</span>
                    <span className="tabular-nums">{structuralDepth}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'vitality_strategy_peak') {
          const morningMoodCount = log.metadata?.morningMoodCount as number | undefined
          const structuralDepth  = log.metadata?.structuralDepth  as number | undefined
          const hour             = log.metadata?.hour             as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="VSTRAT:" blockView>
                {morningMoodCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MRN MOOD</span>
                    <span className="tabular-nums">{morningMoodCount}</span>
                  </div>
                )}
                {structuralDepth !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">STRUCT</span>
                    <span className="tabular-nums">{structuralDepth}</span>
                  </div>
                )}
                {hour !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">HOUR</span>
                    <span className="tabular-nums">{String(hour).padStart(2, '0')}:00</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'lot_ai_story') {
          const weekNumber    = log.metadata?.weekNumber    as number | undefined
          const weekTone      = log.metadata?.weekTone      as string | undefined
          const dominantMood  = log.metadata?.dominantMood  as string | undefined
          const checkinsCount = log.metadata?.checkinsCount as number | undefined
          const selfCareCount = log.metadata?.selfCareCount as number | undefined
          const intentionsCount = log.metadata?.intentionsCount as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="STORY:" blockView>
                {weekNumber !== undefined && (
                  <div className="uppercase tracking-widest mb-4">W{weekNumber}</div>
                )}
                {weekTone && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">TONE</span>
                    <span className="uppercase">{weekTone}</span>
                  </div>
                )}
                {dominantMood && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MOOD</span>
                    <span className="uppercase">{dominantMood}</span>
                  </div>
                )}
                {checkinsCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CHK</span>
                    <span className="tabular-nums">{checkinsCount}</span>
                  </div>
                )}
                {selfCareCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CARE</span>
                    <span className="tabular-nums">{selfCareCount}</span>
                  </div>
                )}
                {intentionsCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">INTENT</span>
                    <span className="tabular-nums">{intentionsCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_learning_spiral') {
          const memoryCount  = log.metadata?.memoryCount  as number | undefined
          const journalWords = log.metadata?.journalWords as number | undefined
          const badgeCount   = log.metadata?.badgeCount   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="LEARN:" blockView>
                {memoryCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MEM 7D</span>
                    <span className="tabular-nums">{memoryCount}</span>
                  </div>
                )}
                {journalWords !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">WORDS 7D</span>
                    <span className="tabular-nums">{journalWords}w</span>
                  </div>
                )}
                {badgeCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">BADGES 7D</span>
                    <span className="tabular-nums">{badgeCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'accountability_arc') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const cohortCount    = log.metadata?.cohortCount    as number | undefined
          const goalCount      = log.metadata?.goalCount      as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="ACCT:" blockView>
                {intentionCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT 7D</span>
                    <span className="tabular-nums">{intentionCount}</span>
                  </div>
                )}
                {cohortCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">COHORT 7D</span>
                    <span className="tabular-nums">{cohortCount}</span>
                  </div>
                )}
                {goalCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">GOALS 7D</span>
                    <span className="tabular-nums">{goalCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'full_presence_arc') {
          const morningCount = log.metadata?.morningCount as number | undefined
          const eveningCount = log.metadata?.eveningCount as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PRES:" blockView>
                {morningCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MORNING</span>
                    <span className="tabular-nums">{morningCount}</span>
                  </div>
                )}
                {eveningCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">EVENING</span>
                    <span className="tabular-nums">{eveningCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'pattern_health_scan') {
          const patternsActive = log.metadata?.patternsActive as number | undefined
          const coverage       = log.metadata?.coverage       as number | undefined
          const topPattern     = log.metadata?.topPattern     as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PHR:" blockView>
                {patternsActive !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ACTIVE</span>
                    <span className="tabular-nums">{patternsActive}</span>
                  </div>
                )}
                {coverage !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">COVERAGE</span>
                    <span className="tabular-nums">{coverage}%</span>
                  </div>
                )}
                {topPattern && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">TOP</span>
                    <span className="tabular-nums uppercase">{topPattern}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'daily_rhythm_lock') {
          const completeDays = log.metadata?.completeDays as number | undefined
          const morningToday = log.metadata?.morningToday as number | undefined
          const eveningToday = log.metadata?.eveningToday as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RLOCK:" blockView>
                {completeDays !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">STREAK</span>
                    <span className="tabular-nums">{completeDays}d</span>
                  </div>
                )}
                {morningToday !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MORNING</span>
                    <span className="tabular-nums">{morningToday}</span>
                  </div>
                )}
                {eveningToday !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">EVENING</span>
                    <span className="tabular-nums">{eveningToday}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'cross_domain_mastery_pulse') {
          const memoryCount  = log.metadata?.memoryCount  as number | undefined
          const journalWords = log.metadata?.journalWords as number | undefined
          const badgeCount   = log.metadata?.badgeCount   as number | undefined
          const goalCount    = log.metadata?.goalCount    as number | undefined
          const plannerCount = log.metadata?.plannerCount as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CROSS:" blockView>
                {memoryCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MEM 7D</span>
                    <span className="tabular-nums">{memoryCount}</span>
                  </div>
                )}
                {journalWords !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">WORDS 7D</span>
                    <span className="tabular-nums">{journalWords}w</span>
                  </div>
                )}
                {badgeCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">BADGES 7D</span>
                    <span className="tabular-nums">{badgeCount}</span>
                  </div>
                )}
                {goalCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">GOALS 7D</span>
                    <span className="tabular-nums">{goalCount}</span>
                  </div>
                )}
                {plannerCount !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">PLANS 7D</span>
                    <span className="tabular-nums">{plannerCount}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'systemic_readiness_peak') {
          const archetype     = log.metadata?.archetype     as string | undefined
          const confidence    = log.metadata?.confidence    as number | undefined
          const energyBand    = log.metadata?.energyBand    as string | undefined
          const readinessScore = log.metadata?.readinessScore as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SYSRDY:" blockView>
                {archetype && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ARCH</span>
                    <span className="uppercase tracking-widest text-xs">{archetype}</span>
                  </div>
                )}
                {confidence !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CONF</span>
                    <span className="tabular-nums">{confidence}%</span>
                  </div>
                )}
                {energyBand && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ATP</span>
                    <span className="capitalize">{energyBand}</span>
                  </div>
                )}
                {readinessScore !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">READINESS</span>
                    <span className="tabular-nums">{readinessScore}%</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'intent_gap_pulse') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const gapMinutes     = log.metadata?.gapMinutes     as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="IGAP:" blockView>
                {intentionCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT</span>
                    <span className="tabular-nums">{intentionCount}</span>
                  </div>
                )}
                {gapMinutes !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">GAP</span>
                    <span className="tabular-nums">{gapMinutes}m</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">WINDOW</span>
                  <span>24H</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'recovery_initiation') {
          const selfcareCount     = log.metadata?.selfcareCount     as number | undefined
          const priorEnergyLevel  = log.metadata?.priorEnergyLevel  as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RECOV:" blockView>
                {selfcareCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CARE</span>
                    <span className="tabular-nums">{selfcareCount}</span>
                  </div>
                )}
                {priorEnergyLevel && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PRIOR ATP</span>
                    <span className="capitalize">{priorEnergyLevel}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">STATUS</span>
                  <span>ARC BEGIN</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'cognitive_vitality_sync') {
          const journalWords = log.metadata?.journalWords as number | undefined
          const memoryCount  = log.metadata?.memoryCount  as number | undefined
          const energyBand   = log.metadata?.energyBand   as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="VSYNC:" blockView>
                {journalWords !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">WORDS 24H</span>
                    <span className="tabular-nums">{journalWords}w</span>
                  </div>
                )}
                {memoryCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MEM 24H</span>
                    <span className="tabular-nums">{memoryCount}</span>
                  </div>
                )}
                {energyBand && (
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30">ATP</span>
                    <span className="capitalize">{energyBand}</span>
                  </div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'action_completion_arc') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const planCount      = log.metadata?.planCount      as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="COMP:" blockView>
                {intentionCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT</span>
                    <span className="tabular-nums">{intentionCount}</span>
                  </div>
                )}
                {planCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PLAN</span>
                    <span className="tabular-nums">{planCount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">STATUS</span>
                  <span>GAP CLOSED</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'biological_restoration_peak') {
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const fromBand      = log.metadata?.fromBand      as string | undefined
          const toBand        = log.metadata?.toBand        as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="BRES:" blockView>
                {selfcareCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CARE</span>
                    <span className="tabular-nums">{selfcareCount}</span>
                  </div>
                )}
                {fromBand && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">FROM</span>
                    <span className="capitalize">{fromBand}</span>
                  </div>
                )}
                {toBand && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">TO</span>
                    <span className="capitalize">{toBand}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">ARC</span>
                  <span>RESTORED</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'centennial_convergence') {
          const activeSources = log.metadata?.activeSources as number | undefined
          const energyBand    = log.metadata?.energyBand    as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CENT:" blockView>
                {activeSources !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">SOURCES</span>
                    <span className="tabular-nums">{activeSources}</span>
                  </div>
                )}
                {energyBand && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ATP</span>
                    <span className="capitalize">{energyBand}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">PATTERN</span>
                  <span>P100</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">STATE</span>
                  <span>CENTENNIAL</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_presence_arc') {
          const activeChannels = log.metadata?.activeChannels as number | undefined
          const totalSources   = log.metadata?.totalSources   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QPRES:" blockView>
                {activeChannels !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CHANNELS</span>
                    <span className="tabular-nums">{activeChannels}/6</span>
                  </div>
                )}
                {totalSources !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">SOURCES</span>
                    <span className="tabular-nums">{totalSources}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">WINDOW</span>
                  <span>48H</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">PATTERN</span>
                  <span>P101</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'planner_intention_sync') {
          const intentionCount = log.metadata?.intentionCount as number | undefined
          const planCount      = log.metadata?.planCount      as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PSYNC:" blockView>
                {intentionCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INTENT</span>
                    <span className="tabular-nums">{intentionCount}</span>
                  </div>
                )}
                {planCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PLAN</span>
                    <span className="tabular-nums">{planCount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">WINDOW</span>
                  <span>2H</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">STATUS</span>
                  <span>SYNCED</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'resilience_cascade') {
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const memoryCount   = log.metadata?.memoryCount   as number | undefined
          const fromBand      = log.metadata?.fromBand      as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RCASE:" blockView>
                {fromBand && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ATP-FROM</span>
                    <span className="capitalize">{fromBand}</span>
                  </div>
                )}
                {selfcareCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CARE</span>
                    <span className="tabular-nums">{selfcareCount}</span>
                  </div>
                )}
                {memoryCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CAPTURE</span>
                    <span className="tabular-nums">{memoryCount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">ARC</span>
                  <span>CLOSED</span>
                </div>
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_coherence_peak') {
          const fieldConf  = log.metadata?.fieldConf  as number | undefined
          const userIndex  = log.metadata?.userIndex  as number | undefined
          const threshold  = log.metadata?.threshold  as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QCOHERE:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM COHERENCE PEAK</div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="opacity-30">FIELD</span>
                  <span className="tabular-nums">{fieldConf !== undefined ? `${Math.round(fieldConf)}%` : 'CONFIRMED'}</span>
                </div>
                {userIndex !== undefined && (
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="opacity-30">INDEX</span>
                    <span className="tabular-nums">{userIndex} <span className="opacity-30">/ {threshold ?? 60}+</span></span>
                  </div>
                )}
                <div className="flex justify-between items-baseline mb-2">
                  <span className="opacity-30">STATUS</span>
                  <span>TRANSMITTING</span>
                </div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_matrix_saturation') {
          const emotional  = log.metadata?.emotional  as boolean | undefined
          const memory     = log.metadata?.memory     as boolean | undefined
          const planner    = log.metadata?.planner    as boolean | undefined
          const intentions = log.metadata?.intentions as boolean | undefined
          const selfcare   = log.metadata?.selfcare   as boolean | undefined
          const journal    = log.metadata?.journal    as boolean | undefined
          const confidence = log.metadata?.confidence as number | undefined
          const dims = [
            { key: 'EMO',   val: emotional  },
            { key: 'MEM',   val: memory     },
            { key: 'PLAN',  val: planner    },
            { key: 'INT',   val: intentions },
            { key: 'CARE',  val: selfcare   },
            { key: 'JRN',   val: journal    },
          ]
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SIGMAT:" blockView>
                <div className="uppercase tracking-widest mb-4">SIGNAL MATRIX SATURATION</div>
                <div className="flex gap-x-8 flex-wrap mb-4">
                  {dims.map(d => (
                    <span key={d.key} className={d.val === false ? 'opacity-20' : 'opacity-80'}>
                      {d.key}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="opacity-30">CHANNELS</span>
                  <span className="tabular-nums">6/6</span>
                </div>
                <div className="opacity-40 tabular-nums">MATRIX: FULL</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'temporal_biofield_sync') {
          const morningConf  = log.metadata?.morningConf  as number | undefined
          const sealConf     = log.metadata?.sealConf     as number | undefined
          const biofieldConf = log.metadata?.biofieldConf as number | undefined
          const composite    = log.metadata?.composite    as number | undefined
          const confidence   = log.metadata?.confidence   as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="TBIOF:" blockView>
                <div className="uppercase tracking-widest mb-4">TEMPORAL-BIOFIELD SYNC</div>
                {morningConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="opacity-30">MORNING</span>
                    <span className="tabular-nums">{Math.round(morningConf * 100)}%</span>
                  </div>
                )}
                {sealConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="opacity-30">SEAL</span>
                    <span className="tabular-nums">{Math.round(sealConf * 100)}%</span>
                  </div>
                )}
                {biofieldConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="opacity-30">BIOFIELD</span>
                    <span className="tabular-nums">{Math.round(biofieldConf * 100)}%</span>
                  </div>
                )}
                {composite !== undefined && (
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="opacity-50">COMPOSITE</span>
                    <span className="tabular-nums">{composite}%</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">SYNC: CONFIRMED</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'physiological_presence_arc') {
          const selfcareCount = log.metadata?.selfcareCount as number | undefined
          const morningPresent = log.metadata?.morningPresent as boolean | undefined
          const eveningPresent = log.metadata?.eveningPresent as boolean | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="PHYARC:" blockView>
                <div className="uppercase tracking-widest mb-4">BIOLOGICAL ARC</div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">MORNING</span>
                  <span className="tabular-nums">{morningPresent ? 'PRESENT' : '—'}</span>
                </div>
                {selfcareCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CARE</span>
                    <span className="tabular-nums">{selfcareCount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">EVENING</span>
                  <span className="tabular-nums">{eveningPresent ? 'PRESENT' : '—'}</span>
                </div>
                <div className="opacity-40 tabular-nums">LOOP: DAWN → DUSK</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_signal_emergence') {
          const peakCount = log.metadata?.peakCount as number | undefined
          const windowDays = log.metadata?.windowDays as number | undefined
          const emergenceRate = log.metadata?.emergenceRate as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QEMERG:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM EMERGENCE</div>
                {peakCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PEAKS 7D</span>
                    <span className="tabular-nums">{peakCount}</span>
                  </div>
                )}
                {windowDays !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">WINDOW</span>
                    <span className="tabular-nums">{windowDays}D</span>
                  </div>
                )}
                {emergenceRate !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">RATE</span>
                    <span className="tabular-nums">{emergenceRate}/D</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">EXCEPTION → BASELINE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'adaptive_signal_web') {
          const sourceCount = log.metadata?.sourceCount as number | undefined
          const patternCount = log.metadata?.patternCount as number | undefined
          const minDimension = log.metadata?.minDimension as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SIGEWEB:" blockView>
                <div className="uppercase tracking-widest mb-4">ADAPTIVE SIGNAL WEB</div>
                {sourceCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">SRC 7D</span>
                    <span className="tabular-nums">{sourceCount}</span>
                  </div>
                )}
                {patternCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PATTERNS</span>
                    <span className="tabular-nums">{patternCount}</span>
                  </div>
                )}
                {minDimension !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MIN DIM</span>
                    <span className="tabular-nums">{minDimension}</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">6 DIM · ALL LIVE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'circadian_signal_lock') {
          const circadianSignals = log.metadata?.circadianSignals as number | undefined
          const morningPresent = log.metadata?.morningPresent as boolean | undefined
          const afternoonPresent = log.metadata?.afternoonPresent as boolean | undefined
          const eveningPresent = log.metadata?.eveningPresent as boolean | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="CIRC-LK:" blockView>
                <div className="uppercase tracking-widest mb-4">CIRCADIAN SIGNAL LOCK</div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">DAWN</span>
                  <span className="tabular-nums">{morningPresent ? 'ANCHORED' : '—'}</span>
                </div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">MERIDIAN</span>
                  <span className="tabular-nums">{afternoonPresent ? 'ANCHORED' : '—'}</span>
                </div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">DUSK</span>
                  <span className="tabular-nums">{eveningPresent ? 'ANCHORED' : '—'}</span>
                </div>
                {circadianSignals !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ARC SIG</span>
                    <span className="tabular-nums">{circadianSignals}</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">3-ARC · FULL CLOCK</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'dimensional_saturation') {
          const minDimension = log.metadata?.minDimension as number | undefined
          const overall = log.metadata?.overall as number | undefined
          const sourceCount = log.metadata?.sourceCount as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="DIMSAT:" blockView>
                <div className="uppercase tracking-widest mb-4">DIMENSIONAL SATURATION</div>
                {minDimension !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MIN DIM</span>
                    <span className="tabular-nums">{minDimension}</span>
                  </div>
                )}
                {overall !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">OVERALL</span>
                    <span className="tabular-nums">{overall}%</span>
                  </div>
                )}
                {sourceCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">SRC 7D</span>
                    <span className="tabular-nums">{sourceCount}</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">6 DIM ≥ 30 · FULL LOAD</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_identity_crystallization') {
          const cohortSignalCount = log.metadata?.cohortSignalCount as number | undefined
          const activePatterns = log.metadata?.activePatterns as number | undefined
          const userIndex = log.metadata?.userIndex as number | undefined
          const confidence = log.metadata?.confidence as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QIDCRYST:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM IDENTITY CRYSTALLIZATION</div>
                {cohortSignalCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">COHORT 7D</span>
                    <span className="tabular-nums">{cohortSignalCount}</span>
                  </div>
                )}
                {activePatterns !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PATTERNS</span>
                    <span className="tabular-nums">{activePatterns}</span>
                  </div>
                )}
                {userIndex !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">INDEX</span>
                    <span className="tabular-nums">{userIndex}%</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">ID HARDENING · OS STABLE</div>
                {confidence !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {Math.round(confidence * 100)}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'signal_coherence_cascade') {
          const seals = log.metadata?.seals as string[] | undefined
          const convergenceLevel = log.metadata?.convergenceLevel as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="SIG-CASC:" blockView>
                <div className="uppercase tracking-widest mb-4">SIGNAL COHERENCE CASCADE</div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="opacity-30">SEALS</span>
                  <span className="tabular-nums">{seals ? seals.join(' · ') : 'CIRCADIAN · DIMENSIONAL · IDENTITY'}</span>
                </div>
                <div className="opacity-40 tabular-nums">THREE SEALS OPEN · FULL CONVERGENCE</div>
                {convergenceLevel && (
                  <div className="opacity-30 tabular-nums">LEVEL: {convergenceLevel}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_presence_field') {
          const uniqueSources = log.metadata?.uniqueSources as number | undefined
          const fieldDensity = log.metadata?.fieldDensity as string | undefined
          const fieldConf = log.metadata?.fieldConf as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QPFIELD:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM PRESENCE FIELD</div>
                {uniqueSources !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">SRC 24H</span>
                    <span className="tabular-nums">{uniqueSources}</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">ADAPTIVE WEB · COHERENCE PEAK · FIELD LIVE</div>
                {fieldDensity && (
                  <div className="opacity-30 tabular-nums">DENSITY: {fieldDensity}</div>
                )}
                {fieldConf !== undefined && (
                  <div className="opacity-30 tabular-nums">CONF: {fieldConf}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'identity_momentum_lock') {
          const lockStrength = log.metadata?.lockStrength as number | undefined
          const arc = log.metadata?.arc as string | undefined
          const idConf = log.metadata?.idConf as number | undefined
          const momentumConf = log.metadata?.momentumConf as number | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="IDLOCK:" blockView>
                <div className="uppercase tracking-widest mb-4">IDENTITY MOMENTUM LOCK</div>
                {idConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">ID CONF</span>
                    <span className="tabular-nums">{idConf}%</span>
                  </div>
                )}
                {momentumConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">MOM CONF</span>
                    <span className="tabular-nums">{momentumConf}%</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">ID CRYSTALLIZED · MOMENTUM SUSTAINED</div>
                {arc && (
                  <div className="opacity-30 tabular-nums">ARC: {arc}</div>
                )}
                {lockStrength !== undefined && (
                  <div className="opacity-30 tabular-nums">LOCK: {lockStrength}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'quantum_presence_crystallization') {
          const crystallizationStrength = log.metadata?.crystallizationStrength as number | undefined
          const presenceConf = log.metadata?.presenceConf as number | undefined
          const crystalConf = log.metadata?.crystalConf as number | undefined
          const state = log.metadata?.state as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="QPCRYST:" blockView>
                <div className="uppercase tracking-widest mb-4">QUANTUM PRESENCE CRYSTALLIZATION</div>
                {presenceConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">PRESENCE CONF</span>
                    <span className="tabular-nums">{presenceConf}%</span>
                  </div>
                )}
                {crystalConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CRYSTAL CONF</span>
                    <span className="tabular-nums">{crystalConf}%</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">FIELD INHABITED · IDENTITY KNOWN</div>
                {state && (
                  <div className="opacity-30 tabular-nums">STATE: {state}</div>
                )}
                {crystallizationStrength !== undefined && (
                  <div className="opacity-30 tabular-nums">CRYST: {crystallizationStrength}%</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'total_field_coherence') {
          const avgConf = log.metadata?.avgConf as number | undefined
          const metaSeals = log.metadata?.metaSeals as string[] | undefined
          const convergenceLevel = log.metadata?.convergenceLevel as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="TOTCOH:" blockView>
                <div className="uppercase tracking-widest mb-4">TOTAL FIELD COHERENCE</div>
                {metaSeals && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">META-SEALS</span>
                    <span className="tabular-nums">{metaSeals.join(' · ')}</span>
                  </div>
                )}
                {avgConf !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">AVG CONF</span>
                    <span className="tabular-nums">{avgConf}%</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">ALL META-SEALS OPEN · ABSOLUTE CONVERGENCE</div>
                {convergenceLevel && (
                  <div className="opacity-30 tabular-nums">CONVERGENCE: {convergenceLevel}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event === 'recovery_intelligence_arc') {
          const velocityHours = log.metadata?.velocityHours as number | undefined
          const negMoodCount = log.metadata?.negMoodCount as number | undefined
          const careCount = log.metadata?.careCount as number | undefined
          const arc = log.metadata?.arc as string | undefined
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="RECINTEL:" blockView>
                <div className="uppercase tracking-widest mb-4">RECOVERY INTELLIGENCE ARC</div>
                {negMoodCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">NEG SIGNALS</span>
                    <span className="tabular-nums">{negMoodCount}</span>
                  </div>
                )}
                {careCount !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">CARE ACTIONS</span>
                    <span className="tabular-nums">{careCount}</span>
                  </div>
                )}
                {velocityHours !== undefined && (
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="opacity-30">VELOCITY</span>
                    <span className="tabular-nums">{velocityHours}h</span>
                  </div>
                )}
                <div className="opacity-40 tabular-nums">FELT → TENDED → RECOVERED → REFLECTED</div>
                {arc && (
                  <div className="opacity-30 tabular-nums">ARC: {arc}</div>
                )}
              </Block>
            </LogContainer>
          )
        } else if (log.event !== 'note') {
          if (!log.text) return null
          return (
            <LogContainer key={id} log={log} dateFormat={dateFormat}>
              <Block label="LOG:" blockView>
                {log.text}
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
})

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
  const [qiResponse, setQiResponse] = React.useState<string | null>(null)
  const [qiLoading, setQiLoading] = React.useState(false)
  const [asmResponse, setAsmResponse] = React.useState<string | null>(null)
  const [asmLoading, setAsmLoading] = React.useState(false)
  const [scanResult, setScanResult] = React.useState<string | null>(null)
  const { mutate: submitQi } = useQiQuery({
    onSuccess: (data) => {
      setQiResponse(data.assessment)
      setQiLoading(false)
    },
    onError: () => {
      setQiResponse('QI OFFLINE — Engine unavailable.')
      setQiLoading(false)
    },
  })
  const { mutate: submitAssembly } = useAssemblyDirective({
    onSuccess: (data) => {
      setAsmResponse(data.directive)
      setAsmLoading(false)
    },
    onError: () => {
      setAsmResponse('ASSEMBLY OFFLINE — Engine unavailable.')
      setAsmLoading(false)
    },
  })
  const [prayerResponse, setPrayerResponse] = React.useState<string | null>(null)
  const [prayerLoading, setPrayerLoading] = React.useState(false)
  const [storyResponse, setStoryResponse] = React.useState<string | null>(null)
  const [storyLoading, setStoryLoading] = React.useState(false)
  const [systemHelp, setSystemHelp] = React.useState<string | null>(null)
  const [breatheEnabled, setBreatheEnabled] = React.useState(false)
  const breatheState = useBreathe(breatheEnabled)
  const [silentResult, setSilentResult] = React.useState<string | null>(null)
  const [freezeResult, setFreezeResult] = React.useState<string | null>(null)
  const [fastResult, setFastResult] = React.useState<string | null>(null)
  const [physResult, setPhysResult] = React.useState<string | null>(null)
  const { mutate: submitPrayer } = usePrayerScripture({
    onSuccess: (data) => {
      setPrayerResponse(data.scripture)
      setPrayerLoading(false)
      // Persist: append scripture to log text so it survives NoteEditor remount
      const current = valueRef.current
      const separator = current.trim() ? '\n\n' : ''
      const updated = current + separator + '🕯️ ' + data.scripture
      setValue(updated)
      valueRef.current = updated
      onChangeRef.current(updated)
      setIsSaved(true)
    },
    onError: () => {
      const fallback = 'Psalm 46:10 — He says, "Be still, and know that I am God."'
      setPrayerResponse(fallback)
      setPrayerLoading(false)
      const current = valueRef.current
      const separator = current.trim() ? '\n\n' : ''
      const updated = current + separator + '🕯️ ' + fallback
      setValue(updated)
      valueRef.current = updated
      onChangeRef.current(updated)
      setIsSaved(true)
    },
  })
  const { mutate: submitStory } = useStoryGeneration({
    onSuccess: (data) => {
      setStoryResponse(data.story)
      setStoryLoading(false)
      const current = valueRef.current
      const separator = current.trim() ? '\n\n' : ''
      const updated = current + separator + '📖 ' + data.story
      setValue(updated)
      valueRef.current = updated
      onChangeRef.current(updated)
      setIsSaved(true)
    },
    onError: () => {
      const fallback = 'The system holds your data quietly. When the engine returns, your story will be here.'
      setStoryResponse(fallback)
      setStoryLoading(false)
      const current = valueRef.current
      const separator = current.trim() ? '\n\n' : ''
      const updated = current + separator + '📖 ' + fallback
      setValue(updated)
      valueRef.current = updated
      onChangeRef.current(updated)
      setIsSaved(true)
    },
  })
  const debounceTime = 7000  // 7s for all logs
  const debouncedValue = useDebounce(value, debounceTime)

  // Keep refs in sync
  React.useEffect(() => {
    valueRef.current = value
    // Mark as unsaved when user types
    if (value !== log.text) {
      setIsSaved(false)
      // Don't cancel pending push - let the save complete and push down
      // The sync effect has protection to not overwrite unsaved changes
    }
  }, [value, log.text, primary])

  React.useEffect(() => {
    logTextRef.current = log.text
  }, [log.text])

  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Note: No blur save handler - saves happen via unmount and debounced autosave
  // This keeps scrolling behavior simple (no blur = no issues)

  // Autosave for all logs (7s debounce)
  // Timeline: finish typing > wait 7s > save > opacity fades to 20% > push
  React.useEffect(() => {
    if (log.text === debouncedValue) return

    // Save the log
    onChange(debouncedValue)

    // Feed QIE biofield loop — journal depth signal for Reflection Layer assembly
    const wordCount = debouncedValue.trim().split(/\s+/).filter(Boolean).length
    if (wordCount > 0) {
      try {
        if (primary) {
          recordJournalSignal(wordCount)
        } else {
          recordLogSignal(wordCount, !!log.context)
        }
      } catch {}
    }

    // Update timestamp
    setLastSavedAt(new Date())

    // IMPORTANT: Only mark as saved if current value matches what we're saving
    // This prevents race condition where user types more while save is in progress
    if (valueRef.current === debouncedValue) {
      setIsSaved(true)
    }

    // Track journal dates for streak badges + run behavioral easter eggs
    if (primary && debouncedValue.trim().length > 0) {
      try {
        const today = dayjs().format('YYYY-MM-DD')
        const stored = localStorage.getItem('journal_dates')
        const dates: string[] = stored ? JSON.parse(stored) : []
        if (!dates.includes(today)) {
          dates.push(today)
          localStorage.setItem('journal_dates', JSON.stringify(dates))
        }
        runJournalEasterEggs(debouncedValue)
      } catch {}
    }
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
        onChangeRef.current(valueRef.current)
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
        onChangeRef.current(valueRef.current)
      }
    }
  }, [])

  // Handle Enter key - allow newlines, Cmd/Ctrl+Enter to save
  // Also plays the Soviet synth keyboard click on every keystroke
  // when enabled via Settings or the 🎹 / /synth triggers.
  // Using refs to avoid recreating callback
  const onKeyDown = React.useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Fire the keyboard click for printable keys, space, Enter, Backspace.
      // We skip modifier-only presses and navigation keys so the sound
      // never feels like a machine gun (Arrow keys during scrolling).
      if (stores.isKeyboardSoundOn.get()) {
        const k = ev.key
        const isPrintable =
          k.length === 1 || k === 'Enter' || k === 'Backspace' || k === 'Tab' || k === ' '
        if (isPrintable && !ev.metaKey && !ev.ctrlKey) {
          try { playKeyClick(k) } catch {}
        }
      }

      if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault()
        if (valueRef.current !== logTextRef.current) {
          onChangeRef.current(valueRef.current) // Immediate save
          setLastSavedAt(new Date())
          setIsSaved(true)
        }
        // Optionally blur to show save happened
        ;(ev.target as HTMLTextAreaElement).blur()
      }
      // Regular Enter key creates newline (default behavior)
    },
    [primary]
  )

  // --------------------------------------------------------------------
  // Inline trigger detection: 🎹 emoji or /synth keyword toggles the
  // Soviet keyboard sound; other triggers (listed in logTriggers.ts)
  // are detected here so future modes can hook in without touching
  // the editor. We compare against the previous value via ref so
  // editing around an existing trigger doesn't re-fire it.
  // --------------------------------------------------------------------
  const lastTriggerScanRef = React.useRef(log.text || '')
  React.useEffect(() => {
    const fresh = detectNewTriggers(value, lastTriggerScanRef.current)
    lastTriggerScanRef.current = value
    if (fresh.length === 0) return

    for (const trigger of fresh as LogTrigger[]) {
      if (trigger === 'toggle-synth') {
        const next = !stores.isKeyboardSoundOn.get()
        stores.isKeyboardSoundOn.set(next)
        try {
          if (next) playSynthActivationChime()
          else playSynthDeactivationChime()
        } catch {}
      } else if (trigger === 'radio-toggle') {
        stores.isRadioOn.set(!stores.isRadioOn.get())
      } else if (trigger === 'night-mode') {
        if (!stores.isCustomThemeEnabled.get()) {
          stores.theme.set('dark')
        }
      } else if (trigger === 'prayer-mode') {
        if (!stores.isCustomThemeEnabled.get()) {
          stores.theme.set('dark')
        }
        if (!prayerLoading) {
          setPrayerLoading(true)
          setPrayerResponse(null)
          try {
            const logText = value.replace(/\/prayer/i, '').replace(/🕯️?/g, '').trim()
            const state = getUserState()
            const index = getUserIndex()
            submitPrayer({
              logText,
              quantumState: state,
              userIndex: index,
            })
          } catch {
            submitPrayer({ logText: value })
          }
        }
      } else if (trigger === 'qos-report') {
        try { analyzeIntentions() } catch {}
      } else if (trigger === 'assembly-check') {
        if (!asmLoading) {
          setAsmLoading(true)
          setAsmResponse(null)
          try {
            const state = getUserState()
            const index = getUserIndex()
            const asm = getAssemblyState()
            const dormant = asm.modules.filter(m => m.phase === 'dormant').map(m => m.id)
            const active = asm.modules.filter(m => m.phase !== 'dormant').map(m => m.id)
            submitAssembly({
              quantumState: state,
              userIndex: index,
              assemblyState: {
                overallAssembly: asm.overallAssembly,
                assembledCount: asm.assembledCount,
                totalModules: asm.totalModules,
                phase: asm.phase,
                dormantModules: dormant,
                activeModules: active,
              },
            })
          } catch {
            submitAssembly({})
          }
        }
      } else if (trigger === 'ai-scan') {
        try {
          const asm = getAssemblyState()
          const eng = intentionEngine.get()
          const badges = getEarnedBadges()
          const totalBadges = Object.keys(BADGES).length
          const patternCount = eng.recognizedPatterns?.length || 0
          const signals = eng.signals || []
          const lastSignal = signals.length > 0 ? signals[signals.length - 1] : null
          const lastSignalAgo = lastSignal ? Math.round((Date.now() - lastSignal.timestamp) / (1000 * 60)) : null
          const connected = stores.isConnected.get()
          const online = stores.usersOnline.get()
          const total = stores.usersTotal.get()
          const version = stores.appVersion.get()
          const moduleLines = asm.modules.map(m => {
            const pct = Math.round(m.density * 100)
            return `  ${m.id.toUpperCase().padEnd(16)} ${m.phase.toUpperCase().padEnd(12)} ${pct}%`
          }).join('\n')

          const lines = [
            `LOT STATUS: ${connected ? 'CONNECTED' : 'OFFLINE'}${version ? ` (v${version})` : ''}`,
            `NETWORK: ${online}/${total} operators online`,
            `ASSEMBLY: ${asm.overallAssembly}% (${asm.assembledCount}/${asm.totalModules} modules) PHASE: ${asm.phase.toUpperCase()}`,
            `BADGES: ${badges.length}/${totalBadges} unlocked`,
            `QIE: ${patternCount} patterns detected`,
            lastSignalAgo !== null ? `LAST SIGNAL: ${lastSignalAgo < 60 ? lastSignalAgo + 'm ago' : Math.round(lastSignalAgo / 60) + 'h ago'}` : 'LAST SIGNAL: NO DATA',
            ``,
            `MODULES:`,
            moduleLines,
          ]
          setScanResult(lines.join('\n'))
        } catch {
          setScanResult('SCAN FAILED — Unable to read system state.')
        }
      } else if (trigger === 'qi-rfi') {
        const qiMatch = value.match(/\/qi\s+(.+)/i)
        if (qiMatch && qiMatch[1].trim().length >= 2 && !qiLoading) {
          const query = qiMatch[1].trim()
          setQiLoading(true)
          setQiResponse(null)
          try {
            const state = getUserState()
            const index = getUserIndex()
            submitQi({
              query,
              quantumState: state,
              userIndex: index,
            })
          } catch {
            submitQi({ query })
          }
        }
      } else if (trigger === 'breathe') {
        setBreatheEnabled(prev => !prev)
      } else if (trigger === 'silent-mode') {
        try {
          const eng = intentionEngine.get()
          const signals = (eng as any).signals || []
          const lastSignal = signals.length > 0 ? signals[signals.length - 1] : null
          const silenceHours = lastSignal
            ? Math.round((Date.now() - lastSignal.timestamp) / (1000 * 60 * 60))
            : null
          const lines = [
            'SIGNAL STREAM   QUIET',
            silenceHours !== null ? `LAST SIGNAL     ${silenceHours}H AGO` : 'LAST SIGNAL     UNKNOWN',
            'RESPONSE        STANDBY',
            'PROTOCOL        SIGNAL SILENCE ACKNOWLEDGED',
          ]
          setSilentResult(lines.join('\n'))
        } catch {
          setSilentResult('SIGNAL STREAM QUIET\nRESPONSE        STANDBY')
        }
      } else if (trigger === 'freeze-widgets') {
        const now = new Date()
        const hh = now.getHours().toString().padStart(2, '0')
        const mm = now.getMinutes().toString().padStart(2, '0')
        const lines = [
          'PROTOCOL        FREEZE',
          `TIME            ${hh}:${mm}`,
          'STATUS          LOCKED',
          'NEXT            BREATHE — THEN RESUME',
        ]
        setFreezeResult(lines.join('\n'))
      } else if (trigger === 'force-fast') {
        try {
          const state = getFastingState(new Date(), 'orthodox')
          const lines = state.isFastingDay
            ? [
                `FAST            ${state.label.toUpperCase()}`,
                `DAY             ${state.dayIndex} OF ${state.totalDays}`,
                `MODE            ${state.mode.replace(/-/g, ' ').toUpperCase()}`,
                `STRICTNESS      ${Math.round(state.strictness * 100)}%`,
                state.rationale.toUpperCase(),
              ]
            : [
                'FAST            NO ACTIVE FAST TODAY',
                'TRADITION       ORTHODOX CALENDAR',
              ]
          setFastResult(lines.join('\n'))
        } catch {
          setFastResult('FAST STATE UNAVAILABLE')
        }
      } else if (trigger === 'phys-report') {
        try {
          const state = getUserState()
          const eng = intentionEngine.get()
          const asm = getAssemblyState()
          const patternCount = (eng as any).recognizedPatterns?.length || 0
          const archetype = (eng as any).physiologicalArchetype || (eng as any).archetype || null
          const lines = [
            archetype ? `ARCH            ${String(archetype).toUpperCase()}` : 'ARCH            CLASSIFYING...',
            `ATP             ${String((state as any).energy || 'UNKNOWN').toUpperCase()}`,
            `CLARITY         ${String((state as any).clarity || 'UNKNOWN').toUpperCase()}`,
            `ALIGN           ${String((state as any).alignment || 'UNKNOWN').toUpperCase()}`,
            `PHASE           ${String((asm as any).phase || 'UNKNOWN').toUpperCase()}`,
            `PATTERNS        ${patternCount} DETECTED`,
          ]
          setPhysResult(lines.join('\n'))
        } catch {
          setPhysResult('PHYS STATE UNAVAILABLE')
        }
      } else if (trigger === 'system-help') {
        const lines = [
          'AVAILABLE COMMANDS',
          '',
          '/prayer       Generate contextual scripture',
          '/story        Generate a personal story from recent data',
          '/scan         System status overview',
          '/qi [query]   Ask the Quantum Intelligence engine',
          '/assembly     Self-assembly module status',
          '/phys         Physiological cohort report',
          '/qos          Quantum OS state analysis',
          '/fast         Orthodox fasting calendar',
          '/breathe      4-2-6 breathing exercise',
          '/freeze       Pause and reflect protocol',
          '/silent       Signal silence check',
          '/synth        Toggle keyboard sound',
          '/radio        Toggle radio',
          '/night        Dark mode',
          '/how          Open LOT AI check-in (System tab)',
          '/system       This help screen',
          '',
          'SHORTCUTS',
          'Ctrl+Enter    Save log immediately',
        ]
        setSystemHelp(lines.join('\n'))
      } else if (trigger === 'how-checkin') {
        stores.goTo('system')
      } else if (trigger === 'story-mode') {
        if (!storyLoading) {
          setStoryLoading(true)
          setStoryResponse(null)
          try {
            const logText = value.replace(/\/story/i, '').replace(/📖/g, '').trim()
            const state = getUserState()
            const index = getUserIndex()
            submitStory({
              logText,
              quantumState: state,
              userIndex: index,
            })
          } catch {
            submitStory({ logText: value })
          }
        }
      }
    }
  }, [value])

  const contextText = React.useMemo(() => {
    if (!log?.context) return ''
    const weatherParts: string[] = []
    if (log.context?.temperature) {
      const celsius = toCelsius(log.context.temperature)
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
                'hidden sm:block ___opacity-30 sm:opacity-100',
                !isMouseActive && 'sm:opacity-0'
              )
            : cn(
                'opacity-30',
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
            !primary ? '[ record cleared on empty ]' : (() => {
              const hour = new Date().getHours()
              const phrases = [
                '[ FIELD ENTRY — 0000–0400: night protocol ]',
                '[ FIELD ENTRY — 0400–0600: pre-dawn window ]',
                '[ FIELD ENTRY — 0600–0900: morning briefing ]',
                '[ FIELD ENTRY — 0900–1200: operational block ]',
                '[ FIELD ENTRY — 1200–1400: midday audit ]',
                '[ FIELD ENTRY — 1400–1700: afternoon mission ]',
                '[ FIELD ENTRY — 1700–2000: evening debrief ]',
                '[ FIELD ENTRY — 2000–2400: night transmission ]',
              ]
              const idx =
                hour < 4  ? 0 :
                hour < 6  ? 1 :
                hour < 9  ? 2 :
                hour < 12 ? 3 :
                hour < 14 ? 4 :
                hour < 17 ? 5 :
                hour < 20 ? 6 : 7
              return phrases[idx]
            })()
          }
          className={cn(
            'max-w-[700px] focus:opacity-100 group-hover:opacity-100',
            'placeholder:opacity-100',
            !primary && 'opacity-30',
            primary && isSaved && 'opacity-30',
            primary && !isSaved && 'opacity-100'
          )}
          rows={primary ? 10 : 1}
        />
        {(qiLoading || qiResponse) && (
          <div className="mt-8">
            <Block label="QI [INTSUM]:" blockView>
              {qiLoading && !qiResponse && (
                <div className="opacity-40 uppercase tracking-widest">Processing RFI...</div>
              )}
              {qiResponse && (
                <div className="opacity-60">
                  {qiResponse.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}
            </Block>
          </div>
        )}
        {(asmLoading || asmResponse) && (
          <div className="mt-8">
            <Block label="TRANSMISSION:" blockView>
              {asmLoading && !asmResponse && (
                <div className="opacity-40 uppercase tracking-widest">Generating directive...</div>
              )}
              {asmResponse && (
                <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {asmResponse.split('\n').map((line, idx) => {
                    const t = line.trim()
                    if (!t) return <div key={idx} style={{ height: '0.5rem' }} />
                    if (/^[A-Z][A-Z\s]+:$/.test(t) && t.length < 25) {
                      return <div key={idx} style={{ fontSize: '11px', letterSpacing: '0.08em', opacity: 0.4, marginTop: '0.75rem', marginBottom: '0.25rem' }}>{t}</div>
                    }
                    if (/^ASSEMBLY RUN|^LOT-SR-/.test(t)) {
                      return <div key={idx} style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9, marginBottom: '0.5rem' }}>{t}</div>
                    }
                    const ci = t.indexOf(':')
                    if (ci > 0 && ci < 50 && t.slice(ci + 1).trim().length > 0) {
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '1.5rem', fontSize: '14px', lineHeight: '1.6' }}>
                          <span style={{ minWidth: '140px', opacity: 0.9, flexShrink: 0 }}>{t.slice(0, ci + 1)}</span>
                          <span style={{ opacity: 0.65 }}>{t.slice(ci + 1).trim()}</span>
                        </div>
                      )
                    }
                    if (/^[A-Z][A-Z\s.]+$/.test(t) && t.length < 20) {
                      return <div key={idx} style={{ fontSize: '12px', letterSpacing: '0.05em', opacity: 0.7, marginTop: '0.5rem' }}>{t}</div>
                    }
                    return <div key={idx} style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.7 }}>{t}</div>
                  })}
                </div>
              )}
            </Block>
          </div>
        )}
        {scanResult && (
          <div className="mt-8">
            <Block label="SCAN:" blockView>
              <div className="opacity-60" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {scanResult}
              </div>
            </Block>
          </div>
        )}
        {(prayerLoading || prayerResponse) && (
          <div className="mt-8">
            <Block label="🕯️" blockView>
              {prayerLoading && !prayerResponse && (
                <div className="opacity-40 tracking-widest">...</div>
              )}
              {prayerResponse && (
                <div className="opacity-60 italic">
                  {prayerResponse}
                </div>
              )}
            </Block>
          </div>
        )}
        {breatheEnabled && (
          <div className="mt-8">
            <Block label="BRE:" blockView>
              <div className="opacity-60 tabular-nums tracking-widest">
                {breatheState.display}
              </div>
              <div className="opacity-30 mt-8">4-2-6 · INHALE → HOLD → EXHALE</div>
            </Block>
          </div>
        )}
        {silentResult && (
          <div className="mt-8">
            <Block label="SIL [PROTOCOL]:" blockView>
              <div className="opacity-60" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{silentResult}</div>
            </Block>
          </div>
        )}
        {freezeResult && (
          <div className="mt-8">
            <Block label="FREEZE:" blockView>
              <div className="opacity-60" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{freezeResult}</div>
            </Block>
          </div>
        )}
        {fastResult && (
          <div className="mt-8">
            <Block label="FAST:" blockView>
              <div className="opacity-60" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{fastResult}</div>
            </Block>
          </div>
        )}
        {physResult && (
          <div className="mt-8">
            <Block label="PHYS:" blockView>
              <div className="opacity-60" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{physResult}</div>
            </Block>
          </div>
        )}
        {systemHelp && (
          <div className="mt-8">
            <Block label="SYSTEM:" blockView>
              <div className="opacity-80" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {systemHelp.split('\n').map((line, idx) => {
                  if (!line.trim()) return <div key={idx} style={{ height: '0.75rem' }} />
                  if (line.startsWith('/')) {
                    const spaceIdx = line.search(/\s{2,}/)
                    const cmd = spaceIdx > -1 ? line.slice(0, spaceIdx) : line
                    const desc = spaceIdx > -1 ? line.slice(spaceIdx).trim() : ''
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '1.5rem', padding: '3px 0', fontSize: '14px', lineHeight: '1.5' }}>
                        <span style={{ minWidth: '100px', opacity: 1 }}>{cmd}</span>
                        <span style={{ opacity: 0.6 }}>{desc}</span>
                      </div>
                    )
                  }
                  return (
                    <div key={idx} style={{ fontSize: '11px', letterSpacing: '0.08em', opacity: 0.4, paddingBottom: '4px', paddingTop: idx > 0 ? '12px' : '0' }}>
                      {line}
                    </div>
                  )
                })}
              </div>
            </Block>
          </div>
        )}
        {(storyLoading || storyResponse) && (
          <div className="mt-8">
            <Block label="📖" blockView>
              {storyLoading && !storyResponse && (
                <div className="opacity-40 tracking-widest">...</div>
              )}
              {storyResponse && (
                <div className="opacity-60">
                  {storyResponse.split('\n').map((line, idx) => (
                    <div key={idx}>{line || <br />}</div>
                  ))}
                </div>
              )}
            </Block>
          </div>
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
      const celsius = toCelsius(log.context.temperature)
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
          'opacity-30',
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
          'opacity-30 transition-opacity',
          'group-hover:opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  )
}
