/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { EmailCode as EmailCodeModel } from '#shared/types'

type EmailCodeCreateFields = Pick<
  EmailCodeModel,
  'token' | 'code' | 'validUntil' | 'email' | 'magicLinkToken'
>

export class EmailCode
  extends Model<EmailCodeModel, EmailCodeCreateFields>
  implements EmailCodeModel
{
  declare id: EmailCodeModel['id']
  declare token: EmailCodeModel['token']
  declare code: EmailCodeModel['code']
  declare email: EmailCodeModel['email']
  declare magicLinkToken: EmailCodeModel['magicLinkToken']
  declare validUntil: EmailCodeModel['validUntil']
  declare createdAt: EmailCodeModel['createdAt']
  declare updatedAt: EmailCodeModel['updatedAt']
}

EmailCode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    magicLinkToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'email_code',
    tableName: 'email_codes',
    timestamps: true,
  }
)
