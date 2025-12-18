import { Medal, Star, Zap, Award } from "lucide-react";

interface Achievement {
  id: string;
  badge_name: string;
  description: string;
  earned_at: string;
}

export function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500">
        <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No badges earned yet. Keep working!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-500" /> Achievements
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {achievements.map((item) => (
          <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-2">
               <Star className="w-6 h-6 fill-current" />
             </div>
             <p className="text-sm font-bold text-gray-900">{item.badge_name}</p>
             <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}