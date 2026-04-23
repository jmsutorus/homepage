"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JournalContent } from "@/lib/db/journals";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalPhotoEditDialog } from "./journal-photo-edit-dialog";

interface JournalHeroClientProps {
  journal: JournalContent;
  displayMood: number | null;
  dayOfWeek: string;
  mainTitle: string;
}

export function JournalHeroClient({ journal, displayMood, dayOfWeek, mainTitle }: JournalHeroClientProps) {
  const router = useRouter();
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const heroImage = journal.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDdAehNfGris-7VY1n1jbjVISrCikrv3DAOB3BL4tgz2yyr8Xyo0uz1zsktn0p8MBzwAmf9d22pM1x1bzjYvOMJLFC3ClYfNcKKf4R24yCA9jP4HwytP9OqQ-7fGWMCyYbj_7zqfsDS3V3HjBh6F2wtd3OCriCsR2jy7yERtzYS63jes30AeibIVfZpvQ37hRP8QJj2DE3EBHzWRKfHX-Bteprj-eA7TQ62b5j9jrPHzdndOBTYrb7ENvp5zThauyuqywRby76Shco";

  return (
    <div className="relative w-full h-[665px] overflow-hidden group">
      <img 
        alt={journal.title} 
        className="w-full h-full object-cover brightness-[0.85] group-hover:brightness-90 transition-all duration-700" 
        src={heroImage}
      />
      
      {/* Photo Edit Button */}
      <div className="absolute top-8 right-8 z-20">
        <Button
          onClick={() => setIsPhotoDialogOpen(true)}
          size="icon"
          variant="ghost"
          className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border border-white/20 transition-all shadow-lg hover:scale-110 h-12 w-12 group/btn"
          title="Edit Journal Image"
        >
          <Pencil className="w-6 h-6 group-hover/btn:scale-110 text-white transition-transform" />
        </Button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/80 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <p className="text-[#ffdad3] text-sm font-bold tracking-[0.2em] uppercase">{dayOfWeek}</p>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">{mainTitle}</h1>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fd876f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {displayMood && displayMood > 5 ? 'mood' : 'mood_bad'}
                </span>
                <span className="font-bold text-xl text-white">{displayMood ?? "?"}/10</span>
              </div>
              <div className="w-[1px] h-6 bg-white/20"></div>
              <p className="text-white/80 text-xs font-medium tracking-wide capitalize">{journal.journal_type} Journal</p>
            </div>
          </div>
        </div>
      </div>

      <JournalPhotoEditDialog
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        journal={journal}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
