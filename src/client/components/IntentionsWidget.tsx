import React from 'react'
import { Block, Button } from '#client/components/ui'
import { recordSignal } from '#client/stores/intentionEngine'
import { useLogContext } from '#client/hooks/useLogContext'

type IntentionView = 'set' | 'current' | 'reflection' | 'alignment'

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
  const logCtx = useLogContext()

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
        case 'current': return 'alignment'
        case 'alignment': return 'reflection'
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
    view === 'alignment' ? 'Alignment:' :
    'Reflect:'

  // Get days since intention was set
  const daysSince = intention
    ? Math.floor((new Date().getTime() - new Date(intention.setDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Get total days in the month when intention was set
  const totalDaysInMonth = intention
    ? new Date(new Date(intention.setDate).getFullYear(), new Date(intention.setDate).getMonth() + 1, 0).getDate()
    : 30

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'set' && (
        <div className="w-full">
          {isSettingIntention ? (
            <>
              {(() => {
                const quantumReason = localStorage.getItem('intentions-quantum-reason')
                return quantumReason ? (
                  <div className="opacity-30 mb-8">
                    {quantumReason}
                  </div>
                ) : null
              })()}
              <div className="mb-12">What do you want to cultivate this month?</div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetIntention()}
                placeholder="One word or short phrase..."
                className="w-full bg-transparent border-none outline-none mb-12"
                autoFocus
              />
              <div className="flex gap-16 mb-24">
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
              {(() => {
                const quantumReason = localStorage.getItem('intentions-quantum-reason')
                return quantumReason ? (
                  <div className="opacity-30 mb-8">
                    {quantumReason}
                  </div>
                ) : null
              })()}
              <div className="mb-16">
                {intention ? 'Set a new intention for this month.' : 'What aspect of yourself do you want to nurture this month?'} Examples:
              </div>
              <div className="flex flex-col gap-6 mb-24">
                <div>. Presence</div>
                <div>. Self-compassion</div>
                <div>. Creative flow</div>
                <div>. Boundaries</div>
                <div>. Rest</div>
                <div>. Sport</div>
                <div>. Exercise</div>
                <div>. Relationships</div>
                <div>. Humor</div>
              </div>
              <div className="mb-24">
                <Button onClick={() => setIsSettingIntention(true)}>
                  {intention ? 'Set New Intention' : 'Set Intention'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'current' && intention && (
        <div>
          <div className="mb-8">
            <span className="capitalize">{intention.focus}</span>
          </div>
          <div className="mb-16">
            {intention.monthYear}; Day {daysSince + 1}/{totalDaysInMonth}
          </div>
          <div className="mb-24">
            <Button onClick={handleReleaseIntention}>
              Release
            </Button>
          </div>
        </div>
      )}

      {view === 'current' && !intention && (
        <div>
          <div className="mb-12">No intention set yet.</div>
          <div className="mb-24">
            <Button onClick={() => setView('set')}>
              Set Your Intention
            </Button>
          </div>
        </div>
      )}

      {view === 'alignment' && intention && (
        <div>
          <div className="mb-8">
            Intention: <span className="capitalize">{intention.focus}</span>
          </div>

          {/* Activity since intention was set */}
          <div className="mb-12 opacity-30">
            {logCtx.totalEntries > 0
              ? `${logCtx.todayActivity.length} action${logCtx.todayActivity.length === 1 ? '' : 's'} today. ${logCtx.streak} day streak.`
              : 'No activity recorded yet.'
            }
          </div>

          {/* Behavioral alignment */}
          <div className="flex flex-col gap-4 mb-12">
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Widget diversity</span>
              <span>{logCtx.widgetDiversity} types</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Weekly rate</span>
              <span>~{logCtx.weeklyRate} interactions</span>
            </div>
            {logCtx.dominantMood && (
              <div className="flex justify-between items-baseline">
                <span className="opacity-30">Mood pattern</span>
                <span className="capitalize">{logCtx.dominantMood}</span>
              </div>
            )}
          </div>

          {/* Alignment assessment */}
          <div className="opacity-30">
            {logCtx.streak >= 7
              ? 'Strong convergence. Intention integrated into daily runtime.'
              : logCtx.streak >= 3
              ? 'Momentum compiling. Continue execution.'
              : logCtx.streak >= 1
              ? 'Active today. Each cycle reinforces the directive.'
              : 'Resume execution to synchronize with this intention.'
            }
          </div>
        </div>
      )}

      {view === 'alignment' && !intention && (
        <div>
          <div>Set an intention first to track alignment.</div>
        </div>
      )}

      {view === 'reflection' && intention && (
        <div>
          <div className="mb-12">{getReflectionPrompts()}</div>
          <div>
            Reflecting on: <span className="capitalize">{intention.focus}</span>
          </div>
        </div>
      )}

      {view === 'reflection' && !intention && (
        <div>
          <div>Set an intention first to begin reflection.</div>
        </div>
      )}
    </Block>
  )
}
