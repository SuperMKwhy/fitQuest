import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function friendsRoutes(app: FastifyInstance) {
  // Stub: returns this user's accepted friendships so the mobile Social
  // screen has something real to call. Sending/accepting requests (the
  // AddFriend/FriendRequest screens in design/) isn't implemented yet —
  // see todo.md.
  app.get('/friends', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { include: { profile: true } },
        addressee: { include: { profile: true } },
      },
    });

    return friendships.map((f) => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        userId: friend.id,
        displayName: friend.profile?.displayName ?? 'Unknown',
        level: friend.profile?.level ?? 1,
      };
    });
  });
}
