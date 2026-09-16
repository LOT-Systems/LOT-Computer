/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { LotMail as LotMailModel } from '#shared/types'

type LotMailCreateFields = Pick<
  LotMailModel,
  'senderUserId' | 'recipientName' | 'recipientUserId' | 'body'
>

export class LotMail
  extends Model<LotMailModel, LotMailCreateFields>
  implements LotMailModel
{
  declare id: LotMailModel['id']
  declare senderUserId: LotMailModel['senderUserId']
  declare recipientName: LotMailModel['recipientName']
  declare recipientUserId: LotMailModel['recipientUserId']
  declare body: LotMailModel['body']
  declare createdAt: LotMailModel['createdAt']
  declare updatedAt: LotMailModel['updatedAt']
}

LotMail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    senderUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'lot_mail',
    tableName: 'lot_mail',
    timestamps: true,
  }
)
