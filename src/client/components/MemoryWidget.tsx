import React from 'react'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useMemory, useCreateMemory } from '#client/queries'
import { cn } from '#client/utils'
import { fp } from '#shared/utils'
import { MemoryQuestion } from '#shared/types'
import * as stores from '#client/stores'
import { recordSignal, getUserState, analyzeIntentions } from '#client/stores/intentionEngine'
import { getMemoryReflectionPrompt, getStoicReflection } from '#client/utils/narrative'
import dayjs from '#client/utils/dayjs'
import { getNextBadgeUnlock, checkAndAwardBadges } from '#client/utils/badges'

export function MemoryWidget() {
  const [isDisplayed, setIsDisplayed] = React.useState(false)
  const [isShown, setIsShown] = React.useState(false)
  const [isQuestionShown, setIsQuestionShown] = React.useState(false)
  const [isResponseShown, setIsResponseShown] = React.useState(false)
  const [question, setQuestion] = React.useState<MemoryQuestion | null>(null)
  const [response, setResponse] = React.useState<string | null>(null)
  const [showErrorDetails, setShowErrorDetails] = React.useState(false)

  // Session-local ref to prevent re-showing the same question during this mount
  const shownQuestionId = React.useRef<string | null>(null)

  const queryClient = useQueryClient()
  const { data: loadedQuestion = null, error, isLoading, refetch } = useMemory()

  const { mutate: createMemory } = useCreateMemory({
    onSuccess: ({ response, insight }) => {
      setIsQuestionShown(false)
      setTimeout(() => {
        setQuestion(null)

        const stoicReflection = getStoicReflection({
          timeOfDay: undefined,
          actionsToday: 1
        })

        let fullResponse = response
        if (insight) {
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
            }, 1500)
          }, insight ? 8000 : 6000)
        }, 100)
      }, 1500)
    },
  })

  const onAnswer = React.useCallback(
    (option: string) => (ev: React.MouseEvent) => {
      if (!question || !question.id) return

      try {
        recordSignal('memory', 'answer_given', {
          questionId: question.id,
          option,
          question: question.question,
          hour: new Date().getHours()
        })
      } catch (e) {
        console.warn('Failed to record intention signal:', e)
      }

      createMemory({
        questionId: question.id,
        option,
        question: question.question,
        options: question.options,
      })
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
          const badgeDisplay = `${badgeUnlock.symbol} ${badgeUnlock.name}\n\n${badgeUnlock.unlockMessage.replace('[badge]', badgeUnlock.symbol)}`
          setResponse(badgeDisplay)
          setIsShown(true)
          setIsResponseShown(true)
          // After badge dismisses, show the question
          setTimeout(() => {
            setIsResponseShown(false)
            setResponse(null)
            setTimeout(() => {
              setQuestion(loadedQuestion)
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
        setIsShown(true)
        setIsQuestionShown(true)
        setResponse(null)
        setIsResponseShown(false)
      }, 100)
    }, fp.randomElement([1200, 2100, 1650, 2800]))
  }, [loadedQuestion])

  React.useEffect(() => {
    if (response) {
      const timer = setTimeout(() => {
        setIsResponseShown(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [response])

  // Quantum state for reflection prompt
  const getQuantumState = () => {
    try {
      analyzeIntentions()
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

  const quantumState = React.useMemo(getQuantumState, [question?.id])

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
        <div
          className={cn(
            'opacity-0 transition-opacity duration-[1400ms]',
            isQuestionShown && 'opacity-100'
          )}
        >
          <div className="mb-8">
            {(() => {
              try {
                return getMemoryReflectionPrompt(quantumState.energy, quantumState.clarity, quantumState.alignment)
              } catch (e) {
                return 'Reflect on your recent experiences.'
              }
            })()}
          </div>

          <div className="mb-16">{question?.question || '...'}</div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:-mb-8 -ml-4">
            {(question?.options || []).map((option) => (
              <Button
                key={option}
                className="w-full sm:w-auto sm:mb-8"
                onClick={onAnswer(option)}
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
}
