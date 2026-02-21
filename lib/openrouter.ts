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
  model = 'anthropic/claude-sonnet-4-5-20250929',
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
      content: `You are a dream interpretation expert combining Jungian psychology, modern neuroscience, and symbolic analysis. Respond in JSON format with this structure:
{
  "symbols": [{"name": "symbol name", "meaning": "what it represents"}],
  "hiddenPatterns": "cross-dream pattern analysis",
  "emotionalLandscape": "emotional tone and what it reveals",
  "practicalInsights": "what the dreamer's mind is processing"
}
Keep each section concise but insightful. 3-5 symbols max.`,
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
      content: 'You are a dream visualization artist. Given a dream description, create a vivid image generation prompt that captures the dream\'s essence, mood, and key visual elements. The prompt should be suitable for an AI image generator. Keep it to 2-3 sentences. Focus on atmosphere, lighting, colors, and composition.',
    },
    {
      role: 'user',
      content: `Create an image prompt for this dream:\n\n${dreamContent}`,
    },
  ]);
}
