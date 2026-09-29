/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'

export type EmailRecord = {
  id: string
  senderId: string
  receiverId: string
  body: string
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class Email
  extends Model<EmailRecord, Pick<EmailRecord, 'senderId' | 'receiverId' | 'body'>>
  implements EmailRecord
{
  declare id: EmailRecord['id']
  declare senderId: EmailRecord['senderId']
  declare receiverId: EmailRecord['receiverId']
  declare body: EmailRecord['body']
  declare readAt: EmailRecord['readAt']
  declare createdAt: EmailRecord['createdAt']
  declare updatedAt: EmailRecord['updatedAt']
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
    indexes: [{ fields: ['receiverId', 'createdAt'] }],
  }
)
