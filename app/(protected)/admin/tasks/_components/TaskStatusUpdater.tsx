import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TaskStatusUpdater({ status, onUpdate }: { status: string, onUpdate: (s: string) => void }) {
  const steps = ['not_started', 'in_progress', 'completed'];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="bg-white p-4 rounded-lg border">
       <h3 className="font-semibold mb-4">Task Status</h3>
       <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100"></div>
          {steps.map((step, idx) => (
             <div key={step} className="z-10 flex flex-col items-center bg-white">
                <div className={`w-4 h-4 rounded-full border-2 ${idx <= currentIdx ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
                <span className="text-xs mt-1 capitalize">{step.replace('_', ' ')}</span>
             </div>
          ))}
       </div>
       <div className="mt-6 flex gap-2">
          {status !== 'completed' && (
             <Button className="w-full" onClick={() => onUpdate(steps[currentIdx + 1])}>
                Move to {steps[currentIdx + 1]?.replace('_', ' ')}
             </Button>
          )}
          {status === 'completed' && (
             <Badge className="w-full justify-center bg-green-500 py-2">Task Completed</Badge>
          )}
       </div>
    </div>
  );
}