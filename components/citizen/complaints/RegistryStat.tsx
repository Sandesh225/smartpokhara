import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface RegistryStatProps {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
}

export function RegistryStat({
  label,
  value,
  icon: Icon,
  colorClass,
}: RegistryStatProps) {
  return (
    <Card className="stone-card elevation-2 hover:elevation-3 transition-all group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </p>
            <h3 className="text-3xl lg:text-4xl font-black tracking-tighter tabular-nums">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              "p-3 rounded-2xl transition-transform group-hover:scale-110 elevation-1",
              colorClass
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}