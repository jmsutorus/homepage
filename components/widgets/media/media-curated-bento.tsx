"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import app from "@/lib/firebase/client";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface CurationItem {
  title: string;
  connections: string;
  consumedMedia: (string | { title: string; id: string | null })[];
  description: string;
  suggestions: string[];
  icon?: string;
  tags?: string[];
  accentColor?: string;
  styleType?: string;
}

interface MediaCuratedBentoProps {
  curations?: CurationItem[];
  updatedAt?: number | null;
  userId?: string;
}

export function MediaCuratedBento({ curations = [], updatedAt = null, userId }: MediaCuratedBentoProps) {
  const [localCurations, setLocalCurations] = useState<CurationItem[]>(curations);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const getConsumedTitle = (item: any) => {
    if (typeof item === 'string') return item;
    return item?.title || 'Unknown Media';
  };

  const parseSuggestion = (sug: string) => {
    const parts = sug.split(':');
    const title = parts[0]?.trim();
    const reason = parts.slice(1).join(':')?.trim();
    return { title, reason };
  };

  const isOlderThanTwoWeeks = updatedAt ? (Date.now() - updatedAt > 14 * 24 * 60 * 60 * 1000) : false;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const finalUserId = userId;

      if (!finalUserId) {
        toast.error("User authentication not found.");
        return;
      }

      toast.info("Generating AI Collections. This may take 30-60 seconds...");
      
      const response = await fetch("/api/media/curate", { method: "POST" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cloud function generation failed: ${errorData.error || response.statusText}`);
      }
      
      toast.success("Collections generated successfully!");
      
      const db = getFirestore(app);
      const docRef = doc(db, "curations", "media", "users", finalUserId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLocalCurations(docSnap.data()?.bentoBoxes || []);
      }
    } catch (error: any) {
      console.error("Failed to generate collections", error);
      toast.error(error.message || "An error occurred during generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const getLayoutIndex = (curation: CurationItem, index: number) => {
    // Force a tight 2-row layout constraint if exactly 4 items exist:
    if (localCurations.length === 4) {
      if (index === 0) return 0; // Span 8 (Choice A)
      if (index === 1) return 1; // Span 4 (Choice A)
      if (index === 2) return 6; // Span 7 (Choice B)
      if (index === 3) return 3; // Span 5 (Choice A)
    }

    if (curation.styleType === 'large-feature') {
      return (index % 2 === 0) ? 0 : 4;
    }
    if (curation.styleType === 'tall-slim') return 1;
    if (curation.styleType === 'wide') {
      return (index % 2 === 0) ? 2 : 6;
    }
    if (curation.styleType === 'standard') {
      return (index % 2 === 0) ? 3 : 5;
    }

    // Aesthetically pack in groupings of 12 columns:
    const positionInFour = index % 4;
    if (positionInFour === 0) {
      return (index % 8 < 4) ? 0 : 4; // Span 8 (Choice A or Choice B)
    } else if (positionInFour === 1) {
      return 1; // Span 4
    } else if (positionInFour === 2) {
      return (index % 8 < 4) ? 2 : 6; // Span 7 (Choice A or Choice B)
    } else {
      return (index % 8 < 4) ? 3 : 5; // Span 5 (Choice A or Choice B)
    }
  };

  if (!localCurations || localCurations.length === 0) {
    return (
      <section className="px-4 sm:px-8 mb-24 font-lexend">
        <h2 className="text-2xl font-black tracking-tight mb-8 ml-2">Curated Collections</h2>
        <div className="py-24 flex flex-col items-center text-center bg-media-surface-container-low rounded-3xl border border-dashed border-media-outline-variant/30 shadow-sm">
          <div className="w-20 h-20 bg-media-secondary/10 rounded-full flex items-center justify-center mb-6">
            <span className={`material-symbols-outlined text-media-secondary text-4xl ${isGenerating ? 'animate-spin' : 'animate-pulse'}`}>
              {isGenerating ? 'cached' : 'auto_awesome'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-media-primary mb-2 tracking-tight">No AI Suggestions Yet</h3>
          <p className="text-media-on-surface-variant/70 max-w-sm font-light mb-8 text-sm leading-relaxed">
            Connect your consumed media to generate personalized aesthetic collections and insights.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-3 px-6 py-3 bg-media-primary text-white hover:bg-media-primary/90 transition-all rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-media-primary/20 cursor-pointer group border-none ${isGenerating ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <span className={`material-symbols-outlined text-sm ${isGenerating ? "animate-spin" : "transition-transform group-hover:rotate-45"}`}>
              {isGenerating ? "cached" : "auto_awesome"}
            </span>
            {isGenerating ? "Analyzing Media..." : "Generate AI Suggestions"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-8 mb-24 font-lexend">
      <div className="flex items-center justify-between mb-8 ml-2 flex-wrap gap-4">
        <h2 className="text-2xl font-black tracking-tight">Curated Collections</h2>
        {(isOlderThanTwoWeeks || isAdmin) && (
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 bg-media-primary text-white hover:bg-media-primary/90 transition-all rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-media-primary/20 cursor-pointer border-none ${isGenerating ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <span className={`material-symbols-outlined text-sm ${isGenerating ? "animate-spin" : ""}`}>cached</span>
            <span>{isGenerating ? "Regenerating..." : "Regenerate Results"}</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
        {localCurations.map((curation, index) => {
          const title = curation.title;
          const description = curation.description;
          const connections = curation.connections;
          const consumedMedia = curation.consumedMedia || [];
          const suggestions = curation.suggestions || [];
          const icon = curation.icon;
          const tags = curation.tags || [];
          const accentColor = curation.accentColor;

          const layoutIndex = getLayoutIndex(curation, index);

          // Connection Popup Trigger Button Helper
          const renderConnectionButton = (darkBackground: boolean = false) => (
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border-none cursor-pointer transition-all text-[10px] font-bold uppercase tracking-wider mb-6 ${
                    darkBackground 
                      ? "bg-white/20 text-white hover:bg-white/30" 
                      : "bg-media-secondary/10 text-media-secondary hover:bg-media-secondary/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  <span>How suggestions were made</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl bg-media-surface border-media-outline-variant/20 shadow-2xl p-6 font-lexend">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-media-primary text-xl font-bold tracking-tight">
                    <span className="material-symbols-outlined text-media-secondary">auto_awesome</span>
                    <span>Curation Insights</span>
                  </DialogTitle>
                  <DialogDescription className="text-media-on-surface-variant font-light mt-4 text-sm leading-relaxed text-left">
                    {connections}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          );

          if (layoutIndex === 0) {
            // Layout 0: Original Box 1 (Large, image right)
            return (
              <div 
                key={index} 
                className="md:col-span-8 bento-card bg-media-surface-container-lowest rounded-3xl p-8 flex flex-col md:flex-row gap-8 shadow-md border border-media-outline-variant/10 overflow-hidden"
                style={{ 
                  borderColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span 
                        className="material-symbols-outlined text-media-secondary"
                        style={{ color: accentColor && accentColor.startsWith('#') ? accentColor : undefined }}
                      >
                        {icon || 'swords'}
                      </span>
                      <h3 className="text-media-primary text-2xl font-bold tracking-tight">{title}</h3>
                    </div>
                    <p className="text-media-on-surface-variant text-sm leading-relaxed mb-6">{description}</p>
                    
                    {renderConnectionButton()}

                    <div className="flex flex-wrap gap-2 mb-8">
                      {tags.length > 0 ? tags.map((tag, i) => (
                        <div key={i} className="px-3 py-1 rounded-full bg-media-surface-container text-media-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                          {tag}
                        </div>
                      )) : (
                        <>
                          <div className="px-3 py-1 rounded-full bg-media-surface-container text-media-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Epic Scope</div>
                          <div className="px-3 py-1 rounded-full bg-media-surface-container text-media-on-surface-variant text-[10px] font-bold uppercase tracking-wider">World-building</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-media-surface-container">
                    <div>
                      <p 
                        className="text-[10px] uppercase tracking-wider font-bold text-media-secondary mb-2"
                        style={{ color: accentColor && accentColor.startsWith('#') ? accentColor : undefined }}
                      >
                        Recently Read
                      </p>
                      <ul className="text-xs font-bold text-media-primary space-y-1">
                        {consumedMedia.slice(0, 3).map((item, i) => (
                          <li key={i} className="line-clamp-1">{getConsumedTitle(item)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-media-on-surface-variant mb-2">Top Suggestions</p>
                      <ul className="text-xs text-media-on-surface-variant space-y-2">
                        {suggestions.slice(0, 2).map((sug, i) => {
                          const parsed = parseSuggestion(sug);
                          return (
                            <li key={i} className="flex flex-col">
                              <span className="font-bold text-media-primary line-clamp-1">{parsed.title}</span>
                              {parsed.reason && <span className="text-[10px] opacity-75 line-clamp-1 mt-0.5">{parsed.reason}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
                <div 
                  className="w-full md:w-1/3 rounded-2xl bg-cover bg-center min-h-[200px] border border-media-outline-variant/10" 
                  style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbkmgii-QvfHj5JzwswTWXwTQJFetTWUv6yd_aZLTzNIdo5a8pTvCJlRXopTnO6pVvGju9PnoRIR1xD4qT8xl9yxrVKXcsSD2RXjx2NXP3Z6_EPQzZJOHFFqKvAPXb52-lWn7KuMp5SZHlDcFLcKFWOaqpecqYRTfsgNPLBYCYNP-f1WVlXDiHU0GSNxZUPeOsBNPUoJQAYblp2SNGJHtJexXpScK6QrVnTprRvyYbg5S3nU-SRahHu-NgAcA8AUTgWGIdM5cFQpU")` }}
                ></div>
              </div>
            );
          } else if (layoutIndex === 1) {
            // Layout 1: Original Box 2 (Tall/Slim)
            return (
              <div 
                key={index} 
                className="md:col-span-4 bento-card bg-media-primary-container text-media-on-primary-container rounded-3xl p-8 flex flex-col shadow-md border border-media-outline-variant/10 relative overflow-hidden"
                style={{ 
                  borderColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <span className="material-symbols-outlined text-8xl">{icon || 'rocket_launch'}</span>
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed mb-6">{description}</p>
                  
                  {renderConnectionButton()}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[9px] font-bold tracking-wider uppercase">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 mt-auto">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-media-on-primary-container/60">New Recommendations</p>
                    {suggestions.slice(0, 2).map((sug, i) => {
                      const parsed = parseSuggestion(sug);
                      return (
                        <div key={i} className={`flex flex-col gap-1 ${i > 0 ? 'border-t border-white/10 pt-3' : ''}`}>
                          <span className="text-xs font-bold line-clamp-1">{parsed.title}</span>
                          {parsed.reason && <span className="text-[10px] opacity-70 line-clamp-1 mt-0.5">{parsed.reason}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          } else if (layoutIndex === 2) {
            // Layout 2: Original Box 3 (Wide Bottom)
            return (
              <div 
                key={index} 
                className="md:col-span-7 bento-card bg-media-surface-container-low rounded-3xl p-8 flex flex-col md:flex-row gap-8 shadow-md border border-media-outline-variant/10 overflow-hidden"
                style={{ 
                  borderColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div 
                  className="w-full md:w-1/2 rounded-2xl bg-cover bg-center min-h-[180px] border border-media-outline-variant/10" 
                  style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSs9H5WXLQB6qYzHd9YbYrl5eTPDKRlk5k2TsyUMb1D0Hfripp0A-A73dIil1_KMsj3J3UPBwRk3_Ra1YQZJcTdb8Ux2pQG3JWxB394N2SEkR-URs6mgCrUUuOXZdVIcnmhQ2lZOMxdNdOmSmIHGiR7nYdRK-bIzQW7bBlMeMBLLnNL4RC7Eg0_GAWrEB2EYw4D8wJ0nh9lDGoMPsUSPtDrs_E5ujEm_rS41pkxa5FZ_Jw-VQ_tn2_EzeyUlItj18bwoFEiHySOZI")` }}
                ></div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    {icon && (
                      <span 
                        className="material-symbols-outlined text-media-primary text-xl"
                        style={{ color: accentColor && accentColor.startsWith('#') ? accentColor : undefined }}
                      >
                        {icon}
                      </span>
                    )}
                    <h3 className="text-media-primary text-xl font-bold tracking-tight">{title}</h3>
                  </div>
                  <p className="text-media-on-surface-variant text-sm leading-relaxed mb-4">{description}</p>
                  
                  {renderConnectionButton()}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-6">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-media-surface-container text-media-on-surface-variant text-[9px] font-bold uppercase">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs border-b border-media-surface-container pb-2">
                      <span className="text-media-on-surface-variant">Consumed</span>
                      <span className="font-bold text-media-primary line-clamp-1 max-w-[150px] text-right">{consumedMedia.slice(0, 2).map(m => getConsumedTitle(m)).join(', ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-media-on-surface-variant">Next up</span>
                      <span 
                        className="text-media-secondary font-bold line-clamp-1 max-w-[150px] text-right"
                        style={{ color: accentColor && accentColor.startsWith('#') ? accentColor : undefined }}
                      >
                        {suggestions.length > 0 ? parseSuggestion(suggestions[0]).title : "The Last Kingdom"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (layoutIndex === 3) {
            // Layout 3: Original Box 4 (Square/Portrait)
            return (
              <div 
                key={index} 
                className="md:col-span-5 bento-card bg-media-secondary text-media-on-secondary rounded-3xl p-8 flex flex-col justify-between shadow-md border border-media-outline-variant/10 overflow-hidden relative"
                style={{ 
                  backgroundColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div className="absolute -bottom-10 -right-10 opacity-10">
                  <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {icon || 'movie'}
                  </span>
                </div>
                <div className="relative z-10">
                  <div className="bg-white/20 w-fit p-2 rounded-xl mb-6">
                    <span className="material-symbols-outlined text-white">
                      {icon || 'psychology'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-6">{description}</p>
                  
                  {renderConnectionButton(true)}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-8">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative z-10 flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {suggestions.slice(0, 3).map((sug, i) => {
                    const parsed = parseSuggestion(sug);
                    return (
                      <div key={i} className="flex-shrink-0 w-32 bg-white/10 rounded-xl p-3 border border-white/5">
                        <p className="text-[8px] uppercase font-black mb-1 opacity-60 tracking-tighter">Suggestion</p>
                        <p className="text-xs font-bold leading-tight line-clamp-2">{parsed.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else if (layoutIndex === 4) {
            // Layout 4: New Option 1 (Large, image left)
            return (
              <div 
                key={index} 
                className="md:col-span-8 bento-card bg-media-surface-container-lowest rounded-3xl p-8 flex flex-col md:flex-row gap-8 shadow-md border border-media-outline-variant/10 overflow-hidden"
                style={{ 
                  borderColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div 
                  className="w-full md:w-1/3 rounded-2xl bg-cover bg-center min-h-[200px] border border-media-outline-variant/10" 
                  style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCCTx_bcCGkPCu6lxE3MnMLGdAE_whC7W2iZF3mPFT7Md-j_sLO8VjbmPk_LsEisTnKNzX1ciD_qENxFmnNFAMFnOI5Gk4us26V0Y53858LM0oEas91M9GxJbHEE8lmjiRcjAVxFhpkV3qJSe2199wIr0tsRGIiV6Q5KAzbG47MJFmEIGS8Hc-Q2E7ko-fTOd2FsIFAPbApxeiCfhkzkvu9HUijLAO5nu22MvT4LdkO2bbhRTuuT3nXEqjR6iwjLRX72N7i24saZUY")` }}
                ></div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-media-secondary">
                        {icon || 'star'}
                      </span>
                      <h3 className="text-media-primary text-2xl font-bold tracking-tight">{title}</h3>
                    </div>
                    <p className="text-media-on-surface-variant text-sm leading-relaxed mb-6">{description}</p>
                    
                    {renderConnectionButton()}

                    <div className="flex flex-wrap gap-2 mb-8">
                      {tags.length > 0 ? tags.map((tag, i) => (
                        <div key={i} className="px-3 py-1 rounded-full bg-media-surface-container text-media-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                          {tag}
                        </div>
                      )) : (
                        <>
                          <div className="px-3 py-1 rounded-full bg-media-surface-container text-media-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Epic Scope</div>
                          <div className="px-3 py-1 rounded-full bg-media-surface-container text-media-on-surface-variant text-[10px] font-bold uppercase tracking-wider">World-building</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-media-surface-container">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-media-secondary mb-2">Consumed</p>
                      <ul className="text-xs font-bold text-media-primary space-y-1">
                        {consumedMedia.slice(0, 3).map((item, i) => (
                          <li key={i} className="line-clamp-1">{getConsumedTitle(item)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-media-on-surface-variant mb-2">Recommendations</p>
                      <ul className="text-xs text-media-on-surface-variant space-y-2">
                        {suggestions.slice(0, 2).map((sug, i) => {
                          const parsed = parseSuggestion(sug);
                          return (
                            <li key={i} className="flex flex-col">
                              <span className="font-bold text-media-primary line-clamp-1">{parsed.title}</span>
                              {parsed.reason && <span className="text-[10px] opacity-75 line-clamp-1 mt-0.5">{parsed.reason}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (layoutIndex === 5) {
            // Layout 5: New Option 3 (The Art of the Narrative - Subcards)
            return (
              <div 
                key={index} 
                className="md:col-span-5 bento-card bg-media-surface-container-low rounded-3xl p-8 flex flex-col justify-between shadow-md border border-media-outline-variant/10 overflow-hidden"
                style={{ 
                  borderColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-media-primary mb-2">{title}</h3>
                      <p className="text-sm text-media-on-surface-variant leading-relaxed">{description}</p>
                    </div>
                  </div>
                  
                  {renderConnectionButton()}

                  <div className="grid grid-cols-2 gap-4 my-6">
                    {suggestions.slice(0, 2).map((sug, i) => {
                      const parsed = parseSuggestion(sug);
                      return (
                        <div key={i} className="bg-media-surface-container-lowest rounded-xl p-4 flex flex-col justify-between border border-media-outline-variant/5">
                          <div className="size-8 bg-media-secondary/10 rounded-lg flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-media-secondary text-sm">
                              {i === 0 ? 'movie' : 'flare'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-media-primary text-sm mb-1 line-clamp-1">{parsed.title}</p>
                            {parsed.reason && <p className="text-[10px] text-media-on-surface-variant line-clamp-1 mt-0.5">{parsed.reason}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-media-outline-variant/10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Consumed</span>
                  <div className="h-px flex-1 bg-media-outline-variant/30"></div>
                  <p className="text-xs font-bold text-media-primary line-clamp-1 max-w-[150px]">
                    {consumedMedia.slice(0, 2).map(m => getConsumedTitle(m)).join(', ')}
                  </p>
                </div>
              </div>
            );
          } else if (layoutIndex === 6) {
            // Layout 6: New Option 4 (Historical Echoes - Horizontal Split, Image Right)
            return (
              <div 
                key={index} 
                className="md:col-span-7 bento-card relative bg-media-primary-container text-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-md border border-media-outline-variant/10"
                style={{ 
                  borderColor: accentColor && accentColor.startsWith('#') ? accentColor : undefined 
                }}
              >
                <div className="flex-1 p-8 relative z-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">{description}</p>
                    
                    {renderConnectionButton(true)}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-media-secondary mb-3">On the Radar</h4>
                        <div className="space-y-4">
                          {suggestions.slice(0, 2).map((sug, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-white/40 text-sm">
                                {i === 0 ? 'history_edu' : 'gavel'}
                              </span>
                              <p className="text-sm font-medium text-white line-clamp-1">{parseSuggestion(sug).title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">History File</p>
                        {consumedMedia.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center justify-between mt-2">
                            <span className="text-white font-bold text-xs line-clamp-1">{getConsumedTitle(item)}</span>
                            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div 
                  className="w-full md:w-1/3 min-h-[200px] bg-cover bg-center border-l border-white/10" 
                  style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC6_05tazXMW4kW8AZR78qpRg8uai8oEtacC0WDn0CzJ_rE7ITHB7kwJOhhZcyeIzPMfehbYmk_4fJkyfiHfZxlj9GnR3pfDn5X058mtMxUJf7KZhKo_wAA6lAhK1la-Wryf2LknHPO91E8K1kZSmkPldoFZAf-vv8YN1-L48i6Ge58FQ6s8i6p8Wp68SfemE7Igqs1ivgOnv7iv67R2lpO0pBnfHHjgltz3e8Fsx54--933LAlVJ7lGneEm0l11ygNjAhOTWXiWNg")` }}
                ></div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </section>
  );
}
