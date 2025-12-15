"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adminStaffQueries } from "@/lib/supabase/queries/admin/staff";
import { AttendanceTracker } from "../_components/AttendanceTracker";
import { StaffPerformance } from "../_components/StaffPerformance";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Star,
  Activity,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function StaffProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (id) {
      const load = async () => {
        try {
          const [p, a, perf] = await Promise.all([
            adminStaffQueries.getStaffById(supabase, id as string),
            adminStaffQueries.getStaffAttendance(supabase, id as string),
            adminStaffQueries.getStaffPerformance(supabase, id as string),
          ]);
          setProfile(p);
          setAttendance(a || []);
          setPerformance(perf);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id]);

  if (loading) return <ProfileSkeleton />;

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-100">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Staff Member Not Found
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          The requested profile could not be located in the database.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/admin/staff">Return to Directory</Link>
        </Button>
      </div>
    );

  // Safe Calculation
  const onTimeRate = performance?.resolved_complaints
    ? Math.round(
        (performance.on_time_resolutions / performance.resolved_complaints) *
          100
      )
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors group"
          asChild
        >
          <Link href="/admin/staff">
            <ArrowLeft className="mr-2 h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />{" "}
            Back to Directory
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-400 font-mono tracking-wide">
            ID: {profile.staff_code || id?.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Identity Card */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm relative">
            {/* Gradient Banner */}
            <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            </div>

            <CardContent className="pt-0 relative px-6 pb-8">
              <div className="flex flex-col items-center text-center -mt-14 mb-6 relative z-10">
                <Avatar className="h-28 w-28 border-[5px] border-white shadow-lg bg-white">
                  <AvatarImage
                    src={profile.avatar_url}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-slate-100 text-slate-600">
                    {profile.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">
                  {profile.full_name}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 font-medium px-3 py-1"
                  >
                    {profile.staff_role.replace("_", " ")}
                  </Badge>
                  {profile.is_supervisor && (
                    <Badge
                      variant="outline"
                      className="border-amber-200 text-amber-700 bg-amber-50"
                    >
                      Supervisor
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-6 border-t border-slate-100">
                <ProfileDetailItem
                  icon={Mail}
                  label="Email"
                  value={profile.email}
                  href={`mailto:${profile.email}`}
                />
                <ProfileDetailItem
                  icon={Phone}
                  label="Phone"
                  value={profile.phone}
                  href={`tel:${profile.phone}`}
                />
                <ProfileDetailItem
                  icon={Building2}
                  label="Department / Ward"
                  value={
                    profile.department?.name ||
                    (profile.ward
                      ? `Ward ${profile.ward.ward_number}`
                      : "Unassigned")
                  }
                />
                <ProfileDetailItem
                  icon={Calendar}
                  label="Joined On"
                  value={format(new Date(profile.created_at), "MMM d, yyyy")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Performance & Stats */}
        <div className="xl:col-span-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Tasks"
              value={profile.active_tasks_count}
              icon={Activity}
              color="text-blue-600"
              bg="bg-blue-50"
              subtext="Current Load"
            />
            <StatCard
              label="Resolved"
              value={performance?.resolved_complaints || 0}
              icon={CheckCircle2}
              color="text-emerald-600"
              bg="bg-emerald-50"
              subtext="Lifetime Total"
            />
            <StatCard
              label="Avg Rating"
              value={
                performance?.avg_rating
                  ? Number(performance.avg_rating).toFixed(1)
                  : "-"
              }
              icon={Star}
              color="text-amber-500"
              bg="bg-amber-50"
              subtext="Out of 5.0"
            />
            <StatCard
              label="On-Time Rate"
              value={`${onTimeRate}%`}
              icon={Clock}
              color={onTimeRate > 80 ? "text-indigo-600" : "text-orange-600"}
              bg={onTimeRate > 80 ? "bg-indigo-50" : "bg-orange-50"}
              subtext="SLA Compliance"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              {/* Reuse your existing component, assume it handles null gracefully */}
              <StaffPerformance
                metrics={
                  performance || {
                    total_complaints: 0,
                    resolved_complaints: 0,
                    avg_assignment_hours: 0,
                    on_time_resolutions: 0,
                    avg_rating: 0,
                  }
                }
              />
            </div>

            <div className="flex flex-col gap-4">
              <AttendanceTracker logs={attendance} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function StatCard({ label, value, icon: Icon, color, bg, subtext }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            {subtext}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileDetailItem({ icon: Icon, label, value, href }: any) {
  const content = (
    <div className="flex items-center gap-4 py-3 group border-b border-slate-50 last:border-0">
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900 truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  if (href && value) {
    return (
      <a
        href={href}
        className="block hover:bg-slate-50 -mx-4 px-4 transition-colors rounded-md"
      >
        {content}
      </a>
    );
  }

  return <div className="-mx-4 px-4">{content}</div>;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4">
          <Card>
            <Skeleton className="h-28 w-full rounded-t-lg" />
            <CardContent className="flex flex-col items-center -mt-14 px-6 pb-8">
              <Skeleton className="h-28 w-28 rounded-full border-4 border-white" />
              <Skeleton className="h-8 w-48 mt-4" />
              <Skeleton className="h-5 w-32 mt-2" />
              <div className="w-full mt-8 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 py-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
