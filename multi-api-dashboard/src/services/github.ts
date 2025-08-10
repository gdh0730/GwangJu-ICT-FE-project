import { httpGet } from '../utils/fetcher';

export type GitHubUser = {
  login: string; avatar_url: string; html_url: string;
  name?: string; followers: number; following: number;
  public_repos: number; public_gists: number; location?: string; blog?: string; company?: string; created_at: string;
};

export type GitHubRepo = {
  id: number; name: string; html_url: string; stargazers_count: number; forks_count: number; watchers_count: number; language: string | null; description: string | null; updated_at: string;
};

export async function getUser(username: string){
  return httpGet<GitHubUser>(`https://api.github.com/users/${encodeURIComponent(username)}`, { cacheKey: `gh:user:${username}` });
}

export async function getRepos(username: string, perPage=12){
  return httpGet<GitHubRepo[]>(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}`, { cacheKey: `gh:repos:${username}:${perPage}` });
}
