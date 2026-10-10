/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * AI Engine Abstraction Layer
 *
 * Purpose: Keep memory densification logic on LOT's side, not tied to any AI provider.
 * Allows easy switching between Claude, OpenAI, Together AI, Google Gemini, Mistral, and others.
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Mistral } from '@mistralai/mistralai'
import config from '#server/config'

// ============================================================================
// Core Interface - All AI engines must implement this
// ============================================================================

export interface AIEngine {
  name: string
  isAvailable(): boolean
  generateCompletion(prompt: string, maxTokens?: number): Promise<string>
  generateImage?(prompt: string, options?: ImageGenerationOptions): Promise<string>
}

export interface ImageGenerationOptions {
  width?: number
  height?: number
  steps?: number
  model?: string
}

// ============================================================================
// Ollama Engine (Local Inference — NODE-0)
// ============================================================================

export class OllamaEngine implements AIEngine {
  name = 'Ollama (Local)'
  private client: OpenAI | null = null
  private baseURL: string

  private modelFallbackChain = [
    'llama3.3:70b-instruct-q4_K_M',
    'qwen2.5:72b-instruct-q4_K_M',
    'llama3.3:70b',
    'qwen2.5:72b',
    'llama3.1:70b',
    'mixtral:8x7b',
    'llama3.1:8b',
  ]

  constructor() {
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const enabled = process.env.OLLAMA_ENABLED === 'true' || process.env.OLLAMA_BASE_URL
    if (enabled) {
      try {
        this.client = new OpenAI({
          apiKey: 'ollama',
          baseURL: `${this.baseURL}/v1`,
        })
      } catch (error) {
        console.error('Failed to initialize Ollama engine:', error)
      }
    }
  }

  isAvailable(): boolean {
    return !!this.client
  }

  async generateCompletion(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.client) {
      throw new Error('Ollama engine not available')
    }

    let lastError: Error | null = null

    for (const model of this.modelFallbackChain) {
      try {
        const response = await this.client.chat.completions.create({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
          throw new Error(`No response from Ollama model: ${model}`)
        }

        aiUsageTracker.trackCompletion('Ollama', prompt.length, content.length)
        return content
      } catch (error: any) {
        lastError = error
      }
    }

    throw new Error(`All Ollama models failed. Last error: ${lastError?.message}`)
  }
}

// ============================================================================
// Claude Engine (Anthropic)
// ============================================================================

export class ClaudeEngine implements AIEngine {
  name = 'Claude'
  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || config.anthropic?.apiKey
    // Skip placeholder keys
    if (apiKey && !apiKey.includes('your_') && !apiKey.includes('placeholder')) {
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
      model: 'claude-sonnet-4-6',
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

    aiUsageTracker.trackCompletion('Claude', prompt.length, textContent.text.length)
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
    // Skip placeholder keys
    if (apiKey && !apiKey.includes('your_') && !apiKey.includes('placeholder')) {
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
      model: 'gpt-4o',
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

    aiUsageTracker.trackCompletion('OpenAI', prompt.length, content.length)
    return content
  }
}

// ============================================================================
// Together AI Engine (Open Models: Llama, Mixtral, etc.)
// ============================================================================

export class TogetherAIEngine implements AIEngine {
  name = 'Together AI'
  private client: OpenAI | null = null
  private apiKey: string | null = null

  // Fallback model chain - try these in order if primary fails
  // Updated Feb 2026: Meta-Llama-3.1-70B-Instruct-Turbo discontinued Feb 6, 2026
  private modelFallbackChain = [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',      // Primary: Latest, best quality
    'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', // Fallback 1: Free version
    'meta-llama/Llama-4-Scout-17B-16E-Instruct',    // Fallback 2: New efficient model
    'mistralai/Mixtral-8x7B-Instruct-v0.1',         // Fallback 3: Excellent quality
    'Qwen/Qwen2-72B-Instruct',                      // Fallback 4: Multilingual
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',  // Fallback 5: Degraded service
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', // Fallback 6: Legacy (deprecated)
  ]

  constructor() {
    const apiKey = process.env.TOGETHER_API_KEY
    if (apiKey) {
      try {
        this.apiKey = apiKey
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

    // Try each model in fallback chain
    let lastError: Error | null = null

    for (const model of this.modelFallbackChain) {
      try {
        console.log(`🤖 Together AI: Trying model ${model}`)

        const response = await this.client.chat.completions.create({
          model,
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
          throw new Error(`No response from Together AI model: ${model}`)
        }

        console.log(`Together AI: Successfully used model ${model}`)
        aiUsageTracker.trackCompletion('Together AI', prompt.length, content.length)
        return content
      } catch (error: any) {
        console.warn(`Together AI: Model ${model} failed: ${error.message}`)
        lastError = error
        // Continue to next model in fallback chain
      }
    }

    // All models failed
    throw new Error(`All Together AI models failed. Last error: ${lastError?.message}`)
  }

  async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Together AI engine not available')
    }

    const {
      width = 512,
      height = 512,
      steps = 20,
      model = 'black-forest-labs/FLUX.1-schnell-Free'
    } = options

    // Together AI image generation uses direct API (not OpenAI-compatible for images)
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        width,
        height,
        steps,
        n: 1,
        response_format: 'url',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Image generation failed: ${error}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL in response')
    }

    aiUsageTracker.trackImageGeneration('Together AI')
    return imageUrl
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
      model: 'gemini-2.0-flash',
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

    aiUsageTracker.trackCompletion('Gemini', prompt.length, text.length)
    return text
  }
}

// ============================================================================
// Mistral AI Engine (European, Privacy-Focused)
// ============================================================================

export class MistralEngine implements AIEngine {
  name = 'Mistral AI'
  private client: Mistral | null = null

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY
    if (apiKey) {
      try {
        this.client = new Mistral({ apiKey })
      } catch (error) {
        console.error('Failed to initialize Mistral engine:', error)
      }
    }
  }

  isAvailable(): boolean {
    return !!this.client
  }

  async generateCompletion(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.client) {
      throw new Error('Mistral engine not available')
    }

    const response = await this.client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens,
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No response from Mistral')
    }

    // Mistral can return string or ContentChunk[] - handle both
    if (typeof content === 'string') {
      aiUsageTracker.trackCompletion('Mistral', prompt.length, content.length)
      return content
    } else if (Array.isArray(content)) {
      // Extract text from content chunks
      const text = content
        .filter((chunk: any) => chunk.type === 'text')
        .map((chunk: any) => chunk.text)
        .join('')
      aiUsageTracker.trackCompletion('Mistral', prompt.length, text.length)
      return text
    }

    throw new Error('Unexpected content type from Mistral')
  }
}

// ============================================================================
// Engine Manager - Handles fallback logic
// ============================================================================

export type EnginePreference = 'ollama' | 'together' | 'gemini' | 'mistral' | 'claude' | 'openai' | 'auto'

// ============================================================================
// AI Usage Tracker - Non-monetary usage metrics
// ============================================================================

interface EngineUsageEntry {
  calls: number
  estimatedTokens: number
  imageGenerations: number
}

export interface AIUsageStats {
  today: {
    totalCalls: number
    totalTokens: number
    totalImageGenerations: number
    byEngine: Record<string, EngineUsageEntry>
    callsPerHour: number
  }
  session: {
    totalCalls: number
    totalTokens: number
    totalImageGenerations: number
    startedAt: number
  }
}

class AIUsageTracker {
  private dailyUsage: Map<string, EngineUsageEntry> = new Map()
  private sessionCalls = 0
  private sessionTokens = 0
  private sessionImageGenerations = 0
  private sessionStartedAt = Date.now()
  private currentDay = new Date().toDateString()

  private resetIfNewDay() {
    const today = new Date().toDateString()
    if (today !== this.currentDay) {
      this.dailyUsage.clear()
      this.currentDay = today
    }
  }

  trackCompletion(engineName: string, promptLength: number, responseLength: number) {
    this.resetIfNewDay()
    // Rough token estimate: ~4 chars per token
    const estimatedTokens = Math.ceil((promptLength + responseLength) / 4)

    const entry = this.dailyUsage.get(engineName) || { calls: 0, estimatedTokens: 0, imageGenerations: 0 }
    entry.calls++
    entry.estimatedTokens += estimatedTokens
    this.dailyUsage.set(engineName, entry)

    this.sessionCalls++
    this.sessionTokens += estimatedTokens
  }

  trackImageGeneration(engineName: string) {
    this.resetIfNewDay()
    const entry = this.dailyUsage.get(engineName) || { calls: 0, estimatedTokens: 0, imageGenerations: 0 }
    entry.imageGenerations++
    this.dailyUsage.set(engineName, entry)
    this.sessionImageGenerations++
  }

  getStats(): AIUsageStats {
    this.resetIfNewDay()

    let totalCalls = 0
    let totalTokens = 0
    let totalImageGenerations = 0
    const byEngine: Record<string, EngineUsageEntry> = {}

    for (const [name, entry] of this.dailyUsage.entries()) {
      totalCalls += entry.calls
      totalTokens += entry.estimatedTokens
      totalImageGenerations += entry.imageGenerations
      byEngine[name] = { ...entry }
    }

    const hoursElapsed = Math.max(1, (Date.now() - this.sessionStartedAt) / (1000 * 60 * 60))
    const callsPerHour = Math.round(this.sessionCalls / hoursElapsed)

    return {
      today: {
        totalCalls,
        totalTokens,
        totalImageGenerations,
        byEngine,
        callsPerHour,
      },
      session: {
        totalCalls: this.sessionCalls,
        totalTokens: this.sessionTokens,
        totalImageGenerations: this.sessionImageGenerations,
        startedAt: this.sessionStartedAt,
      },
    }
  }
}

export const aiUsageTracker = new AIUsageTracker()

export class AIEngineManager {
  private engines: Map<string, AIEngine>

  constructor() {
    this.engines = new Map()

    // Register available engines — local inference first when available
    this.engines.set('ollama', new OllamaEngine())
    this.engines.set('together', new TogetherAIEngine())
    this.engines.set('gemini', new GeminiEngine())
    this.engines.set('mistral', new MistralEngine())
    this.engines.set('claude', new ClaudeEngine())
    this.engines.set('openai', new OpenAIEngine())
  }

  /**
   * Get preferred engine with automatic fallback
   * @param preference Which engine to prefer ('together', 'gemini', 'mistral', 'claude', 'openai', or 'auto')
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

    // Auto mode or fallback: local first, then cloud by cost-effectiveness
    const fallbackOrder: string[] = ['ollama', 'together', 'gemini', 'mistral', 'claude', 'openai']

    for (const engineName of fallbackOrder) {
      const engine = this.engines.get(engineName)
      if (engine?.isAvailable()) {
        console.log(`Using AI engine: ${engine.name}`)
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
