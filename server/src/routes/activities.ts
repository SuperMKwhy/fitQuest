import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { applyXpGain, rewardsForActivity } from '../lib/leveling.js';

export async function activityRoutes(app: FastifyInstance) {
  app.post('/activities', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as {
      type?: 'run' | 'quest_game';
      distanceM?: number;
      durationS?: number;
      caloriesKcal?: number;
      score?: number;
    };

    if (body.type !== 'run' && body.type !== 'quest_game') {
      return reply.code(400).send({ error: 'type must be "run" or "quest_game"' });
    }
    if (typeof body.durationS !== 'number' || body.durationS < 0) {
      return reply.code(400).send({ error: 'durationS (seconds) is required' });
    }
    // Narrowing on `body.*` above doesn't survive into the closure passed to
    // prisma.$transaction below (a separate function scope), so bind locals.
    const type = body.type;
    const durationS = body.durationS;
    const distanceM = body.distanceM ?? null;
    const caloriesKcal = body.caloriesKcal ?? null;
    const score = body.score ?? null;

    const { xpEarned, coinsEarned } = rewardsForActivity({ type, distanceM, durationS, score });

    const [activity, profile] = await prisma.$transaction(async (tx) => {
      const created = await tx.activity.create({
        data: {
          userId,
          type,
          distanceM,
          durationS,
          caloriesKcal,
          score,
          xpEarned,
          coinsEarned,
        },
      });

      const current = await tx.profile.findUniqueOrThrow({ where: { userId } });
      const { level, xp } = applyXpGain(current, xpEarned);
      const updated = await tx.profile.update({
        where: { userId },
        data: {
          level,
          xp,
          totalXp: current.totalXp + xpEarned,
          coins: current.coins + coinsEarned,
        },
      });

      return [created, updated];
    });

    return reply.code(201).send({ activity, profile });
  });

  app.get('/activities/me', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });
}
