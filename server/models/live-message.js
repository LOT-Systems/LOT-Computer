import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class LiveMessage extends Model {
    static async getMessage() {
        const record = await this.findOne();
        return record?.message || '';
    }
}
LiveMessage.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    authorUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    sequelize,
    modelName: 'live_message',
    tableName: 'live_messages',
    timestamps: true,
});
