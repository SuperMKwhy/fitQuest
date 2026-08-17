import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function leaderboardRoutes(app: FastifyInstance) {
  // Global XP ranking — matches design/Leaderboard.html's "GLOBAL" tab.
  // A "FRIENDS" filter can be added once friend requests are implemented
  // (see todo.md); for now this always returns the global top 20.
  app.get('/leaderboard', { preHandler: app.authenticate }, async () => {
    const profiles = await prisma.profile.findMany({
      orderBy: { totalXp: 'desc' },
      take: 20,
      select: { userId: true, displayName: true, level: true, totalXp: true },
    });
    return profiles.map((p, i) => ({ rank: i + 1, ...p }));
  });
}
