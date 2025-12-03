"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCw,
  Cloud,
  MapPin,
  Wind,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { getWeatherEmoji } from "@/lib/api/weather";
import { toast } from "sonner";

interface WeatherPeriod {
  number: number;
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  icon: string;
  isDaytime: boolean;
}

interface WeatherData {
  location: {
    city: string;
    state: string;
  };
  current: {
    temperature: number;
    temperatureUnit: string;
    condition: string;
    icon: string;
    windSpeed: string;
    windDirection: string;
  };
  forecast: WeatherPeriod[];
  updated: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location editing state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editLocationValue, setEditLocationValue] = useState("");
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/weather");

      if (response.status === 503) {
        setError("Weather integration is not enabled");
        return;
      }

      if (response.status === 404) {
        // No location set
        const data = await response.json();
        setError(data.message || "No location set");
        setLocation(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setWeather(data);
        setLocation(`${data.location.city}, ${data.location.state}`);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || errorData.error || "Failed to fetch weather"
        );
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      setError("Failed to connect to weather service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWeather();
    setIsRefreshing(false);
  };

  const handleEditLocation = () => {
    setIsEditingLocation(true);
    setEditLocationValue(location || "");
  };

  const handleCancelEdit = () => {
    setIsEditingLocation(false);
    setEditLocationValue("");
  };

  const handleSaveLocation = async () => {
    if (!editLocationValue.trim()) {
      toast.error("Location cannot be empty");
      return;
    }

    try {
      setIsSavingLocation(true);

      const response = await fetch("/api/weather/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: editLocationValue.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setLocation(data.location);
        setWeather(data.weather); // Use weather data from validation
        setIsEditingLocation(false);
        setError(null);
        toast.success("Location updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || errorData.error);
      }
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSavingLocation(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </CardTitle>
          <CardDescription>Loading weather data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (no location set)
  if (error && !weather) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEditingLocation ? (
              <div className="space-y-3">
                <Input
                  value={editLocationValue}
                  onChange={(e) => setEditLocationValue(e.target.value)}
                  placeholder="Denver, CO"
                  disabled={isSavingLocation}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveLocation}
                    disabled={isSavingLocation}
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isSavingLocation}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: City, ST (e.g., Denver, CO)
                </p>
              </div>
            ) : (
              <Button onClick={handleEditLocation} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Set Location
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Weather display
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Cloud className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle>Weather</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {isEditingLocation ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={editLocationValue}
                      onChange={(e) => setEditLocationValue(e.target.value)}
                      placeholder="Denver, CO"
                      disabled={isSavingLocation}
                      className="h-7 text-xs"
                    />
                    <Button
                      onClick={handleSaveLocation}
                      disabled={isSavingLocation}
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={isSavingLocation}
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                    <Button
                      onClick={handleEditLocation}
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 flex-shrink-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="flex-shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {weather && (
          <>
            {/* Current Weather */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Now</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {getWeatherEmoji(weather.current.condition)}
                  </span>
                  <div>
                    <p className="text-3xl font-bold">
                      {weather.current.temperature}°
                      {weather.current.temperatureUnit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {weather.current.condition}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  <span>
                    {weather.current.windSpeed} {weather.current.windDirection}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Day Forecast */}
            <div>
              <h3 className="font-semibold mb-3">3-Day Forecast</h3>
              <div className="grid grid-cols-3 gap-3">
                {weather.forecast.slice(0, 6).map((period) => (
                  <div
                    key={period.number}
                    className="flex flex-col items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <p className="text-xs font-medium mb-2">{period.name}</p>
                    <span className="text-2xl mb-2">
                      {getWeatherEmoji(period.shortForecast)}
                    </span>
                    <p className="text-lg font-bold">{period.temperature}°</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {period.shortForecast}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            {weather.updated && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Updated{" "}
                {(() => {
                  try {
                    return format(new Date(weather.updated), "h:mm a");
                  } catch {
                    console.error("Error formatting date:", weather.updated);
                    return "recently";
                  }
                })()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
