'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, X, ArrowRight } from 'lucide-react';
import { EventPerson } from '@/lib/db/events';
import { type Person } from '@/lib/db/people';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { PersonFormDialog } from '../people/person-form-dialog';
import { cn } from '@/lib/utils';

interface AddPersonToEventDialogProps {
  eventSlug: string;
  existingPeople: EventPerson[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const getRelationshipVariant = (relationship: string) => {
  switch (relationship) {
    case 'family': return 'default';
    case 'friends': return 'secondary';
    case 'work': return 'outline';
    default: return 'secondary';
  }
};

export function AddPersonToEventDialog({
  eventSlug,
  existingPeople,
  open,
  onOpenChange,
  onSuccess,
}: AddPersonToEventDialogProps) {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isNewPersonDialogOpen, setIsNewPersonDialogOpen] = useState(false);

  // Fetch all people when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      fetchPeople();
    }
  }, [open]);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/people');
      if (!response.ok) throw new Error('Failed to fetch people');
      const data = await response.json();
      setAllPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
      showCreationError('event', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out people already added to event
  const existingPersonIds = new Set(existingPeople.map(p => p.personId));
  const availablePeople = allPeople.filter(p => !existingPersonIds.has(p.id));

  // Filter by search query
  const filteredPeople = availablePeople.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPerson = async (personId: number) => {
    setIsAdding(true);
    try {
      const response = await fetch(`/api/events/${eventSlug}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add person');
      }

      showCreationSuccess('event');
      onSuccess();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="p-0 border-none max-w-xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-media-surface font-lexend">
          {/* Modal Header */}
          <div className="px-10 py-8 flex justify-between items-center bg-media-surface-container-low shrink-0">
            <h2 className="text-3xl font-black text-media-primary tracking-tighter uppercase border-b-4 border-media-secondary inline-block pb-1">
              Add to Directory
            </h2>
            <button 
              onClick={() => onOpenChange(false)}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-media-surface-container-high transition-colors text-media-on-surface-variant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-media-outline transition-colors group-focus-within:text-media-secondary" />
                </div>
                <input 
                  className="w-full pl-14 pr-4 py-5 bg-media-surface-container-low border-none rounded-xl focus:ring-0 focus:bg-media-surface-container-high transition-all text-media-on-surface placeholder:text-media-on-surface-variant/60 font-medium" 
                  placeholder="Search by name, email, or tag..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-media-secondary group-focus-within:w-full transition-all duration-500 ease-out"></div>
              </div>
              <p className="text-[10px] text-media-secondary font-black uppercase tracking-widest ml-1 opacity-70">
                Find existing profiles before creating new entries.
              </p>
            </div>

            {/* Search Results Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-media-primary ml-1">
                  Suggested Matches
                </h3>
                <span className="text-[10px] text-media-secondary font-black bg-media-secondary/10 px-3 py-1 rounded-full uppercase">
                  {filteredPeople.length} found
                </span>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="py-12 text-center text-media-on-surface-variant font-medium animate-pulse">
                    Scanning the directory...
                  </div>
                ) : filteredPeople.length === 0 ? (
                  <div className="py-12 text-center text-media-on-surface-variant italic opacity-50 border-2 border-dashed border-media-outline-variant/30 rounded-3xl">
                    {availablePeople.length === 0
                      ? 'All people have been added to this journey!'
                      : 'No profiles found matching your query.'}
                  </div>
                ) : (
                  filteredPeople.map((person) => (
                    <div 
                      key={person.id} 
                      onClick={() => !isAdding && handleAddPerson(person.id)}
                      className={cn(
                        "group flex items-center p-5 bg-media-surface-container-lowest hover:bg-media-primary transition-all duration-500 rounded-2xl cursor-pointer editorial-shadow border border-media-outline-variant/30",
                        isAdding && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Avatar className="w-14 h-14 border-4 border-media-surface editorial-shadow transition-transform group-hover:scale-110 duration-300">
                        <AvatarImage src={person.photo || undefined} alt={person.name} className="object-cover" />
                        <AvatarFallback className="bg-media-secondary text-white font-black text-lg">
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-5 flex-1">
                        <h4 className="font-black text-media-primary text-xl group-hover:text-white transition-colors">
                          {person.name}
                        </h4>
                        <p className="text-[11px] text-media-on-surface-variant font-bold uppercase tracking-tighter group-hover:text-white/70 transition-colors">
                          {person.email || 'No email registered'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-media-secondary/10 text-media-secondary text-[10px] font-black uppercase rounded-full group-hover:bg-white/20 group-hover:text-white transition-colors">
                          {person.relationshipTypeName || person.relationship}
                        </span>
                        <ArrowRight className="w-5 h-5 text-media-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all group-hover:text-white" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Action Section */}
            <div className="pt-6 border-t border-media-outline-variant/15">
              <div 
                onClick={() => setIsNewPersonDialogOpen(true)}
                className="group p-8 bg-media-secondary-fixed/30 border border-media-secondary/10 flex items-center justify-between rounded-2xl hover:bg-media-secondary-fixed/50 transition-all cursor-pointer editorial-shadow"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-media-secondary flex items-center justify-center editorial-shadow transition-transform group-hover:rotate-12">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-media-primary text-2xl tracking-tighter">Add a New Person</h4>
                    <p className="text-sm text-media-on-surface-variant font-bold uppercase tracking-widest opacity-70">
                      Create a profile from scratch
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-media-secondary/30 flex items-center justify-center group-hover:bg-media-secondary group-hover:border-media-secondary transition-all">
                  <ArrowRight className="w-5 h-5 text-media-secondary group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-10 py-8 bg-media-surface-container-low border-t border-media-outline-variant/30 flex items-center justify-end gap-6 shrink-0">
            <button 
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-media-on-surface-variant font-black uppercase tracking-widest text-[11px] hover:text-media-primary transition-colors"
            >
              Dismiss
            </button>
            <button 
              onClick={() => onOpenChange(false)}
              className="cursor-pointer bg-media-primary text-white px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:scale-105 active:scale-95 transition-all editorial-shadow"
            >
              Finalize
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <PersonFormDialog
        open={isNewPersonDialogOpen}
        onOpenChange={setIsNewPersonDialogOpen}
        editingPerson={null}
        onSuccess={() => {
          setIsNewPersonDialogOpen(false);
          fetchPeople();
        }}
      />
    </>
  );
}
