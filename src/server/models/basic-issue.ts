/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { BasicIssue as BasicIssueType } from '#shared/types'

type CreateFields = Pick<BasicIssueType, 'subscriptionId' | 'userId' | 'issueNumber'> &
  Partial<BasicIssueType>

export class BasicIssue
  extends Model<BasicIssueType, CreateFields>
  implements BasicIssueType
{
  declare id: string
  declare subscriptionId: string
  declare userId: string
  declare issueNumber: number
  declare periodLabel: string | null
  declare itemCount: number | null
  declare status: BasicIssueType['status']
  declare issuedAt: Date | null
  declare shippedAt: Date | null
  declare deliveredAt: Date | null
  declare trackingNumber: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

BasicIssue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'basic_subscriptions', key: 'id' },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    issueNumber:    { type: DataTypes.INTEGER, allowNull: false },
    periodLabel:    DataTypes.STRING,
    itemCount:      DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SCHEDULED',
    },
    issuedAt:       DataTypes.DATE,
    shippedAt:      DataTypes.DATE,
    deliveredAt:    DataTypes.DATE,
    trackingNumber: DataTypes.STRING,
    createdAt:      DataTypes.DATE,
    updatedAt:      DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'basicIssue',
    tableName: 'basic_issues',
    timestamps: true,
  }
)
