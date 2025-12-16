import * as React from 'react'
import { useStore } from '@nanostores/react'
import { recipeWidget, dismissRecipeWidget } from '#client/stores/recipeWidget'
import { Block } from '#client/components/ui'
import { useCreateLog } from '#client/queries'
import { cn } from '#client/utils'
import * as stores from '#client/stores'

export const RecipeWidget: React.FC = () => {
  const state = useStore(recipeWidget)
  const router = useStore(stores.router)
  const { mutate: createLog } = useCreateLog()
  const loggedRecipesRef = React.useRef<Set<string>>(new Set())
  const [isShown, setIsShown] = React.useState(false)

  // Auto-log recipe when it becomes visible on System tab (only once per meal-time + recipe combo)
  React.useEffect(() => {
    if (!state.isVisible || !state.recipe) return

    // Only log if on System tab (no route or route === 'system')
    const isOnSystemTab = !router || router.route === 'system'
    if (!isOnSystemTab) return

    // Create unique key for this meal-time + recipe combination
    const recipeKey = `${state.mealTime}:${state.recipe}`

    // Skip if we've already logged this exact recipe for this meal time
    if (loggedRecipesRef.current.has(recipeKey)) return

    // Mark as logged
    loggedRecipesRef.current.add(recipeKey)

    // Create log entry with recipe suggestion
    const mealLabel = getMealLabel()
    createLog(
      { text: `${mealLabel} ${state.recipe}` },
      {
        onSuccess: () => {
          console.log(`✅ Logged recipe: ${recipeKey}`)
        },
        onError: (error) => {
          console.error('Failed to log recipe:', error)
          // Remove from logged set on error so it can be retried
          loggedRecipesRef.current.delete(recipeKey)
        }
      }
    )
  }, [state.isVisible, state.recipe, state.mealTime, router, createLog])

  // Handle fade-in when widget becomes visible
  React.useEffect(() => {
    if (state.isVisible) {
      // Small delay before showing to trigger transition
      setTimeout(() => {
        setIsShown(true)
      }, 100)
    } else {
      setIsShown(false)
    }
  }, [state.isVisible])

  const handleDismiss = () => {
    // Fade out first
    setIsShown(false)
    // Then dismiss after transition completes
    setTimeout(() => {
      dismissRecipeWidget()
    }, 1400)
  }

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
      <Block
        label={getMealLabel()}
        blockView
        className={cn(
          'opacity-0 transition-opacity duration-[1400ms]',
          isShown && 'opacity-100',
          'cursor-pointer'
        )}
        onClick={handleDismiss}
      >
        {state.recipe}
      </Block>
    </div>
  )
}
