"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Star, Check, Circle } from "lucide-react";
import Image from "next/image";
import type { DuolingoProfile } from "@/lib/api/duolingo";
import { useState, useTransition } from "react";
import { toggleDuolingoLessonCompletion } from "@/lib/actions/settings";

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  en: "English",
  fr: "French", 
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  hi: "Hindi",
  ar: "Arabic",
  tr: "Turkish",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  nl: "Dutch",
  pl: "Polish",
  ga: "Irish",
  he: "Hebrew",
  vi: "Vietnamese",
  el: "Greek",
  hu: "Hungarian",
  uk: "Ukrainian",
  ro: "Romanian",
  cs: "Czech",
  id: "Indonesian",
  fi: "Finnish",
  sw: "Swahili",
  cy: "Welsh",
  eo: "Esperanto",
  la: "Latin",
  gd: "Scottish Gaelic",
};

interface DuolingoWidgetProps {
  profile: DuolingoProfile | null;
  isCompletedToday?: boolean;
}

export function DuolingoWidget({ profile, isCompletedToday = false }: DuolingoWidgetProps) {
  const [completed, setCompleted] = useState(isCompletedToday);
  const [isPending, startTransition] = useTransition();

  if (!profile) return null;

  const handleToggle = () => {
    const today = new Date().toISOString().split("T")[0];
    startTransition(async () => {
      const result = await toggleDuolingoLessonCompletion(today);
      if (result.success && result.completed !== undefined) {
        setCompleted(result.completed);
      }
    });
  };

  return (
    <Card className={completed ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`relative h-12 w-12 rounded-full overflow-hidden border-2 ${completed ? "border-green-500" : "border-muted"}`}>
            {profile.picture ? (
              <Image
                src={profile.picture}
                alt={profile.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <h3 className="font-semibold truncate mr-2">{profile.name || profile.username}</h3>
              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                {LANGUAGE_NAMES[profile.learningLanguage] || profile.learningLanguage}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-orange-500 font-medium">
                <Flame className="h-4 w-4 fill-orange-500" />
                <span>{profile.streak} Day Streak</span>
              </div>
              
              <div className="flex items-center gap-1">
                 <Star className="h-3 w-3" />
                 <span>{profile.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
          
          <Button
            variant={completed ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={completed ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            {isPending ? (
              <Circle className="h-4 w-4 animate-pulse" />
            ) : completed ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Done
              </>
            ) : (
              "Mark Done"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
