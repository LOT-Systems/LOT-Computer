import { DataTypes, Model, Op } from 'sequelize';
import config from '#server/config';
import dayjs from '#server/utils/dayjs';
import { sequelize } from '#server/utils/db';
import { USER_ONLINE_TIMEOUT_MINUTES } from '#server/constants';
import { fp } from '#shared/utils';
export class User extends Model {
    useProfileView() {
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
        ])(this.toJSON());
    }
    isAdmin() {
        return (config.admins.includes(this.email) || this.tags.includes(UserTag.Admin));
    }
    async ping() {
        return this.set({ lastSeenAt: new Date() }).save();
    }
    deferredPing() {
        process.nextTick(() => this.ping());
    }
    static async countOnline() {
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
        });
    }
    static async countJoined() {
        return await User.count({
            where: {
                joinedAt: { [Op.not]: null },
            },
        });
    }
}
User.init({
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
}, {
    sequelize,
    modelName: 'user',
    tableName: 'users',
    timestamps: true,
});
