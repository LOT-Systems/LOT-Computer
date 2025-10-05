import { DataTypes, Model, ForeignKey, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { Session as SessionModel } from '#shared/types'

type SessionCreateFields = Pick<SessionModel, 'token' | 'userId'>

export class Session
  extends Model<SessionModel, SessionCreateFields>
  implements SessionModel
{
  declare token: SessionModel['token']
  declare userId: ForeignKey<SessionModel['userId']>
  declare createdAt: CreationOptional<Date>
}

Session.init(
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'session',
    tableName: 'sessions',
    timestamps: true,
    updatedAt: false,
  }
)
