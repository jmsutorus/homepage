"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type Person, type RelationshipCategory } from "@/lib/db/people";
import { toast } from "sonner";

interface PersonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPerson: Person | null;
  onSuccess: () => void;
}

const RELATIONSHIP_OPTIONS: { value: RelationshipCategory; label: string }[] = [
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" }
];

export function PersonFormDialog({ open, onOpenChange, editingPerson, onSuccess }: PersonFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    yearUnknown: false,
    relationship: "other" as RelationshipCategory,
    photo: "",
    email: "",
    phone: "",
    notes: "",
    anniversary: ""
  });

  // Update form when dialog opens or editingPerson changes
  useEffect(() => {
    if (open) {
      if (editingPerson) {
        const [year, month, day] = editingPerson.birthday.split('-');
        setFormData({
          name: editingPerson.name,
          birthday: year === '0000' ? `2000-${month}-${day}` : editingPerson.birthday,
          yearUnknown: year === '0000',
          relationship: editingPerson.relationship,
          photo: editingPerson.photo || "",
          email: editingPerson.email || "",
          phone: editingPerson.phone || "",
          notes: editingPerson.notes || "",
          anniversary: editingPerson.anniversary || ""
        });
      } else {
        // Reset to empty form for adding new person
        setFormData({
          name: "",
          birthday: "",
          yearUnknown: false,
          relationship: "other" as RelationshipCategory,
          photo: "",
          email: "",
          phone: "",
          notes: "",
          anniversary: ""
        });
      }
    }
  }, [open, editingPerson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare birthday with year unknown if checkbox is checked
      let birthday = formData.birthday;
      if (formData.yearUnknown) {
        const [, month, day] = formData.birthday.split('-');
        birthday = `0000-${month}-${day}`;
      }

      const payload = {
        name: formData.name,
        birthday,
        relationship: formData.relationship,
        photo: formData.photo || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        anniversary: formData.anniversary || undefined
      };

      if (editingPerson) {
        // Update
        const response = await fetch(`/api/people/${editingPerson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update person");
        }

        toast.success(`${formData.name} updated successfully`);
      } else {
        // Create
        const response = await fetch("/api/people", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create person");
        }

        toast.success(`${formData.name} added successfully`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving person:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save person");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPerson ? "Edit Person" : "Add Person"}</DialogTitle>
          <DialogDescription>
            {editingPerson
              ? "Update the person's information"
              : "Add a new person to track their birthday and important dates"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
            />
          </div>

          {/* Birthday */}
          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday *</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              required
              disabled={formData.yearUnknown}
            />
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="yearUnknown"
                checked={formData.yearUnknown}
                onCheckedChange={(checked) => setFormData({ ...formData, yearUnknown: checked === true })}
              />
              <Label htmlFor="yearUnknown" className="text-sm font-normal cursor-pointer">
                Year unknown
              </Label>
            </div>
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value as RelationshipCategory })}
            >
              <SelectTrigger id="relationship">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Anniversary */}
          <div className="space-y-2">
            <Label htmlFor="anniversary">Anniversary</Label>
            <Input
              id="anniversary"
              type="date"
              value={formData.anniversary}
              onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this person..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingPerson ? "Update" : "Add Person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
