/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { LotMail as LotMailModel } from '#shared/types'

type LotMailCreateFields = Pick<
  LotMailModel,
  'fromUserId' | 'toUserId' | 'body'
> &
  Partial<Pick<LotMailModel, 'subject' | 'read'>>

export class LotMail
  extends Model<LotMailModel, LotMailCreateFields>
  implements LotMailModel
{
  declare id: LotMailModel['id']
  declare fromUserId: LotMailModel['fromUserId']
  declare toUserId: LotMailModel['toUserId']
  declare subject: LotMailModel['subject']
  declare body: LotMailModel['body']
  declare read: LotMailModel['read']
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
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    toUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'lot_mail',
    tableName: 'lot_mails',
    timestamps: true,
    indexes: [
      {
        fields: ['toUserId', 'read', 'createdAt'],
      },
      {
        fields: ['fromUserId', 'createdAt'],
      },
    ],
  }
)
