import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { ChatMessage as ChatMessageModel } from '#shared/types'

type ChatMessageCreateFields = Pick<
  ChatMessageModel,
  'authorUserId' | 'message'
>

export class ChatMessage
  extends Model<ChatMessageModel, ChatMessageCreateFields>
  implements ChatMessageModel
{
  declare id: ChatMessageModel['id']
  declare authorUserId: ChatMessageModel['authorUserId']
  declare message: ChatMessageModel['message']
  declare createdAt: ChatMessageModel['createdAt']
  declare updatedAt: ChatMessageModel['updatedAt']
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    authorUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'chat_message',
    tableName: 'chat_messages',
    timestamps: true,
  }
)
