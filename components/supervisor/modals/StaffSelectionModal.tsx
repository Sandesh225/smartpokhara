"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Star,
  Briefcase,
  Building2,
  BadgeCheck,
  ArrowRightLeft,
  UserPlus,
  AlertCircle,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface StaffMember {
  user_id: string;
  email?: string;
  full_name?: string;
  staff_role?: string;
  role?: string;
  staff_code?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  availability_status?: string;
  current_workload?: number;
  max_concurrent_assignments?: number;
  performance_rating?: string | number;
  avatar_url?: string;
}

export type AssignmentMode = "assign" | "reassign";

interface StaffSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (
    staffId: string,
    note: string,
    options: any,
    reason?: string
  ) => Promise<void>;
  staffList: StaffMember[];
  complaintTitle: string;
  mode?: AssignmentMode;
  currentStaff?: {
    name: string;
    avatar?: string;
  };
}

export function StaffSelectionModal({
  isOpen,
  onClose,
  onAssign,
  staffList,
  complaintTitle,
  mode = "assign",
  currentStaff,
}: StaffSelectionModalProps) {
  // --- State ---
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifyOptions, setNotifyOptions] = useState({
    sms: true,
    email: true,
    inApp: true,
  });

  // --- Reset State on Open ---
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSelectedStaffId(null);
      setNote("");
      setSearch("");
    }
  }, [isOpen]);

  // --- Search Logic ---
  const filteredStaff = useMemo(() => {
    if (!staffList || !Array.isArray(staffList)) return [];
    return staffList.filter((s) => {
      const query = search.toLowerCase();
      return (
        (s.full_name || "").toLowerCase().includes(query) ||
        (s.staff_role || s.role || "").toLowerCase().includes(query) ||
        (s.staff_code || "").toLowerCase().includes(query) ||
        (s.department_name || "").toLowerCase().includes(query)
      );
    });
  }, [staffList, search]);

  const selectedStaff = staffList.find((s) => s.user_id === selectedStaffId);

  // --- Actions ---
  const handleConfirm = async () => {
    if (!selectedStaffId) return;
    if (mode === "reassign" && !reason) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedStaffId, note, notifyOptions, reason);
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl h-[85vh] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {mode === "reassign" ? (
                  <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                ) : (
                  <UserPlus className="h-5 w-5 text-blue-600" />
                )}
                {mode === "reassign" ? "Redeploy / Reassign" : "Assign Staff"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                For: <span className="font-medium text-foreground">{complaintTitle}</span>
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Staff Search & List */}
            <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
              <div className="p-4 border-b bg-background">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredStaff.map((staff) => (
                  <div
                    key={staff.user_id}
                    onClick={() => setSelectedStaffId(staff.user_id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all",
                      selectedStaffId === staff.user_id
                        ? "bg-primary/5 border-primary ring-1 ring-primary shadow-sm"
                        : "bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={staff.avatar_url} />
                          <AvatarFallback>{staff.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">{staff.full_name}</p>
                          <p className="text-xs text-muted-foreground">{staff.role || "Staff"}</p>
                        </div>
                      </div>
                      {selectedStaffId === staff.user_id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Configuration & Submit */}
            <div className="w-full lg:w-[380px] bg-background border-l p-6 flex flex-col gap-6 overflow-y-auto">
              
              {/* CURRENT STAFF INFO (Reassign Mode Only) */}
              {mode === "reassign" && currentStaff && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-[10px] font-bold text-orange-700 uppercase mb-2">Currently Assigned</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarImage src={currentStaff.avatar}/></Avatar>
                    <span className="text-sm font-bold text-orange-900">{currentStaff.name}</span>
                  </div>
                </div>
              )}

              {/* REASSIGNMENT REASON DROP-DOWN - FIXED */}
              {mode === "reassign" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    Redeployment Reason <span className="text-destructive">*</span>
                  </label>
                  
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className={cn("w-full bg-muted/10", !reason && "border-orange-300")}>
                      <SelectValue placeholder="Why is this being reassigned?" />
                    </SelectTrigger>
                    {/* position="popper" and high z-index is critical inside modals */}
                    <SelectContent position="popper" className="z-[100]">
                      {reassignmentReasons.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {!reason && (
                    <div className="flex items-center gap-1.5 text-orange-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <p className="text-[11px] font-medium">Please select a reason to enable button</p>
                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Internal Instructions</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Notes for the staff member..."
                  className="min-h-[100px] bg-muted/10 resize-none"
                />
              </div>

              {/* NOTIFICATIONS */}
              <div className="space-y-3 border-t pt-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Notify Via</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="inApp" 
                      checked={notifyOptions.inApp} 
                      onCheckedChange={(v) => setNotifyOptions(p => ({...p, inApp: !!v}))} 
                    />
                    <label htmlFor="inApp" className="text-xs font-medium cursor-pointer">Dashboard</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sms" 
                      checked={notifyOptions.sms} 
                      onCheckedChange={(v) => setNotifyOptions(p => ({...p, sms: !!v}))} 
                    />
                    <label htmlFor="sms" className="text-xs font-medium cursor-pointer">SMS</label>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-auto pt-6 border-t">
                <Button
                  className="w-full h-12 font-bold shadow-lg"
                  variant={mode === "reassign" ? "default" : "default"}
                  onClick={handleConfirm}
                  disabled={
                    !selectedStaffId || 
                    isSubmitting || 
                    (mode === "reassign" && !reason)
                  }
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : mode === "reassign" ? (
                    <>
                      <ArrowRightLeft className="mr-2 h-4 w-4" /> Confirm Redeployment
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Confirm Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}