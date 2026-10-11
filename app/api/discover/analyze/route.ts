import { NextRequest, NextResponse } from 'next/server';
import { analyzeProblemWithAI } from '@/lib/discover/analyzer';
import { DataStore } from '@/lib/store';
import { DeveloperProblem, UserApiKeys } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const problem: DeveloperProblem = body.problem;
    const preferredProvider = body.preferredProvider;
    const userKeys: UserApiKeys = body.userKeys;

    if (!problem || !problem.title) {
      return NextResponse.json({ success: false, error: "Invalid problem payload" }, { status: 400 });
    }

    const analysis = await analyzeProblemWithAI(problem, preferredProvider, userKeys);
    const updatedProblem: DeveloperProblem = {
      ...problem,
      analysis
    };

    DataStore.saveProblem(updatedProblem);

    return NextResponse.json({
      success: true,
      problem: updatedProblem,
      analysis
    });
  } catch (err: any) {
    console.error("Problem analysis error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Problem analysis failed"
    }, { status: 500 });
  }
}
