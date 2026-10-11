import { GatewayEffort } from '../types';
import { ProviderCallResult } from './gemini';

// Dynamically discover supported models on user's Groq key
async function discoverGroqModel(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      const models = (data.data || []).map((m: any) => m.id);
      if (models.length > 0) {
        // Sort active versatile / llama models first
        models.sort((a: string, b: string) => {
          if (a.includes('3.3-70b') && !b.includes('3.3-70b')) return -1;
          if (!a.includes('3.3-70b') && b.includes('3.3-70b')) return 1;
          if (a.includes('llama') && !b.includes('llama')) return -1;
          if (!a.includes('llama') && b.includes('llama')) return 1;
          return 0;
        });
        return models;
      }
    }
  } catch (err) {
    // Fall back to static list if /models endpoint fails
  }

  return [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];
}

export async function callGroq(
  prompt: string,
  systemPrompt?: string,
  effort: GatewayEffort = 'medium',
  maxTokens: number = 2048,
  temperature: number = 0.7,
  timeoutMs: number = 20000,
  overrideKey?: string
): Promise<ProviderCallResult> {
  const apiKey = overrideKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const candidateModels = await discoverGroqModel(apiKey);

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const startTime = Date.now();
  let lastError: any = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        const status = res.status;
        const err: any = new Error(`Groq API Error (${status}): ${errText.slice(0, 300)}`);
        err.status = status;
        err.isRetryable = status === 429 || status >= 500;
        lastError = err;

        // If decommissioned or 404, try next
        if (status === 404 || status === 400 || errText.includes('decommissioned') || errText.includes('model_not_found') || errText.includes('does not exist')) {
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '';
      const usage = json.usage || {};

      return {
        content: text,
        model,
        latencyMs,
        promptTokens: usage.prompt_tokens || Math.round(prompt.length / 4),
        completionTokens: usage.completion_tokens || Math.round(text.length / 4)
      };
    } catch (err: any) {
      lastError = err;
      if (err.status !== 404 && err.status !== 400 && !err.message?.includes('404') && !err.message?.includes('400')) {
        throw err;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("Failed to connect to any Groq model variant.");
}
