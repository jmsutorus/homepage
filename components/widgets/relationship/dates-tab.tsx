"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Star, DollarSign, Trash2, Edit } from "lucide-react";
import { CreateDateDialog } from "./create-date-dialog";
import { MobileDateSheet } from "./mobile-date-sheet";
import { EditDateDialog } from "./edit-date-dialog";
import { DateTypeIcon } from "./date-type-icon";
import { DateCardBackground } from "./date-card-background";
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
    <div className="space-y-16">
      {/* Editorial Header */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-7">
          <p className="text-primary font-font-lexend uppercase tracking-[0.2em] text-xs mb-4">Volume IV: {new Date().getFullYear()}</p>
          <h2 className="text-4xl md:text-6xl font-playfair font-bold text-primary tracking-tight leading-none mb-6">
            Our Written <br/>History
          </h2>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            A curated collection of moments, flavors, and horizons shared between two souls. Every entry a brushstroke on the canvas of us.
          </p>
        </div>
        <div className="md:col-span-5 flex justify-end">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary text-primary-foreground px-8 py-6 rounded-xl flex items-center space-x-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold tracking-wide">Add Date</span>
          </Button>
        </div>
      </section>

      {/* Featured Grid */}
      {dates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Featured Item */}
          <div className="md:col-span-2 md:row-span-2 group">
            <div className="relative h-[500px] md:h-full rounded-2xl overflow-hidden bg-muted shadow-sm brush-edges">
              <img
                src={dates[0].photos || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"}
                alt="Featured Date"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 watercolor-texture"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent"></div>
              <div className="absolute bottom-0 p-8 w-full">
                <div className="flex items-center space-x-2 text-primary-foreground/70 mb-2">
                  <Star className="h-4 w-4 fill-primary" />
                  <span className="text-xs uppercase tracking-widest font-font-lexend">Recent Highlight</span>
                </div>
                <h3 className="text-white text-3xl font-playfair font-bold mb-2">
                  {dates[0].venue || "Special Outing"}
                </h3>
                <p className="text-white/80 text-sm flex items-center space-x-2 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{dates[0].location || "Somewhere Special"}</span>
                </p>
                <div className="bg-white/10 kinetic-harmony-glass p-6 rounded-xl border border-white/10 max-w-lg">
                  <div className="flex items-center mb-3">
                    {Array.from({ length: dates[0].rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-white/90 italic text-sm leading-relaxed">
                    "{dates[0].notes || "A moment to remember forever."}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Featured Items */}
          {dates.slice(1, 3).map((date, idx) => (
            <div key={date.id} className="group h-[320px]">
              <div className="relative h-full rounded-2xl overflow-hidden bg-muted transition-all brush-edges">
                <img
                  src={date.photos || (idx === 0
                    ? "https://images.unsplash.com/photo-1514525253361-bee8718a300c?q=80&w=1974&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop"
                  )}
                  alt="Date highlight"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 watercolor-texture"
                />
                <div className="absolute inset-0 bg-zinc-950/50 group-hover:bg-zinc-950/30 transition-all"></div>
                <div className="absolute bottom-0 p-6">
                  <h4 className="text-white text-xl font-bold">{date.venue || "Date Night"}</h4>
                  <p className="text-white/70 text-xs mb-3">{date.location || "Local Spot"}</p>
                  <div className="flex space-x-1 mb-2 text-primary">
                    {Array.from({ length: date.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/90 text-xs line-clamp-2 italic">{date.notes || "Another beautiful chapter."}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline List */}
      <section className="mt-20 space-y-12 max-w-4xl rel-timeline-line relative pl-12 pr-4 ml-4">
        {dates.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-playfair font-bold">The canvas is still blank</p>
            <p className="text-sm mt-2">Start adding your special moments together!</p>
          </div>
        ) : (
          dates.map((date, idx) => (
            <div key={date.id} className="relative pb-8 group">
              <div className="absolute -left-[54px] top-0 w-10 h-10 rounded-full bg-primary border-4 border-background z-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DateTypeIcon type={date.type} className="h-4 w-4 text-primary-foreground" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-font-lexend text-muted-foreground tracking-widest uppercase">
                    {formatDateLongSafe(date.date, "en-US")}
                  </span>
                  <h3 className="text-2xl font-bold text-primary mt-1">{date.venue || "Unnamed Date"}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-4 bg-muted/50 px-4 py-2 rounded-full border border-border">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{date.location || date.venue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDate(date)}
                      className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(date.id)}
                      className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-8 bg-card rounded-2xl shadow-sm border border-border hover:border-primary/30 transition-colors relative overflow-hidden">
                <div className={`flex gap-6 ${date.photos ? 'flex-col md:flex-row' : ''}`}>
                  {date.photos && (
                    <div className="flex-shrink-0">
                      <img
                        src={date.photos}
                        alt="Date photo"
                        className="h-40 w-40 rounded-xl object-cover hover:scale-105 transition-transform shadow-md"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-muted-foreground leading-relaxed italic">
                      {date.notes || "No notes for this special moment."}
                    </p>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest font-font-lexend">Rating:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (date.rating || 0)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

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
