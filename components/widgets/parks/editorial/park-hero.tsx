"use client";

import { Star, MapPin, Calendar, Quote, Pencil, Loader2 } from "lucide-react";
import { ParkContent } from "@/lib/db/parks";
import { formatDateLongSafe } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ParkHeroEditorialProps {
  park: ParkContent;
}

export function ParkHeroEditorial({ park }: ParkHeroEditorialProps) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quote, setQuote] = useState(park.quote || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parks/${park.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontmatter: {
            title: park.title,
            category: park.category,
            quote: quote
          },
          content: park.content
        })
      });

      if (response.ok) {
        toast.success("Mantra updated");
        setIsQuoteOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update mantra");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="relative rounded-3xl overflow-hidden h-[600px] md:h-[819px] group font-lexend mb-24">
      {park.poster ? (
        <img
          src={park.poster}
          alt={park.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-media-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-8xl text-media-primary-fixed/20">terrain</span>
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-media-primary/90 via-media-primary/20 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-8 lg:p-16 w-full flex flex-col lg:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-media-surface mb-2">
            <span className="material-symbols-outlined text-media-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="tracking-widest uppercase text-xs font-bold text-media-surface/80">
              {park.state || "Wilderness"}, USA
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-media-surface tracking-tighter mb-4 leading-[0.9]">
            {park.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-media-secondary/90 backdrop-blur px-4 py-2 rounded-xl text-media-on-secondary flex items-center gap-2 shadow-xl border border-white/10">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold">{park.rating ? (park.rating / 2).toFixed(1) : "5.0"}/5</span>
            </div>
            
            <div className="flex items-center gap-2 text-media-surface/90 font-medium text-sm lg:text-base uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
               <span className="material-symbols-outlined text-sm">calendar_today</span>
               <span>{park.visited ? formatDateLongSafe(park.visited, "en-US") : "Undated Expedition"}</span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block relative group/quote">
          <div className="bg-media-surface/5 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 max-w-sm shadow-2xl skew-y-[-1deg] hover:skew-y-0 transition-transform duration-500">
            <Quote className="w-8 h-8 text-media-secondary mb-4 opacity-50" />
            <p className="text-media-surface/90 text-sm italic leading-relaxed font-light mb-4">
              &quot;{park.quote || "Every wilderness reveals a new facet of nature's grandeur."}&quot;
            </p>
            <Button 
              onClick={() => setIsQuoteOpen(true)}
              variant="ghost" 
              size="sm" 
              className="absolute top-4 right-4 opacity-0 group-hover/quote:opacity-100 transition-opacity text-white/50 hover:text-white hover:bg-white/10"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="sm:max-w-[450px] border-media-outline-variant/10 bg-white/95 dark:bg-media-surface-container-high/95 backdrop-blur-xl rounded-[2rem] font-lexend">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-media-primary tracking-tighter">
              The Mantra
            </DialogTitle>
            <DialogDescription className="text-media-on-surface-variant font-light">
              Set the defining spirit of this expedition.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quote" className="text-[10px] font-black uppercase tracking-[0.2em] text-media-secondary">Mantra / Quote</Label>
              <Textarea 
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="What defines this place for you?"
                className="rounded-xl border-media-outline-variant/20 italic font-light min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleUpdateQuote}
              disabled={isLoading}
              className="bg-media-primary text-white rounded-xl px-8 hover:bg-media-secondary transition-all font-black uppercase tracking-widest text-[10px]"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Commemorate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
