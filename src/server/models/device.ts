/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 */

// LOT hardware device (pager). One row per paired physical unit.
// The device authenticates with a bearer token; only its SHA-256 hash is stored.

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'

export type DeviceAttributes = {
  id: string
  userId: string
  name: string
  tokenHash: string
  firmware: string | null
  lastSeenAt: Date | null
  revokedAt: Date | null
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

type DeviceCreateFields = Pick<DeviceAttributes, 'userId' | 'name' | 'tokenHash'> &
  Partial<DeviceAttributes>

export class Device extends Model<DeviceAttributes, DeviceCreateFields> implements DeviceAttributes {
  declare id: string
  declare userId: string
  declare name: string
  declare tokenHash: string
  declare firmware: string | null
  declare lastSeenAt: Date | null
  declare revokedAt: Date | null
  declare metadata: Record<string, unknown>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Device.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    name: { type: DataTypes.STRING(64), allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    firmware: { type: DataTypes.STRING(32), allowNull: true },
    lastSeenAt: { type: DataTypes.DATE, allowNull: true },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'device', tableName: 'devices', timestamps: true }
)
