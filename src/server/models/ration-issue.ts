/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { User } from './user.js'
import { RationSubscription } from './ration-subscription.js'

export type RationIssueStatus = 'SCHEDULED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED'

export type RationIssueRecord = {
  id: string
  subscriptionId: string
  userId: string
  issueNumber: number
  status: RationIssueStatus
  scheduledDate: string
  dispatchedAt: Date | null
  trackingCode: string | null
  loadSummary: string[]  // item numbers included
  cogsTotal: number
  marginPct: number
  createdAt: Date
  updatedAt: Date
}

export class RationIssue
  extends Model<RationIssueRecord, Omit<RationIssueRecord, 'id' | 'createdAt' | 'updatedAt'>>
  implements RationIssueRecord
{
  declare id: CreationOptional<string>
  declare subscriptionId: string
  declare userId: string
  declare issueNumber: number
  declare status: RationIssueStatus
  declare scheduledDate: string
  declare dispatchedAt: Date | null
  declare trackingCode: string | null
  declare loadSummary: string[]
  declare cogsTotal: number
  declare marginPct: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

RationIssue.init(
  {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    subscriptionId: { type: DataTypes.UUID, allowNull: false },
    userId:         { type: DataTypes.UUID, allowNull: false },
    issueNumber:    { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'),
      allowNull: false,
      defaultValue: 'SCHEDULED',
    },
    scheduledDate:  { type: DataTypes.DATEONLY,       allowNull: false },
    dispatchedAt:   { type: DataTypes.DATE,           allowNull: true  },
    trackingCode:   { type: DataTypes.STRING(255),    allowNull: true  },
    loadSummary:    { type: DataTypes.JSONB,          allowNull: false },
    cogsTotal:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    marginPct:      { type: DataTypes.DECIMAL(10, 4), allowNull: false },
    createdAt:      DataTypes.DATE,
    updatedAt:      DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'ration_issues',
    modelName: 'RationIssue',
  }
)

RationIssue.belongsTo(User,               { foreignKey: 'userId',         as: 'user'         })
RationIssue.belongsTo(RationSubscription, { foreignKey: 'subscriptionId', as: 'subscription' })
RationSubscription.hasMany(RationIssue,   { foreignKey: 'subscriptionId', as: 'issues'       })
