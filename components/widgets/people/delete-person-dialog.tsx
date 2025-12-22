"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Person } from "@/lib/db/people";
import { toast } from "sonner";

interface DeletePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
  onSuccess: () => void;
}

export function DeletePersonDialog({ open, onOpenChange, person, onSuccess }: DeletePersonDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!person) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/people/${person.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete person");
      }

      toast.success(`${person.name} deleted successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting person:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete person");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Person</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {person?.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
