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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base font-bold text-gray-900">Leaderboard ({metricLabel})</h3>
      </div>
      
      <div className="divide-y divide-gray-50">
        {data.slice(0, 5).map((item) => (
          <div key={item.staffId} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
            <div className="w-8 text-center font-bold text-gray-400">
              {item.rank === 1 ? <Medal className="h-5 w-5 text-yellow-500 mx-auto" /> : 
               item.rank === 2 ? <Medal className="h-5 w-5 text-gray-400 mx-auto" /> : 
               item.rank === 3 ? <Medal className="h-5 w-5 text-orange-400 mx-auto" /> : 
               `#${item.rank}`}
            </div>
            
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-3">
               {item.avatarUrl ? (
                 <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" />
               ) : (
                 <User className="h-5 w-5 text-gray-500" />
               )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500 capitalize">{item.role.replace(/_/g, ' ')}</p>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">{item.score}</span>
              <span className="text-[10px] text-gray-400 block">%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}