/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'

/**
 * LOT® Email — one row is one letter between two operators.
 * source: 'log' (composed via /email in Log), 'sync' (reply in Sync),
 * 'cohort' (sent from Cohort Connect / LOT Community).
 */
export type LotEmailSource = 'log' | 'sync' | 'cohort'

export class LotEmail extends Model {
  declare id: CreationOptional<string>
  declare senderId: string
  declare receiverId: string
  declare body: string
  declare source: CreationOptional<LotEmailSource>
  declare readAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

LotEmail.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    senderId: { type: DataTypes.UUID, allowNull: false },
    receiverId: { type: DataTypes.UUID, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    source: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'log' },
    readAt: { type: DataTypes.DATE, allowNull: true },
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
