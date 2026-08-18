// Thin client for the Google AI Studio (Gemini) generateContent REST API.
// https://ai.google.dev/api/generate-content

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export type ChatTurn = { role: 'user' | 'model'; text: string };

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}

function requireApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiConfigError('GEMINI_API_KEY is not set');
  }
  return key;
}

export async function generateReply({
  systemInstruction,
  history,
  message,
}: {
  systemInstruction: string;
  history: ChatTurn[];
  message: string;
}): Promise<string> {
  const apiKey = requireApiKey();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const contents = [...history, { role: 'user' as const, text: message }].map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  const res = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 256,
        // gemini-2.5-flash "thinks" before answering by default, and thinking
        // tokens count against maxOutputTokens — for these short chat replies
        // we want the whole budget spent on the visible answer.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new GeminiRequestError(`Gemini API request failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!reply) {
    throw new GeminiRequestError('Gemini API returned no candidates');
  }
  return reply;
}
