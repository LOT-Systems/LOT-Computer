import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class Session extends Model {
}
Session.init({
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
}, {
    sequelize,
    modelName: 'session',
    tableName: 'sessions',
    timestamps: true,
    updatedAt: false,
});
