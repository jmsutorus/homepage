'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Vacation } from '@/lib/types/vacations';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface TreasuryCardProps {
  vacation?: Vacation;
  isAction?: boolean;
}

export function TreasuryCard({ vacation, isAction }: TreasuryCardProps) {
  if (isAction) {
    return (
      <Link href="/vacations/new" className="group cursor-pointer">
        <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-media-outline-variant hover:border-media-secondary transition-colors flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-media-surface-container flex items-center justify-center group-hover:bg-media-secondary group-hover:text-white transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <h5 className="text-xl font-bold text-media-primary font-lexend">Plan New Journey</h5>
          <p className="text-media-on-surface-variant text-sm font-lexend">Map out your next great escape.</p>
        </div>
      </Link>
    );
  }

  if (!vacation) return null;

  const year = new Date(vacation.start_date).getFullYear();

  return (
    <div className="group cursor-pointer">
      <Link href={`/vacations/${vacation.slug}`}>
        <div className="aspect-[3/4] rounded-lg overflow-hidden mb-8 editorial-shadow relative bg-media-surface-container">
          {vacation.poster ? (
            <Image
              src={vacation.poster}
              alt={vacation.title}
              fill
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-media-outline-variant">landscape</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-media-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
            <span className="text-white font-bold flex items-center gap-2 tracking-widest uppercase text-xs font-lexend">
              Read Archive <span className="material-symbols-outlined text-sm">book</span>
            </span>
          </div>
        </div>
      </Link>
      
      <div className="flex justify-between items-start px-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-media-secondary mb-2 block font-lexend">
            {vacation.status === 'completed' ? `Season ${year}` : 'In Planning'}
          </span>
          <Link href={`/vacations/${vacation.slug}`}>
            <h5 className="text-2xl font-bold text-media-primary font-lexend hover:text-media-secondary transition-colors">
              {vacation.title}
            </h5>
          </Link>
          <p className="text-media-on-surface-variant text-sm mt-1 font-lexend">{vacation.destination}</p>
        </div>
        {vacation.rating && (
          <div className="flex items-center gap-1.5 bg-media-surface p-1.5 rounded">
            <span className="material-symbols-outlined text-media-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="font-bold text-media-primary text-sm font-lexend">{vacation.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
