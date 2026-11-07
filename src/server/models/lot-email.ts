/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model } from 'sequelize'
import { sequelize } from '#server/utils/db'

/** LOT® Email — the simplest internal mail: one sender, one receiver, one body. */
export class LotEmail extends Model {
  declare id: string
  declare senderId: string
  declare receiverId: string
  declare body: string
  declare readAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

LotEmail.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
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
    modelName: 'lot_email',
    tableName: 'lot_emails',
    timestamps: true,
    indexes: [{ fields: ['receiverId', 'createdAt'] }],
  }
)
