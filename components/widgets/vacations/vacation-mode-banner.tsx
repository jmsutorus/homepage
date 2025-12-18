'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
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
  Sparkles
} from 'lucide-react';
import { Vacation, VacationType, calculateDurationDays, parseLocalDate } from '@/lib/types/vacations';

interface VacationModeBannerProps {
  vacation: Vacation;
  todayDate: string;
}

const getTypeIcon = (type: VacationType): React.ReactNode => {
  const iconClass = "w-6 h-6";
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

const getTypeEmoji = (type: VacationType): string => {
  switch (type) {
    case 'beach':
      return '🏖️';
    case 'ski':
      return '⛷️';
    case 'cruise':
      return '🚢';
    case 'road-trip':
      return '🚗';
    case 'city':
      return '🏙️';
    case 'camping':
      return '🏕️';
    case 'adventure':
      return '🧗';
    case 'cultural':
      return '🏛️';
    case 'theme-park':
      return '🎢';
    case 'festival':
      return '🎉';
    case 'business':
      return '💼';
    case 'staycation':
      return '🏠';
    default:
      return '✈️';
  }
};

const getTypeTheme = (type: VacationType) => {
  switch (type) {
    case 'beach':
      return {
        gradient: 'from-cyan-500 via-blue-500 to-blue-600',
        animation: 'wave-animation',
        accentColor: 'text-cyan-100'
      };
    case 'ski':
      return {
        gradient: 'from-blue-400 via-indigo-400 to-blue-500',
        animation: 'snow-animation',
        accentColor: 'text-blue-100'
      };
    case 'cruise':
      return {
        gradient: 'from-blue-600 via-indigo-500 to-purple-500',
        animation: 'wave-animation',
        accentColor: 'text-indigo-100'
      };
    case 'road-trip':
      return {
        gradient: 'from-orange-500 via-red-500 to-rose-500',
        animation: 'urban-drift',
        accentColor: 'text-orange-100'
      };
    case 'city':
      return {
        gradient: 'from-slate-500 via-gray-600 to-slate-700',
        animation: 'urban-drift',
        accentColor: 'text-slate-100'
      };
    case 'camping':
      return {
        gradient: 'from-amber-600 via-green-600 to-emerald-600',
        animation: 'leaves-animation',
        accentColor: 'text-amber-100'
      };
    case 'adventure':
      return {
        gradient: 'from-green-600 via-emerald-500 to-teal-500',
        animation: 'leaves-animation',
        accentColor: 'text-green-100'
      };
    case 'cultural':
      return {
        gradient: 'from-amber-500 via-rose-500 to-pink-500',
        animation: 'urban-drift',
        accentColor: 'text-amber-100'
      };
    case 'theme-park':
      return {
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        animation: 'fireworks-animation',
        accentColor: 'text-purple-100'
      };
    case 'festival':
      return {
        gradient: 'from-yellow-500 via-orange-500 to-red-500',
        animation: 'fireworks-animation',
        accentColor: 'text-yellow-100'
      };
    case 'business':
      return {
        gradient: 'from-gray-600 via-slate-600 to-gray-700',
        animation: '',
        accentColor: 'text-gray-100'
      };
    case 'staycation':
      return {
        gradient: 'from-violet-500 via-purple-500 to-indigo-500',
        animation: '',
        accentColor: 'text-violet-100'
      };
    default:
      return {
        gradient: 'from-indigo-500 via-purple-500 to-pink-500',
        animation: '',
        accentColor: 'text-indigo-100'
      };
  }
};

export function VacationModeBanner({ vacation, todayDate }: VacationModeBannerProps) {
  const totalDays = calculateDurationDays(vacation.start_date, vacation.end_date);
  
  // Calculate current day number
  const startDate = parseLocalDate(vacation.start_date);
  const today = parseLocalDate(todayDate);
  const currentDayNum = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const theme = getTypeTheme(vacation.type);
  const daysRemaining = totalDays - currentDayNum;
  
  return (
    <Card className={`bg-gradient-to-r ${theme.gradient} border-none text-white shadow-xl mb-8 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      {theme.animation === 'snow-animation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="snowflake">❅</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
        </div>
      )}
      {theme.animation === 'wave-animation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="wave"></div>
          <div className="wave" style={{ animationDelay: '2s' }}></div>
        </div>
      )}
      {theme.animation === 'leaves-animation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="leaf">🍂</div>
          <div className="leaf">🍃</div>
          <div className="leaf">🍂</div>
          <div className="leaf">🍃</div>
          <div className="leaf">🍂</div>
        </div>
      )}
      {theme.animation === 'fireworks-animation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="firework">✨</div>
          <div className="firework">⭐</div>
          <div className="firework">💫</div>
          <div className="firework">✨</div>
          <div className="firework">⭐</div>
          <div className="firework">💫</div>
        </div>
      )}
      {theme.animation === 'urban-drift' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="drift-item">🎨</div>
          <div className="drift-item">🖼️</div>
          <div className="drift-item">🏛️</div>
          <div className="drift-item">🗼</div>
          <div className="drift-item">🎭</div>
        </div>
      )}

      {/* Decorative floating icons */}
      <div className="absolute top-4 right-8 opacity-20 animate-float">
        <Sparkles className="w-12 h-12" />
      </div>
      <div className="absolute bottom-4 right-24 opacity-15 animate-float-delayed">
        {getTypeIcon(vacation.type)}
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="hidden md:flex p-3 rounded-full bg-white/20 backdrop-blur-sm">
              {getTypeIcon(vacation.type)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-2xl">{getTypeEmoji(vacation.type)}</span>
                <h3 className="text-xl md:text-2xl font-bold">
                  You&apos;re on vacation!
                </h3>
              </div>
              <p className={`${theme.accentColor} text-sm md:text-base font-medium`}>
                {vacation.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{vacation.destination}</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Day {currentDayNum} of {totalDays}
                </Badge>
                {daysRemaining > 0 && (
                  <span className={`text-sm ${theme.accentColor}`}>
                    ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button asChild variant="secondary" size="lg" className="shrink-0 font-semibold shadow-lg">
            <Link href={`/vacations/${vacation.slug}`}>
              View Itinerary
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        .snowflake {
          position: absolute;
          top: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: fall linear infinite;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
        }
        .snowflake:nth-of-type(1) { left: 5%; animation-duration: 6s; animation-delay: 0s; }
        .snowflake:nth-of-type(2) { left: 20%; animation-duration: 8s; animation-delay: 1s; }
        .snowflake:nth-of-type(3) { left: 40%; animation-duration: 10s; animation-delay: 2s; font-size: 1.2rem; }
        .snowflake:nth-of-type(4) { left: 60%; animation-duration: 7s; animation-delay: 0.5s; }
        .snowflake:nth-of-type(5) { left: 75%; animation-duration: 9s; animation-delay: 1.5s; font-size: 1.3rem; }
        .snowflake:nth-of-type(6) { left: 90%; animation-duration: 11s; animation-delay: 3s; }
        @keyframes fall {
          0% { top: -10%; opacity: 1; }
          100% { top: 110%; opacity: 0.3; }
        }
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.3), transparent);
          border-radius: 50%;
          animation: wave-move 8s linear infinite;
        }
        @keyframes wave-move {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25%) translateY(-10%); }
          100% { transform: translateX(-50%) translateY(0); }
        }
        .leaf {
          position: absolute;
          top: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: leaf-fall linear infinite;
          font-size: 1.5rem;
        }
        .leaf:nth-of-type(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; }
        .leaf:nth-of-type(2) { left: 30%; animation-duration: 10s; animation-delay: 1s; }
        .leaf:nth-of-type(3) { left: 50%; animation-duration: 7s; animation-delay: 2s; font-size: 1.3rem; }
        .leaf:nth-of-type(4) { left: 70%; animation-duration: 9s; animation-delay: 0.5s; }
        .leaf:nth-of-type(5) { left: 85%; animation-duration: 11s; animation-delay: 1.5s; font-size: 1.2rem; }
        @keyframes leaf-fall {
          0% { top: -10%; opacity: 1; transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(20px) rotate(180deg); }
          100% { top: 110%; opacity: 0.3; transform: translateX(-20px) rotate(360deg); }
        }
        .firework {
          position: absolute;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: firework-burst ease-out infinite;
          font-size: 1.2rem;
          opacity: 0;
        }
        .firework:nth-of-type(1) { top: 20%; left: 10%; animation-duration: 3s; animation-delay: 0s; }
        .firework:nth-of-type(2) { top: 40%; left: 85%; animation-duration: 3.5s; animation-delay: 1s; }
        .firework:nth-of-type(3) { top: 60%; left: 30%; animation-duration: 3.2s; animation-delay: 2s; }
        .firework:nth-of-type(4) { top: 30%; left: 60%; animation-duration: 3.8s; animation-delay: 0.5s; }
        .firework:nth-of-type(5) { top: 70%; left: 75%; animation-duration: 3.3s; animation-delay: 1.5s; }
        .firework:nth-of-type(6) { top: 50%; left: 20%; animation-duration: 3.6s; animation-delay: 2.5s; }
        @keyframes firework-burst {
          0% { opacity: 0; transform: scale(0.3) translateY(0); }
          20% { opacity: 1; transform: scale(1.2) translateY(-10px); }
          40% { opacity: 0.8; transform: scale(1) translateY(-5px); }
          100% { opacity: 0; transform: scale(0.5) translateY(10px); }
        }
        .drift-item {
          position: absolute;
          bottom: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: drift-up linear infinite;
          font-size: 1.3rem;
          opacity: 0.5;
        }
        .drift-item:nth-of-type(1) { left: 10%; animation-duration: 12s; animation-delay: 0s; }
        .drift-item:nth-of-type(2) { left: 30%; animation-duration: 15s; animation-delay: 2s; font-size: 1.4rem; }
        .drift-item:nth-of-type(3) { left: 50%; animation-duration: 13s; animation-delay: 4s; }
        .drift-item:nth-of-type(4) { left: 70%; animation-duration: 14s; animation-delay: 6s; font-size: 1.2rem; }
        .drift-item:nth-of-type(5) { left: 85%; animation-duration: 16s; animation-delay: 8s; }
        @keyframes drift-up {
          0% { bottom: -10%; opacity: 0; transform: translateX(0); }
          10% { opacity: 0.6; }
          50% { opacity: 0.7; transform: translateX(15px); }
          90% { opacity: 0.4; }
          100% { bottom: 110%; opacity: 0; transform: translateX(-10px); }
        }
      `}</style>
    </Card>
  );
}
