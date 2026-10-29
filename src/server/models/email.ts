/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'

export type EmailSource = 'log' | 'sync' | 'cohort'

export interface EmailModel {
  id: string
  senderId: string
  receiverId: string
  subject: string | null
  body: string
  source: EmailSource
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type EmailCreateFields = Pick<EmailModel, 'senderId' | 'receiverId' | 'body'> &
  Partial<Pick<EmailModel, 'subject' | 'source'>>

export class Email
  extends Model<EmailModel, EmailCreateFields>
  implements EmailModel
{
  declare id: EmailModel['id']
  declare senderId: EmailModel['senderId']
  declare receiverId: EmailModel['receiverId']
  declare subject: EmailModel['subject']
  declare body: EmailModel['body']
  declare source: EmailModel['source']
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
    subject: { type: DataTypes.STRING(200), allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    source: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'log' },
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
