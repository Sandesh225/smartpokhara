import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const supabase = await createClient();

  // Fetch performance data from Materialized View
  const { data: staffPerformance, error } = await supabase
    .from("mv_staff_performance")
    .select("*")
    .order("resolved_complaints", { ascending: false });

  if (error) {
    console.error("Error fetching staff performance:", error);
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 font-medium">Failed to load performance data</div>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    );
  }

  const topPerformers = staffPerformance?.slice(0, 5) || [];
  
  // Identify laggards (High active count, low completion, low rating)
  const laggards = [...(staffPerformance || [])]
    .sort((a, b) => (a.avg_rating || 0) - (b.avg_rating || 0))
    .slice(0, 5)
    .filter(s => (s.active_complaints || 0) > 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Performance</h1>
            <p className="text-gray-500">Monthly analytics and efficiency reports.</p>
         </div>
         <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Report
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Leaderboard */}
         <Card className="border-t-4 border-t-yellow-400 shadow-sm overflow-hidden">
            <CardHeader className="bg-yellow-50/30 pb-4">
               <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Trophy className="w-5 h-5" /> Top Performers
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               {topPerformers.map((staff, index) => (
                  <div key={staff.user_id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                     <div className="font-bold text-lg text-yellow-500 w-8 text-center">#{index + 1}</div>
                     <Avatar>
                         {/* Fallback to initials if no name */}
                        <AvatarFallback className="bg-yellow-100 text-yellow-700">{staff.full_name?.[0] || 'S'}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{staff.full_name}</div>
                        <div className="text-xs text-gray-500 truncate">{staff.department || (staff.ward_number ? `Ward ${staff.ward_number}` : 'Unassigned')}</div>
                     </div>
                     <div className="text-right shrink-0">
                        <div className="font-bold text-lg text-gray-900">{staff.resolved_complaints}</div>
                        <div className="text-[10px] uppercase text-gray-400 font-bold">Resolved</div>
                     </div>
                  </div>
               ))}
               {topPerformers.length === 0 && <p className="text-gray-500 text-center py-8">No performance data available.</p>}
            </CardContent>
         </Card>

         {/* Attention Needed */}
         <Card className="border-t-4 border-t-red-400 shadow-sm overflow-hidden">
            <CardHeader className="bg-red-50/30 pb-4">
               <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" /> Needs Attention
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               {laggards.map((staff) => (
                  <div key={staff.user_id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                     <Avatar>
                        <AvatarFallback className="bg-red-100 text-red-700">{staff.full_name?.[0] || 'S'}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{staff.full_name}</div>
                        <div className="flex gap-2 mt-1">
                           <Badge variant="outline" className="text-[10px] border-red-200 text-red-600 bg-red-50">
                              {staff.active_complaints} Active
                           </Badge>
                           <Badge variant="outline" className="text-[10px] border-orange-200 text-orange-600 bg-orange-50">
                              {staff.avg_rating ? Number(staff.avg_rating).toFixed(1) : '0.0'} Rating
                           </Badge>
                        </div>
                     </div>
                     <Button variant="ghost" size="sm" className="text-xs hover:bg-red-50 hover:text-red-600">Review</Button>
                  </div>
               ))}
               {laggards.length === 0 && <p className="text-gray-500 text-center py-8">All staff performing well or no data.</p>}
            </CardContent>
         </Card>
      </div>

      {/* Metrics Table */}
      <Card>
         <CardHeader><CardTitle>Detailed Metrics</CardTitle></CardHeader>
         <CardContent>
            <div className="overflow-x-auto rounded-md border">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                     <tr>
                        <th className="p-3">Staff Name</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-center">Total Assigned</th>
                        <th className="p-3 text-center">Resolved</th>
                        <th className="p-3 text-center">On-Time %</th>
                        <th className="p-3 text-center">Avg Rating</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y">
                     {staffPerformance?.map((staff) => (
                        <tr key={staff.user_id} className="hover:bg-gray-50 transition-colors">
                           <td className="p-3 font-medium">{staff.full_name}</td>
                           <td className="p-3 text-gray-500 capitalize">{staff.staff_role?.replace('_', ' ')}</td>
                           <td className="p-3 text-center">{staff.total_complaints}</td>
                           <td className="p-3 text-center text-green-600 font-bold">{staff.resolved_complaints}</td>
                           <td className="p-3 text-center">
                              {(staff.resolved_complaints || 0) > 0 
                                 ? (((staff.on_time_resolutions || 0) / staff.resolved_complaints) * 100).toFixed(0) 
                                 : '-'}%
                           </td>
                           <td className="p-3 text-center font-mono">
                              {staff.avg_rating ? Number(staff.avg_rating).toFixed(1) : '-'}
                           </td>
                        </tr>
                     ))}
                     {(!staffPerformance || staffPerformance.length === 0) && (
                        <tr>
                           <td colSpan={6} className="p-8 text-center text-gray-500">No performance records found.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}