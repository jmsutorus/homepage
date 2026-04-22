"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  Lock, 
  Heart, 
  Settings, 
  Sparkles, 
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import type { RelationshipPosition } from "@/lib/db/relationship";
import { cn } from "@/lib/utils";

export function ManageTab() {
  const [positions, setPositions] = useState<RelationshipPosition[]>([]);
  const [newPositionName, setNewPositionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch positions on mount
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/relationship/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      } else {
        toast.error("Failed to load positions");
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
      toast.error("Failed to load positions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPositionName.trim()) {
      toast.error("Please enter a position name");
      return;
    }

    if (newPositionName.length > 50) {
      toast.error("Position name must be 50 characters or less");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/relationship/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPositionName.trim() }),
      });

      if (response.ok) {
        const newPosition = await response.json();
        setPositions([...positions, newPosition]);
        setNewPositionName("");
        toast.success("Position added successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add position");
      }
    } catch (error) {
      console.error("Failed to add position:", error);
      toast.error("Failed to add position");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePosition = async (id: number, name: string) => {
    try {
      const response = await fetch(`/api/relationship/positions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPositions(positions.filter((p) => p.id !== id));
        toast.success("Position deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete position");
      }
    } catch (error) {
      console.error("Failed to delete position:", error);
      toast.error("Failed to delete position");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <span className="text-[#9f402d] font-lexend text-xs uppercase tracking-[0.2em] font-bold">
              Registry Settings
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tighter leading-none font-playfair">
              Relationship Management
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed font-light font-lexend">
              Define the taxonomy of your personal world. Configure the settings and categories that structure your interactions and intimate entries.
            </p>
          </div>
          <div className="h-28 w-28 bg-muted rounded-full overflow-hidden shrink-0 hidden md:block border-4 border-background shadow-lg">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1511268594014-0e9d3ea5c33e?q=80&w=2070&auto=format&fit=crop" 
              alt="Management avatar"
            />
          </div>
        </div>
      </header>


      {/* Positions Grid */}
      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <h2 className="text-4xl font-bold text-primary tracking-tight font-playfair">Logistics & Positions</h2>
          <div className="flex items-center gap-2 text-[#9f402d] text-sm font-bold uppercase tracking-widest bg-[#9f402d]/5 px-6 py-2 rounded-full font-lexend">
            <span>{positions.length} Registered</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-lexend">
          {positions.map((position) => (
            <div 
              key={position.id}
              className={cn(
                "group relative flex flex-col gap-4 bg-card p-6 rounded-2xl transition-all hover:scale-[1.03] hover:shadow-xl border border-border/50",
                position.is_default ? "border-primary/10" : "border-[#9f402d]/10"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                position.is_default 
                  ? "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" 
                  : "bg-[#9f402d]/5 text-[#9f402d] group-hover:bg-[#9f402d] group-hover:text-white"
              )}>
                {position.is_default ? <Sparkles className="h-7 w-7" /> : <Heart className="h-7 w-7" />}
              </div>
              <div className="mt-2">
                <span className="block text-primary font-bold text-xl leading-tight">{position.name}</span>
                <span className="block text-muted-foreground text-xs font-medium mt-1 uppercase tracking-wider">
                  {position.is_default ? "System Default" : "Custom Entry"}
                </span>
              </div>

              {!position.is_default && (
                <button 
                  onClick={() => handleDeletePosition(position.id, position.name)}
                  className="cursor-pointer absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-full"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              )}
              {position.is_default && (
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                  <Lock className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}

          {/* Add New Position Card */}
          <div className="group relative flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl transition-all hover:bg-white dark:hover:bg-zinc-800 hover:scale-[1.03] border border-dashed border-border cursor-pointer items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center text-muted-foreground group-hover:bg-[#9f402d]/10 group-hover:text-[#9f402d] transition-colors shadow-sm mb-2">
              <Plus className="h-7 w-7" />
            </div>
            <div className="w-full space-y-3">
              <Input
                placeholder="New Position..."
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPosition();
                }}
                className="h-10 text-center bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 font-bold text-lg"
              />
              <span className="block text-primary font-bold text-lg group-hover:text-[#9f402d] transition-colors sr-only">Add Position</span>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Define a new role</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleAddPosition}
                disabled={isAdding || !newPositionName.trim()}
              >
                Confirm <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 font-lexend">
        {/* Pro Tip Card */}
        <div className="bg-[#061b0e] text-white rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl min-h-[380px]">
          <div className="p-10 flex-1 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#9f402d]"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9f402d]">Pro Tip</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight font-playfair">Optimize Your Interaction Logs</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              By assigning specific relationship labels, the Life Curator engine can automatically generate &quot;Circle Summaries&quot; – a monthly overview of how you&apos;re spending your emotional capital.
            </p>
            <Button className="bg-[#9f402d] hover:bg-[#9f402d]/90 text-white w-fit px-8 py-6 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all">
              Enable Auto-Summary
            </Button>
          </div>
          <div className="md:w-2/5 relative">
            <img 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" 
              src="https://images.unsplash.com/photo-1473186578172-c141e6798ee4?q=80&w=1973&auto=format&fit=crop" 
              alt="Tip visual"
            />
          </div>
        </div>

        {/* Quote/Vision Card */}
        <div className="relative rounded-[32px] overflow-hidden min-h-[380px] bg-zinc-950 group shadow-2xl">
          <img 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" 
            src="https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop" 
            alt="Vision visual"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-12">
            <h4 className="text-white font-playfair text-4xl font-bold leading-tight max-w-sm italic">
              &quot;Connection is the curator&apos;s greatest asset.&quot;
            </h4>
            <div className="flex items-center gap-4 mt-8">
              <span className="h-[2px] w-12 bg-[#9f402d]"></span>
              <p className="text-zinc-400 text-[10px] uppercase tracking-[0.3em] font-bold">The Journal, Issue 04</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <div className="pt-16">
        <div className="w-full h-px bg-border/50"></div>
        <footer className="mt-8 pb-12 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-[10px] gap-4 font-lexend uppercase tracking-widest">
          <p>© 2024 Life Curator. Architectural Relationship Management.</p>
          <div className="flex gap-8 font-bold">
            <a className="hover:text-[#9f402d] transition-colors" href="#">Identity Vault</a>
            <a className="hover:text-[#9f402d] transition-colors" href="#">Privacy Charter</a>
            <a className="hover:text-[#9f402d] transition-colors" href="#">System Logs</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

