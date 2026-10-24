/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { recipeWidget, dismissRecipeWidget } from '#client/stores/recipeWidget'
import { Block } from '#client/components/ui'
import { useCreateLog, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import * as stores from '#client/stores'
import { recordSignal } from '#client/stores/intentionEngine'

// ─── Farewell data ────────────────────────────────────────────────────────────

type TempAffinity = 'hot' | 'mild' | 'cold'
type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface FarewellEntry {
  label: string
  phrase: string
  temp?: TempAffinity
  meals: MealSlot[]
}

// 33 entries — enough variety for any meal, weather, or season.
// Scored at runtime: meal match (+3), temp match (+2), sunny/rainy sky (+1 each).
const FAREWELL_ENTRIES: FarewellEntry[] = [
  // Western Europe
  { label: 'France',        phrase: 'Bon appétit!',          temp: 'mild', meals: ['lunch', 'dinner'] },
  { label: 'Italy',         phrase: 'Buon appetito!',         temp: 'mild', meals: ['lunch', 'dinner'] },
  { label: 'Spain',         phrase: '¡Buen provecho!',        temp: 'hot',  meals: ['lunch', 'dinner'] },
  { label: 'Portugal',      phrase: 'Bom apetite!',           temp: 'mild', meals: ['lunch', 'dinner'] },
  { label: 'Germany',       phrase: 'Guten Appetit!',         temp: 'cold', meals: ['breakfast', 'lunch'] },
  { label: 'Netherlands',   phrase: 'Smakelijk!',             temp: 'mild', meals: ['breakfast', 'snack'] },
  { label: 'Greece',        phrase: 'Καλή όρεξη!',            temp: 'hot',  meals: ['lunch', 'dinner'] },
  // Northern Europe
  { label: 'Sweden',        phrase: 'Smaklig måltid!',        temp: 'cold', meals: ['breakfast', 'lunch'] },
  { label: 'Denmark',       phrase: 'Velbekomme!',            temp: 'cold', meals: ['breakfast', 'lunch'] },
  { label: 'Norway',        phrase: 'Vær så god!',            temp: 'cold', meals: ['breakfast'] },
  { label: 'Finland',       phrase: 'Hyvää ruokahalua!',      temp: 'cold', meals: ['breakfast', 'lunch'] },
  { label: 'Gaelic',        phrase: 'Ith gu leòr!',           temp: 'cold', meals: ['breakfast', 'dinner'] },
  { label: 'Welsh',         phrase: 'Mwynhewch!',             temp: 'cold', meals: ['dinner'] },
  // Eastern Europe
  { label: 'Russia',        phrase: 'Приятного аппетита!',    temp: 'cold', meals: ['dinner'] },
  { label: 'Poland',        phrase: 'Smacznego!',             temp: 'cold', meals: ['lunch', 'dinner'] },
  { label: 'Ukraine',       phrase: 'Смачного!',              temp: 'cold', meals: ['lunch', 'dinner'] },
  // Asia
  { label: 'Japan',         phrase: 'いただきます',             temp: 'mild', meals: ['breakfast', 'lunch'] },
  { label: 'Korea',         phrase: '잘 먹겠습니다',            temp: 'mild', meals: ['lunch', 'dinner'] },
  { label: 'China',         phrase: '请慢用',                  temp: 'mild', meals: ['lunch', 'dinner'] },
  { label: 'Thailand',      phrase: 'ทานให้อร่อยนะ',          temp: 'hot',  meals: ['lunch', 'dinner'] },
  { label: 'India',         phrase: 'शुभ भोजन!',              temp: 'hot',  meals: ['lunch', 'dinner'] },
  { label: 'Persia',        phrase: 'نوش جان!',               temp: 'hot',  meals: ['dinner'] },
  // Middle East
  { label: 'Turkey',        phrase: 'Afiyet olsun!',          temp: 'mild', meals: ['lunch', 'dinner'] },
  { label: 'Arabic',        phrase: 'بالهناء والشفاء',         temp: 'hot',  meals: ['dinner'] },
  { label: 'Hebrew',        phrase: 'בתיאבון!',               temp: 'hot',  meals: ['dinner'] },
  // Americas
  { label: 'Mexico',        phrase: '¡Provecho!',             temp: 'hot',  meals: ['lunch', 'dinner'] },
  { label: 'Brazil',        phrase: 'Bom apetite!',           temp: 'hot',  meals: ['lunch', 'dinner'] },
  { label: 'Hawaiian',      phrase: 'ʻAi a nui!',             temp: 'hot',  meals: ['snack', 'lunch'] },
  // Africa & Pacific
  { label: 'Swahili',       phrase: 'Chakula kitamu!',        temp: 'hot',  meals: ['dinner'] },
  { label: 'Māori',         phrase: 'Kai pai!',               temp: 'mild', meals: ['breakfast', 'snack'] },
  // Ancient & classical — no temp preference; slight bonus for dinner
  { label: 'Latin',         phrase: 'Edite bene!',            meals: ['dinner'] },
  { label: 'Ancient Greek', phrase: 'Εὐωχεῖσθε!',            meals: ['dinner'] },
  { label: 'Old Norse',     phrase: 'Ét vel!',    temp: 'cold', meals: ['dinner'] },
]

interface FastingFarewellEntry {
  label: string
  phrase: string
}

const FASTING_FAREWELL_ENTRIES: FastingFarewellEntry[] = [
  { label: 'Prayer',   phrase: 'Amen.' },
  { label: 'Peace',    phrase: 'Peace.' },
  { label: 'Blessing', phrase: 'Blessed fast.' },
  { label: 'Spirit',   phrase: 'Godspeed.' },
  { label: 'Grace',    phrase: 'Go gently.' },
  { label: 'Rest',     phrase: 'Held.' },
]

// ─── Context-based picker ─────────────────────────────────────────────────────

function pickFarewellEntry(
  mealTime: string | undefined,
  tempKelvin: number | undefined,
  description: string | undefined,
  isFasting: boolean
): { label: string; phrase: string } {
  if (isFasting) {
    return FASTING_FAREWELL_ENTRIES[Math.floor(Math.random() * FASTING_FAREWELL_ENTRIES.length)]
  }

  const tempC = tempKelvin != null ? tempKelvin - 273.15 : undefined
  const tempCat: TempAffinity | undefined =
    tempC == null ? undefined : tempC > 27 ? 'hot' : tempC < 13 ? 'cold' : 'mild'

  const sky = description?.toLowerCase() ?? ''
  const isSunny = /clear|sun|fair/.test(sky)
  const isRainy = /rain|drizzle|shower|snow|overcast/.test(sky)

  const scored = FAREWELL_ENTRIES.map((entry) => {
    let score = 2
    if (mealTime && entry.meals.includes(mealTime as MealSlot)) score += 3
    if (tempCat && entry.temp === tempCat) score += 2
    if (!entry.temp) score += 1 // timeless entries get a small bonus for variety
    if (isSunny && entry.temp === 'hot') score += 1
    if (isRainy && entry.temp === 'cold') score += 1
    return { entry, score }
  })

  const total = scored.reduce((s, x) => s + x.score, 0)
  let rand = Math.random() * total
  for (const s of scored) {
    rand -= s.score
    if (rand <= 0) return { label: s.entry.label, phrase: s.entry.phrase }
  }
  const fallback = FAREWELL_ENTRIES[0]
  return { label: fallback.label, phrase: fallback.phrase }
}

// ─── Component ────────────────────────────────────────────────────────────────

type WidgetTurn = 'recipe' | 'water' | 'farewell'

export const RecipeWidget: React.FC = () => {
  const state = useStore(recipeWidget)
  const router = useStore(stores.router)
  const weather = useStore(stores.weather)
  const { mutate: createLog } = useCreateLog()
  const { data: logs } = useLogs()
  const loggedRecipesRef = React.useRef<Set<string>>(new Set())

  const [turn, setTurn] = React.useState<WidgetTurn>('recipe')
  const [isShown, setIsShown] = React.useState(false)
  const [waterShown, setWaterShown] = React.useState(false)
  const [isFading, setIsFading] = React.useState(false)
  const [isLabelFading, setIsLabelFading] = React.useState(false)
  const [farewell, setFarewell] = React.useState<{ label: string; phrase: string } | null>(null)

  // Auto-log recipe when it becomes visible on System tab (only once per meal-time + recipe combo)
  React.useEffect(() => {
    if (!state.isVisible || !state.recipe) return
    const isOnSystemTab = !router || router.route === 'system'
    if (!isOnSystemTab) return

    const recipeKey = `${state.mealTime}:${state.recipe}`
    if (loggedRecipesRef.current.has(recipeKey)) return

    const mealLabel = getMealLabel()
    const fullText = `${mealLabel} ${state.recipe}`
    const alreadyExists = logs?.some(log => log.text === fullText)
    if (alreadyExists) {
      loggedRecipesRef.current.add(recipeKey)
      return
    }

    loggedRecipesRef.current.add(recipeKey)
    createLog(
      { text: fullText },
      {
        onSuccess: () => console.log(`Logged recipe: ${recipeKey}`),
        onError: (error) => {
          console.error('Failed to log recipe:', error)
          loggedRecipesRef.current.delete(recipeKey)
        }
      }
    )
  }, [state.isVisible, state.recipe, state.mealTime, router, createLog])

  // Fade-in on show / full reset on hide
  React.useEffect(() => {
    if (state.isVisible) {
      setTimeout(() => setIsShown(true), 100)
    } else {
      setIsShown(false)
      setWaterShown(false)
      setIsFading(false)
      setIsLabelFading(false)
      setFarewell(null)
      setTurn('recipe')
    }
  }, [state.isVisible])

  if (!state.isVisible) return null

  const getWaterTip = (): string | null => {
    const WATER_TIPS: Record<string, string> = {
      breakfast: 'Drink 500ml of water before eating.',
      lunch: 'Drink a glass 30 min before lunch — not during.',
      dinner: 'Water before dinner, not during; aids digestion.',
      snack: 'Try a glass of water first — it often satisfies hunger.',
    }
    const FASTING_WATER_TIPS: Record<string, string> = {
      'light-snack': 'Sip water regularly between your light meal.',
      'dry-food': 'Stay hydrated between dry-food intervals.',
      'water-only': 'Warm or room-temp · herbal teas count · aim for 2 L total.',
      'prayer-rest': 'Sip water gently throughout the day.',
    }
    if (state.isFasting) return FASTING_WATER_TIPS[state.fastingMode] ?? null
    return state.mealTime ? (WATER_TIPS[state.mealTime] ?? null) : null
  }

  const getMealLabel = () => {
    if (state.isFasting) {
      switch (state.fastingMode) {
        case 'light-snack': return 'Light snack:'
        case 'dry-food':    return 'Fast:'
        case 'water-only':  return 'Water:'
        case 'prayer-rest': return 'Rest:'
        default:            return 'Fast:'
      }
    }
    switch (state.mealTime) {
      case 'breakfast': return 'Breakfast idea:'
      case 'lunch':     return 'Lunch idea:'
      case 'dinner':    return 'Dinner idea:'
      case 'snack':     return 'Snack idea:'
      default:          return 'Recipe idea:'
    }
  }

  const getWaterLabel = () => {
    if (state.isFasting) {
      return state.fastingMode === 'dry-food' ? 'Stay hydrated:' : 'Water:'
    }
    switch (state.mealTime) {
      case 'breakfast': return 'First glass:'
      case 'lunch':     return 'To drink:'
      case 'dinner':    return 'Before dinner:'
      case 'snack':     return 'Next glass:'
      default:          return 'Water intake:'
    }
  }

  const getLabel = () => {
    if (turn === 'recipe') return getMealLabel()
    if (turn === 'water') return getWaterLabel()
    // farewell — use the country/language label
    return farewell ? `${farewell.label}:` : getWaterLabel()
  }

  const startFarewell = () => {
    try {
      recordSignal('selfcare', state.isFasting ? 'fasting_acknowledged' : 'recipe_acknowledged', {
        mealTime: state.mealTime,
        hour: new Date().getHours(),
        fastingMode: state.fastingMode,
      })
    } catch (e) {}

    const picked = pickFarewellEntry(
      state.mealTime,
      (weather as any)?.tempKelvin,
      (weather as any)?.description,
      state.isFasting
    )
    setFarewell(picked)
    setTurn('farewell')

    setTimeout(() => {
      setIsFading(true)
      setIsLabelFading(true)
    }, 3000)

    setTimeout(() => {
      dismissRecipeWidget()
    }, 4400)
  }

  const handleClick = () => {
    if (turn === 'recipe') {
      const waterTip = getWaterTip()
      if (waterTip) {
        setTurn('water')
        setTimeout(() => setWaterShown(true), 50)
      } else {
        startFarewell()
      }
    } else if (turn === 'water') {
      startFarewell()
    }
    // farewell: no-op — dismissal is already in flight
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-[1400ms]',
        isLabelFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <Block label={getLabel()} blockView>
        <div
          onClick={handleClick}
          className="cursor-pointer select-none"
        >
          {turn === 'recipe' && (
            <div
              className={cn(
                'opacity-0 transition-opacity duration-[1400ms]',
                isShown && 'opacity-100'
              )}
            >
              {state.isFasting && state.fastingHeadline && (
                <div className="opacity-30 mb-4">{state.fastingHeadline}</div>
              )}
              <div>{state.recipe}</div>
            </div>
          )}

          {turn === 'water' && (
            <div
              className={cn(
                'opacity-0 transition-opacity duration-[1400ms]',
                waterShown && 'opacity-100'
              )}
            >
              {getWaterTip()}
            </div>
          )}

          {turn === 'farewell' && (
            <div
              className={cn(
                'transition-opacity duration-[1400ms]',
                isFading ? 'opacity-0' : 'opacity-100'
              )}
            >
              {farewell?.phrase}
            </div>
          )}
        </div>
      </Block>
    </div>
  )
}
