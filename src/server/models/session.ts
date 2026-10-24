/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { DataTypes, Model, ForeignKey, CreationOptional, Op } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { Session as SessionModel } from '#shared/types'
import { SESSION_MAX_AGE_MS } from '#server/utils/security'

type SessionCreateFields = Pick<SessionModel, 'token' | 'userId'> &
  Partial<Pick<Session, 'expiresAt' | 'createdFromIp' | 'fingerprint'>>

export class Session
  extends Model<SessionModel, SessionCreateFields>
  implements SessionModel
{
  declare token: SessionModel['token']
  declare userId: ForeignKey<SessionModel['userId']>
  declare createdAt: CreationOptional<Date>
  declare expiresAt: CreationOptional<Date | null>
  declare createdFromIp: CreationOptional<string | null>
  declare fingerprint: CreationOptional<string | null>
  declare lastUsedAt: CreationOptional<Date | null>

  /** Check if this session has expired */
  isExpired(): boolean {
    if (this.expiresAt) {
      return new Date() > this.expiresAt
    }
    // Fallback: check createdAt-based expiry for sessions created before migration
    return Date.now() - this.createdAt.getTime() > SESSION_MAX_AGE_MS
  }

  /** Update the last-used timestamp (fire and forget) */
  touch(): void {
    process.nextTick(() => {
      this.update({ lastUsedAt: new Date() }).catch(() => {})
    })
  }

  /**
   * Clean up expired sessions from the database.
   * Should be called periodically (e.g., every hour).
   */
  static async pruneExpired(): Promise<number> {
    const now = new Date()
    const fallbackCutoff = new Date(Date.now() - SESSION_MAX_AGE_MS)

    const deleted = await Session.destroy({
      where: {
        [Op.or]: [
          // Sessions with explicit expiry that have passed
          {
            expiresAt: {
              [Op.not]: null,
              [Op.lt]: now,
            },
          },
          // Sessions without explicit expiry that are older than max age
          {
            expiresAt: null,
            createdAt: { [Op.lt]: fallbackCutoff },
          },
        ],
      },
    })

    if (deleted > 0) {
      console.log(`[security] Pruned ${deleted} expired session(s)`)
    }

    return deleted
  }
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdFromIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    fingerprint: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'session',
    tableName: 'sessions',
    timestamps: true,
    updatedAt: false,
  }
)
