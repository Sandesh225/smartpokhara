"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface StaffPerformanceProps {
  metrics: {
    total_complaints: number;
    resolved_complaints: number;
    avg_assignment_hours: number;
    on_time_resolutions: number;
    avg_rating: number;
    sla_compliance_rate?: number;
  };
}

export function StaffPerformance({ metrics }: StaffPerformanceProps) {
  const compliance = metrics.sla_compliance_rate || 
    (metrics.resolved_complaints > 0 
      ? (metrics.on_time_resolutions / metrics.resolved_complaints) * 100 
      : 100);

  return (
    <Card className="h-full border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-gray-900">Performance Metrics</CardTitle>
          <Badge variant="outline" className={compliance > 80 ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"}>
            {compliance.toFixed(0)}% SLA Compliance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Resolution Rate
             </div>
             <div className="text-xl font-bold text-slate-800">
                {metrics.total_complaints > 0 
                  ? ((metrics.resolved_complaints / metrics.total_complaints) * 100).toFixed(0) 
                  : 0}%
             </div>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Clock className="w-3 h-3 text-blue-500" /> Avg Time
             </div>
             <div className="text-xl font-bold text-slate-800">
                {metrics.avg_assignment_hours ? metrics.avg_assignment_hours.toFixed(1) : '-'} <span className="text-xs font-normal text-gray-400">hrs</span>
             </div>
          </div>
        </div>

        {/* Rating Bar */}
        <div className="space-y-2">
           <div className="flex justify-between text-sm">
              <span className="text-gray-600">Citizen Rating</span>
              <span className="font-bold text-gray-900">{metrics.avg_rating ? metrics.avg_rating.toFixed(1) : 'N/A'} / 5.0</span>
           </div>
           <Progress value={(metrics.avg_rating || 0) * 20} className="h-2 bg-slate-100" />
        </div>

        {/* Efficiency Indicator */}
        <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">
           <TrendingUp className="w-5 h-5" />
           <span className="font-medium">Top 15% efficiency in department</span>
        </div>

      </CardContent>
    </Card>
  );
}