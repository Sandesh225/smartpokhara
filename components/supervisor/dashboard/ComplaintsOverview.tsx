"use client";

import { PieChart } from "@/components/supervisor/shared/charts/PieChart";
import { BarChart } from "@/components/supervisor/shared/charts/BarChart";
import { LineChart } from "@/components/supervisor/shared/charts/LineChart";
import { TrendingUp, PieChartIcon, BarChart3, InboxIcon } from "lucide-react";

interface OverviewProps {
  statusData: any[];
  categoryData: any[];
  trendData: any[];
}

function EmptyState({ icon: Icon, title, message }: { icon: any; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 max-w-[200px]">{message}</p>
    </div>
  );
}

export function ComplaintsOverview({
  statusData,
  categoryData,
  trendData,
}: OverviewProps) {
  const hasStatusData = statusData && statusData.length > 0;
  const hasCategoryData = categoryData && categoryData.length > 0;
  const hasTrendData = trendData && trendData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trend Chart - Spans 2 columns */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Volume Trend</h3>
                <p className="text-xs text-gray-600">Last 30 days</p>
              </div>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          {hasTrendData ? (
            <LineChart
              data={trendData}
              xKey="date"
              series={[{ key: "count", name: "Complaints", color: "#3B82F6" }]}
              height={250}
            />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No Trend Data"
              message="Complaint volume data will appear here once reports are submitted"
            />
          )}
        </div>
      </div>

      {/* Status Distribution - 1 column */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <PieChartIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Status</h3>
              <p className="text-xs text-gray-600">Current breakdown</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {hasStatusData ? (
            <PieChart
              data={statusData}
              dataKey="value"
              nameKey="name"
              colors={["#3B82F6", "#F59E0B", "#10B981", "#6B7280"]}
              height={250}
            />
          ) : (
            <EmptyState
              icon={PieChartIcon}
              title="No Status Data"
              message="Status distribution will be shown when complaints are available"
            />
          )}
        </div>
      </div>

      {/* Category Breakdown - Full width */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Top Categories</h3>
              <p className="text-xs text-gray-600">Most reported issues</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {hasCategoryData ? (
            <BarChart
              data={categoryData}
              xKey="name"
              series={[{ key: "value", name: "Complaints", color: "#6366f1" }]}
              height={200}
            />
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="No Category Data"
              message="Category breakdown will appear once complaints are categorized"
            />
          )}
        </div>
      </div>
    </div>
  );
}