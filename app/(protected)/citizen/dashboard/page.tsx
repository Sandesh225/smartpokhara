import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { CitizenDashboardStats } from "@/components/citizen/citizen-dashboard-stats";
import { CitizenRecentComplaints } from "@/components/citizen/citizen-recent-complaints";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenDashboardPage() {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  try {
    const [complaintsResult, statsResult] = await Promise.all([
      supabase
        .from("complaints")
        .select(
          `
          id,
          tracking_code,
          title,
          status,
          priority,
          submitted_at,
          category:complaint_categories(name)
        `
        )
        .eq("citizen_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(10),
      supabase.from("complaints").select("status").eq("citizen_id", user.id),
    ]);

    const complaints = complaintsResult.data || [];
    const stats = statsResult.data || [];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Welcome, {user.profile?.full_name || user.email.split("@")[0]}.
              Track your complaints and city services.
            </p>
          </div>
          <Link href="/citizen/complaints/new">
            <Button size="lg" className="w-full sm:w-auto">
              Submit New Complaint
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <CitizenDashboardStats complaints={stats} />

        {/* Recent complaints */}
        <CitizenRecentComplaints complaints={complaints} />

        {/* Quick links */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <QuickLink
            href="/citizen/complaints"
            emoji="📝"
            title="My Complaints"
            description="View and manage your complaints"
          />
          <QuickLink
            href="/citizen/complaints/new"
            emoji="➕"
            title="New Complaint"
            description="Report a new issue in your area"
          />
          <QuickLink
            href="/citizen/track"
            emoji="🔍"
            title="Track by Code"
            description="Track a complaint using its code"
          />
          <QuickLink
            href="/citizen/ward"
            emoji="🏘️"
            title="Ward Info"
            description="View details about your ward"
          />
          <QuickLink
            href="/citizen/payments"
            emoji="💳"
            title="Payments"
            description="Bills & online payments"
          />
          <QuickLink
            href="/citizen/profile"
            emoji="👤"
            title="Profile"
            description="Update your information"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Welcome, {user.profile?.full_name || user.email.split("@")[0]}.
            </p>
          </div>
          <Link href="/citizen/complaints/new">
            <Button size="lg" className="w-full sm:w-auto">
              Submit New Complaint
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-red-900">
            Unable to load dashboard data
          </h3>
          <p className="mt-2 text-sm text-red-700">
            There was an error loading your dashboard. Please try refreshing the
            page.
          </p>
        </div>
      </div>
    );
  }
}

function QuickLink(props: {
  href: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={props.href}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-1 text-2xl">{props.emoji}</div>
      <h3 className="text-sm font-semibold text-slate-900">{props.title}</h3>
      <p className="mt-1 text-xs text-slate-600">{props.description}</p>
    </Link>
  );
}
