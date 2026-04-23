"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ParkPerson } from "@/lib/db/parks";
import { Person } from "@/lib/db/people";
import { toast } from "sonner";
import { Loader2, Trash2, Search, UserPlus } from "lucide-react";

interface ParkPersonFormDialogProps {
  parkSlug: string;
  person: ParkPerson | null;
  existingPeople: ParkPerson[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ParkPersonFormDialog({ 
  parkSlug, 
  person, 
  existingPeople,
  isOpen, 
  onOpenChange, 
  onSuccess 
}: ParkPersonFormDialogProps) {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && !person) {
      fetchPeople();
    }
  }, [isOpen, person]);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/people");
      if (response.ok) {
        const data = await response.json();
        setAllPeople(data);
      }
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerson = async (personId: number) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/people`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId })
      });

      if (response.ok) {
        toast.success("Companion added successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add companion");
      }
    } catch (error) {
      console.error("Error adding person:", error);
      toast.error("An error occurred");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemovePerson = async () => {
    if (!person) return;
    if (!confirm("Remove this companion from this park visit?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/people/${person.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Companion removed");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to remove companion");
      }
    } catch (error) {
      console.error("Error removing companion:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const existingPersonIds = new Set(existingPeople.map(p => p.personId));
  const filteredPeople = allPeople
    .filter(p => !existingPersonIds.has(p.id))
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-media-outline-variant/10 bg-white/95 backdrop-blur-xl rounded-[2rem] font-lexend">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-media-primary tracking-tighter">
            {person ? "Companion Details" : "Add Companion"}
          </DialogTitle>
          <DialogDescription className="text-media-on-surface-variant font-light">
            {person 
              ? "The souls who shared the trail and the stories." 
              : "Invite others to join the digital memory of this expedition."}
          </DialogDescription>
        </DialogHeader>
        
        {person ? (
          <div className="py-8 flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-media-secondary/20">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={person.photo || undefined} alt={person.name} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-media-primary-container text-media-primary-fixed">
                  {getInitials(person.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-media-primary tracking-tight mb-1">{person.name}</h3>
              <Badge variant="outline" className="rounded-full px-4 py-1 border-media-secondary/30 text-media-secondary uppercase font-black tracking-widest text-[10px]">
                {person.relationshipTypeName || person.relationship || "Explorer"}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-media-secondary/50" />
              <Input 
                placeholder="Search explorers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 rounded-2xl border-media-outline-variant/20 focus:ring-media-secondary/20 h-14 text-lg font-light italic"
              />
            </div>

            <ScrollArea className="h-[300px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-media-secondary/30" />
                </div>
              ) : filteredPeople.length === 0 ? (
                <div className="text-center py-12 text-media-on-surface-variant italic font-light opacity-50">
                  {allPeople.length === 0 ? "No explorers found in your circle." : "Everyone is already here!"}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPeople.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddPerson(p.id)}
                      disabled={isActionLoading}
                      className="w-full group flex items-center gap-4 p-3 rounded-2xl hover:bg-media-surface-container transition-all border border-transparent hover:border-media-outline-variant/10 text-left"
                    >
                      <Avatar className="w-12 h-12 shadow-lg">
                        <AvatarImage src={p.photo || undefined} alt={p.name} />
                        <AvatarFallback className="font-black text-xs">{getInitials(p.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold text-media-primary group-hover:text-media-secondary transition-colors">{p.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-media-secondary/60 font-black">
                          {p.relationshipTypeName || p.relationship}
                        </div>
                      </div>
                      <UserPlus className="w-5 h-5 text-media-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          {person && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleRemovePerson}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Remove Companion
            </Button>
          )}
          <div className="flex-grow" />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-media-outline-variant/20"
          >
            {person ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
