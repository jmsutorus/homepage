"use client";

import { useState } from "react";
import { AccessRequest, approveAccessRequest, denyAccessRequest } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function AccessRequestsList({ requests }: { requests: AccessRequest[] }) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (id: number, email: string) => {
    setProcessingId(id);
    try {
      await approveAccessRequest(id, email);
      toast.success("Request approved", {
        description: `${email} has been added to the allowed list.`,
      });
    } catch {
      toast.error("Error", {
        description: "Failed to approve request.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (id: number, email: string, name: string, reason: string | null) => {
    if (!confirm(`Are you sure you want to deny access to ${email}?`)) return;
    setProcessingId(id);
    try {
      await denyAccessRequest(id, email, name, reason || "");
      toast.success("Request denied", {
        description: `${email} has been added to the denied list.`,
      });
    } catch {
      toast.error("Error", {
        description: "Failed to deny request.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pending Beta Access Requests</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No pending access requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {request.reason || <span className="italic text-xs">No reason provided</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={processingId === request.id}
                        onClick={() => handleApprove(request.id, request.email)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-950/20"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={processingId === request.id}
                        onClick={() => handleDeny(request.id, request.email, request.name, request.reason)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
