"use client";

import { useState } from "react";
import { AllowedUser, addAllowedUser, removeAllowedUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function AllowedUsersList({ allowedUsers }: { allowedUsers: AllowedUser[] }) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setLoading(true);
    try {
      await addAllowedUser(newEmail);
      setNewEmail("");
      toast.success("User added", {
        description: `${newEmail} has been added to the allowed list.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add user. It might already exist.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the allowed list?`)) return;

    try {
      await removeAllowedUser(email);
      toast.success("User removed", {
        description: `${email} has been removed from the allowed list.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to remove user.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Beta Access List</h2>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email address..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={loading}
          className="max-w-sm"
        />
        <Button type="submit" disabled={loading || !newEmail}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allowedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No allowed users found.
                </TableCell>
              </TableRow>
            ) : (
              allowedUsers.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(user.email)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
