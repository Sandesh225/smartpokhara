// components/admin/ward-heatmap.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { WardSummary } from "@/lib/types/admin";

interface WardHeatmapProps {
  wardData: WardSummary[];
}

export function WardHeatmap({ wardData }: WardHeatmapProps) {
  const getComplaintIntensity = (count: number) => {
    if (count === 0) return 'bg-green-100 hover:bg-green-200';
    if (count <= 5) return 'bg-yellow-100 hover:bg-yellow-200';
    if (count <= 15) return 'bg-orange-100 hover:bg-orange-200';
    return 'bg-red-100 hover:bg-red-200';
  };

  const getComplaintTextColor = (count: number) => {
    if (count === 0) return 'text-green-800';
    if (count <= 5) return 'text-yellow-800';
    if (count <= 15) return 'text-orange-800';
    return 'text-red-800';
  };

  if (wardData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
        No ward complaint data available.
      </div>
    );
  }

  // Sort by ward number and ensure we have all 33 wards
  const allWards = Array.from({ length: 33 }, (_, i) => {
    const wardNumber = i + 1;
    const ward = wardData.find(w => w.ward_number === wardNumber);
    return ward || {
      ward_number: wardNumber,
      ward_name: `Ward ${wardNumber}`,
      total_complaints: 0,
      open_complaints: 0,
      resolved_complaints: 0,
      overdue_complaints: 0
    };
  });

  return (
    <div className="space-y-4">
      {/* Heatmap Grid */}
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-11">
        {allWards.map((ward) => (
          <Link
            key={ward.ward_number}
            href={`/admin/complaints?ward=${ward.ward_number}`}
            className={`group relative flex aspect-square items-center justify-center rounded-lg border transition-all ${getComplaintIntensity(ward.open_complaints)}`}
            title={`Ward ${ward.ward_number}: ${ward.open_complaints} open complaints`}
          >
            <span className={`text-xs font-semibold ${getComplaintTextColor(ward.open_complaints)}`}>
              {ward.ward_number}
            </span>
            {ward.overdue_complaints > 0 && (
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-100" />
            <span className="text-slate-600">0 complaints</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-yellow-100" />
            <span className="text-slate-600">1-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-orange-100" />
            <span className="text-slate-600">6-15</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-100" />
            <span className="text-slate-600">16+</span>
          </div>
        </div>
        
        <Link href="/admin/analytics?view=geographic">
          <Button variant="outline" size="sm">
            Detailed View
          </Button>
        </Link>
      </div>

      {/* Ward Statistics */}
      <div className="rounded-lg border bg-slate-50 p-3">
        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div className="text-center">
            <div className="font-semibold text-slate-900">
              {allWards.reduce((sum, ward) => sum + ward.total_complaints, 0)}
            </div>
            <div className="text-slate-600">Total</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {allWards.reduce((sum, ward) => sum + ward.open_complaints, 0)}
            </div>
            <div className="text-slate-600">Open</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {allWards.reduce((sum, ward) => sum + ward.resolved_complaints, 0)}
            </div>
            <div className="text-slate-600">Resolved</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {allWards.reduce((sum, ward) => sum + ward.overdue_complaints, 0)}
            </div>
            <div className="text-slate-600">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}