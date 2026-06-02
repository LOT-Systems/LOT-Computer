/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { User } from './user.js'
import { Session } from './session.js'
import { EmailCode } from './email-code.js'
import { LiveMessage } from './live-message.js'
import { ChatMessage } from './chat-message.js'
import { ChatMessageLike } from './chat-message-like.js'
import { DirectMessage } from './direct-message.js'
import { WeatherResponse } from './weather-response.js'
import { Log } from './log.js'
import { Answer } from './answer.js'
import { RationSubscription } from './ration-subscription.js'

export type UserRecord = User

export const models = {
  User,
  Session,
  EmailCode,
  LiveMessage,
  ChatMessage,
  ChatMessageLike,
  DirectMessage,
  WeatherResponse,
  Log,
  Answer,
  RationSubscription,
}

export type Models = {
  User: typeof User
  Session: typeof Session
  EmailCode: typeof EmailCode
  LiveMessage: typeof LiveMessage
  ChatMessage: typeof ChatMessage
  ChatMessageLike: typeof ChatMessageLike
  DirectMessage: typeof DirectMessage
  WeatherResponse: typeof WeatherResponse
  Log: typeof Log
  Answer: typeof Answer
}

User.hasMany(Session)

Session.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
})

export interface SessionWithUser extends Session {
  user?: User
}
