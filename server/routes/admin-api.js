import { Op, Sequelize } from 'sequelize';
import { fp } from '#shared/utils';
import { buildPrompt, completeAndExtractQuestion } from '#server/utils/memory';
import { sync } from '../sync';
export default async (fastify) => {
    fastify.get('/users', async (req, reply) => {
        const skip = parseInt(req.query.skip) || 0;
        const limit = Math.min(parseInt(req.query.limit) || 100, 250);
        const query = (req.query.query || '').trim();
        const tags = (req.query.tags || '')
            .split(',')
            .map(fp.trim)
            .filter(Boolean);
        let order = ['createdAt', 'ASC'];
        if (req.query.sort === 'newest') {
            order = ['createdAt', 'DESC'];
        }
        else if (req.query.sort === 'last_seen') {
            order = Sequelize.literal(`
          CASE
            WHEN "lastSeenAt" IS NOT NULL THEN "lastSeenAt"
            WHEN "joinedAt" IS NOT NULL THEN "joinedAt"
            ELSE "createdAt" END DESC
        `);
        }
        // const where: WhereOptions<User> = {}
        const where = {};
        if (tags.length) {
            where.tags = { [Op.overlap]: tags };
        }
        if (query) {
            where[Op.or] = [
                {
                    email: {
                        [Op.iLike]: `%${query}%`,
                    },
                },
                {
                    email: {
                        [Op.iLike]: `%${query.replace(/\s/, '')}%`,
                    },
                },
                Sequelize.where(Sequelize.fn('CONCAT', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
                    [Op.iLike]: `%${query}%`,
                }),
            ];
        }
        const { count, rows } = await fastify.models.User.findAndCountAll({
            where,
            order: [order],
            offset: skip,
            limit,
        });
        const result = {
            data: rows,
            total: count,
            skip: parseInt(req.query.skip) || 0,
            limit,
        };
        return result;
    });
    fastify.get('/users/:userId', async (req, reply) => {
        const user = await fastify.models.User.findByPk(req.params.userId);
        return user;
    });
    fastify.post('/live-message', async (req, reply) => {
        const message = req.body.message || '';
        let record = await fastify.models.LiveMessage.findOne();
        if (!record) {
            record = await fastify.models.LiveMessage.create({
                message,
                authorUserId: req.user.id,
            });
        }
        await record.set({ message }).save();
        sync.emit('live_message', { message });
        return reply.ok();
    });
    fastify.put('/users/:userId', async (req, reply) => {
        const user = await fastify.models.User.findByPk(req.params.userId);
        if (!user) {
            return reply.throw.notFound();
        }
        const body = fp.pick(['tags'])(req.body);
        if (!Object.keys(body).length) {
            return reply.throw.badParams();
        }
        await user.set(req.body).save();
        return user;
    });
    fastify.get('/users/:userId/memory-prompt', async (req, reply) => {
        const user = await fastify.models.User.findByPk(req.params.userId);
        if (!user)
            return reply.throw.notFound();
        const logs = await fastify.models.Log.findAll({
            where: {
                userId: user.id,
                // event: {
                //   [Op.in]: [
                //     'settings_change',
                //     'chat_message',
                //     'chat_message_like',
                //     'answer',
                //   ] as LogEvent[],
                // },
            },
            order: [['createdAt', 'DESC']],
            limit: 50,
        });
        return { prompt: await buildPrompt(user, logs) };
    });
    fastify.post('/users/:userId/memory-prompt', async (req, reply) => {
        const user = await fastify.models.User.findByPk(req.params.userId);
        if (!user)
            return reply.throw.notFound();
        return await completeAndExtractQuestion(req.body.prompt);
    });
};
