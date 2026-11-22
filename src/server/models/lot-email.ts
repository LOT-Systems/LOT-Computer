/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { LotEmail as LotEmailModel } from '#shared/types'

type LotEmailCreateFields = Pick<
  LotEmailModel,
  'senderId' | 'receiverId' | 'body' | 'source'
>

/**
 * LOT® Email — member-to-member mail inside LOT Community.
 * Composed in Log with `/email to <Name>. <message>`, delivered into Sync.
 */
export class LotEmail
  extends Model<LotEmailModel, LotEmailCreateFields>
  implements LotEmailModel
{
  declare id: CreationOptional<string>
  declare senderId: LotEmailModel['senderId']
  declare receiverId: LotEmailModel['receiverId']
  declare body: LotEmailModel['body']
  declare source: LotEmailModel['source']
  declare readAt: LotEmailModel['readAt']
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

LotEmail.init(
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
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'log',
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
    modelName: 'lot_email',
    tableName: 'lot_emails',
    timestamps: true,
  }
)
