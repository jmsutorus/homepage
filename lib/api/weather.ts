import { env } from "@/lib/env";
import { geocodeCity } from "./geocoding";

const WEATHER_API_BASE = "https://api.weather.gov";

/**
 * Weather.gov API types
 */
export interface WeatherPoint {
  properties: {
    forecast: string;
    forecastHourly: string;
    forecastGridData: string;
    observationStations: string;
    gridId: string;
    gridX: number;
    gridY: number;
  };
}

export interface WeatherPeriod {
  number: number;
  name: string; // "Today", "Tonight", "Monday", etc.
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string; // "F" or "C"
  temperatureTrend: string | null;
  windSpeed: string;
  windDirection: string;
  icon: string; // URL to weather icon
  shortForecast: string; // "Sunny", "Partly Cloudy", etc.
  detailedForecast: string;
}

export interface WeatherForecast {
  properties: {
    updated: string;
    periods: WeatherPeriod[];
  };
}

export interface CurrentWeather {
  temperature: number;
  temperatureUnit: string;
  condition: string; // "Sunny", "Cloudy", etc.
  icon: string;
  windSpeed: string;
  windDirection: string;
}

export interface WeatherData {
  location: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  current: CurrentWeather;
  forecast: WeatherPeriod[]; // Next 3 days (6 periods: day/night for 3 days)
  updated: string;
}

/**
 * Make a request to weather.gov API with proper headers
 */
async function weatherFetch<T>(endpoint: string): Promise<T> {
  const userAgent = `(${env.WEATHER_APP_NAME}, ${env.WEATHER_CONTACT_EMAIL || "noreply@example.com"})`;

  const url = `${WEATHER_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/geo+json",
    },
    next: { revalidate: env.CACHE_TTL_WEATHER },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Weather.gov API error: ${response.status} - ${error}`
    );
  }

  return response.json();
}

/**
 * Get weather grid point information from coordinates
 * This is required before fetching forecast data
 */
async function getWeatherPoint(
  latitude: number,
  longitude: number
): Promise<WeatherPoint> {
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);

  return weatherFetch<WeatherPoint>(`/points/${lat},${lon}`);
}

/**
 * Get forecast from a forecast URL
 */
async function getForecast(forecastUrl: string): Promise<WeatherForecast> {
  const userAgent = `(${env.WEATHER_APP_NAME}, ${env.WEATHER_CONTACT_EMAIL || "noreply@example.com"})`;

  const response = await fetch(forecastUrl, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/geo+json",
    },
    next: { revalidate: env.CACHE_TTL_WEATHER },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Weather forecast error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get weather data for a city location
 *
 * @param cityName - City name in format "City, ST" (e.g., "Denver, CO")
 * @returns Complete weather data including current conditions and 3-day forecast
 */
export async function getWeatherForCity(
  cityName: string
): Promise<WeatherData | null> {
  try {
    // Step 1: Geocode the city name to get coordinates
    console.log(`[Weather] Step 1: Geocoding ${cityName}`);
    const geocodeResult = await geocodeCity(cityName);

    if (!geocodeResult) {
      console.error(`[Weather] Failed to geocode location: ${cityName}`);
      return null;
    }

    console.log(`[Weather] Geocoded to: ${geocodeResult.city}, ${geocodeResult.state} (${geocodeResult.latitude}, ${geocodeResult.longitude})`);
    const { latitude, longitude, city, state } = geocodeResult;

    // Step 2: Get weather grid point from coordinates
    console.log(`[Weather] Step 2: Getting weather grid point for coordinates`);
    const point = await getWeatherPoint(latitude, longitude);
    console.log(`[Weather] Got grid point: ${point.properties.gridId} (${point.properties.gridX}, ${point.properties.gridY})`);

    // Step 3: Get forecast from the forecast URL
    console.log(`[Weather] Step 3: Fetching forecast from: ${point.properties.forecast}`);
    const forecast = await getForecast(point.properties.forecast);
    console.log(`[Weather] Forecast retrieved with ${forecast.properties.periods.length} periods`);

    // Step 4: Extract current weather (first period) and 3-day forecast
    const periods = forecast.properties.periods;

    if (periods.length === 0) {
      throw new Error("No forecast periods available");
    }

    // Current weather is the first period
    const currentPeriod = periods[0];
    const current: CurrentWeather = {
      temperature: currentPeriod.temperature,
      temperatureUnit: currentPeriod.temperatureUnit,
      condition: currentPeriod.shortForecast,
      icon: currentPeriod.icon,
      windSpeed: currentPeriod.windSpeed,
      windDirection: currentPeriod.windDirection,
    };

    // Get next 6 periods (3 days worth: day + night for each day)
    const forecastPeriods = periods.slice(0, 6);

    console.log(`[Weather] Updated timestamp from API: ${forecast.properties.updated}`);

    return {
      location: {
        city,
        state,
        latitude,
        longitude,
      },
      current,
      forecast: forecastPeriods,
      updated: forecast.properties.updated || new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Weather] Error fetching weather:", error);
    if (error instanceof Error) {
      console.error("[Weather] Error details:", error.message);
    }
    return null;
  }
}

/**
 * Get weather icon emoji based on condition
 * Weather.gov provides icon URLs, but we can also map to emojis for simpler display
 */
export function getWeatherEmoji(condition: string): string {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
    return "☀️";
  }
  if (lowerCondition.includes("cloud")) {
    return "☁️";
  }
  if (lowerCondition.includes("rain") || lowerCondition.includes("shower")) {
    return "🌧️";
  }
  if (lowerCondition.includes("snow")) {
    return "❄️";
  }
  if (lowerCondition.includes("thunder") || lowerCondition.includes("storm")) {
    return "⛈️";
  }
  if (lowerCondition.includes("fog") || lowerCondition.includes("mist")) {
    return "🌫️";
  }
  if (lowerCondition.includes("partly")) {
    return "⛅";
  }

  return "🌤️"; // Default
}
