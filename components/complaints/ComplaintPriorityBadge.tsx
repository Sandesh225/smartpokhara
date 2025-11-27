// components/complaints/ComplaintPriorityBadge.tsx
'use client';

interface ComplaintPriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

export function ComplaintPriorityBadge({ priority, size = 'md' }: ComplaintPriorityBadgeProps) {
  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
  };

  const config = priorityConfig[priority];
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