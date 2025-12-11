import * as React from 'react'
import { useStore } from '@nanostores/react'
import { recipeWidget, dismissRecipeWidget } from '#client/stores/recipeWidget'
import { Block } from '#client/components/ui'

export const RecipeWidget: React.FC = () => {
  const state = useStore(recipeWidget)

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
