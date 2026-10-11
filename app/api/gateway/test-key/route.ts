import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gateway/gemini';
import { callGroq } from '@/lib/gateway/groq';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json({ success: false, error: "Please enter an API key first." }, { status: 400 });
    }

    const cleanKey = apiKey.trim();

    if (provider === 'gemini') {
      const res = await callGemini("Hi", undefined, "medium", 10, 0.1, 12000, cleanKey);
      return NextResponse.json({
        success: true,
        provider: 'gemini',
        model: res.model,
        latencyMs: res.latencyMs,
        message: `Verified! Active with model ${res.model} (${res.latencyMs}ms)`
      });
    }

    if (provider === 'groq') {
      const res = await callGroq("Hi", undefined, "medium", 10, 0.1, 12000, cleanKey);
      return NextResponse.json({
        success: true,
        provider: 'groq',
        model: res.model,
        latencyMs: res.latencyMs,
        message: `Verified! Active with model ${res.model} (${res.latencyMs}ms)`
      });
    }

    if (provider === 'github') {
      const ghRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'User-Agent': 'DEVFORGE-Tester'
        }
      });
      if (ghRes.ok) {
        const ghUser = await ghRes.json();
        return NextResponse.json({
          success: true,
          provider: 'github',
          message: `Verified! Authenticated as @${ghUser.login}`
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "GitHub token rejected (Status: " + ghRes.status + ")"
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown provider" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to verify API key"
    }, { status: 400 });
  }
}
