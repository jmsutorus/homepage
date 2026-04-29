"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, User } from "lucide-react";
import { toast } from "sonner";
import { updateName, updateProfileImage } from "@/lib/actions/settings";

export function ProfileManager() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImagePreview(session.user.image || null);
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const nameChanged = name.trim() !== (session?.user?.name || "");
      const imageChanged = selectedFile !== null;

      let updatedNameValue = session?.user?.name;
      let updatedImageValue = session?.user?.image;

      let nameSuccess = true;
      let imageSuccess = true;

      if (nameChanged) {
        const nameResult = await updateName(name.trim());
        if (nameResult.success) {
          toast.success("Name updated successfully!");
          updatedNameValue = nameResult.name;
        } else {
          toast.error(nameResult.error || "Failed to update name");
          nameSuccess = false;
        }
      }

      if (imageChanged && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const imageResult = await updateProfileImage(formData);
        if (imageResult.success) {
          toast.success("Profile image updated successfully!");
          updatedImageValue = imageResult.image;
          setSelectedFile(null);
        } else {
          toast.error(imageResult.error || "Failed to update profile image");
          imageSuccess = false;
        }
      }

      if (nameSuccess || imageSuccess) {
        // Update the session with whatever worked
        await update({
          name: updatedNameValue,
          image: updatedImageValue,
        });
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("An error occurred while saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    name.trim() !== (session?.user?.name || "") || 
    selectedFile !== null;

  return (
    <div className="flex flex-col gap-6 bg-media-surface/30 p-6 rounded-xl border border-media-outline-variant/20 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar Upload */}
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-media-primary/30 group-hover:border-media-primary transition-all duration-300 flex items-center justify-center bg-media-surface-container-high relative">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-media-on-surface-variant/50" />
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-xs font-medium gap-1">
              <Camera className="w-5 h-5" />
              <span>Change</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*,.heic"
            onChange={handleFileChange}
          />
        </div>

        {/* Name Input */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
            Full Name
          </label>
          <input
            className="w-full bg-media-surface border border-media-outline-variant/40 rounded-lg p-4 text-media-on-surface focus:ring-2 focus:ring-media-primary/20 focus:border-media-primary outline-none transition-all duration-300"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-media-primary hover:bg-media-primary/90 text-media-on-primary font-bold px-6 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
