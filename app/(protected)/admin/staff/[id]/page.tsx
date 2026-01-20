// ═══════════════════════════════════════════════════════════
// STAFF PROFILE PAGE
// ═══════════════════════════════════════════════════════════

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
  Building2,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Star,
  Activity,
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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <User className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">
          Staff Member Not Found
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          The requested profile could not be located
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/admin/staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Link>
        </Button>
      </div>
    );
  }

  const onTimeRate = performance?.resolved_complaints
    ? Math.round(
        (performance.on_time_resolutions / performance.resolved_complaints) *
          100
      )
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 md:py-6 pb-8 md:pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/admin/staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success-green animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">
            ID: {profile.staff_code || String(id).slice(0, 8)}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* LEFT COLUMN - Profile Card */}
        <div className="lg:col-span-4">
          <Card className="stone-card overflow-hidden">
            {/* Banner */}
            <div className="h-20 md:h-28 bg-gradient-to-r from-primary to-secondary relative" />

            <CardContent className="pt-0 relative px-4 md:px-6 pb-6 md:pb-8">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center -mt-10 md:-mt-14 mb-6 relative z-10">
                <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 md:border-[5px] border-background shadow-xl">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl md:text-3xl font-bold bg-muted text-muted-foreground">
                    {profile.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-lg md:text-2xl font-black text-foreground mt-3 md:mt-4 tracking-tight">
                  {profile.full_name}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 font-medium px-2 md:px-3 py-0.5 md:py-1 text-xs"
                  >
                    {profile.staff_role.replace("_", " ")}
                  </Badge>
                  {profile.is_supervisor && (
                    <Badge
                      variant="outline"
                      className="border-warning-amber/30 text-warning-amber bg-warning-amber/10 text-xs"
                    >
                      Supervisor
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-1 pt-4 md:pt-6 border-t border-border">
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

        {/* RIGHT COLUMN - Stats & Performance */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              label="Active Tasks"
              value={profile.active_tasks_count || 0}
              icon={Activity}
              color="text-primary"
              bg="bg-primary/10"
              subtext="Current Load"
            />
            <StatCard
              label="Resolved"
              value={performance?.resolved_complaints || 0}
              icon={CheckCircle2}
              color="text-success-green"
              bg="bg-success-green/10"
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
              color="text-warning-amber"
              bg="bg-warning-amber/10"
              subtext="Out of 5.0"
            />
            <StatCard
              label="On-Time"
              value={`${onTimeRate}%`}
              icon={Clock}
              color={onTimeRate > 80 ? "text-secondary" : "text-error-red"}
              bg={onTimeRate > 80 ? "bg-secondary/10" : "bg-error-red/10"}
              subtext="SLA Rate"
            />
          </div>

          {/* PERFORMANCE & ATTENDANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            <AttendanceTracker logs={attendance} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function StatCard({ label, value, icon: Icon, color, bg, subtext }: any) {
  return (
    <Card className="stone-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-4 md:p-5 flex items-start justify-between">
        <div>
          <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <span className="text-xl md:text-2xl font-black text-foreground block mt-1">
            {value}
          </span>
          <p className="mt-1 text-[10px] md:text-[11px] text-muted-foreground font-medium">
            {subtext}
          </p>
        </div>
        <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl ${bg}`}>
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileDetailItem({ icon: Icon, label, value, href }: any) {
  const content = (
    <div className="flex items-center gap-3 md:gap-4 py-2 md:py-3 group border-b border-border last:border-0">
      <div className="flex-shrink-0">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-xs md:text-sm font-bold text-foreground truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  if (href && value) {
    return (
      <a
        href={href}
        className="block hover:bg-muted/30 -mx-2 px-2 transition-colors rounded-md"
      >
        {content}
      </a>
    );
  }

  return <div className="-mx-2 px-2">{content}</div>;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <Skeleton className="h-9 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-8 space-y-6">
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
