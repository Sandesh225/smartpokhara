// components/shared/StatusBadge.tsx
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      received: { color: 'bg-indigo-100 text-indigo-800', label: 'Received' },
      assigned: { color: 'bg-yellow-100 text-yellow-800', label: 'Assigned' },
      in_progress: { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      escalated: { color: 'bg-purple-100 text-purple-800', label: 'Escalated' },
    };

    return config[status as keyof typeof config] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const { color, label } = getStatusConfig(status);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
}