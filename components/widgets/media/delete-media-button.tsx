"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { HomePageButton } from "@/Shared/Components/Buttons/HomePageButton";

interface DeleteMediaButtonProps {
  slug: string;
  mediaType: string;
  className?: string;
}

// Helper function to convert plural type to singular (for API calls)
function getApiType(type: string): string {
  const typeMap: Record<string, string> = {
    movies: "movie",
    tv: "tv",
    books: "book",
  };
  return typeMap[type] || type;
}

export function DeleteMediaButton({ slug, mediaType, className }: DeleteMediaButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const apiType = getApiType(mediaType);
      const response = await fetch(`/api/media/${apiType}/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      // Redirect to the media type page on success
      router.push(`/media`);
      router.refresh(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <HomePageButton 
            disabled={isDeleting} 
            className={cn(
              "bg-media-surface-container text-media-on-surface-variant hover:bg-media-error-container hover:text-media-on-error-container transition-all duration-300 border-none shadow-xl",
              className
            )}
            icon={<Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? "Deleting..." : "Remove"}
          </HomePageButton>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              media entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="cursor-pointer">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}
