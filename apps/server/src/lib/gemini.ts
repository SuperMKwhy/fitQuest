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

async function callGenerateContent(body: Record<string, unknown>): Promise<string> {
  const apiKey = requireApiKey();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const res = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new GeminiRequestError(`Gemini API request failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!text) {
    throw new GeminiRequestError('Gemini API returned no candidates');
  }
  return text;
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
  const contents = [...history, { role: 'user' as const, text: message }].map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  return callGenerateContent({
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
  });
}

export type FoodAnalysis = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidencePercent: number;
};

const FOOD_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Short dish name, e.g. "Grilled Chicken Salad"' },
    calories: { type: 'number', description: 'Estimated total calories (kcal) for the whole plate/portion shown' },
    proteinG: { type: 'number', description: 'Estimated protein in grams' },
    carbsG: { type: 'number', description: 'Estimated carbohydrates in grams' },
    fatG: { type: 'number', description: 'Estimated fat in grams' },
    confidencePercent: { type: 'number', description: 'Confidence in this estimate, 0-100' },
  },
  required: ['name', 'calories', 'proteinG', 'carbsG', 'fatG', 'confidencePercent'],
};

const FOOD_ANALYSIS_PROMPT = [
  'You are a nutrition estimator for a fitness app. Identify the food/dish in this photo and',
  'estimate its nutrition for the portion actually shown in the image.',
  'If multiple items are visible, treat them as one combined plate/meal.',
  'If the image has no identifiable food, still respond with your best guess and a low confidencePercent.',
].join(' ');

export async function analyzeFoodImage({
  imageBase64,
  mimeType,
}: {
  imageBase64: string;
  mimeType: string;
}): Promise<FoodAnalysis> {
  const text = await callGenerateContent({
    contents: [
      {
        role: 'user',
        parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: FOOD_ANALYSIS_PROMPT }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: 'application/json',
      responseSchema: FOOD_ANALYSIS_SCHEMA,
    },
  });

  let parsed: FoodAnalysis;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiRequestError(`Gemini returned non-JSON food analysis: ${text}`);
  }
  return parsed;
}
