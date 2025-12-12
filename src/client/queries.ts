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

export const useLogs = createQuery<Log[]>('/api/logs')

export const useCreateLog = createMutation<{ text: string }, Log>(
  'post',
  '/api/logs'
)

export const useUpdateLog = createMutation<{ id: string; text: string }, Log>(
  'put',
  (data) => `/api/logs/${data.id}`
)

export const useMemory = () => {
  const date = btoa(dayjs().format(DATE_TIME_FORMAT))
  const path = '/api/memory'
  return useQuery<any>(
    [path],
    async () => (await api.get<any>(path, { params: { d: date } })).data
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
