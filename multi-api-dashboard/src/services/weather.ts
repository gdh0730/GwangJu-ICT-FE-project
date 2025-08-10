import { httpGet } from '../utils/fetcher';

type GeoResp = { results?: { name: string; country: string; latitude: number; longitude: number }[] };

export type WeatherResp = {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    wind_direction_10m: number;
    relative_humidity_2m: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
  };
};

export async function geocodeMany(city: string) {
  const u = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=ko&format=json`;
  return httpGet<GeoResp>(u, { cacheKey: `geo5:${city.toLowerCase()}` });
}

export async function getWeather(lat: number, lon: number, unit: 'c' | 'f' = 'c') {
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius';
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    temperature_unit: tempUnit,
    current: [
      'temperature_2m', 'apparent_temperature', 'is_day', 'precipitation', 'rain', 'showers', 'snowfall',
      'weather_code', 'cloud_cover', 'pressure_msl', 'wind_speed_10m', 'wind_gusts_10m',
      'wind_direction_10m', 'relative_humidity_2m'
    ].join(','),
    daily: [
      'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset',
      'uv_index_max', 'precipitation_sum', 'precipitation_probability_max',
      'wind_speed_10m_max', 'wind_gusts_10m_max'
    ].join(',')
  }).toString();

  return httpGet<WeatherResp>(u.toString(), { cacheKey: `wx7:${lat.toFixed(2)},${lon.toFixed(2)},${unit}` });
}

/** WMO weather code -> 이모지/설명 */
export function codeToIcon(code: number, isDay: boolean) {
  const M: Record<number, { d: string; n: string; desc: string }> = {
    0: { d: '☀️', n: '🌕', desc: '맑음' },
    1: { d: '🌤️', n: '🌤️', desc: '대체로 맑음' },
    2: { d: '⛅', n: '⛅', desc: '부분 흐림' },
    3: { d: '☁️', n: '☁️', desc: '흐림' },
    45: { d: '🌫️', n: '🌫️', desc: '안개' }, 48: { d: '🌫️', n: '🌫️', desc: '서리 안개' },
    51: { d: '🌦️', n: '🌧️', desc: '이슬비' }, 53: { d: '🌦️', n: '🌧️', desc: '이슬비' }, 55: { d: '🌧️', n: '🌧️', desc: '강한 이슬비' },
    61: { d: '🌦️', n: '🌧️', desc: '약한 비' }, 63: { d: '🌧️', n: '🌧️', desc: '비' }, 65: { d: '🌧️', n: '🌧️', desc: '폭우' },
    71: { d: '🌨️', n: '🌨️', desc: '약한 눈' }, 73: { d: '🌨️', n: '🌨️', desc: '눈' }, 75: { d: '❄️', n: '❄️', desc: '폭설' },
    80: { d: '🌦️', n: '🌧️', desc: '소나기' }, 81: { d: '🌧️', n: '🌧️', desc: '강한 소나기' }, 82: { d: '⛈️', n: '⛈️', desc: '매우 강한 소나기' },
    95: { d: '⛈️', n: '⛈️', desc: '뇌우' }, 96: { d: '⛈️', n: '⛈️', desc: '우박 동반 뇌우' }, 99: { d: '⛈️', n: '⛈️', desc: '강한 우박/뇌우' },
  };
  const item = M[code] ?? { d: '❓', n: '❓', desc: '-' };
  return { icon: isDay ? item.d : item.n, desc: item.desc };
}
