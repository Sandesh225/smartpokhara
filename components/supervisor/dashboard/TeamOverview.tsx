"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { User, ArrowUpDown, Users, TrendingUp, Briefcase } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamMember {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  availability_status: string;
  current_workload: number;
  performance_rating: number;
}

interface TeamOverviewProps {
  staff: TeamMember[];
}

function WorkloadBar({ current, max = 10 }: { current: number; max?: number }) {
  const percentage = Math.min((current / max) * 100, 100);
  const color =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
      ? "bg-orange-500"
      : "bg-green-500";

  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={cn("h-full transition-all duration-500 rounded-full", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
        <Users className="w-8 h-8 text-indigo-600" />
      </div>
      <h4 className="text-base font-semibold text-gray-900 mb-2">No Team Members</h4>
      <p className="text-sm text-gray-600 max-w-sm mb-4">
        Your supervised staff will appear here once they're assigned to your team.
      </p>
      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
        Learn about team management →
      </button>
    </div>
  );
}

// Mobile card view component
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{member.full_name}</h4>
          <div className="mt-1">
            <StatusBadge
              status={member.availability_status}
              variant="staff"
              showIcon={false}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 font-medium">Workload</span>
            <span className="font-semibold text-gray-900">
              {member.current_workload} tasks
            </span>
          </div>
          <WorkloadBar current={member.current_workload} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-600 font-medium">Performance</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gray-900">
              {Number(member.performance_rating).toFixed(1)}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full mx-0.5",
                    i < Math.round(member.performance_rating)
                      ? "bg-yellow-400"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamOverview({ staff }: TeamOverviewProps) {
  const [sortBy, setSortBy] = useState<"workload" | "rating">("workload");
  const [isSorting, setIsSorting] = useState(false);

  const handleSort = (newSortBy: "workload" | "rating") => {
    if (newSortBy === sortBy) return;
    setIsSorting(true);
    setSortBy(newSortBy);
    setTimeout(() => setIsSorting(false), 300);
  };

  const sortedStaff = [...staff].sort((a, b) => {
    if (sortBy === "workload") {
      return b.current_workload - a.current_workload;
    }
    return b.performance_rating - a.performance_rating;
  });

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Team Status
          </h3>
        </div>
        <EmptyTeamState />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Team Status
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {staff.length} active {staff.length === 1 ? "member" : "members"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as "workload" | "rating")}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="workload">Sort by Workload</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">
                Workload
              </th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">
                Performance
              </th>
            </tr>
          </thead>
          <tbody
            className={cn(
              "divide-y divide-gray-50",
              isSorting && "opacity-50 transition-opacity"
            )}
          >
            {sortedStaff.map((member) => (
              <tr
                key={member.user_id}
                className="hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {member.full_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={member.availability_status}
                    variant="staff"
                    showIcon={false}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                      {member.current_workload}
                    </span>
                    <div className="flex-1 max-w-[100px]">
                      <WorkloadBar current={member.current_workload} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {Number(member.performance_rating).toFixed(1)}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 w-1 rounded-full mx-0.5",
                            i < Math.round(member.performance_rating)
                              ? "bg-yellow-400"
                              : "bg-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div
        className={cn(
          "md:hidden p-4 space-y-3",
          isSorting && "opacity-50 transition-opacity"
        )}
      >
        {sortedStaff.map((member) => (
          <TeamMemberCard key={member.user_id} member={member} />
        ))}
      </div>
    </div>
  );
}