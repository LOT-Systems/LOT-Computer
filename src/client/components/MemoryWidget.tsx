import React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useMemory, useCreateMemory } from '#client/queries'
import { cn } from '#client/utils'
import { fp } from '#shared/utils'
import { MemoryQuestion } from '#shared/types'
import * as stores from '#client/stores'
import { recordSignal, getUserState, analyzeIntentions } from '#client/stores/intentionEngine'
import { getMemoryReflectionPrompt } from '#client/utils/narrative'
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
  const lastQuestionId = useStore(stores.lastAnsweredMemoryQuestionId)

  const queryClient = useQueryClient()
  const { data: loadedQuestion = null, error, isLoading, refetch } = useMemory()

  // Debug logging - wrapped in try-catch for safety
  React.useEffect(() => {
    try {
      console.log('📊 MemoryWidget state:', {
        loadedQuestion: loadedQuestion ? {
          id: loadedQuestion.id,
          question: loadedQuestion.question ? loadedQuestion.question.substring(0, 50) : 'no question text'
        } : null,
        error: error ? {
          message: (error as any).message,
          response: (error as any).response?.data,
          status: (error as any).response?.status
        } : null,
        isLoading,
        lastQuestionId,
        isDisplayed,
        isShown
      })
    } catch (e) {
      console.error('Debug logging failed:', e)
    }
  }, [loadedQuestion, error, isLoading, lastQuestionId, isDisplayed, isShown])

  const { mutate: createMemory } = useCreateMemory({
    onSuccess: ({ response, insight }) => {
      // World generation disabled to reduce server costs
      // fetch('/api/world/generate-element', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // }).catch(err => console.error('World generation error:', err))

      setIsQuestionShown(false)
      setTimeout(() => {
        setQuestion(null)
        // Combine response with insight if available
        const fullResponse = insight ? `${response}\n\n${insight}` : response
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
          }, insight ? 7000 : 5000) // Show longer if there's an insight
        }, 100)
      }, 1500)
    },
  })

  const onAnswer = React.useCallback(
    (option: string) => (ev: React.MouseEvent) => {
      if (!question || !question.id) return

      // Record intention signal for quantum pattern recognition - wrapped in try-catch for safety
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

  // Check for badge unlocks on mount and after answers
  React.useEffect(() => {
    checkAndAwardBadges().catch(err => console.warn('Badge check failed:', err))
  }, [])

  React.useEffect(() => {
    // Clear stale cache (older than 12 hours) to allow new questions
    const lastQuestionTime = localStorage.getItem('lastMemoryQuestionTime')
    if (lastQuestionTime) {
      const hoursAgo = (Date.now() - parseInt(lastQuestionTime)) / (1000 * 60 * 60)
      if (hoursAgo > 12) {
        // Cache is stale - clear it to allow new questions
        stores.lastAnsweredMemoryQuestionId.set(null)
        localStorage.removeItem('lastMemoryQuestionTime')
      }
    }

    // Check for badge unlock notification first
    const badgeUnlock = getNextBadgeUnlock()
    if (badgeUnlock) {
      // Show badge unlock instead of question
      setTimeout(() => {
        setIsDisplayed(true)
        setTimeout(() => {
          setResponse(badgeUnlock.unlockMessage)
          setIsShown(true)
          setIsResponseShown(true)
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setIsShown(false)
            setTimeout(() => {
              setIsDisplayed(false)
              setIsResponseShown(false)
              setResponse(null)
            }, 1500)
          }, 5000)
        }, 100)
      }, fp.randomElement([1200, 2100, 1650, 2800]))
      return
    }

    // Prevent showing the same question twice (persisted across tab switches)
    if (loadedQuestion && loadedQuestion.id !== lastQuestionId) {
      stores.lastAnsweredMemoryQuestionId.set(loadedQuestion.id)
      localStorage.setItem('lastMemoryQuestionTime', Date.now().toString())
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
    }
  }, [loadedQuestion, lastQuestionId])

  React.useEffect(() => {
    if (response) {
      setTimeout(() => {
        setIsResponseShown(true)
      }, 1500)
    }
  }, [response])

  // Get quantum state for reflection prompt - wrapped in try-catch for safety
  const quantumState = React.useMemo(() => {
    try {
      analyzeIntentions()
      return getUserState()
    } catch (e) {
      console.warn('Failed to get quantum state:', e)
      // Return safe default state
      return {
        energy: 'moderate',
        clarity: 'clear',
        alignment: 'aligned',
        needsSupport: 'none',
        lastUpdated: Date.now()
      }
    }
  }, [])

  // Show error state if API failed
  const hasError = !!error && !isLoading && !loadedQuestion

  // Retry handler - clears cache and refetches
  const handleRetry = React.useCallback(async () => {
    try {
      console.log('🔄 Retry button clicked - clearing cache and refetching')

      // Hide error details on retry
      setShowErrorDetails(false)

      const date = btoa(dayjs().format('YYYY-MM-DD'))
      const path = '/api/memory'

      // Clear error timestamp from localStorage
      localStorage.removeItem(`memory-error-${date}`)

      // Clear all related cache items
      localStorage.removeItem('lastMemoryQuestionTime')
      stores.lastAnsweredMemoryQuestionId.set(null)

      // Reset the query completely (clears error state and cache)
      await queryClient.resetQueries([path, date])

      // Small delay to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('🔄 Refetching Memory question...')
      // Refetch the query
      const result = await refetch()
      console.log('🔄 Refetch result:', {
        hasData: !!result.data,
        hasError: !!result.error,
        isLoading: result.isLoading
      })
    } catch (e) {
      console.error('❌ Retry failed:', e)
    }
  }, [queryClient, refetch])

  // Only show questions in System page (story moved to Settings)
  return (
    <Block
      label="Memory:"
      blockView
      className={cn(
        'min-h-[208px]',
        // To avoid flickering. This widget should placed last on the "systems" page.
        // Alternatively, max-height animation could be used.
        'opacity-0 transition-opacity duration-[1400ms]',
        (isShown || hasError) && 'opacity-100'
      )}
    >
      {hasError && (
        <div className="flex flex-col gap-4">
          <div className="opacity-60 text-sm">
            Memory temporarily unavailable.
          </div>

          {/* Error Details */}
          {showErrorDetails && error && (
            <div className="text-xs opacity-70 font-mono bg-acc/5 p-3 rounded border border-acc/20 overflow-auto max-h-[200px]">
              <div className="mb-2 font-bold">Error Details:</div>
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
              className="flex-1 sm:flex-initial opacity-60"
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
          {/* Quantum-aware reflection prompt */}
          <div className="mb-8 opacity-60">
            {(() => {
              try {
                return getMemoryReflectionPrompt(quantumState.energy, quantumState.clarity, quantumState.alignment)
              } catch (e) {
                console.warn('Failed to get reflection prompt:', e)
                return 'Reflect on your recent experiences...'
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
            isResponseShown && 'opacity-100'
          )}
        >
          {response}
        </div>
      )}
    </Block>
  )
}
