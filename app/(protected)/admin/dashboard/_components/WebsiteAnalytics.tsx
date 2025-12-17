
// WebsiteAnalytics.tsx - Enhanced
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebsiteMetric } from "@/types/admin";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export function WebsiteAnalytics({ data }: { data: WebsiteMetric[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-50">
            <Activity className="w-5 h-5 text-sky-600" />
          </div>
          System Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {data.map((metric, i) => (
              <div 
                key={i} 
                className="
                  relative overflow-hidden text-center p-4 rounded-xl 
                  bg-linear-to-br from-slate-50 to-slate-100/50
                  border border-slate-200
                  hover:border-slate-300 hover:shadow-md
                  transition-all duration-200
                "
              >
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {metric.value}
                </p>
                {metric.change && (
                  <div 
                    className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold
                      ${metric.trend === 'up' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }
                    `}
                  >
                    {metric.trend === 'up' 
                      ? <TrendingUp className="w-3 h-3"/> 
                      : <TrendingDown className="w-3 h-3"/>
                    }
                    {metric.change}%
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No activity data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}