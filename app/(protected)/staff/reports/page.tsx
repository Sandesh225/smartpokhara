// 5. app/(protected)/staff/reports/page.tsx
// =============================================================================
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  generateStaffReport,
  exportComplaintsToCSV,
} from "@/lib/staff/reportHelpers";

export default function StaffReportsPage() {
  const [reportType, setReportType] = useState<"staff" | "complaints">(
    "complaints"
  );
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      if (reportType === "complaints") {
        const csv = await exportComplaintsToCSV({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        // Download CSV
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `complaints-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate and download reports for analysis.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="complaints">Complaints Report</option>
              <option value="staff">Staff Performance Report</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate & Download Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. SQL Migration for task_activity_logs table
// =============================================================================
/*
-- Add this to your Supabase SQL editor

CREATE TABLE IF NOT EXISTS task_activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    action varchar(100) NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX idx_task_activity_logs_task_id ON task_activity_logs(task_id);
CREATE INDEX idx_task_activity_logs_created_at ON task_activity_logs(created_at DESC);

-- RLS
ALTER TABLE task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "task_activity_logs_select_staff" ON task_activity_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks t
        WHERE t.id = task_id
        AND (fn_is_staff() OR t.assigned_to_user_id = auth.uid())
    )
);

CREATE POLICY "task_activity_logs_insert_staff" ON task_activity_logs
FOR INSERT TO authenticated
WITH CHECK (fn_is_staff());

GRANT SELECT, INSERT ON task_activity_logs TO authenticated;
*/
