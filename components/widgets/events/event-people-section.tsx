'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trash2, Users } from 'lucide-react';
import { EventPerson } from '@/lib/db/events';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { AddPersonToEventDialog } from './add-person-to-event-dialog';

interface EventPeopleSectionProps {
  eventSlug: string;
  people: EventPerson[];
  onUpdate: () => void;
}

const getRelationshipVariant = (relationship: string) => {
  switch (relationship) {
    case 'family': return 'default';
    case 'friends': return 'secondary';
    case 'work': return 'outline';
    default: return 'secondary';
  }
};

export function EventPeopleSection({ eventSlug, people, onUpdate }: EventPeopleSectionProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleRemove = async (personAssociationId: number, personName: string) => {
    if (!confirm(`Remove ${personName} from this event?`)) return;

    setRemovingId(personAssociationId);
    try {
      const response = await fetch(`/api/events/${eventSlug}/people/${personAssociationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove person');

      showCreationSuccess('event');
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setRemovingId(null);
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
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendees
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Person
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attendees added yet. Click &quot;Add Person&quot; to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={person.photo || undefined} alt={person.name} />
                      <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{person.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getRelationshipVariant(person.relationship)}>
                          {person.relationshipTypeName || person.relationship}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemove(person.id, person.name)}
                    variant="ghost"
                    size="sm"
                    disabled={removingId === person.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPersonToEventDialog
        eventSlug={eventSlug}
        existingPeople={people}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false);
          onUpdate();
        }}
      />
    </>
  );
}
