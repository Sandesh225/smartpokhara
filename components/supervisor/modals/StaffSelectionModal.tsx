"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Search, MapPin, Star, Briefcase, CheckCircle2, 
  Clock, User, ArrowRightLeft, Building2, Mail, BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/supervisor/shared/LoadingSpinner";

// Define a robust type that handles variations in staff data structure
export interface StaffMember {
  user_id: string;
  email?: string;
  full_name?: string;
  // Handle both naming conventions
  staff_role?: string; 
  role?: string;
  
  staff_code?: string;
  department_id?: string | null;
  department_name?: string | null;
  
  is_active?: boolean;
  availability_status?: string;
  
  current_workload?: number;
  max_concurrent_assignments?: number;
  
  performance_rating?: string | number;
  
  avatar_url?: string;
  distance_km?: number;
  recommendation_rank?: number;
}

export type AssignmentMode = "assign" | "reassign";

interface StaffSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Callback when assignment is confirmed.
   * reason is only populated in 'reassign' mode.
   */
  onAssign: (staffId: string, note: string, options: any, reason?: string) => Promise<void>;
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
  currentStaff
}: StaffSelectionModalProps) {
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Notification preferences
  const [notifyOptions, setNotifyOptions] = useState({
    sms: true,
    email: true,
    inApp: true
  });

  // Filter Logic - Robust against missing fields
  const filteredStaff = useMemo(() => {
    if (!staffList || !Array.isArray(staffList)) return [];
    
    return staffList.filter(s => {
      const query = search.toLowerCase();
      
      const name = (s.full_name || "").toLowerCase();
      const role = (s.staff_role || s.role || "").toLowerCase();
      const code = (s.staff_code || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      const dept = (s.department_name || "").toLowerCase();
      
      return (
        name.includes(query) || 
        role.includes(query) || 
        code.includes(query) || 
        email.includes(query) || 
        dept.includes(query)
      );
    });
  }, [staffList, search]);

  const handleConfirm = async () => {
    if (!selectedStaffId) return;
    if (mode === "reassign" && !reason) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedStaffId, note, notifyOptions, reason);
      // We don't auto-close here; we expect the parent to close the modal 
      // (by setting isOpen=false) upon successful promise resolution.
      // This allows the parent to handle errors or show success toasts first.
    } catch (error) {
      console.error("Assignment failed in modal:", error);
      // Ensure we stop loading state if error occurs but modal stays open
      setIsSubmitting(false);
    }
  };

  const REASSIGNMENT_REASONS = [
    "Staff unavailable / On leave",
    "Workload rebalancing",
    "Skill mismatch",
    "Staff request",
    "Performance issue",
    "Other"
  ];

  // Helper: Status Colors
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'busy': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'offline': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'on_leave': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Helper: Format Role text safely
  const formatRole = (role?: string) => {
    if (!role) return "Staff";
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper: Format Rating safely
  const formatRating = (rating?: string | number) => {
    if (rating === undefined || rating === null) return "-";
    const num = Number(rating);
    return isNaN(num) ? "-" : num.toFixed(1);
  };

  // Helper: Get selected object for preview
  const selectedStaff = staffList.find(s => s.user_id === selectedStaffId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* 1. Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {mode === "reassign" ? <ArrowRightLeft className="h-5 w-5 text-orange-600" /> : null}
                {mode === "reassign" ? "Reassign Staff" : "Assign Staff"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
                Task: <span className="font-medium text-gray-700">{complaintTitle}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            
            {/* 2. Left Panel: Staff List */}
            <div className="flex-1 flex flex-col border-r border-gray-200 min-w-0 bg-gray-50/30">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-100 bg-white z-10 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, email or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              {/* Staff Grid */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredStaff.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                    <User className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">No staff members match your search.</p>
                  </div>
                ) : (
                  filteredStaff.map((staff) => (
                    <div
                      key={staff.user_id}
                      onClick={() => setSelectedStaffId(staff.user_id)}
                      className={cn(
                        "group relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                        selectedStaffId === staff.user_id
                          ? "bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-sm"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      )}
                    >
                      <div className="flex gap-4">
                        {/* Avatar & Status */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            {staff.avatar_url ? (
                              <img src={staff.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm" />
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm text-slate-500 font-bold text-xl">
                                {(staff.full_name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={cn(
                              "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white",
                              staff.availability_status === 'available' ? "bg-emerald-500" :
                              staff.availability_status === 'busy' ? "bg-amber-500" : 
                              staff.availability_status === 'on_leave' ? "bg-purple-500" : "bg-gray-400"
                            )} />
                          </div>
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize",
                            getStatusColor(staff.availability_status)
                          )}>
                            {staff.availability_status || "unknown"}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-base font-bold text-gray-900 leading-tight truncate">
                                  {staff.full_name || "Unknown Staff"}
                                </h4>
                                {staff.staff_code && (
                                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                    {staff.staff_code}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <BadgeCheck className="h-3 w-3 text-blue-500" />
                                  {formatRole(staff.staff_role || staff.role)}
                                </p>
                              </div>
                            </div>
                            
                            {(staff.recommendation_rank && staff.recommendation_rank > 50) ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 shrink-0 ml-2">
                                <Star className="h-3 w-3 fill-current" /> Match
                              </span>
                            ) : null}
                          </div>

                          {/* Email (Safe Render) */}
                          <div className="flex items-center gap-4 mt-2 mb-3 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate w-full">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {staff.email || "No email"}
                              </div>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-3 max-w-[220px]">
                            <div className="bg-gray-50 p-1.5 rounded-lg text-center border border-gray-100">
                              <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Workload</span>
                              <div className="flex items-center justify-center gap-1 font-bold text-gray-800 text-sm">
                                <Briefcase className="h-3 w-3 text-blue-500" />
                                {staff.current_workload ?? 0} <span className="text-gray-400 text-xs font-normal">/ {staff.max_concurrent_assignments || 10}</span>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-1.5 rounded-lg text-center border border-gray-100">
                              <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Rating</span>
                              <div className="flex items-center justify-center gap-1 font-bold text-gray-800 text-sm">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                {formatRating(staff.performance_rating)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Department Display */}
                          {staff.department_name && (
                            <div className="mt-2 flex justify-end">
                              <div className="text-xs font-medium text-gray-900 flex items-center justify-end gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                <Building2 className="h-3 w-3 text-gray-500" />
                                {staff.department_name}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Right Panel: Assignment Form */}
            <div className="w-full lg:w-[400px] bg-white p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 shadow-xl z-20 overflow-y-auto">
              {mode === "reassign" && currentStaff && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-orange-800 uppercase tracking-wide bg-orange-100 px-2 py-0.5 rounded">Replacing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                      {(currentStaff.name || "?").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{currentStaff.name || "Unknown Staff"}</p>
                      <p className="text-xs text-gray-500">Current Assignee</p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Confirm Selection
              </h3>

              {/* Selected Staff Preview */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  Assigning To
                </label>
                {selectedStaff ? (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3 shadow-sm">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                        {(selectedStaff.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {selectedStaff.full_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="font-mono text-blue-600">{selectedStaff.staff_code}</span>
                          <span>•</span>
                          <span className="truncate">{selectedStaff.department_name || "General"}</span>
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-sm text-gray-400 italic text-center">
                    Select a staff member from the list to proceed
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                {mode === "reassign" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reason for Reassignment <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select a reason...</option>
                      {REASSIGNMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add specific instructions for this task..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Notification Channels</label>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={notifyOptions.inApp} onChange={e => setNotifyOptions({...notifyOptions, inApp: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">In-App Notification</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={notifyOptions.sms} onChange={e => setNotifyOptions({...notifyOptions, sms: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-600">SMS Alert</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedStaffId || isSubmitting || (mode === "reassign" && !reason)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed",
                    mode === "reassign" ? "bg-gradient-to-r from-orange-600 to-red-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                  )}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    mode === "reassign" ? "Confirm Reassignment" : "Confirm Assignment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}