import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class EmailCode extends Model {
}
EmailCode.init({
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
}, {
    sequelize,
    modelName: 'email_code',
    tableName: 'email_codes',
    timestamps: true,
});
