"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Drink } from "@/lib/db/drinks";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialInput } from "@/components/ui/editorial-input";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";

interface DrinkPhotoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drink: Drink;
  onSuccess: () => void;
}

export function DrinkPhotoEditDialog({ open, onOpenChange, drink, onSuccess }: DrinkPhotoEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [photoUrl, setPhotoUrl] = useState(drink.image_url || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showSuccess, triggerSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onSuccess();
    },
  });

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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`/api/drinks/${drink.slug}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload photo");
      }

      triggerSuccess();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!photoUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/drinks/${drink.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: photoUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update database");
      }

      triggerSuccess();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update photo URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "upload") {
      handleUpload();
    } else {
      handleUrlSubmit();
    }
  };

  const isNoPreviewFormat = selectedFile && 
    (selectedFile.name.toLowerCase().endsWith(".heic") || 
     selectedFile.name.toLowerCase().endsWith(".dng"));

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Drink Photo"
      description={`Update the main image for "${drink.name}".`}
      submitText={isSubmitting ? "Updating..." : "Save Changes"}
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
      maxWidth="sm:max-w-md"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="relative">
            <TreeSuccess size={160} showText={false} />
            <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Photo updated</h3>
            <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
              The visual identity for this selection has been refined.
            </p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upload" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-media-surface-container-low mb-8 h-14 p-1 rounded-2xl">
            <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-media-secondary data-[state=active]:text-white transition-all font-bold">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="rounded-xl data-[state=active]:bg-media-secondary data-[state=active]:text-white transition-all font-bold">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0 space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-media-outline-variant/30 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-media-surface-container-low transition-all group min-h-[300px]"
            >
              {previewUrl ? (
                isNoPreviewFormat ? (
                  <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-media-surface-container-high flex flex-col items-center justify-center gap-3 border-2 border-dashed border-media-outline-variant/50 text-media-primary p-6 shadow-2xl mx-auto group">
                    <ImageIcon className="w-16 h-16 text-media-secondary/80 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-center">Preview unavailable for {selectedFile?.name.split('.').pop()?.toUpperCase()}</p>
                    <p className="text-[10px] text-media-on-surface-variant font-bold tracking-widest uppercase opacity-40 truncate max-w-xs">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div className="relative w-full aspect-square max-w-[240px] rounded-3xl overflow-hidden shadow-2xl mx-auto border-2 border-media-secondary/20">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-bold uppercase tracking-widest">Change Photo</p>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-media-secondary/10 flex items-center justify-center text-media-secondary group-hover:scale-110 transition-transform group-hover:bg-media-secondary/20">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-base font-bold text-media-primary uppercase tracking-tight">Select Asset</p>
                    <p className="text-[10px] font-black text-media-on-surface-variant uppercase tracking-[0.2em] opacity-40">PNG, JPG, WebP, HEIC or DNG</p>
                  </div>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-0 space-y-8">
            <EditorialInput 
              label="Image URL"
              placeholder="https://assets.library.com/drink-photo.jpg" 
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              leftIcon={<LinkIcon className="w-5 h-5" />}
            />
            
            {photoUrl && (
              <div className="rounded-3xl overflow-hidden border-2 border-media-outline-variant/10 shadow-2xl aspect-square max-w-[240px] mx-auto transition-transform hover:scale-[1.02]">
                <img 
                  src={photoUrl} 
                  alt="URL Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </ResponsiveDialog>
  );
}


