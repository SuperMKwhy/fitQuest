import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// `date` is the ISO instant of the *client's* local midnight (e.g.
// `new Date(2026, 7, 20).toISOString()`), not a bare YYYY-MM-DD — the server
// has no idea what timezone the client is in, so reinterpreting a bare date
// as UTC midnight silently shifts "today" by the client's UTC offset (food
// logged in the evening in UTC+ zones was landing in "yesterday"). Treating
// the client's instant as the literal start of its day sidesteps that.
function dayBounds(dateParam: unknown): { start: Date; end: Date } {
  const start = typeof dateParam === 'string' && dateParam ? new Date(dateParam) : new Date(new Date().toDateString());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function foodLogRoutes(app: FastifyInstance) {
  app.get('/food-log', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { date } = request.query as { date?: string };

    if (date && Number.isNaN(new Date(date).getTime())) {
      return reply.code(400).send({ error: 'date must be a valid ISO date-time string' });
    }
    const { start, end } = dayBounds(date);

    return prisma.foodLog.findMany({
      where: { userId, loggedAt: { gte: start, lt: end } },
      orderBy: { loggedAt: 'asc' },
    });
  });

  app.post('/food-log', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as {
      name?: string;
      mealType?: string;
      calories?: number;
      proteinG?: number;
      carbsG?: number;
      fatG?: number;
      source?: 'manual' | 'scan';
      confidence?: number;
      loggedAt?: string;
    };

    if (!body.name?.trim()) {
      return reply.code(400).send({ error: 'name is required' });
    }
    if (!body.mealType || !MEAL_TYPES.includes(body.mealType)) {
      return reply.code(400).send({ error: `mealType must be one of ${MEAL_TYPES.join(', ')}` });
    }
    if (typeof body.calories !== 'number' || body.calories < 0) {
      return reply.code(400).send({ error: 'calories (kcal) is required' });
    }

    const loggedAt = body.loggedAt ? new Date(body.loggedAt) : new Date();
    if (Number.isNaN(loggedAt.getTime())) {
      return reply.code(400).send({ error: 'loggedAt must be a valid date' });
    }

    const created = await prisma.foodLog.create({
      data: {
        userId,
        name: body.name.trim(),
        mealType: body.mealType,
        calories: Math.round(body.calories),
        proteinG: body.proteinG ?? null,
        carbsG: body.carbsG ?? null,
        fatG: body.fatG ?? null,
        source: body.source === 'scan' ? 'scan' : 'manual',
        confidence: body.confidence ?? null,
        loggedAt,
      },
    });

    return reply.code(201).send(created);
  });
}
