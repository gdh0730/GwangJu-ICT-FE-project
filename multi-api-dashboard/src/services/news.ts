// src/services/news.ts
// Hacker News Algolia API 기반 – API Key 필요 없음.

export type Article = {
  title: string;
  description?: string;
  url: string;
  source?: { name?: string };
  publishedAt: string;      // ISO
};

// 날짜(YYYY-MM-DD) → unix(sec)
function toUnix(d?: string) {
  if (!d) return undefined;
  const t = Date.parse(d);
  return Number.isFinite(t) ? Math.floor(t / 1000) : undefined;
}

/**
 * 키워드/정렬/기간으로 뉴스 검색.
 * - lang 파라미터는 형태만 유지(미사용) → App 코드 변경 없이 대체 가능.
 * - sortBy: 'publishedAt' | 'popularity'
 * - from/to: 'YYYY-MM-DD'
 */
export async function getHeadlines(
  q: string,
  _lang = 'en',                       // 미사용(시그니처 유지)
  sortBy: 'publishedAt' | 'popularity' = 'publishedAt',
  from?: string,
  to?: string
): Promise<{ totalResults: number; articles: Article[] }> {

  const byDate = sortBy === 'publishedAt';
  const base = byDate
    ? 'https://hn.algolia.com/api/v1/search_by_date'
    : 'https://hn.algolia.com/api/v1/search';

  const params = new URLSearchParams({
    query: q || 'technology',
    tags: 'story',                   // 기사만
    hitsPerPage: '20',
  });

  // 기간 필터(생성시각 unix)
  const gte = toUnix(from);
  const lte = toUnix(to);
  if (gte || lte) {
    const filters = [
      gte ? `created_at_i>=${gte}` : null,
      lte ? `created_at_i<=${lte}` : null,
    ].filter(Boolean).join(',');
    if (filters) params.set('numericFilters', filters);
  }

  const url = `${base}?${params.toString()}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HN API ${r.status}`);
  const j = await r.json();

  // HN → 우리 Article 형태로 매핑
  const articles: Article[] = (j.hits || []).map((h: any) => ({
    title: h.title || h.story_title || '(no title)',
    description: h._highlightResult?.title?.value?.replace(/<[^>]+>/g, '') || '',
    url: h.url || h.story_url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    source: { name: 'Hacker News' },
    publishedAt: h.created_at,
  }));

  return { totalResults: j.nbHits ?? articles.length, articles };
}
