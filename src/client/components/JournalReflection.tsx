import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useLogs } from '#client/queries'
import axios from 'axios'

type ReflectionView = 'prompt' | 'write' | 'recent' | 'themes'

/**
 * Journal Reflection Widget - Time-aware prompts for deeper journaling with direct writing
 * Pattern: Prompt > Write > Recent > Themes
 * Shows different prompts based on time of day
 */
export function JournalReflection() {
  const [view, setView] = React.useState<ReflectionView>('prompt')
  const [writingText, setWritingText] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const [justSaved, setJustSaved] = React.useState(false)

  const { data: logs = [] } = useLogs()

  const journalEntries = logs.filter(log => log.event === 'note' && log.text && log.text.length > 20)

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'prompt': return 'write'
        case 'write': return 'recent'
        case 'recent': return 'themes'
        case 'themes': return 'prompt'
        default: return 'prompt'
      }
    })
  }

  const handleSave = async () => {
    if (!writingText.trim() || isSaving) return

    setIsSaving(true)
    try {
      await axios.post('/api/logs', { text: writingText.trim() })
      setJustSaved(true)
      setWritingText('')

      setTimeout(() => {
        setJustSaved(false)
        setView('prompt')
      }, 2000)
    } catch (error) {
      console.error('Failed to save reflection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Time-based prompt selection
  const getTimeBasedPrompt = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 9) {
      // Early morning (5am-9am)
      return {
        primary: 'What intentions do you hold for today?',
        secondary: 'How do you want to feel by evening?',
        tertiary: 'What needs your attention today?'
      }
    } else if (hour >= 9 && hour < 12) {
      // Late morning (9am-12pm)
      return {
        primary: 'What\'s alive in you right now?',
        secondary: 'What are you noticing about this morning?',
        tertiary: 'What wants to be acknowledged?'
      }
    } else if (hour >= 12 && hour < 17) {
      // Afternoon (12pm-5pm)
      return {
        primary: 'What\'s present for you in this moment?',
        secondary: 'What surprised you today so far?',
        tertiary: 'What are you learning about yourself?'
      }
    } else if (hour >= 17 && hour < 21) {
      // Evening (5pm-9pm)
      return {
        primary: 'What did today teach you?',
        secondary: 'What moment are you grateful for?',
        tertiary: 'What are you ready to release?'
      }
    } else {
      // Night (9pm-5am)
      return {
        primary: 'What wants to be named before sleep?',
        secondary: 'What truth is emerging for you?',
        tertiary: 'What does your soul want you to know?'
      }
    }
  }

  // Detect recurring themes in journal entries
  const detectThemes = () => {
    if (journalEntries.length < 3) return []

    const themes: { theme: string; count: number }[] = []
    const themeKeywords = {
      growth: ['grow', 'learn', 'develop', 'change', 'evolve', 'becoming', 'transform'],
      connection: ['friend', 'family', 'love', 'relationship', 'connect', 'together', 'people'],
      struggle: ['hard', 'difficult', 'challenge', 'struggle', 'tough', 'overwhelm', 'stress'],
      peace: ['calm', 'peace', 'quiet', 'still', 'serene', 'gentle', 'rest'],
      work: ['work', 'job', 'career', 'project', 'task', 'productive', 'busy'],
      creativity: ['create', 'art', 'write', 'make', 'express', 'imagine', 'design'],
      body: ['body', 'health', 'physical', 'exercise', 'tired', 'energy', 'pain'],
      gratitude: ['grateful', 'thank', 'appreciate', 'blessing', 'gift', 'fortunate']
    }

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      let count = 0
      journalEntries.forEach(entry => {
        const text = (entry.text || '').toLowerCase()
        if (keywords.some(keyword => text.includes(keyword))) {
          count++
        }
      })
      if (count >= 2) {
        themes.push({ theme, count })
      }
    })

    return themes.sort((a, b) => b.count - a.count).slice(0, 3)
  }

  const label =
    view === 'prompt' ? 'Reflect:' :
    view === 'write' ? 'Write:' :
    view === 'recent' ? 'Recent:' :
    'Themes:'

  const prompts = getTimeBasedPrompt()
  const themes = detectThemes()

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'prompt' && (
        <div className="inline-block">
          <div className="mb-12 opacity-90">{prompts.primary}</div>
          <div className="flex flex-col gap-8 opacity-60 text-[14px]">
            <div>• {prompts.secondary}</div>
            <div>• {prompts.tertiary}</div>
          </div>
        </div>
      )}

      {view === 'write' && (
        <div className="inline-block w-full">
          {justSaved ? (
            <div className="opacity-90">Saved ✓</div>
          ) : (
            <>
              <textarea
                className="w-full min-h-[120px] bg-transparent border border-current opacity-60 p-8 mb-12 resize-none focus:opacity-90 focus:outline-none"
                placeholder="Write what's on your mind..."
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                disabled={isSaving}
              />
              <Button onClick={handleSave} disabled={isSaving || !writingText.trim()}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      )}

      {view === 'recent' && (
        <div className="inline-block">
          {journalEntries.length === 0 ? (
            <div className="opacity-60">No journal entries yet. Start reflecting.</div>
          ) : (
            <div className="flex flex-col gap-8">
              {journalEntries.slice(0, 3).map((entry: any) => {
                const preview = (entry.text || '').substring(0, 60)
                const date = new Date(entry.createdAt)
                const timeAgo = getTimeAgo(date)
                return (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <div className="opacity-60 text-[12px]">{timeAgo}</div>
                    <div className="opacity-80 text-[14px]">
                      {preview}{preview.length >= 60 ? '...' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {view === 'themes' && (
        <div className="inline-block">
          {themes.length === 0 ? (
            <div className="opacity-60">Write more to see emerging themes.</div>
          ) : (
            <>
              <div className="mb-8 opacity-70">Recurring in your writing:</div>
              <div className="flex flex-col gap-6">
                {themes.map(({ theme, count }) => (
                  <div key={theme} className="flex items-center justify-between gap-12">
                    <span className="capitalize">{theme}</span>
                    <span className="opacity-60">{count}x</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Block>
  )
}

// Helper to get human-readable time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return diffMins === 1 ? '1 min ago' : `${diffMins} mins ago`
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
