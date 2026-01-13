import React from 'react'
import { useStore } from '@nanostores/react'
import { Block, Button } from '#client/components/ui'
import { useMemory, useCreateMemory } from '#client/queries'
import { cn } from '#client/utils'
import { fp } from '#shared/utils'
import { MemoryQuestion } from '#shared/types'
import * as stores from '#client/stores'
import { recordSignal, getUserState, analyzeIntentions } from '#client/stores/intentionEngine'
import { getMemoryReflectionPrompt } from '#client/utils/narrative'

export function MemoryWidget() {
  const [isDisplayed, setIsDisplayed] = React.useState(false)
  const [isShown, setIsShown] = React.useState(false)
  const [isQuestionShown, setIsQuestionShown] = React.useState(false)
  const [isResponseShown, setIsResponseShown] = React.useState(false)
  const [question, setQuestion] = React.useState<MemoryQuestion | null>(null)
  const [response, setResponse] = React.useState<string | null>(null)
  const lastQuestionId = useStore(stores.lastAnsweredMemoryQuestionId)

  const { data: loadedQuestion = null, error, isLoading } = useMemory()

  // Debug logging
  React.useEffect(() => {
    console.log('📊 MemoryWidget state:', {
      loadedQuestion: loadedQuestion ? { id: loadedQuestion.id, question: loadedQuestion.question?.substring(0, 50) } : null,
      error: error ? (error as any).message : null,
      isLoading,
      lastQuestionId,
      isDisplayed,
      isShown
    })
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

      // Record intention signal for quantum pattern recognition
      recordSignal('memory', 'answer_given', {
        questionId: question.id,
        option,
        question: question.question,
        hour: new Date().getHours()
      })

      createMemory({
        questionId: question.id,
        option,
        question: question.question,
        options: question.options,
      })
    },
    [question]
  )

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

  // Get quantum state for reflection prompt
  const quantumState = React.useMemo(() => {
    analyzeIntentions()
    return getUserState()
  }, [])

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
        isShown && 'opacity-100'
      )}
    >
      {!!question && (
        <div
          className={cn(
            'opacity-0 transition-opacity duration-[1400ms]',
            isQuestionShown && 'opacity-100'
          )}
        >
          {/* Quantum-aware reflection prompt */}
          <div className="mb-8 opacity-60">
            {getMemoryReflectionPrompt(quantumState.energy, quantumState.clarity, quantumState.alignment)}
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
