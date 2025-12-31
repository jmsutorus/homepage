'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Star, Waves, Snowflake, Ship, Car, Building, Tent, Mountain, Landmark, Ticket, PartyPopper, Briefcase, Home, HelpCircle, Palmtree } from 'lucide-react';
import { Vacation, VacationType, VACATION_STATUS_NAMES, VACATION_TYPE_NAMES, calculateDurationDays, parseLocalDate } from '@/lib/types/vacations';

interface VacationCardProps {
  vacation: Vacation;
}

export function VacationCard({ vacation }: VacationCardProps) {
  const duration = calculateDurationDays(vacation.start_date, vacation.end_date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'booked':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: VacationType) => {
    const iconClass = "w-3 h-3";
    switch (type) {
      case 'beach':
        return <Waves className={iconClass} />;
      case 'ski':
        return <Mountain className={iconClass} />;
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
        return <HelpCircle className={iconClass} />;
    }
  };

  const getTypeTheme = (type: VacationType) => {
    switch (type) {
      case 'beach':
        return {
          gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
          decorativeIcon: <Palmtree className="w-8 h-8 text-blue-500/20" />,
          animation: 'wave-animation'
        };
      case 'ski':
        return {
          gradient: 'from-blue-400/10 via-white/5 to-transparent',
          decorativeIcon: <Snowflake className="w-8 h-8 text-blue-400/20" />,
          animation: 'snow-animation'
        };
      case 'cruise':
        return {
          gradient: 'from-blue-600/10 via-indigo-500/5 to-transparent',
          decorativeIcon: <Ship className="w-8 h-8 text-blue-600/20" />,
          animation: 'wave-animation'
        };
      case 'road-trip':
        return {
          gradient: 'from-orange-500/10 via-red-500/5 to-transparent',
          decorativeIcon: <Car className="w-8 h-8 text-orange-500/20" />,
          animation: 'urban-drift'
        };
      case 'city':
        return {
          gradient: 'from-slate-500/10 via-blue-500/5 to-transparent',
          decorativeIcon: <Building className="w-8 h-8 text-slate-500/20" />,
          animation: 'urban-drift'
        };
      case 'camping':
        return {
          gradient: 'from-amber-600/10 via-green-600/5 to-transparent',
          decorativeIcon: <Tent className="w-8 h-8 text-amber-600/20" />,
          animation: 'leaves-animation'
        };
      case 'adventure':
        return {
          gradient: 'from-green-600/10 via-emerald-500/5 to-transparent',
          decorativeIcon: <Mountain className="w-8 h-8 text-green-600/20" />,
          animation: 'leaves-animation'
        };
      case 'cultural':
        return {
          gradient: 'from-amber-500/10 via-rose-500/5 to-transparent',
          decorativeIcon: <Landmark className="w-8 h-8 text-amber-500/20" />,
          animation: 'urban-drift'
        };
      case 'theme-park':
        return {
          gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
          decorativeIcon: <Ticket className="w-8 h-8 text-purple-500/20" />,
          animation: 'fireworks-animation'
        };
      case 'festival':
        return {
          gradient: 'from-yellow-500/10 via-orange-500/5 to-transparent',
          decorativeIcon: <PartyPopper className="w-8 h-8 text-yellow-500/20" />,
          animation: 'fireworks-animation'
        };
      default:
        return {
          gradient: 'from-gray-500/10 via-slate-500/5 to-transparent',
          decorativeIcon: null,
          animation: ''
        };
    }
  };

  const theme = getTypeTheme(vacation.type);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      {/* Decorative Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />
      
      {/* Animated Background Elements */}
      {theme.animation === 'snow-animation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="snowflake">❅</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
          <div className="snowflake">❄</div>
        </div>
      )}
      {theme.animation === 'wave-animation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
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

      {/* Decorative Icon */}
      {theme.decorativeIcon && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {theme.decorativeIcon}
        </div>
      )}

      <div className="relative">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold line-clamp-1">{vacation.title}</h3>
                {vacation.featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-1">{vacation.destination}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <Badge variant={getStatusColor(vacation.status)}>
                {VACATION_STATUS_NAMES[vacation.status]}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                {getTypeIcon(vacation.type)}
                <span className="text-xs">{VACATION_TYPE_NAMES[vacation.type]}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Two-column layout for content and poster */}
          <div className={`grid gap-4 items-start ${vacation.poster ? 'md:grid-cols-[1fr_144px]' : 'grid-cols-1'}`}>
            {/* Left column - Main content */}
            <div className="space-y-3 min-w-0">
              {/* Date and Duration */}
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                      {parseLocalDate(vacation.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                      {parseLocalDate(vacation.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Badge variant="outline" className="text-xs w-fit">
                      {duration} {duration === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              {vacation.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {vacation.description}
                </p>
              )}

              {/* Budget */}
              {vacation.budget_planned && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-semibold">
                      {vacation.budget_currency} {vacation.budget_planned.toLocaleString()}
                    </span>
                  </div>
                  {vacation.budget_actual && (
                    <span className="text-xs text-muted-foreground">
                      (Spent: {vacation.budget_currency} {vacation.budget_actual.toLocaleString()})
                    </span>
                  )}
                </div>
              )}

              {/* Rating */}
              {vacation.rating && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{vacation.rating}</span>
                  <span className="text-muted-foreground text-xs">/ 10</span>
                </div>
              )}

              {/* Tags */}
              {vacation.tags && vacation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {vacation.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {vacation.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      +{vacation.tags.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Right column - Poster */}
            {vacation.poster && (
              <div className="relative h-48 aspect-[3/4] rounded-lg overflow-hidden bg-muted shadow-sm">
                <img
                  src={vacation.poster}
                  alt={vacation.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link href={`/vacations/${vacation.slug}`}>View Details</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/vacations/${vacation.slug}/edit`}>Edit</Link>
            </Button>
          </div>
        </CardContent>
      </div>

      <style jsx>{`
        .snowflake {
          position: absolute;
          top: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: fall linear infinite;
          color: rgba(147, 197, 253, 0.6);
          font-size: 1.5rem;
        }
        .snowflake:nth-of-type(1) {
          left: 10%;
          animation-duration: 8s;
          animation-delay: 0s;
        }
        .snowflake:nth-of-type(2) {
          left: 30%;
          animation-duration: 10s;
          animation-delay: 2s;
        }
        .snowflake:nth-of-type(3) {
          left: 60%;
          animation-duration: 12s;
          animation-delay: 4s;
          font-size: 1.2rem;
        }
        .snowflake:nth-of-type(4) {
          left: 80%;
          animation-duration: 9s;
          animation-delay: 1s;
        }
        @keyframes fall {
          0% {
            top: -10%;
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0.3;
          }
        }
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(to top, rgba(59, 130, 246, 0.2), transparent);
          border-radius: 50%;
          animation: wave-move 8s linear infinite;
        }
        @keyframes wave-move {
          0% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-25%) translateY(-10%);
          }
          100% {
            transform: translateX(-50%) translateY(0);
          }
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
        .leaf:nth-of-type(1) {
          left: 15%;
          animation-duration: 10s;
          animation-delay: 0s;
          color: rgba(217, 119, 6, 0.6);
        }
        .leaf:nth-of-type(2) {
          left: 35%;
          animation-duration: 12s;
          animation-delay: 2s;
          color: rgba(34, 197, 94, 0.5);
        }
        .leaf:nth-of-type(3) {
          left: 55%;
          animation-duration: 9s;
          animation-delay: 4s;
          font-size: 1.3rem;
          color: rgba(217, 119, 6, 0.7);
        }
        .leaf:nth-of-type(4) {
          left: 75%;
          animation-duration: 11s;
          animation-delay: 1s;
          color: rgba(34, 197, 94, 0.6);
        }
        .leaf:nth-of-type(5) {
          left: 90%;
          animation-duration: 13s;
          animation-delay: 3s;
          font-size: 1.2rem;
          color: rgba(217, 119, 6, 0.5);
        }
        @keyframes leaf-fall {
          0% {
            top: -10%;
            opacity: 1;
            transform: translateX(0) rotate(0deg);
          }
          50% {
            transform: translateX(20px) rotate(180deg);
          }
          100% {
            top: 110%;
            opacity: 0.3;
            transform: translateX(-20px) rotate(360deg);
          }
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
        .firework:nth-of-type(1) {
          top: 20%;
          left: 10%;
          animation-duration: 3s;
          animation-delay: 0s;
        }
        .firework:nth-of-type(2) {
          top: 40%;
          left: 80%;
          animation-duration: 3.5s;
          animation-delay: 1s;
        }
        .firework:nth-of-type(3) {
          top: 60%;
          left: 30%;
          animation-duration: 3.2s;
          animation-delay: 2s;
        }
        .firework:nth-of-type(4) {
          top: 30%;
          left: 60%;
          animation-duration: 3.8s;
          animation-delay: 0.5s;
        }
        .firework:nth-of-type(5) {
          top: 70%;
          left: 75%;
          animation-duration: 3.3s;
          animation-delay: 1.5s;
        }
        .firework:nth-of-type(6) {
          top: 50%;
          left: 20%;
          animation-duration: 3.6s;
          animation-delay: 2.5s;
        }
        @keyframes firework-burst {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.2) translateY(-10px);
          }
          40% {
            opacity: 0.8;
            transform: scale(1) translateY(-5px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(10px);
          }
        }
        .drift-item {
          position: absolute;
          bottom: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: drift-up linear infinite;
          font-size: 1.3rem;
          opacity: 0.4;
        }
        .drift-item:nth-of-type(1) {
          left: 10%;
          animation-duration: 15s;
          animation-delay: 0s;
        }
        .drift-item:nth-of-type(2) {
          left: 30%;
          animation-duration: 18s;
          animation-delay: 3s;
          font-size: 1.4rem;
        }
        .drift-item:nth-of-type(3) {
          left: 50%;
          animation-duration: 16s;
          animation-delay: 6s;
        }
        .drift-item:nth-of-type(4) {
          left: 70%;
          animation-duration: 17s;
          animation-delay: 9s;
          font-size: 1.2rem;
        }
        .drift-item:nth-of-type(5) {
          left: 85%;
          animation-duration: 19s;
          animation-delay: 12s;
        }
        @keyframes drift-up {
          0% {
            bottom: -10%;
            opacity: 0;
            transform: translateX(0);
          }
          10% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.6;
            transform: translateX(15px);
          }
          90% {
            opacity: 0.4;
          }
          100% {
            bottom: 110%;
            opacity: 0;
            transform: translateX(-10px);
          }
        }
      `}</style>
    </Card>
  );
}
