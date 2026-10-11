import { NextRequest, NextResponse } from 'next/server';
import { AiGateway } from '@/lib/gateway';
import { GatewayRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: GatewayRequest = await req.json();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    const response = await AiGateway.generate(body);
    return NextResponse.json(response);
  } catch (err: any) {
    console.error("AI Gateway generation failure:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process AI gateway request",
        failoverOccurred: true
      },
      { status: 500 }
    );
  }
}
