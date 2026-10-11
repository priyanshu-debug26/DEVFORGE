import { DeveloperProblem } from '../types';

export async function fetchHackerNewsProblems(
  query: string = '',
  limit: number = 15
): Promise<DeveloperProblem[]> {
  try {
    const searchQuery = query.trim() || 'problem OR bug OR why is there no OR frustrated OR alternative OR developer tool';
    const encoded = encodeURIComponent(searchQuery);
    const url = `https://hn.algolia.com/api/v1/search?query=${encoded}&tags=(story,ask_hn)&hitsPerPage=${limit}`;

    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      console.warn(`HN Algolia search failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.hits || !Array.isArray(data.hits)) {
      return [];
    }

    return data.hits
      .filter((hit: any) => hit.title && hit.title.trim().length > 10)
      .map((hit: any): DeveloperProblem => {
        const title = hit.title;
        const bodyText = hit.story_text ? hit.story_text.replace(/<[^>]*>?/gm, '').slice(0, 800) : `Discussion thread with ${hit.num_comments || 0} developer responses on Hacker News.`;
        
        return {
          id: `hn_${hit.objectID}`,
          source: 'hackernews',
          sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          sourceId: `hn_${hit.objectID}`,
          title,
          body: bodyText,
          author: hit.author || 'hn_user',
          createdAt: hit.created_at || new Date().toISOString(),
          commentsCount: hit.num_comments || 0,
          upvotesCount: hit.points || 0,
          tags: ['HackerNews', hit._tags?.includes('ask_hn') ? 'Ask HN' : 'Discussion'],
          ecosystem: 'general'
        };
      });
  } catch (err) {
    console.error("Error fetching Hacker News problems:", err);
    return [];
  }
}
