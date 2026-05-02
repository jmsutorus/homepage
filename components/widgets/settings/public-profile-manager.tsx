"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Loader2, Camera, Globe } from "lucide-react";
import { toast } from "sonner";
import { updateShowProfile, updatePublishedPhoto } from "@/lib/actions/settings";

export function PublicProfileManager() {
  const { data: session, update } = useSession();
  const [showProfile, setShowProfile] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setShowProfile(session.user.showProfile || false);
      setImagePreview(session.user.publishedPhoto || null);
    }
  }, [session]);

  const handleToggleProfile = async (enabled: boolean) => {
    try {
      setIsSaving(true);
      const result = await updateShowProfile(enabled);
      if (result.success) {
        setShowProfile(enabled);
        toast.success(enabled ? "Public profile enabled!" : "Public profile disabled.");
        await update({ showProfile: enabled });
      } else {
        toast.error(result.error || "Failed to update profile visibility");
      }
    } catch (error) {
      console.error("Failed to toggle profile visibility:", error);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-save photo when selected
      try {
        setIsPhotoSaving(true);
        const formData = new FormData();
        formData.append("file", file);
        
        const result = await updatePublishedPhoto(formData);
        if (result.success) {
          setImagePreview(result.image || null);
          toast.success("Published photo updated!");
          await update({ publishedPhoto: result.image });
          setSelectedFile(null);
        } else {
          toast.error(result.error || "Failed to upload photo");
        }
      } catch (error) {
        console.error("Failed to upload photo:", error);
        toast.error("Upload failed");
      } finally {
        setIsPhotoSaving(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-media-surface/30 p-6 rounded-xl border border-media-outline-variant/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-media-primary" />
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-media-on-surface">Public Profile</h3>
            <p className="text-[10px] text-media-on-surface-variant font-medium">
              Allow others to view your showcase and milestones.
            </p>
          </div>
        </div>
        <Switch 
          checked={showProfile} 
          onCheckedChange={handleToggleProfile} 
          disabled={isSaving}
        />
      </div>

      {showProfile && (
        <div className="flex flex-col gap-4 pt-4 border-t border-media-outline-variant/20">
          <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
            Published Profile Photo
          </label>
          <div className="flex items-center gap-6">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => !isPhotoSaving && fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-media-primary/30 group-hover:border-media-primary transition-all duration-300 flex items-center justify-center bg-media-surface-container-high relative">
                {isPhotoSaving ? (
                  <Loader2 className="w-8 h-8 text-media-primary animate-spin" />
                ) : imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Published Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-media-on-surface-variant/50" />
                )}
                
                {!isPhotoSaving && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                    <Camera className="w-4 h-4" />
                    <span>Upload</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*,.heic"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-media-on-surface-variant">
                This photo is shown on your public profile page. It can be different from your private workspace photo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
