import type { VacationType } from '@/lib/types/vacations';
import { Waves, Mountain, Ship, Car, Building, Tent, Landmark, Ticket, PartyPopper, Briefcase, Home, HelpCircle } from 'lucide-react';

/**
 * Get the appropriate icon component for a vacation type
 * Used in vacation cards and calendar displays
 */
export function getVacationTypeIcon(type: VacationType, className: string = "w-4 h-4") {
  switch (type) {
    case 'beach':
      return <Waves className={className} />;
    case 'ski':
      return <Mountain className={className} />;
    case 'cruise':
      return <Ship className={className} />;
    case 'road-trip':
      return <Car className={className} />;
    case 'city':
      return <Building className={className} />;
    case 'camping':
      return <Tent className={className} />;
    case 'adventure':
      return <Mountain className={className} />;
    case 'cultural':
      return <Landmark className={className} />;
    case 'theme-park':
      return <Ticket className={className} />;
    case 'festival':
      return <PartyPopper className={className} />;
    case 'business':
      return <Briefcase className={className} />;
    case 'staycation':
      return <Home className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}
