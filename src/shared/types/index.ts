// Enums
export enum UserTag {
  Admin = 'Admin',
  RND = 'RND',
  Evangelist = 'Evangelist',
  Mala = 'Mala',
  Onyx = 'Onyx',
  Usership = 'Usership',
  Pro = 'Pro',
  Suspended = 'Suspended',
}

// User Types
export type UserSettings = {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  hideActivityLogs: boolean;
};

export type UserPrivacySettings = {
  isPublicProfile: boolean;
  showWeather: boolean;
  showLocalTime: boolean;
  showCity: boolean;
  showSound: boolean;
  showMemoryStory: boolean;
  customUrl?: string | null;
};

export type WorldElement = {
  id: string;
  type: 'object' | 'creature' | 'plant' | 'structure' | 'weather-effect';
  imageUrl: string;
  prompt: string;
  position: { x: number; y: number; z: number };
  scale: number;
  rotation: number;
  generatedAt: Date;
  context: string; // Short description of what influenced this element
};

export type UserWorld = {
  elements: WorldElement[];
  lastGenerated: Date | null;
  theme: string; // Overall world theme derived from user context
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  tags: string[];
  hideActivityLogs: boolean;
  memoryEngine?: 'ai' | 'standard';
  isAdmin?: boolean;
};

export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  timeZone: string | null;
  hideActivityLogs: boolean;
  tags: string[];
  lastSeenAt: Date | null;
  joinedAt: Date | null;
  stripeCustomerId: string | null;
  metadata: Record<string, any>;
};

// Session Type
export type Session = {
  token: string;
  userId: string;
  createdAt: Date;
};

// Log Types
export type LogEvent =
  | 'user_login'
  | 'user_logout'
  | 'settings_change'
  | 'theme_change'
  | 'weather_update'
  | 'note'
  | 'other';

export type Log = {
  id: string;
  userId: string;
  text: string | null;
  event: string;
  metadata: Record<string, any>;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export type LogContext = {
  temperature?: number | null;
  humidity?: number | null;
  country?: string | null;
  city?: string | null;
  [key: string]: any;
};

export type LogSettingsChangeMetadata = {
  changedBy: string;
  changes: Record<string, any>;
};

// Answer Type
export type Answer = {
  id: string;
  userId: string;
  question: string;
  options: string[];
  answer: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

// Chat Message Types
export type ChatMessage = {
  id: string;
  authorUserId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageLike = {
  id: string;
  userId: string;
  messageId: string;
  createdAt: Date;
};

// Live Message Type
export type LiveMessage = {
  id: string;
  authorUserId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};

// Email Code Type
export type EmailCode = {
  id: string;
  token: string;
  code: string;
  email: string;
  magicLinkToken: string;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Weather Types
export type Weather = {
  temperature: number | null;
  humidity: number | null;
  description: string | null;
  windSpeed: number | null;
  pressure: number | null;
  tempKelvin: number | null;
  sunrise?: number | null;
  sunset?: number | null;
};

export type WeatherRecord = Weather & {
  createdAt: Date;
};

export type WeatherResponse = {
  id: string;
  city: string;
  country: string;
  weather: Record<string, any> | null;
  createdAt: Date;
};

// Public Profile Type
export type PublicProfile = {
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  country: string | null;
  localTime?: string;
  weather?: Weather;
  soundDescription?: string;
  memoryStory?: string;
  privacySettings: UserPrivacySettings;
  tags?: string[];
  profileVisits?: number;
  psychologicalProfile?: {
    hasUsership: boolean;
    message?: string;
    archetype?: string;
    archetypeDescription?: string;
    coreValues?: string[];
    emotionalPatterns?: string[];
    selfAwarenessLevel?: number;
    behavioralCohort?: string;
    behavioralTraits?: string[];
    patternStrength?: Array<{ trait: string; count: number }>;
    answerCount?: number;
    noteCount?: number;
  };
};

// Other Types
export type Color = string;

export type DefaultQuestion = {
  id: string;
  text: string;
};

export type MemoryQuestion = {
  id?: string;
  question: string;
  answer?: string;
  options?: string[];
};

// Admin and Pagination Types
export type AdminUsersSort = 'createdAt' | 'email' | 'lastSeenAt' | 'newest' | 'last_seen';

export type Paginated<T> = {
  items: T[];
  data?: T[];
  total: number;
  page: number;
  pageSize: number;
  skip?: number;
  limit?: number;
};

// Chat Message Extended Types
export type PublicChatMessage = ChatMessage & {
  author: Pick<User, 'id' | 'firstName' | 'lastName'> | string | null;
  authorUserId?: string;
  likesCount: number;
  likes?: number;
  isLiked: boolean;
  updatedAt?: Date;
};

export type ChatMessageLikePayload = {
  messageId: string;
};

export type ChatMessageLikeEventPayload = {
  messageId: string;
  userId: string;
  likesCount: number;
  likes?: number;
  isLiked?: boolean;
};

// Sync Events
export type SyncEvents = {
  chatMessage: PublicChatMessage;
  chatMessageLike: ChatMessageLikeEventPayload;
};