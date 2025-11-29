import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

/**
 * Build a /admin/users?query=... URL given base search params and overrides.
 */
function buildUsersUrl(
  base: UsersPageSearchParams,
  overrides: Partial<UsersPageSearchParams> = {}
): string {
  const merged: UsersPageSearchParams = {
    ...base,
    ...overrides,
  };

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

  return (
    <Card className="border-slate-200">
      <CardHeader className="space-y-4 border-b border-slate-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Users
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {totalCount} user{totalCount === 1 ? "" : "s"} found
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users/new">
              <Button size="sm">Add User</Button>
            </Link>
          </div>
        </div>

        {/* Filters / Search */}
        <form
          method="GET"
          action="/admin/users"
          className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap"
        >
          <div className="w-full sm:w-64">
            <Input
              name="search"
              defaultValue={currentSearch}
              placeholder="Search by name or email"
              className="text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              name="role"
              defaultValue={currentRole}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700"
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
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              name="verified"
              defaultValue={currentVerified}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700"
            >
              <option value="">All verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            {/* Reset page to 1 on submit */}
            <input type="hidden" name="page" value="1" />

            <Button type="submit" size="sm" className="px-4">
              Apply
            </Button>

            <Link href="/admin/users">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-slate-600"
              >
                Clear
              </Button>
            </Link>
          </div>
        </form>

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {currentSearch && (
            <Badge variant="outline" className="border-slate-300">
              Search: <span className="ml-1 font-medium">{currentSearch}</span>
            </Badge>
          )}
          {currentRole && (
            <Badge variant="outline" className="border-slate-300">
              Role:{" "}
              <span className="ml-1 font-medium">
                {roles.find((r) => String(r.id) === currentRole)?.name ??
                  "Selected role"}
              </span>
            </Badge>
          )}
          {currentStatus && (
            <Badge variant="outline" className="border-slate-300">
              Status:{" "}
              <span className="ml-1 font-medium">
                {currentStatus === "active" ? "Active" : "Inactive"}
              </span>
            </Badge>
          )}
          {currentVerified && (
            <Badge variant="outline" className="border-slate-300">
              Verified:{" "}
              <span className="ml-1 font-medium">
                {currentVerified === "true" ? "Verified" : "Unverified"}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Roles
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Verified
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    No users found for the current filters.
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
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {name}
                          </span>
                          <span className="mt-0.5 text-xs text-slate-500">
                            ID: {user.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs text-slate-700">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 align-middle text-xs text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {user.user_roles?.length ? (
                            user.user_roles.map((ur, idx) => (
                              <Badge
                                key={`${user.id}-role-${idx}`}
                                variant="outline"
                                className="border-slate-300 bg-slate-50 text-[0.7rem]"
                              >
                                {ur.role?.name ?? "Role"}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border px-2 py-0.5 text-[0.7rem]",
                            user.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          )}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border px-2 py-0.5 text-[0.7rem]",
                            user.is_verified
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          )}
                        >
                          {user.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs text-slate-600">
                        {createdAt ? (
                          <>
                            <span className="block">
                              {createdAt.toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="mt-0.5 block text-[0.65rem] text-slate-400">
                              {createdAt.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
          <div>
            Page <span className="font-semibold">{safePage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
            {totalCount > 0 && (
              <span className="ml-2 text-slate-400">
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
              >
                Previous
              </Button>
            </Link>
            <Link
              href{
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
              >
                Next
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
