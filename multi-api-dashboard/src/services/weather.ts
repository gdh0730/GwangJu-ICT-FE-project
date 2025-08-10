import { httpGet } from '../utils/fetcher';

type GeoResp = { results?: { name: string; country: string; latitude: number; longitude: number }[] };
type WeatherResp = { current?: { temperature_2m: number; wind_speed_10m: number }; hourly?: { time: string[]; temperature_2m: number[] } };

export async function geocode(city: string){
  const u = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ko&format=json`;
  const r = await httpGet<GeoResp>(u, { cacheKey: `geo:${city.toLowerCase()}` });
  if (!r.results?.length) throw new Error('도시를 찾을 수 없습니다');
  return r.results[0];
}

export async function getWeather(lat: number, lon: number){
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m&timezone=auto`;
  return httpGet<WeatherResp>(u, { cacheKey: `wx:${lat.toFixed(2)},${lon.toFixed(2)}` });
}
