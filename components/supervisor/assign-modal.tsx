"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, User } from "lucide-react"
import type { StaffWorkload } from "@/lib/types/complaints"

interface AssignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (staffId: string, note?: string) => Promise<void>
  loading: boolean
  trackingCode?: string
  availableStaff: StaffWorkload[]
}

export function AssignModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
  trackingCode,
  availableStaff,
}: AssignModalProps) {
  const [selectedStaff, setSelectedStaff] = useState("")
  const [note, setNote] = useState("")

  const handleConfirm = async () => {
    if (!selectedStaff) return
    await onConfirm(selectedStaff, note || undefined)
    setSelectedStaff("")
    setNote("")
    onOpenChange(false)
  }

  const handleClose = () => {
    setSelectedStaff("")
    setNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Complaint</DialogTitle>
          <DialogDescription>
            Assign complaint <span className="font-mono font-medium">{trackingCode}</span> to a staff member.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="staff">
              Select Staff Member <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Choose staff member..." />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No available staff members</div>
                ) : (
                  availableStaff.map((staff) => (
                    <SelectItem key={staff.staff_id} value={staff.staff_id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{staff.staff_name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {staff.total_assigned} assigned
                        </Badge>
                        {staff.overdue > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {staff.overdue} overdue
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Assignment Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any notes about this assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !selectedStaff}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
