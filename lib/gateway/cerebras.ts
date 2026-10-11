import { GatewayEffort } from '../types';
import { ProviderCallResult } from './gemini';

export async function callCerebras(
  prompt: string,
  systemPrompt?: string,
  effort: GatewayEffort = 'medium',
  maxTokens: number = 2048,
  temperature: number = 0.7,
  timeoutMs: number = 20000,
  overrideKey?: string
): Promise<ProviderCallResult> {
  const apiKey = overrideKey || process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    throw new Error("CEREBRAS_API_KEY is not configured on the server.");
  }

  const model = effort === 'low' ? 'llama3.1-8b' : 'llama3.1-70b';

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = Date.now();

  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
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
      const isRetryable = status === 429 || status >= 500;
      const err: any = new Error(`Cerebras API Error (${status}): ${errText.slice(0, 300)}`);
      err.isRetryable = isRetryable;
      err.status = status;
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
  } finally {
    clearTimeout(timer);
  }
}
