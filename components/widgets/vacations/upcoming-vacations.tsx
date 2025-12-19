'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Plane,
  Snowflake, 
  Ship, 
  Car, 
  Building, 
  Tent, 
  Mountain, 
  Landmark, 
  Ticket, 
  PartyPopper, 
  Briefcase, 
  Home,
  Palmtree,
  ArrowRight
} from 'lucide-react';
import { Vacation, VacationType, VACATION_TYPE_NAMES, parseLocalDate } from '@/lib/types/vacations';

interface UpcomingVacationsProps {
  vacations: Vacation[];
  todayDate: string;
}

const getTypeIcon = (type: VacationType): React.ReactNode => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'beach':
      return <Palmtree className={iconClass} />;
    case 'ski':
      return <Snowflake className={iconClass} />;
    case 'cruise':
      return <Ship className={iconClass} />;
    case 'road-trip':
      return <Car className={iconClass} />;
    case 'city':
      return <Building className={iconClass} />;
    case 'camping':
      return <Tent className={iconClass} />;
    case 'adventure':
      return <Mountain className={iconClass} />;
    case 'cultural':
      return <Landmark className={iconClass} />;
    case 'theme-park':
      return <Ticket className={iconClass} />;
    case 'festival':
      return <PartyPopper className={iconClass} />;
    case 'business':
      return <Briefcase className={iconClass} />;
    case 'staycation':
      return <Home className={iconClass} />;
    default:
      return <Plane className={iconClass} />;
  }
};

const getTypeBgColor = (type: VacationType): string => {
  switch (type) {
    case 'beach':
      return 'bg-cyan-500/10 border-cyan-500/30';
    case 'ski':
      return 'bg-blue-400/10 border-blue-400/30';
    case 'cruise':
      return 'bg-indigo-500/10 border-indigo-500/30';
    case 'road-trip':
      return 'bg-orange-500/10 border-orange-500/30';
    case 'city':
      return 'bg-slate-500/10 border-slate-500/30';
    case 'camping':
      return 'bg-green-600/10 border-green-600/30';
    case 'adventure':
      return 'bg-emerald-500/10 border-emerald-500/30';
    case 'cultural':
      return 'bg-amber-500/10 border-amber-500/30';
    case 'theme-park':
      return 'bg-purple-500/10 border-purple-500/30';
    case 'festival':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'business':
      return 'bg-gray-500/10 border-gray-500/30';
    case 'staycation':
      return 'bg-violet-500/10 border-violet-500/30';
    default:
      return 'bg-gray-500/10 border-gray-500/30';
  }
};

export function UpcomingVacations({ vacations, todayDate }: UpcomingVacationsProps) {
  if (vacations.length === 0) {
    return null;
  }

  // Use state for today to allow client-side correction of the date
  // This handles the mismatch between server time (UTC) and client time (local)
  const [today, setToday] = useState(() => parseLocalDate(todayDate));

  useEffect(() => {
    // On client mount, update "today" to the user's actual local date
    const now = new Date();
    const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setToday(localToday);
  }, []);

  const calculateDaysUntil = (startDate: string): number => {
    const start = parseLocalDate(startDate);
    const diffTime = start.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Upcoming Vacations
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
            <Link href="/vacations">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {vacations.map((vacation) => {
          const daysUntil = calculateDaysUntil(vacation.start_date);
          const startDate = parseLocalDate(vacation.start_date);
          
          return (
            <Link 
              key={vacation.id} 
              href={`/vacations/${vacation.slug}`}
              className="block group"
            >
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${getTypeBgColor(vacation.type)} transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}>
                {/* Type Icon */}
                <div className="p-2 rounded-full bg-background/80 shadow-sm">
                  {getTypeIcon(vacation.type)}
                </div>

                {/* Vacation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {vacation.title}
                    </h4>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {VACATION_TYPE_NAMES[vacation.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {vacation.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-primary">{daysUntil}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {daysUntil === 1 ? 'day' : 'days'}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
