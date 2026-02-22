const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!key || key === 'your-openrouter-api-key-here') {
    throw new Error('OpenRouter API key not configured. Set EXPO_PUBLIC_OPENROUTER_API_KEY in .env');
  }
  return key;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function chatCompletion(
  messages: ChatMessage[],
  model = 'google/gemini-3-flash-preview',
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://droplett.app',
      'X-Title': 'Droplett Dream Journal',
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

export async function interpretDream(dreamContent: string): Promise<string> {
  return chatCompletion([
    {
      role: 'system',
      content: `You are an incisive dream analyst trained in Jungian depth psychology. You give readings that feel personal and uncomfortably accurate. Respond in JSON format with this structure:
{
  "symbols": [{"name": "symbol name", "meaning": "what it represents"}],
  "hiddenPatterns": "cross-dream pattern analysis",
  "emotionalLandscape": "emotional tone and what it reveals",
  "practicalInsights": "what the dreamer's mind is processing"
}
Rules:
- Name symbols after specific elements from the dream, not abstract concepts.
- If someone is chasing or being chased, call it out directly.
- If water appears, determine if it represents overwhelm or escape based on context.
- NEVER use hedging like "may represent" or "could symbolize". Be direct.
- 3-5 symbols max. Each must reference something specific from the dream.`,
    },
    {
      role: 'user',
      content: `Interpret this dream:\n\n${dreamContent}`,
    },
  ]);
}

export async function generateImagePrompt(dreamContent: string): Promise<string> {
  return chatCompletion([
    {
      role: 'system',
      content: 'You are a surrealist dream visualization artist. Given a dream description, create a vivid image prompt that captures the emotional core. 2-3 sentences. Match composition to emotion: chasing = diagonal motion blur and vanishing points; water = fluid dissolving edges; nostalgia = warm amber soft focus; anxiety = harsh shadows. Use surreal art direction with impossible architecture and scale distortions. Lighting reflects emotion. Never include text or reference the dreamer.',
    },
    {
      role: 'user',
      content: `Create an image prompt for this dream:\n\n${dreamContent}`,
    },
  ]);
}
