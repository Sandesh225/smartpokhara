"use client";

import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  ArrowRightLeft,
  Check,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UniversalCombobox } from "@/components/ui/UniversalCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UnifiedStaffMember {
    user_id: string;
    full_name: string;
    role?: string;
    avatar_url?: string;
    department_name?: string;
    // ... any other props needed
}

interface UniversalAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (
    staffId: string,
    note: string,
    options: any,
    reason?: string
  ) => Promise<void>;
  staffList: UnifiedStaffMember[];
  complaintTitle: string;
  isReassign?: boolean;
  currentStaffName?: string;
}

export function UniversalAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  staffList,
  complaintTitle,
  isReassign = false,
  currentStaffName,
}: UniversalAssignmentModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifyOptions, setNotifyOptions] = useState({
    sms: true,
    email: true,
    inApp: true,
  });

  // Reset state
  useEffect(() => {
    if (isOpen) {
      setSelectedStaffId("");
      setNote("");
      setReason("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedStaffId) return;
    if (isReassign && !reason) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedStaffId, note, notifyOptions, reason);
      onClose();
    } catch (error) {
      console.error("Assignment failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const comboboxItems = staffList.map(s => ({
      id: s.user_id,
      value: s.user_id,
      label: s.full_name || "Unknown",
      avatar_url: s.avatar_url,
      role: s.role,
      department: s.department_name
  }));

  const reassignmentReasons = [
    "Staff unavailable / On leave",
    "Workload rebalancing",
    "Skill mismatch",
    "Staff request",
    "Performance issue",
    "Other",
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
           initial={{ scale: 0.95, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.95, opacity: 0, y: 20 }}
           className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl flex flex-col border border-border overflow-hidden"
        >
           {/* Header */}
           <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
              <div>
                 <h2 className="text-lg font-bold flex items-center gap-2">
                    {isReassign ? <ArrowRightLeft className="w-5 h-5 text-orange-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
                    {isReassign ? "Redeploy Staff" : "Assign Staff"}
                 </h2>
                 <p className="text-xs text-muted-foreground line-clamp-1 mt-1">For: {complaintTitle}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
           </div>

           {/* Body */}
           <div className="p-6 space-y-5">
              
              {/* Current Staff (Reassign Only) */}
              {isReassign && currentStaffName && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                     <span className="text-xs font-bold text-orange-800 uppercase">Current</span>
                     <span className="text-sm font-bold text-orange-900">{currentStaffName}</span>
                  </div>
              )}

              {/* Staff Selector */}
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground">Select Staff Member</label>
                 <UniversalCombobox
                    items={comboboxItems}
                    value={selectedStaffId}
                    onChange={setSelectedStaffId}
                    placeholder="Search staff..."
                    className="h-12"
                    renderItem={(item) => (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={item.avatar_url} />
                                <AvatarFallback className="text-[10px]">{item.label[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-sm leading-none">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground leading-none mt-1">
                                    {item.role} {item.department ? `• ${item.department}` : ''}
                                </span>
                            </div>
                        </div>
                    )}
                 />
              </div>

              {/* Reassign Reason */}
              {isReassign && (
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Reason</label>
                     <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Select reason..." />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                           {reassignmentReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
              )}

              {/* Note */}
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground">Internal Note</label>
                 <Textarea 
                    value={note} 
                    onChange={e => setNote(e.target.value)}
                    placeholder="Instructions..."
                    className="resize-none h-20"
                 />
              </div>

              {/* Notification Options */}
               <div className="space-y-3 pt-2">
                 <p className="text-[10px] font-bold uppercase text-muted-foreground">Notify Via</p>
                 <div className="flex gap-4">
                   <div className="flex items-center space-x-2">
                     <Checkbox id="inApp" checked={notifyOptions.inApp} onCheckedChange={(v) => setNotifyOptions(p => ({...p, inApp: !!v}))} />
                     <label htmlFor="inApp" className="text-xs font-medium cursor-pointer">In-App</label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="sms" checked={notifyOptions.sms} onCheckedChange={(v) => setNotifyOptions(p => ({...p, sms: !!v}))} />
                     <label htmlFor="sms" className="text-xs font-medium cursor-pointer">SMS</label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="email" checked={notifyOptions.email} onCheckedChange={(v) => setNotifyOptions(p => ({...p, email: !!v}))} />
                     <label htmlFor="email" className="text-xs font-medium cursor-pointer">Email</label>
                   </div>
                 </div>
               </div>

           </div>

           {/* Footer */}
           <div className="p-4 bg-muted/20 flex justify-end gap-3 border-t">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!selectedStaffId || isSubmitting || (isReassign && !reason)}
                className="font-bold"
              >
                 {isSubmitting ? "Assigning..." : "Confirm Assignment"}
              </Button>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
