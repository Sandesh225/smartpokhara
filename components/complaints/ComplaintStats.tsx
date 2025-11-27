// components/complaints/ComplaintStats.tsx
'use client';

interface StatItem {
  status: string;
  count: number;
}

interface ComplaintStatsProps {
  stats: StatItem[];
}

export function ComplaintStats({ stats }: ComplaintStatsProps) {
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

  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm font-medium text-gray-500">Total Complaints</p>
        <p className="text-2xl font-semibold text-gray-900">{total}</p>
      </div>

      {stats.map((item) => {
        const config = statusConfig[item.status as keyof typeof statusConfig] || { label: item.status, color: 'bg-gray-100 text-gray-800' };
        return (
          <div key={item.status} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-500">{config.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{item.count}</p>
          </div>
        );
      })}
    </div>
  );
}