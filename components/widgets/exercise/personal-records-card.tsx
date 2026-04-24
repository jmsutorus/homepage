"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddPrModal } from "./add-pr-modal";
import type { PersonalRecord } from "@/lib/db/personal-records";
import { useRouter } from "next/navigation";

interface PersonalRecordsCardProps {
  initialRecords: PersonalRecord[];
  enableRunning: boolean;
  enableWeights: boolean;
}

function formatTime(totalSeconds: number | null | undefined): string {
  if (!totalSeconds) return "--:--";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getDistanceLabel(distance: number | null | undefined): string {
  if (!distance) return "";
  
  const d = Number(distance.toFixed(2));
  if (d === 26.2) return "Marathon - ";
  if (d === 13.1) return "Half Marathon - ";
  if (d === 6.2) return "10K - ";
  if (d === 3.1) return "5K - ";
  if (d === 1.0) return "1 Mile - ";
  
  return "";
}

export function PersonalRecordsCard({ initialRecords, enableRunning, enableWeights }: PersonalRecordsCardProps) {
  const router = useRouter();
  const [records, setRecords] = useState<PersonalRecord[]>(initialRecords);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // If neither is enabled, don't show the card at all
  if (!enableRunning && !enableWeights) {
    return null;
  }

  const runningRecords = records
    .filter(r => r.type === "running")
    .sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
  const weightsRecords = records.filter(r => r.type === "weights");

  // Determine initial tab
  const defaultTab = enableRunning ? "running" : "weights";

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this PR?")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/exercise/prs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Record deleted");
        setRecords(prev => prev.filter(r => r.id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete record");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/exercise/prs");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
        router.refresh(); // Refresh server state as well
      }
    } catch {
      // Slient fail
    }
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg space-y-3 bg-muted/20">
      <Trophy className="w-10 h-10 text-muted-foreground opacity-50" />
      <h3 className="font-semibold text-lg">No {type} PRs yet</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">Add your first personal record to start tracking your bests.</p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Personal Records
          </CardTitle>
          <CardDescription>Your all-time best performances</CardDescription>
        </div>
        <AddPrModal 
          onSuccess={handleRefresh} 
          enableRunning={enableRunning} 
          enableWeights={enableWeights} 
        />
      </CardHeader>
      <CardContent>
        {enableRunning && enableWeights ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="running">Running</TabsTrigger>
              <TabsTrigger value="weights">Weights</TabsTrigger>
            </TabsList>
            <TabsContent value="running" className="space-y-4">
              {runningRecords.length === 0 ? <EmptyState type="Running" /> : null}
              {runningRecords.map(record => (
                <RecordItem key={record.id} record={record} onDelete={() => handleDelete(record.id)} isDeleting={isDeleting === record.id} />
              ))}
            </TabsContent>
            <TabsContent value="weights" className="space-y-4">
              {weightsRecords.length === 0 ? <EmptyState type="Weights" /> : null}
              {weightsRecords.map(record => (
                <RecordItem key={record.id} record={record} onDelete={() => handleDelete(record.id)} isDeleting={isDeleting === record.id} />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          // If only one is enabled, don't show tabs
          <div className="space-y-4 pt-2">
            {enableRunning && (
              <>
                {runningRecords.length === 0 ? <EmptyState type="Running" /> : null}
                {runningRecords.map(record => (
                  <RecordItem key={record.id} record={record} onDelete={() => handleDelete(record.id)} isDeleting={isDeleting === record.id} />
                ))}
              </>
            )}
            {enableWeights && (
              <>
                {weightsRecords.length === 0 ? <EmptyState type="Weights" /> : null}
                {weightsRecords.map(record => (
                  <RecordItem key={record.id} record={record} onDelete={() => handleDelete(record.id)} isDeleting={isDeleting === record.id} />
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecordItem({ record, onDelete, isDeleting }: { record: PersonalRecord, onDelete: () => void, isDeleting: boolean }) {
  return (
    <div className="group flex items-start justify-between p-5 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
            {record.type === "running" ? `${getDistanceLabel(record.distance)}${record.distance} mi` : record.exercise}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tighter text-foreground">
              {record.type === "running" ? formatTime(record.total_seconds) : record.weight}
            </span>
            {record.type === "weights" && (
              <span className="text-lg font-semibold text-muted-foreground lowercase">
                lbs × {record.reps}
              </span>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{format(new Date(`${record.date}T00:00:00`), "MMM d, yyyy")}</span>
          {record.notes && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="truncate max-w-[200px] md:max-w-[400px]" title={record.notes}>
                {record.notes}
              </span>
            </>
          )}
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
        onClick={onDelete} 
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
