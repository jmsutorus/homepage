'use client';

import { useRouter } from 'next/navigation';
import { Wine, Star } from 'lucide-react';
import { CalendarDrinkLog } from '@/lib/db/calendar';

interface DailyDrinksProps {
  logs: CalendarDrinkLog[];
}

export function DailyDrinks({ logs }: DailyDrinksProps) {
  const router = useRouter();

  const handleClick = (slug: string) => {
    router.push(`/drinks/${slug}`);
  };

  if (!logs || logs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Wine className="h-4 w-4" />
        Drinks ({logs.length})
      </h3>
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="pl-6 border-l-2 border-rose-700 dark:border-rose-400 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"

            onClick={() => handleClick(log.drinkSlug)}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-rose-700 dark:text-rose-400">

                {log.drinkName}
                {log.drinkProducer && <span className="text-muted-foreground font-normal"> - {log.drinkProducer}</span>}
              </p>

              {log.rating && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {log.rating}
                </span>
              )}
            </div>
            
            <div className="flex gap-2 text-xs text-muted-foreground flex-wrap mt-0.5">
              {log.drinkType && (
                <span className="capitalize">{log.drinkType}</span>
              )}
              {log.location && (
                <>
                  <span>•</span>
                  <span>{log.location}</span>
                </>
              )}
            </div>
            
            {log.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                &quot;{log.notes}&quot;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
