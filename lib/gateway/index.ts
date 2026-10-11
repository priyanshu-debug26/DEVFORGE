import { GatewayRequest, GatewayResponse, GatewayTraceStep, ProviderHealth, GatewayProvider } from '../types';
import { callGemini } from './gemini';
import { callGroq } from './groq';
import { callCerebras } from './cerebras';
import { callMock } from './mock';
import { DataStore } from '../store';

export class AiGateway {
  static getProviderStatuses(userKeys?: { geminiKey?: string; groqKey?: string; cerebrasKey?: string }): ProviderHealth[] {
    const geminiKey = userKeys?.geminiKey || process.env.GEMINI_API_KEY;
    const groqKey = userKeys?.groqKey || process.env.GROQ_API_KEY;
    const cerebrasKey = userKeys?.cerebrasKey || process.env.CEREBRAS_API_KEY;

    return [
      {
        provider: 'gemini',
        name: 'Google Gemini',
        configured: !!geminiKey,
        status: geminiKey ? 'online' : 'unconfigured',
        model: 'gemini-1.5-pro / flash',
        lastChecked: new Date().toISOString(),
        supportedModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']
      },
      {
        provider: 'groq',
        name: 'Groq LPU',
        configured: !!groqKey,
        status: groqKey ? 'online' : 'unconfigured',
        model: 'llama-3.3-70b-versatile',
        lastChecked: new Date().toISOString(),
        supportedModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
      },
      {
        provider: 'cerebras',
        name: 'Cerebras Inference',
        configured: !!cerebrasKey,
        status: cerebrasKey ? 'online' : 'unconfigured',
        model: 'llama3.1-70b / 8b',
        lastChecked: new Date().toISOString(),
        supportedModels: ['llama3.1-70b', 'llama3.1-8b']
      },
      {
        provider: 'mock',
        name: 'DEVFORGE Fallback Simulator',
        configured: true,
        status: 'online',
        model: 'devforge-gateway-simulator',
        lastChecked: new Date().toISOString(),
        supportedModels: ['devforge-gateway-simulator']
      }
    ];
  }

  static async generate(req: GatewayRequest): Promise<GatewayResponse> {
    const trace: GatewayTraceStep[] = [];
    const effort = req.effort || 'medium';
    const temperature = req.temperature ?? 0.7;
    const maxTokens = req.maxTokens || 2048;

    // Check user-provided keys or environment keys
    const activeGeminiKey = req.userKeys?.geminiKey || process.env.GEMINI_API_KEY;
    const activeGroqKey = req.userKeys?.groqKey || process.env.GROQ_API_KEY;
    const activeCerebrasKey = req.userKeys?.cerebrasKey || process.env.CEREBRAS_API_KEY;

    // Determine candidate providers sequence
    let candidateProviders: GatewayProvider[] = [];

    if (req.provider && req.provider !== 'auto') {
      candidateProviders = [req.provider];
      if (req.provider !== 'mock') {
        candidateProviders.push('mock');
      }
    } else {
      const configured: GatewayProvider[] = [];
      if (activeGeminiKey) configured.push('gemini');
      if (activeGroqKey) configured.push('groq');
      if (activeCerebrasKey) configured.push('cerebras');

      if (req.preferredProviders && req.preferredProviders.length > 0) {
        for (const p of req.preferredProviders) {
          if (!candidateProviders.includes(p)) candidateProviders.push(p);
        }
      } else {
        if (effort === 'high') {
          if (configured.includes('gemini')) candidateProviders.push('gemini');
          if (configured.includes('groq')) candidateProviders.push('groq');
          if (configured.includes('cerebras')) candidateProviders.push('cerebras');
        } else {
          if (configured.includes('groq')) candidateProviders.push('groq');
          if (configured.includes('gemini')) candidateProviders.push('gemini');
          if (configured.includes('cerebras')) candidateProviders.push('cerebras');
        }
      }

      // Always append fallback simulator so the app never fails
      candidateProviders.push('mock');
    }

    let finalResult: any = null;
    let winningProvider: GatewayProvider = 'mock';
    let failoverOccurred = false;

    for (let i = 0; i < candidateProviders.length; i++) {
      const provider = candidateProviders[i];
      const isSimulatedFail = (i === 0 && !!req.simulateRateLimit);

      try {
        let result;
        if (provider === 'gemini') {
          if (!activeGeminiKey) {
            trace.push({
              provider: 'gemini',
              attemptedAt: new Date().toISOString(),
              status: 'skipped',
              latencyMs: 0,
              error: 'Gemini key not configured (Provide in Settings & Keys)',
              model: 'gemini-1.5-flash'
            });
            continue;
          }
          if (isSimulatedFail) {
            const err: any = new Error("Simulated 429 Rate Limit for Gemini");
            err.isRetryable = true;
            throw err;
          }
          result = await callGemini(req.prompt, req.systemPrompt, effort, maxTokens, temperature, 20000, activeGeminiKey);
        } else if (provider === 'groq') {
          if (!activeGroqKey) {
            trace.push({
              provider: 'groq',
              attemptedAt: new Date().toISOString(),
              status: 'skipped',
              latencyMs: 0,
              error: 'Groq key not configured (Provide in Settings & Keys)',
              model: 'llama-3.3-70b-versatile'
            });
            continue;
          }
          if (isSimulatedFail) {
            const err: any = new Error("Simulated 429 Rate Limit for Groq");
            err.isRetryable = true;
            throw err;
          }
          result = await callGroq(req.prompt, req.systemPrompt, effort, maxTokens, temperature, 20000, activeGroqKey);
        } else if (provider === 'cerebras') {
          if (!activeCerebrasKey) {
            trace.push({
              provider: 'cerebras',
              attemptedAt: new Date().toISOString(),
              status: 'skipped',
              latencyMs: 0,
              error: 'Cerebras key not configured',
              model: 'llama3.1-70b'
            });
            continue;
          }
          if (isSimulatedFail) {
            const err: any = new Error("Simulated 429 Rate Limit for Cerebras");
            err.isRetryable = true;
            throw err;
          }
          result = await callCerebras(req.prompt, req.systemPrompt, effort, maxTokens, temperature, 20000, activeCerebrasKey);
        } else {
          result = await callMock(req.prompt, req.systemPrompt, effort, maxTokens, temperature, 20000, isSimulatedFail);
        }

        trace.push({
          provider,
          attemptedAt: new Date().toISOString(),
          status: 'success',
          latencyMs: result.latencyMs,
          model: result.model
        });

        finalResult = result;
        winningProvider = provider;
        if (i > 0) {
          failoverOccurred = true;
        }
        break;
      } catch (err: any) {
        trace.push({
          provider,
          attemptedAt: new Date().toISOString(),
          status: 'failed',
          latencyMs: 150,
          error: err.message || 'Unknown provider error',
          model: provider
        });

        if (i < candidateProviders.length - 1) {
          failoverOccurred = true;
        }
      }
    }

    if (!finalResult) {
      finalResult = await callMock(req.prompt, req.systemPrompt, effort, maxTokens, temperature);
      winningProvider = 'mock';
      failoverOccurred = true;
    }

    const response: GatewayResponse = {
      success: true,
      content: finalResult.content,
      provider: winningProvider,
      model: finalResult.model,
      latencyMs: finalResult.latencyMs,
      failoverOccurred,
      trace,
      usage: {
        promptTokens: finalResult.promptTokens,
        completionTokens: finalResult.completionTokens,
        totalTokens: finalResult.promptTokens + finalResult.completionTokens
      },
      effort,
      timestamp: new Date().toISOString()
    };

    DataStore.logGatewayRequest({
      provider: winningProvider,
      model: finalResult.model,
      latencyMs: finalResult.latencyMs,
      failoverOccurred,
      totalTokens: response.usage.totalTokens
    });

    return response;
  }
}
