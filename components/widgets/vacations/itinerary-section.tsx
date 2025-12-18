'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, DollarSign, Trash2, Edit2, Check, X } from 'lucide-react';
import { ItineraryDay, Vacation, parseLocalDate } from '@/lib/types/vacations';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';

interface ItinerarySectionProps {
  vacation: Vacation;
  itinerary: ItineraryDay[];
  onUpdate: () => void;
}

export function ItinerarySection({ vacation, itinerary, onUpdate }: ItinerarySectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<ItineraryDay>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    const nextDayNumber = itinerary.length + 1;
    const startDate = parseLocalDate(vacation.start_date);
    const nextDate = new Date(startDate.getTime() + (nextDayNumber - 1) * 24 * 60 * 60 * 1000);
    const dateStr = nextDate.toISOString().split('T')[0];

    setFormData({
      day_number: nextDayNumber,
      date: dateStr,
      title: '',
      location: '',
      activities: [],
      notes: '',
    });
    setIsAdding(true);
  };

  const handleEdit = (day: ItineraryDay) => {
    setFormData(day);
    setEditingId(day.id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.date) return;

    setIsSaving(true);
    try {
      const endpoint = editingId
        ? `/api/vacations/${vacation.slug}/itinerary/${editingId}`
        : `/api/vacations/${vacation.slug}/itinerary`;
      const method = editingId ? 'PATCH' : 'POST';

      // Filter out empty strings from activities before saving
      const dataToSave = {
        ...formData,
        activities: formData.activities?.filter(Boolean) || [],
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) throw new Error('Failed to save itinerary day');

      showCreationSuccess('event'); // Itinerary day is like an event
      handleCancel();
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this itinerary day?')) return;

    try {
      const response = await fetch(`/api/vacations/${vacation.slug}/itinerary/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete itinerary day');

      showCreationSuccess('event');
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    }
  };

  const handleActivityChange = (value: string) => {
    // Store as string during editing, will convert to array on save
    setFormData({ ...formData, activities: value.split('\n') });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Itinerary
          </CardTitle>
          <Button onClick={handleAdd} size="sm" disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 mr-1" />
            Add Day
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {itinerary.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No itinerary yet. Add your first day to start planning!
          </p>
        )}

        {/* Existing Days */}
        {itinerary.map((day) => {
          const isEditing = editingId === day.id;

          if (isEditing) {
            return (
              <div key={day.id} className="p-4 border rounded-lg space-y-3 bg-muted/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-day-number">Day #</Label>
                    <Input
                      id="edit-day-number"
                      type="number"
                      value={formData.day_number || ''}
                      onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Arrival in Paris"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Paris, France"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-activities">Activities (one per line)</Label>
                  <Textarea
                    id="edit-activities"
                    value={(formData.activities || []).join('\n')}
                    onChange={(e) => handleActivityChange(e.target.value)}
                    placeholder="Eiffel Tower visit&#10;Seine river cruise"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-budget-planned">Budget Planned</Label>
                    <Input
                      id="edit-budget-planned"
                      type="number"
                      value={formData.budget_planned || ''}
                      onChange={(e) => setFormData({ ...formData, budget_planned: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-budget-actual">Budget Actual</Label>
                    <Input
                      id="edit-budget-actual"
                      type="number"
                      value={formData.budget_actual || ''}
                      onChange={(e) => setFormData({ ...formData, budget_actual: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={day.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Day {day.day_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {parseLocalDate(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {day.title && <h4 className="font-semibold">{day.title}</h4>}
                  {day.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {day.location}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => handleEdit(day)} variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(day.id)} variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {day.activities && day.activities.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase">Activities</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {day.activities.map((activity, idx) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(day.budget_planned || day.budget_actual) && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  {day.budget_planned && <span>Plan: {vacation.budget_currency} {day.budget_planned}</span>}
                  {day.budget_actual && <span>Actual: {vacation.budget_currency} {day.budget_actual}</span>}
                </div>
              )}

              {day.notes && (
                <div className="text-sm text-muted-foreground border-t pt-2 mt-2">
                  {day.notes}
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Day Form */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="new-date">Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-day-number">Day #</Label>
                <Input
                  id="new-day-number"
                  type="number"
                  value={formData.day_number || ''}
                  onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Arrival in Paris"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-location">Location</Label>
              <Input
                id="new-location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Paris, France"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-activities">Activities (one per line)</Label>
              <Textarea
                id="new-activities"
                value={(formData.activities || []).join('\n')}
                onChange={(e) => handleActivityChange(e.target.value)}
                placeholder="Eiffel Tower visit&#10;Seine river cruise"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="new-budget-planned">Budget Planned</Label>
                <Input
                  id="new-budget-planned"
                  type="number"
                  value={formData.budget_planned || ''}
                  onChange={(e) => setFormData({ ...formData, budget_planned: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-budget-actual">Budget Actual</Label>
                <Input
                  id="new-budget-actual"
                  type="number"
                  value={formData.budget_actual || ''}
                  onChange={(e) => setFormData({ ...formData, budget_actual: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
