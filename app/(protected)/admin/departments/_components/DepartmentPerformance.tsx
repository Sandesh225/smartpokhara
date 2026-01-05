import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  total: number;
  resolved: number;
  open: number;
  overdue: number;
}

export default function DepartmentPerformance({ total, resolved, open, overdue }: Props) {
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  return (
    <div className="stone-card p-6">
      <h4 className="font-bold text-lg mb-6 text-primary">Department Performance</h4>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-neutral-stone-50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Resolution Rate</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{resolutionRate}%</div>
          <div className="text-xs text-green-600 flex items-center mt-2 font-medium">
             <CheckCircle2 className="w-3 h-3 mr-1" /> {resolved} Resolved
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-stone-50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Active Cases</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{open}</div>
          <div className="text-xs text-blue-600 flex items-center mt-2 font-medium">
             in progress
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-stone-50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">SLA Breaches</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{overdue}</div>
          <div className="text-xs text-red-600 flex items-center mt-2 font-medium">
            <AlertCircle className="w-3 h-3 mr-1" /> Needs Attention
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm font-medium">
          <span>Overall Efficiency</span>
          <span className="text-primary">{resolutionRate}%</span>
        </div>
        <div className="h-3 w-full bg-neutral-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-chart-1 rounded-full transition-all duration-500" style={{ width: `${resolutionRate}%` }}></div>
        </div>
      </div>
    </div>
  );
}