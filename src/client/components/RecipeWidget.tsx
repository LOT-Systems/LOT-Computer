import * as React from 'react'
import { useStore } from '@nanostores/react'
import { recipeWidget, dismissRecipeWidget } from '#client/stores/recipeWidget'
import { Block } from '#client/components/ui'
import { useCreateLog } from '#client/queries'
import * as stores from '#client/stores'

export const RecipeWidget: React.FC = () => {
  const state = useStore(recipeWidget)
  const router = useStore(stores.router)
  const { mutate: createLog } = useCreateLog()
  const hasLoggedRef = React.useRef(false)

  // Auto-log recipe when it becomes visible on System tab
  React.useEffect(() => {
    if (!state.isVisible) {
      hasLoggedRef.current = false
      return
    }

    // Only log if on System tab (no route or route === 'system')
    const isOnSystemTab = !router || router.route === 'system'
    if (!isOnSystemTab) return

    // Only log once per recipe show
    if (hasLoggedRef.current) return
    hasLoggedRef.current = true

    // Create log entry with recipe suggestion
    const mealLabel = getMealLabel()
    createLog(
      { text: `${mealLabel} ${state.recipe}` },
      {
        onError: (error) => {
          console.error('Failed to log recipe:', error)
        }
      }
    )
  }, [state.isVisible, state.recipe, router, createLog])

  if (!state.isVisible) return null

  const getMealLabel = () => {
    switch (state.mealTime) {
      case 'breakfast': return 'Breakfast idea:'
      case 'lunch': return 'Lunch idea:'
      case 'dinner': return 'Dinner idea:'
      case 'snack': return 'Snack idea:'
      default: return 'Recipe idea:'
    }
  }

  return (
    <div>
      <Block label={getMealLabel()} blockView>
        <div className="flex items-start justify-between gap-4">
          <div>{state.recipe}</div>
          <button
            onClick={dismissRecipeWidget}
            className="text-acc/40 hover:text-acc transition-colors cursor-pointer select-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </Block>
    </div>
  )
}
