"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

interface ComplaintRow {
  status: string;
  submitted_at: string;
  resolved_at: string | null;
  sla_due_at: string | null;
  complaint_categories: { name: string }[] | null;
  // Change this line to an array
  wards: { ward_number: number; name: string }[] | null;
}
interface AnalyticsData {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  overdueComplaints: number;
  avgResolutionDays: number;
  slaCompliance: number;
  complaintsByCategory: { category: string; count: number }[];
  complaintsByWard: { ward: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function StaffAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    overdueComplaints: 0,
    avgResolutionDays: 0,
    slaCompliance: 0,
    complaintsByCategory: [],
    complaintsByWard: [],
    monthlyTrend: [],
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<
    "7days" | "30days" | "90days" | "1year"
  >("30days");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    const supabase = createClient();

    try {
      const now = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(now.getDate() - 90);
          break;
        case "1year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          status,
          submitted_at,
          resolved_at,
          sla_due_at,
          complaint_categories(name),
          wards(ward_number, name)
        `
        )
        .gte("submitted_at", startDate.toISOString());

      if (error) throw error;

      const complaints = (data ?? []) as ComplaintRow[];

      /* ------------------------------------------------------------------ */
      /*                               METRICS                               */
      /* ------------------------------------------------------------------ */

      const totalComplaints = complaints.length;

      const resolvedComplaints = complaints.filter(
        (c) => c.status === "resolved"
      );

      const pendingComplaints = complaints.filter((c) =>
        ["submitted", "assigned", "in_progress"].includes(c.status)
      );

      const overdueComplaints = complaints.filter(
        (c) =>
          c.sla_due_at &&
          new Date(c.sla_due_at) < now &&
          !["resolved", "closed", "rejected"].includes(c.status)
      );

      const avgResolutionDays =
        resolvedComplaints.length === 0
          ? 0
          : resolvedComplaints.reduce((acc, c) => {
              const submitted = new Date(c.submitted_at).getTime();
              const resolved = new Date(c.resolved_at!).getTime();
              return acc + (resolved - submitted);
            }, 0) /
            resolvedComplaints.length /
            (1000 * 60 * 60 * 24);

      const slaCompliance =
        resolvedComplaints.length === 0
          ? 0
          : (resolvedComplaints.filter((c) => {
              if (!c.sla_due_at) return true;
              return new Date(c.resolved_at!) <= new Date(c.sla_due_at);
            }).length /
              resolvedComplaints.length) *
            100;

      /* ------------------------------------------------------------------ */
      /*                      COMPLAINTS BY CATEGORY (FIX)                   */
      /* ------------------------------------------------------------------ */

      const categoryCounts = complaints.reduce(
        (acc, complaint) => {
          const category =
            complaint.complaint_categories?.[0]?.name ?? "Unknown";

          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const complaintsByCategory = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      /* ------------------------------------------------------------------ */
      /*                          COMPLAINTS BY WARD                         */
      /* ------------------------------------------------------------------ */

      const wardCounts = complaints.reduce(
        (acc, complaint) => {
          // Update this line to access the first element of the array
          const wardData = Array.isArray(complaint.wards)
            ? complaint.wards[0]
            : null;

          const ward = wardData?.ward_number
            ? `Ward ${wardData.ward_number}`
            : "Unknown";

          acc[ward] = (acc[ward] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const complaintsByWard = Object.entries(wardCounts)
        .map(([ward, count]) => ({ ward, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      /* ------------------------------------------------------------------ */
      /*                             MONTHLY TREND                           */
      /* ------------------------------------------------------------------ */

      const monthlyCounts = complaints.reduce(
        (acc, complaint) => {
          const month = new Date(complaint.submitted_at).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "short" }
          );

          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const monthlyTrend = Object.entries(monthlyCounts)
        .map(([month, count]) => ({ month, count }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );

      setAnalytics({
        totalComplaints,
        resolvedComplaints: resolvedComplaints.length,
        pendingComplaints: pendingComplaints.length,
        overdueComplaints: overdueComplaints.length,
        avgResolutionDays,
        slaCompliance,
        complaintsByCategory,
        complaintsByWard,
        monthlyTrend,
      });
    } catch (err) {
      console.error("Analytics load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Analytics Dashboard</h1>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>

          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
        {JSON.stringify(analytics, null, 2)}
      </pre>
    </div>
  );
}
