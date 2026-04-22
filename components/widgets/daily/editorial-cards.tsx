"use client";

import { cn } from "@/lib/utils";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import type { Event } from "@/lib/db/events";
import type { CalendarGoal, CalendarMilestone } from "@/lib/db/calendar";
import { Star } from "lucide-react";

interface EditorialCardProps {
  children: React.ReactNode;
  className?: string;
}

export function WorkoutEditorialCard({ 
  title, 
  distance,
  duration,
  type = "other"
}: { 
  title: string; 
  distance?: number;
  duration: number;
  type?: string;
}) {
  const bgIcon = type === "run" ? "directions_run" : "fitness_center";

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-media-primary text-media-on-primary p-6 rounded-2xl flex flex-col justify-between aspect-video relative overflow-hidden group kinetic-hover">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <MaterialSymbol icon="distance" className="text-media-secondary" fill />
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Movement</span>
        </div>
        <h4 className="text-2xl font-bold leading-tight">{title}</h4>
        <p className="text-media-on-primary/70 mt-2 text-sm font-medium">
          {distance && distance > 0 ? `${distance} miles • ` : ""}{formatDuration(duration || 0)}
        </p>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition-all duration-700 pointer-events-none">
        <MaterialSymbol icon={bgIcon} className="text-white" style={{ fontSize: '140px' }} />
      </div>
    </div>
  );
}

export function RestaurantEditorialCard({ 
  name, 
  location, 
  rating, 
  image 
}: { 
  name: string; 
  location: string; 
  rating: number; 
  image: string 
}) {
  return (
    <div className="bg-media-surface-container-lowest editorial-shadow rounded-2xl overflow-hidden group kinetic-hover">
      <div className="h-40 bg-media-surface-container relative">
        <Image 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          width={400}
          height={160}
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-bold">{name}</h4>
            <p className="text-xs text-media-on-surface-variant mt-1">{location}</p>
          </div>
          <div className="flex text-media-secondary">
            {[...Array(5)].map((_, i) => (
              <MaterialSymbol 
                key={i} 
                icon="star" 
                className="text-sm" 
                fill={i < rating} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaEditorialCard({ 
  title, 
  subtitle, 
  category, 
  image, 
  progress = 0 
}: { 
  title: string; 
  subtitle: string; 
  category: string; 
  image: string; 
  progress?: number 
}) {
  return (
    <div className="bg-media-tertiary-fixed text-media-on-tertiary-fixed p-6 rounded-2xl flex gap-6 kinetic-hover">
      <div className="w-24 h-36 bg-media-tertiary rounded shadow-lg flex-shrink-0 overflow-hidden transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
        {image ? (
          <Image src={image} alt={title} className="w-full h-full object-cover" width={96} height={144} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-media-tertiary-fixed-dim">
            <MaterialSymbol icon="image" className="opacity-20" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center flex-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-media-on-tertiary-fixed-variant mb-2">{category}</span>
        <h4 className="text-xl font-bold leading-tight">{title}</h4>
        <p className="text-xs mt-1 text-media-on-tertiary-fixed-variant">{subtitle}</p>
        <div className="mt-4 bg-media-tertiary-fixed-dim h-1.5 w-full rounded-full overflow-hidden">
          <div 
            className="bg-media-tertiary h-full transition-all duration-1000" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

export function DrinkEditorialCard({ 
  name, 
  details, 
  icon = "local_bar" 
}: { 
  name: string; 
  details: string; 
  icon?: string 
}) {
  return (
    <div className="bg-media-surface-container-high p-5 rounded-2xl kinetic-hover">
      <MaterialSymbol icon={icon} className="text-media-secondary mb-3" />
      <h4 className="text-sm font-bold">{name}</h4>
      <p className="text-[10px] text-media-on-surface-variant mt-1">{details}</p>
    </div>
  );
}

export function GoalEditorialCard({ 
  title, 
  percentage, 
  isMilestone = false 
}: { 
  title: string; 
  percentage: number; 
  isMilestone?: boolean 
}) {
  return (
    <div className="bg-media-secondary text-media-on-secondary p-5 rounded-2xl kinetic-hover">
      <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-80">
        {isMilestone ? "Milestone Update" : "Goal Update"}
      </h4>
      <div className="text-2xl font-bold">{percentage}%</div>
      <p className="text-[10px] mt-1">{title}</p>
    </div>
  );
}

export function EventEditorialCard({ 
  title, 
  location, 
  time 
}: { 
  title: string; 
  location: string; 
  time: string 
}) {
  return (
    <div className="bg-media-surface-container-low p-6 rounded-2xl border-l-4 border-media-primary kinetic-hover">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold">{title}</h4>
          <p className="text-xs text-media-on-surface-variant mt-1">{location} • {time}</p>
        </div>
        <MaterialSymbol icon="event" className="text-media-on-surface-variant opacity-40" />
      </div>
    </div>
  );
}

export function VacationEditorialCard({ 
  title, 
  image, 
  category = "Memory" 
}: { 
  title: string; 
  image: string; 
  category?: string 
}) {
  return (
    <div className="bg-media-surface-container relative aspect-square rounded-2xl overflow-hidden group cursor-pointer kinetic-hover">
      <Image 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        width={300}
        height={300}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-media-primary/40 to-transparent"></div>
      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{category}</p>
        <h4 className="text-lg font-bold">{title}</h4>
      </div>
    </div>
  );
}

export function GithubEditorialCard({ 
  repo, 
  count, 
  type = "Commits" 
}: { 
  repo: string; 
  count: number; 
  type?: string 
}) {
  return (
    <div className="bg-media-inverse-surface text-media-inverse-on-surface p-5 rounded-2xl kinetic-hover">
      <div className="flex items-center gap-2 mb-3">
        <MaterialSymbol icon="code" className="text-media-primary-fixed" />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Development</span>
      </div>
      <div className="text-xl font-bold">{count} {type}</div>
      <p className="text-[10px] mt-1 opacity-70 truncate">{repo}</p>
    </div>
  );
}
export function ParkEditorialCard({ 
  title, 
  image, 
  location 
}: { 
  title: string; 
  image: string; 
  location: string;
}) {
  return (
    <div className="bg-media-surface-container-low relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer kinetic-hover">
      {image ? (
        <Image 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          width={400}
          height={300}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-media-surface-container">
          <MaterialSymbol icon="park" className="text-4xl opacity-20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-media-secondary/30 to-transparent"></div>
      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{location}</p>
        <h4 className="text-xl font-bold">{title}</h4>
      </div>
    </div>
  );
}
