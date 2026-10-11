import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_LOCAL_PATH = path.join(process.cwd(), '.env.local');

export const dynamic = 'force-dynamic';

function maskKey(key: string | undefined): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

export async function GET() {
  return NextResponse.json({
    gemini: {
      configured: !!process.env.GEMINI_API_KEY,
      masked: maskKey(process.env.GEMINI_API_KEY)
    },
    groq: {
      configured: !!process.env.GROQ_API_KEY,
      masked: maskKey(process.env.GROQ_API_KEY)
    },
    cerebras: {
      configured: !!process.env.CEREBRAS_API_KEY,
      masked: maskKey(process.env.CEREBRAS_API_KEY)
    },
    github: {
      configured: !!process.env.GITHUB_TOKEN,
      masked: maskKey(process.env.GITHUB_TOKEN)
    },
    supabase: {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geminiKey, groqKey, cerebrasKey, githubToken, supabaseUrl, supabaseKey } = body;

    let envContent = '';
    if (fs.existsSync(ENV_LOCAL_PATH)) {
      envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf-8');
    }

    const updates: Record<string, string | undefined> = {
      GEMINI_API_KEY: geminiKey?.trim(),
      GROQ_API_KEY: groqKey?.trim(),
      CEREBRAS_API_KEY: cerebrasKey?.trim(),
      GITHUB_TOKEN: githubToken?.trim(),
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl?.trim(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey?.trim()
    };

    const lines = envContent ? envContent.split('\n') : [];
    const updatedKeys = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const keyName = line.slice(0, equalIndex).trim();
        if (updates[keyName] !== undefined && updates[keyName] !== '') {
          lines[i] = `${keyName}=${updates[keyName]}`;
          process.env[keyName] = updates[keyName];
          updatedKeys.add(keyName);
        }
      }
    }

    // Add any keys not yet in the file
    for (const [keyName, value] of Object.entries(updates)) {
      if (value && !updatedKeys.has(keyName)) {
        lines.push(`${keyName}=${value}`);
        process.env[keyName] = value;
      }
    }

    fs.writeFileSync(ENV_LOCAL_PATH, lines.join('\n'), 'utf-8');

    return NextResponse.json({
      success: true,
      message: "API keys saved to .env.local and loaded into live runtime!"
    });
  } catch (err: any) {
    console.error("Error saving keys:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
