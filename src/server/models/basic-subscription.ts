/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { BasicSubscription as BasicSubscriptionType } from '#shared/types'

type CreateFields = Pick<BasicSubscriptionType, 'userId' | 'status'> &
  Partial<BasicSubscriptionType>

export class BasicSubscription
  extends Model<BasicSubscriptionType, CreateFields>
  implements BasicSubscriptionType
{
  declare id: string
  declare userId: string
  declare status: BasicSubscriptionType['status']
  declare shippingName: string | null
  declare shippingLine1: string | null
  declare shippingLine2: string | null
  declare shippingCity: string | null
  declare shippingState: string | null
  declare shippingZip: string | null
  declare shippingCountry: string | null
  declare shirtSize: string | null
  declare shoeSize: string | null
  declare cadenceStart: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

BasicSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDING',
    },
    shippingName:    DataTypes.STRING,
    shippingLine1:   DataTypes.STRING,
    shippingLine2:   DataTypes.STRING,
    shippingCity:    DataTypes.STRING,
    shippingState:   DataTypes.STRING,
    shippingZip:     DataTypes.STRING,
    shippingCountry: { type: DataTypes.STRING, defaultValue: 'US' },
    shirtSize:       DataTypes.STRING,
    shoeSize:        DataTypes.STRING,
    cadenceStart:    DataTypes.DATE,
    createdAt:       DataTypes.DATE,
    updatedAt:       DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'basicSubscription',
    tableName: 'basic_subscriptions',
    timestamps: true,
  }
)
