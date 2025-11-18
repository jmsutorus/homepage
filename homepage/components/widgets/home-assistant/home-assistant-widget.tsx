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
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Home,
  Thermometer,
  Droplet,
  DoorClosed,
  Gauge,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface HASensor {
  entityId: string;
  name: string;
  icon: string;
  type: string;
  unit?: string;
  state: string;
  formattedState: string;
  friendlyName: string;
  unavailable: boolean;
  lastUpdated: string | null;
  attributes: Record<string, any>;
}

interface HASensorsResponse {
  sensors: HASensor[];
  online: boolean;
  count: number;
}

export function HomeAssistantWidget() {
  const [data, setData] = useState<HASensorsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/homeassistant/sensors");

      if (response.status === 503) {
        setError("Home Assistant integration is not enabled");
        return;
      }

      if (response.ok) {
        const sensorData = await response.json();
        setData(sensorData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch sensor data");
      }
    } catch (error) {
      console.error("Failed to fetch Home Assistant sensors:", error);
      setError("Failed to connect to Home Assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSensors();
    setIsRefreshing(false);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      thermometer: Thermometer,
      droplet: Droplet,
      "door-closed": DoorClosed,
      gauge: Gauge,
      home: Home,
    };
    const IconComponent = icons[iconName] || Gauge;
    return IconComponent;
  };

  const getSensorColor = (sensor: HASensor) => {
    if (sensor.unavailable) return "text-muted-foreground";

    // Binary sensors (doors, etc.)
    if (sensor.type === "binary") {
      return sensor.state === "on" ? "text-orange-500" : "text-green-500";
    }

    // Temperature sensors
    if (sensor.icon === "thermometer") {
      const temp = parseFloat(sensor.state);
      if (temp > 75) return "text-orange-500";
      if (temp < 65) return "text-blue-500";
      return "text-green-500";
    }

    return "text-primary";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Home Assistant</CardTitle>
          <CardDescription>Loading sensor data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Home Assistant</CardTitle>
              <CardDescription>{error}</CardDescription>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Home Assistant</CardTitle>
          <CardDescription>No sensor data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <div>
              <CardTitle>Home Assistant</CardTitle>
              <CardDescription>
                {data.online ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Offline
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sensors */}
        <div className="space-y-2">
          {data.sensors.map((sensor) => {
            const IconComponent = getIconComponent(sensor.icon);
            const color = getSensorColor(sensor);

            return (
              <div
                key={sensor.entityId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-5 w-5 ${color}`} />
                  <div>
                    <p className="font-medium">{sensor.name}</p>
                    {sensor.lastUpdated && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sensor.lastUpdated), "h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sensor.unavailable ? (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Unavailable
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className={color}>
                      {sensor.formattedState}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Link */}
        {process.env.NEXT_PUBLIC_HOMEASSISTANT_URL && (
          <div className="pt-2 border-t">
            <a
              href={process.env.NEXT_PUBLIC_HOMEASSISTANT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open Home Assistant →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
