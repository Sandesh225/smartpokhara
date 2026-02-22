"use client";

import { User, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardItem {
  staffId: string;
  name: string;
  avatarUrl?: string;
  role: string;
  score: number; // e.g. SLA Compliance % or Rating
  rank: number;
}

interface Props {
  data: LeaderboardItem[];
  metricLabel: string;
}

export function PerformanceLeaderboard({ data, metricLabel }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h3 className="text-base font-bold text-foreground">Leaderboard ({metricLabel})</h3>
      </div>
      
      <div className="divide-y divide-border">
        {data.slice(0, 5).map((item) => (
          <div key={item.staffId} className="flex items-center p-4 hover:bg-muted/10 transition-colors">
            <div className="w-8 text-center font-bold text-muted-foreground">
              {item.rank === 1 ? <Medal className="h-5 w-5 text-yellow-500 mx-auto" /> : 
               item.rank === 2 ? <Medal className="h-5 w-5 text-gray-400 mx-auto" /> : 
               item.rank === 3 ? <Medal className="h-5 w-5 text-orange-400 mx-auto" /> : 
               `#${item.rank}`}
            </div>
            
            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center overflow-hidden mx-3">
               {item.avatarUrl ? (
                 <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" />
               ) : (
                 <User className="h-5 w-5 text-muted-foreground/60" />
               )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.role.replace(/_/g, ' ')}</p>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-primary">{item.score}</span>
              <span className="text-xs text-muted-foreground block">%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}