import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MoreHorizontal, Clock, UserCog, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

interface ComplaintsTableProps {
  data: any[];
  loading: boolean;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function ComplaintsTable({ data, loading, selectedIds, onSelect, onSelectAll, pagination }: ComplaintsTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12"><Skeleton className="h-4 w-4" /></th>
                <th className="px-6 py-4 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-6 py-4 text-left"><Skeleton className="h-4 w-32" /></th>
                <th className="px-6 py-4 text-left"><Skeleton className="h-4 w-28" /></th>
                <th className="px-6 py-4 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-6 py-4 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-6 py-4 text-left"><Skeleton className="h-4 w-28" /></th>
                <th className="px-6 py-4 text-right"><Skeleton className="h-4 w-16" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-10 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-10 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints found</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Try adjusting your filters or search criteria to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-linear-to-b from-gray-50 to-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-12">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={(c) => onSelectAll(!!c)}
                  aria-label="Select all complaints"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tracking ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Issue Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Priority / SLA
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr 
                key={row.id} 
                className={`group hover:bg-gray-50/80 transition-colors duration-150 ${
                  selectedIds.includes(row.id) ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <Checkbox 
                    checked={selectedIds.includes(row.id)} 
                    onCheckedChange={(c) => onSelect(row.id, !!c)}
                    aria-label={`Select complaint ${row.tracking_code}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/admin/complaints/${row.id}`} 
                    className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    {row.tracking_code}
                  </Link>
                </td>
                <td className="px-6 py-4 max-w-[280px]">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 truncate leading-snug" title={row.title}>
                      {row.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {row.category_name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                      <AvatarImage src={row.citizen_avatar} />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                        {row.citizen_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[140px] font-medium text-gray-700">
                      {row.citizen_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-gray-900 text-sm">
                      Ward {row.ward_number}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[160px]" title={row.ward?.name}>
                      {row.ward?.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <BadgeStatus status={row.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <BadgePriority priority={row.priority} />
                    {row.sla_due_at && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(row.sla_due_at) < new Date() ? (
                          <span className="text-red-600 font-bold">Overdue</span>
                        ) : (
                          <span className="text-gray-600">
                            {formatDistanceToNow(new Date(row.sla_due_at))} left
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                        aria-label="Open actions menu"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/complaints/${row.id}`} className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2 text-gray-500" /> 
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <UserCog className="w-4 h-4 mr-2 text-gray-500" /> 
                        Assign Staff
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> 
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{(pagination.pageIndex - 1) * pagination.pageSize + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(pagination.pageIndex * pagination.pageSize, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> complaints
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={pagination.pageIndex === 1}
            onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            className="disabled:opacity-50"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.pageIndex * pagination.pageSize >= pagination.total}
            onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            className="disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Badge Components with Enhanced Styling
function BadgeStatus({ status }: { status: string }) {
  const styles: any = {
    received: "bg-gray-100 text-gray-700 border-gray-200",
    assigned: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-purple-100 text-purple-700 border-purple-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
    rejected: "bg-red-100 text-red-700 border-red-200"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${styles[status] || styles.received}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

function BadgePriority({ priority }: { priority: string }) {
  const styles: any = {
    low: "bg-slate-50 text-slate-600 border-slate-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
    urgent: "bg-red-100 text-red-700 border-red-300"
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold uppercase tracking-wide w-fit ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
}