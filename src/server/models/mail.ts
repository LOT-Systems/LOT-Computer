/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { Mail as MailModel } from '#shared/types'

type MailCreateFields = Pick<
  MailModel,
  'senderId' | 'receiverId' | 'subject' | 'body'
>

export class Mail extends Model<MailModel, MailCreateFields> implements MailModel {
  declare id: MailModel['id']
  declare senderId: MailModel['senderId']
  declare receiverId: MailModel['receiverId']
  declare subject: MailModel['subject']
  declare body: MailModel['body']
  declare readAt: MailModel['readAt']
  declare createdAt: MailModel['createdAt']
  declare updatedAt: MailModel['updatedAt']
}

Mail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    senderId: { type: DataTypes.UUID, allowNull: false },
    receiverId: { type: DataTypes.UUID, allowNull: false },
    subject: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '' },
    body: { type: DataTypes.TEXT, allowNull: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'mail',
    tableName: 'mails',
    timestamps: true,
    indexes: [
      { fields: ['receiverId', 'createdAt'] },
      { fields: ['senderId', 'createdAt'] },
    ],
  }
)
