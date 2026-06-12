/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { LotMail as LotMailType } from '#shared/types'

type LotMailCreateFields = Pick<LotMailType, 'fromUserId' | 'toUserId' | 'body'> & {
  subject?: string | null
}

export class LotMail
  extends Model<LotMailType, LotMailCreateFields>
  implements LotMailType
{
  declare id: LotMailType['id']
  declare fromUserId: LotMailType['fromUserId']
  declare toUserId: LotMailType['toUserId']
  declare subject: LotMailType['subject']
  declare body: LotMailType['body']
  declare read: LotMailType['read']
  declare createdAt: LotMailType['createdAt']
  declare updatedAt: LotMailType['updatedAt']
}

LotMail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    toUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'lot_mail',
    tableName: 'lot_mails',
    timestamps: true,
  }
)
