import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { ChatMessageLike as ChatMessageLikeModel } from '#shared/types'

type ChatMessageLikeCreateFields = Pick<
  ChatMessageLikeModel,
  'userId' | 'messageId'
>

export class ChatMessageLike
  extends Model<ChatMessageLikeModel, ChatMessageLikeCreateFields>
  implements ChatMessageLikeModel
{
  declare id: ChatMessageLikeModel['id']
  declare userId: ChatMessageLikeModel['userId']
  declare messageId: ChatMessageLikeModel['messageId']
  declare createdAt: ChatMessageLikeModel['createdAt']
}

ChatMessageLike.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chat_messages',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'chat_message_like',
    tableName: 'chat_messages_likes',
    timestamps: true,
    updatedAt: false,
  }
)
