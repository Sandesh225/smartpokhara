// ═══════════════════════════════════════════════════════════
// STAFF TABLE - Responsive with Desktop/Mobile Views
// ═══════════════════════════════════════════════════════════

"use client";

import { AdminStaffListItem } from "@/features/staff/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Ban,
  MoreHorizontal,
  MapPin,
  Building2,
  User,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StaffTableProps {
  data: AdminStaffListItem[];
  loading?: boolean;
  onDeactivate: (id: string) => void;
}

export function StaffTable({ data, loading, onDeactivate }: StaffTableProps) {
  if (loading) return <StaffTableSkeleton />;

  if (data.length === 0) {
    return (
      <div className="stone-card border-2 border-dashed py-12 md:py-16 text-center">
        <User className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
          No Staff Found
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">
          Try adjusting filters or add a new staff member
        </p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden lg:block stone-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Staff Member
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Assignment
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[200px]">
                  Workload
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((staff) => (
                <tr
                  key={staff.user_id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {/* User Info */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={staff.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {staff.full_name?.[0]?.toUpperCase() || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground truncate">
                          {staff.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {staff.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role & Context */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Badge
                        variant="secondary"
                        className="font-medium capitalize w-fit"
                      >
                        {staff.staff_role?.replace(/_/g, " ")}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {staff.department_name ? (
                          <>
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">
                              {staff.department_name}
                            </span>
                          </>
                        ) : staff.ward_number ? (
                          <>
                            <MapPin className="w-3 h-3" />
                            Ward {staff.ward_number}
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Unassigned
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={staff.availability_status} />
                  </td>

                  {/* Workload */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs items-center">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          {staff.current_workload || 0} Active
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Cap: 10
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${Math.min(((staff.current_workload || 0) / 10) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase">
                            Manage Staff
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/staff/${staff.user_id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-primary" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error-red focus:text-error-red focus:bg-error-red/10 cursor-pointer"
                            onClick={() => onDeactivate(staff.user_id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-3">
        {data.map((staff) => (
          <div key={staff.user_id} className="stone-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 border border-border shrink-0">
                <AvatarImage src={staff.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {staff.full_name?.[0]?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground truncate">
                  {staff.full_name}
                </h4>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {staff.email}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/staff/${staff.user_id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-error-red"
                    onClick={() => onDeactivate(staff.user_id)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Role & Assignment */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs capitalize">
                {staff.staff_role?.replace(/_/g, " ")}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {staff.department_name ? (
                  <>
                    <Building2 className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                      {staff.department_name}
                    </span>
                  </>
                ) : staff.ward_number ? (
                  <>
                    <MapPin className="w-3 h-3" />
                    Ward {staff.ward_number}
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    Unassigned
                  </>
                )}
              </div>
            </div>

            {/* Status & Workload */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={staff.availability_status} />
                <span className="text-xs font-bold text-foreground">
                  {staff.current_workload || 0}/10 Tasks
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(((staff.current_workload || 0) / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ═══════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const config = {
    available: {
      color: "bg-success-green",
      text: "text-success-green",
      bg: "bg-success-green/10",
      label: "Available",
    },
    busy: {
      color: "bg-warning-amber",
      text: "text-warning-amber",
      bg: "bg-warning-amber/10",
      label: "Busy",
    },
    on_break: {
      color: "bg-info-blue",
      text: "text-info-blue",
      bg: "bg-info-blue/10",
      label: "On Break",
    },
    off_duty: {
      color: "bg-muted-foreground",
      text: "text-muted-foreground",
      bg: "bg-muted",
      label: "Off Duty",
    },
    on_leave: {
      color: "bg-secondary",
      text: "text-secondary",
      bg: "bg-secondary/10",
      label: "On Leave",
    },
    default: {
      color: "bg-muted-foreground",
      text: "text-muted-foreground",
      bg: "bg-muted",
      label: "Offline",
    },
  };

  const style = config[status as keyof typeof config] || config.default;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 py-1 rounded-full border border-transparent",
        style.bg
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 md:h-2 md:w-2 rounded-full",
          style.color,
          status === "available" && "animate-pulse"
        )}
      />
      <span className={cn("text-[10px] md:text-xs font-bold", style.text)}>
        {style.label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════════

function StaffTableSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="stone-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 md:w-48" />
                <Skeleton className="h-3 w-24 md:w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 md:w-24 rounded-full" />
            <Skeleton className="hidden lg:block h-2 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
