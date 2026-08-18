import { FastifyInstance } from 'fastify';
import { GeminiConfigError, GeminiRequestError, analyzeFoodImage } from '../lib/gemini.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function foodScanRoutes(app: FastifyInstance) {
  app.post('/food-scan', { preHandler: app.authenticate }, async (request, reply) => {
    const body = request.body as { imageBase64?: string; mimeType?: string };

    if (!body.imageBase64) {
      return reply.code(400).send({ error: 'imageBase64 is required' });
    }
    const mimeType = body.mimeType || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return reply.code(400).send({ error: `mimeType must be one of ${ALLOWED_MIME_TYPES.join(', ')}` });
    }

    try {
      const analysis = await analyzeFoodImage({ imageBase64: body.imageBase64, mimeType });
      return analysis;
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        app.log.warn(err, 'Food scan not configured');
        return reply.code(503).send({ error: 'Food scan is not configured yet. Set GEMINI_API_KEY on the server.' });
      }
      if (err instanceof GeminiRequestError) {
        app.log.error(err, 'Food scan request failed');
        return reply.code(502).send({ error: "Couldn't analyze that photo. Try again in a moment." });
      }
      throw err;
    }
  });
}
