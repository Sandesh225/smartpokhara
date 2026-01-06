"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WorkloadDistributionProps {
  staff: {
    staffId: string;
    name: string;
    workloadPercentage: number;
  }[];
}

const getBarColor = (percentage: number) => {
  if (percentage >= 80) return "#DC2626";
  if (percentage >= 60) return "#F59E0B";
  return "#2563EB";
};

export function WorkloadDistribution({ staff }: WorkloadDistributionProps) {
  const data = staff.map(s => ({
    name: s.name.split(' ')[0], 
    workload: s.workloadPercentage,
    fullName: s.name
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Workload Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
          <Tooltip 
             cursor={{fill: '#f3f4f6'}}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="workload" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.workload)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}