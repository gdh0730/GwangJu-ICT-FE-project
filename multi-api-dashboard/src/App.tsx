import { useEffect, useMemo, useState } from 'react';
import Card from './components/Card';
import Header from './components/Header';
import Stat from './components/Stat';
import Tabs from './components/Tabs';
import Toast from './components/Toast';
import useLocalStorage from './hooks/useLocalStorage';
import { collectLanguages, getRepos, getUser, GitHubRepo, GitHubUser } from './services/github';
import { Article, getHeadlines } from './services/news';
import { codeToIcon, geocodeMany, getWeather, WeatherResp } from './services/weather';
import { downloadCSV } from './utils/csv';

type TabKey = 'github' | 'weather' | 'news';

export default function App() {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
  }, [theme]);

  const [tab, setTab] = useLocalStorage<TabKey>('tab', 'github');

  return (
    <>
      <Header onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <Tabs active={tab} onChange={setTab} />
      <div className="container panel">
        {tab === 'github' && <GitHubPanel />}
        {tab === 'weather' && <WeatherPanel />}
        {tab === 'news' && <NewsPanel />}
      </div>
      <footer>© {new Date().getFullYear()} Multi-API Dashboard</footer>
    </>
  );
}

/* ---------------- GitHub ---------------- */

function GitHubPanel() {
  const [q, setQ] = useLocalStorage('gh:q', 'vercel');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 고도화 옵션
  const [sort, setSort] = useLocalStorage<'updated' | 'stars' | 'forks'>('gh:sort', 'updated');
  const [lang, setLang] = useLocalStorage<string>('gh:lang', 'all');
  const [query, setQuery] = useLocalStorage('gh:repoQuery', '');

  async function search() {
    if (!q.trim()) return;
    setLoading(true); setErr(null);
    try {
      const [u, r] = await Promise.all([getUser(q.trim()), getRepos(q.trim(), 100)]);
      setUser(u); setRepos(r);
    } catch (e: any) { setErr(e.message || '오류'); setUser(null); setRepos(null); }
    finally { setLoading(false); }
  }
  useEffect(() => { search(); }, []);

  const langs = useMemo(() => repos ? ['all', ...collectLanguages(repos)] : ['all'], [repos]);

  const filteredSorted = useMemo(() => {
    let arr = repos ? [...repos] : [];
    if (lang !== 'all') arr = arr.filter(r => r.language === lang);
    if (query.trim()) {
      const t = query.trim().toLowerCase();
      arr = arr.filter(r => r.name.toLowerCase().includes(t) || (r.description ?? '').toLowerCase().includes(t));
    }
    switch (sort) {
      case 'stars': arr.sort((a, b) => b.stargazers_count - a.stargazers_count); break;
      case 'forks': arr.sort((a, b) => b.forks_count - a.forks_count); break;
      default: arr.sort((a, b) => +new Date(b.updated_at) - (+new Date(a.updated_at)));
    }
    return arr;
  }, [repos, sort, lang, query]);

  return (
    <>
      <div className="controls-row">
        <div className="card control" style={{ flex: '1 1 380px' }}>
          <div className="icon-input">
            <span className="ic">🔍</span>
            <input className="input" placeholder="사용자 검색 (예: vercel)" value={q}
              onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search(); }} />
          </div>
        </div>
        <div className="card control" style={{ width: 220 }}>
          <select className="select" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="updated">마지막 업데이트순</option>
            <option value="stars">Stars 많은순</option>
            <option value="forks">Forks 많은순</option>
          </select>
        </div>
        <div className="card control" style={{ width: 180 }}>
          <select className="select" value={lang} onChange={e => setLang(e.target.value)}>
            {langs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {err && <Toast message={err} type="error" />}
      {loading && (
        <div className="grid" style={{ marginTop: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skel" style={{ height: 120 }} />
          ))}
        </div>
      )}

      {user && (
        <div className="row">
          <Card>
            <div style={{ display: 'flex', gap: 14 }}>
              <img src={user.avatar_url} width={80} height={80} style={{ borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '6px 0 8px' }}>{user.name || user.login}</h3>
                <div className="pills" style={{ marginBottom: 8 }}>
                  <span className="pill">Public Repos {user.public_repos}</span>
                  <span className="pill">Followers {user.followers}</span>
                  <span className="pill">Following {user.following}</span>
                </div>
                <div className="grid">
                  <Stat k="Company" v={user.company || '-'} />
                  <Stat k="Location" v={<b>{user.location || '-'}</b>} />
                  <Stat k="Blog" v={user.blog ? <a href={user.blog} target="_blank">{user.blog}</a> : '-'} />
                  <Stat k="Member Since" v={new Date(user.created_at).toLocaleDateString()} />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="section">
              <div className="section-title">Repositories</div>
              {repos && repos.length > 0 && (
                <button className="btn" onClick={() => downloadCSV(
                  filteredSorted.map(r => ({ name: r.name, stars: r.stargazers_count, forks: r.forks_count, watchers: r.watchers_count, language: r.language, updated_at: r.updated_at, url: r.html_url })),
                  `${user!.login}-repos.csv`
                )}>CSV 내보내기</button>
              )}
            </div>
            <div className="divider"></div>

            <div className="list">
              {filteredSorted.map(repo => (
                <div key={repo.id} className="list-item">
                  <div>
                    <div className="title">
                      <a href={repo.html_url} target="_blank" style={{ color: 'inherit' }}>{repo.name}</a>
                    </div>
                    <div className="desc">{repo.description || '—'}</div>
                    <div className="meta">
                      <span className="pill">⭐ {repo.stargazers_count}</span>
                      <span className="pill">🍴 {repo.forks_count}</span>
                      <span className="pill">👀 {repo.watchers_count}</span>
                      {repo.language && <span className="pill ghost">{repo.language}</span>}
                    </div>
                  </div>
                  <div className="side">{new Date(repo.updated_at).toLocaleDateString()}</div>
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
function WeatherPanel() {
  const [city, setCity] = useLocalStorage('wx:city', 'Seoul');
  const [unit, setUnit] = useLocalStorage<'c' | 'f'>('wx:unit', 'c');
  const [choices, setChoices] = useState<{ name: string; country: string; latitude: number; longitude: number }[]>([]);
  const [sel, setSel] = useLocalStorage('wx:sel', ''); // "lat,lon"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{ name: string; country: string; temp?: number; wind?: number; days?: { date: string; tmax: number; tmin: number }[] } | null>(null);
  const [wx, setWx] = useState<WeatherResp | null>(null);

  async function search() {
    if (!city.trim()) return;
    setErr(null); setLoading(true);
    try {
      const r = await geocodeMany(city.trim());
      const list = r.results ?? [];
      setChoices(list);
      if (list.length) {
        const pick = list[0];
        const key = `${pick.latitude},${pick.longitude}`;
        setSel(key);
        await fetchWx(pick.latitude, pick.longitude, pick.name, pick.country);
      } else {
        setData(null);
      }
    } catch (e: any) { setErr(e.message || '오류'); }
    finally { setLoading(false); }
  }

  async function fetchWx(lat: number, lon: number, name: string, country: string) {
    const resp = await getWeather(lat, lon, unit);
    setWx(resp);
    setData({
      name, country,
      temp: resp.current?.temperature_2m,
      wind: resp.current?.wind_speed_10m,
      days: resp.daily ? resp.daily.time.map((d, i) => ({
        date: d,
        tmax: resp.daily!.temperature_2m_max[i],
        tmin: resp.daily!.temperature_2m_min[i],
      })) : [],
    });
  }

  // ✅ useEffect는 컴포넌트 최상위에서
  useEffect(() => { search(); }, [unit]);

  return (
    <>
      <div className="controls-row">
        <div className="card control" style={{ flex: '1 1 380px' }}>
          <div className="icon-input">
            <span className="ic">🔎</span>
            <input className="input" placeholder="도시 검색 (Seoul, Tokyo…)"
              value={city} onChange={e => setCity(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search(); }} />
          </div>
        </div>

        <div className="card control" style={{ width: 220 }}>
          <select className="select" value={sel} onChange={async (e) => {
            const [lat, lon] = e.target.value.split(',').map(Number);
            setSel(e.target.value);
            const pick = choices.find(c => `${c.latitude},${c.longitude}` === e.target.value);
            if (pick) await fetchWx(lat, lon, pick.name, pick.country);
          }}>
            <option value="">{choices.length ? '도시 선택' : '도시 검색 결과가 없습니다.'}</option>
            {choices.map(c => <option key={`${c.latitude},${c.longitude}`} value={`${c.latitude},${c.longitude}`}>{c.name} · {c.country}</option>)}
          </select>
        </div>

        <div className="card control" style={{ width: 140 }}>
          <select className="select" value={unit} onChange={e => setUnit(e.target.value as any)}>
            <option value="c">섭씨 (°C)</option>
            <option value="f">화씨 (°F)</option>
          </select>
        </div>
      </div>

      {err && <Toast message={err} type="error" />}
      {loading && <div className="grid" style={{ marginTop: 12 }}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" style={{ height: 110 }} />)}</div>}

      {data && (
        <div className="row">
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {(() => {
                const c = (wx?.current?.weather_code ?? 0);
                const d = (wx?.current?.is_day ?? 1) === 1;
                const { icon, desc } = codeToIcon(c, d);
                return <><span className="wx-emoji">{icon}</span><h3 style={{ margin: 0 }}>{data.name}, {data.country} · {desc}</h3></>;
              })()}
            </div>
            <div className="wx-badges">
              <span className="wx-badge">체감 {wx?.current?.apparent_temperature ?? '–'}°</span>
              <span className="wx-badge">습도 {wx?.current?.relative_humidity_2m ?? '–'}%</span>
              <span className="wx-badge">기압 {wx?.current?.pressure_msl ?? '–'} hPa</span>
              <span className="wx-badge">구름 {wx?.current?.cloud_cover ?? '–'}%</span>
              <span className="wx-badge">강수 {wx?.current?.precipitation ?? 0} mm</span>
              <span className="wx-badge">돌풍 {wx?.current?.wind_gusts_10m ?? '–'} m/s</span>
              <span className="wx-badge">풍속 {wx?.current?.wind_speed_10m ?? '–'} m/s · {wx?.current?.wind_direction_10m ?? '–'}°</span>
            </div>
          </Card>

          <Card>
            <div className="section"><div className="section-title">7일 예보</div></div>
            <div className="divider"></div>

            {/* 암시적 any 방지: date, i 타입 명시 */}
            <div className="list">
              {wx?.daily?.time.map((date: string, i: number) => (
                <div key={date} className="list-item">
                  <div>
                    <div className="title">{new Date(date).toLocaleDateString()}</div>
                    <div className="meta" style={{ gap: 10 }}>
                      <span className="pill">🌅 {wx?.daily?.sunrise?.[i] ? new Date(wx!.daily!.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      <span className="pill">🌇 {wx?.daily?.sunset?.[i] ? new Date(wx!.daily!.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      <span className="pill">UV {wx!.daily!.uv_index_max[i] ?? '–'}</span>
                      <span className="pill">강수확률 {wx!.daily!.precipitation_probability_max[i] ?? 0}%</span>
                      <span className="pill">강수량 {wx!.daily!.precipitation_sum[i] ?? 0} mm</span>
                      <span className="pill">바람 {wx!.daily!.wind_speed_10m_max[i] ?? '–'} m/s</span>
                      <span className="pill">돌풍 {wx!.daily!.wind_gusts_10m_max[i] ?? '–'} m/s</span>
                    </div>
                  </div>
                  <div className="side">
                    <span className="temp-up">▲ {wx!.daily!.temperature_2m_max[i]}°</span>
                    &nbsp;&nbsp;
                    <span className="temp-down">▼ {wx!.daily!.temperature_2m_min[i]}°</span>
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

/* ---------------- News ---------------- */
function NewsPanel() {
  const [q, setQ] = useLocalStorage('news:q', 'technology');
  const [lang, setLang] = useLocalStorage('news:lang', 'en');
  const [sortBy, setSortBy] = useLocalStorage<'publishedAt' | 'popularity'>('news:sort', 'publishedAt');
  const [from, setFrom] = useLocalStorage('news:from', ''); // YYYY-MM-DD
  const [to, setTo] = useLocalStorage('news:to', '');

  const [arts, setArts] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function search() {
    setLoading(true); setErr(null);
    try {
      const r = await getHeadlines(q.trim() || 'technology', lang, sortBy, from || undefined, to || undefined);
      setArts(r.articles);
    } catch (e: any) { setErr(e.message || '오류'); setArts(null); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="controls-row">
        <div className="card control" style={{ flex: '1 1 360px' }}>
          <div className="icon-input">
            <span className="ic">🔍</span>
            <input className="input" placeholder="키워드 (예: AI)" value={q}
              onChange={e => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search(); }} />
          </div>
        </div>
        <div className="card control" style={{ width: 180 }}>
          <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="publishedAt">최신순</option>
            <option value="popularity">인기순</option>
          </select>
        </div>
      </div>
      <div className="controls-row">
        <div className="card control" style={{ width: 170 }}>
          <input className="select" type="date" value={from} onChange={e => setFrom(e.target.value)} title="From" />
        </div>
        <div className="card control" style={{ width: 170 }}>
          <input className="select" type="date" value={to} onChange={e => setTo(e.target.value)} title="To" />
        </div>
        <div className="card control" style={{ width: 120, display: 'grid', placeItems: 'center' }}>
          <button className="btn primary" onClick={search}>검색</button>
        </div>
      </div>

      {err && <Toast message={err} type="error" />}
      {loading && <div className="grid" style={{ marginTop: 12 }}>{Array.from({ length: 9 }).map((_, i) => <div key={i} className="skel" style={{ height: 110 }} />)}</div>}

      {arts && (
        <>
          <div className="section"><div className="section-title">검색 결과</div></div>
          <div className="divider"></div>
          <div className="list">
            {arts.map((a, i) => (
              <div key={i} className="list-item">
                <div>
                  <div className="title">
                    <a href={a.url} target="_blank" style={{ color: 'inherit' }}>{a.title}</a>
                  </div>
                  <div className="desc">{a.description ?? '—'}</div>
                  <div className="meta">
                    <span className="pill ghost">{a.source?.name}</span>
                  </div>
                </div>
                <div className="side">{new Date(a.publishedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
