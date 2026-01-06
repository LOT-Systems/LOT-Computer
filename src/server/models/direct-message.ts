import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { DirectMessage as DirectMessageModel } from '#shared/types'

type DirectMessageCreateFields = Pick<
  DirectMessageModel,
  'senderId' | 'receiverId' | 'message'
>

export class DirectMessage
  extends Model<DirectMessageModel, DirectMessageCreateFields>
  implements DirectMessageModel
{
  declare id: DirectMessageModel['id']
  declare senderId: DirectMessageModel['senderId']
  declare receiverId: DirectMessageModel['receiverId']
  declare message: DirectMessageModel['message']
  declare createdAt: DirectMessageModel['createdAt']
  declare updatedAt: DirectMessageModel['updatedAt']
}

DirectMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    receiverId: {
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
    modelName: 'direct_message',
    tableName: 'direct_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['receiverId', 'createdAt'],
      },
      {
        fields: ['senderId', 'receiverId', 'createdAt'],
      },
    ],
  }
)
