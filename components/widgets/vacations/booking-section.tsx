'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Plane, Hotel, MapPin as Activity, Car, Train, MoreHorizontal, Trash2, Edit2, Check, X, DollarSign, Hash, ExternalLink } from 'lucide-react';
import { Booking, Vacation, BOOKING_TYPES, BOOKING_TYPE_NAMES, BOOKING_STATUSES, BOOKING_STATUS_NAMES, BookingType, BookingStatus, parseLocalDate } from '@/lib/types/vacations';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';

interface BookingSectionProps {
  vacation: Vacation;
  bookings: Booking[];
  onUpdate: () => void;
}

const BookingIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-4 h-4" };
  switch (type) {
    case 'flight': return <Plane {...iconProps} />;
    case 'hotel': return <Hotel {...iconProps} />;
    case 'activity': return <Activity {...iconProps} />;
    case 'car': return <Car {...iconProps} />;
    case 'train': return <Train {...iconProps} />;
    default: return <MoreHorizontal {...iconProps} />;
  }
};

export function BookingSection({ vacation, bookings, onUpdate }: BookingSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Group bookings by type
  const bookingsByType = bookings.reduce((acc, booking) => {
    if (!acc[booking.type]) {
      acc[booking.type] = [];
    }
    acc[booking.type].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const handleAdd = () => {
    setFormData({ type: 'flight' as BookingType, status: 'pending' as BookingStatus });
    setIsAdding(true);
  };

  const handleEdit = (booking: Booking) => {
    setFormData(booking);
    setEditingId(booking.id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.type || !formData.title) return;

    setIsSaving(true);
    try {
      const endpoint = editingId
        ? `/api/vacations/${vacation.slug}/bookings/${editingId}`
        : `/api/vacations/${vacation.slug}/bookings`;
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save booking');

      showCreationSuccess('event'); // Booking is like an event
      handleCancel();
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this booking?')) return;

    try {
      const response = await fetch(`/api/vacations/${vacation.slug}/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      showCreationSuccess('event');
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    }
  };

  const renderBookingForm = (isNew: boolean) => (
    <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={`${isNew ? 'new' : 'edit'}-type`}>Type</Label>
          <Select
            value={formData.type || 'flight'}
            onValueChange={(value) => setFormData({ ...formData, type: value as BookingType })}
          >
            <SelectTrigger id={`${isNew ? 'new' : 'edit'}-type`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {BOOKING_TYPE_NAMES[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${isNew ? 'new' : 'edit'}-status`}>Status</Label>
          <Select
            value={formData.status || 'pending'}
            onValueChange={(value) => setFormData({ ...formData, status: value as BookingStatus })}
          >
            <SelectTrigger id={`${isNew ? 'new' : 'edit'}-status`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {BOOKING_STATUS_NAMES[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isNew ? 'new' : 'edit'}-title`}>Title *</Label>
        <Input
          id={`${isNew ? 'new' : 'edit'}-title`}
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., United Flight 1234"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isNew ? 'new' : 'edit'}-provider`}>Provider</Label>
        <Input
          id={`${isNew ? 'new' : 'edit'}-provider`}
          value={formData.provider || ''}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          placeholder="e.g., United Airlines, Hilton"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={`${isNew ? 'new' : 'edit'}-date`}>Date</Label>
          <Input
            id={`${isNew ? 'new' : 'edit'}-date`}
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${isNew ? 'new' : 'edit'}-cost`}>Cost</Label>
          <Input
            id={`${isNew ? 'new' : 'edit'}-cost`}
            type="number"
            value={formData.cost || ''}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={`${isNew ? 'new' : 'edit'}-start-time`}>Start Time</Label>
          <Input
            id={`${isNew ? 'new' : 'edit'}-start-time`}
            type="time"
            value={formData.start_time || ''}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${isNew ? 'new' : 'edit'}-end-time`}>End Time</Label>
          <Input
            id={`${isNew ? 'new' : 'edit'}-end-time`}
            type="time"
            value={formData.end_time || ''}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isNew ? 'new' : 'edit'}-confirmation`}>Confirmation Number</Label>
        <Input
          id={`${isNew ? 'new' : 'edit'}-confirmation`}
          value={formData.confirmation_number || ''}
          onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
          placeholder="ABC123"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isNew ? 'new' : 'edit'}-location`}>Location</Label>
        <Input
          id={`${isNew ? 'new' : 'edit'}-location`}
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Address or location"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isNew ? 'new' : 'edit'}-url`}>Confirmation URL</Label>
        <Input
          id={`${isNew ? 'new' : 'edit'}-url`}
          type="url"
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isNew ? 'new' : 'edit'}-notes`}>Notes</Label>
        <Textarea
          id={`${isNew ? 'new' : 'edit'}-notes`}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
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

  const renderBooking = (booking: Booking) => {
    const isEditing = editingId === booking.id;

    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'confirmed': return 'default';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
      }
    };

    if (isEditing) {
      return (
        <div key={booking.id}>
          {renderBookingForm(false)}
        </div>
      );
    }

    return (
      <div key={booking.id} className="p-4 border rounded-lg space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <BookingIcon type={booking.type} />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">{booking.title}</h4>
                <Badge variant={getStatusVariant(booking.status)}>
                  {BOOKING_STATUS_NAMES[booking.status]}
                </Badge>
              </div>
              {booking.provider && (
                <div className="text-sm text-muted-foreground">{booking.provider}</div>
              )}
              {booking.date && (
                <div className="text-sm text-muted-foreground">
                  {parseLocalDate(booking.date).toLocaleDateString()}
                  {booking.start_time && ` at ${booking.start_time}`}
                </div>
              )}
              {booking.location && (
                <div className="text-sm text-muted-foreground">{booking.location}</div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button onClick={() => handleEdit(booking)} variant="ghost" size="sm">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button onClick={() => handleDelete(booking.id)} variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {booking.confirmation_number && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Hash className="w-3 h-3" />
              {booking.confirmation_number}
            </div>
          )}
          {booking.cost && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              {vacation.budget_currency} {booking.cost.toLocaleString()}
            </div>
          )}
          {booking.url && (
            <a
              href={booking.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View Confirmation
            </a>
          )}
        </div>

        {booking.notes && (
          <div className="text-sm text-muted-foreground border-t pt-2">
            {booking.notes}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bookings</CardTitle>
          <Button onClick={handleAdd} size="sm" disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 mr-1" />
            Add Booking
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {bookings.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No bookings yet. Add flights, hotels, or activities!
          </p>
        )}

        {/* Add New Booking Form */}
        {isAdding && renderBookingForm(true)}

        {/* Bookings Grouped by Type */}
        {Object.keys(bookingsByType).length > 0 && (
          <div className="space-y-6">
            {BOOKING_TYPES.filter((type) => bookingsByType[type]).map((type) => (
              <div key={type} className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BookingIcon type={type} />
                  {BOOKING_TYPE_NAMES[type]}
                  <Badge variant="secondary" className="text-xs">
                    {bookingsByType[type].length}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {bookingsByType[type].map(renderBooking)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
