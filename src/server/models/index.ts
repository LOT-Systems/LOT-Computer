import { User } from './user'
import { Session } from './session'
import { EmailCode } from './email-code'
import { LiveMessage } from './live-message'
import { ChatMessage } from './chat-message'
import { ChatMessageLike } from './chat-message-like'
import { WeatherResponse } from './weather-response'
import { Log } from './log'
import { Answer } from './answer'

export type UserRecord = User

export const models = {
  User,
  Session,
  EmailCode,
  LiveMessage,
  ChatMessage,
  ChatMessageLike,
  WeatherResponse,
  Log,
  Answer,
}

export type Models = {
  User: typeof User
  Session: typeof Session
  EmailCode: typeof EmailCode
  LiveMessage: typeof LiveMessage
  ChatMessage: typeof ChatMessage
  ChatMessageLike: typeof ChatMessageLike
  WeatherResponse: typeof WeatherResponse
  Log: typeof Log
  Answer: typeof Answer
}

User.hasOne(Session)

Session.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
})

export interface SessionWithUser extends Session {
  user?: User
}
