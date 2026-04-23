"use client";

import React, { useState } from "react";
import { ConnectedAccount } from "@/lib/actions/settings";
import { ThemeSettings } from "@/components/widgets/settings/theme-settings";
import { BirthdayManager } from "@/components/widgets/settings/birthday-manager";
import { WeatherLocationManager } from "@/components/widgets/settings/weather-location-manager";
import { MediaTagsGenresManager } from "@/components/widgets/settings/media-tags-genres-manager";
import { IntegrationsCard } from "@/components/widgets/settings/integrations-card";
import { SignOutButton } from "@/components/widgets/settings/sign-out-button";
import { PWAInstallCard } from "@/components/widgets/settings/pwa-install-card";
import { CalendarColorsManager } from "@/components/widgets/settings/calendar-colors-manager";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SettingsPageClientProps {
  connectedAccounts: ConnectedAccount[];
}

export function SettingsPageClient({ connectedAccounts }: SettingsPageClientProps) {
  const [isTaxonomyExpanded, setIsTaxonomyExpanded] = useState(false);

  return (
    <div className="flex">
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-2 font-lexend">
              Workspace Settings
            </h1>
            <p className="text-on-surface-variant max-w-xl">
              Configure your sensory environment and personal parameters for the Homepage ecosystem.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Appearance Section */}
          <section className="bg-media-surface-container rounded-xl p-8 flex flex-col h-full border border-media-outline-variant/20">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-media-primary">contrast</span>
              <h2 className="text-xl font-bold text-media-on-surface">Appearance</h2>
            </div>
            <div className="space-y-6">
              <ThemeSettings />
              <CalendarColorsManager />
            </div>
          </section>

          {/* Personal Profile Section */}
          <section className="bg-media-surface-container-high rounded-xl p-8 flex flex-col h-full border border-media-outline-variant/20">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-media-primary">person</span>
              <h2 className="text-xl font-bold text-media-on-surface">Personal Profile</h2>
            </div>
            <div className="space-y-6 flex-1">
              <BirthdayManager />
              <WeatherLocationManager />
              
              {/* Bio Field (Placeholder as requested by prototype but not in backend) */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
                  Personal Bio
                </label>
                <textarea
                  className="w-full bg-media-surface border border-media-outline-variant/40 rounded-lg p-4 text-media-on-surface focus:ring-2 focus:ring-media-primary/20 focus:border-media-primary outline-none resize-none"
                  rows={3}
                  defaultValue="Architect of digital forests, curating life's meaningful fragments in the northern silence."
                />
              </div>
            </div>
          </section>

          {/* Taxonomy Section */}
          <section className="bg-media-surface-container rounded-xl p-8 flex flex-col h-full border border-media-outline-variant/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-media-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-media-primary">tag</span>
                <h2 className="text-xl font-bold text-media-on-surface">Taxonomy</h2>
              </div>
              <button 
                onClick={() => setIsTaxonomyExpanded(!isTaxonomyExpanded)}
                className="p-2 rounded-full hover:bg-media-primary/10 transition-colors text-media-on-surface-variant"
              >
                {isTaxonomyExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {isTaxonomyExpanded ? (
              <>
                <div className="flex-1">
                  <MediaTagsGenresManager />
                </div>
                <div className="bg-media-primary/5 p-4 rounded-lg mt-auto border border-media-primary/10">
                  <p className="text-xs text-media-on-surface-variant italic mb-0">
                    Global tags help organize your life curation entries into consistent thematic clusters across all modules.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center py-12 border-2 border-dashed border-media-outline-variant/30 rounded-lg">
                <p className="text-sm text-media-on-surface-variant italic">
                  Tag management is currently collapsed. Click the arrow to expand.
                </p>
              </div>
            )}
          </section>

          {/* Account Section */}
          <section className="bg-media-surface-container-high rounded-xl p-8 flex flex-col h-full border border-media-outline-variant/20">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-media-primary">security</span>
              <h2 className="text-xl font-bold text-media-on-surface">Account & Security</h2>
            </div>
            <div className="space-y-4 flex-1">
              <IntegrationsCard connectedAccounts={connectedAccounts} />
              <PWAInstallCard />
            </div>
            <div className="pt-6 border-t border-media-outline-variant/30 mt-6">
              <SignOutButton />
            </div>
          </section>
        </div>


        {/* Footer Area */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-48 rounded-xl overflow-hidden group border border-media-outline-variant/30">
            <img
              alt="Atmospheric forest"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEN9nmLd-1bTq8uOF2bJP8UJVFALDDRGCpe2QogJrBCVjVazQ3sWjZe21M713LbDWy3DiPUwzpAnXMy44UW1BG4XSxPK2dZmW--EyECvDVUb8v_Qj3fB2uZSCV80gceft4VsPb-gRmaAk9h3HQ4Gesc1C3V6jSBL_ahyZLmx9dQopkU0Oxd21q9OddggoCk1pb5R4kdNqOxXfV_E-ZNJ-vkEbgHFKRcpBMiIYKDWoclwABbtBTafmRpWDt3sdoiKDZuNnYJSmCuaA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-media-primary/60 to-transparent"></div>
            <div className="absolute bottom-4 left-6">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-white/90">
                Zen Mode
              </span>
              <p className="text-sm text-white font-bold">Automatic at 10:00 PM</p>
            </div>
          </div>
          <div className="flex items-center justify-center px-8 text-center bg-media-surface-container border border-media-outline-variant/20 rounded-xl">
            <p className="text-xs text-media-on-surface-variant font-medium">
              Your environment was last synced 2 minutes ago
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
