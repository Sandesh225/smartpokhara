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
  if (percentage >= 80) return "var(--destructive)";
  if (percentage >= 60) return "var(--warning-amber)";
  return "var(--primary)";
};

export function WorkloadDistribution({ staff }: WorkloadDistributionProps) {
  const data = staff.map(s => ({
    name: s.name.split(' ')[0], 
    workload: s.workloadPercentage,
    fullName: s.name
  }));

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-xs h-80">
      <h3 className="text-sm font-semibold text-foreground mb-4">Team Workload Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--foreground)" }} width={80} />
          <Tooltip 
             cursor={{fill: 'var(--muted)'}}
             contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', backgroundColor: 'var(--card)' }}
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