"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type Person, type RelationshipCategory, type RelationshipType } from "@/lib/db/people";
import { toast } from "sonner";
import { Heart, ChevronDown, Mail, Phone, Image as ImageIcon, Calendar, FileText, Gift } from "lucide-react";

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
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    yearUnknown: false,
    relationship: "other" as RelationshipCategory,
    photo: "",
    email: "",
    phone: "",
    notes: "",
    gift_ideas: "",
    anniversary: "",
    relationship_type_id: null as number | null,
    is_partner: false
  });

  // Fetch relationship types when dialog opens
  useEffect(() => {
    if (open) {
      fetch("/api/relationship-types")
        .then(res => res.json())
        .then(data => setRelationshipTypes(data))
        .catch(err => console.error("Failed to fetch relationship types:", err));
    }
  }, [open]);

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
          gift_ideas: editingPerson.gift_ideas || "",
          anniversary: editingPerson.anniversary || "",
          relationship_type_id: editingPerson.relationship_type_id || null,
          is_partner: editingPerson.is_partner || false
        });
        // Auto-expand sections if they have data
        setIsContactOpen(!!(editingPerson.email || editingPerson.phone || editingPerson.photo));
        setIsAdditionalOpen(!!(editingPerson.anniversary || editingPerson.notes || editingPerson.gift_ideas));
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
          gift_ideas: "",
          anniversary: "",
          relationship_type_id: null,
          is_partner: false
        });
        // Reset collapsible sections
        setIsContactOpen(false);
        setIsAdditionalOpen(false);
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
        gift_ideas: formData.gift_ideas || undefined,
        anniversary: formData.anniversary || undefined,
        relationship_type_id: formData.relationship_type_id,
        is_partner: formData.is_partner
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
      <DialogContent className="p-0 border-none max-w-xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-media-surface font-lexend show-close-button-false">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-media-outline-variant/30 flex justify-between items-center bg-media-surface-container-low shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-media-primary tracking-tight">
              {editingPerson ? "Edit Person" : "Add Person"}
            </h2>
            <p className="text-sm text-media-on-surface-variant font-medium">
              {editingPerson ? "Curate the details of your connection." : "Add a new person to track their birthday and important dates."}
            </p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="cursor-pointer p-2 hover:bg-media-surface-container-highest rounded-full transition-colors text-media-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          {/* Section: Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-media-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-media-secondary text-xl">person</span>
              <h3 className="text-xs font-bold tracking-widest uppercase text-media-secondary">Basic Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-bold text-media-primary ml-1">Name <span className="text-media-secondary">*</span></Label>
                <input
                  id="name"
                  className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface"
                  placeholder="Enter full name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="birthday" className="text-sm font-bold text-media-primary ml-1">Birthday <span className="text-media-secondary">*</span></Label>
                  <div className="relative">
                    <input
                      id="birthday"
                      className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface disabled:opacity-50"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      required
                      disabled={formData.yearUnknown}
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                    <Checkbox
                      id="yearUnknown"
                      checked={formData.yearUnknown}
                      onCheckedChange={(checked) => setFormData({ ...formData, yearUnknown: checked === true })}
                      className="rounded text-media-secondary focus:ring-media-secondary border-media-outline-variant"
                    />
                    <span className="text-xs text-media-on-surface-variant group-hover:text-media-primary transition-colors">Year unknown</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="photo" className="text-sm font-bold text-media-primary ml-1">Photo URL</Label>
                  <div className="relative">
                    <input
                      id="photo"
                      className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface"
                      placeholder="Image URL"
                      type="text"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant">image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Relationship */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-media-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-media-secondary text-xl">favorite</span>
              <h3 className="text-xs font-bold tracking-widest uppercase text-media-secondary">Relationship</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="relationship" className="text-sm font-bold text-media-primary ml-1">Category</Label>
                <div className="relative">
                  <select
                    id="relationship"
                    className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none appearance-none text-media-on-surface"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value as RelationshipCategory })}
                  >
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="relationship_type" className="text-sm font-bold text-media-primary ml-1">Type</Label>
                <div className="relative">
                  <select
                    id="relationship_type"
                    className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none appearance-none text-media-on-surface"
                    value={formData.relationship_type_id?.toString() || "none"}
                    onChange={(e) => setFormData({ ...formData, relationship_type_id: e.target.value === "none" ? null : parseInt(e.target.value, 10) })}
                  >
                    <option value="none">None</option>
                    {relationshipTypes.map((type) => (
                      <option key={type.id} value={type.id.toString()}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div 
              className="bg-media-secondary-fixed/30 border border-media-secondary/10 rounded-xl p-4 flex items-center gap-4 group hover:bg-media-secondary-fixed/50 transition-colors cursor-pointer"
              onClick={() => setFormData({ ...formData, is_partner: !formData.is_partner })}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                  checked={formData.is_partner}
                  onChange={() => {}} // Controlled by parent div click for better experience
                  aria-label="Is Partner"
                />
                <div className={`w-6 h-6 border-2 rounded-md transition-all flex items-center justify-center ${formData.is_partner ? 'bg-media-secondary border-media-secondary' : 'border-media-secondary/40'}`}>
                  {formData.is_partner && (
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-media-secondary" style={{ fontVariationSettings: formData.is_partner ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
                <span className="text-sm font-bold text-media-on-secondary-fixed-variant">Mark as Current Romantic Partner</span>
              </div>
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-media-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-media-secondary text-xl">contact_page</span>
              <h3 className="text-xs font-bold tracking-widest uppercase text-media-secondary">Contact Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-bold text-media-primary ml-1">Email</Label>
                <div className="relative">
                  <input
                    id="email"
                    className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface"
                    placeholder="john@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant">mail</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-bold text-media-primary ml-1">Phone</Label>
                <div className="relative">
                  <input
                    id="phone"
                    className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface"
                    placeholder="(555) 123-4567"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant">call</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Additional Notes */}
          <div className="space-y-6 pb-4">
            <div className="flex items-center gap-2 border-b border-media-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-media-secondary text-xl">event_note</span>
              <h3 className="text-xs font-bold tracking-widest uppercase text-media-secondary">Anniversaries & Notes</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="anniversary" className="text-sm font-bold text-media-primary ml-1">Anniversary</Label>
                <div className="relative">
                  <input
                    id="anniversary"
                    className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface"
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gift_ideas" className="text-sm font-bold text-media-primary ml-1">Gift Ideas</Label>
                <textarea
                  id="gift_ideas"
                  className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none resize-none text-media-on-surface"
                  placeholder="Books, coffee, gadgets..."
                  rows={2}
                  value={formData.gift_ideas}
                  onChange={(e) => setFormData({ ...formData, gift_ideas: e.target.value })}
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-bold text-media-primary ml-1">Personal Notes</Label>
                <textarea
                  id="notes"
                  className="w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none resize-none text-media-on-surface"
                  placeholder="Additional thoughts or milestones..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>
          <button type="submit" className="hidden" id="submit-form-button" />
        </form>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-media-surface-container-low border-t border-media-outline-variant/30 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer px-6 py-3 rounded-xl font-bold text-media-on-surface-variant hover:bg-media-surface-container-highest transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => document.getElementById('submit-form-button')?.click()}
            disabled={isSubmitting}
            className="cursor-pointer bg-media-secondary text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-media-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>{isSubmitting ? "Saving..." : editingPerson ? "Update Profile" : "Add to Directory"}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
