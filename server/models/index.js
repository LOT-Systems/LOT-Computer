import { User } from './user';
import { Session } from './session';
import { EmailCode } from './email-code';
import { LiveMessage } from './live-message';
import { ChatMessage } from './chat-message';
import { ChatMessageLike } from './chat-message-like';
import { WeatherResponse } from './weather-response';
import { Log } from './log';
import { Answer } from './answer';
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
};
User.hasOne(Session);
Session.belongsTo(User, {
    targetKey: 'id',
    foreignKey: 'userId',
});
