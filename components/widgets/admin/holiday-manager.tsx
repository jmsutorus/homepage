"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Holiday {
  id: number;
  name: string;
  month: number;
  day: number;
  year: number | null;
  created_at: string;
  updated_at: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function HolidayManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [newName, setNewName] = useState("");
  const [newMonth, setNewMonth] = useState(1);
  const [newDay, setNewDay] = useState(1);
  const [editName, setEditName] = useState("");
  const [editMonth, setEditMonth] = useState(1);
  const [editDay, setEditDay] = useState(1);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await fetch("/api/holidays");
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          month: newMonth,
          day: newDay,
        }),
      });

      if (response.ok) {
        setNewName("");
        setNewMonth(1);
        setNewDay(1);
        await fetchHolidays();
      } else if (response.status === 409) {
        alert("A holiday with this name and date already exists");
      }
    } catch (error) {
      console.error("Failed to create holiday:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchHolidays();
        if (data.created > 0) {
          alert(`Added ${data.created} default holidays`);
        } else {
          alert("All default holidays already exist");
        }
      }
    } catch (error) {
      console.error("Failed to seed holidays:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleStartEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setEditName(holiday.name);
    setEditMonth(holiday.month);
    setEditDay(holiday.day);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditMonth(1);
    setEditDay(1);
  };

  const handleSaveEdit = async (holidayId: number) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/holidays/${holidayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          month: editMonth,
          day: editDay,
        }),
      });

      if (response.ok) {
        handleCancelEdit();
        await fetchHolidays();
      } else if (response.status === 409) {
        alert("A holiday with this name and date already exists");
      }
    } catch (error) {
      console.error("Failed to update holiday:", error);
    }
  };

  const handleDelete = async (holidayId: number) => {
    if (!confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    setDeletingId(holidayId);
    try {
      const response = await fetch(`/api/holidays/${holidayId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchHolidays();
      }
    } catch (error) {
      console.error("Failed to delete holiday:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (month: number, day: number) => {
    return `${MONTHS[month - 1]} ${day}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seed Defaults Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleSeedDefaults}
          disabled={isSeeding}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isSeeding ? "Adding..." : "Add Default USA Holidays"}
        </Button>
      </div>

      {/* Add Holiday Form */}
      <form onSubmit={handleAddHoliday} className="space-y-4 p-4 border rounded-lg bg-card">
        <h3 className="font-semibold">Add New Holiday</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Holiday name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isAdding}
            />
          </div>
          <div>
            <Label htmlFor="month">Month</Label>
            <select
              id="month"
              value={newMonth}
              onChange={(e) => setNewMonth(parseInt(e.target.value))}
              disabled={isAdding}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {MONTHS.map((month, i) => (
                <option key={i} value={i + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="day">Day</Label>
            <Input
              id="day"
              type="number"
              min={1}
              max={31}
              value={newDay}
              onChange={(e) => setNewDay(parseInt(e.target.value) || 1)}
              disabled={isAdding}
            />
          </div>
        </div>
        <Button type="submit" disabled={isAdding || !newName.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>
      </form>

      {/* Holidays List */}
      <div className="space-y-2">
        <h3 className="font-semibold">Configured Holidays ({holidays.length})</h3>
        {holidays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No holidays configured. Add one above or click &quot;Add Default USA Holidays&quot;.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                {editingId === holiday.id ? (
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1 min-w-[120px]"
                      autoFocus
                    />
                    <select
                      value={editMonth}
                      onChange={(e) => setEditMonth(parseInt(e.target.value))}
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                    >
                      {MONTHS.map((month, i) => (
                        <option key={i} value={i + 1}>{month.slice(0, 3)}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={editDay}
                      onChange={(e) => setEditDay(parseInt(e.target.value) || 1)}
                      className="h-8 w-16"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSaveEdit(holiday.id)}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{holiday.name}</span>
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        holiday.month === 12 && "bg-red-500/10 text-red-500",
                        holiday.month === 7 && "bg-blue-500/10 text-blue-500",
                        holiday.month === 11 && "bg-orange-500/10 text-orange-500"
                      )}>
                        {formatDate(holiday.month, holiday.day)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleStartEdit(holiday)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(holiday.id)}
                        disabled={deletingId === holiday.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
