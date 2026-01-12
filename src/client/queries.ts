import axios, { AxiosError } from 'axios'
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from 'react-query'
import {
  AdminUsersSort,
  ChatMessageLikePayload,
  DefaultQuestion,
  Log,
  Paginated,
  PublicChatMessage,
  User,
  UserProfile,
  UserSettings,
  WeatherRecord,
} from '#shared/types'
import dayjs from '#client/utils/dayjs'
import { DATE_TIME_FORMAT } from '#shared/constants'

const api = axios.create({
  baseURL: '/',
  withCredentials: true  // Send cookies with requests
})

// Utils
function createQuery<T>(
  path: string,
  defaultConfig?: Partial<UseQueryOptions<T>>
) {
  return (extraConfig?: Partial<UseQueryOptions<T>>) => {
    return useQuery<T>({
      queryKey: [path],
      queryFn: async () => api.get<T>(path).then((res) => res.data),
      ...defaultConfig,
      ...extraConfig,
    })
  }
}

function createMutation<R, T>(
  method: 'post' | 'put' | 'delete',
  path: string | ((data: R) => string),
  defaultConfig?: Partial<UseMutationOptions<T, AxiosError, R>>
) {
  return (extraConfig?: Partial<UseMutationOptions<T, AxiosError, R>>) => {
    return useMutation<T, AxiosError, R>({
      mutationFn: async (data: R) => {
        const _path = typeof path === 'function' ? path(data) : path
        return await api[method]<T>(_path, data).then((res) => res.data)
      },
      ...defaultConfig,
      ...extraConfig,
    })
  }
}

// User API
export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/api/me')
  return data
}

export const useUpdateSettings = createMutation<UserSettings, void>(
  'post',
  '/api/settings'
)

export const useLiveMessage = createQuery<{ message: string }>(
  '/api/live-message'
)

export const useChatMessages =
  createQuery<PublicChatMessage[]>('/api/chat-messages')

export const useCreateChatMessage = createMutation<{ message: string }, void>(
  'post',
  '/api/chat-messages'
)

export const useLikeChatMessage = createMutation<ChatMessageLikePayload, void>(
  'post',
  '/api/chat-messages/like'
)

export interface DirectMessageRecord {
  id: string
  senderId: string
  receiverId: string
  message: string
  createdAt: string
  updatedAt: string
  isMine: boolean
}

export const useDirectMessages = (userId: string) =>
  createQuery<{
    messages: DirectMessageRecord[]
    otherUser: {
      id: string
      firstName: string | null
      lastName: string | null
    }
  }>(`/api/direct-messages/${userId}`, {
    refetchOnWindowFocus: false,
  })()

export const useSendDirectMessage = createMutation<
  { receiverId: string; message: string },
  void
>('post', '/api/direct-messages')

export const useWeather = createQuery<WeatherRecord | null>('/api/weather', {
  refetchOnWindowFocus: false,
})

export const useVisitorStats = createQuery<{
  totalSiteVisitors: number
  userProfileVisits: number
}>('/api/visitor-stats', {
  refetchOnWindowFocus: false,
})

export const useLogs = createQuery<Log[]>('/api/logs', {
  refetchOnWindowFocus: false, // Prevent refetching on tab switch (was creating duplicate empty logs)
  staleTime: 30 * 1000, // Cache for 30 seconds to prevent excessive refetching
})

export const useCreateLog = createMutation<{ text: string }, Log>(
  'post',
  '/api/logs'
)

export const useUpdateLog = createMutation<{ id: string; text: string }, Log>(
  'put',
  (data) => `/api/logs/${data.id}`
)

export const useMemory = () => {
  // Use date only (no time) to prevent regenerating questions multiple times per day
  const date = btoa(dayjs().format('YYYY-MM-DD'))
  const path = '/api/memory'

  return useQuery<any>(
    [path, date], // Include date in query key for proper caching
    async () => {
      // Get quantum state to send to server for context-aware question generation
      let quantumParams = {}
      if (typeof window !== 'undefined') {
        try {
          const { getUserState, analyzeIntentions } = await import('#client/stores/intentionEngine')
          analyzeIntentions()
          const state = getUserState()
          quantumParams = {
            qe: state.energy,
            qc: state.clarity,
            qa: state.alignment,
            qn: state.needsSupport
          }
        } catch (e) {
          // Quantum state optional - graceful degradation
        }
      }

      return (await api.get<any>(path, { params: { d: date, ...quantumParams } })).data
    },
    {
      staleTime: Infinity, // Never refetch - question is valid for the whole day
      cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    }
  )
}

export const useCreateMemory = createMutation<
  {
    questionId: string
    option: string
    question?: string
    options?: string[]
  },
  { response: string }
>('post', '/api/memory/answer')

// Admin API
export const usePaginatedUsers = (params: {
  skip: number
  limit: number
  sort: AdminUsersSort
  tags: string[]
  query: string
}) => {
  const usp = new URLSearchParams({
    ...params,
    skip: String(params.skip),
    limit: String(params.limit),
    tags: params.tags.join(','),
  })
  usp.sort()
  return createQuery<Paginated<User>>(`/admin-api/users?${usp.toString()}`)()
}

export const useUser = (id: string) => {
  return createQuery<User>(`/admin-api/users/${id}`)()
}

export const useUpdateLiveMessage = createMutation<{ message: string }, void>(
  'post',
  '/admin-api/live-message'
)

export const useUpdateUser = createMutation<Partial<User>, void>(
  'put',
  (data) => `/admin-api/users/${data.id}`
)

export const useUserMemoryPrompt = (userId: string | null) =>
  createQuery<{ prompt: string }>(`/admin-api/users/${userId}/memory-prompt`, {
    enabled: !!userId,
  })()

// export const useCompleteMemoryPrompt = (userId: string, config?: ) =>
//   createMutation<DefaultQuestion, void>(
//     'post',
//     `/admin-api/users/${userId}/memory-prompt`
//   )(config)

export const useCompleteMemoryPrompt = createMutation<
  { userId: string; prompt: string },
  DefaultQuestion
>('post', (data) => `/admin-api/users/${data.userId}/memory-prompt`)

export const useUserSummary = (userId: string) =>
  createQuery<{ summary: string }>(`/admin-api/users/${userId}/summary`, {
    enabled: !!userId,
  })()

export const useUserMemoryStory = (userId: string) =>
  createQuery<{ story: string }>(`/admin-api/users/${userId}/memory-story`, {
    enabled: !!userId,
  })()

export const useMyMemoryStory = () =>
  createQuery<{
    story: string | null
    hasUsership: boolean
    answerCount?: number
    message?: string
  }>('/api/memory/story', {
    refetchOnWindowFocus: false,
  })()

// Get user's psychological profile (archetypes, values, patterns)
export const useProfile = () =>
  createQuery<{
    hasUsership: boolean
    archetype?: string
    archetypeDescription?: string
    coreValues?: string[]
    values?: string[] // Also support 'values' field
    emotionalPatterns?: string[]
    selfAwarenessLevel?: number  // 0-10 scale
    emotionalRange?: number // 0-10 scale
    reflectionQuality?: number // 0-10 scale
    growthTrajectory?: 'emerging' | 'developing' | 'deepening' | 'integrated'
    dominantNeeds?: string[]
    journalSentiment?: {
      positive: number
      neutral: number
      challenging: number
    }
    behavioralCohort?: string
    behavioralTraits?: string[]
    patternStrength?: { trait: string; count: number }[]
    answerCount?: number
    noteCount?: number
    message?: string
  }>('/api/user-profile', {
    staleTime: 0, // Always fetch fresh data to ensure awareness index is current
    cacheTime: 0, // Don't cache to prevent stale data issues in PWA
    refetchOnWindowFocus: false,
  })()

// ============================================================================
// PATTERN & COHORT QUERIES
// ============================================================================

export interface PatternInsight {
  type: 'weather-mood' | 'temporal' | 'social-emotional' | 'streak' | 'behavioral'
  title: string
  description: string
  confidence: number
  dataPoints: number
  metadata?: Record<string, any>
}

export interface CohortMatch {
  user: {
    id: string
    firstName: string
    lastName: string
    city: string
    country: string
    archetype?: string
  }
  similarity: number
  sharedPatterns: string[]
}

export const usePatterns = () =>
  createQuery<{
    insights: PatternInsight[]
    lastAnalyzedAt: string
    dataPointsAnalyzed: number
    message?: string
  }>('/api/patterns', {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })()

export const useCohorts = () =>
  createQuery<{
    matches: CohortMatch[]
    yourPatterns: PatternInsight[]
    lastAnalyzedAt: string
    message?: string
  }>('/api/cohorts', {
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (cohorts don't change frequently)
  })()

export interface ContextualPrompt {
  type: 'check-in' | 'suggestion' | 'insight' | 'connection'
  title: string
  message: string
  action?: {
    label: string
    target: 'mood' | 'memory' | 'sync' | 'log'
  }
  priority: number
  triggeredBy: string
}

export const useContextualPrompts = () =>
  createQuery<{
    prompts: ContextualPrompt[]
    generatedAt: string
    message?: string
  }>('/api/contextual-prompts', {
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes (context changes slowly)
  })()

export interface PatternEvolution {
  patternType: string
  patternTitle: string
  timeline: {
    week: string
    confidence: number
    dataPoints: number
    value?: any
  }[]
  trend: 'strengthening' | 'stable' | 'weakening' | 'emerging'
  firstSeen: string
  lastSeen: string
}

export const usePatternEvolution = () =>
  createQuery<{
    evolution: PatternEvolution[]
    timeWindows: string[]
    analyzedAt: string
    message?: string
  }>('/api/pattern-evolution', {
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (evolution is slow)
  })()

// ============================================================================
// SELF-CARE ENGINE QUERIES
// ============================================================================

export interface EnergyState {
  currentLevel: number
  maxCapacity: 100
  status: 'depleted' | 'low' | 'moderate' | 'good' | 'full'
  trajectory: 'improving' | 'stable' | 'declining' | 'critical'
  daysUntilBurnout: number | null
  romanticConnection: {
    lastIntimacyMoment: string | null
    daysSinceConnection: number
    connectionQuality: 'disconnected' | 'distant' | 'present' | 'deep'
    needsAttention: boolean
  }
  needsReplenishment: {
    category: string
    urgency: number
    daysSinceLastReplenishment: number
  }[]
}

export const useEnergy = () =>
  createQuery<{
    energyState: EnergyState | null
    suggestions: string[]
    analyzedAt: string
    message?: string
  }>('/api/energy', {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })()

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt: string | null
  category: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string
}

export interface UserNarrative {
  archetype: string
  currentLevel: number
  storyline: string
  achievements: Achievement[]
  currentArc: {
    chapter: number
    title: string
    narrative: string
    activeQuests: any[]
    milestones: any[]
  }
  totalXP: number
  nextMilestone: any | null
}

export const useNarrative = () =>
  createQuery<{
    narrative: UserNarrative | null
    generatedAt: string
    message?: string
  }>('/api/narrative', {
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })()

export const useGoalProgression = () =>
  createQuery<{
    progression: any | null // TODO: Type this properly
    generatedAt: string
    message?: string
  }>('/api/goal-progression', {
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })()

export interface ChatCatalyst {
  type: string
  priority: number
  title: string
  message: string
  action: {
    label: string
    cohortMember?: {
      id: string
      name: string
    }
  }
  triggeredBy: string
  conversationStarters?: string[]
}

export const useChatCatalysts = () =>
  createQuery<{
    catalysts: ChatCatalyst[]
    generatedAt: string
    message?: string
  }>('/api/chat-catalysts', {
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  })()

export interface Intervention {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  suggestion?: string
  action?: {
    label: string
    target: string
  }
}

export const useInterventions = () =>
  createQuery<{
    interventions: Intervention[]
    generatedAt: string
    message?: string
  }>('/api/interventions', {
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })()

export const useCommunityEmotion = () =>
  createQuery<{
    sharedEmotion: string | null
    confidence: number
    participantCount: number
    emotionBreakdown?: Record<string, number>
    calculatedAt: string
    message?: string
  }>('/api/community-emotion', {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (more volatile than other data)
  })()

// ============================================================================
// EMOTIONAL CHECK-IN QUERIES
// ============================================================================

export const useCreateEmotionalCheckIn = createMutation<
  {
    checkInType: 'morning' | 'evening' | 'moment'
    emotionalState: string
    intensity?: number
    note?: string
  },
  {
    checkIn: any
    insights: string[]
    compassionateResponse: string
  }
>('post', '/api/emotional-checkin')

export const useEmotionalCheckIns = (days: number = 30) =>
  createQuery<{
    checkIns: any[]
    stats: {
      total: number
      moodCounts: { [key: string]: number }
      dominantMood: string
      averageIntensity: number
    }
  }>(`/api/emotional-checkins?days=${days}`, {
    refetchOnWindowFocus: false,
  })()
