'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import type { JournalContent } from '@/lib/db/journals';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface JournalsPageClientProps {
  journals: JournalContent[];
}

const DEFAULT_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDF1xEppHhRbJQ3rEF6KFwFeU_TIkbY5bxc6L4fDBN5TPNyYIAS4Y4nbzQtIgsfoxIlN0munnS2ghTfCQxtQWzPTlSpU80PJeTgT3-jIJzy2s8d2lBTZf-lSfHLqMyfDNKhDZBbezYttzCd2svkmfkARyGPvpIax003yqfeVfcj3ZTbjTqrIMu5xKoPuaECTri4d1vIkm65axa2bhk0XeEhIq9GRGXDDhOd_4mi696mokS7ITCdMJRDrVGDVH61fR2Id-oWY3f_A1w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDPmpgsBor9NzSqfVLZ9LslLX6fOKGK5C_yrb5UcwVui_PvpGvxMvb3uHa5rEVJQySHE73vrPalA9ZLDJ9wyOoHFVSqecwlhf7gizs4XGyXQ4TT69dZHXeSBsoWXGNpt9Dro86TNrcY42cOQludjDafSwFKUiQGQdonO_en3fEnwOqkoFxBh8GWIIQReJLQ90jkKzkkp3jeJIQTD8jnRP38yggZ3Wfx0wGjY3-SjqMneq9bJFQF2kmpkPRZUkPdqK9w4Hgv42HlO28",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDBhqyEeBvj0zKBa7SU_FtJf4TZAX0lkdlr80AfATnHtfSzETDyf1x01UREtZ_Vbbx1OvIMaY3AYTa7E3Cx-ZCjoD_qiVwwog3CiCd_mpwYSmn6iUwMic47x8qKihMqLUMMOZVJ9guBe2SAnoA-VekCUjK-xaXvTvtf8GxtyWMkoEKGabUR4pSVNGCFR379hnuf-coL2UcZnbJkScX9QVYmL-ZrHmoRxLKn87kCadFnoRFfnLxJyBMYeGVmRWR5wQyzi2BXg8N_EzU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBnimryTqT-0k7tU57_iD3Wu6g4F0GpenC5DqPSUsjl733dq0fx4oWSIvXc-earTt6ltz-8BxQTyn-IB6Cwe9D75XxMy0huVEVqELoMXyw9Uhd59Ce1mq3fqxy08es1doSKlfzpiRsXqBPmdbyU8Vh8glfL6W6j3JN4vUYhcfzAx2nNagkl5YrUas3skPNyxfzlaChk0xIOTiSHe8sQzYF0WtUQpsH3wLbikkJHoBDCTMbbu4VR6kGY5uBnWhf3v1wh3r4R94M4o2Y",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCqm7lOM7mC0RTHvEkRNNnbBMDLPu0jiPLh1Cvirk4JGguWBMMwnCe17WUPeEw2AKCauo6k398LB9CmRJ-LYx790aCT2ccXU5c3L14NtyCHLhMW5Y2BAUC_sLummo3hRSvtFfTgT8TmHb1GQA1a3QGSqdueNyiKUeA8Q55O9ZuzhwjspjMjAwPjTyUdm48j8lZMubtJZ-YlX1OjN6DGap2Xu9as4a28pFyp33GvlJuosvU_f2Mk0dy0rQylG8AByO0TinXik4D4jYo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYTe3W86COZBugMZTMW-WfUCcL40ru9-uzxmJ-kQhnOiqopxRYMdQ4Bab_TH6Lb5eVACQLQjtk6mdNVrYgCuXUPQLi1080-IEo7Iob441K83f3c89eHgGVm31EwSF1gNDKvFtZA90rP73HoyRdRwW2VYUNZA3DOkgHn8t9TxpduizRmyNx0K1pYk9SuujBjYeXMUKQSg8Gg8OYA_FNBdPkZKIm4TQCeErFSorKQHiVXdtjMYAxO-1-1w7r4oxUlDXPEaQ2NsS0na4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAc2Pj-TgOWMXN2NDbg4ol52jW4334OpoBT36aU4yHVEnbIdCmbyqcqxgYnjihlJBZTM8Cd1H0JOXtibXbqpi90HkaECqp8FUjWMfcyZKBy9sGO7e6tl-iLpKXaquf45Yz1L9L70t1b_CuObigFMThh3oyKKICva7ZPBHjvK-he8WOiojXlqbgj_2hz_5yXM7zViX0IKmgHfKV2xB-NaEUspKqdtubqcO2Aca2kvC3nsArrts0y3E6zTt6D_CCR0QtAmOfOL5Q0_lA"
];

const getMoodDetails = (mood: number | null) => {
  if (mood === null) return { label: 'Pensive', color: 'bg-media-surface-container-highest/20', textColor: 'text-media-surface-bright' };
  if (mood >= 9) return { label: 'Vibrant', color: 'bg-media-secondary/90', textColor: 'text-media-on-secondary' };
  if (mood >= 7) return { label: 'Radiant', color: 'bg-media-tertiary-container/80', textColor: 'text-media-tertiary-fixed-dim' };
  if (mood >= 5) return { label: 'Serene', color: 'bg-media-primary/60', textColor: 'text-media-on-primary' };
  if (mood >= 3) return { label: 'Curious', color: 'bg-media-surface-container-high', textColor: 'text-media-on-surface-variant' };
  return { label: 'Pensive', color: 'bg-media-surface-container-highest/20', textColor: 'text-media-surface-bright' };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export function JournalsPageClient({ journals }: JournalsPageClientProps) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(12);

  const featuredJournals = journals.slice(0, 3);
  const archiveJournals = journals.slice(3, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  if (journals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold text-media-primary mb-4">No stories yet.</h2>
        <p className="text-media-on-surface-variant mb-8 max-w-md">
          Your digital garden is waiting for its first seeds. Start documenting your journey today.
        </p>
        <button 
          onClick={() => router.push('/journals/new')}
          className="cursor-pointer bg-media-primary text-media-on-primary px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          Begin First Entry
        </button>
      </div>
    );
  }

  return (
    <div className="font-lexend text-media-on-background antialiased selection:bg-media-secondary-fixed">
      {/* Welcome Section */}
      <section className="mb-16 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-media-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Current Perspective</span>
            <h1 className="text-5xl md:text-6xl font-black text-media-primary tracking-tighter leading-[0.9]">
              Morning Rituals <br/>& Night Whispers.
            </h1>
          </div>
          <p className="text-media-on-surface-variant max-w-sm font-light leading-relaxed">
            A curated repository of your lived experiences. Every entry is a thread in the tapestry of your personal evolution.
          </p>
        </div>
      </section>

      {/* Recent Journals */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-media-primary">Recent Journals</h3>
          {/* <Link href="#" className="text-media-secondary font-semibold text-sm flex items-center group">
            View all <MaterialSymbol icon="arrow_forward" className="ml-1 group-hover:translate-x-1 transition-transform w-4 h-4" />
          </Link> */}
        </div>

        <div className="grid grid-cols-12 gap-8 lg:h-[600px]">
          {/* Main Featured Card */}
          {featuredJournals[0] && (
            <div 
              onClick={() => router.push(`/journals/${featuredJournals[0].slug}`)}
              className="col-span-12 lg:col-span-8 group relative overflow-hidden rounded-xl bg-media-surface-container-low cursor-pointer min-h-[400px] lg:min-h-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-media-primary/80 via-media-primary/20 to-transparent z-10"></div>
              <img 
                src={DEFAULT_IMAGES[0]} 
                alt={featuredJournals[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full">
                <div className="flex items-center space-x-4 mb-6">
                  {(() => {
                    const mood = getMoodDetails(featuredJournals[0].mood);
                    return (
                      <span className={cn(mood.color, mood.textColor, "px-3 py-1 rounded text-[10px] uppercase font-bold tracking-widest backdrop-blur-md")}>
                        {mood.label}
                      </span>
                    );
                  })()}
                  <span className="text-media-surface/80 text-xs font-medium">
                    {formatDate(featuredJournals[0].created_at)}
                  </span>
                </div>
                <h4 className="text-3xl md:text-4xl font-bold text-media-surface-container-lowest mb-4 tracking-tight max-w-lg">
                  {featuredJournals[0].title}
                </h4>
                <p className="text-media-surface/70 font-light max-w-md line-clamp-2">
                  {featuredJournals[0].content.replace(/[#*]/g, '').substring(0, 150)}...
                </p>
              </div>
            </div>
          )}

          {/* Secondary Recent Cards */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            {[featuredJournals[1], featuredJournals[2]].map((journal, idx) => {
              if (!journal) return null;
              const mood = getMoodDetails(journal.mood);
              return (
                <div 
                  key={journal.id}
                  onClick={() => router.push(`/journals/${journal.slug}`)}
                  className="flex-1 group relative overflow-hidden rounded-xl bg-media-surface-container-low cursor-pointer min-h-[250px] lg:min-h-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-media-primary/80 via-transparent to-transparent z-10"></div>
                  <img 
                    src={DEFAULT_IMAGES[idx + 1]} 
                    alt={journal.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 p-8 z-20">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={cn(mood.color, mood.textColor, "px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest backdrop-blur-md")}>
                        {mood.label}
                      </span>
                      <span className="text-media-surface/70 text-[10px]">
                        {formatShortDate(journal.created_at)}
                      </span>
                    </div>
                    <h5 className="text-lg font-bold text-media-surface-container-lowest tracking-tight leading-tight">
                      {journal.title}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Archives Section */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-media-primary">Archives</h3>
            <p className="text-media-on-surface-variant text-sm font-light">Journey through your historical reflections.</p>
          </div>
          <div className="flex space-x-2">
            <button className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center bg-media-surface-container hover:bg-media-surface-container-high transition-colors text-media-on-surface-variant">
              <MaterialSymbol icon="filter_list" className="w-5 h-5" />
            </button>
            <button className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center bg-media-surface-container hover:bg-media-surface-container-high transition-colors text-media-on-surface-variant">
              <MaterialSymbol icon="grid_view" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {archiveJournals.map((journal, idx) => {
            const mood = getMoodDetails(journal.mood);
            const imageIdx = (idx + 3) % DEFAULT_IMAGES.length;
            return (
              <div 
                key={journal.id}
                onClick={() => router.push(`/journals/${journal.slug}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-media-surface-container-low mb-4 relative">
                  <img 
                    src={DEFAULT_IMAGES[imageIdx]} 
                    alt={journal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-media-surface/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MaterialSymbol icon="bookmark" className="w-4 h-4 text-media-primary" />
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-media-secondary tracking-widest uppercase">
                    {formatDate(journal.created_at)}
                  </span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium ml-2", mood.color, mood.textColor)}>
                    {mood.label}
                  </span>
                </div>
                <h6 className="text-lg font-bold text-media-primary tracking-tight group-hover:text-media-secondary transition-colors line-clamp-1">
                  {journal.title}
                </h6>
                <p className="text-xs text-media-on-surface-variant mt-2 line-clamp-2 font-light">
                  {journal.content.replace(/[#*]/g, '').substring(0, 100)}...
                </p>
              </div>
            );
          })}
        </div>

        {journals.length > visibleCount && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={handleLoadMore}
              className="cursor-pointer bg-media-primary text-media-on-primary px-10 py-4 rounded-lg font-bold tracking-tight hover:bg-media-primary/90 transition-colors flex items-center space-x-3"
            >
              <span>Explore Further</span>
              <MaterialSymbol icon="expand_more" className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      <FloatingActionButton 
        onClick={() => router.push('/journals/new')} 
        tooltipText="New Journal" 
        icon={<MaterialSymbol icon="edit_note" className="text-3xl" fill />}
      />
    </div>
  );
}

