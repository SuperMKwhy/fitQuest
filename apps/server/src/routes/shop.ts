import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function shopRoutes(app: FastifyInstance) {
  // Read-only for now — see design.md's Shop.html audit and todo.md for the
  // purchase flow (deduct coins/gems, add to an inventory table).
  app.get('/shop/items', { preHandler: app.authenticate }, async () => {
    return prisma.shopItem.findMany({ orderBy: { category: 'asc' } });
  });
}
