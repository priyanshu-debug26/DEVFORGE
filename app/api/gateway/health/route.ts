import { NextResponse } from 'next/server';
import { AiGateway } from '@/lib/gateway';
import { DataStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statuses = AiGateway.getProviderStatuses();
    const logs = DataStore.getGatewayLogs();

    return NextResponse.json({
      success: true,
      providers: statuses,
      recentRequests: logs.slice(0, 10),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
