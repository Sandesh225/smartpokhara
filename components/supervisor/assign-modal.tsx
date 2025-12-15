"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";/ui/
import { Button } from "@/components/ui/button";/ui/
import { Textarea } from "@/ui/textarea/ui/
import { Label } from "@/components/ui/label";/ui/
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";/ui/
import { Badge } from "@/components/ui/badge";/ui/
import { Loader2 } from "lucide-react";

interface AssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (staffId: string, note?: string) => Promise<void>;
  loading: boolean;
  trackingCode?: string;
  availableStaff: any[]; // Staff list from hook
}

export function AssignModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
  trackingCode,
  availableStaff = [],
}: AssignModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedStaffId("");
      setNote("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedStaffId) return;
    await onConfirm(selectedStaffId, note);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Complaint</DialogTitle>
          <DialogDescription>
            Assign <span className="font-mono font-medium">{trackingCode}</span>{" "}
            to a team member.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Select Staff Member</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="h-auto py-3">
                <SelectValue placeholder="Choose a staff member..." />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem
                    key={staff.user_id}
                    value={staff.user_id}
                    disabled={!staff.is_available}
                  >
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={staff.avatar_url} />
                          <AvatarFallback>
                            {staff.full_name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{staff.full_name}</span>
                      </div>
                      <Badge
                        variant={
                          staff.active_complaints_count > 5
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {staff.active_complaints_count} active
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Instructions (Optional)</Label>
            <Textarea
              placeholder="Add specific context..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedStaffId || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
