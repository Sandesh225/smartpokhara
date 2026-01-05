"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Star,
  Briefcase,
  Building2,
  Mail,
  BadgeCheck,
  ArrowRightLeft,
  UserPlus,
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
  staff_code?: string;
  department_id?: string | null;
  department_name?: string | null;
  availability_status?: string;
  current_workload?: number;
  max_concurrent_assignments?: number;
  performance_rating?: string | number;
  avatar_url?: string;
  recommendation_rank?: number;
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
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notifyOptions, setNotifyOptions] = useState({
    sms: true,
    email: true,
    inApp: true,
  });

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

  const handleConfirm = async () => {
    if (!selectedStaffId) return;
    if (mode === "reassign" && !reason) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedStaffId, note, notifyOptions, reason);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Available
          </Badge>
        );
      case "busy":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Busy
          </Badge>
        );
      case "on_leave":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            On Leave
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600">
            Unknown
          </Badge>
        );
    }
  };

  const selectedStaff = staffList.find((s) => s.user_id === selectedStaffId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
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
                {mode === "reassign" ? "Reassign Work" : "Assign Staff"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                For:{" "}
                <span className="font-medium text-foreground">
                  {complaintTitle}
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Staff List Panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
              <div className="p-4 border-b bg-background">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name, code, or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-muted/30"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredStaff.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                    <Search className="h-10 w-10 mb-2" />
                    <p>No staff found</p>
                  </div>
                ) : (
                  filteredStaff.map((staff) => (
                    <div
                      key={staff.user_id}
                      onClick={() => setSelectedStaffId(staff.user_id)}
                      className={cn(
                        "group relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                        selectedStaffId === staff.user_id
                          ? "bg-primary/5 border-primary ring-1 ring-primary"
                          : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                      )}
                    >
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage src={staff.avatar_url} />
                          <AvatarFallback className="font-bold text-lg">
                            {staff.full_name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="font-bold text-foreground truncate">
                                {staff.full_name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                                <span className="capitalize font-medium">
                                  {(
                                    staff.staff_role ||
                                    staff.role ||
                                    "Staff"
                                  ).replace(/_/g, " ")}
                                </span>
                                {staff.staff_code && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">
                                      {staff.staff_code}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            {getStatusBadge(staff.availability_status)}
                          </div>

                          <Separator className="my-2.5 opacity-50" />

                          <div className="flex items-center gap-4 text-xs">
                            <div
                              className="flex items-center gap-1.5"
                              title="Workload"
                            >
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">
                                {staff.current_workload}/
                                {staff.max_concurrent_assignments || 10}
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1.5"
                              title="Rating"
                            >
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              <span className="font-medium">
                                {Number(staff.performance_rating || 0).toFixed(
                                  1
                                )}
                              </span>
                            </div>
                            {staff.department_name && (
                              <div className="flex items-center gap-1.5 ml-auto text-muted-foreground">
                                <Building2 className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[120px]">
                                  {staff.department_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assignment Details Panel */}
            <div className="w-full lg:w-[380px] bg-background border-l border-border p-6 flex flex-col h-full overflow-y-auto">
              {mode === "reassign" && currentStaff && (
                <div className="mb-6 p-4 bg-orange-50/50 border border-orange-200 rounded-xl">
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-2 block">
                    Replacing
                  </span>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentStaff.avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                        {currentStaff.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-bold text-foreground">
                      {currentStaff.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                      1
                    </div>
                    Select Staff
                  </h3>
                  {selectedStaff ? (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedStaff.avatar_url} />
                        <AvatarFallback className="bg-background text-primary font-bold">
                          {selectedStaff.full_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {selectedStaff.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedStaff.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                      Select a staff member from the list
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                      2
                    </div>
                    Details
                  </h3>

                  <div className="space-y-4">
                    {mode === "reassign" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">
                          Reassignment Reason
                        </label>
                        <Select value={reason} onValueChange={setReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason..." />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Staff unavailable / On leave",
                              "Workload rebalancing",
                              "Skill mismatch",
                              "Staff request",
                              "Performance issue",
                              "Other",
                            ].map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">
                        Instructions
                      </label>
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add instructions for the staff..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-medium">
                        Notifications
                      </label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inApp"
                          checked={notifyOptions.inApp}
                          onCheckedChange={(c) =>
                            setNotifyOptions((p) => ({ ...p, inApp: !!c }))
                          }
                        />
                        <label
                          htmlFor="inApp"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          In-App Notification
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms"
                          checked={notifyOptions.sms}
                          onCheckedChange={(c) =>
                            setNotifyOptions((p) => ({ ...p, sms: !!c }))
                          }
                        />
                        <label
                          htmlFor="sms"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          SMS Alert
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t">
                <Button
                  className="w-full h-11 font-bold"
                  onClick={handleConfirm}
                  disabled={
                    !selectedStaffId ||
                    isSubmitting ||
                    (mode === "reassign" && !reason)
                  }
                >
                  {isSubmitting
                    ? "Processing..."
                    : mode === "reassign"
                      ? "Confirm Reassignment"
                      : "Confirm Assignment"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}