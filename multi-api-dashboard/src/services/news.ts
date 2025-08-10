import { httpGet } from '../utils/fetcher';
export type Article = { title: string; url: string; source: { name: string }; publishedAt: string; description: string | null; };
export async function getHeadlines(q='technology'){
  const key = import.meta.env.VITE_NEWS_API_KEY;
  if (!key) throw new Error('NewsAPI 키가 설정되지 않았습니다 (.env 참고)');
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=12&sortBy=publishedAt&language=ko&apiKey=${key}`;
  return httpGet<{ articles: Article[] }>(url, { cacheKey: `news:${q}` });
}
