"use client";

import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
// @ts-ignore
import { geoAlbersUsaTerritories } from "d3-composite-projections";
import { NATIONAL_PARKS_DATA } from "@/lib/data/national-parks";
import { TreePine } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NationalParksMapProps {
  visitedParkTitles: string[]; // Or titles directly
}

export function NationalParksMap({ visitedParkTitles }: NationalParksMapProps) {
  // We use `d3-composite-projections` to get a projection that includes territories
  const projection = geoAlbersUsaTerritories();

  const visitedSet = useMemo(() => {
    // Basic normalization for matching (lowercase, remote accents).
    const normalize = (name: string) => name.toLowerCase().replace(/['ʻ]/g, "");
    return new Set(visitedParkTitles.map(normalize));
  }, [visitedParkTitles]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 relative rounded-xl border bg-card p-4 shadow-sm overflow-hidden">
      <h3 className="text-xl font-bold text-center mb-2">National Parks Explored</h3>
      <div className="relative aspect-[3/2] w-full">
        <ComposableMap
          projection={projection as any}
          projectionConfig={{ scale: 950 }} // reduced scale slightly to fit Maine
          width={900}
          height={500}
          style={{ width: "100%", height: "100%" }}
        >
          {/* We wrap everything in a group to shift it slightly to the left as requested */}
          <g transform="translate(-20, 0)">
            <Geographies geography="/states-10m.json">
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--background))"
                  strokeWidth={1}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "hsl(var(--muted-foreground)/0.2)", outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {NATIONAL_PARKS_DATA.map((park) => {
            // Normalize park name from DATA vs Visited Array
            // Example: "Haleakalā" vs "Haleakala"
            const normalize = (n: string) =>
              n.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
              .replace(/['ʻ]/g, ""); // remove single quotes or okina
            
            const isVisited = visitedSet.has(normalize(park.name));

            return (
              <Marker key={park.name} coordinates={[park.lng, park.lat]}>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <g
                        className="transition-transform hover:scale-125 duration-200 cursor-pointer text-popover"
                        transform="translate(-12, -24)" // Center bottom of trunk at point
                      >
                        {isVisited ? (
                          <TreePine
                            size={24}
                            className="text-emerald-500 fill-emerald-500"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <TreePine
                            size={24}
                            className="text-emerald-800/40"
                            strokeWidth={1.5}
                          />
                        )}
                        
                        {/* A tiny subtle glow for unvisited trees so they don't get fully lost */}
                        {!isVisited && (
                           <circle cx="12" cy="12" r="10" className="fill-emerald-100/10 -z-10" />
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-popover text-popover-foreground border">
                      <p className="font-semibold text-sm">{park.name} National Park</p>
                      <p className="text-xs text-muted-foreground">{park.state}</p>
                      <p className="text-xs mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                        {isVisited ? "Visited ✓" : "Not yet visited"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Marker>
            );
          })}
          </g>
        </ComposableMap>
      </div>
    </div>
  );
}
