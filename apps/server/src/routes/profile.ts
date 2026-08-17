import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

const EDITABLE_FIELDS = ['goal', 'heightCm', 'weightKg', 'hairStyle', 'skinTone', 'displayName'] as const;

export async function profileRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    return prisma.profile.findUniqueOrThrow({ where: { userId } });
  });

  app.patch('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as Record<string, unknown>;

    const data: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.completeOnboarding === true) {
      data.onboardingCompletedAt = new Date();
    }

    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ error: 'No editable fields provided' });
    }

    return prisma.profile.update({ where: { userId }, data });
  });
}
