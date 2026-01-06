"use client";

import { Star, Zap, Award, Medal, Trophy } from "lucide-react";
import { Achievement } from "@/types/staff";
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
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center min-h-[240px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold">No Badges Yet</h3>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          Complete tasks on time and resolve complaints to earn your first
          badge!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-500" /> Recent Achievements
      </h3>

      <div className="space-y-4">
        {achievements.map((item) => {
          // Dynamic Icon Selection
          const IconComponent = IconMap[item.icon_key] || IconMap.default;

          return (
            <div
              key={item.id}
              className="group p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-xl flex items-start gap-4 transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-yellow-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                <IconComponent className="w-6 h-6 fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-gray-900 truncate pr-2">
                    {item.badge_name}
                  </h4>
                  <span className="text-[10px] font-medium text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100 whitespace-nowrap">
                    {format(new Date(item.earned_at), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
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
