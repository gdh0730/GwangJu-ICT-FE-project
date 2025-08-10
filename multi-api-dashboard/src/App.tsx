import { useEffect, useMemo, useState } from 'react';
import Card from './components/Card';
import Header from './components/Header';
import Loader from './components/Loader';
import SearchBar from './components/SearchBar';
import Stat from './components/Stat';
import Tabs from './components/Tabs';
import Toast from './components/Toast';
import useLocalStorage from './hooks/useLocalStorage';
import { getRepos, getUser, GitHubRepo, GitHubUser } from './services/github';
import { Article, getHeadlines } from './services/news';
import { geocode, getWeather } from './services/weather';
import { downloadCSV } from './utils/csv';

type TabKey = 'github' | 'weather' | 'news';

export default function App(){
  const [theme, setTheme] = useLocalStorage<'dark'|'light'>('theme','dark');
  useEffect(()=>{
    if (theme==='light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
  },[theme]);

  const [tab, setTab] = useLocalStorage<TabKey>('tab','github');

  return (
    <>
      <Header onToggleTheme={()=>setTheme(theme==='dark'?'light':'dark')} />
      <Tabs active={tab} onChange={setTab} />
      <div className="container panel">
        {tab==='github' && <GitHubPanel />}
        {tab==='weather' && <WeatherPanel />}
        {tab==='news' && <NewsPanel />}
      </div>
      <footer>© {new Date().getFullYear()} Multi-API Dashboard</footer>
    </>
  );
}

/* ---------------- GitHub ---------------- */

function GitHubPanel(){
  const [q,setQ] = useLocalStorage('gh:q','');
  const [user,setUser] = useState<GitHubUser|null>(null);
  const [repos,setRepos] = useState<GitHubRepo[]|null>(null);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState<string|null>(null);
  const [sort,setSort] = useLocalStorage<'stars'|'updated'>('gh:sort','updated');

  const sorted = useMemo(()=>{
    if(!repos) return [];
    const arr = [...repos];
    if (sort==='stars') arr.sort((a,b)=>b.stargazers_count-a.stargazers_count);
    else arr.sort((a,b)=>+new Date(b.updated_at)-(+new Date(a.updated_at)));
    return arr;
  },[repos,sort]);

  async function search(){
    if(!q.trim()) return;
    setLoading(true); setErr(null);
    try{
      const [u, r] = await Promise.all([ getUser(q.trim()), getRepos(q.trim(), 30) ]);
      setUser(u); setRepos(r);
    }catch(e:any){ setErr(e.message || '오류가 발생했습니다'); setUser(null); setRepos(null); }
    finally{ setLoading(false); }
  }

  return (
    <>
      <SearchBar
        placeholder="GitHub 사용자명을 입력하고 Enter"
        value={q} onChange={setQ} onSubmit={search}
        rightSlot={
          <div className="card" style={{width:260}}>
            <select className="select" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
              <option value="updated">최근 업데이트순</option>
              <option value="stars">Star 많은순</option>
            </select>
          </div>
        }
      />
      {err && <Toast message={err} type="error" />}
      {loading && <Loader />}
      {user && (
        <div className="row">
          <Card>
            <div style={{display:'flex', gap:14}}>
              <img src={user.avatar_url} width={92} height={92} style={{borderRadius:12}} />
              <div style={{flex:1}}>
                <h3 style={{margin:'4px 0 10px'}}>{user.name || user.login}</h3>
                <div className="badge">Public Repos {user.public_repos}</div>{' '}
                <div className="badge">Followers {user.followers}</div>{' '}
                <div className="badge">Following {user.following}</div>
                <div style={{marginTop:10}} className="grid">
                  <Stat k="Company" v={user.company || '-'} />
                  <Stat k="Location" v={user.location || '-'} />
                  <Stat k="Blog" v={user.blog ? <a href={user.blog} target="_blank">{user.blog}</a> : '-'} />
                  <Stat k="Member Since" v={new Date(user.created_at).toLocaleDateString()} />
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{margin:0}}>Repositories</h3>
              {repos && repos.length>0 && (
                <button className="btn" onClick={()=>downloadCSV(
                  repos.map(r=>({
                    name: r.name, stars: r.stargazers_count, forks: r.forks_count, watchers: r.watchers_count, language: r.language, updated_at: r.updated_at, url: r.html_url
                  })), `${user!.login}-repos.csv`)}>CSV 내보내기</button>
              )}
            </div>
            <div className="grid" style={{marginTop:12}}>
              {sorted.map(repo=>(
                <div key={repo.id} className="card" style={{borderRadius:10}}>
                  <div style={{fontWeight:600, marginBottom:6}}>
                    <a href={repo.html_url} target="_blank" style={{color:'inherit'}}>{repo.name}</a>
                  </div>
                  <div style={{color:'var(--muted)', marginBottom:8}}>{repo.description || '—'}</div>
                  <div className="row" style={{gap:8}}>
                    <div className="badge">⭐ {repo.stargazers_count}</div>
                    <div className="badge">🍴 {repo.forks_count}</div>
                    <div className="badge">👀 {repo.watchers_count}</div>
                    {repo.language && <div className="badge">{repo.language}</div>}
                    <div style={{marginLeft:'auto', color:'var(--muted)'}}>{new Date(repo.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

/* ---------------- Weather ---------------- */

function WeatherPanel(){
  const [city,setCity] = useLocalStorage('wx:city','Seoul');
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState<string|null>(null);
  const [data,setData] = useState<{name:string; country:string; temp?:number; wind?:number; hourly?: { t: string[]; v: number[] } }|null>(null);

  async function search(){
    if(!city.trim()) return;
    setLoading(true); setErr(null);
    try{
      const place = await geocode(city.trim());
      const wx = await getWeather(place.latitude, place.longitude);
      setData({
        name: place.name, country: place.country,
        temp: wx.current?.temperature_2m, wind: wx.current?.wind_speed_10m,
        hourly: wx.hourly ? { t: wx.hourly.time.slice(0,12), v: wx.hourly.temperature_2m.slice(0,12) } : undefined
      });
    }catch(e:any){ setErr(e.message || '오류가 발생했습니다'); setData(null); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ search(); /* 초기 1회 */ },[]);

  return (
    <>
      <SearchBar placeholder="도시 이름을 입력하세요 (예: Seoul, Tokyo)"
        value={city} onChange={setCity} onSubmit={search}
        rightSlot={<div className="card" style={{width:260, alignSelf:'stretch', display:'grid', placeItems:'center'}}>Open-Meteo 무료 API</div>}
      />
      {err && <Toast message={err} type="error" />}
      {loading && <Loader />}
      {data && (
        <div className="row">
          <Card>
            <h3 style={{marginTop:0}}>{data.name}, {data.country}</h3>
            <div className="grid" style={{marginTop:10}}>
              <Stat k="현재 기온" v={`${data.temp ?? '–'} °C`} />
              <Stat k="풍속" v={`${data.wind ?? '–'} m/s`} />
            </div>
          </Card>
          {data.hourly && (
            <Card>
              <h3 style={{marginTop:0}}>12시간 기온</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:8, marginTop:10}}>
                {data.hourly.t.map((t,i)=>(
                  <div key={t} className="card" style={{padding:10, textAlign:'center'}}>
                    <div style={{color:'var(--muted)', fontSize:12}}>{new Date(t).getHours()}시</div>
                    <div style={{fontWeight:700}}>{data.hourly!.v[i]}°</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

/* ---------------- News ---------------- */

function NewsPanel(){
  const [q,setQ] = useLocalStorage('news:q','기술');
  const [arts,setArts] = useState<Article[]|null>(null);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState<string|null>(null);

  async function search(){
    setLoading(true); setErr(null);
    try{
      const r = await getHeadlines(q.trim() || 'technology');
      setArts(r.articles);
    }catch(e:any){ setErr(e.message || '오류'); setArts(null); }
    finally{ setLoading(false); }
  }

  return (
    <>
      <SearchBar placeholder="뉴스 키워드 (예: 인공지능)" value={q} onChange={setQ} onSubmit={search}
        rightSlot={<div className="card" style={{width:260}}>NewsAPI 키 필요 (.env 참고)</div>}
      />
      {err && <Toast message={err} type="error" />}
      {loading && <Loader />}
      {arts && (
        <div className="grid">
          {arts.map((a, i)=>(
            <div key={i} className="card">
              <div style={{fontWeight:600, marginBottom:6}}><a href={a.url} target="_blank" style={{color:'inherit'}}>{a.title}</a></div>
              <div style={{color:'var(--muted)', marginBottom:8}}>{a.source?.name} · {new Date(a.publishedAt).toLocaleString()}</div>
              <div>{a.description}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
