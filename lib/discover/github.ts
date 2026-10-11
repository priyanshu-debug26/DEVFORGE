import { DeveloperProblem } from '../types';

export async function fetchGitHubProblems(
  query: string = '',
  tag: string = '',
  limit: number = 15
): Promise<DeveloperProblem[]> {
  try {
    let q = 'is:issue is:open';

    if (tag && tag !== 'all') {
      q += ` label:${tag}`;
    }

    if (query.trim()) {
      // Remove any dangerous characters and append
      const sanitized = query.trim().replace(/[^\w\s\-\.]/gi, ' ');
      q += ` ${sanitized}`;
    } else {
      q += ' bug';
    }

    const encodedQ = encodeURIComponent(q.trim());
    const url = `https://api.github.com/search/issues?q=${encodedQ}&sort=comments&order=desc&per_page=${limit}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DEVFORGE-Agent/1.0',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, { headers, next: { revalidate: 60 } });

    if (!res.ok) {
      console.warn(`GitHub API search failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any): DeveloperProblem => {
      const labels = (item.labels || []).map((l: any) => typeof l === 'string' ? l : l.name);
      const repoUrl = item.repository_url || '';
      const repoParts = repoUrl.split('/');
      const repoName = repoParts.length >= 2 ? `${repoParts[repoParts.length - 2]}/${repoParts[repoParts.length - 1]}` : 'github/repo';

      return {
        id: `gh_${item.id}`,
        source: 'github',
        sourceUrl: item.html_url,
        sourceId: `${repoName}#${item.number}`,
        title: item.title,
        body: item.body ? item.body.slice(0, 800) : 'No description provided.',
        author: item.user?.login || 'unknown',
        createdAt: item.created_at,
        commentsCount: item.comments || 0,
        upvotesCount: item.reactions?.['+1'] || item.reactions?.total_count || item.comments || 0,
        tags: labels.slice(0, 4),
        ecosystem: detectEcosystem(item.title + ' ' + (item.body || '')),
      };
    });
  } catch (err) {
    console.error("Error fetching GitHub issues:", err);
    return [];
  }
}

function detectEcosystem(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('npm') || lower.includes('node') || lower.includes('react') || lower.includes('next.js') || lower.includes('typescript')) return 'npm';
  if (lower.includes('pypi') || lower.includes('python') || lower.includes('pip') || lower.includes('django') || lower.includes('fastapi')) return 'pypi';
  if (lower.includes('go') || lower.includes('golang') || lower.includes('k8s') || lower.includes('kubernetes')) return 'go';
  if (lower.includes('cargo') || lower.includes('rust')) return 'cargo';
  return 'general';
}
