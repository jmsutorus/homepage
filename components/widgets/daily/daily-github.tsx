"use client";

import { useState } from "react";
import { Github, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GithubEvent } from "@/lib/github";

interface DailyGithubProps {
  events: GithubEvent[];
}

const INITIAL_SHOW_COUNT = 5;

export function DailyGithub({ events }: DailyGithubProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayedEvents = expanded ? events : events.slice(0, INITIAL_SHOW_COUNT);
  const hasMore = events.length > INITIAL_SHOW_COUNT;
  const hiddenCount = events.length - INITIAL_SHOW_COUNT;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Github className="h-4 w-4" />
        GitHub Activity ({events.length})
      </h3>
      <div className="space-y-2">
        {displayedEvents.map((event) => (
          <div key={event.id} className="pl-6 border-l-2 border-zinc-500 dark:border-zinc-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {event.type.replace("Event", "")}
              </span>
              <span className="text-xs text-muted-foreground">
                {event.repo.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {event.payload && (event.payload as any).commits && (
              <div className="mt-1 space-y-1">
                {(event.payload as any).commits.map((commit: any) => (
                  <p key={commit.sha} className="text-xs text-muted-foreground pl-2 border-l-2 border-zinc-200 dark:border-zinc-700 truncate">
                    {commit.message}
                  </p>
                ))}
              </div>
            )}
            {event.type === "PullRequestEvent" && (event.payload as any)?.pull_request && (
              <p className="text-xs text-muted-foreground mt-1">
                {(event.payload as any).action} PR #{(event.payload as any).number}: {(event.payload as any).pull_request.title}
              </p>
            )}
            {event.type === "IssuesEvent" && (event.payload as any)?.issue && (
              <p className="text-xs text-muted-foreground mt-1">
                {(event.payload as any).action} issue #{(event.payload as any).issue.number}: {(event.payload as any).issue.title}
              </p>
            )}
          </div>
        ))}
      </div>
      
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-muted-foreground h-7"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {hiddenCount} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}
