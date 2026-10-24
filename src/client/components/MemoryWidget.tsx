/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useMemory, useCreateMemory } from '#client/queries'
import { cn } from '#client/utils'
import { fp } from '#shared/utils'
import { MemoryQuestion } from '#shared/types'
import * as stores from '#client/stores'
import { $featureUnlocks } from '#client/stores/evolution'
import { recordSignal, getUserState, analyzeIntentions } from '#client/stores/intentionEngine'
import { getMemoryReflectionPrompt, getStoicReflection } from '#client/utils/narrative'
import dayjs from '#client/utils/dayjs'
import { getNextBadgeUnlock, checkAndAwardBadges } from '#client/utils/badges'
import { runMemoryAnswerEasterEggs } from '#client/utils/easter-eggs'

export const MemoryWidget = React.memo(function MemoryWidget() {
  const featureUnlocks = useStore($featureUnlocks)
  const [isDisplayed, setIsDisplayed] = React.useState(false)
  const [isShown, setIsShown] = React.useState(false)
  const [isQuestionShown, setIsQuestionShown] = React.useState(false)
  const [isResponseShown, setIsResponseShown] = React.useState(false)
  const [question, setQuestion] = React.useState<MemoryQuestion | null>(null)
  const [response, setResponse] = React.useState<string | null>(null)
  const [showErrorDetails, setShowErrorDetails] = React.useState(false)
  const [clickedButtonIndex, setClickedButtonIndex] = React.useState<number | null>(null)

  // Session-local ref to prevent re-showing the same question during this mount
  const shownQuestionId = React.useRef<string | null>(null)

  // Track answered questions in sessionStorage to survive remounts
  const isQuestionAnswered = React.useCallback((questionId: string): boolean => {
    try {
      const answered = sessionStorage.getItem('answeredMemoryQuestions')
      if (!answered) return false
      const ids: string[] = JSON.parse(answered)
      return ids.includes(questionId)
    } catch { return false }
  }, [])

  const markQuestionAnswered = React.useCallback((questionId: string) => {
    try {
      const answered = sessionStorage.getItem('answeredMemoryQuestions')
      const ids: string[] = answered ? JSON.parse(answered) : []
      if (!ids.includes(questionId)) {
        ids.push(questionId)
        // Keep only last 20 to avoid unbounded growth
        sessionStorage.setItem('answeredMemoryQuestions', JSON.stringify(ids.slice(-20)))
      }
    } catch { /* non-critical */ }
  }, [])

  const queryClient = useQueryClient()
  const { data: loadedQuestion = null, error, isLoading, refetch } = useMemory()

  const { mutate: createMemory } = useCreateMemory({
    onSuccess: ({ response, insight }) => {
      // Mark question as answered before hiding it
      if (question?.id) {
        markQuestionAnswered(question.id)
      }

      const date = btoa(dayjs().format('YYYY-MM-DD'))

      setIsQuestionShown(false)
      setTimeout(() => {
        setQuestion(null)

        const stoicReflection = getStoicReflection({
          timeOfDay: undefined,
          actionsToday: 1
        })

        let fullResponse = response
        if (insight && featureUnlocks?.advancedMemory) {
          fullResponse += `\n\n${insight}`
        }
        fullResponse += `\n\n${stoicReflection}`

        setResponse(fullResponse)
        setTimeout(() => {
          setIsResponseShown(true)
          setTimeout(() => {
            setIsShown(false)
            setTimeout(() => {
              setIsDisplayed(false)
              setIsResponseShown(false)
              setResponse(null)
              // Only now allow the next question to load — after the widget
              // has fully dismissed. Moving this earlier caused the next
              // question's show-timer to race with the response display and
              // the old auto-hide timer to tear down the new question.
              shownQuestionId.current = null
              queryClient.invalidateQueries(['/api/memory', date])
            }, 1500)
          }, insight ? 8000 : 6000)
        }, 100)
      }, 1500)
    },
  })

  // Cascade delay for button fade-out (matches Mood widget pattern)
  const getCascadeDelay = (buttonIndex: number) => {
    if (clickedButtonIndex === null || isQuestionShown) return '0ms'
    const distance = Math.abs(buttonIndex - clickedButtonIndex)
    return `${distance * 120}ms`
  }

  const onAnswer = React.useCallback(
    (option: string, buttonIndex: number) => (ev: React.MouseEvent) => {
      if (!question || !question.id) return

      setClickedButtonIndex(buttonIndex)

      createMemory({
        questionId: question.id,
        option,
        question: question.question,
        options: question.options,
      })

      // Run memory answer easter eggs
      try {
        runMemoryAnswerEasterEggs(option)
      } catch (e) {
        console.warn('Memory easter egg check failed:', e)
      }

      // Deferred: record signal after React commits the visual update
      setTimeout(() => {
        try {
          const lowerQ = (question.question || '').toLowerCase()
          const isMedical = ['blood type', 'allergy', 'allergies', 'medication', 'chronic', 'vision', 'dental', 'vaccination', 'heart rate', 'skin type', 'recurring pain', 'hearing', 'drug allergy', 'checkup', 'dominant hand', 'appetite', 'digestion', 'food sensitivity', 'eating habits'].some(kw => lowerQ.includes(kw))
          const isTraumaInformed = ['sleep most nights', 'sudden loud noise', 'physically tense', 'easy is it for you to relax', 'go out of your way to avoid', 'difficult memory', 'cancel plans', 'feel about yourself', 'emotionally numb', 'feel joy', 'unwanted memories', 'vivid dreams', 'emotions become intense', 'trust new people', 'push people away', 'talk to when things feel heavy', 'going through a hard time', 'recover from difficult', 'relationship with food', 'regular are your meals', 'sit down to eat', 'feel about your body', 'check your weight', 'nourish your body', 'eating well', 'appetite been recently'].some(kw => lowerQ.includes(kw))

          const signalSource = isMedical ? 'medical' : isTraumaInformed ? 'resilience' : 'memory'
          const signalName = isMedical ? 'medical_answer' : isTraumaInformed ? 'trauma_informed_answer' : 'answer_given'

          recordSignal(signalSource, signalName, {
            questionId: question.id,
            option,
            question: question.question,
            hour: new Date().getHours()
          })
        } catch (e) {
          console.warn('Failed to record intention signal:', e)
        }
      }, 0)
    },
    [question]
  )

  // Check for badge unlocks on mount
  React.useEffect(() => {
    checkAndAwardBadges().catch(err => console.warn('Badge check failed:', err))
  }, [])

  // Show question when loaded
  React.useEffect(() => {
    if (!loadedQuestion || !loadedQuestion.question) return
    if (shownQuestionId.current === loadedQuestion.id) return

    // Skip questions that were already answered in this session
    if (isQuestionAnswered(loadedQuestion.id)) return

    shownQuestionId.current = loadedQuestion.id

    // Track shown question in localStorage for server-side duplicate detection
    try {
      const recentQuestionsData = localStorage.getItem('recentMemoryQuestions')
      const recentQuestions = recentQuestionsData
        ? JSON.parse(recentQuestionsData) as Array<{ question: string; timestamp: number }>
        : []

      // Remove questions older than 7 days
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      const valid = recentQuestions.filter(q => q.timestamp > sevenDaysAgo)

      valid.unshift({
        question: loadedQuestion.question,
        timestamp: Date.now()
      })

      localStorage.setItem('recentMemoryQuestions', JSON.stringify(valid.slice(0, 10)))
    } catch (e) {
      console.warn('Failed to track shown question:', e)
    }

    // Check for badge unlock first
    let badgeUnlock = null
    try {
      badgeUnlock = getNextBadgeUnlock()
    } catch (e) {
      console.warn('Failed to check badge unlocks:', e)
    }

    if (badgeUnlock) {
      // Show badge unlock, then show question after it dismisses
      setTimeout(() => {
        setIsDisplayed(true)
        setTimeout(() => {
          const badgeDisplay = `${badgeUnlock.symbol} → ${badgeUnlock.name}\n\n${badgeUnlock.unlockMessage.replace('[badge]', badgeUnlock.symbol)}`
          setResponse(badgeDisplay)
          setIsShown(true)
          setIsResponseShown(true)
          // After badge dismisses, show the question
          setTimeout(() => {
            setIsResponseShown(false)
            setResponse(null)
            setTimeout(() => {
              setQuestion(loadedQuestion)
              setClickedButtonIndex(null)
              setIsQuestionShown(true)
            }, 400)
          }, 5000)
        }, 100)
      }, fp.randomElement([1200, 2100, 1650, 2800]))
      return
    }

    // Show question directly
    setTimeout(() => {
      setIsDisplayed(true)
      setTimeout(() => {
        setQuestion(loadedQuestion)
        setClickedButtonIndex(null)
        setIsShown(true)
        setIsQuestionShown(true)
        setResponse(null)
        setIsResponseShown(false)
      }, 100)
    }, fp.randomElement([1200, 2100, 1650, 2800]))
  }, [loadedQuestion, isQuestionAnswered])

  React.useEffect(() => {
    if (response) {
      const timer = setTimeout(() => {
        setIsResponseShown(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [response])

  // Quantum state for reflection prompt
  const readQuantumState = () => {
    try {
      return getUserState()
    } catch (e) {
      return {
        energy: 'moderate' as const,
        clarity: 'clear' as const,
        alignment: 'aligned' as const,
        needsSupport: 'none' as const,
        lastUpdated: Date.now()
      }
    }
  }

  // analyzeIntentions() WRITES the intentionEngine atom. Running it inside a
  // useMemo (render phase) cascaded re-renders across every subscriber before
  // the browser could paint (LOT-DOCTRINE "Render Isolation"). Seed state for
  // an identical first paint, then run the analysis in an effect (after paint)
  // keyed on the question — matching the System.tsx quantumState pattern.
  const [quantumState, setQuantumState] = React.useState(readQuantumState)
  React.useEffect(() => {
    try { analyzeIntentions() } catch (e) { /* ignore */ }
    setQuantumState(readQuantumState())
  }, [question?.id])

  const hasError = !!error && !isLoading && !loadedQuestion

  const handleRetry = React.useCallback(async () => {
    try {
      setShowErrorDetails(false)
      shownQuestionId.current = null

      const date = btoa(dayjs().format('YYYY-MM-DD'))
      const path = '/api/memory'

      localStorage.removeItem(`memory-error-${date}`)
      await queryClient.resetQueries([path, date])
      await new Promise(resolve => setTimeout(resolve, 100))
      await refetch()
    } catch (e) {
      console.error('Retry failed:', e)
    }
  }, [queryClient, refetch])

  return (
    <Block
      label="Memory:"
      blockView
      className={cn(
        'min-h-[208px]',
        'opacity-0 transition-opacity duration-[1400ms]',
        (isShown || hasError) && 'opacity-100'
      )}
    >
      {hasError && (
        <div className="flex flex-col gap-4">
          <div>
            Memory temporarily unavailable.
          </div>

          {showErrorDetails && error && (
            <div className="font-mono grid-fill-light p-4 border border-acc/30 overflow-auto max-h-[200px]">
              <div className="mb-2">Error Details:</div>
              {(error as any).response?.status && (
                <div>Status: {(error as any).response.status}</div>
              )}
              {(error as any).message && (
                <div>Message: {(error as any).message}</div>
              )}
              {(error as any).response?.data && (
                <div className="mt-2">
                  Response: {JSON.stringify((error as any).response.data, null, 2)}
                </div>
              )}
              {!(error as any).response && (
                <div>Network or client error: {String(error)}</div>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleRetry}
              className="flex-1 sm:flex-initial"
            >
              Try again
            </Button>
            <Button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="flex-1 sm:flex-initial"
            >
              {showErrorDetails ? 'Hide details' : 'Show details'}
            </Button>
          </div>
        </div>
      )}
      {!!question && (
        <div>
          <div className={cn(
            'mb-8 transition-opacity duration-[1400ms]',
            isQuestionShown ? 'opacity-100' : 'opacity-0'
          )}>
            {(() => {
              try {
                return getMemoryReflectionPrompt(quantumState.energy, quantumState.clarity, quantumState.alignment)
              } catch (e) {
                return 'Reflect on your recent experiences.'
              }
            })()}
          </div>

          <div className={cn(
            'mb-16 transition-opacity duration-[1400ms]',
            isQuestionShown ? 'opacity-100' : 'opacity-0'
          )}>
            {question?.question || '...'}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:-mb-8 -ml-4">
            {(question?.options || []).map((option, index) => (
              <Button
                key={option}
                className={cn(
                  'w-full sm:w-auto sm:mb-8 transition-opacity duration-[1400ms]',
                  isQuestionShown ? 'opacity-100' : 'opacity-0'
                )}
                style={{ transitionDelay: getCascadeDelay(index) }}
                onClick={onAnswer(option, index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
      {!!response && (
        <div
          className={cn(
            'opacity-0 transition-opacity duration-[1400ms]',
            isResponseShown && 'opacity-100',
            'whitespace-pre-line'
          )}
        >
          {response}
        </div>
      )}
    </Block>
  )
})
