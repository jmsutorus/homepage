"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Star, DollarSign, Trash2, Edit } from "lucide-react";
import { CreateDateDialog } from "./create-date-dialog";
import { MobileDateSheet } from "./mobile-date-sheet";
import { EditDateDialog } from "./edit-date-dialog";
import type { RelationshipDate } from "@/lib/db/relationship";
import { formatDateLongSafe } from "@/lib/utils";
import { toast } from "sonner";

interface DatesTabProps {
  initialData: RelationshipDate[];
  onRefresh: () => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

export function DatesTab({
  initialData,
  onRefresh,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
}: DatesTabProps) {
  const [dates, setDates] = useState(initialData);
  const [editingDate, setEditingDate] = useState<RelationshipDate | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDateAdded = () => {
    onRefresh();
    fetchDates();
  };

  const handleDateUpdated = () => {
    onRefresh();
    fetchDates();
  };

  const fetchDates = async () => {
    try {
      const response = await fetch("/api/relationship/dates");
      if (response.ok) {
        const data = await response.json();
        setDates(data);
      }
    } catch (error) {
      console.error("Failed to fetch dates:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this date entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/relationship/dates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Date deleted successfully");
        fetchDates();
        onRefresh();
      } else {
        toast.error("Failed to delete date");
      }
    } catch (error) {
      console.error("Failed to delete date:", error);
      toast.error("Failed to delete date");
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      dinner: "bg-orange-500",
      movie: "bg-purple-500",
      activity: "bg-blue-500",
      outing: "bg-green-500",
      concert: "bg-pink-500",
      event: "bg-yellow-500",
      other: "bg-gray-500",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Date Nights & Outings</h2>
          <p className="text-muted-foreground">Track special moments together</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="cursor-pointer hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Date
        </Button>
      </div>

      {/* Date List */}
      {dates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No dates logged yet</p>
            <p className="text-sm mt-2">Start tracking your special moments together!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dates.map((date) => (
            <Card key={date.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getTypeColor(date.type)} text-white`}>
                        {getTypeLabel(date.type)}
                      </Badge>
                      {date.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: date.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      {formatDateLongSafe(date.date, "en-US")}
                      {date.time && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          at {date.time}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDate(date)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(date.id)}
                      className="cursor-pointer text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {date.venue && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{date.venue}</span>
                    {date.location && (
                      <span className="text-muted-foreground">• {date.location}</span>
                    )}
                  </div>
                )}
                {date.cost !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>${date.cost.toFixed(2)}</span>
                  </div>
                )}
                {date.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {date.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog/Sheet - Mobile uses Sheet, Desktop uses Dialog */}
      {isMobile ? (
        <MobileDateSheet
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onDateAdded={handleDateAdded}
        />
      ) : (
        <CreateDateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onDateAdded={handleDateAdded}
        />
      )}

      {/* Edit Dialog */}
      {editingDate && (
        <EditDateDialog
          open={!!editingDate}
          onOpenChange={(open) => !open && setEditingDate(null)}
          date={editingDate}
          onDateUpdated={handleDateUpdated}
        />
      )}
    </div>
  );
}
