import { NextRequest, NextResponse } from 'next/server';
import { runRepositorySecurityScan } from '@/lib/security/scanner';
import { DataStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: "Repository URL is required." },
        { status: 400 }
      );
    }

    const scanResult = await runRepositorySecurityScan(repoUrl);
    return NextResponse.json({
      success: true,
      scan: scanResult
    });
  } catch (err: any) {
    console.error("Repository scan error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to complete security scan."
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const scans = DataStore.getScans();
    return NextResponse.json({
      success: true,
      scans
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
