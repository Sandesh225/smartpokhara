"use client";

import { AdminStaffListItem } from "@/types/admin-staff";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Ban, MoreHorizontal, MapPin, Building2, User, Clock } from "lucide-react";
import Link from "next/link";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface StaffTableProps {
  data: AdminStaffListItem[];
  loading?: boolean;
  onDeactivate: (id: string) => void;
}

export function StaffTable({ data, loading, onDeactivate }: StaffTableProps) {
  if (loading) {
    return <StaffTableSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Staff Member</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Assignment</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider w-[240px]">Workload Capacity</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-500 uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((staff) => (
              <tr key={staff.user_id} className="group hover:bg-blue-50/30 transition-colors">
                
                {/* User Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-100 ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                      <AvatarImage src={staff.avatar_url} alt={staff.full_name} />
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                        {staff.full_name?.[0]?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{staff.full_name}</span>
                      <span className="text-xs text-slate-500 font-mono">{staff.email}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-mono sm:hidden">{staff.staff_code}</span>
                    </div>
                  </div>
                </td>

                {/* Role & Context */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 border-slate-200 capitalize shadow-sm">
                       {staff.staff_role?.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {staff.department_name ? (
                            <><Building2 className="w-3 h-3 text-slate-400" /> {staff.department_name}</>
                        ) : staff.ward_number ? (
                            <><MapPin className="w-3 h-3 text-slate-400" /> Ward {staff.ward_number}</>
                        ) : (
                            <><User className="w-3 h-3 text-slate-400" /> Unassigned</>
                        )}
                    </div>
                  </div>
                </td>

                {/* Status Indicator */}
                <td className="px-6 py-4">
                   <StatusBadge status={staff.availability_status} />
                </td>

                {/* Workload Bar (BLUE THEME) */}
                <td className="px-6 py-4">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs items-end">
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {staff.current_workload} Active
                      </span>
                      <span className="text-[10px] text-slate-400">Cap: 10</span>
                    </div>
                    {/* Consistent Blue Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-500 ease-out"
                            style={{ 
                                width: `${Math.min(((staff.current_workload || 0) / 10) * 100, 100)}%`,
                                opacity: Math.max(0.5, ((staff.current_workload || 0) / 10)) 
                            }} 
                        />
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-white data-[state=open]:bg-white data-[state=open]:text-slate-900 transition-colors">
                         <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Manage Staff</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/staff/${staff.user_id}`} className="cursor-pointer group">
                          <Eye className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600"/> View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" 
                        onClick={() => onDeactivate(staff.user_id)}
                      >
                        <Ban className="mr-2 h-4 w-4"/> Deactivate Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <User className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="font-medium">No staff members found.</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting filters or add a new staff member.</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------- Helper Components ----------------

function StatusBadge({ status }: { status: string }) {
    const config = {
        available: { color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", label: "Available" },
        busy: { color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", label: "Busy" },
        on_break: { color: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50", label: "On Break" },
        off_duty: { color: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100", label: "Off Duty" },
        on_leave: { color: "bg-purple-400", text: "text-purple-700", bg: "bg-purple-50", label: "On Leave" },
        default: { color: "bg-slate-300", text: "text-slate-500", bg: "bg-slate-50", label: "Offline" }
    };
    const style = config[status as keyof typeof config] || config.default;

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-transparent ${style.bg}`}>
            <span className={`h-2 w-2 rounded-full ${style.color} ${status === 'available' ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
        </div>
    );
}

function StaffTableSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-white">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-2 w-32" />
                </div>
            ))}
        </div>
    )
}