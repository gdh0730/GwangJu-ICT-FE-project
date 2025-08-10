import { httpGet } from '../utils/fetcher';

type GeoResp = { results?: { name: string; country: string; latitude: number; longitude: number }[] };

type WeatherResp = {
  current?: { temperature_2m: number; wind_speed_10m: number };
  daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

export async function geocodeMany(city: string){
  const u = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=ko&format=json`;
  return httpGet<GeoResp>(u, { cacheKey: `geo5:${city.toLowerCase()}` });
}

export async function getWeather(lat: number, lon: number, unit:'c'|'f'='c'){
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius';
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`;
  return httpGet<WeatherResp>(u, { cacheKey: `wx7:${lat.toFixed(2)},${lon.toFixed(2)},${unit}` });
}
