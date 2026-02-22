"use client";

import { Star, Zap, Award, Medal, Trophy } from "lucide-react";
import { Achievement } from "@/features/staff/types";
import { format } from "date-fns";

// Map database 'icon_key' strings to Lucide Components
const IconMap: Record<string, any> = {
  star: Star,
  zap: Zap,
  medal: Medal,
  trophy: Trophy,
  award: Award,
  default: Award,
};

export function AchievementsList({
  achievements,
}: {
  achievements: Achievement[];
}) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="bg-card p-8 rounded-xl border border-border text-center flex flex-col items-center justify-center min-h-[240px]">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
          <Award className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-foreground font-bold">No Badges Yet</h3>
        <p className="text-muted-foreground text-xs mt-1 max-w-[200px] font-medium leading-relaxed">
          Complete tasks on time and resolve complaints to earn your first
          badge!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-xs h-full">
      <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest">
        <Award className="w-4 h-4 text-warning-amber" /> Recent Achievements
      </h3>

      <div className="space-y-4">
        {achievements.map((item) => {
          // Dynamic Icon Selection
          const IconComponent = IconMap[item.icon_key] || IconMap.default;

          return (
            <div
              key={item.id}
              className="group p-4 bg-muted/30 hover:bg-primary/5 border border-border rounded-xl flex items-start gap-4 transition-all active:scale-[0.99]"
            >
              <div className="w-12 h-12 bg-card rounded-full shadow-xs flex items-center justify-center text-warning-amber shrink-0 group-hover:scale-110 transition-transform border border-border">
                <IconComponent className="w-6 h-6 fill-current/10" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-foreground truncate pr-2 tracking-tight">
                    {item.badge_name}
                  </h4>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border whitespace-nowrap uppercase tracking-tighter">
                    {format(new Date(item.earned_at), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
