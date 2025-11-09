/**
 * AI Engine Abstraction Layer
 *
 * Purpose: Keep memory densification logic on LOT's side, not tied to any AI provider.
 * Allows easy switching between Claude, OpenAI, Together AI, Google Gemini, and others.
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import config from '#server/config'

// ============================================================================
// Core Interface - All AI engines must implement this
// ============================================================================

export interface AIEngine {
  name: string
  isAvailable(): boolean
  generateCompletion(prompt: string, maxTokens?: number): Promise<string>
}

// ============================================================================
// Claude Engine (Anthropic)
// ============================================================================

export class ClaudeEngine implements AIEngine {
  name = 'Claude'
  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || config.anthropic?.apiKey
    if (apiKey) {
      try {
        this.client = new Anthropic({ apiKey })
      } catch (error) {
        console.error('Failed to initialize Claude engine:', error)
      }
    }
  }

  isAvailable(): boolean {
    return !!this.client
  }

  async generateCompletion(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.client) {
      throw new Error('Claude engine not available')
    }

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    return textContent.text
  }
}

// ============================================================================
// OpenAI Engine (GPT-4)
// ============================================================================

export class OpenAIEngine implements AIEngine {
  name = 'OpenAI'
  private client: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      try {
        this.client = new OpenAI({ apiKey })
      } catch (error) {
        console.error('Failed to initialize OpenAI engine:', error)
      }
    }
  }

  isAvailable(): boolean {
    return !!this.client
  }

  async generateCompletion(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI engine not available')
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return content
  }
}

// ============================================================================
// Together AI Engine (Open Models: Llama, Mixtral, etc.)
// ============================================================================

export class TogetherAIEngine implements AIEngine {
  name = 'Together AI'
  private client: OpenAI | null = null

  constructor() {
    const apiKey = process.env.TOGETHER_API_KEY
    if (apiKey) {
      try {
        // Together AI uses OpenAI-compatible API
        this.client = new OpenAI({
          apiKey,
          baseURL: 'https://api.together.xyz/v1',
        })
      } catch (error) {
        console.error('Failed to initialize Together AI engine:', error)
      }
    }
  }

  isAvailable(): boolean {
    return !!this.client
  }

  async generateCompletion(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.client) {
      throw new Error('Together AI engine not available')
    }

    const response = await this.client.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from Together AI')
    }

    return content
  }
}

// ============================================================================
// Google Gemini Engine
// ============================================================================

export class GeminiEngine implements AIEngine {
  name = 'Google Gemini'
  private client: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (apiKey) {
      try {
        this.client = new GoogleGenerativeAI(apiKey)
      } catch (error) {
        console.error('Failed to initialize Gemini engine:', error)
      }
    }
  }

  isAvailable(): boolean {
    return !!this.client
  }

  async generateCompletion(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini engine not available')
    }

    const model = this.client.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text) {
      throw new Error('No response from Gemini')
    }

    return text
  }
}

// ============================================================================
// Engine Manager - Handles fallback logic
// ============================================================================

export type EnginePreference = 'together' | 'gemini' | 'claude' | 'openai' | 'auto'

export class AIEngineManager {
  private engines: Map<string, AIEngine>

  constructor() {
    this.engines = new Map()

    // Register available engines
    this.engines.set('together', new TogetherAIEngine())
    this.engines.set('gemini', new GeminiEngine())
    this.engines.set('claude', new ClaudeEngine())
    this.engines.set('openai', new OpenAIEngine())
  }

  /**
   * Get preferred engine with automatic fallback
   * @param preference Which engine to prefer ('together', 'gemini', 'claude', 'openai', or 'auto')
   * @returns Available engine or throws if none available
   */
  getEngine(preference: EnginePreference = 'auto'): AIEngine {
    // If preference specified and available, use it
    if (preference !== 'auto') {
      const engine = this.engines.get(preference)
      if (engine?.isAvailable()) {
        return engine
      }
      console.warn(`Preferred engine '${preference}' not available, trying fallback`)
    }

    // Auto mode or fallback: try Together AI first, then Gemini, then Claude, then OpenAI
    const fallbackOrder: string[] = ['together', 'gemini', 'claude', 'openai']

    for (const engineName of fallbackOrder) {
      const engine = this.engines.get(engineName)
      if (engine?.isAvailable()) {
        console.log(`✅ Using AI engine: ${engine.name}`)
        return engine
      }
    }

    throw new Error('No AI engines available')
  }

  /**
   * Get status of all engines
   */
  getStatus() {
    const status: Record<string, { available: boolean; name: string }> = {}

    for (const [key, engine] of this.engines.entries()) {
      status[key] = {
        name: engine.name,
        available: engine.isAvailable(),
      }
    }

    return status
  }

  /**
   * Test if any engine is available
   */
  hasAvailableEngine(): boolean {
    for (const engine of this.engines.values()) {
      if (engine.isAvailable()) {
        return true
      }
    }
    return false
  }
}

// ============================================================================
// Singleton instance
// ============================================================================

export const aiEngineManager = new AIEngineManager()
