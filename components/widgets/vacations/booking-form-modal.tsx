"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion, PanInfo } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Trash2 } from "lucide-react";
import { 
  Booking, 
  BookingType, 
  BOOKING_TYPES, 
  BOOKING_TYPE_NAMES, 
  BookingStatus, 
  BOOKING_STATUSES, 
  BOOKING_STATUS_NAMES 
} from "@/lib/types/vacations";
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';

interface BookingFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  vacationSlug: string;
  onSave: () => void;
}

export function BookingFormModal({ isOpen, onOpenChange, booking, vacationSlug, onSave }: BookingFormModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (booking) {
        setFormData(booking);
        if (booking.location || booking.origin || booking.destination) {
          setIsLocationExpanded(true);
        }
      } else {
        setFormData({ 
          type: 'flight' as BookingType, 
          status: 'pending' as BookingStatus,
          notification_setting: 'day_before'
        });
        setIsLocationExpanded(false);
      }
    }
  }, [isOpen, booking]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.type || !formData.title) return;

    setIsSaving(true);
    try {
      const endpoint = booking?.id
        ? `/api/vacations/${vacationSlug}/bookings/${booking.id}`
        : `/api/vacations/${vacationSlug}/bookings`;
      const method = booking?.id ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save booking');

      showCreationSuccess('event');
      onOpenChange(false);
      onSave();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!booking?.id || !confirm('Delete this booking?')) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/vacations/${vacationSlug}/bookings/${booking.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      showCreationSuccess('event');
      onOpenChange(false);
      onSave();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="b-type">Type</Label>
            <Select
              value={formData.type || 'flight'}
              onValueChange={(value) => setFormData({ ...formData, type: value as BookingType })}
            >
              <SelectTrigger id="b-type">
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
          <div className="space-y-2">
            <Label htmlFor="b-status">Status</Label>
            <Select
              value={formData.status || 'pending'}
              onValueChange={(value) => setFormData({ ...formData, status: value as BookingStatus })}
            >
              <SelectTrigger id="b-status">
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

        <div className="space-y-2">
          <Label htmlFor="b-title">Title *</Label>
          <Input
            id="b-title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., United Flight 1234"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="b-provider">Provider</Label>
          <Input
            id="b-provider"
            value={formData.provider || ''}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            placeholder="e.g., Delta, Hilton"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="b-date">Date</Label>
            <Input
              id="b-date"
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-cost">Cost</Label>
            <Input
              id="b-cost"
              type="number"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="b-start-time">Start Time</Label>
            <Input
              id="b-start-time"
              type="time"
              value={formData.start_time || ''}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-confirmation">Confirmation #</Label>
            <Input
              id="b-confirmation"
              value={formData.confirmation_number || ''}
              onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
              placeholder="XYZ123"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="b-url">Confirmation URL</Label>
          <Input
            id="b-url"
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="b-notification">Notification</Label>
          <Select
            value={formData.notification_setting || 'none'}
            onValueChange={(value) => setFormData({ ...formData, notification_setting: value })}
          >
            <SelectTrigger id="b-notification">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="day_before">1 day before</SelectItem>
              <SelectItem value="2_days_before">2 days before</SelectItem>
              <SelectItem value="1_week_before">1 week before</SelectItem>
              <SelectItem value="at_time">At time of event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Collapsible Location Fields */}
        <Collapsible open={isLocationExpanded} onOpenChange={setIsLocationExpanded} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto font-normal text-muted-foreground hover:bg-transparent">
              {isLocationExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Location Details</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="b-location">General Location</Label>
              <Input
                id="b-location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Address or airports"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-origin">Origin</Label>
                <Input
                  id="b-origin"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Starting point"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-destination">Destination</Label>
                <Input
                  id="b-destination"
                  value={formData.destination || ''}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Ending point"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <Label htmlFor="b-notes">Notes</Label>
          <Textarea
            id="b-notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      <div className={cn(isDesktop ? "flex justify-end gap-2" : "grid gap-2")}>
        {booking?.id && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSaving} className={cn(!isDesktop && "w-full")}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
        {isDesktop && (
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving}>
          <Check className="w-4 h-4 mr-2" />
          {booking?.id ? "Save Changes" : "Add Booking"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{booking ? 'Edit' : 'Add'} Booking</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest overflow-hidden">
        <motion.div 
          className="flex flex-col h-full bg-media-surface-container-lowest"
          drag={isAtTop ? "y" : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div 
            className="flex flex-col h-full p-6 pt-2 overflow-y-auto"
            onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
          >
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>{booking ? 'Edit' : 'Add'} Booking</SheetTitle>
              <SheetDescription>
                {booking ? 'Update details' : 'Add new booking'}
              </SheetDescription>
            </SheetHeader>
            {formContent}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
