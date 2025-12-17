import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointerClick, Bell } from "lucide-react";

interface AnalyticsProps {
    data: {
        unique_views: number;
        click_through_rate: number;
        total_sent: number;
    }
}

export function NoticeAnalytics({ data }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
       <Card>
          <CardContent className="p-4 flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Eye className="h-4 w-4"/></div>
             <div>
                <p className="text-2xl font-bold">{data.unique_views}</p>
                <p className="text-xs text-gray-500">Unique Views</p>
             </div>
          </CardContent>
       </Card>
       <Card>
          <CardContent className="p-4 flex items-center gap-3">
             <div className="p-2 bg-green-100 rounded-full text-green-600"><MousePointerClick className="h-4 w-4"/></div>
             <div>
                <p className="text-2xl font-bold">{data.click_through_rate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">CTR</p>
             </div>
          </CardContent>
       </Card>
       <Card>
          <CardContent className="p-4 flex items-center gap-3">
             <div className="p-2 bg-purple-100 rounded-full text-purple-600"><Bell className="h-4 w-4"/></div>
             <div>
                <p className="text-2xl font-bold">{data.total_sent}</p>
                <p className="text-xs text-gray-500">Notifications Sent</p>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}