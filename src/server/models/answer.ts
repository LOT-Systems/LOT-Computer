import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { Answer as AnswerModel } from '#shared/types'

type AnswerCreateFields = Pick<
  AnswerModel,
  'userId' | 'question' | 'options' | 'answer'
> &
  Partial<AnswerModel>

export class Answer
  extends Model<AnswerModel, AnswerCreateFields>
  implements AnswerModel
{
  declare id: AnswerModel['id']
  declare userId: AnswerModel['userId']
  declare question: AnswerModel['question']
  declare options: AnswerModel['options']
  declare answer: AnswerModel['answer']
  declare createdAt: AnswerModel['createdAt']
  declare updatedAt: AnswerModel['updatedAt']
  declare metadata: AnswerModel['metadata']
}

Answer.init(
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
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    question: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING(1024)),
      defaultValue: [],
    },
    answer: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'answer',
    tableName: 'answers',
    timestamps: true,
  }
)
