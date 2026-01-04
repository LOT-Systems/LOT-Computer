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
    async () => (await api.get<any>(path, { params: { d: date } })).data,
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
