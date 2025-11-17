// Entities

export interface User {
  id: string
  createdAt: Date
  updatedAt: Date
  email: string
  firstName: string | null
  lastName: string | null

  country: string | null
  city: string | null
  address: string | null
  phone: string | null
  timeZone: string | null
  hideActivityLogs: boolean

  tags: UserTag[]
  lastSeenAt: Date | null
  joinedAt: Date | null

  stripeCustomerId: string | null
  metadata: Record<string, unknown>
}

export enum UserTag {
  Admin = 'admin',
  RND = 'rnd',
  Evangelist = 'evangelist',
  Mala = 'mala',
  Onyx = 'onyx',
}

export interface Session {
  token: string
  userId: string
  createdAt: Date
}

export interface EmailCode {
  id: string
  token: string
  email: string
  code: string
  magicLinkToken: string
  validUntil: Date
  createdAt: Date
  updatedAt: Date
}

export interface LiveMessage {
  id: string
  authorUserId: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  authorUserId: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessageLike {
  id: string
  userId: string
  messageId: string
  createdAt: string
}

export interface WeatherResponse {
  id: string
  country: string
  city: string
  weather: Weather | null
  createdAt: Date
}

export type LogEvent =
  | 'note'
  | 'settings_change'
  | 'chat_message'
  | 'chat_message_like'
  | 'answer'

export interface Log {
  id: string
  userId: string
  event: LogEvent
  text: string
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, unknown>
  context: LogContext
}

export type LogContext = {
  date: string | null
  timeZone: string | null
  temperature: number | null
  humidity: number | null
  country: string | null
  city: string | null
}

export type LogSettingsChangeMetadata = {
  changes: Record<keyof UserSettings, [string, string]>
}

export interface Answer {
  id: string
  userId: string
  question: string
  options: string[]
  answer: string
  createdAt: Date
  updatedAt: Date
  metadata: {
    questionId?: string
  } & Record<string, unknown>
}

// API
export type UserProfile = Pick<
  User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'country'
  | 'city'
  | 'address'
  | 'phone'
  | 'tags'
  | 'hideActivityLogs'
> & { isAdmin?: boolean }

export type UserSettings = Pick<
  User,
  | 'firstName'
  | 'lastName'
  | 'country'
  | 'city'
  | 'address'
  | 'phone'
  | 'hideActivityLogs'
>

export type SyncEvents = {
  users_total: { value: number }
  users_online: { value: number }
  chat_message: PublicChatMessage
  chat_message_like: ChatMessageLikeEventPayload
  live_message: { message: string }
}

export type PublicChatMessage = {
  id: string
  message: string
  author: string | null
  createdAt: string
  likes: number
  isLiked: boolean
}

export type ChatMessageLikePayload = {
  messageId: string
}

export type ChatMessageLikeEventPayload = {
  messageId: string
  userId: string
  likes: number
  isLiked: boolean
}

export type Weather = {
  humidity: number
  tempKelvin: number
  sunrise: number
  sunset: number
}

export type WeatherRecord = Weather & Pick<WeatherResponse, 'createdAt'>

export type AdminUsersSort = 'newest' | 'oldest' | 'last_seen'

// Utils
export type Color =
  | 'green'
  | 'yellow'
  | 'red'
  | 'blue'
  | 'gray'
  | 'purple'
  | 'transparent'

export type Paginated<T> = {
  data: T[]
  total: number
  limit: number
  skip: number
}

export type DefaultQuestion = {
  id: string
  question: string
  options: string[]
}

export type MemoryQuestion = {
  question: string
  options: string[]
}
