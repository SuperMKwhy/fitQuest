import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { authRoutes } from './routes/auth.js';
import { profileRoutes } from './routes/profile.js';
import { activityRoutes } from './routes/activities.js';
import { leaderboardRoutes } from './routes/leaderboard.js';
import { shopRoutes } from './routes/shop.js';
import { friendsRoutes } from './routes/friends.js';
import { aiBuddyRoutes } from './routes/aiBuddy.js';
import { foodScanRoutes } from './routes/foodScan.js';
import { foodLogRoutes } from './routes/foodLog.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

export function buildApp() {
  // Default 1MB body limit is too small for a base64-encoded food photo.
  const app = Fastify({ logger: true, bodyLimit: 10 * 1024 * 1024 });

  app.register(cors, { origin: true });
  app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-change-me' });

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/health', async () => ({ ok: true }));

  app.register(authRoutes, { prefix: '/auth' });
  app.register(profileRoutes);
  app.register(activityRoutes);
  app.register(leaderboardRoutes);
  app.register(shopRoutes);
  app.register(friendsRoutes);
  app.register(aiBuddyRoutes);
  app.register(foodScanRoutes);
  app.register(foodLogRoutes);

  return app;
}
