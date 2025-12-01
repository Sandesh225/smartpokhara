import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles } from "@/lib/auth/session";
import { CitizenDashboardStats } from "@/components/citizen/citizen-dashboard-stats";
import { CitizenRecentComplaints } from "@/components/citizen/citizen-recent-complaints";
import { Button } from "@/components/ui/button";
import {
  FileText,
  PlusCircle,
  Search,
  MapPin,
  CreditCard,
  User,
  TrendingUp,
  Bell,
  Calendar,
} from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Enhanced Header with gradient and animation */}
          <div className="animate-slide-down">
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 backdrop-blur-xl bg-white/40">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse-scale">
                      {(user.profile?.full_name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                        Welcome Back!
                      </h1>
                      <p className="text-slate-600 font-medium">
                        {user.profile?.full_name || user.email.split("@")[0]}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 max-w-2xl">
                    Track your complaints, monitor city services, and stay
                    connected with your community.
                  </p>
                </div>
                <Link href="/citizen/complaints/new" className="group">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Submit Complaint
                  </Button>
                </Link>
              </div>

              {/* Quick Actions Bar */}
              <div className="mt-6 flex flex-wrap gap-2">
                <QuickActionChip
                  icon={<Bell className="w-4 h-4" />}
                  label="3 Updates"
                />
                <QuickActionChip
                  icon={<Calendar className="w-4 h-4" />}
                  label="This Month"
                />
                <QuickActionChip
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="View Analytics"
                />
              </div>
            </div>
          </div>

          {/* Stats with staggered animation */}
          <div className="animate-slide-up">
            <CitizenDashboardStats complaints={stats} />
          </div>

          {/* Recent complaints with fade-in */}
          <div className="animate-fade-in">
            <CitizenRecentComplaints complaints={complaints} />
          </div>

          {/* Enhanced Quick Links Grid */}
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <EnhancedQuickLink
                href="/citizen/complaints"
                icon={<FileText className="w-6 h-6" />}
                title="My Complaints"
                description="View all submissions"
                gradient="from-blue-500 to-cyan-500"
              />
              <EnhancedQuickLink
                href="/citizen/complaints/new"
                icon={<PlusCircle className="w-6 h-6" />}
                title="New Complaint"
                description="Report an issue"
                gradient="from-purple-500 to-pink-500"
              />
              <EnhancedQuickLink
                href="/citizen/track"
                icon={<Search className="w-6 h-6" />}
                title="Track by Code"
                description="Search complaints"
                gradient="from-orange-500 to-red-500"
              />
              <EnhancedQuickLink
                href="/citizen/ward"
                icon={<MapPin className="w-6 h-6" />}
                title="Ward Info"
                description="Your area details"
                gradient="from-green-500 to-emerald-500"
              />
              <EnhancedQuickLink
                href="/citizen/payments"
                icon={<CreditCard className="w-6 h-6" />}
                title="Payments"
                description="Bills & services"
                gradient="from-indigo-500 to-blue-500"
              />
              <EnhancedQuickLink
                href="/citizen/profile"
                icon={<User className="w-6 h-6" />}
                title="Profile"
                description="Your information"
                gradient="from-violet-500 to-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-2 text-slate-600">
                  Welcome, {user.profile?.full_name || user.email.split("@")[0]}
                  .
                </p>
              </div>
              <Link href="/citizen/complaints/new">
                <Button size="lg" className="w-full sm:w-auto">
                  Submit New Complaint
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass-dark rounded-2xl border border-red-300 bg-red-50/50 p-6 shadow-lg animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 text-lg">
                  Unable to load dashboard data
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  There was an error loading your dashboard. Please try
                  refreshing the page or contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function QuickActionChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-sm font-medium text-slate-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
      {icon}
      {label}
    </div>
  );
}

function EnhancedQuickLink(props: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={props.href} className="group block">
      <div className="relative h-full glass rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-white/30">
        {/* Gradient background on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${props.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        ></div>

        <div className="relative z-10">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${props.gradient} text-white shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}
          >
            {props.icon}
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
            {props.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {props.description}
          </p>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    </Link>
  );
}