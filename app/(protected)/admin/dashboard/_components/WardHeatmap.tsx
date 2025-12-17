
// WardHeatmap.tsx - Enhanced
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WardStat } from "@/types/admin";
import { Map, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WardHeatmap({ data }: { data: WardStat[] }) {
  const sortedWards = [...data].sort((a, b) => b.complaint_count - a.complaint_count).slice(0, 12);
  const maxCount = sortedWards[0]?.complaint_count || 0;

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50">
              <Map className="w-5 h-5 text-teal-600" />
            </div>
            Ward Hotspots
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium">
            Top {sortedWards.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sortedWards.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {sortedWards.map((ward) => {
              // Calculate intensity based on relative count
              const intensity = maxCount > 0 ? ward.complaint_count / maxCount : 0;
              let colorClasses = "bg-green-100 text-green-800 border-green-200";
              
              if (intensity > 0.75) colorClasses = "bg-red-100 text-red-800 border-red-200";
              else if (intensity > 0.5) colorClasses = "bg-orange-100 text-orange-800 border-orange-200";
              else if (intensity > 0.25) colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-200";

              return (
                <div 
                  key={ward.ward_number} 
                  className={`
                    relative flex flex-col items-center justify-center p-4 rounded-xl 
                    border-2 ${colorClasses}
                    text-center transition-all duration-200
                    hover:scale-105 hover:shadow-md cursor-pointer
                  `}
                >
                  <MapPin className="w-4 h-4 mb-1 opacity-60" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Ward</span>
                  <span className="text-2xl font-bold leading-none my-1">{ward.ward_number}</span>
                  <span className="text-[10px] font-semibold mt-1">
                    {ward.complaint_count} {ward.complaint_count === 1 ? 'Issue' : 'Issues'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No ward data available</p>
            <p className="text-xs text-gray-400 mt-1">Ward statistics will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
