import { GatewayEffort } from '../types';

export interface ProviderCallResult {
  content: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
}

// Dynamically discover supported models on user's API key
async function discoverGeminiModel(apiKey: string, effort: GatewayEffort): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace(/^models\//, ''));

      if (models.length > 0) {
        if (effort === 'high') {
          // Sort pro models first
          models.sort((a: string, b: string) => {
            if (a.includes('pro') && !b.includes('pro')) return -1;
            if (!a.includes('pro') && b.includes('pro')) return 1;
            return 0;
          });
        } else {
          // Sort flash models first
          models.sort((a: string, b: string) => {
            if (a.includes('flash') && !b.includes('flash')) return -1;
            if (!a.includes('flash') && b.includes('flash')) return 1;
            return 0;
          });
        }
        return models;
      }
    }
  } catch (err) {
    // Fall back to static list if ListModels fails
  }

  return effort === 'high'
    ? ['gemini-1.5-pro-latest', 'gemini-2.0-flash', 'gemini-pro', 'gemini-1.5-flash-latest']
    : ['gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro', 'gemini-1.5-flash-002'];
}

export async function callGemini(
  prompt: string,
  systemPrompt?: string,
  effort: GatewayEffort = 'medium',
  maxTokens: number = 2048,
  temperature: number = 0.7,
  timeoutMs: number = 20000,
  overrideKey?: string
): Promise<ProviderCallResult> {
  const apiKey = overrideKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const candidateModels = await discoverGeminiModel(apiKey, effort);

  const contents: any[] = [];
  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser Request: ${prompt}` }]
    });
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
  }

  const payload = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    }
  };

  const startTime = Date.now();
  let lastError: any = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        const status = res.status;
        const err: any = new Error(`Gemini API Error (${status}): ${errText.slice(0, 300)}`);
        err.status = status;
        err.isRetryable = status === 429 || status >= 500;
        lastError = err;

        // If 404 model not found or decommissioned, try next
        if (status === 404 || errText.includes('NOT_FOUND') || errText.includes('is not found') || status === 400) {
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const candidate = json.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
      const usage = json.usageMetadata || {};

      return {
        content: text,
        model,
        latencyMs,
        promptTokens: usage.promptTokenCount || Math.round(prompt.length / 4),
        completionTokens: usage.candidatesTokenCount || Math.round(text.length / 4)
      };
    } catch (err: any) {
      lastError = err;
      if (err.status !== 404 && !err.message?.includes('404') && !err.message?.includes('400')) {
        throw err;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("Failed to connect to any Gemini model variant.");
}
