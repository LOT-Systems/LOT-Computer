import React from 'react'
import { useStore } from '@nanostores/react'
import { Block, Button } from '#client/components/ui'
import { useMemory, useCreateMemory } from '#client/queries'
import { cn } from '#client/utils'
import { fp } from '#shared/utils'
import { MemoryQuestion } from '#shared/types'
import * as stores from '#client/stores'

export function MemoryWidget() {
  const [isDisplayed, setIsDisplayed] = React.useState(false)
  const [isShown, setIsShown] = React.useState(false)
  const [isQuestionShown, setIsQuestionShown] = React.useState(false)
  const [isResponseShown, setIsResponseShown] = React.useState(false)
  const [question, setQuestion] = React.useState<MemoryQuestion | null>(null)
  const [response, setResponse] = React.useState<string | null>(null)
  const lastQuestionId = useStore(stores.lastAnsweredMemoryQuestionId)

  const { data: loadedQuestion = null } = useMemory()

  const { mutate: createMemory } = useCreateMemory({
    onSuccess: ({ response }) => {
      // World generation disabled to reduce server costs
      // fetch('/api/world/generate-element', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // }).catch(err => console.error('World generation error:', err))

      setIsQuestionShown(false)
      setTimeout(() => {
        setQuestion(null)
        setResponse(response)
        setTimeout(() => {
          setIsResponseShown(true)
          setTimeout(() => {
            setIsShown(false)
            setTimeout(() => {
              setIsDisplayed(false)
              setIsResponseShown(false)
              setResponse(null)
            }, 1500)
          }, 5000)
        }, 100)
      }, 1500)
    },
  })

  const onAnswer = React.useCallback(
    (option: string) => (ev: React.MouseEvent) => {
      if (!question || !question.id) return
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
    // Prevent showing the same question twice (persisted across tab switches)
    if (loadedQuestion && loadedQuestion.id !== lastQuestionId) {
      stores.lastAnsweredMemoryQuestionId.set(loadedQuestion.id)
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
