// components/complaints/ComplaintStatusBadge.tsx
'use client';

interface ComplaintStatusBadgeProps {
  status: 'draft' | 'submitted' | 'received' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'escalated';
  size?: 'sm' | 'md' | 'lg';
}

export function ComplaintStatusBadge({ status, size = 'md' }: ComplaintStatusBadgeProps) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    received: { label: 'Received', color: 'bg-purple-100 text-purple-800' },
    assigned: { label: 'Assigned', color: 'bg-yellow-100 text-yellow-800' },
    in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    escalated: { label: 'Escalated', color: 'bg-pink-100 text-pink-800' },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}