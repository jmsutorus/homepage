"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Lock, Clock, Star, Trash2, Edit, ShieldAlert } from "lucide-react";
import { CreateIntimacyDialog } from "./create-intimacy-dialog";
import { MobileIntimacySheet } from "./mobile-intimacy-sheet";
import { EditIntimacyDialog } from "./edit-intimacy-dialog";
import type { IntimacyEntry } from "@/lib/db/relationship";
import { formatDateLongSafe } from "@/lib/utils";
import { toast } from "sonner";

interface IntimacyTabProps {
  initialData: IntimacyEntry[];
  onRefresh: () => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

export function IntimacyTab({
  initialData,
  onRefresh,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: IntimacyTabProps) {
  const [entries, setEntries] = useState(initialData);
  const [editingEntry, setEditingEntry] = useState<IntimacyEntry | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEntryAdded = () => {
    onRefresh();
    fetchEntries();
  };

  const handleEntryUpdated = () => {
    onRefresh();
    fetchEntries();
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/relationship/intimacy");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch intimacy entries:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this private entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/relationship/intimacy/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Entry deleted successfully");
        fetchEntries();
        onRefresh();
      } else {
        toast.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Header */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
        <ShieldAlert className="h-5 w-5 text-pink-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Private & Secure</p>
          <p className="text-xs text-muted-foreground">
            All intimacy data is completely private and visible only to you
          </p>
        </div>
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intimacy Tracking</h2>
          <p className="text-muted-foreground">Private tracking for your relationship</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="cursor-pointer hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Entry List */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No intimacy entries yet</p>
            <p className="text-sm mt-2">Start tracking your private moments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {entry.satisfaction_rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < entry.satisfaction_rating!
                                  ? "fill-pink-500 text-pink-500"
                                  : "text-pink-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {entry.satisfaction_rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      {formatDateLongSafe(entry.date, "en-US")}
                      {entry.time && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          at {entry.time}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingEntry(entry)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="cursor-pointer text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {entry.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.duration} min
                    </Badge>
                  )}
                  {entry.initiation && (
                    <Badge variant="outline">
                      Initiated by: {entry.initiation === "me" ? "You" : entry.initiation}
                    </Badge>
                  )}
                  {entry.location && (
                    <Badge variant="outline">
                      {entry.location.charAt(0).toUpperCase() + entry.location.slice(1)}
                    </Badge>
                  )}
                </div>
                {entry.type && (
                  <p className="text-sm text-muted-foreground">Type: {entry.type}</p>
                )}
                {(entry.mood_before || entry.mood_after) && (
                  <div className="text-xs text-muted-foreground flex gap-4">
                    {entry.mood_before && <span>Before: {entry.mood_before}</span>}
                    {entry.mood_after && <span>After: {entry.mood_after}</span>}
                  </div>
                )}
                {entry.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
                    {entry.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog/Sheet - Mobile uses Sheet, Desktop uses Dialog */}
      {isMobile ? (
        <MobileIntimacySheet
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onEntryAdded={handleEntryAdded}
        />
      ) : (
        <CreateIntimacyDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onEntryAdded={handleEntryAdded}
        />
      )}

      {/* Edit Dialog */}
      {editingEntry && (
        <EditIntimacyDialog
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          entry={editingEntry}
          onEntryUpdated={handleEntryUpdated}
        />
      )}
    </div>
  );
}
