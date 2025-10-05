import { DataTypes, Model, CreationOptional, Op } from 'sequelize'
import config from '#server/config'
import dayjs from '#server/utils/dayjs'
import { sequelize } from '#server/utils/db'
import { USER_ONLINE_TIMEOUT_MINUTES } from '#server/constants'
import { User as UserModel, UserProfile, UserTag } from '#shared/types'
import { fp } from '#shared/utils'

type UserCreateFields = Pick<UserModel, 'email'> & Partial<UserModel>

export class User
  extends Model<UserModel, UserCreateFields>
  implements UserModel
{
  declare id: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare email: UserModel['email']
  declare firstName: UserModel['firstName']
  declare lastName: UserModel['lastName']
  declare country: UserModel['country']
  declare city: UserModel['city']
  declare address: UserModel['address']
  declare phone: UserModel['phone']
  declare timeZone: UserModel['timeZone']
  declare hideActivityLogs: UserModel['hideActivityLogs']
  declare tags: UserModel['tags']
  declare lastSeenAt: UserModel['lastSeenAt']
  declare joinedAt: UserModel['joinedAt']
  declare stripeCustomerId: UserModel['stripeCustomerId']
  declare metadata: UserModel['metadata']

  useProfileView(): UserProfile {
    return fp.pick([
      'id',
      'email',
      'firstName',
      'lastName',
      'country',
      'city',
      'address',
      'phone',
      'tags',
      'hideActivityLogs',
    ])(this.toJSON())
  }

  isAdmin(): boolean {
    return (
      config.admins.includes(this.email) || this.tags.includes(UserTag.Admin)
    )
  }

  async ping() {
    return this.set({ lastSeenAt: new Date() }).save()
  }

  deferredPing() {
    process.nextTick(() => this.ping())
  }

  static async countOnline(): Promise<number> {
    return await User.count({
      where: {
        [Op.and]: [
          { lastSeenAt: { [Op.not]: null } },
          {
            lastSeenAt: {
              [Op.gte]: dayjs()
                .subtract(USER_ONLINE_TIMEOUT_MINUTES, 'minutes')
                .toDate(),
            },
          },
        ],
      },
    })
  }

  static async countJoined(): Promise<number> {
    return await User.count({
      where: {
        joinedAt: { [Op.not]: null },
      },
    })
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    timeZone: DataTypes.STRING,
    hideActivityLogs: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    lastSeenAt: DataTypes.DATE,
    joinedAt: DataTypes.DATE,
    stripeCustomerId: DataTypes.STRING,
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'users',
    timestamps: true,
  }
)
