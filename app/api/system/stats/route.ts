import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/store';
import { AiGateway } from '@/lib/gateway';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statuses = AiGateway.getProviderStatuses();
    const stats = DataStore.getSystemStats(statuses);
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
