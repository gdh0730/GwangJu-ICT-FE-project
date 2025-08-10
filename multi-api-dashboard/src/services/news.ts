import { httpGet } from '../utils/fetcher';
export type Article = { title: string; url: string; source: { name: string }; publishedAt: string; description: string | null; };

export async function getHeadlines(q:string, lang='ko', sortBy:'publishedAt'|'popularity'='publishedAt', from?:string, to?:string){
  const key = import.meta.env.VITE_NEWS_API_KEY;
  if (!key) throw new Error('NewsAPI 키가 설정되지 않았습니다 (.env 참고)');
  const params = new URLSearchParams({
    q, language: lang, sortBy, pageSize: '24'
  });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const url = `https://newsapi.org/v2/everything?${params.toString()}&apiKey=${key}`;
  return httpGet<{ articles: Article[] }>(url, { cacheKey: `news:${q}:${lang}:${sortBy}:${from ?? ''}:${to ?? ''}` });
}
