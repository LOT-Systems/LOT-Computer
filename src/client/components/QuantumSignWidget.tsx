/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { useLogs } from '#client/queries'

/**
 * Quantum Sign Widget — For subscribers whose payment is their last money
 * They should feel like it's a quantum sign to do something on the site:
 * journaling, creating, talking to users or self-care and rest.
 * The contrary of anxiety about spending — a catalyst for action.
 *
 * Also surfaces new Astrology and Psychology patches.
 */
export function QuantumSignWidget() {
  const me = useStore(stores.me)
  const { data: logs = [] } = useLogs()
  const [view, setView] = React.useState<'sign' | 'actions' | 'patches'>('sign')
  const [dismissed, setDismissed] = React.useState(false)

  // Show to subscribed users who haven't been very active recently
  const hasSubscription = me?.tags?.some(tag =>
    tag.toLowerCase() === 'usership' || tag.toLowerCase() === 'rnd'
  )

  // Check if user has been inactive (fewer than 3 logs in last 48 hours)
  const recentActivity = React.useMemo(() => {
    const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000
    return logs.filter(log => new Date(log.createdAt).getTime() > twoDaysAgo)
  }, [logs])

  const isQuiet = recentActivity.length < 3

  // Generate today's quantum sign based on date (stable per day)
  const quantumSign = React.useMemo(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    const signs = [
      'The fact that you are here is the signal. Begin.',
      'Your subscription is not an expense — it is a quantum commitment to yourself.',
      'Today, the system recognizes your presence as extraordinary.',
      'Rest is a form of creation. If you need to rest, rest here.',
      'Write one sentence. That sentence changes your trajectory.',
      'Talk to another user today. Connection is the hidden self-care.',
      'Your memory engine is waiting. Feed it one thought.',
      'The biofield registers your intention just by reading this.',
      'If this was your last dollar, it brought you to the right place.',
      'Journal entry #1: Why I chose to be here today.',
      'Self-care is not consumption. It is quantum computation performed on the self.',
      'You showed up. That is the entire protocol.',
    ]
    return signs[seed % signs.length]
  }, [])

  // Astrology & Psychology patches
  const patches = React.useMemo(() => {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

    const astrologyPatches = [
      { id: 'lunar-reset', name: 'Lunar Reset', desc: 'Moon phase alignment for emotional recalibration' },
      { id: 'solar-return', name: 'Solar Return', desc: 'Birthday energy cycle — annual self-renewal' },
      { id: 'mercury-direct', name: 'Mercury Direct', desc: 'Communication clarity restored' },
      { id: 'venus-transit', name: 'Venus Transit', desc: 'Relationship pattern recognition active' },
    ]

    const psychologyPatches = [
      { id: 'shadow-work', name: 'Shadow Integration', desc: 'Unconscious pattern surfacing protocol' },
      { id: 'flow-state', name: 'Flow State', desc: 'Deep work activation sequence' },
      { id: 'mirror-neuron', name: 'Mirror Neuron', desc: 'Empathy amplification patch' },
      { id: 'growth-edge', name: 'Growth Edge', desc: 'Comfort zone expansion calibration' },
    ]

    // Rotate patches based on day of year
    const astroIdx = dayOfYear % astrologyPatches.length
    const psychIdx = dayOfYear % psychologyPatches.length

    return {
      astrology: astrologyPatches[astroIdx],
      psychology: psychologyPatches[psychIdx],
    }
  }, [])

  if (!hasSubscription || dismissed) return null
  if (!isQuiet && view === 'sign') return null // Only show sign view to quiet users

  const cycleView = () => {
    setView(prev =>
      prev === 'sign' ? 'actions' :
      prev === 'actions' ? 'patches' :
      'sign'
    )
  }

  const label =
    view === 'sign' ? 'Quantum Sign:' :
    view === 'actions' ? 'Your Actions:' :
    'New Patches:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'sign' && (
        <div>
          <div className="mb-16">{quantumSign}</div>
          <div className="opacity-30" onClick={() => setDismissed(true)}>
            I understand. Let me begin.
          </div>
        </div>
      )}

      {view === 'actions' && (
        <div>
          <div className="mb-8 opacity-30">
            If this subscription was your last money, here is what it purchased:
          </div>
          <div className="flex flex-col gap-4">
            <div className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                 onClick={() => localStorage.setItem('quantum-sign-action', 'journal')}>
              Journal — Write what you feel right now
            </div>
            <div className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                 onClick={() => localStorage.setItem('quantum-sign-action', 'create')}>
              Create — Build something, anything
            </div>
            <div className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                 onClick={() => localStorage.setItem('quantum-sign-action', 'connect')}>
              Connect — Talk to another user
            </div>
            <div className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                 onClick={() => localStorage.setItem('quantum-sign-action', 'rest')}>
              Rest — Self-care and rest, here, now
            </div>
          </div>
        </div>
      )}

      {view === 'patches' && (
        <div>
          <div className="mb-8">Your new patches have been issued.</div>
          <div className="flex flex-col gap-8">
            <div>
              <div className="mb-2">Astrology: {patches.astrology.name}</div>
              <div className="opacity-30">{patches.astrology.desc}</div>
            </div>
            <div>
              <div className="mb-2">Psychology: {patches.psychology.name}</div>
              <div className="opacity-30">{patches.psychology.desc}</div>
            </div>
          </div>
          <div className="mt-16 opacity-30">
            Patches rotate with the calendar. Check back tomorrow.
          </div>
        </div>
      )}
    </Block>
  )
}
