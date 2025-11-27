// components/complaints/ComplaintDetailsHeader.tsx
'use client';

import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { ComplaintPriorityBadge } from './ComplaintPriorityBadge';

interface ComplaintDetailsHeaderProps {
  complaint: {
    tracking_code: string;
    title: string;
    status: 'draft' | 'submitted' | 'received' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'escalated';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: { name: string; name_nepali: string | null } | null;
    subcategory: { name: string; name_nepali: string | null } | null;
    ward: { ward_number: number; name: string } | null;
  };
}

export function ComplaintDetailsHeader({ complaint }: ComplaintDetailsHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
            <ComplaintStatusBadge status={complaint.status} size="lg" />
            <ComplaintPriorityBadge priority={complaint.priority} size="lg" />
          </div>
          <p className="text-gray-600">
            Tracking Code: <span className="font-mono">{complaint.tracking_code}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">
              Category: {complaint.category?.name}
              {complaint.subcategory && ` / ${complaint.subcategory.name}`}
            </span>
            <span className="text-sm text-gray-500">
              • Ward: {complaint.ward ? `Ward ${complaint.ward.ward_number} - ${complaint.ward.name}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}