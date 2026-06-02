/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { User } from './user.js'

export type RationStatus = 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE' | 'STAND_DOWN'

export type RationSubscriptionRecord = {
  id: string
  userId: string
  status: RationStatus
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingState: string
  shippingZip: string
  clothingSize: string
  stripeSubscriptionItemId: string | null
  issueCount: number
  lastIssueDate: string | null
  nextIssueDate: string | null
  subscribedAt: Date | null
  standDownAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class RationSubscription
  extends Model<RationSubscriptionRecord, Omit<RationSubscriptionRecord, 'id' | 'createdAt' | 'updatedAt'>>
  implements RationSubscriptionRecord
{
  declare id: CreationOptional<string>
  declare userId: string
  declare status: RationStatus
  declare shippingLine1: string
  declare shippingLine2: string | null
  declare shippingCity: string
  declare shippingState: string
  declare shippingZip: string
  declare clothingSize: string
  declare stripeSubscriptionItemId: string | null
  declare issueCount: number
  declare lastIssueDate: string | null
  declare nextIssueDate: string | null
  declare subscribedAt: Date | null
  declare standDownAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

RationSubscription.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM('PENDING', 'ON_STRENGTH', 'STEADY_STATE', 'STAND_DOWN'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    shippingLine1: { type: DataTypes.STRING(255), allowNull: false },
    shippingLine2: { type: DataTypes.STRING(255), allowNull: true },
    shippingCity:  { type: DataTypes.STRING(100), allowNull: false },
    shippingState: { type: DataTypes.STRING(10),  allowNull: false },
    shippingZip:   { type: DataTypes.STRING(20),  allowNull: false },
    clothingSize:  { type: DataTypes.STRING(10),  allowNull: false },
    stripeSubscriptionItemId: { type: DataTypes.STRING(255), allowNull: true },
    issueCount:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lastIssueDate: { type: DataTypes.DATEONLY, allowNull: true },
    nextIssueDate: { type: DataTypes.DATEONLY, allowNull: true },
    subscribedAt:  { type: DataTypes.DATE, allowNull: true },
    standDownAt:   { type: DataTypes.DATE, allowNull: true },
    createdAt:     DataTypes.DATE,
    updatedAt:     DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'ration_subscriptions',
    modelName: 'RationSubscription',
  }
)

RationSubscription.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasOne(RationSubscription, { foreignKey: 'userId', as: 'rationSubscription' })
