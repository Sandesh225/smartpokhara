"use client";

import Link from "next/link";
import { SLACountdown } from "@/components/shared/SLACountdown";
import { PriorityIndicator } from "@/components/shared/PriorityIndicator";
import { ArrowRight, User } from "lucide-react";
import { format } from "date-fns";

interface SLAComplaint {
  id: string;
  tracking_code: string;
  title: string;
  status: string;
  priority: string;
  sla_due_at: string;
  ward: { name: string; ward_number: number };
  assigned_staff_name: string;
}

interface Props {
  complaints: SLAComplaint[];
  type: 'at_risk' | 'overdue';
}

export function AtRiskComplaintsList({ complaints, type }: Props) {
  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        <p className="text-sm">No complaints are currently {type.replace('_', ' ')}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b border-gray-200 flex justify-between items-center ${type === 'overdue' ? 'bg-red-50' : 'bg-orange-50'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${type === 'overdue' ? 'text-red-800' : 'text-orange-800'}`}>
          {type === 'overdue' ? 'Overdue Complaints' : 'Approaching Deadline'}
        </h3>
        <span className="text-xs font-semibold bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {complaints.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {complaints.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-medium text-gray-500">{item.tracking_code}</span>
                <PriorityIndicator priority={item.priority} size="sm" showLabel={false} />
              </div>
              <h4 className="text-sm font-medium text-gray-900 truncate mb-1">{item.title}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {item.assigned_staff_name}
                </span>
                <span>Ward {item.ward?.ward_number}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <SLACountdown deadline={item.sla_due_at} status={item.status} />
              <Link 
                href={`/supervisor/complaints/${item.id}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}