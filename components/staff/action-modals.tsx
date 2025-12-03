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
import { Loader2 } from "lucide-react"

interface AcceptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (notes?: string) => Promise<void>
  loading: boolean
  trackingCode?: string
}

export function AcceptModal({ open, onOpenChange, onConfirm, loading, trackingCode }: AcceptModalProps) {
  const [notes, setNotes] = useState("")

  const handleConfirm = async () => {
    await onConfirm(notes || undefined)
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Complaint</DialogTitle>
          <DialogDescription>
            You are about to accept complaint <span className="font-mono font-medium">{trackingCode}</span>. This will
            move it to your in-progress queue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any initial notes about this complaint..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Accept Complaint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RejectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
  loading: boolean
  trackingCode?: string
}

export function RejectModal({ open, onOpenChange, onConfirm, loading, trackingCode }: RejectModalProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = async () => {
    if (!reason.trim()) return
    await onConfirm(reason)
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Complaint</DialogTitle>
          <DialogDescription>
            You are about to reject complaint <span className="font-mono font-medium">{trackingCode}</span>. Please
            provide a reason for rejection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why you are rejecting this assignment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading || !reason.trim()}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Reject Complaint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface UpdateProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (note: string) => Promise<void>
  loading: boolean
  trackingCode?: string
}

export function UpdateProgressModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
  trackingCode,
}: UpdateProgressModalProps) {
  const [note, setNote] = useState("")

  const handleConfirm = async () => {
    if (!note.trim()) return
    await onConfirm(note)
    setNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Add a progress update for complaint <span className="font-mono font-medium">{trackingCode}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="progress-note">
              Progress note <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="progress-note"
              placeholder="Describe the work done or progress made..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !note.trim()}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ResolveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (resolutionNotes: string) => Promise<void>
  loading: boolean
  trackingCode?: string
}

export function ResolveModal({ open, onOpenChange, onConfirm, loading, trackingCode }: ResolveModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState("")

  const handleConfirm = async () => {
    if (!resolutionNotes.trim()) return
    await onConfirm(resolutionNotes)
    setResolutionNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Complaint</DialogTitle>
          <DialogDescription>
            Mark complaint <span className="font-mono font-medium">{trackingCode}</span> as resolved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resolution">
              Resolution notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="resolution"
              placeholder="Describe how the issue was resolved..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !resolutionNotes.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Mark Resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
