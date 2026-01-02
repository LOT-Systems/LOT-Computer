import React from 'react'
import { Block, Button } from '#client/components/ui'
import { recordSignal } from '#client/stores/intentionEngine'

type IntentionView = 'set' | 'current' | 'reflection'

type Intention = {
  focus: string
  setDate: Date
  monthYear: string
}

/**
 * Intentions Widget - Monthly intention setting and tracking
 * Pattern: Set Intention > Current > Reflection
 * Only shows if user has data or wants to set intention
 */
export function IntentionsWidget() {
  const [view, setView] = React.useState<IntentionView>('current')
  const [intention, setIntention] = React.useState<Intention | null>(null)
  const [isSettingIntention, setIsSettingIntention] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  // Load intention from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('current-intention')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setIntention({
          ...parsed,
          setDate: new Date(parsed.setDate)
        })
      } catch (e) {
        console.error('Failed to parse intention:', e)
      }
    } else {
      setView('set') // If no intention, start with set view
    }
  }, [])

  const cycleView = () => {
    if (!intention && view !== 'set') {
      setView('set')
      return
    }

    setView(prev => {
      switch (prev) {
        case 'set': return intention ? 'current' : 'set'
        case 'current': return 'reflection'
        case 'reflection': return 'set'
        default: return 'current'
      }
    })
  }

  const handleSetIntention = () => {
    if (!inputValue.trim()) return

    const newIntention: Intention = {
      focus: inputValue.trim(),
      setDate: new Date(),
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    // Record intention signal for quantum pattern recognition
    recordSignal('intentions', 'intention_set', {
      focus: newIntention.focus,
      monthYear: newIntention.monthYear
    })

    localStorage.setItem('current-intention', JSON.stringify(newIntention))
    setIntention(newIntention)
    setInputValue('')
    setIsSettingIntention(false)
    setView('current')
  }

  const handleReleaseIntention = () => {
    if (confirm('Release this intention? This will clear it permanently.')) {
      localStorage.removeItem('current-intention')
      setIntention(null)
      setView('set')
    }
  }

  const getReflectionPrompts = () => {
    const prompts = [
      'How is this intention showing up in your daily life?',
      'What\'s one small action that honors this intention?',
      'What\'s getting in the way of living this intention?',
      'How has this intention changed you?',
      'Is this intention still true for you?'
    ]

    // Rotate through prompts based on day of month
    const dayOfMonth = new Date().getDate()
    const index = dayOfMonth % prompts.length
    return prompts[index]
  }

  const label =
    view === 'set' ? 'Intention:' :
    view === 'current' ? 'Current:' :
    'Reflect:'

  // Get days since intention was set
  const daysSince = intention
    ? Math.floor((new Date().getTime() - new Date(intention.setDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'set' && (
        <div className="inline-block w-full">
          {isSettingIntention ? (
            <>
              <div className="mb-12 opacity-60 text-[20px]">What do you want to cultivate this month?</div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetIntention()}
                placeholder="One word or short phrase..."
                className="w-full bg-transparent border-none outline-none mb-12 opacity-90 text-[20px]"
                autoFocus
              />
              <div className="flex gap-8">
                <Button onClick={handleSetIntention} disabled={!inputValue.trim()}>
                  Set Intention
                </Button>
                <Button onClick={() => setIsSettingIntention(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-12 opacity-60 text-[20px]">
                {intention ? 'Set a new intention for this month' : 'What aspect of yourself do you want to nurture this month?'}
              </div>
              <div className="flex flex-col gap-6 opacity-60 mb-12 text-[20px]">
                <div>Examples:</div>
                <div>• Presence</div>
                <div>• Self-compassion</div>
                <div>• Creative flow</div>
                <div>• Boundaries</div>
                <div>• Rest</div>
              </div>
              <Button onClick={() => setIsSettingIntention(true)}>
                {intention ? 'Set New Intention' : 'Set Intention'}
              </Button>
            </>
          )}
        </div>
      )}

      {view === 'current' && intention && (
        <div className="inline-block">
          <div className="mb-8">
            <span className="text-[20px] capitalize">{intention.focus}</span>
          </div>
          <div className="opacity-60 mb-12 text-[20px]">
            {intention.monthYear}
          </div>
          <div className="flex items-center gap-8 opacity-60 text-[20px]">
            <span>Day {daysSince + 1}</span>
            <span>•</span>
            <Button onClick={handleReleaseIntention} className="opacity-60 hover:opacity-100">
              Release
            </Button>
          </div>
        </div>
      )}

      {view === 'current' && !intention && (
        <div className="inline-block">
          <div className="opacity-60 mb-12 text-[20px]">No intention set yet.</div>
          <Button onClick={() => setView('set')}>
            Set Your Intention
          </Button>
        </div>
      )}

      {view === 'reflection' && intention && (
        <div className="inline-block">
          <div className="mb-12 opacity-90 text-[20px]">{getReflectionPrompts()}</div>
          <div className="opacity-60 text-[20px]">
            Reflecting on: <span className="capitalize">{intention.focus}</span>
          </div>
        </div>
      )}

      {view === 'reflection' && !intention && (
        <div className="inline-block">
          <div className="opacity-60 text-[20px]">Set an intention first to begin reflection.</div>
        </div>
      )}
    </Block>
  )
}
