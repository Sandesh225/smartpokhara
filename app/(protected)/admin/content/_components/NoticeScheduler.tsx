import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NoticeSchedulerProps {
    register: any;
}

export function NoticeScheduler({ register }: NoticeSchedulerProps) {
    return (
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border rounded-lg">
            <div className="space-y-2">
                <Label>Publish At</Label>
                <Input type="datetime-local" {...register("published_at")} className="bg-white" />
            </div>
            <div className="space-y-2">
                <Label>Expires At</Label>
                <Input type="datetime-local" {...register("expires_at")} className="bg-white" />
            </div>
        </div>
    );
}