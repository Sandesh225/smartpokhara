"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { staffLeaveQueries } from "@/lib/supabase/queries/staff-leave";
import { ArrowLeft, Calendar, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { parseISO, isBefore, differenceInDays } from "date-fns";

export default function LeaveRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Validation
      if (!formData.startDate || !formData.endDate) {
        throw new Error("Please select both start and end dates.");
      }
      
      const start = parseISO(formData.startDate);
      const end = parseISO(formData.endDate);

      if (isBefore(end, start)) {
        throw new Error("End date cannot be before start date.");
      }

      // 2. Auth Check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 3. Submit Request
      await staffLeaveQueries.requestLeave(supabase, {
        staffId: user.id,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      toast.success("Leave request submitted successfully!");
      router.push("/staff/leave");
      router.refresh(); // Refresh dashboard data

    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  // Calculate days for preview
  const daysPreview = (formData.startDate && formData.endDate) 
    ? Math.max(0, differenceInDays(parseISO(formData.endDate), parseISO(formData.startDate)) + 1)
    : 0;

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/staff/leave"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Leave Request</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to apply for leave.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stone-card p-6 sm:p-8 space-y-6">
        
        {/* Leave Type Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold block">Leave Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["casual", "sick", "annual", "unpaid"].map((type) => (
              <label
                key={type}
                className={`
                  cursor-pointer border rounded-xl p-3 flex items-center justify-center text-sm font-medium capitalize transition-all
                  ${formData.type === type
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary"
                    : "border-border hover:border-primary/50 text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="sr-only"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold block">Start Date</label>
            <div className="relative">
              <input
                type="date"
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 focus:border-primary focus:ring-primary outline-none transition-all"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold block">End Date</label>
            <div className="relative">
              <input
                type="date"
                required
                min={formData.startDate} // HTML5 validation
                className="w-full rounded-xl border border-input bg-background px-4 py-3 focus:border-primary focus:ring-primary outline-none transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Duration Preview */}
        {daysPreview > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <Info className="w-4 h-4" />
            <p>You are requesting <strong>{daysPreview} {daysPreview === 1 ? 'day' : 'days'}</strong> of leave.</p>
          </div>
        )}

        {/* Reason Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-bold block">Reason</label>
          <textarea
            required
            rows={4}
            placeholder="Please briefly explain why you are requesting leave..."
            className="w-full rounded-xl border border-input bg-background px-4 py-3 focus:border-primary focus:ring-primary outline-none transition-all resize-none"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-gov btn-gov-primary w-full py-4 text-lg shadow-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}