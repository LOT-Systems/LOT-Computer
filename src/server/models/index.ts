import { User } from './user.js'
import { Session } from './session.js'
import { EmailCode } from './email-code.js'
import { LiveMessage } from './live-message.js'
import { ChatMessage } from './chat-message.js'
import { ChatMessageLike } from './chat-message-like.js'
import { WeatherResponse } from './weather-response.js'
import { Log } from './log.js'
import { Answer } from './answer.js'

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
