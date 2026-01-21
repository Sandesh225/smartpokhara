// ═══════════════════════════════════════════════════════════
// components/admin/user-table.tsx - ENHANCED USER TABLE
// ═══════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  X,
  Calendar,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface RoleRow {
  id: string;
  name?: string | null;
  role_type?: string | null;
  [key: string]: unknown;
}

interface UserProfile {
  full_name?: string | null;
  phone_number?: string | null;
  [key: string]: unknown;
}

interface UserRoleRow {
  id?: string;
  role_id?: string;
  role?: RoleRow | null;
  assigned_at?: string | null;
  [key: string]: unknown;
}

interface UserRow {
  id: string;
  email: string;
  created_at?: string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  user_profiles?: UserProfile | null;
  user_roles?: UserRoleRow[] | null;
  [key: string]: unknown;
}

interface UsersPageSearchParams {
  page?: string;
  search?: string;
  role?: string;
  status?: string;
  verified?: string;
}

interface UserTableProps {
  users: UserRow[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  searchParams: UsersPageSearchParams;
  roles: RoleRow[];
}

function buildUsersUrl(
  base: UsersPageSearchParams,
  overrides: Partial<UsersPageSearchParams> = {}
): string {
  const merged: UsersPageSearchParams = { ...base, ...overrides };
  const params = new URLSearchParams();

  if (merged.search) params.set("search", merged.search);
  if (merged.role) params.set("role", merged.role);
  if (merged.status) params.set("status", merged.status);
  if (merged.verified) params.set("verified", merged.verified);
  if (merged.page) params.set("page", merged.page);

  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export function UserTable({
  users,
  totalCount,
  currentPage,
  itemsPerPage,
  searchParams,
  roles,
}: UserTableProps) {
  const safePage = Number.isFinite(Number(currentPage))
    ? Math.max(1, Number(currentPage))
    : 1;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / itemsPerPage)) : 1;

  const hasPrevious = safePage > 1;
  const hasNext = safePage < totalPages;

  const currentSearch = searchParams.search ?? "";
  const currentStatus = searchParams.status ?? "";
  const currentVerified = searchParams.verified ?? "";
  const currentRole = searchParams.role ?? "";

  const hasActiveFilters = !!(
    currentSearch ||
    currentStatus ||
    currentVerified ||
    currentRole
  );

  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <CardHeader className="space-y-4 border-b-2 border-border bg-muted/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl font-black text-foreground tracking-tight">
                User Management
              </CardTitle>
              <p className="mt-0.5 text-xs md:text-sm text-muted-foreground font-medium">
                {totalCount} user{totalCount === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          <Link href="/admin/users/new">
            <Button size="sm" className="gap-2 font-bold">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </Link>
        </div>

        {/* FILTERS */}
        <form
          method="GET"
          action="/admin/users"
          className="flex flex-col gap-3 pt-2"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={currentSearch}
                placeholder="Search by name or email..."
                className="pl-9 font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                name="role"
                defaultValue={currentRole}
                className="h-9 rounded-lg border-2 border-border bg-card px-3 text-xs md:text-sm font-bold text-foreground hover:bg-accent transition-colors"
              >
                <option value="">All roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.name ?? "Unnamed role"}
                  </option>
                ))}
              </select>

              <select
                name="status"
                defaultValue={currentStatus}
                className="h-9 rounded-lg border-2 border-border bg-card px-3 text-xs md:text-sm font-bold text-foreground hover:bg-accent transition-colors"
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                name="verified"
                defaultValue={currentVerified}
                className="h-9 rounded-lg border-2 border-border bg-card px-3 text-xs md:text-sm font-bold text-foreground hover:bg-accent transition-colors"
              >
                <option value="">All verification</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>

              <input type="hidden" name="page" value="1" />

              <Button type="submit" size="sm" className="gap-1.5 font-bold">
                <Filter className="w-3.5 h-3.5" />
                Apply
              </Button>

              {hasActiveFilters && (
                <Link href="/admin/users">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </form>

        {/* ACTIVE FILTER CHIPS */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-1">
            {currentSearch && (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary font-bold"
              >
                Search: <span className="ml-1">{currentSearch}</span>
              </Badge>
            )}
            {currentRole && (
              <Badge
                variant="outline"
                className="border-secondary/30 bg-secondary/5 text-secondary font-bold"
              >
                Role:{" "}
                <span className="ml-1">
                  {roles.find((r) => String(r.id) === currentRole)?.name ??
                    "Selected role"}
                </span>
              </Badge>
            )}
            {currentStatus && (
              <Badge
                variant="outline"
                className="border-warning-amber/30 bg-warning-amber/5 text-warning-amber font-bold"
              >
                Status:{" "}
                <span className="ml-1">
                  {currentStatus === "active" ? "Active" : "Inactive"}
                </span>
              </Badge>
            )}
            {currentVerified && (
              <Badge
                variant="outline"
                className="border-info-blue/30 bg-info-blue/5 text-info-blue font-bold"
              >
                Verified:{" "}
                <span className="ml-1">
                  {currentVerified === "true" ? "Verified" : "Unverified"}
                </span>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* TABLE */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b-2 border-border bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    User
                  </span>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Email
                  </span>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Roles
                  </span>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </span>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Verified
                  </span>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Created
                  </span>
                </th>
                <th className="px-4 md:px-6 py-3 text-right">
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-muted">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground font-medium">
                        No users found for the current filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const name =
                    user.user_profiles?.full_name?.trim() || "Unnamed user";
                  const createdAt = user.created_at
                    ? new Date(user.created_at)
                    : null;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-accent/50 transition-colors duration-150"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-black text-foreground">
                            {name}
                          </span>
                          <span className="mt-0.5 text-[10px] md:text-xs text-muted-foreground font-mono">
                            ID: {user.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs md:text-sm text-foreground font-medium">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.user_roles?.length ? (
                            user.user_roles.map((ur, idx) => (
                              <Badge
                                key={`${user.id}-role-${idx}`}
                                variant="outline"
                                className="border-primary/30 bg-primary/5 text-primary text-[10px] md:text-xs font-bold"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                {ur.role?.name ?? "Role"}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              None
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] md:text-xs font-bold gap-1",
                            user.is_active
                              ? "border-success-green/30 bg-success-green/10 text-success-green"
                              : "border-error-red/30 bg-error-red/10 text-error-red"
                          )}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] md:text-xs font-bold gap-1",
                            user.is_verified
                              ? "border-info-blue/30 bg-info-blue/10 text-info-blue"
                              : "border-warning-amber/30 bg-warning-amber/10 text-warning-amber"
                          )}
                        >
                          {user.is_verified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Unverified
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        {createdAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="text-xs md:text-sm text-foreground font-medium">
                                {createdAt.toLocaleDateString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {createdAt.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold"
                          >
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-border px-4 md:px-6 py-3 md:py-4 bg-muted/20">
          <div className="text-xs md:text-sm text-muted-foreground font-medium">
            Page <span className="font-black text-foreground">{safePage}</span>{" "}
            of <span className="font-black text-foreground">{totalPages}</span>
            {totalCount > 0 && (
              <span className="ml-2">
                ({totalCount} total user{totalCount === 1 ? "" : "s"})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={
                hasPrevious
                  ? buildUsersUrl(searchParams, {
                      page: String(safePage - 1),
                    })
                  : "#"
              }
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasPrevious}
                className="gap-1.5 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            </Link>
            <Link
              href={
                hasNext
                  ? buildUsersUrl(searchParams, {
                      page: String(safePage + 1),
                    })
                  : "#"
              }
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasNext}
                className="gap-1.5 font-bold"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </div>
  );
}