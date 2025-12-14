import * as React from 'react'
import { useStore } from '@nanostores/react'
import { recipeWidget, dismissRecipeWidget } from '#client/stores/recipeWidget'
import { Block } from '#client/components/ui'
import { useCreateLog } from '#client/queries'
import * as stores from '#client/stores'

const FAREWELL_PHRASES = [
  'Bon appétit!',
  'Enjoy!',
  'Buon appetito!',
  'Guten Appetit!',
  '¡Buen provecho!',
  'Smakelijk!',
  'Приятного аппетита!', // Russian
  'いただきます!', // Japanese
  'Enjoy your meal!',
  'Dig in!',
  'Savor it!',
  'Delicious!',
]

export const RecipeWidget: React.FC = () => {
  const state = useStore(recipeWidget)
  const router = useStore(stores.router)
  const { mutate: createLog } = useCreateLog()
  const loggedRecipesRef = React.useRef<Set<string>>(new Set())

  const [isFading, setIsFading] = React.useState(false)
  const [isLabelFading, setIsLabelFading] = React.useState(false)
  const [farewellPhrase, setFarewellPhrase] = React.useState<string | null>(null)

  // Auto-log recipe when it becomes visible on System tab
  React.useEffect(() => {
    if (!state.isVisible) {
      // Don't clear logged recipes when widget hides - persist across sessions
      setIsFading(false)
      setIsLabelFading(false)
      setFarewellPhrase(null)
      return
    }

    // Only log if on System tab (no route or route === 'system')
    const isOnSystemTab = !router || router.route === 'system'
    if (!isOnSystemTab) return

    // Create unique key from meal time and recipe to prevent duplicate logs
    const recipeKey = `${state.mealTime}:${state.recipe}`
    if (loggedRecipesRef.current.has(recipeKey)) return
    loggedRecipesRef.current.add(recipeKey)

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

  const handleDismiss = () => {
    // Pick a random farewell phrase
    const randomPhrase = FAREWELL_PHRASES[Math.floor(Math.random() * FAREWELL_PHRASES.length)]
    setFarewellPhrase(randomPhrase)

    // Greeting stays visible for 3 seconds, then fades with label at memory speed (1400ms)
    setTimeout(() => {
      setIsFading(true) // Fade greeting content
      setIsLabelFading(true) // Fade label at same time
    }, 3000) // 3 seconds visible

    // Dismiss after fade completes
    setTimeout(() => {
      dismissRecipeWidget()
    }, 4400) // 3000ms visible + 1400ms fade = 4400ms total
  }

  return (
    <div
      className={`transition-opacity duration-[1400ms] ${isLabelFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <Block label={getMealLabel()} blockView>
        <div
          onClick={handleDismiss}
          className="cursor-pointer select-none"
        >
          {farewellPhrase ? (
            <div
              className={`font-medium transition-opacity duration-[1400ms] ${isFading ? 'opacity-0' : 'opacity-100'}`}
            >
              {farewellPhrase}
            </div>
          ) : (
            <div>{state.recipe}</div>
          )}
        </div>
      </Block>
    </div>
  )
}
