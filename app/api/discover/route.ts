import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubProblems } from '@/lib/discover/github';
import { fetchHackerNewsProblems } from '@/lib/discover/hackernews';
import { DataStore } from '@/lib/store';
import { DeveloperProblem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const source = searchParams.get('source') || 'all'; // all | github | hackernews
    const tag = searchParams.get('tag') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const tasks: Promise<DeveloperProblem[]>[] = [];

    if (source === 'all' || source === 'github') {
      tasks.push(fetchGitHubProblems(query, tag, Math.ceil(limit / (source === 'all' ? 2 : 1))));
    }
    if (source === 'all' || source === 'hackernews') {
      tasks.push(fetchHackerNewsProblems(query, Math.ceil(limit / (source === 'all' ? 2 : 1))));
    }

    const results = await Promise.all(tasks);
    const combined = results.flat();

    // Deduplication by normalized title or sourceUrl
    const seen = new Set<string>();
    const deduplicated: DeveloperProblem[] = [];

    for (const item of combined) {
      const key = item.sourceUrl.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    // Merge with any pre-existing analyzed problems in local store
    const storedProblems = DataStore.getProblems();
    const finalProblems = deduplicated.map(p => {
      const stored = storedProblems.find(sp => sp.id === p.id || sp.sourceUrl === p.sourceUrl);
      if (stored && stored.analysis) {
        return { ...p, analysis: stored.analysis };
      }
      return p;
    });

    // If external APIs yielded 0 results (e.g. rate limit), fallback gracefully to pre-seeded problems
    if (finalProblems.length === 0) {
      return NextResponse.json({
        success: true,
        problems: storedProblems,
        source: 'cached_store',
        count: storedProblems.length
      });
    }

    return NextResponse.json({
      success: true,
      problems: finalProblems,
      count: finalProblems.length,
      source: 'live_apis'
    });
  } catch (err: any) {
    console.error("Discover API error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to fetch developer problems",
      problems: DataStore.getProblems()
    }, { status: 500 });
  }
}
