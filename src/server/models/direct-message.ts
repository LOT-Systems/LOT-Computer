/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { DirectMessage as DirectMessageModel } from '#shared/types'

type DirectMessageCreateFields = Pick<
  DirectMessageModel,
  'senderId' | 'receiverId' | 'message'
> &
  Partial<Pick<DirectMessageModel, 'kind'>>

export class DirectMessage
  extends Model<DirectMessageModel, DirectMessageCreateFields>
  implements DirectMessageModel
{
  declare id: DirectMessageModel['id']
  declare senderId: DirectMessageModel['senderId']
  declare receiverId: DirectMessageModel['receiverId']
  declare message: DirectMessageModel['message']
  declare kind: DirectMessageModel['kind']
  declare readAt: DirectMessageModel['readAt']
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
    kind: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'dm',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
