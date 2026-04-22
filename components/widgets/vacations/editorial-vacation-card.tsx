'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Vacation, calculateDurationDays } from '@/lib/types/vacations';
import { cn } from '@/lib/utils';

interface EditorialVacationCardProps {
  vacation: Vacation;
  index: number;
}

export function EditorialVacationCard({ vacation, index }: EditorialVacationCardProps) {
  const isEven = index % 2 === 0;
  const duration = calculateDurationDays(vacation.start_date, vacation.end_date);
  const monthYear = new Date(vacation.start_date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center group">
      <div 
        className={cn(
          "lg:col-span-7 aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden editorial-shadow relative",
          !isEven && "lg:order-2"
        )}
      >
        {vacation.poster ? (
          <Image
            src={vacation.poster}
            alt={vacation.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-media-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-media-outline-variant">landscape</span>
          </div>
        )}
      </div>

      <div className={cn(
        "lg:col-span-5 flex flex-col",
        !isEven && "lg:order-1"
      )}>
        <div className="flex items-center gap-4 mb-6">
          <span className="px-4 py-1.5 bg-media-primary-container text-media-on-primary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
            {vacation.type}
          </span>
          <span className="text-media-outline text-xs tracking-widest uppercase font-lexend">
            {monthYear}
          </span>
        </div>

        <Link href={`/vacations/${vacation.slug}`}>
          <h4 className="text-3xl lg:text-4xl font-bold text-media-primary mb-6 leading-tight hover:text-media-secondary transition-colors font-lexend">
            {vacation.title}
          </h4>
        </Link>
        
        <p className="text-media-on-surface-variant text-lg leading-relaxed mb-8 font-lexend font-light">
          {vacation.description || `A curated journey to ${vacation.destination}.`}
        </p>

        <div className="flex items-center gap-12 border-t border-media-outline-variant/30 pt-8 mt-auto">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-media-outline mb-1 font-lexend">
              Est. Budget
            </span>
            <span className="text-xl font-bold text-media-primary font-lexend">
              {vacation.budget_planned ? `$${vacation.budget_planned.toLocaleString()}` : '--'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-media-outline mb-1 font-lexend">
              Duration
            </span>
            <span className="text-xl font-bold text-media-primary font-lexend">
              {duration} Days
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
