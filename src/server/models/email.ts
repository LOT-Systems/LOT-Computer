/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { Email as EmailModel } from '#shared/types'

type EmailCreateFields = Pick<EmailModel, 'senderId' | 'receiverId' | 'body'>

export class Email
  extends Model<EmailModel, EmailCreateFields>
  implements EmailModel
{
  declare id: EmailModel['id']
  declare senderId: EmailModel['senderId']
  declare receiverId: EmailModel['receiverId']
  declare body: EmailModel['body']
  declare readAt: EmailModel['readAt']
  declare createdAt: EmailModel['createdAt']
  declare updatedAt: EmailModel['updatedAt']
}

Email.init(
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
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    body: { type: DataTypes.TEXT, allowNull: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'email',
    tableName: 'emails',
    timestamps: true,
    indexes: [
      { fields: ['receiverId', 'createdAt'] },
      { fields: ['senderId', 'createdAt'] },
    ],
  }
)
