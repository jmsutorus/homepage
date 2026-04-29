"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { type Person, type RelationshipCategory, type RelationshipType } from "@/lib/db/people";
import { toast } from "sonner";
import { Image as ImageIcon, X, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { motion, PanInfo } from "framer-motion";

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

interface PersonFormProps {
  editingPerson: Person | null;
  onSaved: () => void;
  onCancel: () => void;
  isDesktop?: boolean;
  onScrollTopChange?: (atTop: boolean) => void;
}

export function PersonForm({ editingPerson, onSaved, onCancel, isDesktop = true, onScrollTopChange }: PersonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoMode, setPhotoMode] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
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
    address: "",
    relationship_type_id: null as number | null,
    is_partner: false
  });

  // Fetch relationship types on mount
  useEffect(() => {
    fetch("/api/relationship-types")
      .then(res => res.json())
      .then(data => setRelationshipTypes(data))
      .catch(err => console.error("Failed to fetch relationship types:", err));
  }, []);

  // Update form when editingPerson changes
  useEffect(() => {
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
        address: editingPerson.address || "",
        relationship_type_id: editingPerson.relationship_type_id || null,
        is_partner: editingPerson.is_partner || false
      });
      setPreviewUrl(editingPerson.photo || null);
    } else {
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
        address: "",
        relationship_type_id: null,
        is_partner: false
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [editingPerson]);

  const isNoPreviewFormat = selectedFile && 
    (selectedFile.name.toLowerCase().endsWith(".heic") || 
     selectedFile.name.toLowerCase().endsWith(".dng"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/people/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload photo");
    }
    return data.photoUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalPhotoUrl = formData.photo;

      // Handle file upload if a file is selected
      if (photoMode === "upload" && selectedFile) {
        setIsUploading(true);
        try {
          finalPhotoUrl = await uploadPhoto(selectedFile);
        } catch (error) {
          toast.error("Photo upload failed. Proceeding with existing URL.");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      }

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
        photo: finalPhotoUrl || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        gift_ideas: formData.gift_ideas || undefined,
        anniversary: formData.anniversary || undefined,
        address: formData.address || undefined,
        relationship_type_id: formData.relationship_type_id,
        is_partner: formData.is_partner
      };

      if (editingPerson) {
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

      onSaved();
    } catch (error) {
      console.error("Error saving person:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save person");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = cn(
    "w-full bg-media-surface-container-low border border-media-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-media-secondary focus:border-media-secondary transition-all outline-none text-media-on-surface",
    !isDesktop && "py-4 bg-media-surface-container-low/40"
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div 
        className={cn("flex-1 overflow-y-auto custom-scrollbar space-y-10", isDesktop ? "p-8" : "p-6")}
        onScroll={(e) => onScrollTopChange?.(e.currentTarget.scrollTop <= 0)}
      >
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
                className={inputClasses}
                placeholder="Enter full name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="birthday" className="text-sm font-bold text-media-primary ml-1">Birthday <span className="text-media-secondary">*</span></Label>
                <div className="relative">
                  <input
                    id="birthday"
                    className={inputClasses}
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
              <Label className="text-sm font-bold text-media-primary ml-1">Profile Photo</Label>
              <div className="bg-media-surface-container border border-media-outline-variant/30 rounded-xl overflow-hidden">
                <div className="flex border-b border-media-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setPhotoMode("upload")}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                      photoMode === "upload" ? "bg-media-secondary text-white" : "text-media-on-surface-variant hover:bg-media-surface-container-high"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode("url")}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                      photoMode === "url" ? "bg-media-secondary text-white" : "text-media-on-surface-variant hover:bg-media-surface-container-high"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                </div>

                <div className="p-4">
                  {photoMode === "upload" ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-media-outline-variant/30 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-media-surface-container-high transition-colors min-h-[120px]"
                    >
                      {previewUrl ? (
                        isNoPreviewFormat ? (
                          <div className="relative w-24 h-24 rounded-full bg-media-surface-container-high flex flex-col items-center justify-center gap-1 border-2 border-dashed border-media-outline-variant/50 text-media-primary p-2">
                            <ImageIcon className="w-6 h-6 text-media-secondary/80" />
                            <p className="text-[8px] font-bold text-center leading-tight">No preview for {selectedFile?.name.split('.').pop()?.toUpperCase()}</p>
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-media-secondary/20 shadow-inner">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-media-surface-container-high flex items-center justify-center text-media-on-surface-variant/30 border border-media-outline-variant/10">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-media-primary uppercase tracking-tight">Click to select photo</p>
                        <p className="text-[9px] text-media-on-surface-variant uppercase">PNG, JPG, WebP, HEIC or DNG</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          id="photo"
                          className={cn(inputClasses, "pr-10")}
                          placeholder="https://example.com/photo.jpg"
                          type="text"
                          value={formData.photo}
                          onChange={(e) => {
                            setFormData({ ...formData, photo: e.target.value });
                            setPreviewUrl(e.target.value || null);
                          }}
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant pointer-events-none">link</span>
                      </div>
                      {previewUrl && (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-media-outline-variant/20 mx-auto">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl(null)} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

          <div className={cn("grid gap-4", isDesktop ? "grid-cols-2" : "grid-cols-1")}>
            <div className="space-y-1.5">
              <Label htmlFor="relationship" className="text-sm font-bold text-media-primary ml-1">Category</Label>
              <div className="relative">
                <select
                  id="relationship"
                  className={cn(inputClasses, "appearance-none")}
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
                  className={cn(inputClasses, "appearance-none")}
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
                onChange={() => {}} // Controlled by parent div click
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

          <div className={cn("grid gap-4", isDesktop ? "grid-cols-2" : "grid-cols-1")}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold text-media-primary ml-1">Email</Label>
              <div className="relative">
                <input
                  id="email"
                  className={inputClasses}
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
                  className={inputClasses}
                  placeholder="(555) 123-4567"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant">call</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-bold text-media-primary ml-1">Address</Label>
            <div className="relative">
              <input
                id="address"
                className={inputClasses}
                placeholder="123 Editorial St, City, Country"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-media-on-surface-variant">map</span>
            </div>
          </div>
        </div>

        {/* Section: Additional Notes - Only show when editing to simplify create form */}
        {editingPerson && (
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
                    className={inputClasses}
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
                  className={cn(inputClasses, "resize-none")}
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
                  className={cn(inputClasses, "resize-none")}
                  placeholder="Additional thoughts or milestones..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>
        )}
        <button type="submit" className="cursor-pointer hidden" id="submit-person-form-button" />
      </div>

      {/* Footer Actions */}
      <div className={cn(
        "p-6 bg-media-surface-container-low dark:bg-media-surface border-t border-media-outline-variant/30 flex shrink-0",
        isDesktop ? "justify-end gap-3" : "flex-col-reverse gap-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      )}>
        <button 
          type="button"
          onClick={onCancel}
          className={cn(
            "cursor-pointer px-6 py-3 rounded-xl font-bold text-media-on-surface-variant hover:bg-media-surface-container-highest transition-colors",
            !isDesktop && "w-full text-sm uppercase tracking-widest"
          )}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={() => document.getElementById('submit-person-form-button')?.click()}
          disabled={isSubmitting || isUploading}
          className={cn(
            "cursor-pointer bg-media-secondary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-media-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100",
            isDesktop ? "px-10 py-3" : "w-full h-14 uppercase tracking-widest"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading Photo...</span>
            </>
          ) : (
            <span>{isSubmitting ? "Saving..." : editingPerson ? "Update Profile" : "Add to Directory"}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function PersonFormDialog({ open, onOpenChange, editingPerson, onSuccess }: PersonFormDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isAtTop, setIsAtTop] = useState(true);

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onSuccess();
    },
  });

  // Reset success state when dialog opens
  useEffect(() => {
    if (open) {
      resetSuccess();
    }
  }, [open, resetSuccess]);

  const handleSaved = () => {
    if (editingPerson) {
      onSuccess();
      onOpenChange(false);
    } else {
      triggerSuccess();
    }
  };

  const successContent = (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
      <div className="relative">
        <TreeSuccess size={160} showText={false} />
        <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Person Added</h3>
        <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
          Directory entry established. Connection details archived.
        </p>
      </div>
    </div>
  );

  const formContent = (
    <PersonForm 
      editingPerson={editingPerson}
      onSaved={handleSaved}
      onCancel={() => onOpenChange(false)}
      isDesktop={isDesktop}
      onScrollTopChange={setIsAtTop}
    />
  );

  const contentBody = showSuccess ? successContent : formContent;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="p-0 border-none max-w-xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-media-surface font-lexend">
          {/* Modal Header */}
          {!showSuccess && (
            <div className="px-8 py-6 border-b border-media-outline-variant/30 flex justify-between items-center bg-media-surface-container-low dark:bg-media-surface shrink-0">
              <div>
                <DialogTitle asChild>
                  <h2 className="text-2xl font-bold text-media-primary tracking-tight">
                    {editingPerson ? "Edit Person" : "Add Person"}
                  </h2>
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-sm text-media-on-surface-variant font-medium">
                    {editingPerson ? "Curate the details of your connection." : "Add a new person to track their birthday and important dates."}
                  </p>
                </DialogDescription>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="cursor-pointer p-2 hover:bg-media-surface-container-highest rounded-full transition-colors text-media-on-surface-variant"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {contentBody}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile View
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90dvh] max-h-[90dvh] rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest flex flex-col [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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

          <div className="flex flex-col h-full font-lexend overflow-hidden">
          {!showSuccess && (
            <SheetHeader className="px-6 pt-8 pb-6 border-b border-media-outline-variant/10">
              <SheetTitle className="text-2xl font-bold text-media-primary tracking-tight text-left">
                {editingPerson ? "Edit Person" : "Add Person"}
              </SheetTitle>
              <SheetDescription className="text-left text-media-on-surface-variant font-medium">
                {editingPerson ? "Curate the details of your connection." : "Add a new person to track their birthday and important dates."}
              </SheetDescription>
            </SheetHeader>
          )}
          {contentBody}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
