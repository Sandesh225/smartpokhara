import { Clock, AlertCircle } from 'lucide-react';

export default function SLAConfigurator() {
  const priorities = [
    { level: 'Critical', color: 'bg-red-100 text-red-700', default: 24 },
    { level: 'High', color: 'bg-orange-100 text-orange-700', default: 48 },
    { level: 'Medium', color: 'bg-blue-100 text-blue-700', default: 72 },
    { level: 'Low', color: 'bg-gray-100 text-gray-700', default: 120 },
  ];

  return (
    <div className="stone-card p-6">
      <h3 className="font-bold text-lg text-foreground mb-1">SLA Configuration</h3>
      <p className="text-sm text-muted-foreground mb-6">Set default resolution timeframes (in hours) based on priority.</p>

      <div className="space-y-6">
        {priorities.map((p) => (
          <div key={p.level} className="flex items-center gap-4">
            <div className={`w-24 py-1.5 rounded text-center text-xs font-bold uppercase tracking-wider ${p.color}`}>
              {p.level}
            </div>
            <div className="flex-1 relative">
              <input 
                type="range" 
                min="1" 
                max="168" 
                defaultValue={p.default} 
                className="w-full h-2 bg-neutral-stone-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                <span>1h</span>
                <span>24h</span>
                <span>48h</span>
                <span>1 Week</span>
              </div>
            </div>
            <div className="w-20 text-right">
              <input 
                type="number" 
                defaultValue={p.default} 
                className="w-16 p-2 text-right border border-border rounded font-mono text-sm" 
              />
              <span className="text-xs text-muted-foreground ml-1">h</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-sm text-amber-800">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>Changing these values will only affect new complaints. Existing SLA timers will remain unchanged.</p>
      </div>
    </div>
  );
}