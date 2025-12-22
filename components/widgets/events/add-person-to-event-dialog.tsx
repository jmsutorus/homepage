'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus } from 'lucide-react';
import { EventPerson } from '@/lib/db/events';
import { type Person } from '@/lib/db/people';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Attendee</DialogTitle>
          <DialogDescription>
            Select a person to add to this event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* People List */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading people...
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {availablePeople.length === 0
                  ? 'All people have been added to this event!'
                  : 'No people found matching your search.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPeople.map((person) => (
                  <Button
                    key={person.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleAddPerson(person.id)}
                    disabled={isAdding}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar>
                        <AvatarImage src={person.photo || undefined} alt={person.name} />
                        <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{person.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRelationshipVariant(person.relationship)}>
                            {person.relationshipTypeName || person.relationship}
                          </Badge>
                        </div>
                      </div>
                      <UserPlus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
