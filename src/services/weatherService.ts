import axios from 'axios';

interface OpenMeteoResponse {
  current?: {
    time?: number;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export const weatherService = {
  async getCurrent(latitude: number, longitude: number, signal: AbortSignal) {
    const { data } = await axios.get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,precipitation',
        timeformat: 'unixtime',
        timezone: 'America/Lima',
      },
      signal,
      timeout: 8000,
    });
    const { time, temperature_2m, relative_humidity_2m, precipitation } = data.current ?? {};
    if (!isFiniteNumber(time) || !isFiniteNumber(temperature_2m)
      || !isFiniteNumber(relative_humidity_2m) || !isFiniteNumber(precipitation)) {
      throw new Error('Open-Meteo devolvió datos incompletos.');
    }

    return {
      observedAt: new Date(time * 1000),
      temperature: temperature_2m,
      humidity: relative_humidity_2m,
      precipitation,
    };
  },
};
