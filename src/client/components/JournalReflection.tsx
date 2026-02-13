import React from 'react'
import { Block } from '#client/components/ui'
import * as stores from '#client/stores'
import { recordSignal } from '#client/stores/intentionEngine'

/**
 * Journal Reflection Widget - Time-aware prompts for deeper journaling
 * Shows different prompts based on time of day
 * Clicking the label navigates to the Log tab for writing
 */
export function JournalReflection() {
  const handleReflectClick = () => {
    try { recordSignal('journal', 'reflect_initiated', { hour: new Date().getHours() }) } catch (e) {}
    stores.goTo('logs')
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

  const prompts = getTimeBasedPrompt()

  return (
    <Block label="Reflect:" blockView onLabelClick={handleReflectClick}>
      <div>
        <div className="mb-8">{prompts.primary}</div>
        <div className="flex flex-col gap-8">
          <div>. {prompts.secondary}</div>
          <div>. {prompts.tertiary}</div>
        </div>
      </div>
    </Block>
  )
}
