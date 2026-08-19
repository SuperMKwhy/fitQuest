import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { ChatTurn, GeminiConfigError, GeminiRequestError, generateReply } from '../lib/gemini.js';

const MAX_HISTORY_TURNS = 20;

function buildSystemInstruction(profile: {
  displayName: string;
  goal: string | null;
  level: number;
}) {
  const goalText = profile.goal ? profile.goal.replace(/_/g, ' ') : 'getting generally healthier';
  return [
    'You are the "AI Buddy" inside FitQuest, a game-like fitness app that turns workouts into RPG quests.',
    `You are chatting with ${profile.displayName}, a level ${profile.level} hero whose goal is ${goalText}.`,
    'Stay upbeat, encouraging, and a little playful, using light RPG language (quests, XP, stats, levels) without overdoing it.',
    'Give practical, safe fitness/nutrition/motivation advice. Keep replies short — 1-3 sentences, chat-style, no markdown.',
  ].join(' ');
}

export async function aiBuddyRoutes(app: FastifyInstance) {
  app.post('/ai-buddy/chat', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as {
      message?: string;
      history?: { sender?: 'user' | 'ai'; text?: string }[];
    };

    const message = body.message?.trim();
    if (!message) {
      return reply.code(400).send({ error: 'message is required' });
    }

    const history: ChatTurn[] = (body.history ?? [])
      .filter((turn) => turn.text && (turn.sender === 'user' || turn.sender === 'ai'))
      .slice(-MAX_HISTORY_TURNS)
      .map((turn) => ({ role: turn.sender === 'user' ? 'user' : 'model', text: turn.text! }));

    const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });

    try {
      const text = await generateReply({
        systemInstruction: buildSystemInstruction(profile),
        history,
        message,
      });
      return { reply: text };
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        app.log.warn(err, 'AI Buddy not configured');
        return reply.code(503).send({ error: 'AI Buddy is not configured yet. Set GEMINI_API_KEY on the server.' });
      }
      if (err instanceof GeminiRequestError) {
        app.log.error(err, 'AI Buddy request failed');
        return reply.code(502).send({ error: 'AI Buddy is unavailable right now. Try again in a moment.' });
      }
      throw err;
    }
  });
}
