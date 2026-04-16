"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MuscleMapProps {
  muscles: string[];
  className?: string;
}

// Map broader muscle groups (from Exercise type) to specific SVG IDs if needed,
// or just use the keys directly if they match.
// MUSCLE_GROUPS keys: "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body"
// MUSCLE_GROUPS values: ["Pectorals", "Upper Chest", "Lower Chest"], ["Lats", "Rhomboids", "Traps", "Lower Back"], etc.

// We will map specific muscles to general zones for visualization
const MUSCLE_MAPPING: Record<string, string[]> = {
  // Chest
  "Pectorals": ["chest"],
  "Upper Chest": ["chest"],
  "Lower Chest": ["chest"],
  
  // Back
  "Lats": ["lats"],
  "Rhomboids": ["upper-back"],
  "Traps": ["traps"],
  "Lower Back": ["lower-back"],
  
  // Shoulders
  "Front Delts": ["shoulders"],
  "Side Delts": ["shoulders"],
  "Rear Delts": ["shoulders"],
  "Rotator Cuff": ["shoulders"],
  
  // Arms
  "Biceps": ["biceps"],
  "Triceps": ["more-arms"], // visible on back mostly, or sides
  "Forearms": ["forearms"],
  
  // Legs
  "Quads": ["quads"],
  "Hamstrings": ["hamstrings"], // back view
  "Glutes": ["glutes"], // back view
  "Calves": ["calves"],
  "Adductors": ["quads"], // simplified
  "Abductors": ["glutes"], // simplified
  
  // Core
  "Abs": ["abs"],
  "Obliques": ["obliques"],
  "Serratus": ["obliques"],
  
  // Full Body / Cardio
  "Full Body": ["chest", "lats", "traps", "lower-back", "shoulders", "biceps", "triceps", "forearms", "quads", "hamstrings", "glutes", "calves", "abs", "obliques"],
  "Cardio": ["chest", "lats", "traps", "lower-back", "shoulders", "biceps", "triceps", "forearms", "quads", "hamstrings", "glutes", "calves", "abs", "obliques"]
};

// Simplified SVG Paths
// These are rough approximations for a stylized front/back view
// Viewbox 0 0 200 400

const MUSCLE_PATHS = {
  // Front View Paths
  traps: "M75,65 Q100,75 125,65 L135,75 Q100,90 65,75 Z", // Upper neck/traps area
  shoulders: "M65,75 Q50,85 45,100 L55,115 Q70,90 75,75 Z M135,75 Q150,85 155,100 L145,115 Q130,90 125,75 Z", // Left and Right Delts
  chest: "M75,75 Q100,105 125,75 L125,110 Q100,125 75,110 Z", // Pectorals
  biceps: "M55,115 Q45,135 50,155 L65,150 Q70,130 65,115 Z M145,115 Q155,135 150,155 L135,150 Q130,130 135,115 Z", // Left and Right Biceps
  forearms: "M50,155 L40,195 L55,200 L65,150 Z M150,155 L160,195 L145,200 L135,150 Z", // Left and Right Forearms
  abs: "M85,110 Q100,115 115,110 L115,165 Q100,175 85,165 Z", // Rectus Abdominis
  obliques: "M75,110 Q65,135 70,165 L85,165 L85,110 Z M125,110 Q135,135 130,165 L115,165 L115,110 Z", // External Obliques
  quads: "M70,175 Q60,225 65,265 L95,265 Q100,225 90,175 Z M130,175 Q140,225 135,265 L105,265 Q100,225 110,175 Z", // Quadriceps
  calves: "M65,275 Q55,305 60,335 L85,335 Q90,305 80,275 Z M135,275 Q145,305 140,335 L115,335 Q110,305 120,275 Z", // Gastrocnemius (Front view mostly shin but indicating detailed muscle map implies keeping it simple)
  
  // Back View additions (we can overlay or assume translucent)
  // For simplicity in this V1, we'll map back muscles to generic zones 
  // or add specific paths if we want a "flip" button later. 
  // For now, let's just add them to the same map but positioned to look okay-ish or overlapping
  
  lats: "M70,95 Q55,125 70,155 L85,110 Z M130,95 Q145,125 130,155 L115,110 Z", // Visible from front as "wings"
};

export function MuscleMap({ muscles, className }: MuscleMapProps) {
  // Determine which muscle groups are active
  const activeZones = useMemo(() => {
    const zones = new Set<string>();
    muscles.forEach(muscle => {
      // Direct match
      if (MUSCLE_PATHS[muscle as keyof typeof MUSCLE_PATHS]) {
        zones.add(muscle.toLowerCase());
      }
      
      // Mapped match
      const mapped = MUSCLE_MAPPING[muscle];
      if (mapped) {
        mapped.forEach(m => zones.add(m));
      }

      // Handle groups directly if passed (e.g. "Chest")
      const groupMatch = Object.entries(MUSCLE_MAPPING).find(([key, _]) => key === muscle);
      if (groupMatch) {
         groupMatch[1].forEach(m => zones.add(m));
      }
    });
    return zones;
  }, [muscles]);

  return (
    <div className={cn("relative aspect-[1/2] w-full max-w-[200px] mx-auto", className)}>
      <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2B463C" />
            <stop offset="100%" stopColor="#1B251E" />
          </linearGradient>
        </defs>

        {/* Base Silhouette (Simplified) */}
        <g className="text-muted/20 dark:text-white/5 fill-current">
             {/* Head */}
            <circle cx="100" cy="40" r="25" />
            {/* Body base layer to connect gaps */}
            <path d="M75,65 L125,65 L145,75 L155,100 L160,195 L145,200 L135,150 L130,165 L135,265 L140,335 L120,380 L110,335 L105,265 L95,265 L90,335 L80,380 L60,335 L65,265 L70,165 L65,150 L55,200 L40,195 L45,100 L55,75 Z" />
        </g>

        {/* Muscle Groups */}
        {Object.entries(MUSCLE_PATHS).map(([zone, path]) => {
          const isActive = activeZones.has(zone);
          return (
            <path
              key={zone}
              d={path}
              className={cn(
                "transition-all duration-500 ease-in-out stroke-background dark:stroke-evergreen-dark stroke-[1px]",
                isActive 
                  ? "fill-[url(#muscleGradient)] opacity-100" 
                  : "fill-muted/40 dark:fill-white/10 opacity-50 dark:opacity-30 hover:opacity-70"
              )}
            />
          );
        })}
      </svg>
      
      {/* Legend / Info (Optional) */}
      {/* <div className="absolute bottom-0 w-full text-center text-xs text-muted-foreground">
        Front View
      </div> */}
    </div>
  );
}
