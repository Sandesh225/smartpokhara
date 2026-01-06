"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffLeaveQueries } from "@/lib/supabase/queries/staff-leave";
import { ArrowLeft, Calendar, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { parseISO, isBefore } from "date-fns";

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
      if (!formData.startDate || !formData.endDate)
        throw new Error("Please select dates.");
      if (isBefore(parseISO(formData.endDate), parseISO(formData.startDate))) {
        throw new Error("End date cannot be before start date.");
      }

      const start = parseISO(formData.startDate);
      const end = parseISO(formData.endDate);
      const totalDays = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      await staffLeaveQueries.requestLeave(supabase, {
        staffId: user.id,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays,
        reason: formData.reason,
      });

      toast.success("Leave request submitted successfully!");
      router.push("/staff/leave");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/staff/leave"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Leave Request
          </h1>
          <p className="text-sm text-gray-500">
            Fill in the details below to apply for leave.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Leave Type */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 block">
            Leave Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["casual", "sick", "annual", "unpaid"].map((type) => (
              <label
                key={type}
                className={`
                cursor-pointer border rounded-xl p-3 flex items-center justify-center text-sm font-medium capitalize transition-all
                ${
                  formData.type === type
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                }
              `}
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="sr-only"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 block">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
              <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 block">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate}
              />
              <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 block">
            Reason
          </label>
          <textarea
            required
            rows={4}
            placeholder="Please briefly explain why you are requesting leave..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all resize-none"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
